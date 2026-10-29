"""Guest WLAN writes target a verified guest service and confirm the result."""
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import Mock
from test_manual_internet import methods

class GuestSwitchTests(TestCase):
    def setup_writer(self, *, role="guest", actual=True):
        fc = SimpleNamespace(call_action=Mock(return_value={"NewX_AVM-DE_APType":role}))
        guest = SimpleNamespace(service=4, enable=Mock(), disable=Mock(), is_enabled=actual)
        hosts = SimpleNamespace(fc=fc)
        scope = methods("fritz.py", {"_set_guest_enabled"},
            {"FritzHosts":Mock(return_value=hosts), "FritzGuestWLAN":Mock(return_value=guest)})
        scanner = SimpleNamespace(address="router",user="user",password="secret",
            guest_info={"available":True,"enabled":not actual,"qr_code":"old"},
            _as_bool=bool, _get_guest_data=Mock(return_value={
                "available":True,"enabled":actual,"qr_code":"qr","clients":2}))
        return scope["_set_guest_enabled"], scanner, guest, fc

    def test_enable_confirms_router_state(self):
        write, scanner, guest, fc = self.setup_writer()
        self.assertTrue(write(scanner, True)["enabled"])
        guest.enable.assert_called_once()
        guest.disable.assert_not_called()
        fc.call_action.assert_called_once_with("WLANConfiguration4", "X_AVM-DE_GetWLANExtInfo")

    def test_disable_removes_qr_and_connected_count(self):
        write, scanner, guest, _ = self.setup_writer(actual=False)
        result = write(scanner, False)
        guest.disable.assert_called_once()
        self.assertFalse(result["enabled"])
        self.assertNotIn("qr_code", result)
        self.assertEqual(result["clients"],0)

    def test_normal_or_unknown_wlan_is_never_written(self):
        for role in ("normal", "", None):
            write, scanner, guest, _ = self.setup_writer(role=role)
            with self.assertRaises(ValueError): write(scanner, True)
            guest.enable.assert_not_called()
            guest.disable.assert_not_called()

    def test_unconfirmed_write_raises(self):
        write, scanner, guest, _ = self.setup_writer(actual=False)
        with self.assertRaises(RuntimeError): write(scanner, True)
        scanner._get_guest_data.assert_not_called()

    def test_router_permission_error_propagates(self):
        write, scanner, guest, _ = self.setup_writer()
        guest.enable.side_effect = RuntimeError("not authorized")
        with self.assertRaisesRegex(RuntimeError, "not authorized"): write(scanner, True)
        scanner._get_guest_data.assert_not_called()
