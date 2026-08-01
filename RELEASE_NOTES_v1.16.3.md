# Engelsoft Nodarion 1.16.3

Dieses Sicherheits- und Datenschutzupdate beschränkt den Zugriff auf das
Nodarion-Seitenpanel auf Home-Assistant-Administratoren.

## Geändert

- Das Nodarion-Seitenpanel wird jetzt mit `require_admin=True` registriert.
- Angemeldete Benutzer ohne Administratorrechte können dadurch weder das
  Netzwerkinventar noch die in Nodarion dargestellten DNS-Daten öffnen.
- Die Integrationsversion wurde auf **1.16.3** erhöht. Das Frontend bleibt bei
  **1.20.6**.

Nach dem Update ist ein Neustart von Home Assistant erforderlich, damit das
Panel mit der neuen Zugriffsanforderung registriert wird.
