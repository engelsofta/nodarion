# Nodarion 1.24.3 — Future-proof, warning-proof

> **Same devices, cleaner startup: Nodarion speaks Home Assistant's current
> registry language.**

## Deutsch

Nodarion verwendet für die Zuordnung seiner Geräte jetzt die aktuelle,
eindeutige Identifier-Abfrage von Home Assistant. Damit verschwindet die
Warnung zu `device_registry.async_get_device`, und die Gerätenamen bleiben auch
über mehrere Konfigurationseinträge hinweg korrekt zugeordnet.

Die bisherige Methode funktioniert nur noch übergangsweise und soll mit Home
Assistant 2027.8 entfernt werden. Version 1.24.3 erledigt diese Umstellung
frühzeitig, ohne das sichtbare Verhalten der Integration zu verändern.

---

## English

Nodarion now uses Home Assistant's current identifier-specific device lookup.
This removes the `device_registry.async_get_device` deprecation warning and
keeps device-name updates unambiguous across config entries.

The previous method is scheduled for removal in Home Assistant 2027.8. Version
1.24.3 completes the migration early without changing the integration's visible
behaviour.

## Versions

- Integration: `1.24.3`
- Frontend: `1.29.4`
