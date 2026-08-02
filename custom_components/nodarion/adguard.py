"""Read and aggregate per-client DNS activity from AdGuard Home."""

from __future__ import annotations

import asyncio
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
import hashlib
import ipaddress
import logging
import re
from typing import Any

from aiohttp import BasicAuth
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)
_PAGE_SIZE = 1000
_MIN_MAX_ENTRIES = 10_000
_MAX_ENTRIES_PER_HOUR = 10_000
_ABSOLUTE_MAX_ENTRIES = 500_000
_MAX_CUSTOM_RULE_LENGTH = 4096
_DOMAIN_LABEL = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")


@dataclass(slots=True)
class ClientDnsStats:
    """Aggregated DNS activity for one client IP."""

    queries: int = 0
    blocked: int = 0
    last_activity: str | None = None
    last_domain: str | None = None
    last_blocked_domain: str | None = None
    last_block_reason: str | None = None
    last_protocol: str | None = None
    queried_domains: Counter[str] = field(default_factory=Counter)
    blocked_domains: Counter[str] = field(default_factory=Counter)
    blocked_reasons: Counter[str] = field(default_factory=Counter)

    @property
    def blocked_ratio(self) -> float:
        return round(self.blocked * 100 / self.queries, 1) if self.queries else 0.0

    def as_dict(self) -> dict[str, Any]:
        return {
            "queries": self.queries,
            "blocked": self.blocked,
            "blocked_ratio": self.blocked_ratio,
            "last_activity": self.last_activity,
            "last_domain": self.last_domain,
            "last_blocked_domain": self.last_blocked_domain,
            "last_block_reason": self.last_block_reason,
            "last_protocol": self.last_protocol,
            "top_queried_domains": self.queried_domains.most_common(5),
            "top_blocked_domains": self.blocked_domains.most_common(5),
            "blocked_reasons": dict(self.blocked_reasons.most_common()),
        }


class AdGuardScanner:
    """Fetch the bounded AdGuard query log and aggregate it by client."""

    def __init__(
        self,
        hass: HomeAssistant,
        host: str,
        port: int,
        user: str,
        password: str,
        use_ssl: bool,
        verify_ssl: bool,
        period_hours: int,
    ) -> None:
        self.session = async_get_clientsession(hass)
        self.base_url = f"{'https' if use_ssl else 'http'}://{host}:{port}"
        # AdGuard Home can run without web authentication.  Supplying an
        # arbitrary Basic-Auth header in that mode may still produce a 401,
        # so omit the header unless credentials were actually configured.
        self.auth = BasicAuth(user, password) if user and password else None
        self.verify_ssl = verify_ssl
        self.period_hours = period_hours
        # A fixed 10,000-entry ceiling covered only a couple of hours on busy
        # networks, even when a 24-hour evaluation period was configured.
        # Scale the safety limit with the requested period while retaining an
        # absolute cap so a very large AdGuard log cannot exhaust HA's memory.
        self.max_entries = min(
            _ABSOLUTE_MAX_ENTRIES,
            max(_MIN_MAX_ENTRIES, self.period_hours * _MAX_ENTRIES_PER_HOUR),
        )
        self.available = False
        self.data_complete = True
        self._cached_entries: list[dict[str, Any]] = []
        self._configuration_lock = asyncio.Lock()

    async def _async_request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
    ) -> Any:
        """Send one authenticated request to the AdGuard control API."""
        async with asyncio.timeout(10):
            async with self.session.request(
                method,
                f"{self.base_url}/control/{path.lstrip('/')}",
                json=payload,
                auth=self.auth,
                ssl=None if self.verify_ssl else False,
            ) as response:
                response.raise_for_status()
                if response.status == 204 or response.content_length == 0:
                    return None
                if response.content_type == "application/json":
                    return await response.json()
                body = await response.text()
                return body or None

    async def async_configuration(self) -> dict[str, Any]:
        """Return the editable custom rules and DNS rewrites."""
        filtering, rewrites = await asyncio.gather(
            self._async_request("GET", "filtering/status"),
            self._async_request("GET", "rewrite/list"),
        )
        filtering = filtering if isinstance(filtering, dict) else {}
        return {
            "rules": [
                str(rule)
                for rule in filtering.get("user_rules", [])
                if isinstance(rule, str)
            ],
            "rewrites": [
                {
                    "domain": str(item.get("domain") or ""),
                    "answer": str(item.get("answer") or ""),
                    "enabled": item.get("enabled", True),
                }
                for item in (rewrites if isinstance(rewrites, list) else [])
                if isinstance(item, dict)
            ],
        }

    async def async_add_custom_rule(self, rule: str) -> dict[str, Any]:
        """Add one custom filtering rule without replacing unrelated rules."""
        normalized = self.validate_custom_rule(rule)
        async with self._configuration_lock:
            configuration = await self.async_configuration()
            rules = configuration["rules"]
            if normalized not in rules:
                rules.append(normalized)
                await self._async_request(
                    "POST", "filtering/set_rules", {"rules": rules}
                )
        return await self.async_configuration()

    async def async_delete_custom_rule(self, rule: str) -> dict[str, Any]:
        """Delete one exact custom rule without touching filter subscriptions."""
        normalized = self.validate_custom_rule(rule)
        async with self._configuration_lock:
            configuration = await self.async_configuration()
            rules = configuration["rules"]
            updated = [item for item in rules if item != normalized]
            if updated != rules:
                await self._async_request(
                    "POST", "filtering/set_rules", {"rules": updated}
                )
        return await self.async_configuration()

    async def async_set_domain_policy(
        self, domain: str, policy: str, client: str | None = None
    ) -> dict[str, Any]:
        """Block or allow a domain using an exact custom AdGuard rule."""
        normalized = self.validate_domain(domain)
        if policy not in {"block", "allow"}:
            raise ValueError("Unsupported domain policy")
        client_modifier = ""
        if client:
            client_modifier = f"$client={ipaddress.ip_address(str(client).strip())}"
        block_rule = f"||{normalized}^{client_modifier}"
        allow_rule = f"@@||{normalized}^{client_modifier}"
        selected = block_rule if policy == "block" else allow_rule
        opposite = allow_rule if policy == "block" else block_rule
        async with self._configuration_lock:
            configuration = await self.async_configuration()
            rules = [item for item in configuration["rules"] if item != opposite]
            if selected not in rules:
                rules.append(selected)
            await self._async_request(
                "POST", "filtering/set_rules", {"rules": rules}
            )
        return await self.async_configuration()

    async def async_add_rewrite(
        self, domain: str, answer: str
    ) -> dict[str, Any]:
        """Add a validated DNS rewrite."""
        normalized_domain = self.validate_domain(domain, allow_wildcard=True)
        normalized_answer = self.validate_rewrite_answer(answer)
        async with self._configuration_lock:
            await self._async_request(
                "POST",
                "rewrite/add",
                {"domain": normalized_domain, "answer": normalized_answer},
            )
        return await self.async_configuration()

    async def async_delete_rewrite(
        self, domain: str, answer: str
    ) -> dict[str, Any]:
        """Delete one exact DNS rewrite."""
        normalized_domain = self.validate_domain(domain, allow_wildcard=True)
        normalized_answer = self.validate_rewrite_answer(answer)
        async with self._configuration_lock:
            await self._async_request(
                "POST",
                "rewrite/delete",
                {"domain": normalized_domain, "answer": normalized_answer},
            )
        return await self.async_configuration()

    @staticmethod
    def validate_custom_rule(rule: str) -> str:
        """Return a bounded one-line AdGuard rule."""
        if not isinstance(rule, str):
            raise ValueError("Rule must be text")
        normalized = rule.strip()
        if (
            not normalized
            or len(normalized) > _MAX_CUSTOM_RULE_LENGTH
            or "\n" in normalized
            or "\r" in normalized
        ):
            raise ValueError("Invalid custom rule")
        return normalized

    @staticmethod
    def validate_domain(domain: str, allow_wildcard: bool = False) -> str:
        """Normalize and validate a DNS name before using it in a rule."""
        if not isinstance(domain, str):
            raise ValueError("Domain must be text")
        normalized = domain.strip().lower().rstrip(".")
        wildcard = allow_wildcard and normalized.startswith("*.")
        if wildcard:
            normalized = normalized[2:]
        try:
            ascii_domain = normalized.encode("idna").decode("ascii")
        except UnicodeError as err:
            raise ValueError("Invalid domain") from err
        if (
            not ascii_domain
            or len(ascii_domain) > 253
            or "." not in ascii_domain
            or any(
                not _DOMAIN_LABEL.fullmatch(label)
                for label in ascii_domain.split(".")
            )
        ):
            raise ValueError("Invalid domain")
        return f"*.{ascii_domain}" if wildcard else ascii_domain

    @classmethod
    def validate_rewrite_answer(cls, answer: str) -> str:
        """Validate an IP address or DNS name used as rewrite target."""
        if not isinstance(answer, str):
            raise ValueError("Rewrite answer must be text")
        normalized = answer.strip().rstrip(".")
        try:
            return str(ipaddress.ip_address(normalized))
        except ValueError:
            return cls.validate_domain(normalized)

    async def async_scan(self) -> dict[str, ClientDnsStats]:
        """Return DNS statistics for client IPs within the configured period."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=self.period_hours)
        entries: list[dict[str, Any]] = []
        older_than: str | None = None
        oldest_time: datetime | None = None
        newest_cached = max(
            (
                timestamp
                for item in self._cached_entries
                if (timestamp := self._parse_time(item.get("time"))) is not None
            ),
            default=None,
        )

        try:
            scan_timeout = max(20, min(120, self.period_hours * 2))
            async with asyncio.timeout(scan_timeout):
                config_url = f"{self.base_url}/control/querylog/config"
                async with self.session.get(
                    config_url,
                    auth=self.auth,
                    ssl=None if self.verify_ssl else False,
                ) as response:
                    if response.status == 404:
                        config_url = f"{self.base_url}/control/querylog_info"
                    else:
                        response.raise_for_status()
                        config = await response.json()
                        if not config.get("enabled", True):
                            self.available = False
                            _LOGGER.warning("AdGuard Home query log is disabled")
                            return {}
                if config_url.endswith("querylog_info"):
                    async with self.session.get(
                        config_url,
                        auth=self.auth,
                        ssl=None if self.verify_ssl else False,
                    ) as response:
                        response.raise_for_status()
                        config = await response.json()
                        if not config.get("enabled", True):
                            self.available = False
                            _LOGGER.warning("AdGuard Home query log is disabled")
                            return {}
                while len(entries) < self.max_entries:
                    params: dict[str, str | int] = {"limit": _PAGE_SIZE}
                    if older_than:
                        params["older_than"] = older_than
                    async with self.session.get(
                        f"{self.base_url}/control/querylog",
                        params=params,
                        auth=self.auth,
                        ssl=None if self.verify_ssl else False,
                    ) as response:
                        response.raise_for_status()
                        payload = await response.json()
                    page = payload.get("data", [])
                    if not isinstance(page, list) or not page:
                        break
                    entries.extend(item for item in page if isinstance(item, dict))
                    oldest = str(payload.get("oldest") or "")
                    oldest_time = self._parse_time(oldest)
                    if (
                        len(page) < _PAGE_SIZE
                        or not oldest
                        or oldest == older_than
                        or (oldest_time is not None and oldest_time <= cutoff)
                        or (
                            newest_cached is not None
                            and oldest_time is not None
                            and oldest_time <= newest_cached
                        )
                    ):
                        break
                    older_than = oldest
        except Exception as err:
            self.available = False
            _LOGGER.warning("AdGuard Home query-log scan failed: %s", err)
            return {}

        self.available = True
        combined = entries + self._cached_entries
        unique: dict[tuple[str, str, str, str, str], dict[str, Any]] = {}
        for item in combined:
            timestamp = self._parse_time(item.get("time"))
            if timestamp is None or timestamp < cutoff:
                continue
            question = item.get("question") or {}
            signature = (
                str(item.get("time") or ""),
                str(item.get("client") or ""),
                str(question.get("name") or question.get("host") or ""),
                str(item.get("reason") or ""),
                str(item.get("client_proto") or ""),
            )
            unique.setdefault(signature, item)
        ordered = sorted(
            unique.values(),
            key=lambda item: self._parse_time(item.get("time"))
            or datetime.min.replace(tzinfo=timezone.utc),
            reverse=True,
        )
        truncated = len(ordered) > self.max_entries or (
            len(entries) >= self.max_entries
            and oldest_time is not None
            and oldest_time > cutoff
        )
        self.data_complete = self.data_complete and not truncated
        self._cached_entries = ordered[: self.max_entries]
        return self._aggregate(self._cached_entries, cutoff)

    async def async_query_log(
        self,
        client: str | None = None,
        limit: int = 250,
    ) -> list[dict[str, Any]]:
        """Return the newest query-log rows, optionally for one exact client."""
        params: dict[str, str | int] = {
            "limit": max(1, min(int(limit), 500)),
        }
        if client:
            # Quoting enables strict matching in AdGuard Home and prevents an
            # address such as 192.168.1.2 from also matching 192.168.1.20.
            params["search"] = f'"{client}"'
        try:
            async with asyncio.timeout(10):
                async with self.session.get(
                    f"{self.base_url}/control/querylog",
                    params=params,
                    auth=self.auth,
                    ssl=None if self.verify_ssl else False,
                ) as response:
                    response.raise_for_status()
                    payload = await response.json()
        except Exception as err:
            self.available = False
            _LOGGER.warning("AdGuard Home live query-log failed: %s", err)
            raise

        self.available = True
        rows: list[dict[str, Any]] = []
        for item in payload.get("data", []):
            if not isinstance(item, dict):
                continue
            question = item.get("question") or {}
            answers = item.get("answer") or []
            reason = str(item.get("reason") or "")
            cached = bool(item.get("cached"))
            upstream = str(item.get("upstream") or "").strip()
            if cached:
                dns_server = "Cache"
            elif upstream:
                dns_server = upstream
            elif self._is_blocked(reason):
                dns_server = "AdGuard-Filter"
            elif reason in {"Rewrite", "RewriteEtcHosts", "RewriteRule"}:
                dns_server = "Lokale Antwort"
            else:
                dns_server = "AdGuard Home"
            rows.append(
                {
                    "time": item.get("time"),
                    "client": str(item.get("client") or ""),
                    "domain": str(
                        question.get("name") or question.get("host") or ""
                    ).rstrip("."),
                    "query_type": str(question.get("type") or ""),
                    "protocol": str(item.get("client_proto") or ""),
                    "dns_server": dns_server,
                    "cached": cached,
                    "upstream": upstream,
                    "status": str(item.get("status") or ""),
                    "reason": reason,
                    "elapsed_ms": item.get("elapsedMs"),
                    "answer": [
                        str(answer.get("value") or "")
                        for answer in answers
                        if isinstance(answer, dict) and answer.get("value")
                    ][:3],
                    "blocked": self._is_blocked(
                        reason
                    ),
                }
            )
        return rows

    def analysis_snapshot(self, include_domains: bool = False) -> dict[str, Any]:
        """Return a compact, privacy-aware snapshot for AI analysis."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        entries = [
            item
            for item in self._cached_entries
            if (
                (timestamp := self._parse_time(item.get("time"))) is not None
                and timestamp >= cutoff
            )
        ]
        domains: Counter[str] = Counter()
        blocked_domains: Counter[str] = Counter()
        reasons: Counter[str] = Counter()
        clients: set[str] = set()
        blocked = 0
        for item in entries:
            client = str(item.get("client") or "").strip()
            if client:
                clients.add(client)
            question = item.get("question") or {}
            domain = str(
                question.get("name") or question.get("host") or ""
            ).rstrip(".").strip()
            if domain:
                domains[domain] += 1
            reason = str(item.get("reason") or "").strip()
            if self._is_blocked(reason):
                blocked += 1
                reasons[reason or "Filtered"] += 1
                if domain:
                    blocked_domains[domain] += 1

        def top_values(counter: Counter[str]) -> list[list[Any]]:
            values = counter.most_common(10)
            if include_domains:
                return [[domain, count] for domain, count in values]
            return [
                [
                    "domain_"
                    + hashlib.sha256(domain.encode()).hexdigest()[:8],
                    count,
                ]
                for domain, count in values
            ]

        return {
            "queries": len(entries),
            "blocked": blocked,
            "blocked_ratio": round(blocked * 100 / len(entries), 1)
            if entries else 0.0,
            "active_clients": len(clients),
            "top_domains": top_values(domains),
            "top_blocked_domains": top_values(blocked_domains),
            "blocked_reasons": dict(reasons.most_common()),
            "domains_included": include_domains,
            "data_complete": self.data_complete,
        }

    def query_series(
        self,
        client: str | None = None,
        hours: int = 24,
    ) -> list[dict[str, Any]]:
        """Aggregate cached DNS queries into hourly chart buckets."""
        now = datetime.now(timezone.utc)
        current_hour = now.replace(minute=0, second=0, microsecond=0)
        starts = [
            current_hour - timedelta(hours=offset)
            for offset in reversed(range(max(1, min(hours, 48))))
        ]
        buckets = {
            start: {"time": start.isoformat(), "allowed": 0, "blocked": 0}
            for start in starts
        }
        for item in self._cached_entries:
            timestamp = self._parse_time(item.get("time"))
            if timestamp is None:
                continue
            bucket = timestamp.replace(minute=0, second=0, microsecond=0)
            if bucket not in buckets:
                continue
            item_client = str(item.get("client") or "").strip()
            if client and item_client != client:
                continue
            reason = str(item.get("reason") or "").strip()
            key = "blocked" if self._is_blocked(reason) else "allowed"
            buckets[bucket][key] += 1
        return [buckets[start] for start in starts]

    @classmethod
    def _aggregate(
        cls,
        entries: list[dict[str, Any]],
        cutoff: datetime,
    ) -> dict[str, ClientDnsStats]:
        """Aggregate bounded query-log entries by their client address."""
        result: dict[str, ClientDnsStats] = {}
        for item in entries:
            timestamp = cls._parse_time(item.get("time"))
            if timestamp is None or timestamp < cutoff:
                continue
            client = str(item.get("client") or "").strip()
            question = item.get("question") or {}
            # AdGuard Home 0.107.77 renamed the query field from ``host`` to
            # ``name``.  Keep the fallback for older installations.
            domain = str(
                question.get("name") or question.get("host") or ""
            ).rstrip(".").strip()
            if not client or not domain:
                continue
            stats = result.setdefault(client, ClientDnsStats())
            stats.queries += 1
            stats.queried_domains[domain] += 1
            if stats.last_activity is None:
                stats.last_activity = timestamp.isoformat()
                stats.last_domain = domain
                stats.last_protocol = (
                    str(item.get("client_proto") or "").strip() or None
                )
            reason = str(item.get("reason") or "").strip()
            if cls._is_blocked(reason):
                stats.blocked += 1
                stats.blocked_domains[domain] += 1
                stats.blocked_reasons[reason or "Filtered"] += 1
                if stats.last_blocked_domain is None:
                    stats.last_blocked_domain = domain
                    stats.last_block_reason = reason or None
        return result

    @staticmethod
    def _is_blocked(reason: str) -> bool:
        return reason.startswith("Filtered") or reason in {
            "SafeBrowsing",
            "Parental",
            "SafeSearch",
            "BlockedService",
        }

    @staticmethod
    def _parse_time(value: Any) -> datetime | None:
        if not value:
            return None
        try:
            parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError:
            return None
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
