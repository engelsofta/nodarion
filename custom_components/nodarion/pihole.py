"""Pi-hole 6 DNS provider using FTL's session-authenticated REST API.

The shared query cache uses AdGuard's internal record shape so existing device
statistics, charts and privacy-aware AI snapshots keep their established format.
No AdGuard control endpoint is used by this provider.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
import ipaddress
import logging
from time import monotonic
from typing import Any
from urllib.parse import quote

from aiohttp import ClientResponseError

from .adguard import AdGuardScanner

_LOGGER = logging.getLogger(__name__)
_BLOCKED = frozenset(
    {
        "GRAVITY",
        "REGEX",
        "DENYLIST",
        "EXTERNAL_BLOCKED_IP",
        "EXTERNAL_BLOCKED_NULL",
        "EXTERNAL_BLOCKED_NXRA",
        "GRAVITY_CNAME",
        "REGEX_CNAME",
        "DENYLIST_CNAME",
        "DBBUSY",
        "SPECIAL_DOMAIN",
        "EXTERNAL_BLOCKED_EDE15",
    }
)


class PiHoleScanner(AdGuardScanner):
    """Normalize Pi-hole records without changing existing AdGuard entities."""

    provider = "pihole"
    provider_name = "Pi-hole"
    supported_features = frozenset({"protection"})
    capabilities = frozenset({"domain_policy", "domain_rules"})
    supports_bypass_detection = False

    def __init__(
        self, hass, host, port, user, password, use_ssl, verify_ssl, period_hours
    ):
        super().__init__(hass, host, port, "", "", use_ssl, verify_ssl, period_hours)
        self._password = password
        self._sid: str | None = None
        self._authenticated = False
        self._expires = 0.0
        self._auth_lock = asyncio.Lock()
        self._scan_lock = asyncio.Lock()
        self.last_error: str | None = None
        self.version: str | None = None
        self.data_complete = False

    async def _request(self, method, path, payload=None, *, params=None, sid=None):
        kwargs: dict[str, Any] = {
            "ssl": None if self.verify_ssl else False,
            "allow_redirects": False,
        }
        if sid:
            kwargs["headers"] = {"X-FTL-SID": sid}
        if payload is not None:
            kwargs["json"] = payload
        if params is not None:
            kwargs["params"] = params
        async with asyncio.timeout(15):
            async with self.session.request(
                method, f"{self.base_url}/api/{path}", **kwargs
            ) as response:
                response.raise_for_status()
                if 300 <= response.status < 400:
                    raise ValueError(
                        "Pi-hole API redirects are not supported; configure the API host directly"
                    )
                if response.status == 204 or response.content_length == 0:
                    return {}
                return await response.json()

    async def _authenticate(self, rejected_sid=None):
        async with self._auth_lock:
            if (
                self._authenticated
                and monotonic() < self._expires
                and (rejected_sid is None or self._sid != rejected_sid)
            ):
                return self._sid
            if self._sid:
                try:
                    await self._request("DELETE", "auth", sid=self._sid)
                except Exception:
                    pass
            data = await self._request("POST", "auth", {"password": self._password})
            session = data.get("session", {})
            if not session.get("valid"):
                raise ValueError(
                    "Pi-hole authentication failed; use an application password"
                )
            self._sid = session.get("sid")
            self._authenticated = True
            self._expires = monotonic() + max(1, int(session.get("validity", 300)) - 10)
            return self._sid

    async def _async_request(self, method, path, payload=None, *, params=None):
        sid = await self._authenticate()
        try:
            return await self._request(method, path, payload, params=params, sid=sid)
        except ClientResponseError as err:
            if err.status != 401:
                raise
            sid = await self._authenticate(rejected_sid=sid)
            return await self._request(method, path, payload, params=params, sid=sid)

    async def async_close(self):
        """Release the server-side session, never the HA-owned HTTP session."""
        async with self._auth_lock:
            if self._sid:
                try:
                    await self._request("DELETE", "auth", sid=self._sid)
                except Exception:
                    _LOGGER.debug("Could not release Pi-hole API session")
            self._sid = None
            self._authenticated = False
            self._expires = 0.0

    async def async_validate_connection(self):
        await self._async_request("GET", "dns/blocking")

    @staticmethod
    def _normalize(item):
        client = item.get("client") or {}
        status = str(item.get("status") or "UNKNOWN")
        stamp = datetime.fromtimestamp(float(item["time"]), timezone.utc).isoformat()
        return {
            "time": stamp,
            "client": str(client.get("ip") or ""),
            "question": {
                "name": str(item.get("domain") or "").rstrip("."),
                "type": str(item.get("type") or ""),
            },
            "reason": f"FilteredPiHole:{status}" if status in _BLOCKED else status,
            "status": status,
            "cached": status in {"CACHE", "CACHE_STALE"},
            "upstream": str(item.get("upstream") or ""),
            "client_proto": "",
            "elapsedMs": float((item.get("reply") or {}).get("time") or 0) * 1000,
        }

    async def async_scan(self):
        async with self._scan_lock:
            end = datetime.now(timezone.utc)
            cutoff = end - timedelta(hours=self.period_hours)
            entries = []
            cursor = None
            complete = False
            try:
                async with asyncio.timeout(120):
                    while len(entries) < self.max_entries:
                        params = {
                            "from": cutoff.timestamp(),
                            "until": end.timestamp(),
                            "length": min(1000, self.max_entries - len(entries)),
                            "disk": "true",
                        }
                        if cursor is not None:
                            params["cursor"] = cursor
                        data = await self._async_request(
                            "GET", "queries", params=params
                        )
                        page = data.get("queries", [])
                        entries.extend(self._normalize(item) for item in page)
                        next_cursor = data.get("cursor")
                        if not page or len(entries) >= int(
                            data.get("recordsFiltered", len(entries) + 1)
                        ):
                            complete = True
                            break
                        if next_cursor is None or next_cursor == cursor:
                            break
                        cursor = next_cursor
                self.available = True
                self.last_error = None
                self._cached_entries = sorted(
                    entries,
                    key=lambda item: self._parse_time(item["time"]),
                    reverse=True,
                )
                # Empty/hidden history is not proof that a client bypasses DNS.
                self.data_complete = complete and bool(entries)
                self._update_global_dns_stats_from_query_log()
                self.global_dns_stats["source"] = "pihole_query_log"
                return self._aggregate(self._cached_entries, cutoff)
            except Exception as err:
                self.available = False
                self.last_error = type(err).__name__
                _LOGGER.warning(
                    "Pi-hole query-log scan failed (%s); retry on next DNS scan",
                    type(err).__name__,
                )
                return {}

    async def async_query_log(self, client=None, limit=250):
        params = {"length": max(1, min(int(limit), 500))}
        if client:
            params["client_ip"] = str(ipaddress.ip_address(client))
        data = await self._async_request("GET", "queries", params=params)
        rows = []
        for raw in data.get("queries", []):
            item = self._normalize(raw)
            if client and item["client"] != client:
                continue
            blocked = self._is_blocked(item["reason"])
            rows.append(
                {
                    "time": item["time"],
                    "client": item["client"],
                    "domain": item["question"]["name"],
                    "query_type": item["question"]["type"],
                    "protocol": "",
                    "dns_server": "Cache"
                    if item["cached"]
                    else item["upstream"] or "Pi-hole",
                    "cached": item["cached"],
                    "upstream": item["upstream"],
                    "status": item["status"],
                    "reason": item["reason"],
                    "elapsed_ms": item["elapsedMs"],
                    "answer": [],
                    "blocked": blocked,
                }
            )
        return rows

    async def async_status(self):
        blocking, stats = await asyncio.gather(
            self._async_request("GET", "dns/blocking"),
            self._async_request("GET", "stats/summary"),
        )
        queries = stats.get("queries", {})
        total = int(queries.get("total", 0))
        blocked = int(queries.get("blocked", 0))
        gravity = stats.get("gravity", {})
        return {
            "protection": blocking.get("blocking") == "enabled",
            "queries": total,
            "blocked": blocked,
            "blocked_ratio": round(blocked * 100 / total, 1) if total else 0.0,
            "period_hours": 24,
            "data_complete": True,
            "source": "pihole_stats_api",
            "rules_count": int(gravity.get("domains_being_blocked", 0)),
            "provider": self.provider,
            "provider_name": self.provider_name,
        }

    async def async_set_feature(self, feature, enabled):
        if feature not in self.supported_features or type(enabled) is not bool:
            raise ValueError("This feature is not supported by Pi-hole")
        await self._async_request(
            "POST", "dns/blocking", {"blocking": enabled, "timer": None}
        )

    async def async_configuration(self):
        data = await self._async_request("GET", "domains")
        rules = []
        for item in data.get("domains", []):
            if item.get("kind") == "exact" and item.get("enabled", True):
                domain = self.validate_domain(item["domain"])
                rules.append(
                    f"{'@@' if item.get('type') == 'allow' else ''}||{domain}^"
                )
        return {
            "filters": [],
            "rules": rules,
            "rewrites": [],
            "provider": self.provider,
            "capabilities": sorted(self.capabilities),
        }

    async def async_set_domain_policy(self, domain, policy, client=None):
        if client:
            raise ValueError("Pi-hole domain policies in Nodarion apply to all clients")
        domain = self.validate_domain(domain)
        if policy not in {"allow", "block"}:
            raise ValueError("Invalid domain policy")
        async with self._configuration_lock:
            groups = await self._async_request("GET", "groups")
            group_ids = [int(item["id"]) for item in groups.get("groups", [])]
            if not group_ids:
                raise ValueError(
                    "Pi-hole returned no groups; cannot apply policy to all clients"
                )
            kind = "allow" if policy == "allow" else "deny"
            existing = await self._async_request("GET", "domains")
            match = next(
                (
                    item
                    for item in existing.get("domains", [])
                    if item.get("domain") == domain
                    and item.get("kind") == "exact"
                    and item.get("type") == kind
                ),
                None,
            )
            payload = {
                "enabled": True,
                "comment": match.get("comment") if match else "Nodarion",
                "groups": group_ids,
            }
            if match:
                result = await self._async_request(
                    "PUT", f"domains/{kind}/exact/{quote(domain, safe='')}", payload
                )
            else:
                result = await self._async_request(
                    "POST", f"domains/{kind}/exact", {"domain": domain, **payload}
                )
            if (result.get("processed") or {}).get("errors"):
                raise ValueError("Pi-hole rejected the domain policy")
            # Exact allow rules take precedence over deny rules. Do not claim a
            # successful block while an opposite exact allow is still present.
            if policy == "block" and any(
                item.get("domain") == domain
                and item.get("kind") == "exact"
                and item.get("type") == "allow"
                for item in existing.get("domains", [])
            ):
                await self._async_request(
                    "DELETE", f"domains/allow/exact/{quote(domain, safe='')}"
                )
        return await self.async_configuration()

    @classmethod
    def _rule(cls, rule):
        if not isinstance(rule, str):
            raise ValueError("Enter an exact domain or ||domain^ / @@||domain^ rule")
        allow = rule.startswith("@@||")
        domain = (
            rule[4:-1]
            if allow and rule.endswith("^")
            else rule[2:-1]
            if rule.startswith("||") and rule.endswith("^")
            else rule
        )
        return ("allow" if allow else "block"), cls.validate_domain(domain)

    async def async_add_custom_rule(self, rule):
        policy, domain = self._rule(rule)
        return await self.async_set_domain_policy(domain, policy)

    async def async_delete_custom_rule(self, rule):
        policy, domain = self._rule(rule)
        async with self._configuration_lock:
            await self._async_request(
                "DELETE",
                f"domains/{'allow' if policy == 'allow' else 'deny'}/exact/{quote(domain, safe='')}",
            )
        return await self.async_configuration()
