"""Data models for Engelsoft Nodarion."""

from __future__ import annotations

from dataclasses import dataclass
import ipaddress
import re
from typing import Any


SEGMENT_ROLES = {"trusted", "restricted", "guest", "isolated", "infrastructure"}
DEFAULT_SEGMENT_COLOR = "#58b9d6"


@dataclass(frozen=True, slots=True)
class NetworkSegment:
    """One configured IPv4 network segment or VLAN."""

    id: str
    name: str
    vlan_id: int
    network: str
    role: str
    color: str
    monitoring: bool

    @property
    def ip_network(self) -> ipaddress.IPv4Network:
        """Return the parsed IPv4 network."""
        return ipaddress.ip_network(self.network, strict=False)

    def contains(self, address: str) -> bool:
        """Return whether an address belongs to this segment."""
        try:
            return ipaddress.ip_address(address) in self.ip_network
        except ValueError:
            return False

    def as_dict(self) -> dict[str, Any]:
        """Return a JSON-serializable representation."""
        return {
            "id": self.id,
            "name": self.name,
            "vlan_id": self.vlan_id,
            "network": self.network,
            "role": self.role,
            "color": self.color,
            "monitoring": self.monitoring,
        }


def normalize_network_segments(values: Any) -> list[NetworkSegment]:
    """Validate and normalize the editable network segment list."""
    if not isinstance(values, list) or not values or len(values) > 32:
        raise ValueError("network_segments must contain between 1 and 32 entries")
    segments: list[NetworkSegment] = []
    ids: set[str] = set()
    vlan_ids: set[int] = set()
    networks: list[ipaddress.IPv4Network] = []
    for index, raw in enumerate(values, start=1):
        if not isinstance(raw, dict):
            raise ValueError("each network segment must be an object")
        name = str(raw.get("name") or "").strip()
        if not name or len(name) > 48:
            raise ValueError("segment name must contain 1 to 48 characters")
        segment_id = re.sub(
            r"[^a-z0-9_-]+", "-", str(raw.get("id") or name).strip().casefold()
        ).strip("-_") or f"segment-{index}"
        if segment_id in ids:
            raise ValueError("segment ids must be unique")
        try:
            vlan_id = int(raw.get("vlan_id"))
        except (TypeError, ValueError) as err:
            raise ValueError("VLAN ID must be an integer") from err
        if vlan_id < 1 or vlan_id > 4094 or vlan_id in vlan_ids:
            raise ValueError("VLAN IDs must be unique and between 1 and 4094")
        try:
            network = ipaddress.ip_network(str(raw.get("network") or ""), strict=False)
        except ValueError as err:
            raise ValueError("segment subnet is invalid") from err
        if network.version != 4 or network.num_addresses > 4096:
            raise ValueError("segment subnet must be IPv4 and contain at most 4096 addresses")
        if any(network.overlaps(existing) for existing in networks):
            raise ValueError("segment subnets must not overlap")
        role = str(raw.get("role") or "trusted").strip().casefold()
        if role not in SEGMENT_ROLES:
            raise ValueError("segment role is invalid")
        color = str(raw.get("color") or DEFAULT_SEGMENT_COLOR).strip().lower()
        if not re.fullmatch(r"#[0-9a-f]{6}", color):
            raise ValueError("segment color must use #RRGGBB")
        segments.append(NetworkSegment(
            id=segment_id,
            name=name,
            vlan_id=vlan_id,
            network=str(network),
            role=role,
            color=color,
            monitoring=bool(raw.get("monitoring", True)),
        ))
        ids.add(segment_id)
        vlan_ids.add(vlan_id)
        networks.append(network)
    return segments


def canonical_hostname(hostname: str | None) -> str:
    """Return a hostname suitable for identity comparisons."""
    value = (hostname or "").strip().rstrip(".").casefold()
    return value.removesuffix(".fritz.box")


def preferred_hostname(
    current: str | None, previous: str | None
) -> str | None:
    """Keep the short, stable spelling of equivalent local hostnames."""
    if (
        current
        and previous
        and canonical_hostname(current) == canonical_hostname(previous)
    ):
        return min((current, previous), key=lambda value: (len(value), value))
    return current


def is_network_infrastructure(host: "NetworkHost") -> bool:
    """Return whether a discovered host is router or mesh infrastructure."""
    if host.segment_role == "infrastructure":
        return True
    if host.network_infrastructure is not None:
        return host.network_infrastructure
    hostname = (host.fritz_hostname or host.hostname or "").strip().rstrip(".").casefold()
    if hostname in {"fritz.box", "fritz!box", "fritzbox"}:
        return True
    tokens = set(filter(None, re.split(r"[^a-z0-9!]+", hostname)))
    return bool(tokens & {"router", "repeater", "powerline", "accesspoint"})


@dataclass(slots=True)
class NetworkHost:
    """A discovered network host."""

    key: str
    ip: str
    mac: str | None
    hostname: str | None
    online: bool
    fritz_hostname: str | None = None
    scanner_hostname: str | None = None
    missed_scans: int = 0
    sources: tuple[str, ...] = ("ping_tcp",)
    access_point: str | None = None
    connection_type: str | None = None
    wifi_band: str | None = None
    link_rate_mbps: float | None = None
    link_rate_rx_mbps: float | None = None
    link_rate_tx_mbps: float | None = None
    signal_strength_percent: int | None = None
    signal_strength_dbm: int | None = None
    address_source: str | None = None
    lease_time_remaining: int | None = None
    fritzbox_model: str | None = None
    fritzos_version: str | None = None
    dns_queries: int | None = None
    dns_blocked: int | None = None
    dns_blocked_ratio: float | None = None
    dns_last_activity: str | None = None
    dns_last_domain: str | None = None
    dns_last_blocked_domain: str | None = None
    dns_last_block_reason: str | None = None
    dns_last_protocol: str | None = None
    dns_top_queried_domains: list[tuple[str, int]] | None = None
    dns_top_blocked_domains: list[tuple[str, int]] | None = None
    dns_blocked_reasons: dict[str, int] | None = None
    adguard_period_hours: int | None = None
    adguard_data_complete: bool = True
    adguard_bypass_suspected: bool = False
    wan_access: str | None = None
    desired_wan_access: str | None = None
    internet_approval_required: bool = False
    guest_network: bool = False
    vpn_connection: bool = False
    network_infrastructure: bool | None = None
    infrastructure_source: str | None = None
    segment_id: str | None = None
    segment_name: str | None = None
    vlan_id: int | None = None
    segment_network: str | None = None
    segment_role: str | None = None
    segment_color: str | None = None
    segment_monitoring: bool = True

    @property
    def display_name(self) -> str:
        """Return the best automatically discovered name."""
        return self.hostname or self.mac or self.ip
