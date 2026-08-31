"""Regression checks for persistence batching."""

from pathlib import Path
import unittest


ROOT = Path(__file__).parents[1]
MONITOR = (ROOT / "custom_components" / "nodarion" / "monitor.py").read_text(
    encoding="utf-8"
)
STORAGE = (
    ROOT / "custom_components" / "nodarion" / "monitor_storage.py"
).read_text(encoding="utf-8")
INIT = (ROOT / "custom_components" / "nodarion" / "__init__.py").read_text(
    encoding="utf-8"
)


class StorageContractTests(unittest.TestCase):
    def test_scan_changes_are_debounced_but_manual_changes_default_to_immediate(self) -> None:
        self.assertIn("await self._async_save(immediate=False)", MONITOR)
        self.assertIn("immediate: bool = True", MONITOR)
        self.assertIn("self._async_delayed_write()", STORAGE)

    def test_pending_data_is_flushed_during_unload(self) -> None:
        self.assertIn("async def async_shutdown", MONITOR)
        self.assertIn("monitor.async_shutdown()", INIT)


if __name__ == "__main__":
    unittest.main()
