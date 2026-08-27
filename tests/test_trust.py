"""Regression tests for identity and trust decisions."""

from __future__ import annotations

import importlib.util
from datetime import timedelta
from pathlib import Path
import unittest

_MODULE_PATH = (
    Path(__file__).parents[1] / "custom_components" / "nodarion" / "trust.py"
)
_SPEC = importlib.util.spec_from_file_location("nodarion_trust", _MODULE_PATH)
assert _SPEC is not None and _SPEC.loader is not None
_TRUST = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(_TRUST)
IdentityChangeTracker = _TRUST.IdentityChangeTracker
has_upnp_error_code = _TRUST.has_upnp_error_code
is_configured_router = _TRUST.is_configured_router
is_vpn_connection = _TRUST.is_vpn_connection
is_trusted_identity = _TRUST.is_trusted_identity
should_prune_offline = _TRUST.should_prune_offline


class TrustTests(unittest.TestCase):
    def test_vpn_entries_are_identified_without_matching_normal_hosts(self) -> None:
        self.assertTrue(is_vpn_connection("VPN", "Notebook", None))
        self.assertTrue(is_vpn_connection(None, "vpnOD", None))
        self.assertTrue(
            is_vpn_connection(None, "vpnOD", "00:00:00:00:00:00")
        )
        self.assertTrue(is_vpn_connection("IPSec", "Notebook", None))
        self.assertFalse(
            is_vpn_connection("LAN", "vpn-server", "AA:BB:CC:DD:EE:FF")
        )

    def test_fritz_action_not_allowed_is_recognized_by_code(self) -> None:
        error = (
            "UPnPError: errorCode: 880 errorDescription: "
            "Action is not allowed for this device"
        )
        self.assertTrue(has_upnp_error_code(error, 880))
        self.assertFalse(has_upnp_error_code(error, 714))

    def test_trusted_mac_survives_ip_change(self) -> None:
        self.assertTrue(
            is_trusted_identity(
                "ip_192.168.178.99",
                "AA:BB:CC:DD:EE:FF",
                set(),
                {"AA:BB:CC:DD:EE:FF"},
            )
        )

    def test_mac_change_needs_two_equal_observations(self) -> None:
        tracker = IdentityChangeTracker(confirmations=2)
        self.assertFalse(tracker.observe("ip_1", "AA:00:00:00:00:01", "BB:00:00:00:00:02"))
        self.assertTrue(tracker.observe("ip_1", "AA:00:00:00:00:01", "BB:00:00:00:00:02"))

    def test_different_candidate_restarts_confirmation(self) -> None:
        tracker = IdentityChangeTracker(confirmations=2)
        self.assertFalse(tracker.observe("ip_1", "AA:00:00:00:00:01", "BB:00:00:00:00:02"))
        self.assertFalse(tracker.observe("ip_1", "AA:00:00:00:00:01", "CC:00:00:00:00:03"))

    def test_hostname_substring_does_not_bypass_guard(self) -> None:
        self.assertFalse(
            is_configured_router(
                "192.168.178.50", "totally-fritzbox-client", "fritz.box"
            )
        )
        self.assertTrue(
            is_configured_router("192.168.178.1", "fritz.box", "fritz.box")
        )

    def test_ten_days_does_not_reach_thirty_day_retention(self) -> None:
        self.assertFalse(should_prune_offline(timedelta(days=10), 30))

    def test_retention_disabled_never_prunes(self) -> None:
        self.assertFalse(should_prune_offline(timedelta(days=365), 0))

    def test_presence_and_monitored_devices_are_retained(self) -> None:
        self.assertFalse(
            should_prune_offline(timedelta(days=31), 30, monitored=True)
        )
        self.assertFalse(
            should_prune_offline(timedelta(days=31), 30, presence=True)
        )


if __name__ == "__main__":
    unittest.main()
