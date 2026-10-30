"""Web results must update current data without overwriting concurrent host changes."""
import asyncio
from dataclasses import replace
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import AsyncMock, Mock
from test_manual_internet import methods, immediate

class WebBackgroundTests(TestCase):
    def test_results_apply_to_latest_host_data(self):
        scope=methods("coordinator.py",{"_publish_web_results"},
            {"replace":lambda obj,**kw:SimpleNamespace(**(vars(obj)|kw)),
             "_LOGGER":Mock(),"asyncio":__import__("asyncio")})
        old=SimpleNamespace(ip="192.168.1.20",hostname="old",web_urls=())
        current=SimpleNamespace(ip=old.ip,hostname="new",web_urls=())
        discovery=SimpleNamespace(async_update=AsyncMock(),eligible=lambda h,n:True,
            urls_for=lambda h:("http://192.168.1.20/",))
        c=SimpleNamespace(_web_discovery=discovery,segments=[],data={"host":current},
            async_set_updated_data=Mock(),async_update_listeners=Mock())
        scope["_publish_web_results"](c)
        published=c.data["host"]
        c.async_set_updated_data.assert_not_called()
        c.async_update_listeners.assert_called_once()
        self.assertEqual(published.hostname,"new")
        self.assertEqual(published.web_urls,("http://192.168.1.20/",))

    def test_results_are_not_published_for_removed_or_ineligible_hosts(self):
        scope=methods("coordinator.py",{"_publish_web_results"},
            {"replace":lambda obj,**kw:SimpleNamespace(**(vars(obj)|kw)),
             "_LOGGER":Mock(),"asyncio":__import__("asyncio")})
        old=SimpleNamespace(ip="192.168.1.20",web_urls=())
        c=SimpleNamespace(_web_discovery=SimpleNamespace(async_update=AsyncMock(),
            eligible=lambda h,n:False,urls_for=Mock()),segments=[],data={"other":old},
            async_set_updated_data=Mock(),async_update_listeners=Mock())
        scope["_publish_web_results"](c)
        c.async_set_updated_data.assert_not_called()
        c._web_discovery.urls_for.assert_not_called()

    @immediate
    async def test_background_loop_keeps_running_without_gui_or_network_refresh(self):
        from unittest.mock import patch
        scope=methods("coordinator.py",{"_async_web_discovery_loop"},{"asyncio":asyncio})
        c=SimpleNamespace(data={"host":"first"},_async_discover_web_interfaces=AsyncMock())
        count=0
        async def tick(seconds):
            nonlocal count
            self.assertEqual(seconds,5)
            count+=1
            if count==2:
                raise asyncio.CancelledError()
            c.data={"host":"second"}
        with patch.object(asyncio,"sleep",tick):
            with self.assertRaises(asyncio.CancelledError):
                await scope["_async_web_discovery_loop"](c)
        self.assertEqual(c._async_discover_web_interfaces.await_count,2)
        self.assertEqual(c._async_discover_web_interfaces.await_args_list[1].args[0],{"host":"second"})
