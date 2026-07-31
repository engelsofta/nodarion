"""Asynchronous local network scanner."""

from __future__ import annotations

import asyncio
from collections.abc import Iterable
import ipaddress
import logging
import re
import socket
import sys

from homeassistant.helpers.device_registry import format_mac

from .models import NetworkHost

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
    ) -> None:
        """Initialize scanner."""
        self.network = ipaddress.ip_network(network, strict=False)
        self.timeout = timeout
        self.semaphore = asyncio.Semaphore(concurrency)
        self.ports = tuple(ports)
        self.excluded = excluded

    async def async_scan(self) -> dict[str, NetworkHost]:
        """Scan the configured network."""
        addresses = [
            str(address)
            for address in self.network.hosts()
            if str(address) not in self.excluded
        ]
        results = await asyncio.gather(*(self._probe(ip) for ip in addresses))
        arp = await self._read_neighbors()
        hosts: dict[str, NetworkHost] = {}
        for ip, detection_source in zip(addresses, results, strict=True):
            mac = arp.get(ip)
            # Neighbor/ARP caches can contain stale entries long after a host
            # disappeared. Only an active ICMP or TCP response may discover a
            # new host; ARP data merely enriches a confirmed result.
            if detection_source is None:
                continue
            hostname = await self._reverse_dns(ip)
            # The IP address represents a permanent monitored network slot.
            # A different MAC/hostname on that address updates the same entity.
            key = f"ip_{ip}"
            hosts[key] = NetworkHost(
                key=key,
                ip=ip,
                mac=mac,
                hostname=hostname,
                online=True,
                sources=(detection_source,),
            )
        return hosts

    async def _probe(self, ip: str) -> str | None:
        """Probe one address, preferring ping and falling back to TCP."""
        async with self.semaphore:
            if await self._ping(ip):
                return "ping"
            for port in self.ports:
                try:
                    _reader, writer = await asyncio.wait_for(
                        asyncio.open_connection(ip, port), self.timeout
                    )
                    writer.close()
                    await writer.wait_closed()
                    return "tcp"
                except ConnectionRefusedError:
                    # Do not treat a refusal as proof that the target host is
                    # present. Routers, firewalls and container networking can
                    # reject connections on behalf of an unused address.
                    continue
                except (TimeoutError, OSError):
                    continue
        return None

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
        try:
            hostname, _aliases, _addresses = await asyncio.wait_for(
                asyncio.to_thread(socket.gethostbyaddr, ip), self.timeout
            )
            return hostname.rstrip(".")
        except (TimeoutError, OSError):
            return None
