# Nodarion 1.24.2 — Starts fast. Stays vigilant.

> **Nodarion ist sofort da. Seine Langstreckenläufer halten Home Assistant
> nicht länger an der Startlinie fest.**

## Deutsch

Nodarion stellt beim Start jetzt sofort den zuletzt gespeicherten
Teilnehmerbestand bereit. Entitäten, Dienste und die Oberfläche erhalten damit
direkt einen konsistenten Zustand, während der erste aktive Netzwerkscan im
Hintergrund frische Daten einsammelt.

Auch die dauerhafte Schnellprüfung wichtiger Offline-Geräte ist nun ausdrücklich
als Hintergrundaufgabe registriert. Home Assistant verwechselt diese gewollt
lang laufende Schleife dadurch nicht mehr mit unfertiger Startarbeit und wartet
nicht länger bis zum Bootstrap-Timeout.

Beide Hintergrundaufgaben werden beim Entladen der Integration weiterhin sauber
beendet.

---

## English

Nodarion now restores its persisted participant inventory immediately during
startup. Entities, services, and the panel receive a consistent state right
away while the first active network scan refreshes the data in the background.

The persistent fast-recovery loop for important offline devices is now also
registered explicitly as background work. Home Assistant no longer mistakes
this intentionally long-running loop for unfinished bootstrap work or waits for
the startup timeout.

Both background tasks are still cancelled cleanly when the integration unloads.

## Versions

- Integration: `1.24.2`
- Frontend: `1.29.4`
