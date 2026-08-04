"""Direct FRITZ!Box host discovery through TR-064."""

from __future__ import annotations

import asyncio
import base64
import ipaddress
import logging
from time import monotonic
from typing import Any

from fritzconnection.lib.fritzhosts import FritzHosts
from fritzconnection.lib.fritztopology import FritzMeshTopology
from fritzconnection.lib.fritzwlan import FritzGuestWLAN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import format_mac

from .models import NetworkHost
from .const import FRITZ_DEVICE_INFO_INTERVAL_SECONDS

_LOGGER = logging.getLogger(__name__)


class FritzBoxScanner:
    """Read active network clients directly from a FRITZ!Box."""

    def __init__(
        self,
        hass: HomeAssistant,
        address: str,
        user: str,
        password: str,
        network: str,
        excluded: set[str],
    ) -> None:
        self.hass = hass
        self.address = address
        self.user = user
        self.password = password
        self.network = ipaddress.ip_network(network, strict=False)
        self.excluded = excluded
        self.available = False
        self._router_info: dict[str, str] = {}
        self._router_info_checked = 0.0
        self._scan_future: asyncio.Future[
            tuple[
                list[dict[str, Any]],
                dict[str, dict[str, Any]],
                dict[str, str],
                dict[str, Any],
            ]
        ] | None = None
        self.dhcp_start: str | None = None
        self.dhcp_end: str | None = None
        self.guest_info: dict[str, Any] = {
            "available": False,
            "enabled": False,
            "clients": 0,
        }

    async def async_scan(self) -> dict[str, NetworkHost]:
        """Return active FRITZ!Box hosts without blocking Home Assistant."""
        completed_data: tuple[
            list[dict[str, Any]],
            dict[str, dict[str, Any]],
            dict[str, str],
            dict[str, Any],
        ] | None = None
        if self._scan_future is not None and self._scan_future.done():
            try:
                completed_data = self._scan_future.result()
            except Exception as err:
                _LOGGER.debug("Late FRITZ!Box scan failed: %s", err)
            self._scan_future = None
        if self._scan_future is not None:
            self.available = False
            _LOGGER.warning("Previous FRITZ!Box scan is still running")
            return {}

        if completed_data is not None:
            raw_hosts, topology_data, router_info, guest_info = completed_data
        else:
            self._scan_future = self.hass.async_add_executor_job(
                self._get_fritz_data
            )
            try:
                async with asyncio.timeout(30):
                    raw_hosts, topology_data, router_info, guest_info = await asyncio.shield(
                        self._scan_future
                    )
            except TimeoutError:
                self.available = False
                _LOGGER.warning("FRITZ!Box scan timed out after 30 seconds")
                return {}
            except Exception as err:
                self.available = False
                _LOGGER.warning("FRITZ!Box scan failed: %s", err)
                return {}
            finally:
                if self._scan_future is not None and self._scan_future.done():
                    self._scan_future = None

        self.available = True
        self.dhcp_start = router_info.get("dhcp_start")
        self.dhcp_end = router_info.get("dhcp_end")
        self.guest_info = guest_info
        hosts: dict[str, NetworkHost] = {}
        for item in raw_hosts:
            ip = str(item.get("ip") or "").strip()
            is_guest = self._as_bool(item.get("guest"))
            if not ip or ip in self.excluded:
                continue
            try:
                if ipaddress.ip_address(ip) not in self.network and not is_guest:
                    continue
            except ValueError:
                continue
            mac = self._format_mac(item.get("mac"))
            name = str(item.get("name") or "").strip() or None
            details = topology_data.get(mac, {}) if mac else {}
            key = f"ip_{ip}"
            hosts[key] = NetworkHost(
                key=key,
                ip=ip,
                mac=mac,
                hostname=name,
                online=True,
                sources=("fritzbox",),
                access_point=details.get("access_point"),
                connection_type=(
                    details.get("connection_type")
                    or self._normalize_connection_type(item.get("interface_type"))
                ),
                wifi_band=details.get("wifi_band"),
                link_rate_mbps=(
                    details.get("link_rate_mbps")
                    or self._as_non_negative_float(item.get("guest_speed"))
                ),
                link_rate_rx_mbps=details.get("link_rate_rx_mbps"),
                link_rate_tx_mbps=details.get("link_rate_tx_mbps"),
                signal_strength_percent=(
                    details.get("signal_strength_percent")
                    or self._as_percentage(item.get("guest_signal"))
                ),
                signal_strength_dbm=details.get("signal_strength_dbm"),
                address_source=self._clean_string(item.get("address_source")),
                lease_time_remaining=self._as_non_negative_int(
                    item.get("lease_time_remaining")
                ),
                fritzbox_model=router_info.get("model"),
                fritzos_version=router_info.get("version"),
                guest_network=is_guest,
            )
        return hosts

    async def async_set_wan_access(self, ip: str, allowed: bool) -> str:
        """Allow or deny one LAN device's internet access through TR-064."""
        return await self.hass.async_add_executor_job(
            self._set_wan_access, ip, allowed
        )

    def _set_wan_access(self, ip: str, allowed: bool) -> str:
        """Run the blocking TR-064 action in the executor."""
        hosts = FritzHosts(
            address=self.address,
            user=self.user,
            password=self.password,
            timeout=5.0,
        )
        hosts.fc.call_action(
            "X_AVM-DE_HostFilter1",
            "DisallowWANAccessByIP",
            NewIPv4Address=ip,
            NewDisallow="0" if allowed else "1",
        )
        return "granted" if allowed else "denied"

    def _get_fritz_data(
        self,
    ) -> tuple[
        list[dict[str, Any]],
        dict[str, dict[str, Any]],
        dict[str, str],
        dict[str, Any],
    ]:
        hosts = FritzHosts(
            address=self.address,
            user=self.user,
            password=self.password,
            timeout=5.0,
        )
        active_hosts = hosts.get_active_hosts()
        guest_info = self._get_guest_data(hosts, active_hosts)
        if (
            monotonic() - self._router_info_checked
            >= FRITZ_DEVICE_INFO_INTERVAL_SECONDS
        ):
            self._router_info = self._get_router_info(hosts.fc)
            self._router_info_checked = monotonic()
        router_info = self._router_info
        topology_data: dict[str, dict[str, Any]] = {}
        try:
            topology = FritzMeshTopology(fc=hosts.fc)
            topology.load_topology()
            for device in topology.devices:
                connections = [
                    connection
                    for connection in device.get_connections()
                    if str(connection.state).upper() == "CONNECTED"
                ]
                for connection in connections:
                    endpoints = self._client_and_access_point(
                        connection.source, connection.target
                    )
                    if endpoints is None:
                        continue
                    client, access_point = endpoints
                    access_point_name = self._device_name(access_point)
                    connection_type = self._normalize_connection_type(
                        getattr(connection, "type", None)
                    )
                    access_point_interface = self._connection_interface(
                        connection, access_point
                    )
                    wifi_band = (
                        self._wifi_band(access_point_interface)
                        if connection_type == "WLAN"
                        else None
                    )
                    rx_rate = self._rate_mbps(
                        getattr(connection, "max_rx", None)
                    )
                    tx_rate = self._rate_mbps(
                        getattr(connection, "max_tx", None)
                    )
                    signal = (
                        self._signal_strength(connection)
                        if connection_type == "WLAN"
                        else None
                    )
                    for mac in self._device_macs(client):
                        formatted = self._format_mac(mac)
                        if formatted:
                            current = topology_data.setdefault(formatted, {})
                            if access_point_name:
                                current["access_point"] = access_point_name
                            if connection_type:
                                current["connection_type"] = connection_type
                            self._merge_band(current, wifi_band)
                            self._merge_max(
                                current, "link_rate_rx_mbps", rx_rate
                            )
                            self._merge_max(
                                current, "link_rate_tx_mbps", tx_rate
                            )
                            self._merge_max(
                                current, "signal_strength_dbm", signal
                            )
        except Exception as err:
            _LOGGER.debug("FRITZ!Box mesh topology unavailable: %s", err)
        return active_hosts, topology_data, router_info, guest_info

    def _get_guest_data(
        self, hosts: FritzHosts, active_hosts: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Annotate active hosts and return read-only guest WLAN status."""
        guest_info: dict[str, Any] = {
            "available": False,
            "enabled": False,
            "clients": 0,
        }
        guest_macs: set[str] = set()
        guest_ips: set[str] = set()
        try:
            attributes = hosts.get_hosts_attributes()
        except Exception as err:
            _LOGGER.debug("FRITZ!Box extended host list unavailable: %s", err)
        else:
            for item in attributes:
                if not self._as_bool(
                    self._item_value(item, "X_AVM-DE_Guest", "guest")
                ):
                    continue
                mac = self._format_mac(
                    self._item_value(item, "MACAddress", "mac")
                )
                ip = self._clean_string(
                    self._item_value(item, "IPAddress", "ip")
                )
                if mac:
                    guest_macs.add(mac)
                if ip:
                    guest_ips.add(ip)
                if not self._as_bool(
                    self._item_value(item, "Active", "active", "status")
                ):
                    continue
                if not any(
                    (mac and self._format_mac(host.get("mac")) == mac)
                    or (ip and str(host.get("ip") or "") == ip)
                    for host in active_hosts
                ):
                    active_hosts.append(
                        {
                            "ip": ip,
                            "mac": mac,
                            "name": self._item_value(
                                item, "HostName", "name"
                            ),
                            "status": True,
                            "interface_type": self._item_value(
                                item, "InterfaceType", "interface_type"
                            ),
                            "guest": True,
                        }
                    )

        try:
            guest = FritzGuestWLAN(fc=hosts.fc)
            guest_clients = guest.get_hosts_info()
            enabled = self._as_bool(guest.is_enabled)
            guest_info.update(
                {
                    "available": True,
                    "enabled": enabled,
                    "ssid": guest.ssid,
                    "encryption": guest.beacontype,
                    "hidden": self._as_bool(guest.is_hidden),
                }
            )
            if enabled:
                try:
                    qr_stream = guest.get_wifi_qr_code(kind="svg")
                    qr_payload = qr_stream.read()
                    if isinstance(qr_payload, str):
                        qr_payload = qr_payload.encode("utf-8")
                    guest_info["qr_code"] = (
                        "data:image/svg+xml;base64,"
                        + base64.b64encode(qr_payload).decode("ascii")
                    )
                except Exception as err:
                    _LOGGER.debug(
                        "FRITZ!Box guest WLAN QR code unavailable: %s", err
                    )
            for item in guest_clients:
                if not self._as_bool(item.get("status")):
                    continue
                mac = self._format_mac(item.get("mac"))
                ip = self._clean_string(item.get("ip"))
                if mac:
                    guest_macs.add(mac)
                if ip:
                    guest_ips.add(ip)
                existing = next(
                    (
                        host
                        for host in active_hosts
                        if (mac and self._format_mac(host.get("mac")) == mac)
                        or (ip and str(host.get("ip") or "") == ip)
                    ),
                    None,
                )
                if existing is None:
                    existing = {
                        "ip": ip,
                        "mac": mac,
                        "name": item.get("name"),
                        "status": True,
                        "interface_type": "WLAN",
                    }
                    active_hosts.append(existing)
                existing.update(
                    {
                        "guest": True,
                        "guest_signal": item.get("signal"),
                        "guest_speed": item.get("speed"),
                    }
                )

            service = str(getattr(guest, "service", "") or "")
            service_name = (
                service
                if service.startswith("WLANConfiguration")
                else f"WLANConfiguration{service}"
            )
            if service:
                extension = hosts.fc.call_action(
                    service_name, "X_AVM-DE_GetWLANExtInfo"
                )
                guest_info.update(
                    {
                        "ap_type": extension.get("NewX_AVM-DE_APType"),
                        "frequency_band": extension.get(
                            "NewX_AVM-DE_FrequencyBand"
                        ),
                        "timeout_active": self._as_bool(
                            extension.get("NewX_AVM-DE_TimeoutActive")
                        ),
                        "timeout_minutes": self._as_non_negative_int(
                            extension.get("NewX_AVM-DE_Timeout")
                        ),
                        "time_remaining_seconds": self._as_non_negative_int(
                            extension.get("NewX_AVM-DE_TimeRemain")
                        ),
                        "no_forced_off": self._as_bool(
                            extension.get("NewX_AVM-DE_NoForcedOff")
                        ),
                        "user_isolation": self._as_bool(
                            extension.get("NewX_AVM-DE_UserIsolation")
                        ),
                        "encryption_mode": extension.get(
                            "NewX_AVM-DE_EncryptionMode"
                        ),
                        "last_changed": extension.get(
                            "NewX_AVM-DE_LastChangedStamp"
                        ),
                    }
                )
        except Exception as err:
            _LOGGER.debug("FRITZ!Box guest WLAN details unavailable: %s", err)

        for item in active_hosts:
            mac = self._format_mac(item.get("mac"))
            ip = str(item.get("ip") or "").strip()
            if (mac and mac in guest_macs) or (ip and ip in guest_ips):
                item["guest"] = True
        guest_info["clients"] = sum(
            self._as_bool(item.get("guest")) for item in active_hosts
        )
        return guest_info

    @staticmethod
    def _item_value(item: dict[str, Any], *keys: str) -> Any:
        """Read a field independent of FRITZ!OS key spelling."""
        normalized = {
            "".join(character.lower() for character in str(key) if character.isalnum()): value
            for key, value in item.items()
        }
        for key in keys:
            lookup = "".join(
                character.lower() for character in key if character.isalnum()
            )
            if lookup in normalized:
                return normalized[lookup]
        return None

    @staticmethod
    def _as_bool(value: Any) -> bool:
        return str(value).strip().lower() in {"1", "true", "yes", "on", "active"}

    @staticmethod
    def _get_router_info(fc: Any) -> dict[str, str]:
        """Read product information without making host discovery depend on it."""
        result: dict[str, str] = {}
        try:
            info = fc.call_action("DeviceInfo1", "GetInfo")
        except Exception as err:
            _LOGGER.debug("FRITZ!Box device information unavailable: %s", err)
        else:
            result.update({
                "model": str(info.get("NewModelName") or "").strip(),
                "version": str(info.get("NewSoftwareVersion") or "").strip(),
            })
        try:
            address_range = fc.call_action(
                "LANHostConfigManagement1", "GetAddressRange"
            )
        except Exception as err:
            _LOGGER.debug("FRITZ!Box DHCP range unavailable: %s", err)
        else:
            result.update({
                "dhcp_start": str(
                    address_range.get("NewMinAddress") or ""
                ).strip(),
                "dhcp_end": str(
                    address_range.get("NewMaxAddress") or ""
                ).strip(),
            })
        return result

    @classmethod
    def _client_and_access_point(
        cls, source: Any, target: Any
    ) -> tuple[Any, Any] | None:
        """Orient a possibly mirrored topology edge using device roles."""
        source_infrastructure = cls._is_infrastructure(source)
        target_infrastructure = cls._is_infrastructure(target)
        if source_infrastructure and not target_infrastructure:
            return target, source
        if target_infrastructure and not source_infrastructure:
            return source, target
        if not source_infrastructure and not target_infrastructure:
            return None

        # Links between two mesh components do not describe an end-client.
        # Only the master role gives us an unambiguous parent direction.
        source_role = cls._mesh_role(source)
        target_role = cls._mesh_role(target)
        if "master" in source_role and "master" not in target_role:
            return target, source
        if "master" in target_role and "master" not in source_role:
            return source, target
        return None

    @classmethod
    def _is_infrastructure(cls, device: Any) -> bool:
        """Return whether a topology node routes or repeats network traffic."""
        role = cls._mesh_role(device)
        if any(
            marker in role
            for marker in ("master", "slave", "repeater", "agent", "controller")
        ):
            return True
        description = " ".join(
            str(getattr(device, attribute, "") or "")
            for attribute in (
                "device_type",
                "device_model",
                "device_name",
                "model",
                "name",
            )
        ).lower()
        return any(
            marker in description
            for marker in (
                "fritz!box",
                "fritz!repeater",
                "powerline",
                "access point",
                "access-point",
                "router",
                "repeater",
                "wlan bridge",
            )
        )

    @staticmethod
    def _mesh_role(device: Any) -> str:
        """Normalize role variants used by different FRITZ!OS releases."""
        value = (
            getattr(device, "mesh_role", None)
            or getattr(device, "role", None)
            or ""
        )
        return "".join(
            character
            for character in str(value).lower()
            if character.isalnum()
        )

    @staticmethod
    def _device_name(device: Any) -> str | None:
        """Return the best display name for one topology device."""
        return (
            getattr(device, "device_name", None)
            or getattr(device, "device_model", None)
            or getattr(device, "name", None)
            or getattr(device, "model", None)
            or getattr(device, "device_mac_address", None)
            or getattr(device, "mac_address", None)
        )

    @staticmethod
    def _device_macs(device: Any) -> set[str]:
        """Return device and interface MAC addresses used by host entries."""
        macs = {
            getattr(device, "device_mac_address", None),
            getattr(device, "mac_address", None),
            getattr(device, "mac", None),
        }
        for interface in (getattr(device, "interfaces", ()) or ()):
            macs.add(
                getattr(interface, "mac_address", None)
                or getattr(interface, "mac", None)
            )
        return {mac for mac in macs if mac}

    @staticmethod
    def _connection_interface(connection: Any, device: Any) -> Any | None:
        """Return the device interface participating in a topology edge."""
        link = getattr(connection, "interface_link", None)
        if link is None:
            return None
        if device is getattr(connection, "source", None):
            index = getattr(link, "source_index", None)
        else:
            index = getattr(link, "target_index", None)
        uid = getattr(link, f"node_interface_{index}_uid", None)
        return next(
            (
                interface
                for interface in (getattr(device, "interfaces", ()) or ())
                if getattr(interface, "uid", None) == uid
            ),
            None,
        )

    @classmethod
    def _wifi_band(cls, interface: Any) -> str | None:
        """Derive the human-readable radio band from topology information."""
        if interface is None:
            return None
        channel_info = getattr(interface, "current_channel_info", None)
        if isinstance(channel_info, dict):
            frequency = channel_info.get("primary_freq")
            try:
                mhz = float(frequency)
                if mhz > 100_000:
                    mhz /= 1_000
                if 2_300 <= mhz < 2_600:
                    return "2,4 GHz"
                if 4_900 <= mhz < 5_925:
                    return "5 GHz"
                if 5_925 <= mhz < 7_200:
                    return "6 GHz"
            except (TypeError, ValueError):
                pass
        description = " ".join(
            str(getattr(interface, attribute, "") or "")
            for attribute in ("name", "type")
        ).upper()
        if any(marker in description for marker in ("2GHZ", "2.4GHZ", "2,4GHZ")):
            return "2,4 GHz"
        if "6GHZ" in description:
            return "6 GHz"
        if "5GHZ" in description:
            return "5 GHz"
        return None

    @staticmethod
    def _signal_strength(connection: Any) -> int | None:
        """Return the signal measured by the access point, if supplied."""
        link = getattr(connection, "interface_link", None)
        if link is None:
            return None
        # The caller orients the connection as client -> access point.
        client_index = getattr(link, "source_index", None)
        attribute = "tx_rcpi" if client_index == 1 else "rx_rcpi"
        value = getattr(link, attribute, None)
        if value is None:
            value = getattr(link, "signal_strength", None)
        try:
            signal = int(value)
        except (TypeError, ValueError):
            return None
        return None if signal == 255 else signal

    @staticmethod
    def _normalize_connection_type(value: Any) -> str | None:
        raw = str(value or "").strip()
        normalized = raw.upper()
        if not normalized:
            return None
        if any(marker in normalized for marker in ("WLAN", "WI-FI", "WIFI", "802.11")):
            return "WLAN"
        if any(marker in normalized for marker in ("PLC", "POWERLINE", "HOMEPLUG")):
            return "Powerline"
        if any(marker in normalized for marker in ("LAN", "ETHERNET")):
            return "LAN"
        return raw

    @staticmethod
    def _rate_mbps(value: Any) -> float | None:
        try:
            rate = float(value)
        except (TypeError, ValueError):
            return None
        if rate < 0:
            return None
        return round(rate / 1_000, 1)

    @staticmethod
    def _merge_max(
        target: dict[str, Any], key: str, value: float | int | None
    ) -> None:
        if value is not None and (target.get(key) is None or value > target[key]):
            target[key] = value

    @staticmethod
    def _merge_band(target: dict[str, Any], value: str | None) -> None:
        if not value:
            return
        bands = set(str(target.get("wifi_band") or "").split(" / "))
        bands.discard("")
        bands.add(value)
        order = {"2,4 GHz": 0, "5 GHz": 1, "6 GHz": 2}
        target["wifi_band"] = " / ".join(
            sorted(bands, key=lambda band: order.get(band, 99))
        )

    @staticmethod
    def _clean_string(value: Any) -> str | None:
        return str(value).strip() if value is not None and str(value).strip() else None

    @staticmethod
    def _as_non_negative_int(value: Any) -> int | None:
        try:
            result = int(value)
        except (TypeError, ValueError):
            return None
        return result if result >= 0 else None

    @staticmethod
    def _as_non_negative_float(value: Any) -> float | None:
        try:
            result = float(value)
        except (TypeError, ValueError):
            return None
        return round(result, 1) if result >= 0 else None

    @staticmethod
    def _as_percentage(value: Any) -> int | None:
        try:
            result = int(value)
        except (TypeError, ValueError):
            return None
        return max(0, min(100, result))


    @staticmethod
    def _format_mac(value: Any) -> str | None:
        if not value:
            return None
        try:
            return format_mac(str(value))
        except ValueError:
            return str(value)
