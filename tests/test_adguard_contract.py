"""Regression checks for AdGuard Home request compatibility."""

from pathlib import Path
import unittest


ROOT = Path(__file__).parents[1]
ADGUARD = (ROOT / "custom_components" / "nodarion" / "adguard.py").read_text(
    encoding="utf-8"
)
SENSOR = (ROOT / "custom_components" / "nodarion" / "sensor.py").read_text(
    encoding="utf-8"
)
SWITCH = (ROOT / "custom_components" / "nodarion" / "switch.py").read_text(
    encoding="utf-8"
)


class AdGuardContractTests(unittest.TestCase):
    def test_adguard_entities_share_the_engelsoft_adguard_device(self) -> None:
        self.assertIn('name="Engelsoft AdGuard"', SENSOR)
        self.assertIn('identifiers={(DOMAIN, f"{entry_id}_adguard")}', SENSOR)
        self.assertIn("_device_info(coordinator, entry.entry_id)", SENSOR)
        self.assertIn("_device_info(coordinator, entry.entry_id)", SWITCH)

    def test_bodyless_endpoints_do_not_receive_a_json_content_type(self) -> None:
        self.assertIn('if payload is not None:', ADGUARD)
        self.assertIn('request_kwargs["json"] = payload', ADGUARD)
        self.assertNotIn('json=payload,', ADGUARD)

    def test_feature_toggles_retry_with_json_when_media_type_is_required(self) -> None:
        self.assertIn('if err.status != 415:', ADGUARD)
        self.assertIn('await self._async_request("POST", path, {})', ADGUARD)


if __name__ == "__main__":
    unittest.main()
