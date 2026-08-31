"""Regression checks for setup recovery and translations."""

from __future__ import annotations

import json
from pathlib import Path
import unittest


ROOT = Path(__file__).parents[1]
COMPONENT = ROOT / "custom_components" / "nodarion"
FLOW = (COMPONENT / "config_flow.py").read_text(encoding="utf-8")
COORDINATOR = (COMPONENT / "coordinator.py").read_text(encoding="utf-8")
STATUS = (COMPONENT / "adguard_status.py").read_text(encoding="utf-8")
SENSOR = (COMPONENT / "sensor.py").read_text(encoding="utf-8")
SWITCH = (COMPONENT / "switch.py").read_text(encoding="utf-8")
BINARY_SENSOR = (COMPONENT / "binary_sensor.py").read_text(encoding="utf-8")


class ConfigurationContractTests(unittest.TestCase):
    def test_connections_are_tested_before_all_configuration_writes(self) -> None:
        self.assertGreaterEqual(FLOW.count("await _async_validate_input"), 4)
        self.assertIn("async_step_reconfigure", FLOW)
        self.assertIn("async_step_reauth_confirm", FLOW)
        self.assertIn("async_update_and_abort", FLOW)
        self.assertNotIn("async_update_reload_and_abort", FLOW)
        self.assertIn("options_updates={}", FLOW)

    def test_authentication_failures_start_reauth(self) -> None:
        self.assertIn("entry.async_start_reauth(self.hass)", COORDINATOR)
        self.assertIn("entry.async_start_reauth(self.hass)", STATUS)

    def test_native_entities_use_translation_keys(self) -> None:
        self.assertNotIn('name="DNS-Anfragen"', SENSOR)
        self.assertNotIn('name="Gesamtschutz"', SWITCH)
        self.assertIn('_attr_translation_key = "presence"', BINARY_SENSOR)
        self.assertGreaterEqual(SENSOR.count("translation_key="), 8)
        self.assertGreaterEqual(SWITCH.count("translation_key="), 6)

    def test_translation_files_are_valid_and_cover_recovery_and_entities(self) -> None:
        for path in (
            COMPONENT / "strings.json",
            COMPONENT / "translations" / "de.json",
            COMPONENT / "translations" / "en.json",
        ):
            data = json.loads(path.read_text(encoding="utf-8"))
            self.assertIn("reconfigure", data["config"]["step"])
            self.assertIn("reauth_confirm", data["config"]["step"])
            self.assertIn("cannot_connect", data["config"]["error"])
            self.assertIn("invalid_auth", data["config"]["error"])
            self.assertIn("sensor", data["entity"])
            self.assertIn("switch", data["entity"])


if __name__ == "__main__":
    unittest.main()
