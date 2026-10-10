"""Exercise real flow methods with HA UI/connection boundaries replaced."""

import ast
import ipaddress
import json
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock

import voluptuous as vol


COMPONENT = Path(__file__).parents[1] / "custom_components/nodarion"


class FlowBoundary:
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__()

    def async_show_form(self, **kwargs):
        return {"type": "form", **kwargs}

    def async_show_menu(self, **kwargs):
        return {"type": "menu", **kwargs}

    def async_create_entry(self, **kwargs):
        return {"type": "create_entry", **kwargs}

    def async_update_and_abort(self, entry, *, data_updates, options, reason):
        return {"type": "abort", "data_updates": data_updates, "options": options, "reason": reason}

    async def async_set_unique_id(self, unique_id):
        self.unique_id = unique_id

    def _abort_if_unique_id_configured(self):
        pass

    def _get_reconfigure_entry(self):
        return self.test_entry

    def _get_reauth_entry(self):
        return self.test_entry


def load_flow():
    # Execute the actual module without importing the complete HA runtime.
    namespace = {"ipaddress": ipaddress, "Any": object, "vol": vol}
    exec((COMPONENT / "const.py").read_text(encoding="utf-8"), namespace)
    namespace.update({
        "config_entries": SimpleNamespace(ConfigFlow=FlowBoundary, OptionsFlow=FlowBoundary),
        "callback": lambda method: method,
        "selector": SimpleNamespace(
            NumberSelector=lambda config: lambda value: value,
            NumberSelectorConfig=lambda **kwargs: kwargs,
            NumberSelectorMode=SimpleNamespace(BOX="box"),
            BooleanSelector=lambda: bool,
            TextSelector=lambda config: str,
            TextSelectorConfig=lambda **kwargs: kwargs,
            TextSelectorType=SimpleNamespace(PASSWORD="password"),
            SelectSelector=lambda config: vol.In(config["options"]),
            SelectSelectorConfig=lambda **kwargs: kwargs,
        ),
        "async_validate_connections": AsyncMock(),
        "InvalidAuthError": type("InvalidAuthError", (Exception,), {}),
        "CannotConnectError": type("CannotConnectError", (Exception,), {}),
    })
    source = ast.parse((COMPONENT / "config_flow.py").read_text(encoding="utf-8"))
    source.body = [node for node in source.body if not isinstance(node, (ast.Import, ast.ImportFrom))]
    exec(compile(source, "config_flow.py", "exec"), namespace)
    return namespace


class SectionFlowTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.ns = load_flow()
        self.monitor = SimpleNamespace(
            rules={"ai_analysis_enabled": False, "ai_analysis_time": "03:15", "ai_privacy": "anonymized", "network_segments": [{"id": "home"}]},
            async_set_rules=AsyncMock(),
        )
        self.hass = SimpleNamespace(data={"nodarion": {"monitor": self.monitor}})
        self.entry = SimpleNamespace(
            data={"network": "192.0.2.0/24", "fritz_host": "router", "fritz_user": "user", "fritz_password": "secret", "adguard_password": "saved", "custom_legacy": 42},
            options={"scan_interval": 120, "concurrency": 17, "extra_option": "keep"},
        )
        self.flow = self.ns["OptionsFlow"](self.entry)
        self.flow.hass = self.hass

    async def test_menu_and_defaults_cover_every_previous_field(self):
        result = await self.flow.async_step_init()
        self.assertEqual(result["menu_options"], ["network", "fritz", "adguard", "ai", "advanced", "finish"])
        fields = [key for keys in self.ns["SECTION_FIELDS"].values() for key in keys]
        self.assertEqual(len(fields), len(set(fields)))
        self.assertEqual(set(fields), {key.schema for key in self.ns["_schema"]({}).schema})
        self.assertTrue(set(fields).issubset(self.flow._values))

    async def test_section_save_preserves_credentials_and_unrelated_options(self):
        result = await self.flow.async_step_network({"network": "198.51.100.0/24", "scan_interval": 90, "exclude": ""})
        self.assertEqual(result["type"], "menu")
        self.monitor.async_set_rules.assert_not_called()
        saved = await self.flow.async_step_finish({})
        self.assertEqual(saved["data"]["network"], "198.51.100.0/24")
        for key in ("fritz_password", "adguard_password", "custom_legacy", "concurrency", "extra_option"):
            self.assertEqual(saved["data"][key], {**self.entry.data, **self.entry.options}[key])
        self.assertEqual(self.entry.options["scan_interval"], 120)

    async def test_invalid_section_retains_attempt_without_persisting(self):
        result = await self.flow.async_step_network({"network": "bad"})
        self.assertEqual(result["errors"], {"network": "invalid_network"})
        self.assertEqual(self.flow._values["network"], "192.0.2.0/24")
        self.assertEqual(result["data_schema"]({})["network"], "bad")

    async def test_optional_services_can_be_disabled_without_erasing_credentials(self):
        result = await self.flow.async_step_fritz({"fritz_enabled": False})
        self.assertEqual(result["type"], "menu")
        self.assertEqual(self.flow._values["fritz_password"], "secret")

    async def test_section_checks_only_its_own_connection(self):
        self.flow._values.update(fritz_enabled=True, adguard_enabled=True, adguard_host="dns")
        await self.flow.async_step_fritz({"fritz_enabled": True})
        values = self.ns["async_validate_connections"].call_args.args[1]
        self.assertTrue(values["fritz_enabled"])
        self.assertFalse(values["adguard_enabled"])

    async def test_final_connection_failure_returns_to_matching_section(self):
        async def validate(hass, values):
            if values.get("adguard_enabled"):
                raise self.ns["InvalidAuthError"]()
        self.ns["async_validate_connections"].side_effect = validate
        self.flow._values.update(adguard_enabled=True, adguard_host="dns", adguard_user="user")
        result = await self.flow.async_step_finish({})
        self.assertEqual(result["step_id"], "adguard")
        self.assertEqual(result["errors"], {"base": "invalid_auth"})
        self.monitor.async_set_rules.assert_not_called()

    async def test_ai_edits_are_staged_and_save_only_existing_rule_keys(self):
        values = {"ai_analysis_enabled": True, "ai_analysis_time": "05:20", "ai_privacy": "domains"}
        result = await self.flow.async_step_ai(values)
        self.assertEqual(result["type"], "menu")
        self.monitor.async_set_rules.assert_not_called()
        self.assertFalse(self.monitor.rules["ai_analysis_enabled"])
        saved = await self.flow.async_step_finish({})
        self.monitor.async_set_rules.assert_awaited_once_with(values)
        self.assertNotIn("ai_privacy", saved["data"])

    async def test_invalid_ai_time_does_not_save(self):
        result = await self.flow.async_step_ai({"ai_analysis_enabled": True, "ai_analysis_time": "25:00", "ai_privacy": "anonymized"})
        self.assertEqual(result["errors"], {"ai_analysis_time": "invalid_time"})
        self.monitor.async_set_rules.assert_not_called()

    async def test_ai_changes_are_not_saved_when_final_connection_test_fails(self):
        await self.flow.async_step_ai({"ai_analysis_enabled": True, "ai_analysis_time": "05:20", "ai_privacy": "anonymized"})
        self.flow._values["fritz_enabled"] = True
        self.ns["async_validate_connections"].side_effect = self.ns["CannotConnectError"]()
        result = await self.flow.async_step_finish({})
        self.assertEqual(result["type"], "form")
        self.monitor.async_set_rules.assert_not_called()

    async def test_new_setup_uses_existing_defaults_and_creates_only_on_finish(self):
        flow = self.ns["ConfigFlow"]()
        flow.hass = self.hass
        first = await flow.async_step_user()
        self.assertEqual(first["step_id"], "network")
        result = await flow.async_step_network({"network": "192.0.2.0/24"})
        self.assertEqual(result["type"], "menu")
        saved = await flow.async_step_finish({})
        self.assertEqual(saved["type"], "create_entry")
        self.assertEqual(saved["data"]["ports"], self.ns["DEFAULT_PORTS"])
        self.assertFalse(saved["data"]["fritz_enabled"])

    async def test_reconfigure_and_reauth_update_shadowing_options(self):
        for mode in ("reconfigure", "reauth"):
            flow = self.ns["ConfigFlow"]()
            flow.hass = self.hass
            flow.test_entry = self.entry
            await getattr(flow, "async_step_" + ("reconfigure" if mode == "reconfigure" else "reauth_confirm"))()
            await flow.async_step_network({"scan_interval": 45})
            saved = await flow.async_step_finish({})
            self.assertEqual(saved["options"]["scan_interval"], 45)
            self.assertEqual(saved["options"]["extra_option"], "keep")
            self.assertEqual(saved["reason"], mode + "_successful")

    def test_translations_cover_every_menu_and_field(self):
        for file in ("strings.json", "translations/en.json", "translations/de.json"):
            data = json.loads((COMPONENT / file).read_text(encoding="utf-8"))
            for kind in ("config", "options"):
                steps = data[kind]["step"]
                menu = steps["services" if kind == "config" else "init"]
                self.assertEqual(set(menu["menu_options"]), set(self.ns["SECTION_FIELDS"]) | {"ai", "finish"})
                for section, fields in self.ns["SECTION_FIELDS"].items():
                    self.assertEqual(set(steps[section]["data"]), set(fields))


if __name__ == "__main__":
    unittest.main()
