# Nodarion 1.20.0 — Zweisprachig. Aufgeräumt. Zuverlässiger.

Nodarion spricht jetzt vollständig Deutsch und Englisch. Gleichzeitig bündelt
das Release Warnungen übersichtlicher und macht die Freigabe neuer Geräte an
der FRITZ!Box zuverlässiger.

## Neu

- Die gesamte Oberfläche folgt der in Home Assistant gewählten Sprache.
- Deutsch wird vollständig unterstützt; alle anderen Sprachen verwenden
  Englisch als Fallback.
- Eine neue englische README dokumentiert Installation, Funktionen,
  Datenschutz und Automationen.
- Manuelle und tägliche KI-Netzwerkanalysen werden in der passenden Sprache
  erzeugt, einschließlich Prompt und strukturierter Ergebnisfelder.

## Verbessert

- Aktive Auffälligkeiten werden in einer einzigen, laufend aktualisierten
  Home-Assistant-Meldung zusammengefasst.
- Erledigte Hinweise verschwinden aus der Zusammenfassung, bleiben aber im
  Nodarion-Verlauf erhalten.
- Datums-, Zeit- und Zahlenformate richten sich nach der aktiven Sprache.
- Bewertungen, Warnungsansicht und dynamische Ereignistexte sind auf kleinen
  Displays besser lesbar.
- Lange Bewertungslabels werden sauber begrenzt; wiederholte Übersetzungen
  verändern Texte nicht mehr.

## Behoben

- Das Bestätigen eines neuen Geräts gibt den Internetzugang zuverlässig frei
  und erledigt alle zugehörigen Warnungen gemeinsam.
- Bereits freigegebene Geräte können erneut bestätigt werden, ohne dass der
  FRITZ!Box-Fehler 714 den Vorgang abbricht.
- Dynamische Status-, Alarm-, DNS- und KI-Texte erscheinen nicht länger als
  deutsch-englische Mischtexte.

## Versionen

- Integration: `1.20.0`
- Frontend: `1.26.9`

---

# Nodarion 1.20.0 — Bilingual. Tidier. More reliable.

Nodarion now provides a complete German and English experience. This release
also consolidates warnings and makes approving new devices through the
FRITZ!Box more reliable.

## New

- The complete interface follows the language selected in Home Assistant.
- German is fully supported; every other language uses English as a fallback.
- A new English README covers installation, features, privacy, and automation.
- Manual and scheduled AI network analyses use the appropriate language,
  including their prompt and structured result fields.

## Improved

- Active anomalies are consolidated into one continuously updated Home
  Assistant notification.
- Resolved notices disappear from the summary while remaining available in the
  Nodarion history.
- Dates, times, and numbers follow the active locale.
- Rating indicators, the warning view, and dynamic event messages are easier
  to read on smaller displays.
- Long rating labels are constrained cleanly, and repeated localization no
  longer changes already translated text.

## Fixed

- Approving a new device reliably enables internet access and resolves all
  related warnings together.
- Devices whose access is already enabled can be approved again without
  FRITZ!Box error 714 aborting the operation.
- Dynamic status, alert, DNS, and AI content no longer produces mixed German
  and English text.

## Versions

- Integration: `1.20.0`
- Frontend: `1.26.9`
