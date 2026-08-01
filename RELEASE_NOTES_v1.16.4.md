# Engelsoft Nodarion 1.16.4

Dieses Wartungsrelease stabilisiert die von der FRITZ!Box übernommenen
Gerätenamen. Das zugehörige Frontend bleibt bei Version **1.20.6**.

## Behoben

- Ein vorhandener Gerätename wird nicht mehr sofort durch die IP-Adresse
  ersetzt, wenn die FRITZ!Box den Teilnehmer vorübergehend nicht mit Namen
  liefert.
- Die Schutzfrist wird jetzt für jedes Gerät einzeln geführt und beträgt zwei
  Stunden statt bisher 15 Minuten.
- Sobald wieder ein verwertbarer Name erkannt wird, endet die Schutzfrist für
  das Gerät automatisch.

Nach dem Update ist ein Neustart von Home Assistant erforderlich.
