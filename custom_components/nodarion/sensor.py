"""AdGuard Home statistics exposed as native Home Assistant sensors."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .adguard_status import AdGuardStatusCoordinator
from .const import DOMAIN
from .coordinator import NetworkCoordinator


@dataclass(frozen=True, kw_only=True)
class NodarionAdGuardSensorDescription(SensorEntityDescription):
    data_key: str
    entity_id_suffix: str


SENSORS = (
    NodarionAdGuardSensorDescription(key="dns_queries", translation_key="dns_queries", data_key="queries", icon="mdi:dns-outline", entity_id_suffix="dns_anfragen"),
    NodarionAdGuardSensorDescription(key="dns_blocked", translation_key="dns_blocked", data_key="blocked", icon="mdi:shield-off-outline", entity_id_suffix="dns_blockiert"),
    NodarionAdGuardSensorDescription(key="dns_blocked_ratio", translation_key="dns_blocked_ratio", data_key="blocked_ratio", native_unit_of_measurement=PERCENTAGE, icon="mdi:shield-check-outline", suggested_display_precision=1, entity_id_suffix="dns_blockquote"),
    NodarionAdGuardSensorDescription(key="safe_browsing_blocked", translation_key="safe_browsing_blocked", data_key="safe_browsing_blocked", icon="mdi:shield-bug-outline", entity_id_suffix="safe_browsing_blockiert"),
    NodarionAdGuardSensorDescription(key="safe_search_enforced", translation_key="safe_search_enforced", data_key="safe_search_enforced", icon="mdi:magnify-scan", entity_id_suffix="safe_search_aktiviert"),
    NodarionAdGuardSensorDescription(key="parental_blocked", translation_key="parental_blocked", data_key="parental_blocked", icon="mdi:account-child-outline", entity_id_suffix="jugendschutz_blockiert"),
    NodarionAdGuardSensorDescription(key="rules_count", translation_key="rules_count", data_key="rules_count", icon="mdi:filter-cog-outline", entity_registry_enabled_default=False, entity_id_suffix="aktive_filterregeln"),
    NodarionAdGuardSensorDescription(key="average_processing", translation_key="average_processing", data_key="average_processing_ms", native_unit_of_measurement=UnitOfTime.MILLISECONDS, icon="mdi:speedometer", suggested_display_precision=2, entity_id_suffix="dns_verarbeitungszeit"),
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry[NetworkCoordinator], async_add_entities: AddEntitiesCallback) -> None:
    status = entry.runtime_data.adguard_status_coordinator
    if status is None:
        return
    async_add_entities([NodarionAdGuardSensor(status, entry, item) for item in SENSORS])


class NodarionAdGuardSensor(CoordinatorEntity[AdGuardStatusCoordinator], SensorEntity):
    _attr_has_entity_name = True
    _attr_state_class = SensorStateClass.MEASUREMENT
    entity_description: NodarionAdGuardSensorDescription

    def __init__(self, coordinator: AdGuardStatusCoordinator, entry: ConfigEntry[NetworkCoordinator], description: NodarionAdGuardSensorDescription) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        # Keep the unique ID of the already released block-rate sensor so HA
        # reuses the entity registry entry instead of creating a duplicate.
        self._attr_unique_id = (
            f"{entry.entry_id}_dns_blocked_ratio"
            if description.key == "dns_blocked_ratio"
            else f"{entry.entry_id}_adguard_{description.key}"
        )
        self.entity_id = f"sensor.nodarion_{description.entity_id_suffix}"
        self._attr_device_info = _device_info(coordinator, entry.entry_id)

    @property
    def native_value(self) -> Any:
        return (self.coordinator.data or {}).get(self.entity_description.data_key)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        if self.entity_description.key != "dns_blocked_ratio":
            return None
        data = self.coordinator.data or {}
        return {key: data.get(key) for key in ("queries", "blocked", "period_hours", "data_complete", "source")}


def _device_info(coordinator: AdGuardStatusCoordinator, entry_id: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"{entry_id}_adguard")}, name="Engelsoft AdGuard",
        manufacturer="AdGuard", model="DNS-Schutz",
        sw_version=str((coordinator.data or {}).get("version") or "") or None,
        configuration_url=coordinator.scanner.base_url,
    )
