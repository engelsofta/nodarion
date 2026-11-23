"""Coverage for physical FRITZ!Mesh links that the client table omits."""
from types import SimpleNamespace
from unittest import TestCase

from test_manual_internet import methods


class MeshTopologyTests(TestCase):
    def test_repeater_chain_and_wifi_client_track_handover(self):
        helpers = methods(
            "fritz.py",
            {
                "_mesh_snapshot", "_mesh_role", "_device_macs", "_device_name",
                "_format_mac", "_normalize_connection_type", "_wifi_band",
                "_connection_interface", "_rate_mbps",
                "_merge_max",
            },
            {"format_mac": lambda mac: str(mac).lower()},
        )
        scanner = type("Scanner", (), {key: value for key, value in helpers.items()
                                       if key.startswith("_") and key != "__builtins__"})

        def device(index, name, role):
            links = []
            return SimpleNamespace(
                name=name, mesh_role=role, mac=f"00:00:00:00:00:{index:02x}",
                links=links, get_connections=lambda: links,
            )

        def connect(source, target, medium, signal=None):
            for start, end in ((source, target), (target, source)):
                start.links.append(SimpleNamespace(
                    source=start, target=end, type=medium, state="CONNECTED",
                    cur_tx=12000 if start is source else 3000,
                    cur_rx=3000 if start is source else 12000,
                    interface_link=SimpleNamespace(rx_rcpi=signal, tx_rcpi=255),
                ))

        master = device(1, "FRITZ!Box", "MESH_MASTER")
        hall = device(2, "Flur", "MESH_SLAVE")
        attic = device(3, "Dachboden", "MESH_SLAVE")
        client = device(4, "Repeater-like laptop", "")
        wired = device(5, "Wired PC", "")
        devices = [master, hall, attic, client, wired]

        connect(master, hall, "LAN")
        connect(hall, attic, "WLAN", -71)
        connect(attic, client, "WLAN", -52)
        connect(master, wired, "LAN")
        attic.interfaces = [SimpleNamespace(name="5GHz", uid="radio")]
        attic.links[-1].interface_link.source_index = 1
        attic.links[-1].interface_link.node_interface_1_uid = "radio"
        client.links[0].interface_link.target_index = 1
        client.links[0].interface_link.node_interface_1_uid = "radio"
        before = scanner._mesh_snapshot(devices, [])
        self.assertEqual([node["name"] for node in before["nodes"]],
                         ["FRITZ!Box", "Flur", "Dachboden", "Repeater-like laptop"])
        self.assertTrue(before["nodes"][3]["client"])
        self.assertEqual(before["links"][2]["radios"]["5 GHz"], {attic.mac: 12, client.mac: 3})
        self.assertEqual([(link["medium"], link["signal"]) for link in before["links"]],
                         [("LAN", None), ("WLAN", -71), ("WLAN", -52)])
        self.assertTrue(all(node["online"] for node in before["nodes"]))

        for member in devices:
            member.links.clear()
        connect(master, hall, "LAN")
        connect(master, attic, "WLAN", -55)
        connect(hall, client, "WLAN", -60)
        after = scanner._mesh_snapshot(devices, [])
        self.assertEqual(before["nodes"], after["nodes"])
        self.assertEqual(after["links"][1]["source"], master.mac)
        self.assertEqual(after["links"][1]["target"], attic.mac)
        self.assertEqual(after["links"][1]["signal"], -55)
        self.assertEqual(after["links"][2]["source"], hall.mac)
        self.assertEqual(after["links"][2]["target"], client.mac)

        master.links.clear()
        attic.links.clear()
        hall.links.clear()
        client.links.clear()
        disconnected = scanner._mesh_snapshot(devices, [{"mac": hall.mac}])
        self.assertEqual(disconnected["links"], [])
        self.assertTrue(disconnected["nodes"][1]["online"])
        self.assertFalse(disconnected["nodes"][2]["online"])

        master.mac = "0"
        connect(master, hall, "LAN")
        without_master_mac = scanner._mesh_snapshot(devices, [])
        self.assertTrue(any(node["master"] for node in without_master_mac["nodes"]))
        self.assertIn("mesh-master", without_master_mac["links"][0].values())
