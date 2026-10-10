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
from .connection_validation import (
    CannotConnectError,
    InvalidAuthError,
    async_validate_connections,
)


SECTION_FIELDS = {
    "network": (CONF_NETWORK, CONF_SCAN_INTERVAL, CONF_EXCLUDE),
    "fritz": (CONF_FRITZ_ENABLED, CONF_FRITZ_HOST, CONF_FRITZ_USER, CONF_FRITZ_PASSWORD),
    "adguard": (
        CONF_ADGUARD_ENABLED, CONF_ADGUARD_HOST, CONF_ADGUARD_PORT,
        CONF_ADGUARD_USER, CONF_ADGUARD_PASSWORD, CONF_ADGUARD_SSL,
        CONF_ADGUARD_VERIFY_SSL, CONF_ADGUARD_PERIOD_HOURS,
    ),
    "advanced": (CONF_TIMEOUT, CONF_CONCURRENCY, CONF_PORTS, CONF_OFFLINE_AFTER, CONF_REMOVE_AFTER_DAYS),
}
AI_FIELDS = ("ai_analysis_enabled", "ai_analysis_time", "ai_privacy")


async def _async_validate_input(
    hass, values: dict[str, Any], section: str | None = None
) -> dict[str, str]:
    """Validate values and test enabled service connections."""
    errors = _validate(values)
    if section is not None:
        errors = {
            key: value for key, value in errors.items()
            if key in SECTION_FIELDS[section]
        }
    if errors:
        return errors
    connection_values = dict(values)
    if section is not None:
        if section != "fritz":
            connection_values[CONF_FRITZ_ENABLED] = False
        if section != "adguard":
            connection_values[CONF_ADGUARD_ENABLED] = False
    try:
        await async_validate_connections(hass, connection_values)
    except InvalidAuthError:
        errors["base"] = "invalid_auth"
    except CannotConnectError:
        errors["base"] = "cannot_connect"
    return errors


def _schema(values: dict[str, Any], section: str | None = None) -> vol.Schema:
    def number(minimum: float, maximum: float, step: float = 1):
        return selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=minimum,
                max=maximum,
                step=step,
                mode=selector.NumberSelectorMode.BOX,
            )
        )

    schema = vol.Schema(
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
    if section is None:
        return schema
    return vol.Schema({
        key: value for key, value in schema.schema.items()
        if key.schema in SECTION_FIELDS[section]
    })


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


class SectionFlow:
    """Shared section dialogs; stage all edits until the user saves."""

    def _start(self, mode, entry=None):
        self._mode = mode
        self._entry = entry
        current = {**entry.data, **entry.options} if entry else {}
        # Preserve unknown/legacy options and fill every existing default.
        self._values = {
            key.schema: key.default()
            for key in _schema({}).schema
        }
        self._values.update(current)
        self._ai_values = {}
        self._monitor = None

    def _menu(self):
        step = {
            "user": "services", "options": "init",
            "reconfigure": "reconfigure", "reauth": "reauth_confirm",
        }[self._mode]
        return self.async_show_menu(
            step_id=step,
            menu_options=["network", "fritz", "adguard", "ai", "advanced", "finish"],
        )

    async def async_step_services(self, user_input=None):
        return self._menu()

    async def _async_section(self, section, user_input=None, errors=None):
        errors = errors or {}
        values = dict(self._values)
        if user_input is not None:
            values.update(user_input)
            errors = await _async_validate_input(self.hass, values, section)
            if not errors:
                self._values = values
                return self._menu()
        return self.async_show_form(
            step_id=section, data_schema=_schema(values, section), errors=errors,
        )

    async def async_step_network(self, user_input=None):
        return await self._async_section("network", user_input)

    async def async_step_fritz(self, user_input=None):
        return await self._async_section("fritz", user_input)

    async def async_step_adguard(self, user_input=None):
        return await self._async_section("adguard", user_input)

    async def async_step_advanced(self, user_input=None):
        return await self._async_section("advanced", user_input)

    async def async_step_ai(self, user_input=None):
        # AI rules remain in the panel's existing monitor storage, not options.
        if self._monitor is None:
            self._monitor = self.hass.data.get(DOMAIN, {}).get("monitor")
            if self._monitor is None:
                from .monitor import NetworkMonitor

                self._monitor = NetworkMonitor(self.hass)
                await self._monitor.async_load()
        values = {**self._monitor.rules, **self._ai_values, **(user_input or {})}
        errors = {}
        if user_input is not None:
            time = str(values["ai_analysis_time"])
            try:
                hour, minute = time.split(":")
                if (
                    len(hour) != 2 or len(minute) != 2
                    or not (0 <= int(hour) < 24 and 0 <= int(minute) < 60)
                ):
                    raise ValueError
            except ValueError:
                errors["ai_analysis_time"] = "invalid_time"
            if not errors:
                self._ai_values = {key: values[key] for key in AI_FIELDS}
                return self._menu()
        return self.async_show_form(
            step_id="ai",
            data_schema=vol.Schema({
                vol.Required("ai_analysis_enabled", default=values.get("ai_analysis_enabled", False)): selector.BooleanSelector(),
                vol.Required("ai_analysis_time", default=values.get("ai_analysis_time", "03:15")): str,
                vol.Required("ai_privacy", default=values.get("ai_privacy", "anonymized")): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=["anonymized", "domains"], translation_key="ai_privacy",
                    )
                ),
            }),
            errors=errors,
        )

    async def async_step_finish(self, user_input=None):
        if user_input is None:
            return self.async_show_form(step_id="finish", data_schema=vol.Schema({}))
        # Recheck all enabled connections before any persistent configuration write.
        # Route failures to the relevant dialog with the attempted values intact.
        for section in SECTION_FIELDS:
            errors = await _async_validate_input(self.hass, self._values, section)
            if errors:
                return await self._async_section(section, errors=errors)
        if self._mode == "user":
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()
        if self._ai_values:
            await self._monitor.async_set_rules(self._ai_values)
        if self._mode == "options":
            return self.async_create_entry(title="", data=self._values)
        if self._mode == "user":
            return self.async_create_entry(title="Engelsoft Nodarion", data=self._values)
        # Existing options take precedence over data at runtime. Update matching
        # option keys too, rather than leaving stale values that shadow the edit.
        return self.async_update_and_abort(
            self._entry,
            data_updates=self._values,
            options={
                **self._entry.options,
                **{key: self._values[key] for key in self._entry.options if key in self._values},
            },
            reason="reauth_successful" if self._mode == "reauth" else "reconfigure_successful",
        )


class ConfigFlow(SectionFlow, config_entries.ConfigFlow, domain=DOMAIN):
    """Handle initial setup and connection recovery using the same sections."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        if not hasattr(self, "_values"):
            self._start("user")
        return await self.async_step_network(user_input)

    async def async_step_reconfigure(self, user_input=None):
        if not hasattr(self, "_values"):
            self._start("reconfigure", self._get_reconfigure_entry())
        return self._menu()

    async def async_step_reauth(self, entry_data):
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(self, user_input=None):
        if not hasattr(self, "_values"):
            self._start("reauth", self._get_reauth_entry())
        return self._menu()

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return OptionsFlow(config_entry)


class OptionsFlow(SectionFlow, config_entries.OptionsFlow):
    """Edit individual sections without discarding unrelated settings."""

    def __init__(self, entry) -> None:
        self._start("options", entry)

    async def async_step_init(self, user_input=None):
        return self._menu()
