"""Tests for bounded scanner scheduling."""

from __future__ import annotations

import asyncio
import importlib.util
from pathlib import Path
import sys
import types
import unittest


ROOT = Path(__file__).parents[1]
MODULE_PATH = ROOT / "custom_components" / "nodarion" / "scan_batches.py"
SPEC = importlib.util.spec_from_file_location("nodarion_scan_batches", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)
async_batched_map = MODULE.async_batched_map


class ScannerBatchTests(unittest.IsolatedAsyncioTestCase):
    async def test_batched_map_never_exceeds_the_batch_size(self) -> None:
        active = 0
        maximum = 0

        async def worker(value: int) -> int:
            nonlocal active, maximum
            active += 1
            maximum = max(maximum, active)
            await asyncio.sleep(0)
            active -= 1
            return value * 2

        result = await async_batched_map(list(range(17)), worker, 4)
        self.assertEqual(result, [value * 2 for value in range(17)])
        self.assertLessEqual(maximum, 4)


if __name__ == "__main__":
    unittest.main()
