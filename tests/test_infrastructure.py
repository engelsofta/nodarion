"""Regression tests for router and mesh infrastructure detection."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
import unittest


_MODULE_PATH = (
    Path(__file__).parents[1] / "custom_components" / "nodarion" / "models.py"
)
_SPEC = importlib.util.spec_from_file_location("nodarion_models", _MODULE_PATH)
assert _SPEC is not None and _SPEC.loader is not None
_MODELS = importlib.util.module_from_spec(_SPEC)
sys.modules[_SPEC.name] = _MODELS
_SPEC.loader.exec_module(_MODELS)
NetworkHost = _MODELS.NetworkHost
is_network_infrastructure = _MODELS.is_network_infrastructure


class InfrastructureTests(unittest.TestCase):
    def host(self, hostname: str) -> NetworkHost:
        return NetworkHost("ip_1", "192.168.178.2", None, hostname, True)

    def test_avm_mesh_names_are_infrastructure(self) -> None:
        self.assertTrue(is_network_infrastructure(self.host("AVM-Router-EG")))
        self.assertTrue(is_network_infrastructure(self.host("AVM-POWERLINE-og")))
        self.assertTrue(is_network_infrastructure(self.host("FRITZ-Repeater")))

    def test_incidental_substrings_do_not_bypass_guard(self) -> None:
        self.assertFalse(is_network_infrastructure(self.host("totally-fritzbox-client")))
        self.assertFalse(is_network_infrastructure(self.host("routercontrol-pc")))

    def test_topology_result_has_priority_over_name_fallback(self) -> None:
        host = self.host("AVM-Router-EG")
        host.network_infrastructure = False
        host.infrastructure_source = "mesh_topology"
        self.assertFalse(is_network_infrastructure(host))

        host.hostname = "ordinary-device"
        host.network_infrastructure = True
        self.assertTrue(is_network_infrastructure(host))


if __name__ == "__main__":
    unittest.main()
