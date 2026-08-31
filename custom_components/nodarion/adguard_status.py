"""Lightweight AdGuard Home status coordinator."""

from __future__ import annotations

from datetime import timedelta
import logging
from typing import Any

from aiohttp import ClientResponseError
from homeassistant.config_entries import ConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .adguard import AdGuardScanner
from .const import ADGUARD_STATUS_INTERVAL_SECONDS, DOMAIN

_LOGGER = logging.getLogger(__name__)


class AdGuardStatusCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Poll lightweight statistics and protection states independently."""

    def __init__(
        self, hass: HomeAssistant, scanner: AdGuardScanner, entry: ConfigEntry
    ) -> None:
        super().__init__(
            hass,
            logger=_LOGGER,
            name=f"{DOMAIN} AdGuard status",
            update_interval=timedelta(seconds=ADGUARD_STATUS_INTERVAL_SECONDS),
        )
        self.scanner = scanner
        self.entry = entry
        self._reauth_started = False

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            return await self.scanner.async_status()
        except ClientResponseError as err:
            if err.status in {401, 403} and not self._reauth_started:
                self._reauth_started = True
                self.entry.async_start_reauth(self.hass)
            raise UpdateFailed(f"AdGuard Home status unavailable: {err}") from err
        except Exception as err:
            raise UpdateFailed(f"AdGuard Home status unavailable: {err}") from err
