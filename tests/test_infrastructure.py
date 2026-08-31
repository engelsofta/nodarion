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
normalize_network_segments = _MODELS.normalize_network_segments


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

    def test_network_segments_are_normalized_and_reject_overlaps(self) -> None:
        segments = normalize_network_segments([
            {"name": "Heimnetz", "vlan_id": 10, "network": "192.168.10.7/24", "role": "trusted", "color": "#12AABB", "monitoring": True},
            {"name": "IoT", "vlan_id": 20, "network": "192.168.20.0/24", "role": "restricted", "color": "#cc8844", "monitoring": False},
        ])
        self.assertEqual(segments[0].network, "192.168.10.0/24")
        self.assertEqual(segments[0].color, "#12aabb")
        self.assertFalse(segments[1].monitoring)
        with self.assertRaises(ValueError):
            normalize_network_segments([
                {"name": "A", "vlan_id": 1, "network": "10.0.0.0/24", "role": "trusted", "color": "#000000", "monitoring": True},
                {"name": "B", "vlan_id": 2, "network": "10.0.0.128/25", "role": "trusted", "color": "#ffffff", "monitoring": True},
            ])

    def test_infrastructure_segment_role_protects_hosts(self) -> None:
        host = self.host("ordinary-device")
        host.segment_role = "infrastructure"
        self.assertTrue(is_network_infrastructure(host))


if __name__ == "__main__":
    unittest.main()
