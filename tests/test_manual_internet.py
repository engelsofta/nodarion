"""Execute policy methods in isolation without requiring a running HA instance."""
import ast
from pathlib import Path
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import AsyncMock

ROOT = Path(__file__).parents[1] / "custom_components" / "nodarion"

def methods(file, names, scope):
    tree = ast.parse((ROOT / file).read_text(encoding="utf-8"))
    nodes = [n for cls in tree.body if isinstance(cls, ast.ClassDef)
             for n in cls.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name in names]
    exec(compile(ast.Module(body=nodes, type_ignores=[]), file, "exec",
                 flags=__import__("__future__").annotations.compiler_flag), scope)
    return scope

def immediate(test):
    """These isolated methods only await immediate mocks; no event loop needed."""
    def execute(self):
        coroutine = test(self)
        try:
            coroutine.send(None)
        except StopIteration:
            return
        finally:
            coroutine.close()
        raise AssertionError("Unexpected external I/O in isolated test")
    return execute

class ManualInternetTests(TestCase):
    @immediate
    async def test_denial_follows_mac_and_explicit_release_clears_it(self):
        scope = methods("monitor.py", {"is_internet_blocked", "async_set_internet_blocked"},
                        {"normalize_mac": lambda mac: mac.upper() if mac else None})
        monitor = SimpleNamespace(blocked_internet=set(), _async_save=AsyncMock())
        host = SimpleNamespace(key="ip_1", mac="aa:bb:cc:dd:ee:ff")
        await scope["async_set_internet_blocked"](monitor, host, True)
        moved = SimpleNamespace(key="ip_2", mac=host.mac)
        self.assertTrue(scope["is_internet_blocked"](monitor, moved))
        self.assertFalse(scope["is_internet_blocked"](monitor, SimpleNamespace(key="ip_1", mac="other")))
        await scope["async_set_internet_blocked"](monitor, moved, False)
        self.assertFalse(scope["is_internet_blocked"](monitor, moved))

    @immediate
    async def test_unknown_mac_denial_can_be_promoted(self):
        scope = methods("monitor.py", {"is_internet_blocked", "async_set_internet_blocked"},
                        {"normalize_mac": lambda mac: mac.upper() if mac else None})
        monitor = SimpleNamespace(blocked_internet=set(), _async_save=AsyncMock())
        host = SimpleNamespace(key="ip_1", mac=None)
        await scope["async_set_internet_blocked"](monitor, host, True)
        host.mac = "aa"
        self.assertTrue(scope["is_internet_blocked"](monitor, host))
        await scope["async_set_internet_blocked"](monitor, host, True)
        self.assertEqual(monitor.blocked_internet, {"AA"})

    @immediate
    async def test_failed_router_write_does_not_persist_a_success(self):
        scope = methods("coordinator.py", {"async_block_internet_access"}, {})
        host = SimpleNamespace(ip="192.168.1.2")
        coordinator = SimpleNamespace(data={"ip_1": host}, can_control_internet=lambda h: True,
            fritz_scanner=SimpleNamespace(async_set_wan_access=AsyncMock(side_effect=RuntimeError("offline"))),
            monitor=SimpleNamespace(async_set_internet_blocked=AsyncMock()))
        with self.assertRaises(RuntimeError):
            await scope["async_block_internet_access"](coordinator, "ip_1")
        coordinator.monitor.async_set_internet_blocked.assert_not_called()

    @immediate
    async def test_learning_does_not_release_manual_denial(self):
        scope = methods("coordinator.py", {"_async_apply_internet_guard"},
            {"replace": lambda host, **kw: SimpleNamespace(**(vars(host) | kw)), "perf_counter": lambda: 0})
        host = SimpleNamespace(ip="192.168.1.2", mac="AA")
        monitor = SimpleNamespace(internet_guard_initialized=True, is_learning=True,
            blocked_internet={"AA"}, is_internet_blocked=lambda h: True,
            async_trust_hosts=AsyncMock())
        router = SimpleNamespace(async_set_wan_access=AsyncMock(return_value="denied"))
        coordinator = SimpleNamespace(monitor=monitor, fritz_scanner=router,
            can_control_internet=lambda h: True, _wan_access_by_ip={}, _wan_retry_after={})
        hosts = {"ip_1":host}
        await scope["_async_apply_internet_guard"](coordinator, hosts)
        router.async_set_wan_access.assert_awaited_once_with(host.ip, False)
        self.assertTrue(hosts["ip_1"].internet_approval_required)
        self.assertEqual(monitor.async_trust_hosts.call_args.args[0], set())
