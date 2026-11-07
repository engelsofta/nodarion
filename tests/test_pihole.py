"""Exercise real Pi-hole client behavior without an HA installation."""
import asyncio
from datetime import datetime, timezone
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock

from aiohttp import ClientResponseError, RequestInfo
from multidict import CIMultiDict, CIMultiDictProxy
from yarl import URL

from pihole_test_loader import load_clients

AdGuardScanner, PiHoleScanner = load_clients()


def auth_error(status=401):
    url = URL("http://pihole/api/dns/blocking")
    info = RequestInfo(url, "GET", CIMultiDictProxy(CIMultiDict()), url)
    return ClientResponseError(info, (), status=status)


class PiHoleTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.scanner = PiHoleScanner(SimpleNamespace(session=object()), "pihole", 80, "", "test-only", False, True, 24)

    async def test_concurrent_reads_share_one_login(self):
        self.scanner._request = AsyncMock(side_effect=lambda method, path, *args, **kwargs: {"session": {"valid": True, "sid": "one-session", "validity": 300}} if path == "auth" else {"blocking": "enabled"})
        await asyncio.gather(*(self.scanner.async_validate_connection() for _ in range(8)))
        logins = [call for call in self.scanner._request.call_args_list if call.args[:2] == ("POST", "auth")]
        self.assertEqual(len(logins), 1)
        self.assertEqual(self.scanner._request.call_args.kwargs["sid"], "one-session")

    async def test_expired_session_reauthenticates_once(self):
        self.scanner._request = AsyncMock(side_effect=[{"session": {"valid": True, "sid": "old", "validity": 300}}, auth_error(), {}, {"session": {"valid": True, "sid": "new", "validity": 300}}, {"blocking": "enabled"}])
        await self.scanner.async_validate_connection()
        self.assertEqual(self.scanner._sid, "new")

    async def test_invalid_credentials_and_forbidden_do_not_loop(self):
        self.scanner._request = AsyncMock(side_effect=auth_error(403))
        with self.assertRaises(ClientResponseError):
            await self.scanner.async_validate_connection()
        self.assertEqual(self.scanner._request.await_count, 1)

    async def test_scan_uses_cursor_and_aggregates_blocked_clients(self):
        now = datetime.now(timezone.utc).timestamp()
        self.scanner._async_request = AsyncMock(side_effect=[
            {"queries": [{"time": now, "domain": "ads.example.org", "status": "GRAVITY", "client": {"ip": "192.0.2.2"}, "reply": {"time": 0.004}}], "cursor": 8, "recordsFiltered": 2},
            {"queries": [{"time": now - 1, "domain": "example.org", "status": "CACHE", "client": {"ip": "192.0.2.2"}}], "cursor": 7, "recordsFiltered": 2},
        ])
        stats = await self.scanner.async_scan()
        self.assertTrue(self.scanner.available)
        self.assertTrue(self.scanner.data_complete)
        self.assertEqual(stats["192.0.2.2"].queries, 2)
        self.assertEqual(stats["192.0.2.2"].blocked, 1)
        self.assertEqual(self.scanner._async_request.call_args.kwargs["params"]["cursor"], 8)
        self.assertEqual(self.scanner._async_request.call_args.kwargs["params"]["disk"], "false")
        self.assertNotIn("example.org", str(self.scanner.analysis_snapshot()))

    async def test_timeout_keeps_cache_and_recovers_on_next_scan(self):
        self.scanner._cached_entries = [{"time": datetime.now(timezone.utc).isoformat(), "client": "192.0.2.2", "question": {"name": "example.org"}}]
        self.scanner._async_request = AsyncMock(side_effect=TimeoutError())
        self.assertEqual(await self.scanner.async_scan(), {})
        self.assertFalse(self.scanner.available)
        self.assertEqual(len(self.scanner._cached_entries), 1)
        self.scanner._async_request = AsyncMock(return_value={"queries": [], "recordsFiltered": 0})
        await self.scanner.async_scan()
        self.assertTrue(self.scanner.available)
        self.assertFalse(self.scanner.data_complete)

    async def test_disk_history_fills_old_window_without_replacing_live_ram(self):
        now = datetime.now(timezone.utc).timestamp()
        recent = {"time": now - 1, "domain": "example.org", "status": "CACHE", "client": {"ip": "192.0.2.2"}, "id": 8}
        older = {**recent, "id": 7, "time": now - 4000}
        self.scanner._async_request = AsyncMock(side_effect=[
            {"queries": [recent], "recordsFiltered": 1, "earliest_timestamp": now - 1800, "earliest_timestamp_disk": now - 90000},
            {"queries": [older], "recordsFiltered": 1},
        ])
        stats = await self.scanner.async_scan()
        self.assertEqual(stats["192.0.2.2"].queries, 2)
        self.assertEqual(self.scanner._async_request.call_args.kwargs["params"]["disk"], "true")
        self.assertEqual(self.scanner._async_request.call_args.kwargs["params"]["until"], now - 1800)

    async def test_max_entries_marks_partial_data(self):
        self.scanner.max_entries = 1
        self.scanner._async_request = AsyncMock(return_value={"queries": [{"time": datetime.now(timezone.utc).timestamp(), "domain": "example.org", "status": "CACHE", "client": {"ip": "192.0.2.2"}}], "recordsFiltered": 2, "cursor": 1})
        await self.scanner.async_scan()
        self.assertFalse(self.scanner.data_complete)

    async def test_exact_client_filter_and_no_invented_protocol(self):
        now = datetime.now(timezone.utc).timestamp()
        self.scanner._async_request = AsyncMock(return_value={"queries": [{"time": now, "domain": "example.org", "status": "CACHE", "client": {"ip": client}} for client in ("192.0.2.2", "192.0.2.20")]})
        rows = await self.scanner.async_query_log("192.0.2.2")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["protocol"], "")
        self.assertEqual(self.scanner._async_request.call_args.kwargs["params"]["client_ip"], "192.0.2.2")

    async def test_protection_changes_are_explicit_and_timer_is_cleared(self):
        self.scanner._async_request = AsyncMock()
        await self.scanner.async_set_feature("protection", False)
        self.scanner._async_request.assert_awaited_once_with("POST", "dns/blocking", {"blocking": False, "timer": None})
        for feature in ("safe_search", "query_log", "parental"):
            with self.assertRaises(ValueError):
                await self.scanner.async_set_feature(feature, True)

    async def test_client_rule_and_adguard_syntax_are_rejected(self):
        self.scanner._async_request = AsyncMock()
        with self.assertRaises(ValueError):
            await self.scanner.async_set_domain_policy("example.org", "allow", "192.0.2.2")
        with self.assertRaises(ValueError):
            await self.scanner.async_add_custom_rule("||example.org^$client=192.0.2.2")
        self.scanner._async_request.assert_not_awaited()

    async def test_domain_write_checks_partial_api_failures(self):
        self.scanner._async_request = AsyncMock(side_effect=[{"groups": [{"id": 0}, {"id": 2}]}, {"domains": []}, {"processed": {"errors": [{"error": "read only"}]}}])
        with self.assertRaises(ValueError):
            await self.scanner.async_set_domain_policy("example.org", "allow")
        self.assertEqual(self.scanner._async_request.call_args.args[2]["groups"], [0, 2])

    async def test_logout_releases_session(self):
        self.scanner._sid = "test-session"
        self.scanner._authenticated = True
        self.scanner._request = AsyncMock(return_value={})
        await self.scanner.async_close()
        self.scanner._request.assert_awaited_once_with("DELETE", "auth", sid="test-session")
        self.assertFalse(self.scanner._authenticated)


if __name__ == "__main__":
    unittest.main()
