"""Bounded, anonymous HTTP checks for known devices in configured networks."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
import ipaddress
import re
import ssl
from time import monotonic


ENDPOINTS = (("https", 443), ("http", 80), ("https", 8443), ("http", 8080))
POSITIVE_TTL = 300
NEGATIVE_TTL = 120
MAX_DEVICES_PER_SCAN = 8
REQUEST_TIMEOUT = 10


@dataclass
class WebResult:
    identity: str
    checked: float
    urls: tuple[str, ...]


class DeviceWebDiscovery:
    """Check real HTTP responses, with no redirects, credentials or body reads."""

    def __init__(self) -> None:
        self._cache: dict[str, WebResult] = {}
        # Local devices often use self-signed certificates. This context is
        # restricted to anonymous discovery; the user's browser validates TLS.
        self._tls = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        self._tls.check_hostname = False
        self._tls.verify_mode = ssl.CERT_NONE

    @staticmethod
    def eligible(host, networks) -> bool:
        try:
            ip = ipaddress.ip_address(host.ip)
        except ValueError:
            return False
        return bool(host.online and host.segment_monitoring and ip.version == 4
            and not (ip.is_loopback or ip.is_multicast or ip.is_unspecified or ip.is_link_local)
            and any(ip in network for network in networks))

    @staticmethod
    def identity(host) -> str:
        return re.sub(r"[^0-9a-f]", "", str(host.mac or "").lower())

    def clear_cache(self) -> None:
        """Force fresh HTTP checks after an explicit scan request."""
        self._cache.clear()

    def urls_for(self, host, now: float | None = None) -> tuple[str, ...]:
        result = self._cache.get(host.ip)
        current = monotonic() if now is None else now
        if (not host.online or result is None or result.identity != self.identity(host)
                or current - result.checked >= POSITIVE_TTL):
            return ()
        return result.urls

    async def async_update(self, hosts, networks) -> None:
        candidates = {host.ip: host for host in hosts if self.eligible(host, networks)}
        self._cache = {ip: result for ip, result in self._cache.items()
            if ip in candidates and result.identity == self.identity(candidates[ip])}
        now = monotonic()
        due = [host for ip, host in candidates.items() if ip not in self._cache
            or now - self._cache[ip].checked >= (
                POSITIVE_TTL if self._cache[ip].urls else NEGATIVE_TTL)]
        due.sort(key=lambda host: (
            self._cache[host.ip].checked if host.ip in self._cache else -1,
            int(ipaddress.ip_address(host.ip)),
        ))
        due = due[:MAX_DEVICES_PER_SCAN]
        semaphore = asyncio.Semaphore(8)

        async def endpoint(ip, scheme, port):
            async with semaphore:
                return await self.async_probe(ip, scheme, port)

        async def device(host):
            responses = await asyncio.gather(*(endpoint(host.ip, scheme, port)
                for scheme, port in ENDPOINTS))
            urls = tuple(url for url in responses if url is not None)
            self._cache[host.ip] = WebResult(self.identity(host), monotonic(), urls)

        await asyncio.gather(*(device(host) for host in due))

    async def async_probe(self, ip: str, scheme: str, port: int) -> str | None:
        """Accept an HTTP response including authentication/error responses."""
        try:
            return await asyncio.wait_for(self._exchange(ip, scheme, port), REQUEST_TIMEOUT)
        except (OSError, TimeoutError, ValueError, asyncio.IncompleteReadError,
                asyncio.LimitOverrunError):
            return None

    async def _exchange(self, ip: str, scheme: str, port: int) -> str | None:
        writer = None
        try:
            reader, writer = await asyncio.open_connection(ip, port,
                ssl=self._tls if scheme == "https" else None, limit=16384)
            authority = ip if port in {80, 443} else f"{ip}:{port}"
            writer.write((f"HEAD / HTTP/1.1\r\nHost: {authority}\r\n"
                "User-Agent: Nodarion-WebDiscovery\r\nConnection: close\r\n\r\n").encode("ascii"))
            await writer.drain()
            headers = await reader.readuntil(b"\r\n\r\n")
            if len(headers) > 16384:
                return None
            status = headers.split(b"\r\n", 1)[0]
            if not re.fullmatch(rb"HTTP/1\.[01] [1-5][0-9]{2}(?: [^\r\n]*)?", status):
                return None
            return f"{scheme}://{authority}/"
        finally:
            if writer is not None:
                writer.close()
