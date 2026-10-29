"""Web results must update current data without overwriting concurrent host changes."""
from dataclasses import replace
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import AsyncMock, Mock
from test_manual_internet import methods, immediate

class WebBackgroundTests(TestCase):
    @immediate
    async def test_results_apply_to_latest_host_data(self):
        scope=methods("coordinator.py",{"_async_discover_web_interfaces"},
            {"replace":lambda obj,**kw:SimpleNamespace(**(vars(obj)|kw)),
             "_LOGGER":Mock(),"asyncio":__import__("asyncio")})
        old=SimpleNamespace(ip="192.168.1.20",hostname="old",web_urls=())
        current=SimpleNamespace(ip=old.ip,hostname="new",web_urls=())
        discovery=SimpleNamespace(async_update=AsyncMock(),eligible=lambda h,n:True,
            urls_for=lambda h:("http://192.168.1.20/",))
        c=SimpleNamespace(_web_discovery=discovery,segments=[],data={"host":current},
            async_set_updated_data=Mock())
        await scope["_async_discover_web_interfaces"](c,{"host":old})
        published=c.async_set_updated_data.call_args.args[0]["host"]
        self.assertEqual(published.hostname,"new")
        self.assertEqual(published.web_urls,("http://192.168.1.20/",))

    @immediate
    async def test_results_are_not_published_for_removed_or_ineligible_hosts(self):
        scope=methods("coordinator.py",{"_async_discover_web_interfaces"},
            {"replace":lambda obj,**kw:SimpleNamespace(**(vars(obj)|kw)),
             "_LOGGER":Mock(),"asyncio":__import__("asyncio")})
        old=SimpleNamespace(ip="192.168.1.20",web_urls=())
        c=SimpleNamespace(_web_discovery=SimpleNamespace(async_update=AsyncMock(),
            eligible=lambda h,n:False,urls_for=Mock()),segments=[],data={"other":old},
            async_set_updated_data=Mock())
        await scope["_async_discover_web_interfaces"](c,{"host":old})
        c.async_set_updated_data.assert_not_called()
        c._web_discovery.urls_for.assert_not_called()
