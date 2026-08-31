"""Connection validation shared by setup, options, and recovery flows."""

from __future__ import annotations

import asyncio
from typing import Any

from aiohttp import ClientResponseError
from homeassistant.core import HomeAssistant

from .adguard import AdGuardScanner
from .const import (
    CONF_ADGUARD_ENABLED,
    CONF_ADGUARD_HOST,
    CONF_ADGUARD_PASSWORD,
    CONF_ADGUARD_PERIOD_HOURS,
    CONF_ADGUARD_PORT,
    CONF_ADGUARD_SSL,
    CONF_ADGUARD_USER,
    CONF_ADGUARD_VERIFY_SSL,
    CONF_FRITZ_ENABLED,
    CONF_FRITZ_HOST,
    CONF_FRITZ_PASSWORD,
    CONF_FRITZ_USER,
    CONF_NETWORK,
    DEFAULT_ADGUARD_PERIOD_HOURS,
    DEFAULT_ADGUARD_PORT,
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
            adguard = AdGuardScanner(
                hass,
                str(values.get(CONF_ADGUARD_HOST, "")),
                int(values.get(CONF_ADGUARD_PORT, DEFAULT_ADGUARD_PORT)),
                str(values.get(CONF_ADGUARD_USER, "")),
                str(values.get(CONF_ADGUARD_PASSWORD, "")),
                bool(values.get(CONF_ADGUARD_SSL, False)),
                bool(values.get(CONF_ADGUARD_VERIFY_SSL, True)),
                int(values.get(CONF_ADGUARD_PERIOD_HOURS, DEFAULT_ADGUARD_PERIOD_HOURS)),
            )
            await adguard.async_validate_connection()
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
