"""Persistent monitoring, anomaly detection, and event history."""

from __future__ import annotations

from datetime import datetime, timedelta
import ipaddress
import json
import logging
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN
from .models import NetworkHost, canonical_hostname

STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}.monitor"
MAX_EVENTS = 250
MAX_ALERTS = 100
_LOGGER = logging.getLogger(__name__)
DEFAULT_RULES: dict[str, Any] = {
    "enabled": True,
    "learning_days": 7,
    "presence_timeout_minutes": 5,
    "presence_sensor_enabled": False,
    "onboarding_enabled": True,
    "onboarding_auto_range": True,
    "onboarding_start": "192.168.178.200",
    "onboarding_end": "192.168.178.250",
    "onboarding_auto_monitor": False,
    "onboarding_notify": False,
    "new_device_minutes": 5,
    "quiet_hours_enabled": True,
    "quiet_start": "23:00",
    "quiet_end": "06:00",
    "flap_limit": 6,
    "offline_minutes": 10,
    "identity_changes": True,
    "notify_alerts": False,
    "notify_targets": [],
    "notify_warning": True,
    "notify_critical": True,
    "guest_monitoring_enabled": True,
    "guest_new_enabled": True,
    "guest_quiet_enabled": True,
    "guest_max_hours": 8,
    "ai_analysis_enabled": False,
    "ai_analysis_time": "03:15",
    "ai_privacy": "anonymized",
}


def _now() -> datetime:
    return datetime.now().astimezone()


def _parse(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except (TypeError, ValueError):
        return None


def _is_private_mac(value: str | None) -> bool:
    """Return whether a MAC uses the locally administered address bit."""
    if not value:
        return False
    try:
        first_octet = int(value.replace("-", ":").split(":", 1)[0], 16)
    except (TypeError, ValueError):
        return False
    return bool(first_octet & 0x02)


def _in_onboarding_range(ip: str, rules: dict[str, Any]) -> bool:
    """Return whether an IPv4 address belongs to the setup pool."""
    if not rules.get("onboarding_enabled"):
        return False
    try:
        value = ipaddress.ip_address(ip)
        start = ipaddress.ip_address(rules["onboarding_start"])
        end = ipaddress.ip_address(rules["onboarding_end"])
    except (KeyError, ValueError):
        return False
    return value.version == 4 and min(start, end) <= value <= max(start, end)


class NetworkMonitor:
    """Track important hosts and detect suspicious network activity."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.monitored: set[str] = set()
        self.notifications: set[str] = set()
        self.presence_devices: set[str] = set()
        self.events: list[dict[str, Any]] = []
        self.alerts: list[dict[str, Any]] = []
        self.rules = dict(DEFAULT_RULES)
        self.known_hosts: set[str] = set()
        self.host_inventory: dict[str, dict[str, Any]] = {}
        self.first_seen: dict[str, str] = {}
        self.offline_since: dict[str, str] = {}
        self.transitions: dict[str, list[str]] = {}
        self.guest_since: dict[str, str] = {}
        self.started_at = _now().isoformat()
        self._alert_sequence = 0
        self.internet_guard_initialized = False
        self.ai_reports: list[dict[str, Any]] = []
        self.ai_last_snapshot: dict[str, Any] | None = None
        self.ai_last_run_date: str | None = None
        self.ai_last_error: str | None = None
        self._ai_running = False
        self._store = Store[dict[str, Any]](hass, STORAGE_VERSION, STORAGE_KEY)

    async def async_load(self) -> None:
        """Load saved preferences, rules, alerts, and history."""
        data = await self._store.async_load() or {}
        self.monitored = set(data.get("monitored", []))
        self.notifications = set(data.get("notifications", []))
        self.presence_devices = set(data.get("presence_devices", []))
        self.events = list(data.get("events", []))[-MAX_EVENTS:]
        self.alerts = list(data.get("alerts", []))[-MAX_ALERTS:]
        self.rules.update(data.get("rules", {}))
        rules_migrated = False
        if (
            "presence_sensor_enabled" not in data.get("rules", {})
            and "absence_sensor_enabled" in data.get("rules", {})
        ):
            self.rules["presence_sensor_enabled"] = bool(
                data["rules"]["absence_sensor_enabled"]
            )
            rules_migrated = True
        self.rules.pop("absence_sensor_enabled", None)
        self.known_hosts = set(data.get("known_hosts", []))
        self.host_inventory = {
            key: dict(value)
            for key, value in data.get("host_inventory", {}).items()
            if isinstance(key, str) and isinstance(value, dict)
        }
        self.first_seen = dict(data.get("first_seen", {}))
        self.offline_since = dict(data.get("offline_since", {}))
        self.transitions = {
            key: list(values) for key, values in data.get("transitions", {}).items()
        }
        self.guest_since = dict(data.get("guest_since", {}))
        self.started_at = data.get("started_at") or self.started_at
        self._alert_sequence = int(data.get("alert_sequence", len(self.alerts)))
        self.internet_guard_initialized = bool(
            data.get("internet_guard_initialized", False)
        )
        self.ai_reports = list(data.get("ai_reports", []))[-30:]
        self.ai_last_snapshot = data.get("ai_last_snapshot")
        self.ai_last_run_date = data.get("ai_last_run_date")
        self.ai_last_error = data.get("ai_last_error")
        migrated = self._restore_monitored_inventory_from_history()
        if not data or migrated or rules_migrated:
            await self._async_save()

    async def async_set_host(
        self, key: str, monitored: bool, notify: bool, presence: bool
    ) -> None:
        """Update monitoring settings for one host."""
        if monitored:
            self.monitored.add(key)
        else:
            self.monitored.discard(key)
            notify = False
        if notify:
            self.notifications.add(key)
        else:
            self.notifications.discard(key)
        if presence:
            self.presence_devices.add(key)
        else:
            self.presence_devices.discard(key)
        await self._async_save()

    async def async_initialize_internet_guard(
        self, baseline_keys: set[str] | None = None
    ) -> None:
        """Grandfather all devices known before automatic blocking existed."""
        if self.internet_guard_initialized:
            return
        if not self.host_inventory and not baseline_keys:
            # A fresh installation needs one discovery pass before the guard
            # can distinguish the existing network from genuinely new hosts.
            return
        self.known_hosts.update(self.host_inventory)
        self.known_hosts.update(baseline_keys or ())
        self.internet_guard_initialized = True
        await self._async_save()

    async def async_trust_host(self, key: str) -> None:
        """Mark a device as manually approved."""
        self.known_hosts.add(key)
        await self._async_save()

    async def async_trust_hosts(self, keys: set[str]) -> None:
        """Trust newly discovered devices together during the learning phase."""
        new_keys = keys - self.known_hosts
        if not new_keys:
            return
        self.known_hosts.update(new_keys)
        await self._async_save()

    async def async_untrust_host(self, key: str) -> None:
        """Require approval again after a device identity changes."""
        if key in self.known_hosts:
            self.known_hosts.discard(key)
            await self._async_save()

    async def async_set_rules(self, values: dict[str, Any]) -> None:
        """Validate and save anomaly detection rules."""
        for key in (
            "enabled",
            "quiet_hours_enabled",
            "identity_changes",
            "notify_alerts",
            "notify_warning",
            "notify_critical",
            "ai_analysis_enabled",
            "onboarding_enabled",
            "onboarding_auto_range",
            "onboarding_auto_monitor",
            "onboarding_notify",
            "presence_sensor_enabled",
            "guest_monitoring_enabled",
            "guest_new_enabled",
            "guest_quiet_enabled",
        ):
            if key in values:
                self.rules[key] = bool(values[key])
        for key, (minimum, maximum) in {
            "learning_days": (0, 30),
            "presence_timeout_minutes": (1, 1440),
            "new_device_minutes": (1, 1440),
            "flap_limit": (2, 100),
            "offline_minutes": (1, 10080),
            "guest_max_hours": (1, 168),
        }.items():
            if key in values:
                self.rules[key] = max(minimum, min(maximum, int(values[key])))
        for key in ("quiet_start", "quiet_end", "ai_analysis_time"):
            if key in values and self._valid_time(values[key]):
                self.rules[key] = values[key]
        for key in ("onboarding_start", "onboarding_end"):
            if key not in values:
                continue
            try:
                address = ipaddress.ip_address(str(values[key]).strip())
            except ValueError:
                continue
            if address.version == 4:
                self.rules[key] = str(address)
        try:
            if (
                ipaddress.ip_address(self.rules["onboarding_start"])
                > ipaddress.ip_address(self.rules["onboarding_end"])
            ):
                self.rules["onboarding_start"], self.rules["onboarding_end"] = (
                    self.rules["onboarding_end"],
                    self.rules["onboarding_start"],
                )
        except ValueError:
            pass
        if values.get("ai_privacy") in {"anonymized", "domains"}:
            self.rules["ai_privacy"] = values["ai_privacy"]
        if "notify_targets" in values:
            targets = values["notify_targets"]
            if not isinstance(targets, list):
                raise TypeError("notify_targets must be a list")
            self.rules["notify_targets"] = sorted(
                {
                    target.strip()
                    for target in targets
                    if isinstance(target, str)
                    and target.strip().startswith("notify.")
                    and len(target.strip()) <= 255
                }
            )
        if not self.rules.get("guest_monitoring_enabled", True):
            resolved_at = _now().isoformat()
            for alert in self.alerts:
                if alert.get("type") not in {"guest_new", "guest_quiet", "guest_long"}:
                    continue
                if alert.get("active"):
                    alert["active"] = False
                    alert["resolved_at"] = resolved_at
            self.guest_since.clear()
        await self._async_save()

    def async_maybe_schedule_ai_analysis(
        self,
        coordinator: Any,
        current_hosts: dict[str, NetworkHost] | None = None,
    ) -> None:
        """Schedule the daily AI report once its configured time has passed."""
        if not self.rules.get("ai_analysis_enabled") or self._ai_running:
            return
        now = _now()
        if self.ai_last_run_date == now.date().isoformat():
            return
        hour, minute = map(int, self.rules["ai_analysis_time"].split(":"))
        if (now.hour, now.minute) < (hour, minute):
            return
        self.hass.async_create_task(
            self._async_run_scheduled_ai_analysis(coordinator, current_hosts),
            "Nodarion daily AI analysis",
        )

    async def _async_run_scheduled_ai_analysis(
        self,
        coordinator: Any,
        current_hosts: dict[str, NetworkHost] | None,
    ) -> None:
        """Run a scheduled report without leaking an expected task exception."""
        try:
            await self.async_run_ai_analysis(coordinator, current_hosts)
        except Exception:
            # The error is persisted and shown in the Nodarion panel.
            return

    async def async_run_ai_analysis(
        self,
        coordinator: Any,
        current_hosts: dict[str, NetworkHost] | None = None,
    ) -> dict[str, Any]:
        """Generate and persist a structured network assessment."""
        if self._ai_running:
            raise RuntimeError("Eine KI-Analyse läuft bereits")
        self._ai_running = True
        self.ai_last_error = None
        try:
            snapshot = self._analysis_snapshot(coordinator, current_hosts)
            previous = self.ai_last_snapshot or {}
            comparison = self._snapshot_comparison(previous, snapshot)
            instructions = (
                "Bewerte den folgenden datensparsamen Netzwerk-Tagesbericht. "
                "10 bedeutet unauffällig und sicher, 1 bedeutet akut "
                "untersuchungsbedürftig. Bewerte nur anhand der gelieferten "
                "Daten, erfinde keine Ursachen und erwähne unvollständige "
                "Daten. Normale Mesh-Repeater-Wechsel sind erwünschtes "
                "Roaming mobiler Geräte und müssen neutral oder positiv "
                "bewertet werden. Werte Mesh-Roaming nur dann als mögliche "
                "Auffälligkeit, wenn es gegenüber dem Vortag ungewöhnlich "
                "stark zunimmt und zugleich häufige Online-/Offline-Wechsel "
                "oder andere Verbindungsprobleme vorliegen. Formuliere auf "
                "Deutsch, knapp und konkret.\n\n"
                f"Aktueller Bericht:\n{json.dumps(snapshot, ensure_ascii=False)}"
                f"\n\nÄnderungen zum letzten Bericht:\n"
                f"{json.dumps(comparison, ensure_ascii=False)}"
            )
            response = await self.hass.services.async_call(
                "ai_task",
                "generate_data",
                {
                    "task_name": "Nodarion tägliche Netzwerkanalyse",
                    "instructions": instructions,
                    "structure": {
                        "score": {
                            "description": (
                                "Ganzzahlige Sicherheitsbewertung von 1 bis 10"
                            ),
                            "required": True,
                            "selector": {
                                "number": {"min": 1, "max": 10, "step": 1}
                            },
                        },
                        "summary": {
                            "description": "Kurze Gesamtbewertung",
                            "required": True,
                            "selector": {"text": {"multiline": True}},
                        },
                        "risks": {
                            "description": (
                                "Wichtigste Auffälligkeiten, knapp aufgelistet"
                            ),
                            "required": True,
                            "selector": {"text": {"multiline": True}},
                        },
                        "changes": {
                            "description": "Einordnung gegenüber dem Vortag",
                            "required": True,
                            "selector": {"text": {"multiline": True}},
                        },
                        "recommendations": {
                            "description": "Konkrete empfohlene Prüfungen",
                            "required": True,
                            "selector": {"text": {"multiline": True}},
                        },
                        "confidence": {
                            "description": (
                                "Vertrauen in die Bewertung und Datenlücken"
                            ),
                            "required": True,
                            "selector": {"text": {"multiline": True}},
                        },
                    },
                },
                blocking=True,
                return_response=True,
            )
            result = response.get("data", response) if isinstance(response, dict) else {}
            score = max(1, min(10, int(round(float(result.get("score", 5))))))
            report = {
                "timestamp": _now().isoformat(),
                "score": score,
                "summary": str(result.get("summary") or ""),
                "risks": str(result.get("risks") or ""),
                "changes": str(result.get("changes") or ""),
                "recommendations": str(result.get("recommendations") or ""),
                "confidence": str(result.get("confidence") or ""),
                "prompt": instructions,
                "comparison": comparison,
                "snapshot": snapshot,
            }
            self.ai_reports.append(report)
            self.ai_reports = self.ai_reports[-30:]
            self.ai_last_snapshot = snapshot
            self.ai_last_run_date = _now().date().isoformat()
            await self._async_save()
            return report
        except Exception as err:
            self.ai_last_error = str(err)
            self.ai_last_run_date = _now().date().isoformat()
            await self._async_save()
            raise
        finally:
            self._ai_running = False

    def _analysis_snapshot(
        self,
        coordinator: Any,
        current_hosts: dict[str, NetworkHost] | None = None,
    ) -> dict[str, Any]:
        """Build a compact local snapshot without raw query-log rows."""
        now = _now()
        cutoff = now - timedelta(hours=24)
        host_map = current_hosts if current_hosts is not None else coordinator.data
        hosts = list((host_map or {}).values())
        events = [
            item
            for item in self.events
            if (_parse(item.get("timestamp")) or now) >= cutoff
        ]
        event_counts: dict[str, int] = {}
        mesh_roaming_events = 0
        for item in events:
            event_type = str(item.get("type") or "unknown")
            if event_type == "mesh_changed":
                mesh_roaming_events += 1
                continue
            event_counts[event_type] = event_counts.get(event_type, 0) + 1
        scanner = coordinator.adguard_scanner
        dns = scanner.analysis_snapshot(
            include_domains=self.rules.get("ai_privacy") == "domains"
        ) if scanner is not None else {"available": False}
        return {
            "period_hours": 24,
            "generated_at": now.isoformat(),
            "participants": {
                "total": len(hosts),
                "online": sum(host.online for host in hosts),
                "offline": sum(not host.online for host in hosts),
                "private_mac": sum(_is_private_mac(host.mac) for host in hosts),
                "monitored": len(self.monitored),
            },
            "events": event_counts,
            "normal_mesh_roaming": {
                "repeater_changes": mesh_roaming_events,
                "assessment": (
                    "Erwartetes positives Roaming; allein kein Risiko"
                ),
            },
            "active_alerts": sum(
                bool(item.get("active")) and not item.get("acknowledged")
                for item in self.alerts
            ),
            "dns": dns,
            "privacy": self.rules.get("ai_privacy", "anonymized"),
        }

    @staticmethod
    def _snapshot_comparison(
        previous: dict[str, Any],
        current: dict[str, Any],
    ) -> dict[str, Any]:
        """Calculate deterministic day-to-day changes before asking the AI."""
        if not previous:
            return {"baseline": True, "message": "Noch kein vorheriger Bericht"}
        changes: dict[str, Any] = {"baseline": False}
        for section in (
            "participants",
            "events",
            "normal_mesh_roaming",
            "dns",
        ):
            old_values = previous.get(section) or {}
            new_values = current.get(section) or {}
            section_changes = {}
            for key, new_value in new_values.items():
                old_value = old_values.get(key)
                if (
                    isinstance(new_value, (int, float))
                    and isinstance(old_value, (int, float))
                ):
                    section_changes[key] = round(new_value - old_value, 2)
            changes[section] = section_changes
        old_dns = previous.get("dns") or {}
        new_dns = current.get("dns") or {}
        privacy_changed = previous.get("privacy") != current.get("privacy")
        changes["privacy_changed"] = privacy_changed
        for key in ("top_domains", "top_blocked_domains"):
            old_names = {
                str(item[0])
                for item in old_dns.get(key, [])
                if isinstance(item, list) and item
            }
            new_names = {
                str(item[0])
                for item in new_dns.get(key, [])
                if isinstance(item, list) and item
            }
            changes["dns"][f"new_{key}"] = (
                [] if privacy_changed else sorted(new_names - old_names)
            )
            changes["dns"][f"gone_{key}"] = (
                [] if privacy_changed else sorted(old_names - new_names)
            )
        changes["active_alerts"] = (
            current.get("active_alerts", 0) - previous.get("active_alerts", 0)
        )
        return changes

    async def async_restart_learning(self, current_keys: set[str]) -> None:
        """Restart learning and trust all participants currently present."""
        self.started_at = _now().isoformat()
        self.known_hosts.update(current_keys)
        await self._async_save()

    async def async_acknowledge(self, alert_id: str) -> None:
        """Acknowledge an alert and trust a newly discovered host."""
        for alert in self.alerts:
            if alert.get("id") != alert_id:
                continue
            alert["acknowledged"] = True
            alert["active"] = False
            alert["acknowledged_at"] = _now().isoformat()
            break
        await self._async_save()

    async def async_process(
        self,
        previous: dict[str, NetworkHost],
        current: dict[str, NetworkHost],
    ) -> None:
        """Record changes and evaluate all enabled monitoring rules."""
        now = _now()
        changed = False
        learning = self._is_learning(now)
        guest_monitoring = self.rules.get("guest_monitoring_enabled", True)
        previous_by_mac = {
            host.mac: (key, host)
            for key, host in previous.items()
            if host.mac
        }

        for key, host in current.items():
            inventory_entry = self._inventory_entry(host)
            if self.host_inventory.get(key) != inventory_entry:
                self.host_inventory[key] = inventory_entry
                changed = True
            old = previous.get(key)
            if old is None:
                prior = previous_by_mac.get(host.mac) if host.mac else None
                if prior and prior[0] != key:
                    prior_key, prior_host = prior
                    for collection in (
                        self.monitored,
                        self.notifications,
                        self.presence_devices,
                        self.known_hosts,
                    ):
                        if prior_key in collection:
                            collection.discard(prior_key)
                            collection.add(key)
                    if prior_key in self.first_seen:
                        self.first_seen[key] = self.first_seen.pop(prior_key)
                    if (
                        _in_onboarding_range(prior_host.ip, self.rules)
                        and not _in_onboarding_range(host.ip, self.rules)
                    ):
                        self._add_event(
                            "device_assigned",
                            host,
                            (
                                f"{host.display_name} erfolgreich zugeordnet: "
                                f"{prior_host.ip} → {host.ip}"
                            ),
                            old_ip=prior_host.ip,
                            new_ip=host.ip,
                            service="Geräte-Einrichtung",
                        )
                self.first_seen.setdefault(key, now.isoformat())
                if _in_onboarding_range(host.ip, self.rules):
                    if self.rules.get("onboarding_auto_monitor"):
                        self.monitored.add(key)
                    if self.rules.get("onboarding_notify"):
                        persistent_notification.async_create(
                            self.hass,
                            (
                                f"**{host.display_name}** ({host.ip}) befindet "
                                "sich im Einrichtungsbereich."
                            ),
                            title="Nodarion: Neues Gerät",
                            notification_id=f"{DOMAIN}_onboarding_{key}",
                        )
                if guest_monitoring or not host.guest_network:
                    self._add_event(
                        "discovered",
                        host,
                        f"{host.display_name} entdeckt",
                        service=self._service_for(host),
                    )
                if learning and not self.internet_guard_initialized:
                    self.known_hosts.add(key)
                changed = True
            elif old.online != host.online and (
                guest_monitoring or not host.guest_network
            ):
                changed = self._process_status_change(old, host, now) or changed

            if not guest_monitoring and host.guest_network:
                if self.guest_since.pop(key, None) is not None:
                    changed = True
                for alert_type in ("guest_new", "guest_quiet", "guest_long"):
                    changed = self._resolve_alert(alert_type, key, now) or changed
            guest_active = guest_monitoring and host.online and host.guest_network
            guest_was_active = bool(
                guest_monitoring
                and old is not None
                and old.online
                and old.guest_network
            )
            if guest_active and not guest_was_active:
                self.guest_since[key] = now.isoformat()
                self._add_event(
                    "guest_joined",
                    host,
                    f"{host.display_name} ist dem Gastnetz beigetreten",
                    service="FRITZ!Box Gastzugang",
                )
                if self.rules["enabled"]:
                    if self.rules.get("guest_new_enabled", True):
                        self._add_alert(
                            "guest_new",
                            "warning",
                            host,
                            "Neues Gerät ist im Gastzugang aktiv.",
                            now,
                            service="FRITZ!Box Gastzugang",
                        )
                    if (
                        self.rules.get("guest_quiet_enabled", True)
                        and self._in_quiet_hours(now)
                    ):
                        self._add_alert(
                            "guest_quiet",
                            "warning",
                            host,
                            "Gastgerät wurde während der Ruhezeit aktiv.",
                            now,
                            service="FRITZ!Box Gastzugang",
                        )
                changed = True
            elif guest_was_active and not guest_active:
                self._add_event(
                    "guest_left",
                    host,
                    f"{host.display_name} hat das Gastnetz verlassen",
                    service="FRITZ!Box Gastzugang",
                )
                self.guest_since.pop(key, None)
                for alert_type in ("guest_new", "guest_quiet", "guest_long"):
                    changed = self._resolve_alert(alert_type, key, now) or changed
                changed = True
            elif guest_active:
                if key not in self.guest_since:
                    self.guest_since[key] = now.isoformat()
                    changed = True
                since = _parse(self.guest_since[key])
                if (
                    self.rules["enabled"]
                    and since is not None
                    and now - since
                    >= timedelta(hours=int(self.rules.get("guest_max_hours", 8)))
                ):
                    changed = (
                        self._add_alert(
                            "guest_long",
                            "warning",
                            host,
                            (
                                "Gastgerät ist seit mindestens "
                                f"{self.rules.get('guest_max_hours', 8)} Stunden verbunden."
                            ),
                            now,
                            service="FRITZ!Box Gastzugang",
                        )
                        or changed
                    )

            if (
                old is not None
                and self.rules["enabled"]
                and self.rules["identity_changes"]
                and old.mac
                and host.mac
                and old.mac != host.mac
                and not _is_private_mac(old.mac)
                and not _is_private_mac(host.mac)
            ):
                changed = (
                    self._add_alert(
                        "identity_changed",
                        "warning",
                        host,
                        f"An {host.ip} wurde eine andere MAC-Adresse erkannt.",
                        now,
                        old_mac=old.mac,
                        new_mac=host.mac,
                        service=self._service_for(host, "identity"),
                    )
                    or changed
                )

            if (
                old is not None
                and canonical_hostname(old.hostname)
                != canonical_hostname(host.hostname)
            ):
                old_name = old.hostname or old.display_name
                new_name = host.hostname or host.display_name
                self._add_event(
                    "renamed",
                    host,
                    f"Name geändert: {old_name} → {new_name}",
                    service=self._service_for(host, "identity"),
                )
                changed = True

            if (
                old is not None
                and old.access_point
                and host.access_point
                and old.access_point != host.access_point
            ):
                self._add_event(
                    "mesh_changed",
                    host,
                    (
                        f"{host.display_name}: Mesh-Wechsel von "
                        f"{old.access_point} nach {host.access_point}"
                    ),
                    from_access_point=old.access_point,
                    to_access_point=host.access_point,
                    service="FRITZ!Box",
                )
                changed = True

            if not self.rules["enabled"]:
                continue
            if learning:
                if key not in self.known_hosts:
                    self.known_hosts.add(key)
                    changed = True
            elif (
                host.online
                and not host.guest_network
                and key not in self.known_hosts
            ):
                first_seen = _parse(self.first_seen.get(key)) or now
                if now - first_seen >= timedelta(
                    minutes=self.rules["new_device_minutes"]
                ):
                    changed = (
                        self._add_alert(
                            "new_device",
                            "warning",
                            host,
                            (
                                f"Unbekanntes Gerät ist seit mindestens "
                                f"{self.rules['new_device_minutes']} Minuten online."
                            ),
                            now,
                        )
                        or changed
                    )

            if host.online:
                self.offline_since.pop(key, None)
                changed = self._resolve_alert("important_offline", key, now) or changed
            elif key in self.monitored:
                since = _parse(self.offline_since.get(key))
                if since and now - since >= timedelta(
                    minutes=self.rules["offline_minutes"]
                ):
                    changed = (
                        self._add_alert(
                            "important_offline",
                            "critical",
                            host,
                            (
                                f"Wichtiges Gerät ist seit mindestens "
                                f"{self.rules['offline_minutes']} Minuten offline."
                            ),
                            now,
                        )
                        or changed
                    )

        if changed:
            await self._async_save()

    def restored_hosts(self) -> dict[str, NetworkHost]:
        """Recreate the last known participants after a Home Assistant restart."""
        restored: dict[str, NetworkHost] = {}
        for key, item in self.host_inventory.items():
            ip = str(item.get("ip") or "").strip()
            if not key.startswith("ip_") or not ip:
                continue
            restored[key] = NetworkHost(
                key=key,
                ip=ip,
                mac=item.get("mac"),
                hostname=item.get("hostname"),
                online=bool(item.get("online", False)),
                sources=tuple(item.get("sources") or ("ping_tcp",)),
                access_point=item.get("access_point"),
                connection_type=item.get("connection_type"),
                wifi_band=item.get("wifi_band"),
                address_source=item.get("address_source"),
                fritzbox_model=item.get("fritzbox_model"),
                fritzos_version=item.get("fritzos_version"),
                wan_access=item.get("wan_access"),
                internet_approval_required=bool(
                    item.get("internet_approval_required", False)
                ),
                guest_network=bool(item.get("guest_network", False)),
            )
        return restored

    async def async_forget_hosts(
        self, keys: set[str], *, force: bool = False
    ) -> None:
        """Remove hosts from persistent inventory."""
        changed = False
        for key in keys:
            if (
                key in self.monitored or key in self.presence_devices
            ) and not force:
                continue
            if force:
                changed = (
                    key in self.monitored
                    or key in self.notifications
                    or key in self.presence_devices
                    or changed
                )
                self.monitored.discard(key)
                self.notifications.discard(key)
                self.presence_devices.discard(key)
            changed = self.host_inventory.pop(key, None) is not None or changed
            self.first_seen.pop(key, None)
            self.offline_since.pop(key, None)
            self.known_hosts.discard(key)
            self.transitions.pop(key, None)
            self.guest_since.pop(key, None)
        if changed:
            await self._async_save()

    @staticmethod
    def _inventory_entry(host: NetworkHost) -> dict[str, Any]:
        """Return stable host data worth keeping across restarts."""
        return {
            "ip": host.ip,
            "mac": host.mac,
            "hostname": host.hostname,
            "online": host.online,
            "sources": list(host.sources),
            "access_point": host.access_point,
            "connection_type": host.connection_type,
            "wifi_band": host.wifi_band,
            "address_source": host.address_source,
            "fritzbox_model": host.fritzbox_model,
            "fritzos_version": host.fritzos_version,
            "wan_access": host.wan_access,
            "internet_approval_required": host.internet_approval_required,
            "guest_network": host.guest_network,
        }

    def _restore_monitored_inventory_from_history(self) -> bool:
        """Migrate monitored participants saved before inventory existed."""
        migrated = False
        for key in self.monitored:
            if key in self.host_inventory:
                continue
            event = next(
                (
                    item
                    for item in reversed(self.events)
                    if item.get("key") == key and item.get("ip")
                ),
                None,
            )
            ip = str(event.get("ip") if event else key.removeprefix("ip_"))
            try:
                ipaddress.ip_address(ip)
            except ValueError:
                continue
            name = str(event.get("name") or "").strip() or None if event else None
            self.host_inventory[key] = {
                "ip": ip,
                "mac": None,
                "hostname": None if name in {ip, key} else name,
                "online": False,
                "sources": ["ping_tcp"],
                "access_point": None,
                "connection_type": None,
                "wifi_band": None,
                "address_source": None,
                "fritzbox_model": None,
                "fritzos_version": None,
            }
            migrated = True
        return migrated

    def _process_status_change(
        self, old: NetworkHost, host: NetworkHost, now: datetime
    ) -> bool:
        event_type = "online" if host.online else "offline"
        message = (
            f"{host.display_name} ist wieder online"
            if host.online
            else f"{host.display_name} ist offline"
        )
        self._add_event(
            event_type, host, message, service=self._service_for(host)
        )
        if host.online:
            self.offline_since.pop(host.key, None)
            self._resolve_alert("important_offline", host.key, now)
            if host.key not in self.known_hosts:
                self.first_seen[host.key] = now.isoformat()
            if (
                self.rules["enabled"]
                and self.rules["quiet_hours_enabled"]
                and not host.guest_network
                and self._in_quiet_hours(now)
            ):
                self._add_alert(
                    "quiet_activity",
                    "warning",
                    host,
                    "Gerät wurde während der eingestellten Ruhezeit aktiv.",
                    now,
                )
        else:
            self.offline_since[host.key] = now.isoformat()
            if host.key not in self.known_hosts:
                self.first_seen.pop(host.key, None)
            if host.key in self.notifications:
                persistent_notification.async_create(
                    self.hass,
                    (
                        f"Der überwachte Netzwerkteilnehmer "
                        f"**{host.display_name}** ({host.ip}) ist offline."
                    ),
                    title="Engelsoft Nodarion",
                    notification_id=f"{DOMAIN}_{host.key}_offline",
                )

        cutoff = now - timedelta(hours=1)
        recent = [
            stamp
            for stamp in self.transitions.get(host.key, [])
            if (_parse(stamp) or cutoff) >= cutoff
        ]
        recent.append(now.isoformat())
        self.transitions[host.key] = recent
        if self.rules["enabled"] and len(recent) >= self.rules["flap_limit"]:
            self._add_alert(
                "flapping",
                "warning",
                host,
                f"{len(recent)} Statuswechsel innerhalb einer Stunde erkannt.",
                now,
                transition_count=len(recent),
            )
        return True

    def as_dict(self) -> dict[str, Any]:
        """Return complete frontend state."""
        now = _now()
        started = _parse(self.started_at) or now
        learning_end = started + timedelta(days=self.rules["learning_days"])
        events = [
            event
            for event in self.events
            if event.get("type") != "mesh_changed"
            or (event.get("from_access_point") and event.get("to_access_point"))
        ]
        active_alerts = [
            alert
            for alert in self.alerts
            if alert.get("active") and not alert.get("acknowledged")
        ]
        return {
            "monitored": sorted(self.monitored),
            "notifications": sorted(self.notifications),
            "presence_devices": sorted(self.presence_devices),
            "events": list(reversed(events)),
            "alerts": list(reversed(self.alerts)),
            "rules": dict(self.rules),
            "known_hosts": sorted(self.known_hosts),
            "guest_since": dict(self.guest_since),
            "learning": {
                "active": now < learning_end,
                "ends_at": learning_end.isoformat(),
                "started_at": started.isoformat(),
            },
            "summary": {
                "active": len(active_alerts),
                "critical": sum(
                    alert.get("severity") == "critical" for alert in active_alerts
                ),
                "unknown": sum(
                    alert.get("type") == "new_device" for alert in active_alerts
                ),
                "unstable": sum(
                    alert.get("type") == "flapping" for alert in active_alerts
                ),
            },
            "ai_analysis": {
                "running": self._ai_running,
                "last_error": self.ai_last_error,
                "last_run_date": self.ai_last_run_date,
                "reports": list(reversed(self.ai_reports)),
            },
        }

    def _add_alert(
        self,
        alert_type: str,
        severity: str,
        host: NetworkHost,
        message: str,
        now: datetime,
        **details: Any,
    ) -> bool:
        if self._active_alert(alert_type, host.key):
            return False
        # Acknowledging a persistent offline condition must not create the
        # same warning again on every scan.  Keep it suppressed until the
        # participant has actually recovered; _resolve_alert records that
        # recovery and allows a later, genuinely new outage to alert again.
        if alert_type == "important_offline":
            latest = self._latest_alert(alert_type, host.key)
            if (
                latest
                and latest.get("acknowledged")
                and not latest.get("resolved_at")
            ):
                return False
        self._alert_sequence += 1
        alert = {
            "id": f"alert_{self._alert_sequence}",
            "timestamp": now.isoformat(),
            "type": alert_type,
            "severity": severity,
            "key": host.key,
            "ip": host.ip,
            "name": host.display_name,
            "message": message,
            "active": True,
            "acknowledged": False,
            **details,
        }
        self.alerts.append(alert)
        self.alerts = self.alerts[-MAX_ALERTS:]
        self._add_event(
            "alert",
            host,
            message,
            alert_type=alert_type,
            service=details.get("service", "Nodarion-Überwachung"),
        )
        event_data = {
            "alert_id": alert["id"],
            "type": alert_type,
            "severity": severity,
            "device_key": host.key,
            "device_name": host.display_name,
            "ip_address": host.ip,
            "mac_address": host.mac,
            "access_point": host.access_point,
            "message": message,
            "timestamp": alert["timestamp"],
            "service": details.get("service", "Nodarion-Überwachung"),
        }
        self.hass.bus.async_fire(f"{DOMAIN}_alert", event_data)
        if self.rules["notify_alerts"]:
            persistent_notification.async_create(
                self.hass,
                f"**{host.display_name}** ({host.ip}): {message}",
                title="Nodarion Netzwerküberwachung",
                notification_id=f"{DOMAIN}_{alert['id']}",
            )
        targets = self.rules.get("notify_targets", [])
        if targets and self.rules.get(f"notify_{severity}", False):
            self.hass.async_create_task(
                self._async_send_alert(targets, event_data)
            )
        return True

    async def _async_send_alert(
        self, targets: list[str], event_data: dict[str, Any]
    ) -> None:
        """Deliver one alert through Home Assistant notify entities."""
        title = (
            "Nodarion: Kritische Netzwerkwarnung"
            if event_data["severity"] == "critical"
            else "Nodarion: Netzwerkwarnung"
        )
        message = (
            f"{event_data['device_name']} ({event_data['ip_address']}): "
            f"{event_data['message']}"
        )
        for target in targets:
            if self.hass.states.get(target) is None:
                _LOGGER.warning("Nodarion notify target %s is not available", target)
                continue
            try:
                await self.hass.services.async_call(
                    "notify",
                    "send_message",
                    {
                        "title": title,
                        "message": message,
                    },
                    blocking=False,
                    target={"entity_id": target},
                )
            except Exception:
                _LOGGER.exception(
                    "Nodarion could not send an alert to %s", target
                )

    def _active_alert(self, alert_type: str, key: str) -> dict[str, Any] | None:
        return next(
            (
                alert
                for alert in reversed(self.alerts)
                if alert.get("type") == alert_type
                and alert.get("key") == key
                and alert.get("active")
                and not alert.get("acknowledged")
            ),
            None,
        )

    def _latest_alert(self, alert_type: str, key: str) -> dict[str, Any] | None:
        return next(
            (
                alert
                for alert in reversed(self.alerts)
                if alert.get("type") == alert_type and alert.get("key") == key
            ),
            None,
        )

    def _resolve_alert(self, alert_type: str, key: str, now: datetime) -> bool:
        alert = self._latest_alert(alert_type, key)
        if not alert or alert.get("resolved_at"):
            return False
        alert["active"] = False
        alert["resolved_at"] = now.isoformat()
        return True

    def _is_learning(self, now: datetime) -> bool:
        started = _parse(self.started_at) or now
        return now < started + timedelta(days=self.rules["learning_days"])

    @property
    def is_learning(self) -> bool:
        """Return whether monitoring is currently learning the network."""
        return self._is_learning(_now())

    def _in_quiet_hours(self, now: datetime) -> bool:
        start_hour, start_minute = map(int, self.rules["quiet_start"].split(":"))
        end_hour, end_minute = map(int, self.rules["quiet_end"].split(":"))
        current = now.hour * 60 + now.minute
        start = start_hour * 60 + start_minute
        end = end_hour * 60 + end_minute
        if start == end:
            return True
        if start > end:
            return current >= start or current < end
        return start <= current < end

    @staticmethod
    def _valid_time(value: Any) -> bool:
        if not isinstance(value, str):
            return False
        try:
            hour, minute = map(int, value.split(":"))
            return 0 <= hour <= 23 and 0 <= minute <= 59
        except (TypeError, ValueError):
            return False

    def _add_event(
        self,
        event_type: str,
        host: NetworkHost,
        message: str,
        **details: Any,
    ) -> None:
        self.events.append(
            {
                "timestamp": _now().isoformat(),
                "type": event_type,
                "key": host.key,
                "ip": host.ip,
                "name": host.display_name,
                "message": message,
                **details,
            }
        )
        self.events = self.events[-MAX_EVENTS:]

    @staticmethod
    def _service_for(host: NetworkHost, change: str | None = None) -> str:
        """Return the internal data source responsible for a recorded change."""
        sources = set(host.sources)
        if "fritzbox" in sources and change == "identity":
            return "FRITZ!Box"
        if "fritzbox" in sources and not ({"ping", "tcp"} & sources):
            return "FRITZ!Box"
        if {"ping", "tcp", "ping_tcp"} & sources:
            return "Ping/TCP-Scanner"
        return "Nodarion-Überwachung"

    async def _async_save(self) -> None:
        await self._store.async_save(
            {
                "monitored": sorted(self.monitored),
                "notifications": sorted(self.notifications),
                "presence_devices": sorted(self.presence_devices),
                "events": self.events,
                "alerts": self.alerts,
                "rules": self.rules,
                "known_hosts": sorted(self.known_hosts),
                "host_inventory": self.host_inventory,
                "first_seen": self.first_seen,
                "offline_since": self.offline_since,
                "transitions": self.transitions,
                "guest_since": self.guest_since,
                "started_at": self.started_at,
                "alert_sequence": self._alert_sequence,
                "internet_guard_initialized": self.internet_guard_initialized,
                "ai_reports": self.ai_reports,
                "ai_last_snapshot": self.ai_last_snapshot,
                "ai_last_run_date": self.ai_last_run_date,
                "ai_last_error": self.ai_last_error,
            }
        )
