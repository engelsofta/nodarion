# Nodarion 1.24.1 — VIP lane for sleepy devices

> **Wichtige Geräte auf die Überholspur – der Rest des Netzes darf entspannt
> weiterrollen.**

## Deutsch

Der schnelle Wiedererkennungsscan ist jetzt vollständig vom normalen
Netzwerkscan getrennt. Alle 15 Sekunden werden ausschließlich wichtige Geräte
geprüft, die tatsächlich offline sind:

- als wichtig überwachte Geräte;
- für die Anwesenheit verwendete Geräte.

Normale bekannte Teilnehmer, rollierende Discovery, FRITZ!Box und AdGuard
bleiben in ihrem regulären Intervall. Dadurch reagiert Nodarion weiterhin
schnell auf zurückkehrende wichtige Geräte, ohne das übrige Netz unnötig zu
prüfen.

Ping meldet ein Gerät sofort wieder online. Eine reine TCP-Erkennung benötigt
weiterhin zwei Treffer und schützt damit vor Phantom-Geräten. Normaler Scan und
Schnellprüfung können sich nicht überschneiden; der Recovery-Task beendet sich,
sobald alle wichtigen Geräte zurück sind oder die Integration entladen wird.

---

## English

Fast recovery is now fully separated from the regular network scan. Every 15
seconds, Nodarion probes only important devices that are actually offline:

- devices marked for important monitoring;
- devices used for presence detection.

Regular known devices, rolling discovery, FRITZ!Box, and AdGuard remain on
their normal schedules. Important devices still return quickly without making
the rest of the network repeat unnecessary work.

Ping restores a device immediately. TCP-only recovery still requires two
matching detections to prevent phantom devices. Normal scans and priority
recovery cannot overlap, and the lightweight task stops when all important
devices are back or the integration unloads.

## Versions

- Integration: `1.24.1`
- Frontend: `1.29.4`
