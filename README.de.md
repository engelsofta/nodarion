<div align="center">
  <img src="https://raw.githubusercontent.com/engelsofta/nodarion/main/custom_components/nodarion/brand/logo.png" alt="Engelsoft Nodarion" width="600">
</div>

<p align="center">
  <strong>Deutsch</strong> · <a href="README.md">English</a>
</p>

<h1 align="center">Engelsoft Nodarion für Home Assistant</h1>

<p align="center">
  <a href="https://github.com/engelsofta/nodarion/releases/latest"><img src="https://img.shields.io/github/v/release/engelsofta/nodarion?label=Version&color=d4a33f" alt="Aktuelle Version"></a>
  <a href="https://github.com/engelsofta/nodarion/releases"><img src="https://img.shields.io/github/downloads/engelsofta/nodarion/total?label=Downloads&color=d4a33f" alt="Downloads aller Releases"></a>
  <a href="https://www.home-assistant.io/"><img src="https://img.shields.io/badge/Home%20Assistant-Custom-41BDF5?logo=homeassistant&logoColor=white" alt="Home Assistant Custom Integration"></a>
  <a href="https://hacs.xyz/"><img src="https://img.shields.io/badge/HACS-Custom-ED7D31" alt="HACS Custom Repository"></a>
  <a href="https://github.com/engelsofta/nodarion/actions/workflows/hacs.yml"><img src="https://github.com/engelsofta/nodarion/actions/workflows/hacs.yml/badge.svg" alt="HACS-Validierung"></a>
  <a href="https://github.com/engelsofta/nodarion/actions/workflows/hassfest.yml"><img src="https://github.com/engelsofta/nodarion/actions/workflows/hassfest.yml/badge.svg" alt="Hassfest"></a>
</p>

> **Ein Netzwerk, ein Gesamtbild:** Nodarion führt aktive Ping-/TCP-Scans,
> FRITZ!Box- und Mesh-Daten sowie die DNS-Aktivitäten aus AdGuard Home pro
> Teilnehmer zusammen. Statt drei voneinander getrennten Datenquellen entsteht
> eine gemeinsame, verständliche Sicht auf Geräte, Verbindungen und
> Auffälligkeiten – inklusive lokaler Regeln und optionaler KI-Analyse.

Diese Kombination aus Netzwerkscanner, Router-Integration und DNS-Auswertung
ist für Home Assistant außergewöhnlich und macht Nodarion zu einer besonders
umfassenden Lösung für die Überwachung des Heimnetzes. Die Integration erkennt
nicht nur, **ob** ein Gerät erreichbar ist, sondern hilft auch zu verstehen,
**wo** es verbunden ist, **wie** es kommuniziert und **ob** sein Verhalten
auffällig erscheint.

Nodarion arbeitet als lokale Home-Assistant-Custom-Integration, scannt ein
einstellbares IPv4-Netz und legt pro gefundenem Teilnehmer einen
Konnektivitäts-Binärsensor an.

## Neu im aktuellen Build

- Die komplette Nodarion-Oberfläche folgt jetzt der in Home Assistant gewählten
  Sprache: Deutsch wird vollständig unterstützt, alle anderen Sprachen erhalten
  die englische Oberfläche als Fallback.
- Datums-, Zeit- und Zahlenformate sowie manuell und täglich erzeugte
  KI-Netzwerkanalysen werden passend auf Deutsch oder Englisch ausgegeben.
- Aktive Auffälligkeiten werden in einer einzigen, laufend aktualisierten
  Home-Assistant-Meldung gebündelt. Das hält die Benachrichtigungen auch in
  lebhaften Netzen angenehm aufgeräumt.
- Das Bestätigen eines neuen Geräts gibt dessen Internetzugang zuverlässig frei
  und erledigt die zugehörigen Warnungen gemeinsam. Bereits freigegebene Geräte
  lassen sich dabei ebenfalls problemlos erneut bestätigen.
- Überarbeitete Bewertungen und eine scrollbarere Warnungsansicht verbessern die
  Lesbarkeit auf kleinen Displays.

## Einblicke

### Teilnehmerübersicht

Die zentrale Gerätetabelle führt Erreichbarkeit, Gerätestatus,
Mesh-Zugangspunkt, AdGuard-DNS-Aktivität, Internetfreigabe und persönliche
Überwachungsfunktionen in einer gemeinsamen Ansicht zusammen.

![Teilnehmerübersicht in Engelsoft Nodarion](https://raw.githubusercontent.com/engelsofta/nodarion/main/docs/images/teilnehmeruebersicht.png)

### AdGuard DNS-Live

DNS-Anfragen werden live mit Verlauf, Client-Zuordnung, Antworttyp,
Bearbeitungsdauer und direkter Blockiermöglichkeit dargestellt.

![AdGuard DNS-Live in Engelsoft Nodarion](https://raw.githubusercontent.com/engelsofta/nodarion/main/docs/images/dns-live.png)

### KI-Netzwerkanalyse

Die optionale KI-Auswertung fasst Netzwerkzustand, Auffälligkeiten,
Veränderungen und Empfehlungen in einer übersichtlichen Tagesbewertung
zusammen.

![KI-Netzwerkanalyse in Engelsoft Nodarion](https://raw.githubusercontent.com/engelsofta/nodarion/main/docs/images/ki-netzwerkanalyse.png)

## Installation

### HACS

<a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=engelsofta&repository=nodarion&category=integration">
  <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Nodarion als benutzerdefiniertes HACS-Repository hinzufügen">
</a>

Mit dem Button lässt sich Nodarion direkt als benutzerdefiniertes Repository
in HACS hinterlegen. Alternativ funktioniert die Einrichtung manuell:

1. In HACS **Integrationen** öffnen.
2. Im Menü **Benutzerdefinierte Repositories** auswählen.
3. `https://github.com/engelsofta/nodarion` als Repository vom Typ
   **Integration** hinzufügen.
4. **Engelsoft Nodarion** installieren und Home Assistant neu starten.

### Manuell

1. Den Ordner `custom_components/nodarion` in den gleichnamigen Ordner der
   Home-Assistant-Konfiguration kopieren.
2. Home Assistant neu starten.
3. Unter **Einstellungen → Geräte & Dienste → Integration hinzufügen** nach
   **Engelsoft Nodarion** suchen.
4. Das lokale Netz als CIDR eintragen, zum Beispiel `192.168.178.0/24`.

## FRITZ!Box-Gastzugang

Nodarion liest den Gastzugang lokal und ausschließlich lesend über TR-064 aus. Die Übersicht zeigt Status, WLAN-Name, gemeldete Sicherheitseinstellungen und aktuell verbundene Gäste. Gastgeräte erhalten in der Teilnehmerliste eine Kennzeichnung und können dort gefiltert werden. Verbindungen und Trennungen erscheinen im Live-Log; optional warnt die Überwachung bei neuen Gästen, Aktivität zur Ruhezeit oder ungewöhnlich langer Verbindung.

Über den Schalter **Gastnetz anzeigen und überwachen** in den Überwachungseinstellungen lässt sich die Funktion vollständig ausblenden. Dann erscheinen Gastzugang, Gastgeräte, zugehörige Protokolle und Warnungen nirgends in Nodarion.

Der Verbindungsbeginn und der Warnverlauf werden im Home-Assistant-Speicher gesichert. Ein Neustart setzt die laufende Beobachtungsdauer daher nicht zurück.

## Verhalten

- Eine automatisch registrierte **Engelsoft Nodarion**-Seite in der HA-Seitenleiste
- Gerätebezogene Anwesenheitssteuerung: ausgewählte Teilnehmer werden sofort
  online und erst nach einem einstellbaren Timeout offline gesetzt
- Wichtige Netzwerkteilnehmer direkt im Dashboard markieren
- Optionale Home-Assistant-Meldung, sobald ein überwachtes Gerät offline geht
- Dauerhaftes Live-Log für neue Geräte, Online-/Offline-Wechsel und Namensänderungen
- Persistenter Teilnehmerbestand: bekannte Geräte bleiben auch nach einem
  Home-Assistant-Neustart sichtbar, wenn sie beim ersten Scan offline sind
- Kennzahlen, Suche, Statusfilter, Sortierung und responsive Gerätetabelle
- Klick auf einen Teilnehmer öffnet dessen Home-Assistant-Eigenschaften
- Optionale direkte FRITZ!Box-Erkennung über TR-064 als Ergänzung zu Ping/TCP
- Automatische FRITZ!Box-Internetsperre für neu entdeckte Geräte bis zur
  manuellen Bestätigung in der Teilnehmerliste
- Anzeige des aktuellen Mesh-Zugangspunkts und Protokollierung von Mesh-Wechseln
- Anzeige von LAN-, WLAN- oder Powerline-Verbindung, WLAN-Frequenzband,
  RX-/TX-Datenrate und – sofern von der FRITZ!Box geliefert – Signalstärke
- Anzeige der Adressvergabe (DHCP oder statisch) und der verbleibenden
  DHCP-Lease-Zeit
- Anzeige von FRITZ!Box-Modell und installierter FRITZ!OS-Version
- Optionale AdGuard-Home-Auswertung pro Teilnehmer mit DNS-Anfragen,
  Blockierungsquote, letzter Aktivität, Domains, Treffergründen, DNS-Protokoll
  und einem Hinweis auf eine mögliche DNS-Umgehung
- AdGuard-Home-Verwaltung für Home-Assistant-Administratoren: Domains direkt
  aus dem DNS-Protokoll blockieren oder freigeben, eigene Filterregeln pflegen
  sowie DNS-Rewrites anlegen und löschen
- Eigener Reiter **Überwachung** mit lokalen Regeln für unbekannte Geräte,
  ungewöhnliche Aktivität während einer Ruhezeit, häufige Statuswechsel,
  Identitätsänderungen und länger offline gebliebene wichtige Geräte
- Einstellbare Lernphase, Bestätigungszeit und Grenzwerte direkt in der
  Nodarion-Oberfläche
- Persistente Warnungshistorie mit optionalen Home-Assistant-Benachrichtigungen
- Mehrere auswählbare Home-Assistant-Benachrichtigungsziele, beispielsweise
  Companion App oder Telegram Bot, getrennt für Warnungen und kritische Meldungen
- Optionale tägliche KI-Netzwerkanalyse über die bevorzugte
  Home-Assistant-AI-Task-Entität mit Bewertung, Empfehlungen und Tagesvergleich
- Über **Jetzt scannen** kann aus der Oberfläche ein Scan angefordert werden.
- Jeder Teilnehmer erhält ein Gerät und einen `binary_sensor`.
- `on` bedeutet erreichbar, `off` bedeutet nach der einstellbaren Anzahl
  fehlgeschlagener Scans nicht mehr erreichbar.
- IP, MAC-Adresse, Hostname, Verbindungsdetails, Adressvergabe und Anzahl
  verpasster Scans stehen als Attribute bereit.
- Vollständig lokaler MAC-Herstellerabgleich mit über 58.000 Präfixen. Der
  Hersteller erscheint direkt unter der MAC-Adresse; Präfix, Zuteilungstyp und
  Registerstand werden beim Darüberfahren angezeigt.
- Randomisierte beziehungsweise lokal verwaltete MAC-Adressen werden aus
  Datenschutz- und Genauigkeitsgründen nicht einem Hersteller zugeordnet.
- Jede IP-Adresse ist ein fester überwachter Platz mit einer dauerhaft gleichen
  Entity-ID, zum Beispiel `binary_sensor.192_168_178_42`.
- Wechselt das Gerät hinter einer IP-Adresse, bleiben Gerät und Entity-ID
  erhalten; MAC-Adresse, Hostname und automatisch verwalteter Name werden
  aktualisiert.
- Der automatisch verwaltete HA-Gerätename wird bei einer Änderung des
  Hostnamens aktualisiert. Ein vom Benutzer gesetzter HA-Name bleibt erhalten.
- Die IP-Adresse dient als stabile Identität des überwachten Platzes.

## Benachrichtigungen und Automationen

Unter **Einstellungen → Benachrichtigungen und Prüfungen** können alle in Home
Assistant vorhandenen `notify.*`-Entitäten ausgewählt werden. Nodarion sendet
neue Warnungen über `notify.send_message`; die Zugangsdaten für Telegram und
andere Dienste bleiben dadurch vollständig in Home Assistant.

Für die Home-Assistant-Glocke fasst Nodarion alle derzeit aktiven
Auffälligkeiten in einer einzigen Meldung zusammen und aktualisiert diese
automatisch. Erledigte Warnungen verschwinden aus der Zusammenfassung, bleiben
aber im Nodarion-Verlauf erhalten.

Zusätzlich löst jede neu angelegte Warnung das Ereignis `nodarion_alert` aus.
Die Ereignisdaten enthalten unter anderem `type`, `severity`, `device_name`,
`ip_address`, `mac_address`, `access_point` und `message`. Eigene Automationen
können damit unabhängig von den in Nodarion ausgewählten Zielen weitere Aktionen
ausführen.

## Hinweise

Der Home-Assistant-Host muss das Zielnetz direkt erreichen können. Bei einer
Container-Installation kann `network_mode: host` nötig sein. Ohne aktivierte
FRITZ!Box-Anbindung können Geräte, die weder auf Ping noch auf einen der
konfigurierten TCP-Ports reagieren, technisch nicht entdeckt werden. Bei
aktivierter FRITZ!Box-Anbindung gilt ein dort als aktiv gemeldeter Teilnehmer
auch ohne Ping-Antwort als online. Veraltete Einträge aus der Nachbartabelle
allein werden weiterhin nicht als Online-Nachweis verwendet. Auch eine
abgelehnte TCP-Verbindung zählt nicht; erforderlich ist ein erfolgreicher
TCP-Verbindungsaufbau.

Für die direkte FRITZ!Box-Erkennung muss in der FRITZ!Box der Zugriff für
Anwendungen über TR-064 erlaubt sein. Empfohlen wird ein eigener
FRITZ!Box-Benutzer für Nodarion. Die Zugangsdaten können über die Optionen der
Integration hinterlegt werden.

Beim ersten Start der Internetschutzfunktion gelten alle bereits gespeicherten
Teilnehmer als bestätigt. Erst danach neu entdeckte Geräte werden über den
TR-064-Dienst `X_AVM-DE_HostFilter` für den Internetzugang gesperrt. Die lokale
Kommunikation im Heimnetz bleibt möglich. Die Freigabe erfolgt ausdrücklich in
der Spalte „Internetzugang“. Freigaben werden zusätzlich an der bestätigten
MAC-Adresse gespeichert und bleiben deshalb bei einem DHCP-/IP-Wechsel sowie
bei der automatischen Bereinigung alter Offline-Anzeigen erhalten. Ein
MAC-Wechsel muss in zwei aufeinanderfolgenden Prüfungen bestätigt werden, bevor
Nodarion die Freigabe entzieht. Alle Freigaben, Sperren, Entzüge,
Durchsetzungsfehler und Bereinigungen erscheinen mit Ursache im Live-Log.

Die Statusanzeige unterscheidet zwischen „Vertrauenswürdig“, „Freigegeben“,
„Noch nicht geprüft“ und „Gesperrt“. Während der Lernphase werden alle in dieser
Zeit tatsächlich erkannten Teilnehmer unabhängig von der Erkennungsquelle als
„Lernphase · automatisch freigegeben“ gekennzeichnet. Durchgehend ausgeschaltete
Geräte können erst nach ihrem späteren Erscheinen bestätigt werden.

Zur Reduzierung der Netz- und Systemlast prüft die Ping/TCP-Erkennung bekannte
Adressen im eingestellten Scanintervall und durchsucht das gesamte Netz alle
fünf Scanzyklen nach neuen Teilnehmern. Reverse-DNS-Namen werden eine Stunde
zwischengespeichert. FRITZ!Box- und Mesh-Daten werden höchstens jede
Minute, AdGuard-Daten höchstens alle zehn Minuten und FRITZ!Box-Geräteinformationen
höchstens einmal pro Stunde neu abgefragt. Dazwischen nutzt Nodarion die zuletzt
erfolgreich gelesenen Zusatzdaten.

Für die optionale AdGuard-Home-Auswertung werden die direkt erreichbare
Adresse der AdGuard-Home-Weboberfläche sowie ein Administrationsbenutzer
benötigt. Das Query-Log muss aktiviert sein. Nodarion liest höchstens 10.000
Einträge, speichert daraus nur eine begrenzte In-Memory-Auswertung und lädt
nach dem ersten Abruf nur neue Einträge nach. Geräte, die VPN, Private DNS
oder einen externen DNS-Server verwenden, können in AdGuard Home fehlen.

Alle schreibenden Nodarion- und AdGuard-Funktionen sind ausschließlich für
Home-Assistant-Administratoren sichtbar und serverseitig geschützt. Vor dem
Löschen von Regeln oder Rewrites verlangt das Panel eine Bestätigung. Domains,
Regeln und Rewrite-Ziele werden vor der Übergabe an AdGuard Home validiert.

Die KI-Auswertung ist standardmäßig deaktiviert. Bei anonymisiertem
DNS-Datenschutz werden nur Zähler und stabile, nicht rückrechenbare
Domain-Kennungen an die konfigurierte KI übergeben. Vollständige Domainnamen
werden nur nach ausdrücklicher Auswahl übertragen. Bei einer Cloud-KI verlassen
die zusammengefassten Netzwerkdaten das lokale System.

## Lizenz

Engelsoft Nodarion wird unter der [MIT-Lizenz](LICENSE) veröffentlicht.
