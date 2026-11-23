"""Engelsoft Nodarion integration."""

from __future__ import annotations

import asyncio
from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, Platform
from homeassistant.core import CoreState, Event, HomeAssistant, callback

from .const import (
    CONF_FRITZ_ENABLED,
    CONF_NETWORK,
    DEFAULT_NETWORK,
    DEFAULT_SEGMENT_COLOR,
    DEFAULT_SEGMENT_NAME,
    DEFAULT_SEGMENT_ROLE,
    DEFAULT_VLAN_ID,
    DOMAIN,
    FRONTEND_VERSION,
    PANEL_TITLE,
    PANEL_URL,
)
from .api import NodarionView
from .coordinator import NetworkCoordinator
from .monitor import NetworkMonitor
from .vendor import MacVendorLookup
from .services import async_register_services, async_unregister_services
from .websocket import async_register_websocket_api

PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR, Platform.SWITCH]
type HANetMonConfigEntry = ConfigEntry[NetworkCoordinator]
_STATIC_URL = "/engelsoft_nodarion"
_STARTUP_DELAY_SECONDS = 45


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
    if "network_segments" not in monitor.rules:
        await monitor.async_set_network_segments([{
            "id": "home",
            "name": DEFAULT_SEGMENT_NAME,
            "vlan_id": DEFAULT_VLAN_ID,
            "network": str(options.get(CONF_NETWORK, DEFAULT_NETWORK)),
            "role": DEFAULT_SEGMENT_ROLE,
            "color": DEFAULT_SEGMENT_COLOR,
            "monitoring": True,
        }])
    if options.get(CONF_FRITZ_ENABLED):
        await monitor.async_initialize_internet_guard()
    coordinator = NetworkCoordinator(hass, entry, monitor)
    starting = hass.state is not CoreState.running
    coordinator.startup_deferred = starting
    # Make the persisted inventory available immediately.  An active network
    # scan may take tens of seconds and must not hold up integration setup.
    # The background refresh below replaces this snapshot as soon as fresh
    # data is available.
    coordinator.async_set_updated_data(monitor.restored_hosts())

    domain_data["monitor"] = monitor
    domain_data["coordinator"] = coordinator
    if coordinator.adguard_scanner is not None:
        from .adguard_status import AdGuardStatusCoordinator

        coordinator.adguard_status_coordinator = AdGuardStatusCoordinator(
            hass, coordinator.adguard_scanner, entry
        )
        coordinator.adguard_status_coordinator.startup_deferred = starting
        coordinator.adguard_status_coordinator.retry_first_status = starting
    entry.runtime_data = coordinator

    if not domain_data.get("api_registered"):
        hass.http.register_view(NodarionView)
        domain_data["api_registered"] = True
    async_register_websocket_api(hass)
    await async_register_services(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await _async_register_panel(hass)

    async def refresh_initial_data() -> None:
        if starting:
            await asyncio.sleep(_STARTUP_DELAY_SECONDS)
        status = coordinator.adguard_status_coordinator
        if status is not None:
            status.startup_deferred = False
            await status.async_refresh()
        coordinator.startup_deferred = False
        await coordinator.async_refresh()

    @callback
    def schedule_initial_refresh(_event: Event | None = None) -> None:
        initial_refresh = hass.async_create_background_task(
            refresh_initial_data(),
            "Nodarion initial network scan",
        )
        entry.async_on_unload(initial_refresh.cancel)

    if hass.state is CoreState.running:
        schedule_initial_refresh()
    else:
        entry.async_on_unload(
            hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, schedule_initial_refresh)
        )
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HANetMonConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await entry.runtime_data.async_shutdown()
        scanner = entry.runtime_data.adguard_scanner
        if scanner is not None and hasattr(scanner, "async_close"):
            await scanner.async_close()
        await entry.runtime_data.monitor.async_shutdown()
        await async_unregister_services(hass)
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
        integration_dir = Path(__file__).parent
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(_STATIC_URL, str(integration_dir / "frontend"), False),
                StaticPathConfig(
                    f"{_STATIC_URL}_icon.png",
                    str(integration_dir / "brand" / "icon.png"),
                    False,
                ),
            ]
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
        require_admin=True,
    )
    hass.data[panel_marker] = True
