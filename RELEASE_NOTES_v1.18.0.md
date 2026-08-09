# Nodarion 1.18.0 — Mehr Übersicht. Weniger Klicks.

Dieses Release räumt die Oberfläche spürbar auf: Statuskarten übernehmen die
Navigation, die umfangreichen Einstellungen sind klar gegliedert und wichtige
Verbindungsinformationen sitzen dort, wo man sie sofort sieht.

## Neu

- Die Hauptnavigation ist direkt in fünf aussagekräftige Statuskarten integriert.
- **Netzwerkgeräte**, **Ereignisse**, **DNS-Schutz**, **Netzbewertung** und
  **Überwachung** führen unmittelbar in die jeweilige Detailansicht.
- Der Kopfbereich zeigt den Status der aktiven Verbindungen kompakt an und bietet
  direkten Zugriff auf Einstellungen und manuellen Scan.
- Der zuletzt geöffnete Einstellungsbereich wird lokal gespeichert.

## Einstellungen

- Die Einstellungen sind jetzt in **Allgemein**, **Geräte**,
  **Regeln & Alarme**, **Benachrichtigungen** sowie **KI & Wartung** gegliedert.
- Alle Bereiche verwenden weiterhin einen gemeinsamen Speichern-Button.
- Prüfregeln und Benachrichtigungswege sind fachlich voneinander getrennt.
- Die neue Tab-Leiste passt sich kleinen Displays an und funktioniert im hellen
  sowie dunklen Design.

## Zuverlässigkeit

- Aktive Ruhezeit- und Gastwarnungen werden aufgelöst, sobald die zugehörige
  Regel deaktiviert wird.
- Gastwarnungen während der Ruhezeit respektieren jetzt auch den globalen
  Ruhezeit-Schalter.
- Telegram-Benachrichtigungen berücksichtigen den konfigurierten HTML- oder
  Markdown-Parser und maskieren Sonderzeichen entsprechend.
- Fehler beim Versand an Benachrichtigungsziele werden zuverlässiger erkannt.

## Versionen

- Integration: `1.18.0`
- Frontend: `1.26.0`
