# Engelsoft Nodarion 1.15.3

Dieses Wartungsrelease stabilisiert Gerätenamen bei kurzen Ausfällen der
FRITZ!Box. Das zugehörige Frontend trägt die Version **1.18.5**.

## Fehlerbehebung

- Ein bekannter Gerätename wird bei einem vorübergehenden FRITZ!Box-Ausfall
  nicht mehr sofort durch die IP-Adresse ersetzt.
- Die Namens-Nachlaufzeit beträgt 15 Minuten durchgehende Nichterreichbarkeit.
- Sobald die FRITZ!Box wieder erreichbar ist, werden echte Namensänderungen
  weiterhin unmittelbar übernommen.

Nach dem Update ist ein Neustart von Home Assistant erforderlich.
