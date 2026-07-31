"""Engelsoft Nodarion integration."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import (
    CONF_FRITZ_ENABLED,
    DOMAIN,
    FRONTEND_VERSION,
    PANEL_TITLE,
    PANEL_URL,
)
from .api import NodarionView
from .coordinator import NetworkCoordinator
from .monitor import NetworkMonitor
from .vendor import MacVendorLookup

PLATFORMS = [Platform.BINARY_SENSOR]
type HANetMonConfigEntry = ConfigEntry[NetworkCoordinator]
_STATIC_URL = "/engelsoft_nodarion"


async def async_setup_entry(hass: HomeAssistant, entry: HANetMonConfigEntry) -> bool:
    """Set up Engelsoft Nodarion from a config entry."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if "vendor_lookup" not in domain_data:
        domain_data["vendor_lookup"] = await hass.async_add_executor_job(
            MacVendorLookup.load
        )
    monitor = NetworkMonitor(hass)
    await monitor.async_load()
    options = {**entry.data, **entry.options}
    if options.get(CONF_FRITZ_ENABLED):
        await monitor.async_initialize_internet_guard()
    domain_data["monitor"] = monitor
    if not domain_data.get("api_registered"):
        hass.http.register_view(NodarionView)
        domain_data["api_registered"] = True
    await _async_register_panel(hass)
    coordinator = NetworkCoordinator(hass, entry, monitor)
    domain_data["coordinator"] = coordinator
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HANetMonConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        frontend.async_remove_panel(hass, PANEL_URL)
        hass.data.pop(f"{DOMAIN}_panel_registered", None)
        hass.data.get(DOMAIN, {}).pop("monitor", None)
        hass.data.get(DOMAIN, {}).pop("coordinator", None)
    return unloaded


async def _async_reload_entry(
    hass: HomeAssistant, entry: HANetMonConfigEntry
) -> None:
    """Reload after options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Register the Engelsoft Nodarion sidebar panel and its static assets."""
    panel_marker = f"{DOMAIN}_panel_registered"
    static_marker = f"{DOMAIN}_static_registered"
    if hass.data.get(panel_marker):
        return

    if not hass.data.get(static_marker):
        panel_dir = Path(__file__).parent / "frontend"
        await hass.http.async_register_static_paths(
            [StaticPathConfig(_STATIC_URL, str(panel_dir), False)]
        )
        hass.data[static_marker] = True

    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon="mdi:shield-search",
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "engelsoft-nodarion-panel",
                "module_url": (
                    f"{_STATIC_URL}/nodarion-panel.js?v={FRONTEND_VERSION}"
                ),
                "embed_iframe": False,
                "trust_external_script": False,
            }
        },
        require_admin=False,
    )
    hass.data[panel_marker] = True
