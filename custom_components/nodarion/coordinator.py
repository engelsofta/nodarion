"""Update coordinator for Engelsoft Nodarion."""

from __future__ import annotations

import asyncio
from dataclasses import replace
from datetime import datetime, timedelta, timezone
import ipaddress
import logging
from time import perf_counter
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    CONF_ADGUARD_ENABLED,
    CONF_ADGUARD_HOST,
    CONF_ADGUARD_PASSWORD,
    CONF_ADGUARD_PERIOD_HOURS,
    CONF_ADGUARD_PORT,
    CONF_ADGUARD_SSL,
    CONF_ADGUARD_USER,
    CONF_ADGUARD_VERIFY_SSL,
    CONF_CONCURRENCY,
    CONF_EXCLUDE,
    CONF_FRITZ_ENABLED,
    CONF_FRITZ_HOST,
    CONF_FRITZ_PASSWORD,
    CONF_FRITZ_USER,
    CONF_NETWORK,
    CONF_OFFLINE_AFTER,
    CONF_REMOVE_AFTER_DAYS,
    CONF_PORTS,
    CONF_SCAN_INTERVAL,
    CONF_TIMEOUT,
    DEFAULT_CONCURRENCY,
    DEFAULT_ADGUARD_PERIOD_HOURS,
    DEFAULT_ADGUARD_PORT,
    DEFAULT_FRITZ_HOST,
    DEFAULT_OFFLINE_AFTER,
    DEFAULT_REMOVE_AFTER_DAYS,
    DEFAULT_PORTS,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_TIMEOUT,
    DOMAIN,
    FRITZ_HOSTNAME_GRACE_SECONDS,
    FRITZ_SCAN_INTERVAL_SECONDS,
    ADGUARD_SCAN_INTERVAL_SECONDS,
)
from .adguard import AdGuardScanner
from .models import NetworkHost, preferred_hostname
from .monitor import NetworkMonitor
from .fritz import FritzBoxScanner
from .scanner import NetworkScanner

_LOGGER = logging.getLogger(__name__)


def _is_ip_hostname(value: str | None) -> bool:
    """Return whether a discovered hostname is only an IP address."""
    try:
        ipaddress.ip_address(str(value or "").strip().rstrip("."))
    except ValueError:
        return False
    return True


class NetworkCoordinator(DataUpdateCoordinator[dict[str, NetworkHost]]):
    """Coordinate network scans and retain temporarily offline hosts."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        monitor: NetworkMonitor,
    ) -> None:
        """Initialize coordinator."""
        options = {**entry.data, **entry.options}
        self.monitor = monitor
        self.offline_after = int(options.get(CONF_OFFLINE_AFTER, DEFAULT_OFFLINE_AFTER))
        self.remove_after_days = int(
            options.get(CONF_REMOVE_AFTER_DAYS, DEFAULT_REMOVE_AFTER_DAYS)
        )
        self.scan_interval = int(
            options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        )
        # A TCP connection can occasionally be accepted by a router, firewall,
        # or transparent proxy on behalf of an unused address. Require that a
        # TCP-only discovery repeats in two consecutive scans before changing
        # a new or offline host to online. ICMP replies remain immediate.
        self._pending_tcp_detections: dict[str, int] = {}
        ports = [
            int(port.strip())
            for port in str(options.get(CONF_PORTS, DEFAULT_PORTS)).split(",")
            if port.strip()
        ]
        excluded = {
            item.strip()
            for item in str(options.get(CONF_EXCLUDE, "")).split(",")
            if item.strip()
        }
        self.scanner = NetworkScanner(
            options[CONF_NETWORK],
            float(options.get(CONF_TIMEOUT, DEFAULT_TIMEOUT)),
            int(options.get(CONF_CONCURRENCY, DEFAULT_CONCURRENCY)),
            ports,
            excluded,
        )
        self.fritz_scanner = (
            FritzBoxScanner(
                hass,
                str(options.get(CONF_FRITZ_HOST, DEFAULT_FRITZ_HOST)),
                str(options.get(CONF_FRITZ_USER, "")),
                str(options.get(CONF_FRITZ_PASSWORD, "")),
                options[CONF_NETWORK],
                excluded,
            )
            if options.get(CONF_FRITZ_ENABLED)
            else None
        )
        self.adguard_scanner = (
            AdGuardScanner(
                hass,
                str(options.get(CONF_ADGUARD_HOST, "")),
                int(options.get(CONF_ADGUARD_PORT, DEFAULT_ADGUARD_PORT)),
                str(options.get(CONF_ADGUARD_USER, "")),
                str(options.get(CONF_ADGUARD_PASSWORD, "")),
                bool(options.get(CONF_ADGUARD_SSL, False)),
                bool(options.get(CONF_ADGUARD_VERIFY_SSL, True)),
                int(
                    options.get(
                        CONF_ADGUARD_PERIOD_HOURS,
                        DEFAULT_ADGUARD_PERIOD_HOURS,
                    )
                ),
            )
            if options.get(CONF_ADGUARD_ENABLED)
            else None
        )
        self.connection_status: dict[str, dict[str, Any]] = {
            "scanner": {
                "label": "Ping/TCP-Scanner",
                "configured": True,
                "available": False,
                "duration_ms": None,
                "last_checked": None,
                "interval_seconds": self.scan_interval,
            },
            "fritzbox": {
                "label": "FRITZ!Box",
                "configured": self.fritz_scanner is not None,
                "available": False,
                "duration_ms": None,
                "last_checked": None,
                "interval_seconds": FRITZ_SCAN_INTERVAL_SECONDS,
            },
            "adguard": {
                "label": "AdGuard",
                "configured": self.adguard_scanner is not None,
                "available": False,
                "duration_ms": None,
                "last_checked": None,
                "interval_seconds": ADGUARD_SCAN_INTERVAL_SECONDS,
            },
        }
        self._fritz_hosts_cache: dict[str, NetworkHost] = {}
        self._adguard_cache: dict[str, Any] = {}
        self._next_fritz_scan = 0.0
        self._fritz_unavailable_since: float | None = None
        self._next_adguard_scan = 0.0
        self._wan_access_by_ip: dict[str, str] = {}
        self._wan_retry_after: dict[str, float] = {}
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(
                seconds=self.scan_interval
            ),
        )

    async def _async_update_data(self) -> dict[str, NetworkHost]:
        """Fetch scan data and apply the offline threshold."""
        now_monotonic = perf_counter()
        restoring = self.data is None
        previous = self.monitor.restored_hosts() if restoring else self.data
        adguard_due = (
            self.adguard_scanner is not None
            and now_monotonic >= self._next_adguard_scan
        )
        adguard_task = (
            asyncio.create_task(
                self._async_timed_scan("adguard", self.adguard_scanner)
            )
            if adguard_due
            else None
        )
        try:
            started = perf_counter()
            found = await self.scanner.async_scan()
            self._record_connection(
                "scanner", True, (perf_counter() - started) * 1000
            )
        except Exception as err:
            self._record_connection(
                "scanner", False, (perf_counter() - started) * 1000
            )
            if adguard_task is not None:
                adguard_task.cancel()
            raise UpdateFailed(f"Network scan failed: {err}") from err

        if (
            self.fritz_scanner is not None
            and now_monotonic >= self._next_fritz_scan
        ):
            started = perf_counter()
            scanned_fritz_hosts = await self.fritz_scanner.async_scan()
            self._record_connection(
                "fritzbox",
                self.fritz_scanner.available,
                (perf_counter() - started) * 1000,
            )
            self._next_fritz_scan = (
                perf_counter() + FRITZ_SCAN_INTERVAL_SECONDS
            )
            if self.fritz_scanner.available:
                self._fritz_unavailable_since = None
                self._fritz_hosts_cache = scanned_fritz_hosts
                if (
                    self.monitor.rules.get("onboarding_auto_range")
                    and self.fritz_scanner.dhcp_start
                    and self.fritz_scanner.dhcp_end
                    and (
                        self.monitor.rules.get("onboarding_start")
                        != self.fritz_scanner.dhcp_start
                        or self.monitor.rules.get("onboarding_end")
                        != self.fritz_scanner.dhcp_end
                    )
                ):
                    await self.monitor.async_set_rules({
                        "onboarding_start": self.fritz_scanner.dhcp_start,
                        "onboarding_end": self.fritz_scanner.dhcp_end,
                    })
            elif self._fritz_unavailable_since is None:
                self._fritz_unavailable_since = perf_counter()
        if (
            self.fritz_scanner is not None
            and self.fritz_scanner.available
        ):
            fritz_hosts = self._fritz_hosts_cache
            for key, fritz_host in fritz_hosts.items():
                probed = found.get(key)
                old = previous.get(key)
                if probed is None:
                    # Some clients, especially phones in power-saving mode,
                    # deliberately ignore ICMP and expose no TCP service. An
                    # active FRITZ!Box host entry is therefore authoritative.
                    found[key] = (
                        replace(fritz_host, access_point=old.access_point)
                        if (
                            old is not None
                            and old.access_point
                            and not fritz_host.access_point
                        )
                        else fritz_host
                    )
                    continue
                found[key] = NetworkHost(
                    key=key,
                    ip=probed.ip,
                    mac=fritz_host.mac or probed.mac,
                    hostname=fritz_host.hostname or probed.hostname,
                    online=True,
                    sources=(*probed.sources, "fritzbox"),
                    # A FRITZ!Box can occasionally return its host list before
                    # the mesh-topology document is ready. Keep the last valid
                    # assignment instead of blanking the whole mesh column.
                    access_point=(
                        fritz_host.access_point
                        or (old.access_point if old else None)
                    ),
                    connection_type=fritz_host.connection_type,
                    wifi_band=fritz_host.wifi_band,
                    link_rate_mbps=fritz_host.link_rate_mbps,
                    link_rate_rx_mbps=fritz_host.link_rate_rx_mbps,
                    link_rate_tx_mbps=fritz_host.link_rate_tx_mbps,
                    signal_strength_percent=fritz_host.signal_strength_percent,
                    signal_strength_dbm=fritz_host.signal_strength_dbm,
                    address_source=fritz_host.address_source,
                    lease_time_remaining=fritz_host.lease_time_remaining,
                    fritzbox_model=fritz_host.fritzbox_model,
                    fritzos_version=fritz_host.fritzos_version,
                )

        if (
            self.fritz_scanner is not None
            and not self.monitor.internet_guard_initialized
        ):
            await self.monitor.async_initialize_internet_guard(set(found))
        if self.fritz_scanner is not None:
            await self._async_apply_internet_guard(found)

        for key, host in tuple(found.items()):
            old = previous.get(key)
            if old is None:
                continue
            fritz_name_grace_active = (
                self.fritz_scanner is not None
                and self._fritz_unavailable_since is not None
                and perf_counter() - self._fritz_unavailable_since
                < FRITZ_HOSTNAME_GRACE_SECONDS
            )
            scanner_fell_back_to_ip = (
                (not host.hostname or _is_ip_hostname(host.hostname))
                and old.hostname
                and not _is_ip_hostname(old.hostname)
            )
            stable_hostname = (
                old.hostname
                if fritz_name_grace_active and scanner_fell_back_to_ip
                else preferred_hostname(host.hostname, old.hostname)
            )
            if stable_hostname != host.hostname:
                found[key] = replace(host, hostname=stable_hostname)

        tcp_candidates: set[str] = set()
        for key, host in tuple(found.items()):
            old = previous.get(key)
            if "ping" in host.sources or (old is not None and old.online):
                self._pending_tcp_detections.pop(key, None)
                continue
            if "tcp" not in host.sources:
                continue
            tcp_candidates.add(key)
            confirmations = self._pending_tcp_detections.get(key, 0) + 1
            self._pending_tcp_detections[key] = confirmations
            if confirmations < 2:
                # Let the normal retention logic below keep an existing host
                # offline. A brand-new one stays hidden until it is confirmed.
                del found[key]
            else:
                self._pending_tcp_detections.pop(key, None)
        for key in set(self._pending_tcp_detections) - tcp_candidates:
            self._pending_tcp_detections.pop(key, None)

        forgotten: set[str] = set()
        for key, old in previous.items():
            if key in found:
                continue
            try:
                in_network = (
                    ipaddress.ip_address(old.ip) in self.scanner.network
                )
            except ValueError:
                in_network = False
            if not in_network or old.ip in self.scanner.excluded:
                continue
            missed = (
                max(self.offline_after, old.missed_scans + 1)
                if restoring and key not in self.monitor.presence_devices
                else old.missed_scans + 1
            )
            offline_threshold = self.offline_after
            if key in self.monitor.presence_devices:
                timeout_seconds = (
                    int(self.monitor.rules["presence_timeout_minutes"]) * 60
                )
                offline_threshold = max(
                    1,
                    (timeout_seconds + self.scan_interval - 1)
                    // self.scan_interval,
                )
            offline_since = self.monitor.offline_since.get(key)
            offline_age = None
            if offline_since:
                try:
                    started = datetime.fromisoformat(offline_since)
                    if started.tzinfo is None:
                        started = started.replace(tzinfo=timezone.utc)
                    offline_age = datetime.now(timezone.utc) - started
                except ValueError:
                    pass
            estimated_age = timedelta(seconds=missed * self.scan_interval)
            if (
                self.remove_after_days > 0
                and key not in self.monitor.monitored
                and key not in self.monitor.presence_devices
                and max(offline_age or timedelta(0), estimated_age)
                >= timedelta(days=self.remove_after_days)
            ):
                forgotten.add(key)
                continue
            # The grace period may retain a device that was genuinely online,
            # but it must never resurrect a persisted offline presence device
            # after a Home Assistant restart. Only a real scanner/FRITZ!Box
            # detection is allowed to change an offline device back to online.
            if old.online and missed < offline_threshold:
                found[key] = replace(
                    old,
                    online=True,
                    missed_scans=missed,
                )
            else:
                found[key] = replace(
                    old,
                    online=False,
                    missed_scans=missed,
                )

        if forgotten:
            await self.monitor.async_forget_hosts(forgotten)

        if adguard_task is not None:
            scanned_dns = await adguard_task
            self._next_adguard_scan = (
                perf_counter() + ADGUARD_SCAN_INTERVAL_SECONDS
            )
            if self.adguard_scanner is not None and self.adguard_scanner.available:
                self._adguard_cache = scanned_dns
        if self.adguard_scanner is not None:
            dns_by_ip = self._adguard_cache
            if self.adguard_scanner is not None and self.adguard_scanner.available:
                period = self.adguard_scanner.period_hours
                for key, host in tuple(found.items()):
                    stats = dns_by_ip.get(host.ip)
                    values = stats.as_dict() if stats is not None else {}
                    queries = int(values.get("queries", 0))
                    found[key] = replace(
                        host,
                        dns_queries=queries,
                        dns_blocked=int(values.get("blocked", 0)),
                        dns_blocked_ratio=float(
                            values.get("blocked_ratio", 0.0)
                        ),
                        dns_last_activity=values.get("last_activity"),
                        dns_last_domain=values.get("last_domain"),
                        dns_last_blocked_domain=values.get(
                            "last_blocked_domain"
                        ),
                        dns_last_block_reason=values.get(
                            "last_block_reason"
                        ),
                        dns_last_protocol=values.get("last_protocol"),
                        dns_top_queried_domains=values.get(
                            "top_queried_domains", []
                        ),
                        dns_top_blocked_domains=values.get(
                            "top_blocked_domains", []
                        ),
                        dns_blocked_reasons=values.get(
                            "blocked_reasons", {}
                        ),
                        adguard_period_hours=period,
                        adguard_data_complete=(
                            self.adguard_scanner.data_complete
                        ),
                        adguard_bypass_suspected=(
                            host.online
                            and queries == 0
                            and self.adguard_scanner.data_complete
                        ),
                    )
        await self.monitor.async_process(previous, found)
        self.monitor.async_maybe_schedule_ai_analysis(self, found)
        return found

    async def _async_timed_scan(self, key: str, scanner: Any) -> Any:
        """Run an optional data source and retain its health and duration."""
        started = perf_counter()
        result = await scanner.async_scan()
        self._record_connection(
            key, bool(scanner.available), (perf_counter() - started) * 1000
        )
        return result

    def _record_connection(
        self, key: str, available: bool, duration_ms: float
    ) -> None:
        """Record the most recent data-source check for the frontend."""
        # Replace both mapping levels instead of mutating a nested dictionary.
        # Home Assistant compares state attributes with their previous value;
        # shared mutable objects would make old and new states look identical.
        self.connection_status = {
            **self.connection_status,
            key: {
                **self.connection_status[key],
                "available": available,
                "duration_ms": round(duration_ms),
                "last_checked": datetime.now(timezone.utc).isoformat(),
            },
        }

    async def async_cleanup_inactive(self) -> int:
        """Immediately remove every currently offline host."""
        if not self.data:
            return 0
        offline = {
            key for key, host in self.data.items() if not host.online
        }
        if not offline:
            return 0
        await self.monitor.async_forget_hosts(offline, force=True)
        self.async_set_updated_data(
            {
                key: host
                for key, host in self.data.items()
                if key not in offline
            }
        )
        return len(offline)

    async def _async_apply_internet_guard(
        self, hosts: dict[str, NetworkHost]
    ) -> None:
        """Block newly discovered FRITZ!Box clients until manual approval."""
        if not self.monitor.internet_guard_initialized:
            return
        if self.monitor.is_learning:
            trustable_keys = set(hosts)
            release_failures: set[str] = set()
            for key, host in tuple(hosts.items()):
                state = self._wan_access_by_ip.get(host.ip)
                approval_required = False
                if state == "denied" and "fritzbox" in host.sources:
                    try:
                        state = await self.fritz_scanner.async_set_wan_access(
                            host.ip, True
                        )
                        self._wan_access_by_ip[host.ip] = state
                        self._wan_retry_after.pop(host.ip, None)
                    except Exception as err:
                        # Preserve the denied state so the next scan retries
                        # the automatic release instead of trusting a device
                        # that may still be blocked.
                        approval_required = True
                        trustable_keys.discard(key)
                        release_failures.add(key)
                        _LOGGER.warning(
                            "Could not restore internet access during learning "
                            "for %s: %s",
                            host.ip,
                            err,
                        )
                elif state == "error":
                    # A failed blocking attempt must not remain visible while
                    # learning. No successful denial was reported in this case.
                    state = None
                    self._wan_access_by_ip.pop(host.ip, None)
                    self._wan_retry_after.pop(host.ip, None)
                hosts[key] = replace(
                    host,
                    wan_access=state,
                    internet_approval_required=approval_required,
                )
            await self.monitor.async_trust_hosts(trustable_keys)
            for key in release_failures:
                await self.monitor.async_untrust_host(key)
            return
        now = perf_counter()
        for key, host in tuple(hosts.items()):
            state = self._wan_access_by_ip.get(host.ip)
            inventory = self.monitor.host_inventory.get(key, {})
            previous_mac = inventory.get("mac")
            if (
                key in self.monitor.known_hosts
                and previous_mac
                and host.mac
                and previous_mac != host.mac
            ):
                await self.monitor.async_untrust_host(key)
            if key in self.monitor.known_hosts:
                hosts[key] = replace(
                    host,
                    wan_access=state,
                    internet_approval_required=False,
                )
                continue
            if (
                "fritzbox" not in host.sources
                or self._is_protected_infrastructure(host)
            ):
                continue
            if state != "denied" and now >= self._wan_retry_after.get(host.ip, 0):
                try:
                    state = await self.fritz_scanner.async_set_wan_access(
                        host.ip, False
                    )
                    self._wan_access_by_ip[host.ip] = state
                    self._wan_retry_after.pop(host.ip, None)
                except Exception as err:
                    state = "error"
                    self._wan_access_by_ip[host.ip] = state
                    self._wan_retry_after[host.ip] = now + 300
                    _LOGGER.warning(
                        "Could not block internet access for %s: %s",
                        host.ip,
                        err,
                    )
            hosts[key] = replace(
                host,
                wan_access=state,
                internet_approval_required=True,
            )

    async def async_approve_internet_access(self, key: str) -> str:
        """Unblock and trust one device after explicit user confirmation."""
        if self.fritz_scanner is None or not self.data or key not in self.data:
            raise ValueError("Device or FRITZ!Box integration unavailable")
        host = self.data[key]
        state = await self.fritz_scanner.async_set_wan_access(host.ip, True)
        self._wan_access_by_ip[host.ip] = state
        self._wan_retry_after.pop(host.ip, None)
        await self.monitor.async_trust_host(key)
        self.async_set_updated_data(
            {
                **self.data,
                key: replace(
                    host,
                    wan_access=state,
                    internet_approval_required=False,
                ),
            }
        )
        return state

    @staticmethod
    def _is_protected_infrastructure(host: NetworkHost) -> bool:
        """Avoid attempting to block routers and mesh infrastructure."""
        name = (host.hostname or "").lower()
        return any(
            marker in name
            for marker in (
                "fritz!box",
                "fritzbox",
                "fritz!repeater",
                "fritzrepeater",
                "repeater",
                "powerline",
                "access point",
                "access-point",
            )
        )
