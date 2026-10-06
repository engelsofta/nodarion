"""Verify settings can finish while segment discovery is still pending."""

import ast
import asyncio
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import Mock


ROOT = Path(__file__).parents[1]


class SettingsSaveTests(unittest.IsolatedAsyncioTestCase):
    async def test_segment_application_does_not_wait_for_discovery(self):
        # Execute the actual coordinator method without requiring a HA install.
        source = (ROOT / "custom_components/nodarion/coordinator.py").read_text(encoding="utf-8")
        tree = ast.parse(source)
        method = next(
            node for node in ast.walk(tree)
            if isinstance(node, ast.AsyncFunctionDef)
            and node.name == "async_apply_network_segments"
        )
        namespace = {"normalize_network_segments": lambda values: values}
        exec(compile(ast.Module(body=[method], type_ignores=[]), source, "exec"), namespace)
        release_scan = asyncio.Event()
        scan_started = asyncio.Event()
        tasks = []

        async def refresh():
            scan_started.set()
            await release_scan.wait()

        def schedule(coroutine, name):
            task = asyncio.create_task(coroutine)
            tasks.append(task)
            return task

        segment = SimpleNamespace(ip_network="192.0.2.0/24")
        coordinator = SimpleNamespace(
            monitor=SimpleNamespace(rules={"network_segments": [segment]}),
            _configure_scanners=Mock(),
            fritz_scanner=SimpleNamespace(networks=()),
            hass=SimpleNamespace(async_create_background_task=schedule),
            async_request_refresh=refresh,
        )
        try:
            await asyncio.wait_for(namespace[method.name](coordinator), timeout=1)
            await asyncio.wait_for(scan_started.wait(), timeout=1)
            self.assertFalse(tasks[0].done())
            self.assertEqual(coordinator.fritz_scanner.networks, (segment.ip_network,))
            coordinator._configure_scanners.assert_called_once()
        finally:
            release_scan.set()
            await asyncio.gather(*tasks)
