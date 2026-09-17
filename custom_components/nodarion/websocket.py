"""Live, revisioned frontend updates for the Nodarion panel."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .api_serialization import serialize_frontend_state
from .const import DOMAIN


SUBSCRIBE_TYPE = f"{DOMAIN}/subscribe"


def _sections(state: dict[str, Any]) -> dict[str, Any]:
    """Split state into independently comparable frontend sections."""
    preferences = {
        key: state[key]
        for key in (
            "monitored", "notifications", "presence_devices", "rules",
            "known_hosts", "learning", "versions",
        )
    }
    lifecycle = {
        key: state[key]
        for key in ("online_since", "offline_since", "guest_since")
    }
    status = {
        key: state[key]
        for key in (
            "summary", "ai_analysis", "connection_status", "guest_access",
        )
    }
    return {
        "participants": {"participants": state["participants"]},
        "events": {"events": state["events"]},
        "alerts": {"alerts": state["alerts"]},
        "preferences": preferences,
        "lifecycle": lifecycle,
        "status": status,
    }


@websocket_api.websocket_command(
    {vol.Required("type"): SUBSCRIBE_TYPE}
)
@websocket_api.async_response
async def websocket_subscribe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Subscribe an administrator to compact monitor patches."""
    if not connection.user.is_admin:
        connection.send_error(msg["id"], "unauthorized", "Admin access required")
        return

    domain_data = hass.data.get(DOMAIN, {})
    coordinator = domain_data.get("coordinator")
    manager = domain_data.get("monitor")
    if coordinator is None or manager is None:
        connection.send_error(msg["id"], "not_loaded", "Nodarion is not loaded")
        return

    previous: dict[str, Any] = {}
    revision = 0

    @callback
    def send_update() -> None:
        nonlocal previous, revision
        current = _sections(serialize_frontend_state(manager, coordinator))
        patch = {
            key: value
            for key, value in current.items()
            if previous.get(key) != value
        }
        if not patch:
            return
        previous = current
        revision += 1
        connection.send_event(
            msg["id"], {"revision": revision, "patch": patch}
        )

    connection.subscriptions[msg["id"]] = coordinator.async_add_listener(
        send_update
    )
    connection.send_result(msg["id"])
    send_update()


def async_register_websocket_api(hass: HomeAssistant) -> None:
    """Register the panel subscription command once."""
    marker = f"{DOMAIN}_websocket_registered"
    if hass.data.get(marker):
        return
    websocket_api.async_register_command(hass, websocket_subscribe)
    hass.data[marker] = True
