"""Connection validation shared by setup, options, and recovery flows."""

from __future__ import annotations

import asyncio
from typing import Any

from aiohttp import ClientResponseError
from homeassistant.core import HomeAssistant

from .dns_provider import create_dns_scanner
from .const import (
    CONF_ADGUARD_ENABLED,
    CONF_FRITZ_ENABLED,
    CONF_FRITZ_HOST,
    CONF_FRITZ_PASSWORD,
    CONF_FRITZ_USER,
    CONF_NETWORK,
    DEFAULT_FRITZ_HOST,
    DEFAULT_NETWORK,
)
from .fritz import FritzBoxScanner


class CannotConnectError(Exception):
    """A configured local service cannot be reached."""


class InvalidAuthError(Exception):
    """A configured local service rejected its credentials."""


def _looks_like_auth_error(err: Exception) -> bool:
    text = f"{type(err).__name__} {err}".casefold()
    return any(
        marker in text
        for marker in ("authorization", "authentication", "unauthorized", "forbidden", "401", "403")
    )


async def async_validate_connections(
    hass: HomeAssistant, values: dict[str, Any]
) -> None:
    """Test every enabled optional service before configuration is saved."""
    try:
        if values.get(CONF_FRITZ_ENABLED):
            fritz = FritzBoxScanner(
                hass,
                str(values.get(CONF_FRITZ_HOST, DEFAULT_FRITZ_HOST)),
                str(values.get(CONF_FRITZ_USER, "")),
                str(values.get(CONF_FRITZ_PASSWORD, "")),
                str(values.get(CONF_NETWORK, DEFAULT_NETWORK)),
                set(),
            )
            await fritz.async_validate_connection()
        if values.get(CONF_ADGUARD_ENABLED):
            scanner = create_dns_scanner(hass, values)
            try:
                await scanner.async_validate_connection()
            finally:
                if hasattr(scanner, "async_close"):
                    await scanner.async_close()
    except ClientResponseError as err:
        if err.status in {401, 403}:
            raise InvalidAuthError from err
        raise CannotConnectError from err
    except (TimeoutError, asyncio.TimeoutError, OSError) as err:
        raise CannotConnectError from err
    except Exception as err:
        if _looks_like_auth_error(err):
            raise InvalidAuthError from err
        raise CannotConnectError from err
