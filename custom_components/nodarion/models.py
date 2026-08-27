"""Data models for Engelsoft Nodarion."""

from __future__ import annotations

from dataclasses import dataclass
import re


def canonical_hostname(hostname: str | None) -> str:
    """Return a hostname suitable for identity comparisons."""
    value = (hostname or "").strip().rstrip(".").casefold()
    return value.removesuffix(".fritz.box")


def preferred_hostname(
    current: str | None, previous: str | None
) -> str | None:
    """Keep the short, stable spelling of equivalent local hostnames."""
    if (
        current
        and previous
        and canonical_hostname(current) == canonical_hostname(previous)
    ):
        return min((current, previous), key=lambda value: (len(value), value))
    return current


def is_network_infrastructure(host: "NetworkHost") -> bool:
    """Return whether a discovered host is router or mesh infrastructure."""
    if host.network_infrastructure is not None:
        return host.network_infrastructure
    hostname = (host.fritz_hostname or host.hostname or "").strip().rstrip(".").casefold()
    if hostname in {"fritz.box", "fritz!box", "fritzbox"}:
        return True
    tokens = set(filter(None, re.split(r"[^a-z0-9!]+", hostname)))
    return bool(tokens & {"router", "repeater", "powerline", "accesspoint"})


@dataclass(slots=True)
class NetworkHost:
    """A discovered network host."""

    key: str
    ip: str
    mac: str | None
    hostname: str | None
    online: bool
    fritz_hostname: str | None = None
    scanner_hostname: str | None = None
    missed_scans: int = 0
    sources: tuple[str, ...] = ("ping_tcp",)
    access_point: str | None = None
    connection_type: str | None = None
    wifi_band: str | None = None
    link_rate_mbps: float | None = None
    link_rate_rx_mbps: float | None = None
    link_rate_tx_mbps: float | None = None
    signal_strength_percent: int | None = None
    signal_strength_dbm: int | None = None
    address_source: str | None = None
    lease_time_remaining: int | None = None
    fritzbox_model: str | None = None
    fritzos_version: str | None = None
    dns_queries: int | None = None
    dns_blocked: int | None = None
    dns_blocked_ratio: float | None = None
    dns_last_activity: str | None = None
    dns_last_domain: str | None = None
    dns_last_blocked_domain: str | None = None
    dns_last_block_reason: str | None = None
    dns_last_protocol: str | None = None
    dns_top_queried_domains: list[tuple[str, int]] | None = None
    dns_top_blocked_domains: list[tuple[str, int]] | None = None
    dns_blocked_reasons: dict[str, int] | None = None
    adguard_period_hours: int | None = None
    adguard_data_complete: bool = True
    adguard_bypass_suspected: bool = False
    wan_access: str | None = None
    desired_wan_access: str | None = None
    internet_approval_required: bool = False
    guest_network: bool = False
    vpn_connection: bool = False
    network_infrastructure: bool | None = None
    infrastructure_source: str | None = None

    @property
    def display_name(self) -> str:
        """Return the best automatically discovered name."""
        return self.hostname or self.mac or self.ip
