"""Security and payload regression checks for the panel API."""

from pathlib import Path
import unittest


ROOT = Path(__file__).parents[1]
API = (ROOT / "custom_components" / "nodarion" / "api.py").read_text(
    encoding="utf-8"
)
SERIALIZATION = (
    ROOT / "custom_components" / "nodarion" / "api_serialization.py"
).read_text(encoding="utf-8")
PANEL = (
    ROOT / "custom_components" / "nodarion" / "frontend" / "nodarion-panel.js"
).read_text(encoding="utf-8")


class ApiContractTests(unittest.TestCase):
    def test_read_api_rejects_non_admin_users(self) -> None:
        get_body = API[API.index("    async def get("):API.index("    async def post(")]
        self.assertIn("if not self._is_admin(request):", get_body)
        self.assertIn("Nodarion-Daten anzeigen", get_body)

    def test_connection_status_is_serialized_only_once(self) -> None:
        self.assertIn('response["connection_status"]', SERIALIZATION)
        self.assertNotIn('attributes["connection_status"]', SERIALIZATION)
        self.assertEqual(PANEL.count("this._monitor.connection_status || {}"), 2)


if __name__ == "__main__":
    unittest.main()
