"""Authenticated HTTP API for the Engelsoft Nodarion panel."""

from __future__ import annotations

from dataclasses import asdict
from datetime import datetime
import ipaddress
import logging

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN, FRONTEND_VERSION, INTEGRATION_VERSION
from .monitor import NetworkMonitor

_LOGGER = logging.getLogger(__name__)


class NodarionView(HomeAssistantView):
    """Expose monitoring preferences, rules, alerts, and event history."""

    url = f"/api/{DOMAIN}/monitor"
    name = f"api:{DOMAIN}:monitor"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Return saved monitor state."""
        manager = self._manager(request)
        if manager is None:
            return self.json_message("Integration ist nicht geladen", 503)
        view = request.query.get("view")
        if view in {"adguard_live", "adguard_config"}:
            coordinator = self._coordinator(request)
            scanner = coordinator.adguard_scanner if coordinator else None
            if scanner is None:
                return self.json_message("AdGuard Home ist nicht eingerichtet", 503)
            if view == "adguard_config":
                if not self._is_admin(request):
                    return self.json_message(
                        "Nur Administratoren dürfen AdGuard verwalten", 403
                    )
                try:
                    return self.json(await scanner.async_configuration())
                except Exception:
                    return self.json_message(
                        "AdGuard-Konfiguration ist nicht erreichbar", 502
                    )
            client = str(request.query.get("client") or "").strip()
            if client:
                try:
                    ipaddress.ip_address(client)
                except ValueError:
                    return self.json_message("Ungültige Client-IP", 400)
            try:
                rows = await scanner.async_query_log(client or None)
            except Exception:
                return self.json_message("AdGuard Home ist nicht erreichbar", 502)
            return self.json(
                {
                    "entries": rows,
                    "series": scanner.query_series(
                        client or None,
                        min(24, scanner.period_hours),
                    ),
                    "client": client or None,
                    "updated_at": datetime.now().astimezone().isoformat(),
                }
            )
        return self.json(self._frontend_state(request, manager))

    async def post(self, request: web.Request) -> web.Response:
        """Change host preferences, detection rules, or alert state."""
        manager = self._manager(request)
        if manager is None:
            return self.json_message("Integration ist nicht geladen", 503)
        if not self._is_admin(request):
            return self.json_message(
                "Nur Administratoren dürfen Nodarion verändern", 403
            )
        try:
            data = await request.json()
        except ValueError:
            return self.json_message("Ungültige Anfrage", 400)

        action = data.get("action", "set_host")
        if isinstance(action, str) and action.startswith("adguard_"):
            return await self._adguard_action(request, action, data)
        if action == "cleanup_inactive":
            coordinator = self._coordinator(request)
            if coordinator is None:
                return self.json_message("Integration ist nicht geladen", 503)
            removed = await coordinator.async_cleanup_inactive(
                forget=bool(data.get("forget", True))
            )
            response = self._frontend_state(request, manager)
            response["cleanup_result"] = {"removed": removed}
            return self.json(response)
        if action == "approve_internet":
            key = data.get("key")
            coordinator = self._coordinator(request)
            if (
                coordinator is None
                or not isinstance(key, str)
                or not key.startswith("ip_")
            ):
                return self.json_message("Ungültiger Teilnehmer", 400)
            try:
                await coordinator.async_approve_internet_access(key)
            except Exception as err:
                _LOGGER.exception(
                    "Could not approve internet access for %s",
                    key,
                )
                return self.json_message(
                    f"Internetzugang konnte nicht freigegeben werden: {err}",
                    502,
                )
            await manager.async_acknowledge_new_device_alerts(key)
            return self.json(self._frontend_state(request, manager))
        if action == "set_rules":
            rules = data.get("rules")
            if not isinstance(rules, dict):
                return self.json_message("Ungültige Regeln", 400)
            try:
                await manager.async_set_rules(rules)
            except (TypeError, ValueError):
                return self.json_message("Ungültige Regeln", 400)
        elif action == "run_ai_analysis":
            coordinator = self._coordinator(request)
            if coordinator is None:
                return self.json_message("Integration ist nicht geladen", 503)
            try:
                language = "de" if data.get("language") == "de" else "en"
                await manager.async_run_ai_analysis(coordinator, language=language)
            except Exception as err:
                return self.json_message(
                    f"KI-Analyse fehlgeschlagen: {err}", 502
                )
        elif action == "restart_learning":
            coordinator = self._coordinator(request)
            current_keys = set(coordinator.data) if coordinator and coordinator.data else set()
            await manager.async_restart_learning(current_keys)
        elif action == "extend_learning":
            await manager.async_extend_learning(7)
        elif action == "end_learning":
            await manager.async_end_learning()
        elif action == "acknowledge":
            alert_id = data.get("alert_id")
            if not isinstance(alert_id, str):
                return self.json_message("Ungültige Warnung", 400)
            alert = next(
                (
                    item
                    for item in manager.alerts
                    if item.get("id") == alert_id
                ),
                None,
            )
            if alert and alert.get("type") == "new_device" and alert.get("key"):
                coordinator = self._coordinator(request)
                if coordinator is None:
                    return self.json_message("Integration ist nicht geladen", 503)
                try:
                    await coordinator.async_approve_internet_access(alert["key"])
                except Exception as err:
                    _LOGGER.exception(
                        "Could not approve internet access while acknowledging %s",
                        alert["key"],
                    )
                    return self.json_message(
                        f"Bestätigung fehlgeschlagen, weil der Internetzugang "
                        f"nicht freigegeben werden konnte: {err}",
                        502,
                    )
                await manager.async_acknowledge_new_device_alerts(alert["key"])
            else:
                await manager.async_acknowledge(alert_id)
        else:
            key = data.get("key")
            if not isinstance(key, str) or not key.startswith("ip_"):
                return self.json_message("Ungültiger Teilnehmer", 400)
            await manager.async_set_host(
                key,
                bool(data.get("monitored")),
                bool(data.get("notify")),
                bool(data.get("presence")),
            )
        coordinator = self._coordinator(request)
        if coordinator is not None:
            coordinator.async_update_listeners()
        return self.json(self._frontend_state(request, manager))

    async def _adguard_action(
        self,
        request: web.Request,
        action: str,
        data: dict,
    ) -> web.Response:
        """Validate and execute one administrator-only AdGuard mutation."""
        if not self._is_admin(request):
            return self.json_message(
                "Nur Administratoren dürfen AdGuard verändern", 403
            )
        coordinator = self._coordinator(request)
        scanner = coordinator.adguard_scanner if coordinator else None
        if scanner is None:
            return self.json_message("AdGuard Home ist nicht eingerichtet", 503)

        try:
            if action == "adguard_set_domain_policy":
                result = await scanner.async_set_domain_policy(
                    data.get("domain"), data.get("policy"), data.get("client")
                )
            elif action == "adguard_add_rule":
                result = await scanner.async_add_custom_rule(data.get("rule"))
            elif action == "adguard_delete_rule":
                result = await scanner.async_delete_custom_rule(data.get("rule"))
            elif action == "adguard_add_rewrite":
                result = await scanner.async_add_rewrite(
                    data.get("domain"), data.get("answer")
                )
            elif action == "adguard_delete_rewrite":
                result = await scanner.async_delete_rewrite(
                    data.get("domain"), data.get("answer")
                )
            else:
                return self.json_message("Unbekannte AdGuard-Aktion", 400)
        except (TypeError, ValueError):
            return self.json_message("Ungültige AdGuard-Eingabe", 400)
        except Exception:
            _LOGGER.exception("AdGuard action %s failed", action)
            return self.json_message("AdGuard-Änderung fehlgeschlagen", 502)
        user = request.get("hass_user")
        _LOGGER.info(
            "AdGuard action %s completed by Home Assistant user %s",
            action,
            getattr(user, "name", None) or getattr(user, "id", "unknown"),
        )
        return self.json(result)

    @classmethod
    def _frontend_state(
        cls, request: web.Request, manager: NetworkMonitor
    ) -> dict:
        """Return monitor state plus the coordinator's live participants.

        New coordinator hosts can exist briefly before Home Assistant has
        created their binary-sensor state. Supplying the live inventory keeps
        the panel complete during that registration window.
        """
        response = manager.as_dict()
        response["versions"] = {
            "integration": INTEGRATION_VERSION,
            "frontend": FRONTEND_VERSION,
        }
        coordinator = cls._coordinator(request)
        response["guest_access"] = (
            dict(coordinator.fritz_scanner.guest_info)
            if coordinator is not None and coordinator.fritz_scanner is not None
            else {"available": False, "enabled": False, "clients": 0}
        )
        if not cls._is_admin(request):
            response["guest_access"].pop("qr_code", None)
            response["guest_access"]["qr_code_restricted"] = True
        participants = []
        if coordinator is not None and coordinator.data:
            for host in coordinator.data.values():
                attributes = asdict(host)
                attributes["nodarion_key"] = host.key
                attributes["ip_address"] = host.ip
                attributes["mac_address"] = host.mac
                attributes["detection_sources"] = list(host.sources)
                attributes["trusted"] = manager.is_trusted(host)
                attributes["trust_status"] = manager.trust_status(host)
                attributes["connection_status"] = {
                    key: dict(status)
                    for key, status in coordinator.connection_status.items()
                }
                participants.append(
                    {
                        "entity_id": (
                            f"binary_sensor.{host.ip.replace('.', '_')}"
                        ),
                        "state": "on" if host.online else "off",
                        "last_changed": None,
                        "last_updated": None,
                        "attributes": attributes,
                    }
                )
        response["participants"] = participants
        return response

    @staticmethod
    def _manager(request: web.Request) -> NetworkMonitor | None:
        hass: HomeAssistant = request.app["hass"]
        return hass.data.get(DOMAIN, {}).get("monitor")

    @staticmethod
    def _coordinator(request: web.Request):
        """Return the active network coordinator."""
        hass: HomeAssistant = request.app["hass"]
        return hass.data.get(DOMAIN, {}).get("coordinator")

    @staticmethod
    def _is_admin(request: web.Request) -> bool:
        """Return whether the authenticated Home Assistant user is an admin."""
        user = request.get("hass_user")
        return bool(user and user.is_admin)
