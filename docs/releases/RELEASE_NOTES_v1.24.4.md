# Nodarion 1.24.4 — Right API, right entry

> **The modern lookup now has the full address: identifier plus config entry.**

## Deutsch

Version 1.24.4 ergänzt die von Home Assistant verlangte Konfigurationseintrags-ID
bei der neuen Geräteabfrage. Damit können Gerätenamen wieder aktualisiert werden,
ohne dass der Coordinator-Listener mit einem `TypeError` abbricht.

Die veraltete Registry-Methode bleibt weiterhin vollständig ersetzt; die neue
Abfrage wird jetzt mit ihrer korrekten vollständigen Signatur verwendet.

---

## English

Version 1.24.4 passes the config-entry ID required by Home Assistant's new device
lookup. Device-name updates can run again without the coordinator listener
raising a missing-argument `TypeError`.

The deprecated registry method remains fully replaced, and the new lookup now
uses its correct complete signature.

## Versions

- Integration: `1.24.4`
- Frontend: `1.29.4`
