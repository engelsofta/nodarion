"""Config flow for Engelsoft Nodarion."""

from __future__ import annotations

import ipaddress
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import (
    CONF_ADGUARD_ENABLED,
    CONF_ADGUARD_HOST,
    CONF_ADGUARD_PASSWORD,
    CONF_ADGUARD_PERIOD_HOURS,
    CONF_ADGUARD_PORT,
    CONF_ADGUARD_SSL,
    CONF_ADGUARD_USER,
    CONF_ADGUARD_VERIFY_SSL,
    CONF_CONCURRENCY,
    CONF_EXCLUDE,
    CONF_FRITZ_ENABLED,
    CONF_FRITZ_HOST,
    CONF_FRITZ_PASSWORD,
    CONF_FRITZ_USER,
    CONF_NETWORK,
    CONF_OFFLINE_AFTER,
    CONF_REMOVE_AFTER_DAYS,
    CONF_PORTS,
    CONF_SCAN_INTERVAL,
    CONF_TIMEOUT,
    DEFAULT_CONCURRENCY,
    DEFAULT_ADGUARD_PERIOD_HOURS,
    DEFAULT_ADGUARD_PORT,
    DEFAULT_FRITZ_HOST,
    DEFAULT_NETWORK,
    DEFAULT_OFFLINE_AFTER,
    DEFAULT_REMOVE_AFTER_DAYS,
    DEFAULT_PORTS,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_TIMEOUT,
    DOMAIN,
)


def _schema(values: dict[str, Any]) -> vol.Schema:
    def number(minimum: float, maximum: float, step: float = 1):
        return selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=minimum,
                max=maximum,
                step=step,
                mode=selector.NumberSelectorMode.BOX,
            )
        )

    return vol.Schema(
        {
            vol.Required(
                CONF_NETWORK, default=values.get(CONF_NETWORK, DEFAULT_NETWORK)
            ): str,
            vol.Required(
                CONF_SCAN_INTERVAL,
                default=values.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
            ): number(10, 86400),
            vol.Required(
                CONF_TIMEOUT, default=values.get(CONF_TIMEOUT, DEFAULT_TIMEOUT)
            ): number(0.1, 10, 0.1),
            vol.Required(
                CONF_CONCURRENCY,
                default=values.get(CONF_CONCURRENCY, DEFAULT_CONCURRENCY),
            ): number(1, 512),
            vol.Required(
                CONF_PORTS, default=values.get(CONF_PORTS, DEFAULT_PORTS)
            ): str,
            vol.Optional(
                CONF_EXCLUDE, default=values.get(CONF_EXCLUDE, "")
            ): str,
            vol.Required(
                CONF_OFFLINE_AFTER,
                default=values.get(CONF_OFFLINE_AFTER, DEFAULT_OFFLINE_AFTER),
            ): number(1, 100),
            vol.Required(
                CONF_REMOVE_AFTER_DAYS,
                default=values.get(
                    CONF_REMOVE_AFTER_DAYS, DEFAULT_REMOVE_AFTER_DAYS
                ),
            ): number(0, 3650),
            vol.Required(
                CONF_FRITZ_ENABLED,
                default=values.get(CONF_FRITZ_ENABLED, False),
            ): selector.BooleanSelector(),
            vol.Optional(
                CONF_FRITZ_HOST,
                default=values.get(CONF_FRITZ_HOST, DEFAULT_FRITZ_HOST),
            ): str,
            vol.Optional(
                CONF_FRITZ_USER,
                default=values.get(CONF_FRITZ_USER, ""),
            ): str,
            vol.Optional(
                CONF_FRITZ_PASSWORD,
                default=values.get(CONF_FRITZ_PASSWORD, ""),
            ): selector.TextSelector(
                selector.TextSelectorConfig(
                    type=selector.TextSelectorType.PASSWORD
                )
            ),
            vol.Required(
                CONF_ADGUARD_ENABLED,
                default=values.get(CONF_ADGUARD_ENABLED, False),
            ): selector.BooleanSelector(),
            vol.Optional(
                CONF_ADGUARD_HOST,
                default=values.get(CONF_ADGUARD_HOST, ""),
            ): str,
            vol.Optional(
                CONF_ADGUARD_PORT,
                default=values.get(CONF_ADGUARD_PORT, DEFAULT_ADGUARD_PORT),
            ): number(1, 65535),
            vol.Optional(
                CONF_ADGUARD_USER,
                default=values.get(CONF_ADGUARD_USER, ""),
            ): str,
            vol.Optional(
                CONF_ADGUARD_PASSWORD,
                default=values.get(CONF_ADGUARD_PASSWORD, ""),
            ): selector.TextSelector(
                selector.TextSelectorConfig(
                    type=selector.TextSelectorType.PASSWORD
                )
            ),
            vol.Required(
                CONF_ADGUARD_SSL,
                default=values.get(CONF_ADGUARD_SSL, False),
            ): selector.BooleanSelector(),
            vol.Required(
                CONF_ADGUARD_VERIFY_SSL,
                default=values.get(CONF_ADGUARD_VERIFY_SSL, True),
            ): selector.BooleanSelector(),
            vol.Optional(
                CONF_ADGUARD_PERIOD_HOURS,
                default=values.get(
                    CONF_ADGUARD_PERIOD_HOURS,
                    DEFAULT_ADGUARD_PERIOD_HOURS,
                ),
            ): number(1, 168),
        }
    )


def _validate(data: dict[str, Any]) -> dict[str, str]:
    errors: dict[str, str] = {}
    try:
        network = ipaddress.ip_network(data[CONF_NETWORK], strict=False)
        if network.version != 4 or network.num_addresses > 4096:
            errors[CONF_NETWORK] = "invalid_network"
    except ValueError:
        errors[CONF_NETWORK] = "invalid_network"
    try:
        ports = [int(item.strip()) for item in data[CONF_PORTS].split(",")]
        if not ports or any(port < 1 or port > 65535 for port in ports):
            raise ValueError
    except ValueError:
        errors[CONF_PORTS] = "invalid_ports"
    try:
        for item in data.get(CONF_EXCLUDE, "").split(","):
            if item.strip():
                ipaddress.ip_address(item.strip())
    except ValueError:
        errors[CONF_EXCLUDE] = "invalid_exclude"
    if data.get(CONF_FRITZ_ENABLED):
        if not str(data.get(CONF_FRITZ_HOST, "")).strip():
            errors[CONF_FRITZ_HOST] = "fritz_credentials_required"
        if not str(data.get(CONF_FRITZ_USER, "")).strip():
            errors[CONF_FRITZ_USER] = "fritz_credentials_required"
        if not str(data.get(CONF_FRITZ_PASSWORD, "")).strip():
            errors[CONF_FRITZ_PASSWORD] = "fritz_credentials_required"
    if data.get(CONF_ADGUARD_ENABLED):
        if not str(data.get(CONF_ADGUARD_HOST, "")).strip():
            errors[CONF_ADGUARD_HOST] = "adguard_host_required"
        user = str(data.get(CONF_ADGUARD_USER, "")).strip()
        password = str(data.get(CONF_ADGUARD_PASSWORD, "")).strip()
        if bool(user) != bool(password):
            missing = CONF_ADGUARD_PASSWORD if user else CONF_ADGUARD_USER
            errors[missing] = "adguard_credentials_incomplete"
    return errors


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle initial setup."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle user setup."""
        errors = {}
        if user_input is not None:
            errors = _validate(user_input)
            if not errors:
                await self.async_set_unique_id(DOMAIN)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title="Engelsoft Nodarion", data=user_input
                )
        return self.async_show_form(
            step_id="user", data_schema=_schema(user_input or {}), errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Return options flow."""
        return OptionsFlow(config_entry)


class OptionsFlow(config_entries.OptionsFlow):
    """Handle editable scanner options."""

    def __init__(self, entry) -> None:
        self.entry = entry

    async def async_step_init(self, user_input=None):
        """Manage options."""
        errors = {}
        if user_input is not None:
            errors = _validate(user_input)
            if not errors:
                return self.async_create_entry(title="", data=user_input)
        values = user_input or {**self.entry.data, **self.entry.options}
        return self.async_show_form(
            step_id="init", data_schema=_schema(values), errors=errors
        )
