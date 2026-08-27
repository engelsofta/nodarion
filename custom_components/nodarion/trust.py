"""Pure helpers for device identity and internet-trust decisions."""

from __future__ import annotations

from datetime import timedelta
import re


_UPNP_ERROR_CODE = re.compile(r"errorCode\s*:\s*(\d+)\b", re.IGNORECASE)


def has_upnp_error_code(error: object, code: int) -> bool:
    """Return whether a FRITZ!Box exception contains one UPnP error code."""
    match = _UPNP_ERROR_CODE.search(str(error))
    return bool(match and int(match.group(1)) == code)


def is_vpn_connection(
    connection_type: str | None,
    hostname: str | None,
    mac: str | None,
) -> bool:
    """Identify FRITZ!Box VPN entries without classifying normal clients."""
    connection = (connection_type or "").strip().casefold()
    if any(
        marker in connection
        for marker in ("vpn", "wireguard", "ipsec", "tunnel")
    ):
        return True
    # Some FRITZ!OS versions omit InterfaceType for VPN users or expose a
    # placeholder MAC. Explicit physical types take precedence so a regular
    # LAN device named "vpn-server" is not exempted accidentally.
    if any(
        marker in connection
        for marker in ("lan", "ethernet", "wlan", "wi-fi", "wifi", "plc")
    ):
        return False
    name = (hostname or "").strip().casefold()
    return name.startswith("vpn") or name.startswith("wireguard")


def normalize_mac(value: str | None) -> str | None:
    """Normalize a MAC address for persistent comparisons."""
    if not value:
        return None
    return value.replace("-", ":").upper()


def is_trusted_identity(
    key: str,
    mac: str | None,
    known_keys: set[str],
    trusted_macs: set[str],
) -> bool:
    """Match approvals by stable MAC while retaining legacy IP-slot trust."""
    normalized = normalize_mac(mac)
    return key in known_keys or bool(normalized and normalized in trusted_macs)


def is_configured_router(
    ip: str, hostname: str | None, configured_address: str | None
) -> bool:
    """Identify only the configured router, not hostname substrings."""
    name = (hostname or "").strip().rstrip(".").casefold()
    configured = (configured_address or "").strip().rstrip(".").casefold()
    if configured and (ip.casefold() == configured or name == configured):
        return True
    return name in {"fritz.box", "fritz!box", "fritzbox"}


class IdentityChangeTracker:
    """Require repeated observations before accepting an identity change."""

    def __init__(self, confirmations: int = 2) -> None:
        self.confirmations = max(1, confirmations)
        self._pending: dict[str, tuple[str, int]] = {}

    def observe(
        self, key: str, previous_mac: str | None, current_mac: str | None
    ) -> bool:
        """Return true only after the same changed MAC repeats."""
        previous = normalize_mac(previous_mac)
        current = normalize_mac(current_mac)
        if not previous or not current or previous == current:
            self._pending.pop(key, None)
            return False
        candidate, count = self._pending.get(key, (current, 0))
        count = count + 1 if candidate == current else 1
        if count >= self.confirmations:
            self._pending.pop(key, None)
            return True
        self._pending[key] = (current, count)
        return False

    def clear(self, key: str) -> None:
        """Discard a pending observation for one device."""
        self._pending.pop(key, None)


def should_prune_offline(
    age: timedelta,
    remove_after_days: int,
    *,
    monitored: bool = False,
    presence: bool = False,
) -> bool:
    """Return whether stale inventory may be hidden automatically."""
    return bool(
        remove_after_days > 0
        and not monitored
        and not presence
        and age >= timedelta(days=remove_after_days)
    )
