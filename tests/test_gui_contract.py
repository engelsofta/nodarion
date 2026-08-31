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
        self.assertIn('aria-label="Zurück zur vorherigen Ansicht"', PANEL)

    def test_every_settings_group_has_contextual_modal_help(self) -> None:
        for help_key in (
            "basics", "vlans", "onboarding", "guest", "cleanup", "devices",
            "presence", "quiet", "checks", "notifications", "targets",
            "adguard", "ai",
        ):
            self.assertIn(f'data-settings-help="{help_key}"', PANEL)
            self.assertIn(f'{help_key}:[', PANEL)

    def test_frontend_module_uses_matching_cache_version(self) -> None:
        const_source = (
            ROOT / "custom_components" / "nodarion" / "const.py"
        ).read_text(encoding="utf-8")
        self.assertIn('FRONTEND_VERSION = "1.28.1"', const_source)
        self.assertIn('internet-status.mjs?v=1.28.1', PANEL)

    def test_light_and_dark_settings_share_contrast_tokens(self) -> None:
        for token in (
            "--ns-text:",
            "--ns-muted:",
            "--ns-surface:",
            "--ns-field:",
        ):
            self.assertGreaterEqual(PANEL.count(token), 2)
        self.assertIn("Shared settings design", PANEL)
        self.assertIn('.settings-view .adguard-feature strong { color:#302b26; }', PANEL)
        self.assertIn('.adguard-stat strong,', PANEL)

    def test_light_column_picker_has_explicit_contrast_styles(self) -> None:
        self.assertIn(':host([data-theme="light"]) .column-picker label { color:#423c35; }', PANEL)
        self.assertIn(':host([data-theme="light"]) .column-picker-head { color:#302b26;', PANEL)
        self.assertIn(':host([data-theme="light"]) .column-picker-close {', PANEL)

    def test_light_theme_covers_secondary_controls_and_modals(self) -> None:
        for selector in (
            '.confirm-dialog {',
            '.settings-dirty {',
            '.advanced-settings > summary {',
            '.vlan-add,',
            '.filter-chip,',
            '.log-clear,',
        ):
            self.assertIn(f':host([data-theme="light"]) {selector}', PANEL)

    def test_dns_metric_opens_the_native_sensor_dialog(self) -> None:
        self.assertIn('this._hass.states["sensor.nodarion_dns_blockquote"]', PANEL)
        self.assertIn('class="metric-note metric-entity-link"', PANEL)
        self.assertIn('detail: { entityId: entityIdLink.dataset.entityId }', PANEL)

    def test_metric_gears_open_contextual_settings_without_secondary_tabs(self) -> None:
        for section in ("devices", "rules", "notifications", "dns", "ai-maintenance"):
            self.assertIn(f'data-settings-section="{section}"', PANEL)
        self.assertIn('class="metric-settings"', PANEL)
        self.assertNotIn('class="settings-tabs"', PANEL)
        self.assertNotIn('data-settings-tab=', PANEL)

    def test_presence_settings_live_in_monitoring_settings(self) -> None:
        general_panel = PANEL.index('data-settings-panel="general"')
        rules_panel = PANEL.index('data-settings-panel="rules"')
        presence_settings = PANEL.index('class="rule-group presence-settings"')
        notifications_panel = PANEL.index('data-settings-panel="notifications"')
        self.assertNotIn("presence-settings", PANEL[general_panel:rules_panel])
        self.assertLess(rules_panel, presence_settings)
        self.assertLess(presence_settings, notifications_panel)

    def test_vlan_configuration_and_device_column_are_connected(self) -> None:
        general_panel = PANEL.index('data-settings-panel="general"')
        devices_panel = PANEL.index('data-settings-panel="devices"')
        vlan_settings = PANEL.index('class="rule-group vlan-settings"')
        self.assertLess(general_panel, vlan_settings)
        self.assertLess(vlan_settings, devices_panel)
        for field in ("name", "vlan_id", "network", "role", "color", "monitoring"):
            self.assertIn(f'data-segment-field="{field}"', PANEL)
        self.assertIn('data-column="vlan"', PANEL)
        self.assertIn('"vlan-device-row"', PANEL)
        self.assertIn('--vlan-color:', PANEL)

    def test_internal_markers_stay_left_and_vlan_colours_move_right(self) -> None:
        self.assertIn("tbody tr.guest-row td:first-child", PANEL)
        self.assertIn("tbody tr.onboarding-row td:first-child", PANEL)
        self.assertIn("tbody tr.vlan-device-row td:last-child", PANEL)
        self.assertNotIn("tbody tr.vlan-device-row td:first-child", PANEL)
        self.assertIn('attr.guest_network ? "Gerät im Gastnetz"', PANEL)
        self.assertIn('lifecycle === "onboarding" ? "Gerät im DHCP-Einrichtungsbereich"', PANEL)

    def test_adguard_management_is_not_exposed_in_dns_settings(self) -> None:
        self.assertIn('this._activeTab === "settings" && this._settingsTab === "dns"', PANEL)
        self.assertIn('class="rule-group adguard-control-settings"', PANEL)
        self.assertNotIn('class="adguard-configuration-settings"', PANEL)
        self.assertNotIn('settings-adguard-config', PANEL)
        self.assertNotIn('adguard-add-filter', PANEL)
        self.assertNotIn('adguard-add-rule', PANEL)
        self.assertNotIn('adguard-add-rewrite', PANEL)
        self.assertNotIn('class="dns-open-configuration"', PANEL)
        self.assertNotIn('class="dns-action adguard-config-open"', PANEL)
        self.assertNotIn('class="adguard-modal-backdrop"', PANEL)

    def test_adguard_stats_live_above_dns_log_not_in_settings(self) -> None:
        dns_live = PANEL.index('AdGuard DNS-Live</h2>')
        dns_stats = PANEL.index('<section class="dns-live-stats"')
        dns_toolbar = PANEL.index('<div class="dns-toolbar"')
        dns_settings = PANEL.index('data-settings-panel="dns"')
        self.assertLess(dns_live, dns_stats)
        self.assertLess(dns_stats, dns_toolbar)
        self.assertNotIn("adguard-stat-settings", PANEL[dns_settings:])

    def test_disabled_save_button_only_waits_while_actually_saving(self) -> None:
        self.assertIn('.save-rules:disabled { cursor:not-allowed; }', PANEL)
        self.assertIn('.save-rules.busy:disabled { cursor:wait; }', PANEL)

    def test_advanced_settings_keep_their_open_state(self) -> None:
        self.assertIn('this._openSettingsDetails = new Set()', PANEL)
        self.assertIn('details.advanced-settings', PANEL)
        self.assertIn('this._openSettingsDetails.add(key)', PANEL)


if __name__ == "__main__":
    unittest.main()
