"""AdGuard Home protection controls exposed as switches."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.switch import SwitchEntity, SwitchEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .adguard_status import AdGuardStatusCoordinator
from .coordinator import NetworkCoordinator
from .sensor import _device_info


@dataclass(frozen=True, kw_only=True)
class NodarionAdGuardSwitchDescription(SwitchEntityDescription):
    entity_id_suffix: str


SWITCHES = (
    NodarionAdGuardSwitchDescription(key="protection", translation_key="protection", icon="mdi:shield-check-outline", entity_id_suffix="adguard_gesamtschutz"),
    NodarionAdGuardSwitchDescription(key="filtering", translation_key="filtering", icon="mdi:filter-outline", entity_id_suffix="adguard_dns_filterung"),
    NodarionAdGuardSwitchDescription(key="safe_browsing", translation_key="safe_browsing", icon="mdi:shield-bug-outline", entity_id_suffix="adguard_safe_browsing"),
    NodarionAdGuardSwitchDescription(key="parental", translation_key="parental", icon="mdi:account-child-outline", entity_id_suffix="adguard_jugendschutz"),
    NodarionAdGuardSwitchDescription(key="safe_search", translation_key="safe_search", icon="mdi:magnify-scan", entity_id_suffix="adguard_safe_search"),
    NodarionAdGuardSwitchDescription(key="query_log", translation_key="query_log", icon="mdi:text-box-search-outline", entity_id_suffix="adguard_query_log"),
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry[NetworkCoordinator], async_add_entities: AddEntitiesCallback) -> None:
    status = entry.runtime_data.adguard_status_coordinator
    if status is None:
        return
    async_add_entities([NodarionAdGuardSwitch(status, entry, item) for item in SWITCHES])


class NodarionAdGuardSwitch(CoordinatorEntity[AdGuardStatusCoordinator], SwitchEntity):
    _attr_has_entity_name = True
    entity_description: NodarionAdGuardSwitchDescription

    def __init__(self, coordinator: AdGuardStatusCoordinator, entry: ConfigEntry[NetworkCoordinator], description: NodarionAdGuardSwitchDescription) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{entry.entry_id}_adguard_{description.key}"
        self.entity_id = f"switch.nodarion_{description.entity_id_suffix}"
        self._attr_device_info = _device_info(coordinator, entry.entry_id)

    @property
    def is_on(self) -> bool:
        return bool((self.coordinator.data or {}).get(self.entity_description.key))

    async def _async_set(self, enabled: bool) -> None:
        await self.coordinator.scanner.async_set_feature(self.entity_description.key, enabled)
        await self.coordinator.async_request_refresh()

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._async_set(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._async_set(False)
