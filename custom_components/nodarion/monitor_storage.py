"""Debounced persistent storage for the network monitor."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from contextlib import suppress
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store


class MonitorStoreWriter:
    """Persist critical changes immediately and coalesce scan churn."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: Store[dict[str, Any]],
        payload: Callable[[], dict[str, Any]],
        delay: float = 0.75,
    ) -> None:
        self._hass = hass
        self._store = store
        self._payload = payload
        self._delay = delay
        self._lock = asyncio.Lock()
        self._pending: asyncio.Task[None] | None = None

    async def async_load(self) -> dict[str, Any] | None:
        """Load the current monitor payload."""
        return await self._store.async_load()

    async def async_save(self, *, immediate: bool) -> None:
        """Save now or coalesce changes produced during a scan."""
        if immediate:
            await self._async_cancel_pending()
            await self._async_write()
            return
        if self._pending is None or self._pending.done():
            self._pending = self._hass.async_create_task(
                self._async_delayed_write(), "Nodarion monitor storage"
            )

    async def async_flush(self) -> None:
        """Persist pending state before the integration unloads."""
        await self._async_cancel_pending()
        await self._async_write()

    async def _async_delayed_write(self) -> None:
        try:
            await asyncio.sleep(self._delay)
            await self._async_write()
        finally:
            self._pending = None

    async def _async_cancel_pending(self) -> None:
        task = self._pending
        self._pending = None
        if task is None or task.done():
            return
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task

    async def _async_write(self) -> None:
        async with self._lock:
            await self._store.async_save(self._payload())
