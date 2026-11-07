"""Run real Pi-hole 6 API checks on a disposable loopback-only container."""
import asyncio
from datetime import datetime, timezone
import os
from pathlib import Path
import socket
import struct
from types import SimpleNamespace
import sys

import aiohttp

sys.path.insert(0, str(Path(__file__).parent))
from pihole_test_loader import load_clients

_, PiHoleScanner = load_clients()


def query(domain):
    packet = struct.pack("!6H", 1234, 0x100, 1, 0, 0, 0)
    packet += b"".join(bytes([len(part)]) + part.encode() for part in domain.split(".")) + b"\0\0\1\0\1"
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(5)
        sock.sendto(packet, ("127.0.0.1", 1053))
        return sock.recvfrom(4096)[0]


async def main():
    async with aiohttp.ClientSession() as session:
        root = PiHoleScanner(SimpleNamespace(session=session), "127.0.0.1", 18080, "", os.environ["PIHOLE_TEST_PASSWORD"], False, True, 24)
        app = (await root._async_request("GET", "auth/app"))["app"]
        await root._async_request("PATCH", "config/webserver/api/app_pwhash", {"config": {"webserver": {"api": {"app_pwhash": app["hash"]}}}})
        await root.async_close()
        scanner = PiHoleScanner(SimpleNamespace(session=session), "127.0.0.1", 18080, "", app["password"], False, True, 24)
        try:
            await scanner.async_validate_connection()
            initial_sid = scanner._sid
            assert (await scanner.async_status())["provider"] == "pihole"
            assert scanner._sid == initial_sid, "Session must be reused"
            await scanner.async_set_feature("protection", False)
            assert not (await scanner.async_status())["protection"]
            await scanner.async_set_feature("protection", True)
            assert (await scanner.async_status())["protection"]
            await scanner.async_set_domain_policy("example.org", "block")
            # FTL applies gravity/group changes asynchronously. Wait for the
            # actual blocking outcome, not merely the successful API write.
            for attempt in range(10):
                await asyncio.sleep(1)
                await asyncio.to_thread(query, "example.org")
                rows = await scanner.async_query_log()
                if any(row["domain"] == "example.org" and row["blocked"] for row in rows):
                    break
            assert any(row["domain"] == "example.org" and row["blocked"] for row in rows), rows
            client = next(row["client"] for row in rows if row["domain"] == "example.org")
            rows = await scanner.async_query_log(client)
            assert rows and all(row["client"] == client for row in rows)
            stats = await scanner.async_scan()
            assert scanner.available, scanner.last_error
            assert stats[client].blocked >= 1
            assert scanner.query_series(client, 24)
            snapshot = scanner.analysis_snapshot()
            assert "example.org" not in str(snapshot), "Default AI snapshot must anonymize domains"
            config = await scanner.async_configuration()
            assert "||example.org^" in config["rules"]
            await scanner.async_add_custom_rule("@@||example.org^")
            assert "@@||example.org^" in (await scanner.async_configuration())["rules"]
            await scanner.async_delete_custom_rule("@@||example.org^")
            assert "@@||example.org^" not in (await scanner.async_configuration())["rules"]
            scanner._sid = "invalid-test-session"
            await scanner.async_validate_connection()
            assert scanner._sid != "invalid-test-session"
            for feature in ("safe_search", "parental", "filtering", "query_log"):
                try:
                    await scanner.async_set_feature(feature, True)
                except ValueError:
                    pass
                else:
                    raise AssertionError(f"Unsupported feature was accepted: {feature}")
            try:
                await scanner.async_set_domain_policy("example.org", "allow", client)
            except ValueError:
                pass
            else:
                raise AssertionError("Client-scoped policy must not silently become global")
            await scanner.async_delete_custom_rule("||example.org^")
            print("PASS: real Pi-hole 6 authentication, session reuse/recovery, blocking toggle, exact-client query log, per-client aggregation, chart, anonymization, domain CRUD and unsupported-feature guards")
            print("Tested at", datetime.now(timezone.utc).isoformat())
        finally:
            await scanner.async_close()
            assert not scanner._authenticated


if __name__ == "__main__":
    asyncio.run(main())
