"""Native Home Assistant actions for AdGuard Home management."""

from __future__ import annotations

from collections.abc import Awaitable, Callable

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN

SERVICE_SCHEMAS = {
    "add_filter_url": vol.Schema({vol.Required("name"): cv.string, vol.Required("url"): cv.url}),
    "remove_filter_url": vol.Schema({vol.Required("url"): cv.url}),
    "enable_filter_url": vol.Schema({vol.Required("url"): cv.url}),
    "disable_filter_url": vol.Schema({vol.Required("url"): cv.url}),
    "refresh_filters": vol.Schema({vol.Optional("force", default=False): cv.boolean}),
    "add_dns_rule": vol.Schema({vol.Required("rule"): cv.string}),
    "remove_dns_rule": vol.Schema({vol.Required("rule"): cv.string}),
    "add_dns_rewrite": vol.Schema({vol.Required("domain"): cv.string, vol.Required("answer"): cv.string}),
    "remove_dns_rewrite": vol.Schema({vol.Required("domain"): cv.string, vol.Required("answer"): cv.string}),
}


async def async_register_services(hass: HomeAssistant) -> None:
    """Register all Nodarion AdGuard actions once."""
    if hass.data.setdefault(DOMAIN, {}).get("services_registered"):
        return

    def scanner_for(call: ServiceCall):
        coordinator = call.hass.data.get(DOMAIN, {}).get("coordinator")
        scanner = coordinator.adguard_scanner if coordinator else None
        if scanner is None:
            raise ServiceValidationError("AdGuard Home ist in Nodarion nicht eingerichtet")
        return scanner, coordinator.adguard_status_coordinator

    async def execute(call: ServiceCall) -> None:
        scanner, status = scanner_for(call)
        handlers: dict[str, Callable[[], Awaitable[object]]] = {
            "add_filter_url": lambda: scanner.async_add_filter_url(call.data["name"], call.data["url"]),
            "remove_filter_url": lambda: scanner.async_remove_filter_url(call.data["url"]),
            "enable_filter_url": lambda: scanner.async_set_filter_url(call.data["url"], True),
            "disable_filter_url": lambda: scanner.async_set_filter_url(call.data["url"], False),
            "refresh_filters": lambda: scanner.async_refresh_filters(call.data["force"]),
            "add_dns_rule": lambda: scanner.async_add_custom_rule(call.data["rule"]),
            "remove_dns_rule": lambda: scanner.async_delete_custom_rule(call.data["rule"]),
            "add_dns_rewrite": lambda: scanner.async_add_rewrite(call.data["domain"], call.data["answer"]),
            "remove_dns_rewrite": lambda: scanner.async_delete_rewrite(call.data["domain"], call.data["answer"]),
        }
        try:
            await handlers[call.service]()
            if status is not None:
                await status.async_request_refresh()
        except (TypeError, ValueError) as err:
            raise ServiceValidationError(str(err)) from err
        except Exception as err:
            raise HomeAssistantError(f"AdGuard-Änderung fehlgeschlagen: {err}") from err

    for service, schema in SERVICE_SCHEMAS.items():
        hass.services.async_register(DOMAIN, service, execute, schema=schema)
    hass.data[DOMAIN]["services_registered"] = True


async def async_unregister_services(hass: HomeAssistant) -> None:
    """Remove actions when the single config entry unloads."""
    domain_data = hass.data.get(DOMAIN, {})
    if not domain_data.pop("services_registered", False):
        return
    for service in SERVICE_SCHEMAS:
        hass.services.async_remove(DOMAIN, service)
