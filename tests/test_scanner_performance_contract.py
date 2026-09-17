"""Regression checks for priority and rolling network discovery."""

from pathlib import Path
import unittest


ROOT = Path(__file__).parents[1]
SCANNER = (ROOT / "custom_components" / "nodarion" / "scanner.py").read_text(
    encoding="utf-8"
)
COORDINATOR = (
    ROOT / "custom_components" / "nodarion" / "coordinator.py"
).read_text(encoding="utf-8")
CONSTANTS = (ROOT / "custom_components" / "nodarion" / "const.py").read_text(
    encoding="utf-8"
)


class ScannerPerformanceContractTests(unittest.TestCase):
    def test_discovery_is_rolling_and_neighbor_candidates_are_prioritized(self) -> None:
        self.assertIn("discovery_batch_size: int = 32", SCANNER)
        self.assertIn("self._discovery_cursor", SCANNER)
        self.assertIn("request_full_discovery", SCANNER)
        self.assertIn("neighbor_candidates", SCANNER)
        self.assertNotIn("self._scan_number % 5", SCANNER)

    def test_important_devices_use_every_scan_and_fast_recovery(self) -> None:
        self.assertIn("self._priority_ips", SCANNER)
        self.assertIn("self.monitor.monitored | self.monitor.presence_devices", COORDINATOR)
        self.assertIn("min(self.scan_interval, 15)", COORDINATOR)
        self.assertIn('"scan_mode": "priority_recovery"', COORDINATOR)
        self.assertIn('"important_offline": important_offline_count', COORDINATOR)
        self.assertIn("DEFAULT_CONCURRENCY = 32", CONSTANTS)

    def test_probe_and_dns_work_are_learned_and_bounded(self) -> None:
        self.assertIn("self._probe_profiles", SCANNER)
        self.assertIn("self._dns_semaphore = asyncio.Semaphore(8)", SCANNER)
        self.assertIn("86400 if value else 1800", SCANNER)


if __name__ == "__main__":
    unittest.main()
