# Nodarion 1.17.8 (Pre-Release)

Diese Vorabversion erweitert die Netzwerküberwachung um frei wählbare
Home-Assistant-Benachrichtigungswege.

## Neu

- Mehrere vorhandene `notify.*`-Entitäten direkt in den
  Nodarion-Einstellungen auswählen
- Warnungen beispielsweise an die Home-Assistant-Companion-App, Telegram Bot,
  ntfy oder andere HA-Benachrichtigungsziele senden
- Normale Warnungen und kritische Meldungen getrennt aktivieren
- Bestehende dauerhafte Meldungen unter der Home-Assistant-Glocke separat
  ein- oder ausschalten
- Neues Home-Assistant-Ereignis `nodarion_alert` für eigene Automationen
- Strukturierte Ereignisdaten mit Warnungstyp, Dringlichkeit, Gerätename, IP,
  MAC-Adresse, Zugangspunkt und Nachricht

## Verhalten und Kompatibilität

- Vorhandene Einstellungen für HA-Benachrichtigungen bleiben erhalten.
- Die Zielauswahl wird gespeichert und überlebt einen Home-Assistant-Neustart.
- Nicht mehr vorhandene Benachrichtigungsziele werden übersprungen und im
  Home-Assistant-Protokoll vermerkt.
- Telegram-Zugangsdaten und andere Dienstgeheimnisse verbleiben vollständig in
  Home Assistant.

## Versionen

- Integration: `1.17.8`
- Frontend: `1.24.0`
