"""Compact serialization for the administrator-only panel API."""

from __future__ import annotations

from dataclasses import asdict
from typing import TYPE_CHECKING, Any

from .const import FRONTEND_VERSION, INTEGRATION_VERSION

if TYPE_CHECKING:
    from .coordinator import NetworkCoordinator
    from .monitor import NetworkMonitor


def serialize_frontend_state(
    manager: NetworkMonitor,
    coordinator: NetworkCoordinator | None,
) -> dict[str, Any]:
    """Return monitor state and live participants without repeated metadata."""
    response = manager.as_dict()
    response["versions"] = {
        "integration": INTEGRATION_VERSION,
        "frontend": FRONTEND_VERSION,
    }
    response["connection_status"] = (
        {
            key: dict(status)
            for key, status in coordinator.connection_status.items()
        }
        if coordinator is not None
        else {}
    )
    response["guest_access"] = (
        dict(coordinator.fritz_scanner.guest_info)
        if coordinator is not None and coordinator.fritz_scanner is not None
        else {"available": False, "enabled": False, "clients": 0}
    )
    participants = []
    if coordinator is not None and coordinator.data:
        for host in coordinator.data.values():
            attributes = asdict(host)
            attributes["nodarion_key"] = host.key
            attributes["ip_address"] = host.ip
            attributes["mac_address"] = host.mac
            attributes["detection_sources"] = list(host.sources)
            attributes["trusted"] = manager.is_trusted(host)
            attributes["trust_status"] = manager.trust_status(host)
            participants.append(
                {
                    "entity_id": f"binary_sensor.{host.ip.replace('.', '_')}",
                    "state": "on" if host.online else "off",
                    "last_changed": None,
                    "last_updated": None,
                    "attributes": attributes,
                }
            )
    response["participants"] = participants
    return response
