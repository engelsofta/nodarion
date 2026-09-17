# Nodarion 1.24.0 — Fast scans, calm LANs

> **Scan fast. Stay LAN-back.** Wichtige Geräte kommen schneller zurück, die
> Netzwerkerkennung bleibt dabei angenehm höflich.

## Deutsch

### Schnelle, intelligentere Scans

- Überwachte und für die Anwesenheit verwendete Geräte besitzen jetzt eine
  Schnellspur. Ist eines davon offline, prüft Nodarion es spätestens alle 15
  Sekunden, bis es wieder erreichbar ist.
- Diese Schnellprüfung löst keine zusätzlichen VLAN-Komplettscans aus. Neue
  Teilnehmer werden stattdessen gleichmäßig in rollierenden 32er-Gruppen
  gesucht.
- Hinweise aus ARP-/Neighbor-Tabellen werden bevorzugt geprüft.
- Nodarion merkt sich je Gerät, ob Ping oder welcher TCP-Port zuletzt
  erfolgreich war, und beginnt beim nächsten Scan mit dieser Methode.
- Reverse-DNS-Abfragen laufen begrenzt parallel und verwenden längere positive
  sowie kürzere negative Cachezeiten.
- Der manuelle Button **Jetzt scannen** startet weiterhin bewusst eine
  vollständige Netzwerkerkennung.

### Oberfläche und Datenübertragung

- Unter **Verbindungen aktiv** zeigt der Scanner seinen aktuellen Modus, das
  effektive Intervall, wichtige Offline-Geräte und kompakte Scanstatistiken.
- Das Panel erhält Zustandsänderungen über revisionierte WebSocket-Patches statt
  regelmäßiger vollständiger API-Abfragen.
- Nur tatsächlich betroffene Ansichten werden neu gezeichnet.
- Die vier AdGuard-DNS-Kennzahlen sitzen nun kompakt und dezent gruppiert neben
  Diagramm, Pause und Aktualisieren.
- Deutsche und englische Texte für Scanmodus und Zähler wurden vervollständigt.

### Behoben

- Eine nicht vorhandene optionale Mesh-Ansicht kann eine erfolgreiche
  KI-Analyse nicht mehr fälschlich als fehlgeschlagen anzeigen.

---

## English

### Faster, smarter scans

- Monitored and presence devices now have a fast recovery lane. If one is
  offline, Nodarion rechecks it at least every 15 seconds until it returns.
- Fast recovery does not trigger additional full-VLAN scans. New devices are
  discovered evenly in rolling batches of 32 unknown addresses.
- ARP and neighbour-table candidates are checked first.
- Nodarion remembers whether ping or a particular TCP port last worked for each
  device and starts with that method during the next scan.
- Reverse-DNS lookups run with bounded parallelism and use longer positive than
  negative cache lifetimes.
- The manual **Scan now** action deliberately performs a complete discovery.

### Interface and state transport

- **Connections active** now shows the scanner mode, effective interval,
  important offline devices, and compact scan statistics.
- The panel receives revisioned WebSocket patches instead of repeatedly loading
  the complete API state.
- Only affected views are rendered after an update.
- The four AdGuard DNS statistics now sit in a compact, subtly separated group
  next to Chart, Pause, and Refresh.
- German and English text for the new scanner modes and counters is complete.

### Fixed

- A missing optional mesh view can no longer make a successful AI analysis
  appear to have failed.

## Versions

- Integration: `1.24.0`
- Frontend: `1.29.4`
