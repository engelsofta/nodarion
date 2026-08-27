# Nodarion 1.21.0 — Verlässliche Identitäten, klarere Bedienung

Dieses Release überarbeitet Geräteidentität, Internetfreigaben und große Teile
der Oberfläche. Freigaben bleiben über Neustarts, längere Offline-Zeiten und
DHCP-Wechsel hinweg erhalten. VPN-, Gast-, Router- und Mesh-Verbindungen werden
entsprechend ihrer technischen Möglichkeiten behandelt.

## Neu

- Freigaben werden zusätzlich an der bestätigten MAC-Adresse gespeichert und
  folgen einem Gerät bei einem DHCP-/IP-Wechsel.
- Die Lernphase übernimmt alle tatsächlich erkannten normalen Teilnehmer als
  bekannt und freigegeben – unabhängig von ihrer Erkennungsquelle.
- VPN- und WireGuard-Verbindungen werden als nicht durch den FRITZ!Box-
  Hostfilter verwaltbar gekennzeichnet und bieten keine wirkungslose Freigabe
  an.
- Router und Mesh-Komponenten werden vorrangig aus der FRITZ!Box-Mesh-Topologie
  erkannt. Das Ergebnis wird gespeichert; eine eng begrenzte Namensprüfung
  dient nur als Rückfall für unvollständige FRITZ!OS-Daten.
- Der Live-Log dokumentiert Freigaben, Sperren, automatische Entzüge,
  Bereinigungen und Durchsetzungsfehler einschließlich ihrer Ursache.
- Verbindungsart, Adressvergabe, Erkennungsquelle und Internetstatus besitzen
  dynamische Auswahlfilter. Aktive Filter erscheinen als einzeln entfernbare
  Chips mit einer gemeinsamen Zurücksetzen-Aktion.
- Änderungen in den Einstellungen werden gezählt und können gespeichert oder
  vollständig verworfen werden.
- Erweiterte Prüfungen, manuelle DHCP-Bereiche und KI-Datenschutzoptionen sind
  platzsparend einklappbar.

## Verbessert

- Internetstatus unterscheiden eindeutig zwischen gesperrt, Freigabe
  ausstehend, freigegeben, vertrauenswürdig, Lernphase, VPN/Gast und
  Netzwerkinfrastruktur.
- Netzwerkinfrastruktur erhält ein eigenes Mesh-/Access-Point-Icon und wird
  niemals über den Hostfilter gesperrt oder zur manuellen Freigabe angeboten.
- Online- und Offline-Zeitpunkte werden dauerhaft gespeichert. Ein Home-
  Assistant-Neustart setzt die angezeigten Zustandszeiten nicht mehr zurück.
- Automatische Bereinigung entfernt alte Offline-Anzeigen, behält aber
  Gerätefreigaben. Dauerhaftes Vergessen bleibt eine getrennte, ausdrücklich
  bestätigte Aktion.
- MAC-Wechsel werden erst nach zwei übereinstimmenden Beobachtungen übernommen;
  lokal verwaltete beziehungsweise randomisierte MAC-Adressen erzeugen keine
  unzuverlässigen Identitätswarnungen.
- Quellenspezifische Hostnamen und eine Karenzzeit verhindern ständiges
  Umbenennen zwischen FRITZ!Box- und Reverse-DNS-Namen.
- Bekannte Adressen werden regelmäßig geprüft; eine vollständige Netzsuche
  erfolgt in größeren Abständen. Reverse-DNS-Ergebnisse werden
  zwischengespeichert.
- Eigene Nodarion-Dialoge ersetzen Browser-Rückfragen. Fokusführung,
  Tastaturnavigation, Screenreader-Beschriftungen und sichtbare Fokusrahmen
  wurden ergänzt.
- Besondere Verbindungen werden über farbige Icons hervorgehoben, normale LAN-
  und WLAN-Geräte bleiben optisch einheitlich.
- Deutsche und englische Texte wurden für neue Status, Filter, Dialoge und
  Einstellungen vervollständigt.
- Alle schreibenden API-Aktionen erfordern serverseitig ein Home-Assistant-
  Administratorkonto.

## Behoben

- Längere Offline-Zeiten oder automatische Bestandsbereinigung entfernen keine
  gespeicherte Internetfreigabe mehr.
- Der konfigurierte Router und erkannte Mesh-Infrastruktur lösen keine
  Hostfilter-Fehler oder Warnschleifen mehr aus.
- FRITZ!Box-UPnP-Fehler 880 bei technisch nicht steuerbaren Geräten wird nicht
  länger als fehlgeschlagene normale Gerätefreigabe behandelt.
- Gespeicherte VPN- und Gastverbindungen verlieren alte, unzutreffende
  Freigabeaktionen beim Start.
- Eine geänderte IP-Adresse überträgt keine Freigabe auf fremde Hardware;
  Vertrauen folgt der bestätigten physischen Identität.
- Automatische Gerätenamen bleiben stabil, ohne benutzerdefinierte Namen im
  Home-Assistant-Geräteregister zu überschreiben.

## Versionen

- Integration: `1.21.0`
- Frontend: `1.26.26`

---

# Nodarion 1.21.0 — Reliable identities, clearer controls

This release revises device identity, internet approvals, and major parts of
the interface. Approvals now survive restarts, extended offline periods, and
DHCP address changes. VPN, guest, router, and mesh connections are handled
according to their actual technical capabilities.

## New

- Approvals are also stored against the confirmed MAC address and follow a
  device when its DHCP/IP address changes.
- Learning mode accepts every normal device that is actually detected,
  regardless of its discovery source.
- VPN and WireGuard connections are marked as unmanaged by the FRITZ!Box host
  filter and no longer offer an ineffective approval action.
- Routers and mesh components are primarily identified through the FRITZ!Box
  mesh topology. The result is persisted; a narrowly scoped name check remains
  only as a fallback for incomplete FRITZ!OS data.
- The live log records approvals, blocks, automatic revocations, cleanup, and
  enforcement errors together with their cause.
- Connection type, address assignment, detection source, and internet status
  provide dynamic dropdown filters. Active filters appear as removable chips
  with a single reset action.
- Unsaved settings are counted and can be saved or discarded together.
- Advanced checks, manual DHCP ranges, and AI privacy options can be collapsed.

## Improved

- Internet states now distinguish blocked, pending approval, allowed, trusted,
  learning mode, VPN/guest, and network infrastructure.
- Network infrastructure receives a dedicated mesh/access-point icon and is
  never blocked or offered for manual approval through the host filter.
- Online and offline timestamps are persisted. Restarting Home Assistant no
  longer resets every displayed state time.
- Automatic cleanup removes stale offline entries while retaining approvals.
  Permanently forgetting devices remains a separate confirmed action.
- MAC changes require two matching observations; locally administered or
  randomized MAC addresses no longer generate unreliable identity warnings.
- Source-specific hostnames and a grace period prevent repeated renaming
  between FRITZ!Box and reverse-DNS names.
- Known addresses are checked regularly while full-network discovery runs less
  frequently. Reverse-DNS results are cached.
- Nodarion dialogs replace browser confirmations. Focus management, keyboard
  navigation, screen-reader labels, and visible focus indicators were added.
- Special connections use colored icons while regular LAN and Wi-Fi devices
  remain visually consistent.
- German and English translations cover all new states, filters, dialogs, and
  settings.
- Every write API action now requires a Home Assistant administrator account
  on the server side.

## Fixed

- Extended offline periods and automatic inventory cleanup no longer remove a
  stored internet approval.
- The configured router and detected mesh infrastructure no longer trigger
  host-filter errors or warning loops.
- FRITZ!Box UPnP error 880 for technically uncontrollable devices is no longer
  presented as a failed normal-device approval.
- Restored VPN and guest entries lose stale, inappropriate approval actions at
  startup.
- An IP address change cannot transfer approval to unrelated hardware; trust
  follows the confirmed physical identity.
- Automatic device names remain stable without overwriting user-defined names
  in Home Assistant's device registry.

## Versions

- Integration: `1.21.0`
- Frontend: `1.26.26`
