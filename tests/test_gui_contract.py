"""Regression checks for the simplified frontend contract."""

from pathlib import Path
import unittest


ROOT = Path(__file__).parents[1]
PANEL = (
    ROOT / "custom_components" / "nodarion" / "frontend" / "nodarion-panel.js"
).read_text(encoding="utf-8")


class GuiContractTests(unittest.TestCase):
    def test_exempt_connections_never_offer_approval(self) -> None:
        self.assertIn("&& !vpnConnection", PANEL)
        self.assertIn("&& !attr.guest_network", PANEL)
        self.assertIn("&& !networkInfrastructure", PANEL)

    def test_progressive_settings_and_safe_cleanup_exist(self) -> None:
        self.assertIn('data-depends-on="onboarding_enabled"', PANEL)
        self.assertIn('data-depends-on="guest_monitoring_enabled"', PANEL)
        self.assertIn('data-forget="false"', PANEL)
        self.assertIn('data-forget="true"', PANEL)

    def test_mobile_device_details_are_collapsible(self) -> None:
        self.assertIn("mobile-expanded", PANEL)
        self.assertIn("mobile-details", PANEL)

    def test_device_state_time_survives_home_assistant_restart(self) -> None:
        self.assertIn("this._monitor.online_since?.[key]", PANEL)
        self.assertIn("this._monitor.offline_since?.[key]", PANEL)
        self.assertLess(
            PANEL.index("this._monitor.online_since?.[key]"),
            PANEL.index("entity.last_changed", PANEL.index("const stateChanged")),
        )

    def test_special_devices_use_icon_colour_without_category_badges(self) -> None:
        self.assertIn(".device-icon.vpn", PANEL)
        self.assertIn(".device-icon.guest", PANEL)
        self.assertIn(".device-icon.router", PANEL)
        self.assertNotIn("device-category", PANEL)
        self.assertNotIn("guest-badge", PANEL)
        self.assertIn('typeof attr.network_infrastructure === "boolean"', PANEL)
        self.assertIn("deviceIconTitle(entity)", PANEL)
        self.assertNotIn("Automatisch erkannter Gerätetyp", PANEL)

    def test_internet_filter_uses_current_status_values(self) -> None:
        self.assertIn('customFilter("internet"', PANEL)
        self.assertIn("internetCounts", PANEL)
        self.assertNotIn('filterInput("internet"', PANEL)

    def test_table_filters_and_settings_are_progressively_enhanced(self) -> None:
        self.assertIn('customFilter("connection"', PANEL)
        self.assertIn('customFilter("address"', PANEL)
        self.assertIn('customFilter("source"', PANEL)
        self.assertIn('data-clear-all-filters', PANEL)
        self.assertIn('class="settings-dirty"', PANEL)
        self.assertIn('class="advanced-settings"', PANEL)

    def test_dialogs_and_keyboard_navigation_are_accessible(self) -> None:
        self.assertNotIn("window.confirm", PANEL)
        self.assertNotIn("window.alert", PANEL)
        self.assertIn('role="alertdialog"', PANEL)
        self.assertIn('aria-live="polite"', PANEL)
        self.assertIn('"ArrowLeft", "ArrowRight", "Home", "End"', PANEL)

    def test_frontend_module_uses_matching_cache_version(self) -> None:
        const_source = (
            ROOT / "custom_components" / "nodarion" / "const.py"
        ).read_text(encoding="utf-8")
        self.assertIn('FRONTEND_VERSION = "1.26.26"', const_source)
        self.assertIn('internet-status.mjs?v=1.26.26', PANEL)


if __name__ == "__main__":
    unittest.main()
