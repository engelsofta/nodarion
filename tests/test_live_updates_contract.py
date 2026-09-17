"""Regression checks for revisioned panel updates."""

from pathlib import Path
import unittest


ROOT = Path(__file__).parents[1]
COMPONENT = ROOT / "custom_components" / "nodarion"
WEBSOCKET = (COMPONENT / "websocket.py").read_text(encoding="utf-8")
STATE = (COMPONENT / "frontend" / "nodarion-state.mjs").read_text(encoding="utf-8")
PANEL = (COMPONENT / "frontend" / "nodarion-panel.js").read_text(encoding="utf-8")


class LiveUpdateContractTests(unittest.TestCase):
    def test_backend_emits_only_changed_sections(self) -> None:
        self.assertIn('SUBSCRIBE_TYPE = f"{DOMAIN}/subscribe"', WEBSOCKET)
        self.assertIn("if previous.get(key) != value", WEBSOCKET)
        self.assertIn('"patch": patch', WEBSOCKET)

    def test_frontend_uses_subscription_with_rest_fallback(self) -> None:
        self.assertIn('type: "nodarion/subscribe"', STATE)
        self.assertIn('callApi("GET", "nodarion/monitor")', STATE)
        self.assertNotIn("Date.now() - this._lastMonitorLoad > 10000", PANEL)

    def test_rendering_is_section_aware(self) -> None:
        self.assertIn("_render(changed = null)", PANEL)
        self.assertIn('changed.has("participants")', PANEL)
        self.assertIn('changed.has("events")', PANEL)
        self.assertIn('changed.has("status")', PANEL)
        self.assertNotIn("JSON.stringify(entity.attributes)", PANEL)


if __name__ == "__main__":
    unittest.main()
