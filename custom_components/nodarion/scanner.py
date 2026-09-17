"""Asynchronous local network scanner."""

from __future__ import annotations

import asyncio
from collections.abc import Iterable
import ipaddress
import logging
import re
import socket
import sys
from time import monotonic
from typing import Any

from homeassistant.helpers.device_registry import format_mac

from .models import NetworkHost, NetworkSegment
from .scan_batches import async_batched_map

_LOGGER = logging.getLogger(__name__)
_ARP_LINE = re.compile(
    r"^(?P<ip>\d+\.\d+\.\d+\.\d+)\s+\S+\s+\S+\s+"
    r"(?P<mac>[0-9a-fA-F:]{17})\s+\S+\s+\S+$"
)


class NetworkScanner:
    """Discover hosts using ICMP/TCP probes and the OS neighbor table."""

    def __init__(
        self,
        network: str,
        timeout: float,
        concurrency: int,
        ports: Iterable[int],
        excluded: set[str],
        segment: NetworkSegment | None = None,
        *,
        shared_semaphore: asyncio.Semaphore | None = None,
        batch_size: int | None = None,
        discovery_batch_size: int = 32,
        discovery_interval: float = 60.0,
    ) -> None:
        """Initialize scanner."""
        self.network = ipaddress.ip_network(network, strict=False)
        self.timeout = timeout
        self.semaphore = shared_semaphore or asyncio.Semaphore(concurrency)
        self.batch_size = max(1, batch_size or concurrency)
        self.ports = tuple(ports)
        self.excluded = excluded
        self.segment = segment
        self._scan_number = 0
        self._known_ips: set[str] = set()
        self._priority_ips: set[str] = set()
        self._discovery_cursor = 0
        self._discovery_batch_size = max(1, discovery_batch_size)
        self._discovery_interval = max(1.0, discovery_interval)
        self._next_discovery = 0.0
        self._force_full_discovery = False
        self._probe_profiles: dict[str, str | int] = {}
        self._probe_failures: dict[str, int] = {}
        self._dns_cache: dict[str, tuple[str | None, float]] = {}
        self._dns_semaphore = asyncio.Semaphore(8)
        self.scan_stats: dict[str, Any] = {}

    def set_tracked_ips(
        self, known_ips: Iterable[str], priority_ips: Iterable[str]
    ) -> None:
        """Keep persisted and important addresses in every fast scan."""
        self._known_ips = {
            ip for ip in known_ips if self._contains_address(ip)
        }
        self._priority_ips = {
            ip for ip in priority_ips if self._contains_address(ip)
        }

    def request_full_discovery(self) -> None:
        """Make the next explicit scan cover every currently unknown address."""
        self._force_full_discovery = True
        self._next_discovery = 0.0

    def _contains_address(self, ip: str) -> bool:
        try:
            return ipaddress.ip_address(ip) in self.network and ip not in self.excluded
        except ValueError:
            return False

    async def async_scan(self) -> dict[str, NetworkHost]:
        """Scan the configured network."""
        all_addresses = [
            str(address)
            for address in self.network.hosts()
            if str(address) not in self.excluded
        ]
        self._scan_number += 1
        arp = await self._read_neighbors()
        neighbor_candidates = {
            ip for ip in arp if self._contains_address(ip)
        }
        now = monotonic()
        discovery_due = now >= self._next_discovery
        discovery: list[str] = []
        if discovery_due:
            unknown = [
                ip for ip in all_addresses
                if ip not in self._known_ips and ip not in neighbor_candidates
            ]
            if unknown:
                start = self._discovery_cursor % len(unknown)
                count = (
                    len(unknown) if self._force_full_discovery
                    else min(self._discovery_batch_size, len(unknown))
                )
                discovery = [unknown[(start + offset) % len(unknown)] for offset in range(count)]
                self._discovery_cursor = (start + count) % len(unknown)
            self._next_discovery = now + self._discovery_interval
            self._force_full_discovery = False

        # Important offline devices come first. Neighbor candidates are cheap
        # hints, then all known devices, followed by one rolling discovery slice.
        addresses = list(dict.fromkeys([
            *sorted(self._priority_ips, key=ipaddress.ip_address),
            *sorted(neighbor_candidates, key=ipaddress.ip_address),
            *sorted(self._known_ips, key=ipaddress.ip_address),
            *discovery,
        ]))
        thorough = self._known_ips | self._priority_ips
        results = await async_batched_map(
            addresses,
            lambda ip: self._probe(ip, thorough=ip in thorough),
            self.batch_size,
        )
        detected = [
            ip for ip, source in zip(addresses, results, strict=True)
            if source is not None
        ]
        hostnames = await async_batched_map(
            detected, self._reverse_dns, min(8, self.batch_size)
        )
        hostname_by_ip = dict(zip(detected, hostnames, strict=True))
        hosts: dict[str, NetworkHost] = {}
        for ip, detection_source in zip(addresses, results, strict=True):
            mac = arp.get(ip)
            # Neighbor/ARP caches can contain stale entries long after a host
            # disappeared. Only an active ICMP or TCP response may discover a
            # new host; ARP data merely enriches a confirmed result.
            if detection_source is None:
                continue
            hostname = hostname_by_ip.get(ip)
            # The IP address represents a permanent monitored network slot.
            # A different MAC/hostname on that address updates the same entity.
            key = f"ip_{ip}"
            hosts[key] = NetworkHost(
                key=key,
                ip=ip,
                mac=mac,
                hostname=hostname,
                online=True,
                scanner_hostname=hostname,
                sources=(detection_source,),
                segment_id=self.segment.id if self.segment else None,
                segment_name=self.segment.name if self.segment else None,
                vlan_id=self.segment.vlan_id if self.segment else None,
                segment_network=self.segment.network if self.segment else str(self.network),
                segment_role=self.segment.role if self.segment else None,
                segment_color=self.segment.color if self.segment else None,
                segment_monitoring=self.segment.monitoring if self.segment else True,
            )
        detected_ips = {host.ip for host in hosts.values()}
        self._known_ips.update(detected_ips)
        self.scan_stats = {
            "checked": len(addresses),
            "priority": len(self._priority_ips),
            "neighbors": len(neighbor_candidates),
            "discovery": len(discovery),
            "detected": len(detected_ips),
        }
        return hosts

    async def _probe(self, ip: str, *, thorough: bool = True) -> str | None:
        """Probe an address, learning its cheapest successful method."""
        async with self.semaphore:
            preferred = self._probe_profiles.get(ip)
            if preferred == "ping" and await self._ping(ip):
                self._probe_failures.pop(ip, None)
                return "ping"
            if isinstance(preferred, int) and await self._tcp(ip, preferred):
                self._probe_failures.pop(ip, None)
                return "tcp"
            if preferred != "ping" and await self._ping(ip):
                self._probe_profiles[ip] = "ping"
                self._probe_failures.pop(ip, None)
                return "ping"
            quick_ports = tuple(
                port for port in (80, 443) if port in self.ports
            ) or self.ports[:2]
            ports = self.ports if thorough else quick_ports
            for port in ports:
                if port == preferred:
                    continue
                if await self._tcp(ip, port):
                    self._probe_profiles[ip] = port
                    self._probe_failures.pop(ip, None)
                    return "tcp"
            failures = self._probe_failures.get(ip, 0) + 1
            self._probe_failures[ip] = failures
            if failures >= 3:
                self._probe_profiles.pop(ip, None)
        return None

    async def _tcp(self, ip: str, port: int) -> bool:
        """Test one TCP port without treating refusal as presence."""
        try:
            _reader, writer = await asyncio.wait_for(
                asyncio.open_connection(ip, port), self.timeout
            )
            writer.close()
            await writer.wait_closed()
            return True
        except (ConnectionRefusedError, TimeoutError, OSError):
            return False

    async def _ping(self, ip: str) -> bool:
        """Run the platform ping command without blocking Home Assistant."""
        if sys.platform == "win32":
            args = ("ping", "-n", "1", "-w", str(int(self.timeout * 1000)), ip)
        else:
            args = ("ping", "-c", "1", "-W", str(max(1, int(self.timeout))), ip)
        try:
            process = await asyncio.create_subprocess_exec(
                *args,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
            return await asyncio.wait_for(
                process.wait(), self.timeout + 1
            ) == 0
        except (FileNotFoundError, TimeoutError):
            return False

    async def _read_neighbors(self) -> dict[str, str]:
        """Read IPv4 neighbors from Linux procfs or the arp command."""
        if sys.platform.startswith("linux"):
            try:
                content = await asyncio.to_thread(
                    self._read_text, "/proc/net/arp"
                )
                return self._parse_neighbors(content)
            except OSError:
                pass
        try:
            process = await asyncio.create_subprocess_exec(
                "arp",
                "-a",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.DEVNULL,
            )
            stdout, _ = await process.communicate()
            return self._parse_neighbors(stdout.decode(errors="replace"))
        except FileNotFoundError:
            return {}

    @staticmethod
    def _read_text(path: str) -> str:
        with open(path, encoding="utf-8") as file:
            return file.read()

    @staticmethod
    def _parse_neighbors(content: str) -> dict[str, str]:
        result: dict[str, str] = {}
        for line in content.splitlines():
            match = _ARP_LINE.match(line.strip())
            if match and match["mac"] != "00:00:00:00:00:00":
                result[match["ip"]] = format_mac(match["mac"])
                continue
            generic = re.search(
                r"(?P<ip>\d+\.\d+\.\d+\.\d+).*?"
                r"(?P<mac>[0-9a-fA-F]{2}(?:[:-][0-9a-fA-F]{2}){5})",
                line,
            )
            if generic:
                result[generic["ip"]] = format_mac(generic["mac"])
        return result

    async def _reverse_dns(self, ip: str) -> str | None:
        cached = self._dns_cache.get(ip)
        now = monotonic()
        if cached is not None and cached[1] > now:
            return cached[0]
        async with self._dns_semaphore:
            try:
                hostname, _aliases, _addresses = await asyncio.wait_for(
                    asyncio.to_thread(socket.gethostbyaddr, ip), self.timeout
                )
                value = hostname.rstrip(".")
            except (TimeoutError, OSError):
                value = None
        # Successful names are stable; negative answers are retried sooner.
        self._dns_cache[ip] = (value, now + (86400 if value else 1800))
        return value
