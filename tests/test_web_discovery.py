"""HTTP detection, identity/cache boundaries and bounded discovery regression tests."""
import importlib.util
import ipaddress
from pathlib import Path
import sys
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import AsyncMock, Mock, patch
from test_manual_internet import immediate

path=Path(__file__).parents[1]/"custom_components/nodarion/web_discovery.py"
spec=importlib.util.spec_from_file_location("nodarion_web_discovery",path)
web=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=web
spec.loader.exec_module(web)

def host(ip="192.168.1.20", mac="AA", online=True):
    return SimpleNamespace(ip=ip,mac=mac,online=online,segment_monitoring=True)

async def gather(*calls):
    return [await call for call in calls]

async def wait_for(call, timeout):
    return await call

class WebDiscoveryTests(TestCase):
    def test_scope_excludes_offline_and_outside_network(self):
        networks=[ipaddress.ip_network("192.168.1.0/24")]
        self.assertTrue(web.DeviceWebDiscovery.eligible(host(), networks))
        for h in (host(online=False),host("192.168.2.1"),host("127.0.0.1"),host("bad")):
            self.assertFalse(web.DeviceWebDiscovery.eligible(h, networks))
        h=host();h.segment_monitoring=False
        self.assertFalse(web.DeviceWebDiscovery.eligible(h, networks))

    def test_cache_requires_same_identity_online_and_fresh(self):
        d=web.DeviceWebDiscovery();h=host()
        d._cache[h.ip]=web.WebResult(d.identity(h),100,("http://192.168.1.20/",))
        self.assertTrue(d.urls_for(h,101))
        self.assertFalse(d.urls_for(host(mac="BB"),101))
        self.assertFalse(d.urls_for(host(online=False),101))
        self.assertFalse(d.urls_for(h,100+web.POSITIVE_TTL))

    @immediate
    async def test_http_auth_redirect_and_error_responses_are_servers(self):
        d=web.DeviceWebDiscovery()
        for status in (b"200 OK",b"401 Unauthorized",b"403 Forbidden",b"302 Found",b"405 Not Allowed"):
            reader=SimpleNamespace(readuntil=AsyncMock(return_value=b"HTTP/1.1 "+status+b"\r\nLocation: https://outside.invalid/\r\n\r\n"))
            writer=SimpleNamespace(write=Mock(),drain=AsyncMock(),close=Mock())
            with patch.object(web.asyncio,"open_connection",AsyncMock(return_value=(reader,writer))) as connect:
                result=await d._exchange("192.168.1.20","http",8080)
            self.assertEqual(result,"http://192.168.1.20:8080/")
            connect.assert_awaited_once()
            writer.close.assert_called_once()
            request=writer.write.call_args.args[0]
            self.assertTrue(request.startswith(b"HEAD / HTTP/1.1"))
            self.assertNotIn(b"Authorization",request)

    @immediate
    async def test_non_http_and_oversize_headers_are_rejected(self):
        d=web.DeviceWebDiscovery()
        for payload in (b"SSH-2.0-server\r\n\r\n", b"garbage\r\n\r\n",b"HTTP/1.1 200 OK\r\n"+b"x"*17000+b"\r\n\r\n"):
            reader=SimpleNamespace(readuntil=AsyncMock(return_value=payload))
            writer=SimpleNamespace(write=Mock(),drain=AsyncMock(),close=Mock())
            with patch.object(web.asyncio,"open_connection",AsyncMock(return_value=(reader,writer))):
                self.assertIsNone(await d._exchange("192.168.1.20","http",80))
            writer.close.assert_called_once()

    @immediate
    async def test_tls_uses_tls_context_and_explicit_https_url(self):
        d=web.DeviceWebDiscovery()
        reader=SimpleNamespace(readuntil=AsyncMock(return_value=b"HTTP/1.1 200 OK\r\n\r\n"))
        writer=SimpleNamespace(write=Mock(),drain=AsyncMock(),close=Mock())
        with patch.object(web.asyncio,"open_connection",AsyncMock(return_value=(reader,writer))) as connect:
            self.assertEqual(await d._exchange("192.168.1.20","https",443),"https://192.168.1.20/")
        self.assertIs(connect.call_args.kwargs["ssl"],d._tls)

    @immediate
    async def test_refused_or_timed_out_connection_is_not_exposed(self):
        d=web.DeviceWebDiscovery()
        for error in (OSError("refused"),TimeoutError()):
            with patch.object(d,"_exchange",AsyncMock(side_effect=error)), patch.object(web.asyncio,"wait_for",wait_for):
                self.assertIsNone(await d.async_probe("192.168.1.20","http",80))

    @immediate
    async def test_cache_reuses_results_and_rechecks_after_expiry(self):
        d=web.DeviceWebDiscovery();h=host();net=[ipaddress.ip_network("192.168.1.0/24")]
        async def probe(ip,scheme,port):
            return f"{scheme}://{ip}/" if port==80 else None
        with patch.object(web.asyncio,"gather",gather),patch.object(d,"async_probe",AsyncMock(side_effect=probe)) as check,patch.object(web,"time",return_value=100):
            await d.async_update([h],net)
            self.assertEqual(check.await_count,4)
            await d.async_update([h],net)
            self.assertEqual(check.await_count,4)
            self.assertEqual(d.urls_for(h,101),("http://192.168.1.20/",))
        with patch.object(web.asyncio,"gather",gather),patch.object(d,"async_probe",AsyncMock(return_value=None)),patch.object(web,"time",return_value=100+web.POSITIVE_TTL+1):
            await d.async_update([h],net)
            self.assertFalse(d.urls_for(h,100+web.POSITIVE_TTL+2))

    @immediate
    async def test_batches_are_bounded_and_do_not_starve_new_devices(self):
        d=web.DeviceWebDiscovery();hosts=[host(f"192.168.1.{i}") for i in range(1,21)]
        net=[ipaddress.ip_network("192.168.1.0/24")]
        with patch.object(web.asyncio,"gather",gather),patch.object(d,"async_probe",AsyncMock(return_value=None)) as probe:
            await d.async_update(hosts,net)
            self.assertEqual(len(d._cache),web.MAX_DEVICES_PER_SCAN)
            self.assertEqual(probe.await_count,4*web.MAX_DEVICES_PER_SCAN)
            await d.async_update(hosts,net)
            self.assertEqual(len(d._cache),2*web.MAX_DEVICES_PER_SCAN)

    @immediate
    async def test_probe_allows_slow_router_response(self):
        d=web.DeviceWebDiscovery()
        observed=[]
        async def bounded(call, timeout):
            observed.append(timeout)
            return await call
        with patch.object(d,"_exchange",AsyncMock(return_value="http://192.168.1.20/")),patch.object(web.asyncio,"wait_for",bounded):
            self.assertTrue(await d.async_probe("192.168.1.20","http",80))
        self.assertEqual(observed,[10])

    def test_explicit_scan_can_clear_negative_cache(self):
        d=web.DeviceWebDiscovery()
        d._cache["192.168.1.20"]=web.WebResult("aa",100,())
        d.clear_cache()
        self.assertFalse(d._cache)

    @immediate
    async def test_finished_devices_publish_without_waiting_for_whole_batch(self):
        d=web.DeviceWebDiscovery();hosts=[host("192.168.1.20"),host("192.168.1.21")]
        events=[]
        async def probe(ip,scheme,port):
            if ip.endswith("21"):
                self.assertEqual(len(events),1)
            return f"http://{ip}/" if port==80 else None
        with patch.object(web.asyncio,"gather",gather),patch.object(d,"async_probe",probe):
            await d.async_update(hosts,[ipaddress.ip_network("192.168.1.0/24")],
                on_update=lambda:events.append(dict(d._cache)))
        self.assertEqual(len(events),2)
        self.assertIn("192.168.1.20",events[0])
        self.assertNotIn("192.168.1.21",events[0])

    @immediate
    async def test_daily_cache_survives_restart_and_temporary_offline(self):
        d=web.DeviceWebDiscovery();h=host();net=[ipaddress.ip_network("192.168.1.0/24")]
        d._cache[h.ip]=web.WebResult(d.identity(h),100,("http://192.168.1.20/",))
        restored=web.DeviceWebDiscovery();restored.restore_cache(d.export_cache())
        with patch.object(web,"time",return_value=3600),patch.object(web.asyncio,"gather",gather),patch.object(restored,"async_probe",AsyncMock()) as probe:
            await restored.async_update([host(online=False)],net)
            self.assertFalse(restored.urls_for(host(online=False)))
            await restored.async_update([h],net)
            probe.assert_not_called()
            self.assertTrue(restored.urls_for(h))

    @immediate
    async def test_negative_result_also_waits_a_day(self):
        d=web.DeviceWebDiscovery();h=host();net=[ipaddress.ip_network("192.168.1.0/24")]
        d._cache[h.ip]=web.WebResult(d.identity(h),100,())
        with patch.object(web,"time",return_value=3600),patch.object(web.asyncio,"gather",gather),patch.object(d,"async_probe",AsyncMock(return_value=None)) as probe:
            await d.async_update([h],net)
            probe.assert_not_called()

    @immediate
    async def test_ip_or_mac_change_is_checked_immediately(self):
        for h in (host(mac="BB"),host("192.168.1.21")):
            d=web.DeviceWebDiscovery();old=host()
            d._cache[old.ip]=web.WebResult(d.identity(old),100,("http://192.168.1.20/",))
            with patch.object(web,"time",return_value=101),patch.object(web.asyncio,"gather",gather),patch.object(d,"async_probe",AsyncMock(return_value=None)) as probe:
                await d.async_update([h],[ipaddress.ip_network("192.168.1.0/24")])
                self.assertEqual(probe.await_count,4)

    def test_restore_rejects_external_links_and_invalid_timestamps(self):
        d=web.DeviceWebDiscovery()
        for checked,urls in ((float("nan"),[]),(float("inf"),[]),(100,["https://outside.invalid/"])):
            d.restore_cache({"192.168.1.20":{"identity":"aa","checked":checked,"urls":urls}})
            self.assertFalse(d._cache)
