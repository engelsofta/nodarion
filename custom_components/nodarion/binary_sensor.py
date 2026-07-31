"""Presence entities for discovered network hosts."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import NetworkCoordinator
from .models import NetworkHost
from .vendor import MacVendorLookup

ATTR_IP_ADDRESS = "ip_address"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry[NetworkCoordinator],
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up dynamically discovered host entities."""
    coordinator = entry.runtime_data
    vendor_lookup: MacVendorLookup = hass.data[DOMAIN]["vendor_lookup"]
    known: set[str] = set()

    @callback
    def async_add_new_entities() -> None:
        new = [
            NetworkHostEntity(coordinator, entry.entry_id, key, vendor_lookup)
            for key in coordinator.data
            if key not in known
        ]
        known.update(coordinator.data)
        if new:
            async_add_entities(new)
        _update_device_names(hass, entry.entry_id, coordinator.data)

    entry.async_on_unload(coordinator.async_add_listener(async_add_new_entities))
    async_add_new_entities()


@callback
def _update_device_names(
    hass: HomeAssistant, entry_id: str, hosts: dict[str, NetworkHost]
) -> None:
    """Keep integration-managed device names aligned with discovered hostnames."""
    registry = dr.async_get(hass)
    for host in hosts.values():
        device = registry.async_get_device(identifiers={(DOMAIN, host.key)})
        if (
            device is not None
            and device.name_by_user is None
            and device.name != host.display_name
        ):
            registry.async_update_device(device.id, name=host.display_name)


class NetworkHostEntity(
    CoordinatorEntity[NetworkCoordinator], BinarySensorEntity
):
    """Network presence entity."""

    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_has_entity_name = True
    _attr_name = None

    def __init__(
        self,
        coordinator: NetworkCoordinator,
        entry_id: str,
        key: str,
        vendor_lookup: MacVendorLookup,
    ) -> None:
        """Initialize a discovered host."""
        super().__init__(coordinator)
        self._key = key
        self._entry_id = entry_id
        self._vendor_lookup = vendor_lookup
        self._attr_unique_id = key
        self._last_host = coordinator.data[key]
        # Assign the ID once. It remains stable because the entity represents
        # this IP slot, not whichever physical device currently occupies it.
        self.entity_id = (
            f"binary_sensor.{coordinator.data[key].ip.replace('.', '_')}"
        )

    @property
    def host(self) -> NetworkHost:
        """Return current host data."""
        host = self.coordinator.data.get(self._key)
        if host is not None:
            self._last_host = host
        return self._last_host

    @property
    def is_on(self) -> bool:
        """Return whether the host is online."""
        return self.host.online

    @property
    def available(self) -> bool:
        """The entity remains available while the integration is healthy."""
        return (
            self.coordinator.last_update_success
            and self._key in self.coordinator.data
        )

    @property
    def device_info(self) -> dr.DeviceInfo:
        """Return device registry information."""
        host = self.host
        vendor = self._vendor_lookup.lookup(host.mac)
        return dr.DeviceInfo(
            identifiers={(DOMAIN, self._key)},
            name=host.display_name,
            manufacturer=vendor.name if vendor else "Network device",
            configuration_url=f"http://{host.ip}",
        )

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return useful discovery details."""
        host = self.host
        vendor = self._vendor_lookup.lookup(host.mac)
        return {
            "nodarion_key": self.host.key,
            ATTR_IP_ADDRESS: host.ip,
            "mac_address": host.mac,
            "mac_vendor": vendor.name if vendor else None,
            "mac_vendor_prefix": vendor.prefix if vendor else None,
            "mac_vendor_block_type": vendor.block_type if vendor else None,
            "mac_vendor_last_update": vendor.last_update if vendor else None,
            "mac_vendor_private_registration": vendor.private if vendor else None,
            "mac_local_administered": (
                self._vendor_lookup.is_locally_administered(host.mac)
                if host.mac
                else False
            ),
            "hostname": host.hostname,
            "missed_scans": host.missed_scans,
            "presence_control": (
                self._key in self.coordinator.monitor.presence_devices
            ),
            "presence_timeout_minutes": (
                self.coordinator.monitor.rules["presence_timeout_minutes"]
                if self._key in self.coordinator.monitor.presence_devices
                else None
            ),
            "detection_sources": list(host.sources),
            "access_point": host.access_point,
            "connection_type": host.connection_type,
            "wifi_band": host.wifi_band,
            "link_rate_mbps": host.link_rate_mbps,
            "link_rate_rx_mbps": host.link_rate_rx_mbps,
            "link_rate_tx_mbps": host.link_rate_tx_mbps,
            "signal_strength_percent": host.signal_strength_percent,
            "signal_strength_dbm": host.signal_strength_dbm,
            "address_source": host.address_source,
            "lease_time_remaining": host.lease_time_remaining,
            "fritzbox_model": host.fritzbox_model,
            "fritzos_version": host.fritzos_version,
            "dns_queries": host.dns_queries,
            "dns_blocked": host.dns_blocked,
            "dns_blocked_ratio": host.dns_blocked_ratio,
            "dns_last_activity": host.dns_last_activity,
            "dns_last_domain": host.dns_last_domain,
            "dns_last_blocked_domain": host.dns_last_blocked_domain,
            "dns_last_block_reason": host.dns_last_block_reason,
            "dns_last_protocol": host.dns_last_protocol,
            "dns_top_queried_domains": host.dns_top_queried_domains,
            "dns_top_blocked_domains": host.dns_top_blocked_domains,
            "dns_blocked_reasons": host.dns_blocked_reasons,
            "adguard_period_hours": host.adguard_period_hours,
            "adguard_data_complete": host.adguard_data_complete,
            "adguard_bypass_suspected": host.adguard_bypass_suspected,
            "wan_access": host.wan_access,
            "internet_approval_required": host.internet_approval_required,
            # Return an independent snapshot so a later coordinator update
            # cannot retroactively mutate attributes of an existing HA state.
            "connection_status": {
                key: dict(status)
                for key, status in self.coordinator.connection_status.items()
            },
        }
