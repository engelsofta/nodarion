# Nodarion 1.17.9 (Pre-Release)

Diese Vorabversion verbessert die Übersichtskarten und erweitert den
FRITZ!Box-Gastzugang um einen direkt scannbaren WLAN-QR-Code.

## Neu

- Neue Geräte erscheinen jetzt kompakt als **NEU** unter den Gerätefunktionen.
- Favoriten, Glocke und Anwesenheit zeigen jeweils **Gesamt/Online**.
- Die Karte **Gerätefunktionen** nutzt mehr Platz für die zusätzlichen Angaben.
- Der Gastzugangs-Dialog zeigt einen QR-Code zur direkten WLAN-Verbindung.
- Der QR-Code wird aus den vorhandenen FRITZ!Box-Gastzugangsdaten erzeugt.

## Datenschutz und Sicherheit

- Der WLAN-QR-Code ist ausschließlich für Home-Assistant-Administratoren
  sichtbar, da er das Gast-WLAN-Kennwort enthält.
- Nodarion liest die Daten nur aus und verändert weder Gastnetz noch Kennwort.
- Für die lokale QR-Erzeugung wurde `segno` ergänzt; es werden keine Zugangsdaten
  an externe Dienste übertragen.

## Verbesserungen

- Der Gastzugang zeigt beim Darüberfahren nun den erwarteten Klick-Cursor und
  ein passendes Hover-Feedback im hellen und dunklen Design.
- Die Benachrichtigungszielliste behält bei automatischen Aktualisierungen ihre
  Scrollposition, den Fokus und noch nicht gespeicherte Auswahlwerte.
- Das QR-Code-Layout passt sich auf kleinen Bildschirmen automatisch an.

## Versionen

- Integration: `1.17.9`
- Frontend: `1.25.0`
