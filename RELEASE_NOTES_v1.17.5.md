# Engelsoft Nodarion 1.17.5

Diese Version bündelt alle Änderungen seit der letzten GitHub-Veröffentlichung `v1.16.4`.

## FRITZ!Box-Gastzugang

- Gastzugang und aktive Gäste werden lokal und ausschließlich lesend über TR-064 erkannt.
- Neue Statuskarte mit Detailansicht für SSID, Verschlüsselung, Frequenzband und Zeitlimit.
- Gastgeräte sind in der Teilnehmerliste gekennzeichnet und direkt filterbar.
- Beitritt und Verlassen erscheinen als eigene Ereignisse im Live-Log.
- Neue Überwachungsregeln melden neue Gäste, Gastaktivität zur Ruhezeit und ungewöhnlich lange Verbindungen.
- Der Beginn einer Gastverbindung bleibt über Home-Assistant-Neustarts hinweg erhalten.
- Gastgeräte werden ausdrücklich nicht durch die automatische Internetfreigabe verändert oder gesperrt.
- Mit „Gastnetz anzeigen und überwachen“ lässt sich die Funktion vollständig ausblenden. Dann verschwinden Gastgeräte, Kennzahlen, Protokolle und Warnungen aus Nodarion.

## AdGuard DNS-Live

- „Freigeben“ fragt nun, ob die Domain nur für den betroffenen Client oder für alle Clients freigegeben werden soll.
- Clientbezogene Ausnahmen werden als AdGuard-Regel mit `$client=<IP-Adresse>` gespeichert.
- Die bisherige Spalte „Protokoll“ wurde durch „DNS-Server“ ersetzt.
- Angezeigt werden Cache-Treffer, der tatsächlich verwendete externe Upstream, lokale Antworten oder der AdGuard-Filter.

## Bedienoberfläche

- Geöffnete Filter-Dropdowns in Teilnehmern, Live-Log und DNS-Live bleiben bei automatischen Datenaktualisierungen geöffnet und behalten den Fokus.
- Die README verwendet absolute Bildadressen, damit Logo und Vorschaubilder auch in der HACS-Detailansicht erscheinen.
- Fehlende Dark-Mode-Varianten des Integrationsicons wurden ergänzt.

## Versionen

- Integration: `1.17.5`
- Frontend: `1.22.4`
