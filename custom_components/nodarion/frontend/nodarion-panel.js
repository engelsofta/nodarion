const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// The panel is authored in German. Home Assistant's selected language decides
// whether those labels are kept or translated; every unsupported language
// intentionally falls back to English.
let panelLocale = "en";
const EN = new Map(Object.entries({
  "Warnungen und Auffälligkeiten": "Warnings and anomalies",
  "Aktive Hinweise stehen oben, erledigte bleiben als Verlauf erhalten.": "Active notices are shown first; resolved ones remain in the history.",
  "Änderungen werden direkt in AdGuard Home gespeichert. DNS-Live ist während der Bearbeitung pausiert.": "Changes are saved directly to AdGuard Home. DNS Live is paused while editing.",
  "Nur lesende Anzeige – Nodarion verändert hier keine FRITZ!Box-Einstellungen.": "Read-only view – Nodarion does not change any FRITZ!Box settings here.",
  "Die FRITZ!Box konnte den Internetzugang nicht freigeben. Bitte Benutzerrechte und TR-064-Unterstützung prüfen.": "The FRITZ!Box could not enable internet access. Check user permissions and TR-064 support.",
  "Noch keine KI-Auswertung vorhanden. Aktiviere den täglichen Bericht oder starte die erste Analyse manuell.": "No AI analysis yet. Enable the daily report or start the first analysis manually.",
  "Nach dem nächsten Scan erscheint hier deine Netzwerktopologie.": "Your network topology will appear here after the next scan.",
  "Markiere Teilnehmer in der Tabelle mit dem Haus-Symbol.": "Mark devices in the table with the home icon.",
  "Erkannte Auffälligkeiten erscheinen automatisch hier.": "Detected anomalies will appear here automatically.",
  "Änderungen gelten ab dem nächsten Netzwerkscan.": "Changes take effect with the next network scan.",
  "QR-Code mit der Handykamera scannen und direkt mit": "Scan the QR code with your phone camera and connect directly to",
  "Der WLAN-QR-Code ist nur für Home-Assistant-Administratoren sichtbar.": "The Wi-Fi QR code is only visible to Home Assistant administrators.",
  "Die FRITZ!Box konnte für dieses Gast-WLAN keinen QR-Code bereitstellen.": "The FRITZ!Box could not provide a QR code for this guest Wi-Fi.",
  "Der QR-Code ist verfügbar, sobald der Gastzugang aktiv ist.": "The QR code is available once guest access is active.",
  "Alle Regeln gemeinsam ein- oder ausschalten": "Enable or disable all rules together",
  "Tage, in denen aktuelle Geräte als bekannt gelten": "Days during which current devices are considered known",
  "Markierte Geräte gehen sofort online und erst nach dieser Zeit offline (Minuten)": "Marked devices go online immediately and offline after this time (minutes)",
  "Geräte in diesem IP-Bereich als neu kennzeichnen": "Mark devices in this IP range as new",
  "DHCP-Start und -Ende automatisch per TR-064 abfragen": "Retrieve DHCP start and end automatically via TR-064",
  "Neue Geräte im Einrichtungsbereich direkt mit Stern markieren": "Automatically mark new devices in the setup range with a star",
  "Neue Geräte im Einrichtungsbereich in Home Assistant melden": "Report new devices in the setup range to Home Assistant",
  "Keine passenden DNS-Anfragen": "No matching DNS requests",
  "DNS-Anfragen werden geladen": "Loading DNS requests",
  "Filter ändern oder auf neue Anfragen warten.": "Change the filters or wait for new requests.",
  "Keine passenden Geräte": "No matching devices",
  "Keine Ereignisse gefunden": "No events found",
  "Filter ändern oder leeren.": "Change or clear the filters.",
  "Keine eigenen Regeln vorhanden": "No custom rules",
  "Keine DNS-Rewrites vorhanden": "No DNS rewrites",
  "Keine offenen Warnungen": "No open warnings",
  "Alles ruhig im Netz": "Everything is quiet on the network",
  "Noch keine Mesh-Daten": "No mesh data yet",
  "Noch keine Anwesenheitsgeräte": "No presence devices yet",
  "Niemand zuhause": "Nobody home",
  "Mit dem Gast-WLAN verbinden": "Connect to guest Wi-Fi",
  "Keine Gäste online": "No guests online",
  "Der Gastzugang ist gerade angenehm übersichtlich.": "Guest access is pleasantly quiet right now.",
  "Gäste in Tabelle anzeigen": "Show guests in table",
  "In den Optionen deaktiviert": "Disabled in options",
  "Alle Einstellungen speichern": "Save all settings",
  "Von FRITZ!Box übernehmen": "Import from FRITZ!Box",
  "Automatisch von der FRITZ!Box erkannt": "Detected automatically by the FRITZ!Box",
  "Erste DHCP-Adresse für neue Geräte": "First DHCP address for new devices",
  "Letzte DHCP-Adresse für neue Geräte": "Last DHCP address for new devices",
  "Anwesenheitssensor ist aktiviert.": "Presence sensor is enabled.",
  "Aktueller Zustand und Verlauf der letzten 24 Stunden.": "Current state and history for the last 24 hours.",
  "24-Stunden-Bewertung mit Tagesvergleich": "24-hour rating with day-to-day comparison",
  "Neueste DNS-Anfragen": "Latest DNS requests",
  "automatisch alle 3 Sekunden": "automatically every 3 seconds",
  "Netzwerkgeräte": "Network devices", "Gerätestatus": "Device status",
  "Teilnehmer": "Devices", "IP-Adresse": "IP address", "MAC-Adresse": "MAC address",
  "Verbindung": "Connection", "Verbindungen werden geladen": "Loading connections",
  "Mesh-Zugangspunkt": "Mesh access point", "Alle Mesh-Punkte": "All mesh points",
  "WLAN-Daten": "Wi-Fi data", "Adressvergabe": "Address assignment",
  "Erkannt durch": "Detected by", "Internetzugang": "Internet access",
  "Überwachung": "Monitoring", "Überwachung aktiv": "Monitoring enabled",
  "Automatisch überwachen": "Monitor automatically", "Einstellungen": "Settings",
  "Jetzt scannen": "Scan now", "Live-Log": "Live log", "Ereignisse": "Events",
  "Warnungen": "Warnings", "Warnung": "Warning", "offene": "open",
  "DNS-Schutz": "DNS protection", "Netzbewertung": "Network rating",
  "Schutz aktiv": "Protection enabled", "Schutz nicht erreichbar": "Protection unavailable",
  "Favoriten": "Favorites", "Glocke": "Notifications", "Anwesenheit": "Presence",
  "FRITZ!Box-Gastzugang": "FRITZ!Box guest access", "Gastzugang": "Guest access",
  "Spalten auswählen": "Choose columns", "Zeit": "Time", "Gerät": "Device",
  "Ereignis": "Event", "Dienst": "Service", "Details": "Details",
  "Datum / Uhrzeit": "Date / time", "Name / IP": "Name / IP", "Meldung": "Message",
  "Freigeben": "Allow", "Freigegeben": "Allowed", "Blockieren": "Block",
  "Ergebnis": "Result", "Domain / Antwort": "Domain / answer", "Client-IP": "Client IP",
  "DNS-Server": "DNS server", "Grund": "Reason", "Dauer": "Duration", "Aktion": "Action",
  "AdGuard-Konfiguration": "AdGuard configuration", "Eigene Filterregeln": "Custom filter rules",
  "Hinzufügen": "Add", "Domain freigeben": "Allow domain", "Nur dieser Client": "This client only",
  "Für alle Clients": "For all clients", "Abbrechen": "Cancel", "Konfiguration": "Configuration",
  "Aktualisieren": "Refresh", "Alle Ergebnisse": "All results", "Nur erlaubt": "Allowed only",
  "Diagramm aus": "Hide chart", "Diagramm an": "Show chart",
  "Stundendiagramm ausblenden": "Hide hourly chart", "Stundendiagramm einblenden": "Show hourly chart",
  "Nur blockiert": "Blocked only", "Alle Clients": "All clients", "erlaubt": "allowed",
  "blockiert": "blocked", "Zusammenfassung": "Summary", "Auffälligkeiten": "Anomalies",
  "Änderungen": "Changes", "Empfehlungen": "Recommendations",
  "Vertrauen und Datenlage": "Confidence and data quality", "KI-Netzwerkanalyse": "AI network analysis",
  "Erste Bewertung": "First rating", "zum Vortag": "from previous day",
  "unverändert": "unchanged", "letzter Bericht": "latest report",
  "Prompt anzeigen": "Show prompt", "Prompt ausblenden": "Hide prompt",
  "Jetzt analysieren": "Analyze now", "Analyse läuft": "Analysis running",
  "Letzte Analyse fehlgeschlagen": "Last analysis failed", "Netzwerkhinweis": "Network notice",
  "Bestätigen": "Acknowledge", "Zuhause": "Home", "Abwesend": "Away", "Anwesend": "Present",
  "Aktive Warnungen": "Active warnings", "Kritisch": "Critical",
  "Unbekannte Geräte": "Unknown devices", "Instabile Geräte": "Unstable devices",
  "Lernphase beendet": "Learning phase complete", "Neu starten": "Restart",
  "Allgemein": "General", "Geräte": "Devices", "Regeln & Alarme": "Rules & alerts",
  "Benachrichtigungen": "Notifications", "KI-Analyse": "AI analysis", "Grundlagen": "Basics",
  "Lernphase": "Learning phase", "Anwesenheits-Timeout": "Presence timeout",
  "Anwesenheitssensor": "Presence sensor", "Geräte-Einrichtung": "Device setup",
  "Einrichtungsbereich aktiv": "Setup range enabled", "Bereich beginnt": "Range starts",
  "Bereich endet": "Range ends", "Benachrichtigung": "Notification",
  "Online": "Online", "Offline": "Offline", "Unbekannt": "Unknown", "unbekannt": "unknown",
  "Privat / randomisiert": "Private / randomized", "Noch": "Remaining", "Tage": "days",
  "Tag": "day", "Stunden": "hours", "Minuten": "minutes", "Sek.": "sec.",
  "Std.": "hrs.", "Gast": "guest", "Gäste": "guests", "aktiv": "enabled",
  "deaktiviert": "disabled", "Erledigt": "Resolved", "vor": "ago", "jetzt": "now",
  "Sehr gut": "Excellent", "Gut": "Good", "Schwach": "Weak", "Sehr schwach": "Very weak",
  "Unauffällig": "Normal", "Moderat": "Moderate", "Erhöht": "Elevated", "Auffällig hoch": "Unusually high",
  "Blockliste": "Blocklist", "Jugendschutz": "Parental control", "Gesperrter Dienst": "Blocked service",
  "Ungültige Anfrage": "Invalid request", "Nicht protokolliert": "Not logged",
  "Speichern fehlgeschlagen": "Save failed", "Speichert": "Saving", "Gespeichert": "Saved",
  "Keine Funktion": "No function", "Alle Funktionen": "All functions", "Alle Gerätestatus": "All device statuses",
  "Zeit unbekannt": "Time unknown", "Noch nicht geprüft": "Not checked yet", "Wird freigegeben": "Enabling access",
  "Gastzugang anzeigen": "Show guest access", "Nur Geräte im Gastzugang anzeigen": "Show guest access devices only",
  "Noch keine Bewertung": "No rating yet", "Einen kleinen Moment": "Just a moment",
  "Freigabe fehlgeschlagen": "Access approval failed", "KI-Analyse fehlgeschlagen": "AI analysis failed",
  "Keine Offline-Geräte gefunden.": "No offline devices found.", "AdGuard-Änderung fehlgeschlagen.": "AdGuard change failed.",
  "AdGuard Home ist nicht erreichbar.": "AdGuard Home is unreachable.",
  "AdGuard Home ist in Nodarion nicht aktiviert oder nicht erreichbar": "AdGuard Home is not enabled in Nodarion or is unreachable",
  "Bereinigung konnte nicht ausgeführt werden.": "Cleanup could not be performed.",
  "DNS-Live nach": "Filter DNS Live by", "ausgewählt": "selected", "Keine Bewertung": "No rating",
  "Gast zur Ruhezeit": "Guest during quiet hours", "Aktivität zur Ruhezeit": "Activity during quiet hours",
  "Simulation abgeschlossen": "Simulation complete", "ist jetzt mit": "is now connected to",
  "Für diesen MAC-Präfix wurde in der lokalen Datei kein Hersteller gefunden.": "No manufacturer was found for this MAC prefix in the local file.",
  "Lokale bzw. randomisierte MAC-Adresse – eine Herstellerzuordnung ist nicht zuverlässig möglich.": "Local or randomized MAC address – reliable manufacturer identification is not possible.",
  "Internetzugang für": "Enable internet access for", "freigeben und das Gerät dauerhaft bestätigen?": "and permanently approve this device?",
  "Noch kein": "No", "-Ziel in Home Assistant vorhanden.": "target exists in Home Assistant.",
  "Diese Aktion ist bewusst nicht Teil des normalen Speicherns und wird erst nach einer zusätzlichen Bestätigung ausgeführt.": "This action is intentionally separate from normal saving and runs only after an additional confirmation.",
  "Für Geräte mit Stern gilt die Offline-Frist. Nach deren Ablauf erscheint eine Warnung, sofern das Gerät weiterhin nicht erreichbar ist.": "The offline grace period applies to starred devices. A warning appears when it expires if the device is still unreachable.",
  "Neue Geräte werden erst nach der Bestätigungszeit gemeldet. Kurze oder fehlerhafte Erkennungen lösen dadurch nicht sofort eine Warnung aus.": "New devices are reported only after the confirmation period, preventing brief or faulty detections from immediately triggering a warning.",
  "Haus-markierte Geräte melden sich sofort als anwesend. Erst wenn ein Gerät länger als das Anwesenheits-Timeout nicht erreichbar ist, gilt es als abwesend.": "Home-marked devices become present immediately and are considered away only after being unreachable for longer than the presence timeout.",
  "Der Einrichtungsbereich kennzeichnet Geräte im angegebenen DHCP-Adressbereich als Neu. Nach der Vergabe einer festen Adresse außerhalb dieses Bereichs gelten sie als zugeordnet.": "The setup range marks devices in the specified DHCP address range as new. They are considered assigned after receiving a fixed address outside that range.",
  "Bei automatischer Übernahme liest Nodarion Start und Ende direkt aus der FRITZ!Box. Optional können neue Geräte sofort überwacht oder zusätzlich in Home Assistant gemeldet werden.": "With automatic import, Nodarion reads the start and end directly from the FRITZ!Box. New devices can optionally be monitored immediately or also reported in Home Assistant.",
  "Gastnetz anzeigen und überwachen": "Show and monitor guest network",
  "Gastgeräte in Nodarion erfassen, anzeigen und protokollieren": "Detect, display, and log guest devices in Nodarion",
  "Neue Gäste melden": "Report new guests",
  "Beim erstmaligen Verbinden mit dem FRITZ!Box-Gastzugang warnen": "Warn when a device first connects to FRITZ!Box guest access",
  "Gäste zur Ruhezeit melden": "Report guests during quiet hours",
  "Verbindungen im eingestellten Ruhezeitraum hervorheben": "Highlight connections during the configured quiet hours",
  "Maximale Gastdauer": "Maximum guest duration",
  "Nach dieser Anzahl Stunden eine Warnung anzeigen": "Show a warning after this number of hours",
  "Offline-Teilnehmer löschen": "Delete offline devices",
  "Entfernt alle aktuell offline geführten Geräte einschließlich ihrer gespeicherten Einstellungen.": "Removes all devices currently marked offline, including their saved settings.",
  "Alle derzeit offline geführten Geräte sofort entfernen": "Immediately remove all devices currently marked offline",
  "Geräteüberwachung": "Device monitoring",
  "Neue Geräte bestätigen": "Confirm new devices",
  "Erst nach dieser Online-Zeit warnen (Minuten)": "Warn only after this online time (minutes)",
  "Wichtiges Gerät offline": "Important device offline",
  "Warnung nach Minuten": "Warn after minutes",
  "Weitere Prüfungen": "Additional checks",
  "Statuswechsel pro Stunde": "State changes per hour",
  "Ab dieser Anzahl als instabil melden": "Report as unstable from this number onward",
  "Identitätswechsel melden": "Report identity changes",
  "Andere MAC-Adresse am gleichen IP-Platz": "Different MAC address at the same IP address",
  "Ruhezeiten": "Quiet hours", "Ruhezeit überwachen": "Monitor quiet hours",
  "Aktivierungen in diesem Zeitraum melden": "Report activity during this period",
  "Ruhezeit beginnt": "Quiet hours start", "Ruhezeit endet": "Quiet hours end",
  "HA-Glocke": "HA notifications",
  "Neue Auffälligkeiten als dauerhafte Meldung in Home Assistant anzeigen": "Show new anomalies as persistent notifications in Home Assistant",
  "Warnungen senden": "Send warnings",
  "Normale Warnungen an die ausgewählten Ziele senden": "Send regular warnings to the selected targets",
  "Kritische Meldungen senden": "Send critical notifications",
  "Kritische Ausfälle an die ausgewählten Ziele senden": "Send critical outages to the selected targets",
  "Für eigene Automationen wird immer das Ereignis": "The event",
  "ausgelöst.": "is always fired for custom automations.",
  "Benachrichtigungsziele": "Notification targets",
  "Companion App, Telegram und andere in Home Assistant eingerichtete Ziele": "Companion App, Telegram, and other targets configured in Home Assistant",
  "Ziel durchsuchen": "Search targets", "Benachrichtigungsziel durchsuchen": "Search notification targets",
  "Tägliche KI-Auswertung": "Daily AI analysis",
  "Automatisch einmal täglich einen Bericht erstellen": "Automatically create a report once a day",
  "KI-Auswertung um": "AI analysis at",
  "Erster Netzwerkscan nach diesem Zeitpunkt": "First network scan after this time",
  "DNS-Datenschutz": "DNS privacy",
  "Anonymisiert überträgt nur Zähler und stabile, neutrale Domain-IDs": "Anonymized mode transmits only counters and stable, neutral domain IDs",
  "Domains anonymisieren": "Anonymize domains", "Domainnamen mitsenden": "Include domain names",
  "Grundlagen erklären": "Explain basics", "Hilfe zu Grundlagen": "Help with basics",
  "Anwesenheit erklären": "Explain presence", "Hilfe zu Anwesenheit": "Help with presence",
  "Geräte-Einrichtung erklären": "Explain device setup", "Hilfe zu Geräte-Einrichtung": "Help with device setup",
  "Bereinigung erklären": "Explain cleanup", "Hilfe zur Bereinigung": "Cleanup help",
  "Geräteüberwachung erklären": "Explain device monitoring", "Hilfe zu Geräteüberwachung": "Device monitoring help",
  "Ruhezeiten erklären": "Explain quiet hours", "Hilfe zu Ruhezeiten": "Quiet-hours help",
  "Prüfungen erklären": "Explain checks", "Hilfe zu weiteren Prüfungen": "Additional-checks help",
  "Benachrichtigungen erklären": "Explain notifications", "Hilfe zu Benachrichtigungen": "Notifications help",
  "KI-Analyse erklären": "Explain AI analysis", "Hilfe zur KI-Analyse": "AI analysis help",
  "Hilfe schließen": "Close help", "Hilfe": "Help", "Bereinigung": "Cleanup", "Löschen": "Delete",
  "Kein AdGuard-DNS": "No AdGuard DNS", "Nicht verwaltet": "Not managed",
  "Nicht bewertet": "Not rated", "Anfragen": "queries", "blockiert": "blocked",
  "Gesperrt / frei": "Blocked / allowed", "Gesperrt": "Blocked",
  "Freigabe ausstehend": "Approval pending", "Lernphase · automatisch freigegeben": "Learning phase · automatically allowed",
  "Anteil blockierter DNS-Anfragen": "Share of blocked DNS queries",
  "Nur Offline-Geräte anzeigen": "Show offline devices only",
  "DNS-Live-Log für": "Open DNS Live log for", "öffnen": "open",
  "Statisch": "Static", "Signal": "signal", "Normal": "Normal",
  "von": "of", "Keine": "None", "Alle": "All",
  "Offline-Meldung": "Offline notification", "Nicht erreichbar": "Unreachable", "Nicht eingerichtet": "Not configured",
  "Hersteller": "Manufacturer", "Quelle: lokale MAC-Vendor-Datei": "Source: local MAC vendor file",
  "Registrierter Präfix": "Registered prefix", "Zuteilung": "Allocation", "Registerstand": "Registry date",
  "Zeitraum": "Period", "Daten vollständig": "Data complete", "Nein (Abfragelimit erreicht)": "No (query limit reached)",
  "Ja": "Yes", "Letzte Aktivität": "Last activity", "Letzte Domain": "Last domain",
  "Zuletzt blockiert": "Last blocked", "Treffergrund": "Match reason", "DNS-Protokoll": "DNS protocol",
  "Häufig abgefragt": "Frequently queried", "Häufig blockiert": "Frequently blocked",
  "Lokal verwaltete bzw. randomisierte MAC-Adresse; Änderungen lösen keine Identitätswarnung aus": "Locally administered or randomized MAC address; changes do not trigger an identity warning",
  "Überwachung beenden": "Stop monitoring", "Als wichtig überwachen": "Monitor as important",
  "Gerät im DHCP-Einrichtungsbereich": "Device in DHCP setup range",
  "Automatisch erkannter Gerätetyp": "Automatically detected device type",
  "Live-Log dieses Geräts anzeigen": "Show this device's live log", "Home-Assistant-Dialog öffnen": "Open Home Assistant dialog",
  "WLAN-Empfang": "Wi-Fi reception", "Mesh-Punkt": "Mesh point",
  "Mit Überwachung aktiv werden sämtliche Warn- und Prüfregeln gemeinsam geschaltet. Die Erkennung und Anzeige der Geräte läuft unabhängig davon weiter.": "Enabling monitoring turns all warning and checking rules on or off together. Device detection and display continue independently.",
  "Der optionale Home-Assistant-Binary-Sensor ist aktiv, sobald mindestens eines dieser Geräte zuhause ist. Er eignet sich beispielsweise für Licht-, Heizungs- oder Alarm-Automationen.": "The optional Home Assistant binary sensor is active whenever at least one of these devices is home. It can be used for lighting, heating, or alarm automations.",
  "Während der Ruhezeit kann das Aktivwerden eines Geräts als Auffälligkeit gemeldet werden. Zeiträume über Mitternacht, beispielsweise 23:00 bis 06:00 Uhr, werden automatisch korrekt behandelt.": "Device activity during quiet hours can be reported as an anomaly. Periods spanning midnight, such as 23:00 to 06:00, are handled automatically.",
  "Ist die Prüfung deaktiviert, beeinflusst die Ruhezeit weder Erkennung noch Anwesenheitssteuerung.": "When this check is disabled, quiet hours affect neither detection nor presence tracking.",
  "Häufige Online-/Offline-Wechsel innerhalb einer Stunde kennzeichnen eine instabile Verbindung. Der Grenzwert bestimmt, ab wie vielen Wechseln gewarnt wird.": "Frequent online/offline changes within one hour indicate an unstable connection. The threshold determines how many changes trigger a warning.",
  "Die HA-Glocke zeigt Meldungen direkt in Home Assistant. Ausgewählte Benachrichtigungsziele senden Warnungen zusätzlich etwa an die Companion App oder einen eingerichteten Telegram Bot.": "HA notifications appear directly in Home Assistant. Selected notification targets can additionally send warnings to the Companion App or a configured Telegram bot.",
  "Unabhängig von diesen Schaltern erzeugt jede neue Warnung das Home-Assistant-Ereignis nodarion_alert. Damit lassen sich eigene Automationen und weitere Eskalationswege bauen.": "Regardless of these switches, every new warning fires the Home Assistant event nodarion_alert. It can be used for custom automations and additional escalation paths.",
  "Die tägliche Auswertung fasst Netzwerkzustand, Änderungen und Auffälligkeiten nach dem gewählten Zeitpunkt zusammen. Eine manuelle Analyse bleibt im KI-Reiter jederzeit möglich.": "The daily analysis summarizes network status, changes, and anomalies after the selected time. A manual analysis remains available in the AI tab at any time.",
  "Mit anonymisiertem DNS-Datenschutz werden keine lesbaren Domainnamen an die KI übergeben. Domainnamen mitsenden ermöglicht detailliertere Bewertungen, gibt aber entsprechend mehr Informationen weiter.": "With anonymized DNS privacy, no readable domain names are sent to the AI. Including domain names enables more detailed assessments but shares correspondingly more information.",
  "Offline-Teilnehmer löschen entfernt alle derzeit offline geführten Geräte samt gespeicherter Markierungen und Überwachungseinstellungen.": "Deleting offline devices removes every device currently marked offline, including saved labels and monitoring settings.",
  "Wirklich ALLE derzeit offline angezeigten Geräte sofort entfernen? Offline überwachte Geräte und deren Überwachungseinstellungen werden ebenfalls gelöscht.": "Really remove ALL devices currently shown as offline? Monitored offline devices and their monitoring settings will also be deleted.",
  "wird von": "is being moved from", "übergeben": "to", "Änderungen lösen keine Identitätswarnung aus": "Changes do not trigger an identity warning",
  "Verbunden": "Connected", "Geprüft": "Checked", "Mesh-Wechsel": "Mesh change",
  "Erlaubt": "Allowed", "Blockiert": "Blocked", "Verarbeitet": "Processed",
  "Umbenannt": "Renamed", "Neu erkannt": "Newly detected",
  "Gast verbunden": "Guest connected", "Gast getrennt": "Guest disconnected",
  "Unbekanntes Gerät": "Unknown device", "Instabile Verbindung": "Unstable connection",
  "Identität geändert": "Identity changed", "Neuer Gast": "New guest",
  "Gast lange verbunden": "Guest connected for a long time",
  "ist wieder online": "is back online", "ist offline": "is offline",
  "ist seit mindestens": "has been online for at least",
  "Statuswechsel innerhalb einer Stunde erkannt.": "state changes detected within one hour.",
  "Gerät wurde während der eingestellten Ruhezeit aktiv.": "Device became active during the configured quiet hours.",
  "Gastgerät wurde während der Ruhezeit aktiv.": "Guest device became active during quiet hours.",
  "Gastgerät ist seit mindestens": "Guest device has been connected for at least",
  "Wichtiges Gerät ist seit mindestens": "Important device has been offline for at least",
  "hat das Gastnetz verlassen": "left the guest network",
  "Name geändert": "Name changed", "Mesh-Wechsel von": "Mesh handover from",
  "seit": "since", "Uhr": "", "basiert auf den markierten Home-Geräten": "based on the marked Home devices",
  "alle ": "every ", "Min.": "min.",
}));
const EN_REPLACEMENTS = [...EN].sort((a, b) => b[0].length - a[0].length);
const translateText = (value) => {
  if (panelLocale === "de" || !value) return value;
  let result = String(value);
  for (const [source, target] of EN_REPLACEMENTS) {
    // "Moderat" is a prefix of its English translation "Moderate". A plain
    // replaceAll would therefore append another "e" whenever localization is
    // re-run by the mutation observer.
    result = source === "Moderat"
      ? result.replace(/\bModerat\b/g, target)
      : result.replaceAll(source, target);
  }
  return result;
};
const activeLocale = () => panelLocale === "de" ? "de-DE" : "en-GB";

const ipv4Number = (value) => {
  const parts = String(value || "").split(".");
  if (parts.length !== 4 || parts.some((part) =>
    !/^\d+$/.test(part) || Number(part) > 255
  )) return null;
  return parts.reduce((result, part) => result * 256 + Number(part), 0);
};

const onboardingStatus = (ip, rules = {}) => {
  if (!rules.onboarding_enabled) return "unknown";
  const value = ipv4Number(ip);
  const start = ipv4Number(rules.onboarding_start);
  const end = ipv4Number(rules.onboarding_end);
  if (value === null || start === null || end === null) return "unknown";
  return value >= Math.min(start, end) && value <= Math.max(start, end)
    ? "onboarding"
    : "assigned";
};

const formatLease = (seconds) => {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return null;
  const value = Math.max(0, Number(seconds));
  // Some FRITZ!OS versions report 0 when no remaining lease duration is
  // exposed. Treat that as unavailable instead of showing a misleading timer.
  if (value <= 0) return null;
  if (value < 60) return `${Math.round(value)} Sek.`;
  if (value < 3600) return `${Math.round(value / 60)} Min.`;
  if (value < 86400) return `${Math.round(value / 3600)} Std.`;
  return `${Math.round(value / 86400)} Tage`;
};

const formatRemainingDuration = (milliseconds) => {
  const value = Math.max(0, Number(milliseconds) || 0);
  if (value < 3600000) {
    return `${Math.max(1, Math.ceil(value / 60000))} Minuten`;
  }
  if (value < 86400000) {
    return `${Math.ceil(value / 3600000)} Stunden`;
  }
  const totalHours = Math.round(value / 3600000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const dayLabel = `${days} ${days === 1 ? "Tag" : "Tage"}`;
  return hours ? `${dayLabel} ${hours} Stunden` : dayLabel;
};

const formatDateTime = (value) => {
  if (!value) return "–";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "–"
    : new Intl.DateTimeFormat(activeLocale(), {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
      }).format(date);
};

const isPrivateMac = (value) => {
  const firstOctet = Number.parseInt(String(value || "").replaceAll("-", ":").split(":")[0], 16);
  return Number.isFinite(firstOctet) && Boolean(firstOctet & 0x02);
};

const formatStateChanged = (value) => {
  if (!value) return "Zeit unbekannt";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Zeit unbekannt";
  const day = new Intl.DateTimeFormat(activeLocale(), {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat(activeLocale(), {
    hour: "2-digit", minute: "2-digit",
  }).format(date);
  return `${day}\n${time} Uhr`;
};

const deviceIcon = (entity) => {
  const attr = entity.attributes || {};
  const name = [
    attr.hostname,
    attr.friendly_name,
    attr.model,
    attr.manufacturer,
    attr.mac_vendor,
  ].filter(Boolean).join(" ").toLocaleLowerCase("de-DE");
  const matches = (...terms) => terms.some((term) => name.includes(term));

  if (matches("iphone", "android", "smartphone", "telefon", "phone", "pixel")) return "mdi:cellphone";
  if (matches("ipad", "tablet", "galaxy tab", "surface")) return "mdi:tablet";
  if (matches("macbook", "notebook", "laptop", "thinkpad", "chromebook")) return "mdi:laptop";
  if (matches("desktop", "computer", "workstation", "imac", "mac mini", "pc-")) return "mdi:desktop-tower-monitor";
  if (matches("printer", "drucker", "epson", "brother", "laserjet", "officejet")) return "mdi:printer";
  if (matches("apple tv", "fire tv", "chromecast", "smarttv", "smart-tv", "television", "fernseher")) return "mdi:television";
  if (matches("playstation", "xbox", "nintendo", "switch", "steam deck")) return "mdi:gamepad-variant";
  if (matches("camera", "kamera", "doorbell", "ring ", "reolink", "tapo c")) return "mdi:cctv";
  if (matches("speaker", "lautsprecher", "sonos", "homepod", "echo", "alexa")) return "mdi:speaker";
  if (matches("nas", "synology", "qnap", "server", "proxmox", "raspberry")) return "mdi:server";
  if (matches("router", "fritz!box", "gateway")) return "mdi:router-wireless";
  if (matches("repeater", "access point", "access-point", "fritz!repeater")) return "mdi:access-point";
  if (matches("thermostat", "sensor", "steckdose", "plug", "shelly", "tuya", "esp", "zigbee", "iot")) return "mdi:chip";
  if (String(attr.connection_type || "").toUpperCase() === "WLAN") return "mdi:wifi";
  return "mdi:lan";
};

const blockReason = (value) => ({
  FilteredBlackList: "Blockliste",
  FilteredSafeBrowsing: "Safe Browsing",
  FilteredParental: "Jugendschutz",
  FilteredSafeSearch: "Safe Search",
  FilteredBlockedService: "Gesperrter Dienst",
  FilteredInvalid: "Ungültige Anfrage",
}[value] || value || "–");

const topDomains = (items) => (items || [])
  .map(([domain, count]) => `${domain} (${count})`)
  .join(", ");

const signalRating = (attr) => {
  const hasDbm = attr.signal_strength_dbm !== null && attr.signal_strength_dbm !== undefined;
  const dbm = Number(attr.signal_strength_dbm);
  if (hasDbm && Number.isFinite(dbm)) {
    if (dbm >= -55) return { level: "good", label: "Sehr gut" };
    if (dbm >= -67) return { level: "okay", label: "Gut" };
    if (dbm >= -75) return { level: "warn", label: "Schwach" };
    return { level: "bad", label: "Sehr schwach" };
  }
  const hasPercent = attr.signal_strength_percent !== null && attr.signal_strength_percent !== undefined;
  const percent = Number(attr.signal_strength_percent);
  if (!hasPercent || !Number.isFinite(percent)) return null;
  if (percent >= 75) return { level: "good", label: "Sehr gut" };
  if (percent >= 50) return { level: "okay", label: "Gut" };
  if (percent >= 25) return { level: "warn", label: "Schwach" };
  return { level: "bad", label: "Sehr schwach" };
};

const dnsRating = (ratio) => {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return null;
  if (value < 5) return { level: "good", label: "Unauffällig" };
  if (value < 15) return { level: "okay", label: "Moderat" };
  if (value < 30) return { level: "warn", label: "Erhöht" };
  return { level: "bad", label: "Auffällig hoch" };
};

class EngelsoftNodarionPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._columnFilters = {};
    this._columnVisibility = this._loadColumnVisibility();
    this._sort = "ip";
    this._sortDirection = "asc";
    this._logDeviceFilter = null;
    this._logFilters = { time: "", device: "", type: "", service: "", details: "" };
    this._settingsHelp = null;
    this._settingsTab = this._loadSettingsTab();
    this._notifyTargetQuery = "";
    this._notifyTargetsDirty = false;
    this._dnsLive = {
      entries: [], series: [], client: null, name: null, updated_at: null,
    };
    this._dnsLiveFilters = { domain: "", status: "all" };
    this._dnsLiveLoading = false;
    this._dnsLivePaused = false;
    this._dnsChartVisible = true;
    this._dnsControlsActive = false;
    this._dnsLiveTimer = null;
    this._dnsLiveSignature = "";
    this._dnsRenderedSignature = "";
    this._adguardConfig = { rules: [], rewrites: [], loading: false, error: null };
    this._adguardConfigOpen = false;
    this._dnsPolicyPrompt = null;
    this._dnsPausedBeforeConfig = false;
    this._connectionsExpanded = false;
    this._guestModalOpen = false;
    this._activeTab = "participants";
    this._lastSignature = "";
    this._lastMonitorLoad = 0;
    this._built = false;
    this._monitor = {
      monitored: [], notifications: [], events: [], alerts: [], known_hosts: [],
      presence_devices: [],
      rules: {}, learning: { active: true }, summary: {}, participants: [],
      guest_access: { available: false, enabled: false, clients: 0 },
      guest_since: {},
      ai_analysis: { reports: [], running: false, last_error: null },
    };
    this._monitorLoading = false;
    this._translationFrame = null;
    this._translationObserver = new MutationObserver(() => this._scheduleLocalization());
    this._observeTranslations();
  }

  connectedCallback() {
    this._observeTranslations();
  }

  disconnectedCallback() {
    window.clearTimeout(this._dnsLiveTimer);
    if (this._translationFrame !== null) {
      window.cancelAnimationFrame(this._translationFrame);
      this._translationFrame = null;
    }
    this._translationObserver.disconnect();
  }

  _observeTranslations() {
    this._translationObserver.observe(this.shadowRoot, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["title", "placeholder", "aria-label"],
    });
  }

  _scheduleLocalization() {
    if (panelLocale === "de" || this._translationFrame !== null) return;
    this._translationFrame = window.requestAnimationFrame(() => {
      this._translationFrame = null;
      this._localizeDom();
    });
  }

  _localizeDom() {
    if (panelLocale === "de") return;
    // Translation itself changes text nodes. Temporarily disconnecting avoids
    // feeding those changes back into the observer and locking up the UI.
    this._translationObserver.disconnect();
    const walker = document.createTreeWalker(this.shadowRoot, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest("style, script")) continue;
      const translated = translateText(node.nodeValue);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    }
    for (const element of this.shadowRoot.querySelectorAll("[title], [placeholder], [aria-label]")) {
      for (const attribute of ["title", "placeholder", "aria-label"]) {
        if (!element.hasAttribute(attribute)) continue;
        const value = element.getAttribute(attribute);
        const translated = translateText(value);
        if (translated !== value) element.setAttribute(attribute, translated);
      }
    }
    this._observeTranslations();
  }

  _loadColumnVisibility() {
    try {
      return JSON.parse(localStorage.getItem("ha-net-mon-columns") || "{}");
    } catch (_error) {
      return {};
    }
  }

  _saveColumnVisibility() {
    try {
      localStorage.setItem("ha-net-mon-columns", JSON.stringify(this._columnVisibility));
    } catch (_error) {
      // Local storage can be unavailable in a locked-down browser session.
    }
  }

  _loadSettingsTab() {
    try {
      const tab = localStorage.getItem("nodarion-settings-tab");
      return ["general", "devices", "rules", "notifications", "ai-maintenance"].includes(tab)
        ? tab : "general";
    } catch (_error) {
      return "general";
    }
  }

  _saveSettingsTab() {
    try {
      localStorage.setItem("nodarion-settings-tab", this._settingsTab);
    } catch (_error) {
      // Local storage can be unavailable in a locked-down browser session.
    }
  }

  set hass(value) {
    this._hass = value;
    const nextLocale = String(value?.language || "en").toLowerCase().startsWith("de") ? "de" : "en";
    if (nextLocale !== panelLocale) {
      panelLocale = nextLocale;
      if (this._built) {
        this._built = false;
        this._build();
      }
    }
    if (!this._built) this._build();
    const darkMode = value?.themes?.darkMode;
    this.dataset.theme = darkMode === undefined
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : (darkMode ? "dark" : "light");
    const signature = this._entities()
      .map((entity) => `${entity.entity_id}:${entity.state}:${entity.last_changed}:${JSON.stringify(entity.attributes)}`)
      .join("|");
    if (signature !== this._lastSignature) {
      this._lastSignature = signature;
      this._render();
    }
    if (Date.now() - this._lastMonitorLoad > 10000) this._loadMonitor();
    this._scheduleLocalization();
  }

  set narrow(value) {
    this.toggleAttribute("narrow", Boolean(value));
  }

  set panel(value) {
    this._panel = value;
  }

  _entities() {
    if (!this._hass) return [];
    const states = Object.values(this._hass.states).filter((state) =>
      state.entity_id.startsWith("binary_sensor.") &&
      state.state !== "unavailable" &&
      state.state !== "unknown" &&
      state.attributes.ip_address &&
      Object.hasOwn(state.attributes, "missed_scans")
    );
    const knownKeys = new Set(states.map((state) =>
      state.attributes.nodarion_key || `ip_${state.attributes.ip_address}`
    ));
    for (const participant of this._monitor.participants || []) {
      const key = participant.attributes?.nodarion_key
        || `ip_${participant.attributes?.ip_address}`;
      if (!knownKeys.has(key)) states.push(participant);
    }
    return this._monitor.rules?.guest_monitoring_enabled === false
      ? states.filter((state) => !state.attributes.guest_network)
      : states;
  }

  async _loadMonitor() {
    if (!this._hass || this._monitorLoading) return;
    this._monitorLoading = true;
    try {
      this._monitor = await this._hass.callApi("GET", "nodarion/monitor");
      this._render();
    } catch (_error) {
      // The integration may briefly be unavailable while Home Assistant reloads.
    } finally {
      this._lastMonitorLoad = Date.now();
      this._monitorLoading = false;
    }
  }

  async _setMonitor(key, monitored, notify, presence) {
    try {
      this._monitor = await this._hass.callApi(
        "POST", "nodarion/monitor", { key, monitored, notify, presence }
      );
      this._render();
    } catch (_error) {
      // A later state update retries loading the saved settings.
    }
  }

  async _monitorAction(payload) {
    try {
      this._monitor = await this._hass.callApi(
        "POST", "nodarion/monitor", payload
      );
      this._render();
    } catch (_error) {
      // The next state refresh retries the request.
    }
  }

  async _saveRuleSettings(button, rules, kind) {
    const selector = ".save-watch-rules";
    const defaultLabel = "Alle Einstellungen speichern";
    const defaultContent = `<ha-icon icon="mdi:content-save-outline"></ha-icon>${defaultLabel}`;
    button.disabled = true;
    button.classList.remove("saved", "failed");
    button.classList.add("busy");
    button.innerHTML = '<ha-icon icon="mdi:loading"></ha-icon>Speichert …';
    try {
      this._monitor = await this._hass.callApi(
        "POST", "nodarion/monitor", { action: "set_rules", rules }
      );
      this._notifyTargetsDirty = false;
      this._render();
      const savedButton = this.shadowRoot.querySelector(selector);
      if (!savedButton) return;
      savedButton.disabled = true;
      savedButton.classList.add("saved");
      savedButton.innerHTML = '<ha-icon icon="mdi:check"></ha-icon>Gespeichert';
      window.setTimeout(() => {
        const currentButton = this.shadowRoot.querySelector(selector);
        if (!currentButton?.classList.contains("saved")) return;
        currentButton.disabled = false;
        currentButton.classList.remove("saved");
        currentButton.innerHTML = defaultContent;
      }, 1800);
    } catch (_error) {
      button.disabled = false;
      button.classList.remove("busy");
      button.classList.add("failed");
      button.innerHTML = '<ha-icon icon="mdi:alert-circle-outline"></ha-icon>Speichern fehlgeschlagen';
      window.setTimeout(() => {
        if (!button.isConnected || !button.classList.contains("failed")) return;
        button.classList.remove("failed");
        button.innerHTML = defaultContent;
      }, 3000);
    }
  }

  async _runAiAnalysis(button) {
    if (button) {
      button.disabled = true;
      button.classList.add("busy");
    }
    try {
      this._monitor = await this._hass.callApi(
        "POST", "nodarion/monitor", { action: "run_ai_analysis", language: panelLocale }
      );
    } catch (error) {
      this._monitor.ai_analysis = {
        ...(this._monitor.ai_analysis || {}),
        last_error: error?.message || "KI-Analyse fehlgeschlagen",
      };
    } finally {
      button?.classList.remove("busy");
      if (button) button.disabled = false;
      this._renderAi();
      this._renderSettings();
    }
  }

  _showTab(tab) {
    this._activeTab = tab;
    if (tab !== "dns") window.clearTimeout(this._dnsLiveTimer);
    this.shadowRoot.querySelectorAll("[data-nav-tab]").forEach((item) => {
      const active = item.dataset.navTab === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-current", active ? "page" : "false");
    });
    const settingsButton = this.shadowRoot.querySelector(".header-settings");
    settingsButton?.classList.toggle("active", tab === "settings");
    settingsButton?.setAttribute("aria-current", tab === "settings" ? "page" : "false");
    this.shadowRoot.querySelectorAll(".tab-view").forEach((view) =>
      view.toggleAttribute("hidden", view.dataset.view !== tab));
  }

  _navigateTo(tab) {
    if (tab === "dns") {
      this._openDnsLive();
      return;
    }
    this._showTab(tab);
    if (["watch", "ai", "settings"].includes(tab)) this._loadMonitor();
    if (tab === "log") this._renderLog();
    if (tab === "ai") this._renderAi();
    if (tab === "watch") this._renderWatch();
    if (tab === "settings") this._renderSettings();
  }

  _openDnsLive(client = null, name = null) {
    this._dnsLive.client = client;
    this._dnsLive.name = name;
    this._dnsLive.entries = [];
    this._dnsLive.series = [];
    this._dnsLive.updated_at = null;
    this._dnsLive.error = null;
    this._dnsLiveSignature = "";
    this._dnsRenderedSignature = "";
    this._dnsLivePaused = false;
    this._showTab("dns");
    this._renderDnsLive();
    this._loadDnsLive();
    if (this._hass?.user?.is_admin) this._loadAdguardConfig();
  }

  async _loadAdguardConfig() {
    if (!this._hass?.user?.is_admin || this._adguardConfig.loading) return;
    this._adguardConfig.loading = true;
    try {
      const result = await this._hass.callApi(
        "GET", "nodarion/monitor?view=adguard_config"
      );
      this._adguardConfig = {
        rules: result.rules || [],
        rewrites: result.rewrites || [],
        loading: false,
        error: null,
      };
    } catch (error) {
      this._adguardConfig = {
        ...this._adguardConfig,
        loading: false,
        error: error?.message || "AdGuard-Konfiguration ist nicht erreichbar.",
      };
    }
    this._dnsRenderedSignature = "";
    this._renderDnsLive();
  }

  async _adguardAction(payload, confirmation = null) {
    if (confirmation && !window.confirm(confirmation)) return;
    this._dnsLivePaused = true;
    try {
      const result = await this._hass.callApi(
        "POST", "nodarion/monitor", payload
      );
      this._adguardConfig = {
        rules: result.rules || [],
        rewrites: result.rewrites || [],
        loading: false,
        error: null,
      };
      this._dnsRenderedSignature = "";
      this._renderDnsLive();
    } catch (error) {
      window.alert(error?.message || "AdGuard-Änderung fehlgeschlagen.");
    }
  }

  async _loadDnsLive() {
    if (!this._hass || this._dnsLiveLoading || this._activeTab !== "dns") return;
    this._dnsLiveLoading = true;
    if (!this._dnsLive.entries.length && !this._dnsLive.updated_at) {
      this._renderDnsLive();
    }
    let needsRender = false;
    try {
      const client = this._dnsLive.client
        ? `&client=${encodeURIComponent(this._dnsLive.client)}`
        : "";
      const result = await this._hass.callApi(
        "GET", `nodarion/monitor?view=adguard_live${client}`
      );
      const entries = result.entries || [];
      const series = result.series || [];
      const signature = JSON.stringify({ entries, series });
      if (signature !== this._dnsLiveSignature || this._dnsLive.error) {
        this._dnsLiveSignature = signature;
        this._dnsLive = {
          ...this._dnsLive,
          entries,
          series,
          updated_at: result.updated_at,
          error: null,
        };
        needsRender = true;
      }
    } catch (error) {
      const message = error?.message || "AdGuard Home ist nicht erreichbar.";
      needsRender = this._dnsLive.error !== message;
      this._dnsLive.error = message;
    } finally {
      this._dnsLiveLoading = false;
      if (needsRender && !this._dnsControlsActive) this._renderDnsLive();
      window.clearTimeout(this._dnsLiveTimer);
      if (this._activeTab === "dns" && !this._dnsLivePaused) {
        this._dnsLiveTimer = window.setTimeout(() => this._loadDnsLive(), 3000);
      }
    }
  }

  _build() {
    this._built = true;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --ns-bg: #181716;
          --ns-panel: rgba(76, 72, 67, .50);
          --ns-line: rgba(255, 246, 229, .10);
          --ns-green: #f0a13b;
          --ns-cyan: #f5d7a3;
          --ns-red: #ff786f;
          display: block;
          min-height: 100%;
          color-scheme: dark;
          color: #fffaf1;
          background:
            radial-gradient(ellipse at 54% 42%, rgba(212, 139, 43, .29), transparent 31rem),
            radial-gradient(ellipse at 16% 76%, rgba(158, 104, 40, .15), transparent 28rem),
            linear-gradient(135deg, rgba(255,255,255,.025), transparent 48%),
            var(--ns-bg);
          font-family: "Manrope", "Avenir Next", "Segoe UI Variable", "Segoe UI", sans-serif;
        }
        * { box-sizing: border-box; }
        .shell { width:100%; max-width:none; margin:0; padding:28px clamp(14px,2vw,30px) 52px; position:relative; isolation:isolate; }
        .shell::before {
          content:""; position:fixed; z-index:-1; inset:0; pointer-events:none; opacity:.28;
          background-image:radial-gradient(rgba(255,255,255,.16) .45px, transparent .45px);
          background-size:4px 4px; mix-blend-mode:soft-light;
        }
        header { display:flex; align-items:center; justify-content:space-between; gap:24px; margin-bottom:28px; }
        .brand { display:flex; align-items:center; gap:16px; }
        .header-actions { display:flex; align-items:center; justify-content:flex-end; gap:10px; }
        .header-action { min-height:43px; display:flex; align-items:center; gap:8px; padding:10px 14px; border:1px solid var(--ns-line); border-radius:13px; color:#cce5dc; background:rgba(255,255,255,.04); font:inherit; font-size:11px; font-weight:750; white-space:nowrap; cursor:pointer; transition:.18s ease; }
        .header-action:hover, .header-action.active { color:#fff7e9; border-color:rgba(240,161,59,.38); background:rgba(240,161,59,.1); }
        .header-action ha-icon { --mdc-icon-size:18px; }
        .connection-status { color:#bcecff; }
        .connection-status ha-icon { color:var(--ns-cyan); }
        .connection-status ha-icon:last-child { --mdc-icon-size:16px; transition:transform .18s ease; }
        .connection-status.open ha-icon:last-child { transform:rotate(180deg); }
        .version-info { color:#73958a; font-size:11px; margin-top:4px; min-height:14px; }
        .logo {
          width:58px; height:58px; display:grid; place-items:center; border-radius:18px;
          background:linear-gradient(145deg, rgba(85,242,162,.22), rgba(80,215,255,.08));
          border:1px solid rgba(85,242,162,.3); box-shadow:0 0 40px rgba(85,242,162,.12);
        }
        .logo ha-icon { color:var(--ns-green); --mdc-icon-size:31px; }
        h1 { margin:0; font-size:clamp(26px,3vw,38px); letter-spacing:-1.5px; font-weight:720; }
        .eyebrow { color:var(--ns-cyan); font-size:10px; letter-spacing:2.8px; font-weight:750; text-transform:uppercase; margin-bottom:5px; }
        .scan {
          border:1px solid rgba(85,242,162,.3); color:#eafff3; background:rgba(85,242,162,.09);
          border-radius:13px; padding:12px 17px; display:flex; gap:9px; align-items:center;
          font:inherit; font-weight:700; cursor:pointer; transition:.18s ease;
        }
        .scan:hover { transform:translateY(-2px); background:rgba(85,242,162,.16); }
        .scan.busy ha-icon { animation:spin .8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .metrics { display:grid; grid-template-columns:1.25fr .9fr .9fr 1.15fr 1.35fr; gap:14px; margin-bottom:18px; }
        .metric, .toolbar, .table-panel, .log-panel, .mesh-panel, .watch-panel {
          background:var(--ns-panel); border:1px solid var(--ns-line);
          backdrop-filter:blur(22px) saturate(110%); box-shadow:0 22px 55px rgba(10,8,5,.22), inset 0 1px rgba(255,255,255,.035);
        }
        .metric { padding:18px 20px; border-radius:17px; position:relative; overflow:hidden; }
        .metric:is(button) { color:inherit; text-align:left; font:inherit; cursor:pointer; transition:transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease; }
        .metric:is(button):hover { transform:translateY(-2px); border-color:rgba(240,161,59,.4); background:rgba(240,161,59,.09); box-shadow:0 24px 58px rgba(10,8,5,.25), inset 0 1px rgba(255,255,255,.055); }
        .nav-metric { width:100%; min-width:0; color:inherit; text-align:left; font:inherit; cursor:pointer; transition:transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease; }
        .nav-metric:hover { transform:translateY(-2px); border-color:rgba(240,161,59,.4); background:rgba(240,161,59,.09); }
        .nav-metric.active { border-color:rgba(240,161,59,.72); box-shadow:0 0 0 1px rgba(240,161,59,.24), 0 22px 55px rgba(10,8,5,.22); }
        .metric-status-value { display:flex; align-items:center; gap:8px; margin-top:12px; color:#effff8; font-size:20px; font-weight:780; }
        .metric-status-value ha-icon { color:var(--ns-cyan); --mdc-icon-size:23px; }
        .metric.events-metric { --glow:#ffd766; }
        .metric.dns-metric { --glow:var(--ns-cyan); }
        .metric.watch-metric { --glow:var(--ns-green); }
        .metric-alert-badge { display:inline-flex; align-items:center; justify-content:center; min-width:21px; height:21px; padding:0 6px; border-radius:999px; color:#2c160f; background:#ff8c72; font-size:10px; font-weight:850; }
        .guest-inline { position:relative; z-index:3; display:inline-flex; align-items:center; gap:5px; margin-top:7px; padding:4px 7px; border:0; border-radius:7px; color:#bcecff; background:rgba(80,215,255,.08); font:inherit; font-size:9px; font-weight:750; cursor:pointer; }
        .guest-inline ha-icon { --mdc-icon-size:14px; }
        .metric::after { content:""; position:absolute; inset:auto -20px -35px auto; width:90px; height:90px; border-radius:50%; background:var(--glow); filter:blur(32px); opacity:.24; }
        .metric-label { color:#9bb8af; font-size:13px; text-transform:uppercase; letter-spacing:1.2px; font-weight:700; }
        .metric-value { font-size:31px; font-weight:780; margin-top:7px; letter-spacing:-1px; }
        .metric.devices { --glow:var(--ns-green); }
        .device-counts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:7px; }
        .device-count { appearance:none; min-width:0; border:0; outline:0; padding:5px 7px; color:inherit; background:transparent; text-align:left; font:inherit; cursor:pointer; border-radius:8px; transition:color .18s ease, background .18s ease, transform .18s ease; }
        .device-count:hover, .function-count:hover { color:#fffaf1; background:rgba(240,161,59,.13); transform:translateY(-1px); }
        .device-count.active, .function-count.active { background:rgba(240,161,59,.18); box-shadow:inset 0 0 0 1px rgba(240,161,59,.28); }
        .device-count:focus, .device-count:focus-visible { border:0; outline:0; box-shadow:none; }
        .device-count + .device-count { padding-left:12px; border-left:1px solid var(--ns-line); }
        .device-count strong { display:block; font-size:31px; line-height:1; letter-spacing:-1px; }
        .device-count.online strong { color:var(--ns-green); }
        .device-count.offline strong { color:var(--ns-red); }
        .device-count.new strong { color:#ffd766; }
        .device-count span { display:block; margin-top:6px; color:#8eaea4; font-size:10px; font-weight:750; text-transform:uppercase; letter-spacing:.8px; }
        .function-counts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:9px; }
        .function-count { appearance:none; min-width:0; border:0; outline:0; padding:5px 8px; color:inherit; background:transparent; text-align:left; font:inherit; cursor:pointer; border-radius:8px; transition:color .18s ease, background .18s ease, transform .18s ease; }
        .function-count + .function-count { border-left:1px solid var(--ns-line); }
        .function-count:focus, .function-count:focus-visible { outline:0; box-shadow:none; }
        .function-count strong { display:flex; align-items:center; gap:6px; color:#f4dfbd; font-size:24px; line-height:1; }
        .function-count ha-icon { color:var(--ns-green); --mdc-icon-size:17px; }
        .function-count.notify ha-icon { color:var(--ns-cyan); }
        .function-count.presence ha-icon { color:#8fffc2; }
        .function-count span { display:block; margin-top:7px; overflow:hidden; color:#8eaea4; font-size:9px; font-weight:750; text-overflow:ellipsis; text-transform:uppercase; letter-spacing:.65px; white-space:nowrap; }
        .metric.network { --glow:var(--ns-cyan); } .metric.network .metric-value { color:var(--ns-cyan); font-size:20px; margin-top:13px; }
        .metric.quick-filter { width:100%; color:inherit; text-align:left; font:inherit; cursor:pointer; }
        .metric.quick-filter:hover { border-color:rgba(240,161,59,.4); background:rgba(240,161,59,.09); }
        .metric.quick-filter.active { border-color:rgba(240,161,59,.62); box-shadow:0 0 0 1px rgba(240,161,59,.2), 0 22px 55px rgba(10,8,5,.22); }
        .metric.connections { --glow:var(--ns-cyan); width:100%; color:inherit; text-align:left; font:inherit; cursor:pointer; }
        .metric.connections .metric-value { display:flex; align-items:center; justify-content:space-between; color:var(--ns-cyan); font-size:20px; margin-top:13px; }
        .metric.connections ha-icon { --mdc-icon-size:21px; transition:transform .18s ease; }
        .metric.connections.open ha-icon { transform:rotate(180deg); }
        .metric.ai-metric { --glow:#b68cff; width:100%; color:inherit; text-align:left; font:inherit; cursor:pointer; }
        .metric.ai-metric .metric-value { color:#b68cff; }
        .metric-note { display:block; margin-top:5px; color:#8eaea4; font-size:10px; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .connection-panel { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin:-4px 0 18px; padding:16px; border-radius:17px; background:var(--ns-panel); border:1px solid var(--ns-line); }
        .connection-panel[hidden] { display:none; }
        .connection-card { --connection-color:var(--ns-green); display:grid; grid-template-columns:11px minmax(0,1fr) auto; align-items:center; gap:11px; padding:13px 14px; border-radius:12px; background:rgba(2,10,8,.38); border:1px solid color-mix(in srgb,var(--connection-color) 22%,transparent); }
        .connection-card.offline { --connection-color:var(--ns-red); }
        .connection-card.disabled { --connection-color:#66857c; }
        .connection-dot { width:9px; height:9px; border-radius:50%; background:var(--connection-color); box-shadow:0 0 10px color-mix(in srgb,var(--connection-color) 70%,transparent); }
        .connection-name { color:#effff8; font-size:14px; font-weight:750; }
        .connection-device-info { display:block; margin-top:3px; color:#aaa49a; font-size:10px; font-weight:550; }
        .connection-state { color:var(--connection-color); font-size:11px; font-weight:750; margin-top:3px; }
        .connection-time { color:#a9c9be; font:700 13px ui-monospace,SFMono-Regular,Consolas,monospace; text-align:right; }
        .connection-checked { display:block; color:#58776e; font:500 10px Inter,Roboto,sans-serif; margin-top:3px; }
        .toolbar { padding:12px; border-radius:17px; display:flex; gap:12px; margin-bottom:18px; }
        .tabs { display:flex; gap:7px; margin:2px 0 18px; padding:6px; width:max-content; max-width:100%; overflow:auto; border-radius:15px; background:rgba(13,30,27,.62); border:1px solid var(--ns-line); }
        .tab { display:flex; align-items:center; gap:8px; padding:11px 17px; border:0; border-radius:10px; color:#9ab8ae; background:transparent; font:inherit; font-size:14px; font-weight:750; cursor:pointer; white-space:nowrap; }
        .tab ha-icon { --mdc-icon-size:19px; }
        .tab-badge { min-width:18px; height:18px; display:none; place-items:center; padding:0 5px; border-radius:999px; color:#27080c; background:var(--ns-red); font-size:9px; }
        .tab-badge.visible { display:grid; }
        .tab.active { color:#092018; background:var(--ns-green); box-shadow:0 6px 18px rgba(85,242,162,.14); }
        .tab-view[hidden] { display:none !important; }
        .search { flex:1; position:relative; min-width:180px; }
        .search ha-icon { position:absolute; left:13px; top:12px; color:#66857c; --mdc-icon-size:21px; }
        input, select {
          width:100%; color:#ecfff6; background:rgba(2,10,8,.46); border:1px solid var(--ns-line);
          outline:none; border-radius:11px; padding:13px 14px; font:inherit; font-size:14px;
        }
        input { padding-left:43px; } input:focus, select:focus { border-color:rgba(85,242,162,.55); box-shadow:0 0 0 3px rgba(85,242,162,.08); }
        select { width:auto; min-width:145px; }
        .filters { display:flex; gap:7px; }
        .filter { border:0; padding:11px 15px; border-radius:10px; color:#9ab8ae; background:transparent; font:inherit; font-size:14px; font-weight:700; cursor:pointer; }
        .filter.active { color:#092018; background:var(--ns-green); }
        .cleanup { display:flex; align-items:center; gap:8px; padding:11px 14px; border-radius:10px; color:#ffd5d9; background:rgba(255,107,120,.07); border:1px solid rgba(255,107,120,.22); font:inherit; font-size:13px; font-weight:700; cursor:pointer; white-space:nowrap; }
        .cleanup:hover { color:#fff; background:rgba(255,107,120,.14); }
        .cleanup ha-icon { --mdc-icon-size:18px; }
        .cleanup.busy ha-icon { animation:spin .8s linear infinite; }
        .cleanup-result { display:none; margin:-7px 0 18px; padding:11px 14px; border-radius:11px; color:#cce5dc; background:rgba(80,215,255,.07); border:1px solid rgba(80,215,255,.18); font-size:13px; }
        .cleanup-result.visible { display:block; }
        .tab-view[data-view="participants"] { position:relative; }
        .column-config-head { width:48px; min-width:48px; padding:6px !important; text-align:center; }
        .column-picker-button { width:35px; height:35px; display:grid; place-items:center; padding:0; border-radius:9px; color:#dff7ed; background:rgba(80,215,255,.08); border:1px solid rgba(80,215,255,.25); font:inherit; cursor:pointer; }
        .column-picker-button:hover { color:#fff5e4; background:rgba(240,161,59,.14); border-color:rgba(240,161,59,.38); }
        .column-picker-button ha-icon { --mdc-icon-size:19px; }
        .column-picker { position:absolute; z-index:20; right:8px; top:48px; display:grid; grid-template-columns:repeat(2,minmax(150px,1fr)); gap:7px; width:min(390px,calc(100vw - 36px)); padding:12px; border-radius:13px; background:#0b211b; border:1px solid rgba(80,215,255,.25); box-shadow:0 18px 45px rgba(0,0,0,.42); }
        .column-picker[hidden] { display:none; }
        .column-picker label { display:flex; align-items:center; gap:9px; padding:7px 8px; border-radius:8px; color:#cce5dc; font-size:13px; cursor:pointer; }
        .column-picker label:hover { background:rgba(85,242,162,.06); }
        .column-picker input { width:17px; height:17px; padding:0; accent-color:var(--ns-green); }
        .column-picker-head {
          grid-column:1/-1; display:flex; align-items:center;
          justify-content:space-between; gap:12px; padding:2px 4px 8px;
          color:#fffaf1; font-size:12px; font-weight:800;
          border-bottom:1px solid var(--ns-line);
        }
        .column-picker-close {
          width:30px; height:30px; display:grid; place-items:center; padding:0;
          border-radius:8px; color:#d8d0c5; background:rgba(255,255,255,.05);
          border:1px solid var(--ns-line); cursor:pointer;
        }
        .column-picker-close:hover { color:#fff; background:rgba(240,161,59,.14); }
        .column-picker-close ha-icon { --mdc-icon-size:18px; }
        .table-column-picker {
          position:absolute; z-index:12; top:8px; right:18px;
          background:#3b3733; box-shadow:0 7px 20px rgba(0,0,0,.34);
        }
        .table-panel { border-radius:18px; overflow:auto; max-height:72vh; scrollbar-color:rgba(85,242,162,.3) rgba(2,10,8,.25); scrollbar-gutter:stable; }
        [data-column][hidden] { display:none; }
        table { width:max-content; min-width:100%; border-collapse:collapse; }
        th { position:sticky; top:0; z-index:2; color:#8eaea4; background:rgba(9,24,20,.98); font-size:11px; text-transform:uppercase; letter-spacing:1.05px; text-align:left; padding:0; border-bottom:1px solid rgba(85,242,162,.2); white-space:nowrap; }
        .sort-head { width:100%; display:flex; align-items:center; gap:7px; padding:16px; border:0; color:inherit; background:transparent; font:inherit; font-weight:800; letter-spacing:inherit; text-transform:inherit; cursor:pointer; text-align:left; }
        .sort-head:hover { color:#d9f8ed; background:rgba(85,242,162,.05); }
        .sort-head:focus-visible { outline:2px solid var(--ns-green); outline-offset:-3px; }
        .sort-head ha-icon { opacity:.35; --mdc-icon-size:16px; }
        .sort-head.active { color:var(--ns-green); }
        .sort-head.active ha-icon { opacity:1; }
        th.no-sort { padding:16px; }
        .column-filters th { position:sticky; top:49px; padding:8px; background:rgba(7,19,16,.98); }
        .column-filter {
          width:100%; min-width:95px; min-height:38px;
          padding:9px 11px !important; border-radius:9px; font-size:12px;
          color:#f4eee5; background:#35322f;
          border:1px solid rgba(255,246,229,.12);
        }
        .column-filter::placeholder { color:#58776e; }
        .column-filter.has-value {
          color:#fff5e5; background-color:rgba(240,161,59,.14);
          border-color:rgba(240,161,59,.62);
          box-shadow:inset 3px 0 #f0a13b, 0 0 0 1px rgba(240,161,59,.08);
        }
        .column-filter.has-value::placeholder { color:#d6b985; }
        select.column-filter {
          min-width:125px; color-scheme:dark; cursor:pointer;
          background-color:#35322f;
        }
        select.column-filter:hover { border-color:rgba(240,161,59,.38); }
        select.column-filter:focus { background-color:#3b3733; }
        select.column-filter option {
          color:#f4eee5; background:#35322f; font-size:13px;
        }
        select.column-filter option:checked {
          color:#fffaf1; background:#76502b;
        }
        .custom-column-filter { position:relative; min-width:190px; color:initial; }
        .custom-column-filter summary {
          min-height:38px; display:flex; align-items:center; justify-content:space-between;
          gap:10px; padding:9px 11px; border-radius:9px; cursor:pointer;
          color:#f4eee5; background:#35322f;
          border:1px solid rgba(255,246,229,.12);
          font-size:12px; font-weight:700; text-transform:none; letter-spacing:0;
          list-style:none;
        }
        .custom-column-filter summary::-webkit-details-marker { display:none; }
        .custom-column-filter summary::after {
          content:""; width:7px; height:7px; flex:0 0 auto;
          border-right:2px solid #e6ded3; border-bottom:2px solid #e6ded3;
          transform:rotate(45deg) translateY(-2px); transition:transform .15s ease;
        }
        .custom-column-filter[open] summary {
          border-color:rgba(240,161,59,.62);
          box-shadow:0 0 0 3px rgba(240,161,59,.10);
        }
        .custom-column-filter[open] summary::after {
          transform:rotate(225deg) translate(-2px,-1px);
        }
        .custom-column-filter.has-value summary {
          color:#fff5e5; background:rgba(240,161,59,.14);
          border-color:rgba(240,161,59,.62);
          box-shadow:inset 3px 0 #f0a13b, 0 0 0 1px rgba(240,161,59,.08);
        }
        .custom-filter-menu {
          position:absolute; z-index:30; top:calc(100% + 6px); left:0;
          width:max-content; min-width:100%; max-width:320px; padding:6px;
          border-radius:11px; background:#292725;
          border:1px solid rgba(255,246,229,.14);
          box-shadow:0 15px 38px rgba(0,0,0,.48);
        }
        .custom-filter-option {
          width:100%; display:grid; grid-template-columns:18px minmax(130px,1fr) auto;
          align-items:center; gap:8px; padding:9px 10px; border:0; border-radius:7px;
          color:#e9e2d8; background:transparent; font:inherit; font-size:12px;
          text-align:left; cursor:pointer; white-space:nowrap;
          text-transform:none; letter-spacing:0;
        }
        .custom-filter-option:hover { color:#fffaf1; background:rgba(240,161,59,.11); }
        .custom-filter-option.active { color:#fff6e8; background:rgba(240,161,59,.18); }
        .custom-filter-option ha-icon { --mdc-icon-size:16px; color:var(--ns-green); }
        .custom-filter-count {
          min-width:25px; padding:2px 6px; border-radius:999px; text-align:center;
          color:#c9c1b7; background:rgba(255,255,255,.06); font-size:10px;
        }
        .settings-select, .dns-status-select { width:100%; min-width:0; }
        .settings-select .custom-filter-menu, .dns-status-select .custom-filter-menu { width:100%; box-sizing:border-box; }
        .dns-status-select .custom-filter-option, .settings-select .custom-filter-option { grid-template-columns:18px minmax(0,1fr); }
        .marker-filter { width:100%; min-width:165px !important; }
        .onboarding-state { display:inline-flex; align-items:center; gap:6px; padding:6px 9px; border-radius:999px; font-size:11px; font-weight:800; white-space:nowrap; }
        .onboarding-state.onboarding { color:#2b2115; background:#f0b94f; }
        .onboarding-state.assigned { color:#d9f5e7; background:rgba(86,190,130,.18); border:1px solid rgba(86,190,130,.32); }
        .onboarding-state.unknown { color:#c5beb4; background:rgba(255,255,255,.06); }
        td { padding:15px 16px; border-bottom:1px solid var(--ns-line); color:#d4ebe3; font-size:14px; line-height:1.4; vertical-align:middle; }
        tbody tr { --state:#b8b1a7; transition:background .15s ease; }
        tbody tr.off { --state:var(--ns-red); opacity:.76; }
        tbody tr:nth-child(even) { background:rgba(255,255,255,.018); }
        tbody tr:hover { background:rgba(85,242,162,.065); }
        tbody tr:last-child td { border-bottom:0; }
        tbody tr.onboarding-row {
          background:linear-gradient(90deg,rgba(240,185,79,.12),rgba(240,185,79,.025) 34%,transparent 70%);
          animation:onboarding-shimmer 3.2s ease-in-out infinite;
        }
        tbody tr.onboarding-row td:first-child {
          box-shadow:inset 4px 0 #f0b94f;
        }
        tbody tr.guest-row td:first-child {
          box-shadow:inset 4px 0 #58b9d6;
        }
        tbody tr.onboarding-row:hover {
          background:linear-gradient(90deg,rgba(240,185,79,.19),rgba(240,185,79,.055) 42%,rgba(240,161,59,.025));
        }
        @keyframes onboarding-shimmer {
          0%,100% { filter:brightness(1); }
          50% { filter:brightness(1.08); }
        }
        @media (prefers-reduced-motion:reduce) {
          tbody tr.onboarding-row { animation:none; }
        }
        .entity-link { color:#effff8; background:none; border:0; padding:0; font:inherit; font-size:14px; font-weight:750; cursor:pointer; text-align:left; }
        .entity-link:hover { color:var(--ns-green); text-decoration:underline; }
        .device-cell { display:flex; align-items:center; gap:11px; min-width:0; }
        .device-icon { flex:0 0 auto; width:35px; height:35px; display:grid; place-items:center; color:var(--ns-cyan); background:rgba(80,215,255,.08); border:1px solid rgba(80,215,255,.16); border-radius:10px; }
        .device-icon ha-icon { --mdc-icon-size:20px; }
        .device-label { min-width:0; }
        .entity { display:block; color:#73958a; font:500 11px ui-monospace,SFMono-Regular,Consolas,monospace; margin-top:4px; }
        .entity-id-link { display:block; margin-top:4px; padding:0; border:0; color:#73958a; background:transparent; font:500 11px ui-monospace,SFMono-Regular,Consolas,monospace; text-align:left; cursor:pointer; }
        .entity-id-link:hover { color:var(--ns-cyan); text-decoration:underline; }
        .detail-stack { display:grid; gap:3px; white-space:nowrap; }
        .detail-stack strong { color:#e4faf2; font-size:14px; font-weight:700; }
        .detail-stack small { color:#82a49a; font-size:12px; }
        .detail-stack .dns-alert { color:var(--ns-red); }
        .dns-live-link { display:block; width:100%; padding:0; border:0; color:inherit; background:transparent; font:inherit; text-align:left; cursor:pointer; }
        .dns-live-link:hover strong { color:var(--ns-cyan); text-decoration:underline; }
        .rating { width:max-content; max-width:100%; min-width:0; box-sizing:border-box; display:inline-flex; align-items:center; gap:6px; margin-top:2px; padding:3px 7px; border-radius:999px; color:var(--rating-color); background:color-mix(in srgb,var(--rating-color) 10%,transparent); border:1px solid color-mix(in srgb,var(--rating-color) 24%,transparent); font-size:11px; font-weight:750; }
        .rating::before { content:""; flex:0 0 auto; width:6px; height:6px; border-radius:50%; background:var(--rating-color); box-shadow:0 0 7px color-mix(in srgb,var(--rating-color) 65%,transparent); }
        .rating-label { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .rating.good, .rating.okay { --rating-color:#b8b1a7; }
        .rating.warn { --rating-color:#ffd766; }
        .rating.bad { --rating-color:var(--ns-red); }
        .mono { font:600 13px ui-monospace,SFMono-Regular,Consolas,monospace; white-space:nowrap; }
        .log-panel { border-radius:18px; padding:24px; overflow:hidden; }
        .log-title { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; }
        .log-heading { display:flex; align-items:center; flex-wrap:wrap; gap:10px; }
        .log-title strong { font-size:20px; }
        .live { display:flex; align-items:center; gap:6px; color:var(--ns-green); font-size:10px; font-weight:800; letter-spacing:1px; }
        .log-filter-summary { display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:999px; color:var(--ns-cyan); background:rgba(80,215,255,.08); border:1px solid rgba(80,215,255,.22); font-size:12px; font-weight:700; }
        .log-filter-summary[hidden] { display:none; }
        .log-clear { display:grid; place-items:center; width:23px; height:23px; padding:0; border:0; border-radius:50%; color:#dff8ef; background:rgba(255,255,255,.09); cursor:pointer; }
        .log-clear ha-icon { --mdc-icon-size:15px; }
        .log-list { overflow:auto; max-height:70vh; border:1px solid var(--ns-line); border-radius:13px; }
        .log-table { width:100%; min-width:1020px; border-collapse:collapse; }
        .log-table th { padding:13px 16px; font-size:11px; }
        .log-filters th { padding:8px; background:rgba(255,255,255,.018); }
        .log-filters .column-filter { width:100%; min-width:140px; box-sizing:border-box; }
        .log-filters .custom-column-filter { width:100%; min-width:170px; }
        .log-entry { --log-color:var(--ns-cyan); background:color-mix(in srgb,var(--log-color) 2.5%,transparent); }
        .log-entry td { padding:15px 16px; font-size:14px; border-bottom:1px solid var(--ns-line); }
        .log-entry:last-child td { border-bottom:0; }
        .log-entry:hover { background:color-mix(in srgb,var(--log-color) 7%,transparent); }
        .log-event { display:flex; align-items:center; gap:10px; color:var(--log-color); font-weight:750; white-space:nowrap; }
        .log-icon { width:28px; height:28px; border-radius:9px; display:grid; place-items:center; background:rgba(80,215,255,.09); color:var(--ns-cyan); }
        .log-icon ha-icon { --mdc-icon-size:16px; }
        .log-entry.offline { --log-color:var(--ns-red); }
        .log-entry.online { --log-color:var(--ns-green); }
        .log-entry.discovered { --log-color:var(--ns-cyan); }
        .log-entry.renamed { --log-color:#ffd766; }
        .log-entry.mesh_changed { --log-color:#b68cff; }
        .log-entry .log-icon { color:var(--log-color); background:color-mix(in srgb,var(--log-color) 12%,transparent); }
        .log-message { color:#cce5dc; font-size:14px; line-height:1.45; }
        .log-device { color:#effff8; font-size:14px; font-weight:750; }
        .log-device-filter { display:inline-flex; align-items:center; gap:6px; max-width:100%; padding:4px 7px; margin:-4px -7px 0; border-radius:7px; color:#effff8; background:transparent; border:1px solid transparent; font:inherit; font-size:14px; font-weight:750; cursor:pointer; text-align:left; }
        .log-device-filter:hover { color:#bcecff; background:rgba(80,215,255,.08); border-color:rgba(80,215,255,.22); }
        .log-device-filter ha-icon { flex:0 0 auto; color:#73dfff; --mdc-icon-size:15px; opacity:.72; }
        .log-device-filter span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .log-ip { color:#73958a; font:500 11px ui-monospace,SFMono-Regular,Consolas,monospace; margin-top:4px; }
        .log-route { display:flex; align-items:center; flex-wrap:wrap; gap:7px; color:#9fbcb2; }
        .log-route span { padding:3px 7px; border-radius:6px; color:#dff7ed; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.07); }
        .log-route ha-icon { color:var(--log-color); --mdc-icon-size:15px; }
        .log-time { color:#9bb8af; font-size:13px; white-space:nowrap; }
        .log-date { display:block; color:#58776e; font-size:11px; margin-top:3px; }
        .dns-panel { border-radius:18px; padding:24px; background:var(--ns-panel); border:1px solid var(--ns-line); box-shadow:0 18px 50px rgba(0,0,0,.18); }
        .dns-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-bottom:16px; }
        .dns-head h2 { display:flex; align-items:center; gap:9px; margin:0 0 5px; font-size:20px; }
        .dns-head h2 ha-icon { color:var(--ns-cyan); --mdc-icon-size:23px; }
        .dns-head p { margin:0; color:#78998f; font-size:12px; }
        .dns-actions { display:flex; align-items:center; gap:8px; }
        .dns-action { display:flex; align-items:center; gap:7px; padding:9px 11px; border-radius:9px; color:#cce5dc; background:rgba(255,255,255,.04); border:1px solid var(--ns-line); font:inherit; font-size:11px; font-weight:750; cursor:pointer; }
        .dns-action:hover { border-color:rgba(80,215,255,.35); }
        .dns-action ha-icon { --mdc-icon-size:16px; }
        .dns-action.busy ha-icon { animation:spin .8s linear infinite; }
        .dns-toolbar { display:grid; grid-template-columns:minmax(210px,1fr) 180px auto; gap:10px; margin-bottom:12px; }
        .dns-toolbar input { padding-left:14px; }
        .dns-client-filter { display:flex; align-items:center; gap:8px; padding:9px 12px; border-radius:10px; color:#bcecff; background:rgba(80,215,255,.08); border:1px solid rgba(80,215,255,.23); font-size:11px; font-weight:750; white-space:nowrap; }
        .dns-client-filter button { display:grid; place-items:center; width:22px; height:22px; padding:0; border:0; border-radius:50%; color:#dff8ef; background:rgba(255,255,255,.09); cursor:pointer; }
        .dns-client-filter ha-icon { --mdc-icon-size:14px; }
        .dns-host-link { display:inline-flex; align-items:center; gap:6px; max-width:100%; padding:0; color:#effff8; background:transparent; border:0; font:inherit; font-size:12px; font-weight:750; cursor:pointer; text-align:left; }
        .dns-host-link:hover { color:#bcecff; text-decoration:underline; text-underline-offset:3px; }
        .dns-host-link ha-icon { flex:0 0 auto; --mdc-icon-size:15px; }
        .dns-host-link span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dns-list { overflow:auto; max-height:68vh; border:1px solid var(--ns-line); border-radius:13px; scrollbar-gutter:stable; }
        .dns-table { width:100%; min-width:1200px; border-collapse:collapse; }
        .dns-table th { padding:13px 14px; }
        .dns-row { --dns-color:#b8b1a7; background:color-mix(in srgb,var(--dns-color) 2.5%,transparent); }
        .dns-row.blocked { --dns-color:var(--ns-red); }
        .dns-row:hover { background:color-mix(in srgb,var(--dns-color) 7%,transparent); }
        .dns-row td { padding:13px 14px; font-size:12px; }
        .dns-result { display:flex; align-items:center; gap:7px; width:max-content; color:var(--dns-color); font-weight:800; white-space:nowrap; }
        .dns-result ha-icon { --mdc-icon-size:17px; }
        .dns-domain { color:#edfff7; font:700 13px ui-monospace,SFMono-Regular,Consolas,monospace; }
        .dns-answer { max-width:260px; overflow:hidden; text-overflow:ellipsis; color:#78998f; font:500 10px ui-monospace,SFMono-Regular,Consolas,monospace; white-space:nowrap; }
        .dns-chip { display:inline-flex; padding:3px 6px; border-radius:6px; color:#b9d8cd; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07); font-size:10px; font-weight:700; }
        .dns-error { margin-bottom:12px; padding:11px 13px; border-radius:10px; color:#ffd5d9; background:rgba(255,107,120,.08); border:1px solid rgba(255,107,120,.23); font-size:12px; }
        .dns-chart { margin-bottom:14px; padding:14px 16px 11px; border-radius:13px; background:rgba(2,10,8,.3); border:1px solid var(--ns-line); }
        .dns-chart-head { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:11px; }
        .dns-chart-title { color:#dff7ed; font-size:12px; font-weight:800; }
        .dns-chart-legend { display:flex; align-items:center; flex-wrap:wrap; gap:13px; color:#8eaea4; font-size:10px; }
        .dns-chart-legend span { display:flex; align-items:center; gap:6px; }
        .dns-chart-legend i { width:8px; height:8px; border-radius:2px; background:var(--legend-color); }
        .dns-chart-bars { display:flex; align-items:stretch; gap:3px; height:165px; padding-top:8px; border-bottom:1px solid rgba(139,255,210,.13); background:repeating-linear-gradient(to bottom,rgba(139,255,210,.06) 0 1px,transparent 1px 41px); }
        .dns-chart-bucket { flex:1; min-width:10px; display:grid; grid-template-rows:1fr 18px; gap:5px; }
        .dns-chart-columns { display:flex; align-items:flex-end; justify-content:center; gap:2px; min-height:0; }
        .dns-chart-bar { width:min(8px,42%); min-height:0; border-radius:3px 3px 1px 1px; background:var(--bar-color); box-shadow:0 0 7px color-mix(in srgb,var(--bar-color) 35%,transparent); }
        .dns-chart-bar.allowed { --bar-color:var(--ns-green); }
        .dns-chart-bar.blocked { --bar-color:var(--ns-red); }
        .dns-chart-label { color:#58776e; font-size:8px; text-align:center; white-space:nowrap; }
        .dns-policy-actions { display:flex; gap:5px; white-space:nowrap; }
        .dns-policy { padding:6px 8px; border-radius:7px; color:#b9d8cd; background:rgba(255,255,255,.04); border:1px solid var(--ns-line); font:inherit; font-size:10px; font-weight:750; cursor:pointer; }
        .dns-policy.block { color:#ffd5d9; border-color:rgba(255,107,120,.25); }
        .dns-policy.allow { color:#aaffd0; border-color:rgba(85,242,162,.25); }
        .dns-policy-modal-backdrop { position:fixed; z-index:1100; inset:0; display:grid; place-items:center; padding:20px; background:rgba(0,8,7,.78); backdrop-filter:blur(8px); }
        .dns-policy-modal { width:min(520px,100%); padding:23px; border-radius:18px; color:#eafff6; background:#0b1815; border:1px solid rgba(85,242,162,.28); box-shadow:0 28px 80px rgba(0,0,0,.55); }
        .dns-policy-modal h3 { display:flex; align-items:center; gap:8px; margin:0 0 8px; font-size:19px; }
        .dns-policy-modal h3 ha-icon { color:var(--ns-green); }
        .dns-policy-modal p { margin:0; color:#8eaea4; font-size:13px; line-height:1.5; overflow-wrap:anywhere; }
        .dns-policy-scope-actions { display:grid; gap:9px; margin-top:20px; }
        .dns-policy-scope { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:10px; color:#dff7ed; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); font:inherit; font-size:12px; font-weight:750; text-align:left; cursor:pointer; }
        .dns-policy-scope:hover { border-color:rgba(85,242,162,.35); background:rgba(85,242,162,.08); }
        .dns-policy-scope:disabled { opacity:.45; cursor:not-allowed; }
        .dns-policy-scope ha-icon { color:var(--ns-green); --mdc-icon-size:19px; }
        .dns-policy-scope.cancel { justify-content:center; color:#8eaea4; background:transparent; border-color:transparent; }
        .adguard-config { margin-top:16px; padding:17px; border-radius:13px; background:rgba(2,10,8,.32); border:1px solid var(--ns-line); }
        .adguard-config h3 { margin:0 0 4px; font-size:15px; }
        .adguard-config > p { margin:0 0 14px; color:#78998f; font-size:11px; }
        .adguard-config-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
        .adguard-box { min-width:0; padding:18px; border-radius:13px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); }
        .adguard-box h4 { margin:0 0 13px; font-size:15px; }
        .adguard-form { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:10px; margin-bottom:14px; }
        .adguard-form.rewrite { grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto; }
        .adguard-form input { min-width:0; min-height:48px; padding:13px 16px; font-size:14px; }
        .adguard-form button { min-height:48px; border:0; border-radius:10px; padding:0 18px; color:#092018; background:var(--ns-green); font:inherit; font-size:13px; font-weight:800; cursor:pointer; }
        .adguard-items { display:grid; gap:8px; max-height:360px; overflow:auto; }
        .adguard-item { display:flex; align-items:center; justify-content:space-between; gap:11px; padding:11px 12px; border-radius:9px; color:#cce5dc; background:rgba(2,10,8,.38); font:550 12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace; overflow-wrap:anywhere; }
        .adguard-item button { width:34px; height:34px; display:grid; place-items:center; flex:0 0 auto; padding:0; border:0; border-radius:8px; color:#ff9ca5; background:rgba(255,107,120,.06); cursor:pointer; }
        .adguard-item button ha-icon { --mdc-icon-size:19px; }
        .adguard-modal-backdrop { position:fixed; z-index:1000; inset:0; display:grid; place-items:center; padding:40px; background:rgba(1,8,6,.76); backdrop-filter:blur(8px); }
        .adguard-modal { width:min(1240px,100%); max-height:calc(100dvh - 80px); overflow:auto; border-radius:21px; padding:28px; color:#effff8; background:#0b211b; border:1px solid rgba(80,215,255,.28); box-shadow:0 16px 48px rgba(0,0,0,.52); }
        .adguard-modal-head { display:flex; align-items:flex-start; justify-content:space-between; gap:22px; margin-bottom:22px; }
        .adguard-modal-head h3 { display:flex; align-items:center; gap:11px; margin:0 0 7px; font-size:24px; }
        .adguard-modal-head h3 ha-icon { color:var(--ns-cyan); --mdc-icon-size:27px; }
        .adguard-modal-head p { margin:0; color:#78998f; font-size:13px; line-height:1.45; }
        .adguard-modal-close { display:grid; place-items:center; width:44px; height:44px; flex:0 0 auto; border-radius:12px; color:#cce5dc; background:rgba(255,255,255,.05); border:1px solid var(--ns-line); cursor:pointer; }
        .adguard-modal-close ha-icon { --mdc-icon-size:24px; }
        .card-actions { display:flex; gap:7px; }
        .watch { width:34px; height:34px; border-radius:10px; display:grid; place-items:center; cursor:pointer; color:#68867d; background:rgba(2,10,8,.35); border:1px solid var(--ns-line); }
        .watch ha-icon { --mdc-icon-size:19px; }
        .watch.active { color:#ffd766; border-color:rgba(255,215,102,.35); background:rgba(255,215,102,.09); }
        .watch.notify.active { color:var(--ns-cyan); border-color:rgba(80,215,255,.35); background:rgba(80,215,255,.09); }
        .watch.presence.active { color:#8fffc2; border-color:rgba(143,255,194,.38); background:rgba(143,255,194,.10); }
        .internet-state { display:grid; gap:7px; min-width:125px; }
        .internet-label { width:max-content; padding:4px 8px; border-radius:999px; color:#9bb8af; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); font-size:11px; font-weight:750; }
        .internet-label.granted { color:#c8c1b7; background:rgba(255,255,255,.04); border-color:rgba(255,255,255,.08); }
        .internet-label.denied { color:var(--ns-red); background:rgba(255,107,120,.08); border-color:rgba(255,107,120,.24); }
        .internet-label.error { color:#ffd766; }
        .approve-internet { padding:7px 9px; border-radius:8px; color:#092018; background:var(--ns-green); border:0; font:inherit; font-size:11px; font-weight:800; cursor:pointer; }
        .approve-internet:disabled { opacity:.55; cursor:wait; }
        .status { display:flex; align-items:center; gap:8px; color:var(--state); font-size:12px; text-transform:uppercase; letter-spacing:1px; font-weight:800; white-space:nowrap; }
        .status-cell { display:grid; gap:4px; }
        .status-time { color:#78998f; font-size:10px; line-height:1.45; white-space:pre-line; }
        .private-mac { display:flex; align-items:center; gap:5px; margin-top:4px; color:#b68cff; font:700 10px Inter,Roboto,sans-serif; white-space:nowrap; }
        .private-mac ha-icon { --mdc-icon-size:13px; }
        .mac-vendor { display:flex; align-items:center; gap:5px; max-width:240px; margin-top:5px; color:var(--ns-cyan); font:700 10px Inter,Roboto,sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:help; }
        .mac-vendor ha-icon { flex:0 0 auto; --mdc-icon-size:13px; }
        .guest-badge { display:inline-flex; align-items:center; gap:4px; width:max-content; margin-top:5px; padding:3px 7px; border-radius:999px; color:#8ee8ff; background:rgba(80,215,255,.1); border:1px solid rgba(80,215,255,.3); font:800 9px Inter,Roboto,sans-serif; letter-spacing:.5px; cursor:pointer; }
        .guest-badge ha-icon { --mdc-icon-size:12px; }
        .guest-metric { cursor:pointer; }
        .guest-metric .metric-value { display:flex; align-items:center; gap:9px; }
        .guest-metric .metric-value ha-icon { color:var(--ns-cyan); --mdc-icon-size:25px; }
        .guest-modal-backdrop { position:fixed; z-index:1000; inset:0; display:grid; place-items:center; padding:20px; background:rgba(0,8,7,.78); backdrop-filter:blur(8px); }
        .guest-modal { width:min(720px,100%); max-height:min(780px,calc(100vh - 40px)); overflow:auto; padding:24px; border-radius:20px; color:#eafff6; background:#0b1815; border:1px solid rgba(80,215,255,.28); box-shadow:0 28px 80px rgba(0,0,0,.55); }
        .guest-modal-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-bottom:20px; }
        .guest-modal-head h2 { display:flex; align-items:center; gap:9px; margin:0 0 5px; font-size:21px; }
        .guest-modal-head h2 ha-icon { color:var(--ns-cyan); }
        .guest-modal-head p { margin:0; color:#83a49a; font-size:12px; }
        .guest-close { padding:7px; color:#b9d5cc; background:transparent; border:0; cursor:pointer; }
        .guest-status-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:18px; }
        .guest-status-card { padding:14px; border-radius:12px; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.08); }
        .guest-status-card span { display:block; color:#78998f; font-size:10px; text-transform:uppercase; letter-spacing:.6px; }
        .guest-status-card strong { display:block; margin-top:6px; font-size:15px; overflow-wrap:anywhere; }
        .guest-client-list { display:grid; gap:9px; }
        .guest-client { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:10px; padding:12px 14px; border-radius:11px; background:rgba(80,215,255,.045); border:1px solid rgba(80,215,255,.13); }
        .guest-client strong,.guest-client small { display:block; }
        .guest-client small { margin-top:4px; color:#78998f; }
        .guest-qr { display:grid; grid-template-columns:190px minmax(0,1fr); align-items:center; gap:20px; margin:18px 0; padding:18px; border-radius:14px; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.09); }
        .guest-qr img { display:block; width:190px; height:190px; padding:8px; box-sizing:border-box; border-radius:10px; background:#fff; }
        .guest-qr-copy h3 { margin:0 0 7px; color:#eafff6; font-size:16px; }
        .guest-qr-copy p { margin:0; color:#83a49a; font-size:12px; line-height:1.5; }
        .guest-qr-copy strong { color:var(--ns-cyan); }
        .guest-qr-unavailable { margin:18px 0; padding:14px; border-radius:12px; color:#83a49a; background:rgba(255,255,255,.025); border:1px dashed rgba(255,255,255,.12); font-size:12px; line-height:1.45; }
        .guest-actions { display:flex; justify-content:flex-end; margin-top:18px; }
        .guest-show { display:flex; align-items:center; gap:7px; padding:10px 13px; border-radius:10px; color:#07130f; background:var(--ns-cyan); border:0; font:inherit; font-size:12px; font-weight:800; cursor:pointer; }
        .dot { width:7px; height:7px; border-radius:50%; background:var(--state); box-shadow:0 0 11px var(--state); }
        .empty { text-align:center; padding:80px 20px; color:#66857c; }
        .empty ha-icon { --mdc-icon-size:54px; color:#34564b; margin-bottom:14px; }
        .empty strong { display:block; color:#a9c9be; font-size:18px; margin-bottom:7px; }
        .mesh-panel { position:relative; border-radius:18px; padding:24px; overflow:auto; min-height:430px; }
        .mesh-head { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; margin-bottom:28px; }
        .mesh-head h2 { margin:0 0 6px; font-size:20px; }
        .mesh-head p { margin:0; color:#8eaea4; font-size:14px; line-height:1.45; }
        .mesh-actions { display:flex; align-items:center; gap:12px; }
        .simulate-mesh { display:flex; align-items:center; gap:8px; padding:10px 13px; border-radius:10px; color:#dff7ed; background:rgba(182,140,255,.09); border:1px solid rgba(182,140,255,.3); font:inherit; font-size:12px; font-weight:750; cursor:pointer; white-space:nowrap; }
        .simulate-mesh:hover { background:rgba(182,140,255,.17); }
        .simulate-mesh:disabled { opacity:.45; cursor:default; }
        .simulate-mesh ha-icon { color:#b68cff; --mdc-icon-size:18px; }
        .simulation-status { display:none; align-items:center; gap:9px; margin:-12px 0 22px; padding:12px 15px; border-radius:11px; color:#e8ddff; background:rgba(182,140,255,.09); border:1px solid rgba(182,140,255,.25); font-size:13px; font-weight:650; }
        .simulation-status.visible { display:flex; }
        .simulation-status ha-icon { color:#b68cff; --mdc-icon-size:19px; }
        .mesh-legend { display:flex; gap:14px; color:#88a79e; font-size:11px; white-space:nowrap; }
        .legend-item { display:flex; align-items:center; gap:6px; }
        .mesh-canvas { min-width:760px; }
        .internet { width:max-content; margin:0 auto 34px; display:flex; align-items:center; gap:10px; padding:11px 18px; border-radius:999px; color:var(--ns-cyan); background:rgba(80,215,255,.08); border:1px solid rgba(80,215,255,.25); font-size:12px; font-weight:750; }
        .mesh-groups { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:46px 22px; align-items:start; }
        .mesh-group { position:relative; padding-top:26px; }
        .mesh-group::before { content:""; position:absolute; top:-35px; left:50%; height:62px; border-left:1px dashed rgba(80,215,255,.38); }
        .ap-node { position:relative; z-index:1; display:flex; align-items:center; gap:12px; width:max-content; max-width:100%; margin:0 auto 26px; padding:13px 16px; border-radius:14px; color:#ecfff6; background:linear-gradient(145deg,rgba(80,215,255,.16),rgba(85,242,162,.08)); border:1px solid rgba(80,215,255,.3); box-shadow:0 10px 28px rgba(0,0,0,.2); }
        .ap-node ha-icon { color:var(--ns-cyan); --mdc-icon-size:26px; }
        .ap-name { display:block; font-size:16px; font-weight:780; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .ap-count { display:block; margin-top:4px; color:#8eaea4; font-size:12px; }
        .clients { position:relative; display:grid; gap:11px; }
        .clients::before { content:""; position:absolute; top:-26px; bottom:50%; left:18px; border-left:1px solid rgba(85,242,162,.23); }
        .client { --client-state:var(--ns-green); position:relative; display:grid; grid-template-columns:8px 34px minmax(0,1fr); align-items:center; gap:11px; min-width:0; padding:14px 15px 14px 35px; border-radius:13px; background:rgba(2,10,8,.5); border:1px solid rgba(139,255,210,.16); box-shadow:0 8px 20px rgba(0,0,0,.12); }
        .client.off { --client-state:var(--ns-red); opacity:.67; }
        .client::before { content:""; position:absolute; left:18px; top:50%; width:12px; border-top:1px solid rgba(85,242,162,.28); }
        .client .dot { flex:0 0 auto; background:var(--client-state); box-shadow:0 0 9px var(--client-state); }
        .client ha-icon { color:var(--ns-cyan); --mdc-icon-size:25px; }
        .client-info { min-width:0; }
        .client-name { color:#f1fff9; font-size:15px; font-weight:750; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .client-ip { color:#8eaea4; font:550 12px ui-monospace,SFMono-Regular,Consolas,monospace; margin-top:4px; }
        .client-details { display:flex; flex-wrap:wrap; gap:6px; margin-top:9px; }
        .client-detail { padding:4px 7px; border-radius:7px; color:#b8d7cc; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.07); font-size:11px; font-weight:650; }
        .client-detail.signal { color:#8fffc2; }
        .mesh-group.handover-target .ap-node { animation:handover-target 1s ease-in-out infinite alternate; }
        .simulation-ghost { position:absolute; z-index:20; pointer-events:none; margin:0; opacity:.96; border-color:#b68cff; box-shadow:0 0 35px rgba(182,140,255,.38); }
        @keyframes handover-target { to { border-color:#b68cff; box-shadow:0 0 30px rgba(182,140,255,.35); transform:translateY(-3px); } }
        .watch-layout { display:grid; grid-template-columns:minmax(300px,.8fr) minmax(0,1.5fr); gap:18px; }
        .watch-layout.alerts-only { grid-template-columns:1fr; }
        .watch-overview-grid { display:flex; flex-direction:column; gap:18px; }
        .watch-overview-grid .presence-overview { order:1; margin-bottom:0; }
        .watch-overview-grid .watch-layout { order:2; min-width:0; }
        @media (min-width:1500px) {
          .watch-overview-grid { display:grid; grid-template-columns:minmax(420px,.78fr) minmax(680px,1.22fr); align-items:start; }
          .watch-overview-grid .watch-layout { order:1; }
          .watch-overview-grid .presence-overview { order:2; }
        }
        .settings-view { display:grid; gap:18px; }
        .settings-tabs { display:flex; gap:7px; margin:0 0 14px; padding:4px; overflow-x:auto; border-radius:12px; background:rgba(2,10,8,.3); border:1px solid var(--ns-line); scrollbar-width:thin; }
        .settings-tab { display:flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:8px 13px; flex:1 0 auto; border:1px solid transparent; border-radius:9px; color:#78998f; background:transparent; font:inherit; font-size:11px; font-weight:780; white-space:nowrap; cursor:pointer; transition:.18s ease; }
        .settings-tab:hover { color:#e6f7f0; background:rgba(255,255,255,.045); }
        .settings-tab.active { color:#fff7e9; background:rgba(240,161,59,.13); border-color:rgba(240,161,59,.32); box-shadow:inset 0 -2px #e5ad50; }
        .settings-tab ha-icon { --mdc-icon-size:17px; }
        .settings-tab.active ha-icon { color:#f0b75e; }
        .settings-tab-panel[hidden] { display:none !important; }
        .settings-tab-panel { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; gap:10px; }
        .settings-tab-panel.devices-panel { grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) minmax(280px,.7fr); gap:14px; }
        .settings-tab-panel.notifications-panel { grid-template-columns:minmax(280px,2fr) minmax(440px,3fr); gap:14px; }
        .settings-tab-panel.ai-maintenance-panel { grid-template-columns:1fr; }
        .settings-tab-panel.devices-panel .danger-zone { margin:0; align-self:stretch; }
        .settings-tab-panel.devices-panel .cleanup-settings .rule { grid-template-columns:1fr; align-content:start; }
        .settings-tab-panel.devices-panel .cleanup-settings .cleanup { width:100%; justify-content:center; justify-self:stretch; margin-top:8px; }
        .watch-panel { border-radius:18px; padding:22px; min-width:0; }
        .watch-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:15px; margin-bottom:18px; }
        .watch-heading h2 { margin:0 0 5px; font-size:18px; }
        .watch-heading p { margin:0; color:#6f9187; font-size:11px; }
        .learning { display:flex; align-items:center; gap:7px; padding:7px 10px; border-radius:999px; color:#ffd766; background:rgba(255,215,102,.08); border:1px solid rgba(255,215,102,.22); font-size:10px; font-weight:750; white-space:nowrap; }
        .learning-actions { display:flex; align-items:center; flex-wrap:wrap; justify-content:flex-end; gap:8px; }
        .restart-learning { display:flex; align-items:center; gap:6px; padding:7px 10px; border-radius:9px; color:#ffd766; background:rgba(255,215,102,.06); border:1px solid rgba(255,215,102,.25); font:inherit; font-size:10px; font-weight:750; cursor:pointer; white-space:nowrap; }
        .restart-learning ha-icon { --mdc-icon-size:15px; }
        .security-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:18px; }
        .security-card { padding:14px; border-radius:13px; background:rgba(2,10,8,.35); border:1px solid var(--ns-line); }
        .security-card span { display:block; color:#78998f; font-size:9px; text-transform:uppercase; letter-spacing:.9px; }
        .security-card strong { display:block; margin-top:6px; font-size:24px; color:var(--ns-cyan); }
        .presence-overview { margin-bottom:18px; }
        .presence-summary { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:11px; color:#cce5dc; background:rgba(143,255,194,.055); border:1px solid rgba(143,255,194,.14); font-size:11px; }
        .presence-summary ha-icon { color:#8fffc2; --mdc-icon-size:19px; }
        .presence-summary strong { color:#f4fff9; }
        .presence-sensor-link { display:flex; align-items:center; gap:8px; padding:8px 11px; border-radius:10px; color:#9eaaa6; background:rgba(255,255,255,.035); border:1px solid var(--ns-line); font:inherit; font-size:11px; font-weight:780; cursor:pointer; white-space:nowrap; }
        .presence-sensor-link.on { color:#bff8d8; background:rgba(143,255,194,.08); border-color:rgba(143,255,194,.25); }
        .presence-sensor-link.off { color:#c7c1b8; }
        .presence-sensor-link:hover { border-color:rgba(240,161,59,.42); box-shadow:0 0 0 3px rgba(240,161,59,.08); }
        .presence-sensor-link ha-icon { --mdc-icon-size:18px; }
        .presence-list { display:grid; gap:10px; margin-top:14px; }
        .presence-row { display:grid; grid-template-columns:minmax(150px,230px) minmax(240px,1fr); align-items:center; gap:16px; }
        .presence-person { display:grid; grid-template-columns:10px minmax(0,1fr); column-gap:9px; align-items:center; }
        .presence-dot { width:8px; height:8px; border-radius:50%; background:#74817d; }
        .presence-row.home .presence-dot { background:#8fffc2; box-shadow:0 0 10px rgba(143,255,194,.7); }
        .presence-name { overflow:hidden; color:#effff8; font-size:12px; font-weight:760; text-overflow:ellipsis; white-space:nowrap; }
        .watch-entity-link { padding:0; color:inherit; background:transparent; border:0; font:inherit; font-weight:inherit; text-align:left; cursor:pointer; }
        .watch-entity-link:hover { color:#bcecff; text-decoration:underline; text-underline-offset:3px; }
        .presence-state { grid-column:2; margin-top:2px; color:#78998f; font-size:9px; }
        .presence-row.home .presence-state { color:#8fd8b1; }
        .presence-timeline { position:relative; height:24px; overflow:hidden; border-radius:8px; background:rgba(2,10,8,.42); border:1px solid var(--ns-line); }
        .presence-timeline::before { content:""; position:absolute; inset:0; background:repeating-linear-gradient(90deg,transparent 0,transparent calc(25% - 1px),rgba(255,255,255,.055) 25%); }
        .presence-segment { position:absolute; top:4px; bottom:4px; min-width:2px; border-radius:5px; background:linear-gradient(90deg,rgba(86,199,139,.55),#8fffc2); box-shadow:0 0 8px rgba(143,255,194,.2); }
        .presence-axis { display:flex; justify-content:space-between; margin:6px 1px 0; color:#61746e; font-size:8px; }
        .alerts-panel { display:flex; flex-direction:column; max-height:calc(100dvh - 64px); }
        .alerts-panel .alert-list { min-height:0; overflow-y:auto; overscroll-behavior:contain; padding-right:5px; scrollbar-width:thin; scrollbar-color:rgba(240,161,59,.42) transparent; }
        .alerts-panel .alert-list::-webkit-scrollbar { width:7px; }
        .alerts-panel .alert-list::-webkit-scrollbar-track { background:transparent; }
        .alerts-panel .alert-list::-webkit-scrollbar-thumb { border-radius:999px; background:rgba(240,161,59,.32); }
        .alert-list { display:grid; gap:9px; }
        .alert-item { --alert-color:#ffd766; display:grid; grid-template-columns:38px 1fr auto; align-items:center; gap:12px; padding:13px; border-radius:13px; background:color-mix(in srgb,var(--alert-color) 5%,rgba(2,10,8,.4)); border:1px solid color-mix(in srgb,var(--alert-color) 22%,transparent); }
        .alert-item.critical { --alert-color:var(--ns-red); }
        .alert-item.resolved { --alert-color:#66857c; opacity:.62; }
        .alert-symbol { width:36px; height:36px; display:grid; place-items:center; border-radius:10px; color:var(--alert-color); background:color-mix(in srgb,var(--alert-color) 11%,transparent); }
        .alert-symbol ha-icon { --mdc-icon-size:20px; }
        .alert-name { color:#effff8; font-size:12px; font-weight:760; }
        .alert-message { color:#9dbbb1; font-size:11px; margin-top:3px; line-height:1.35; }
        .alert-time { color:#58776e; font-size:9px; margin-top:4px; }
        .ack { border:1px solid rgba(85,242,162,.25); color:var(--ns-green); background:rgba(85,242,162,.07); border-radius:9px; padding:8px 10px; font:inherit; font-size:10px; font-weight:750; cursor:pointer; }
        .rule-list { display:grid; gap:10px; }
        .watch-settings-panel .rule-list {
          grid-template-columns:repeat(3,minmax(0,1fr)); align-items:start;
        }
        .settings-view .watch-panel { padding:17px; }
        .settings-view .watch-heading { margin-bottom:13px; }
        .settings-view .watch-settings-panel .rule-list { display:block; }
        .settings-view .watch-settings-panel .rule-group {
          width:100%; margin:0; padding:5px 10px; box-sizing:border-box;
        }
        .settings-view .rule { gap:12px; padding:9px 3px; }
        .settings-view .rule label { font-size:13px; }
        .settings-view .rule small { margin-top:3px; font-size:10px; line-height:1.3; }
        .settings-view .rule input { min-height:36px; padding:7px 10px; font-size:13px; }
        .settings-view .rule input[type="checkbox"] { width:22px; height:22px; min-height:22px; }
        .settings-view .danger-zone { margin-top:14px; padding:12px 14px; }
        .settings-view .cleanup-settings { margin:0 0 10px; padding:5px 10px; }
        .settings-view .cleanup-settings .cleanup { min-height:36px; padding:7px 11px; justify-self:end; font-size:12px; }
        .settings-view .cleanup-settings .cleanup-result { margin:7px 3px 4px; }
        .rule-group { padding:7px 12px; border:1px solid var(--ns-line); border-radius:13px; }
        .rule-group h3 { margin:3px 0 4px; color:#c7b99f; font-size:10px; text-transform:uppercase; letter-spacing:1.1px; }
        .rule-group h3 { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .settings-help-button { display:grid; place-items:center; flex:0 0 auto; width:24px; height:24px; padding:0; border-radius:50%; color:#d8c9b2; background:rgba(255,255,255,.045); border:1px solid rgba(255,246,229,.14); font:800 12px/1 Inter,Roboto,sans-serif; cursor:pointer; }
        .settings-help-button:hover { color:#fff7e9; background:rgba(240,161,59,.15); border-color:rgba(240,161,59,.42); }
        .settings-help-backdrop { position:fixed; z-index:90; inset:0; display:grid; place-items:center; padding:20px; background:rgba(7,6,5,.72); backdrop-filter:blur(7px); }
        .settings-help-backdrop[hidden] { display:none; }
        .settings-help-dialog { width:min(620px,calc(100vw - 32px)); max-height:min(720px,calc(100dvh - 40px)); overflow:auto; padding:24px; border-radius:18px; color:#eee7dd; background:#393531; border:1px solid rgba(240,161,59,.28); box-shadow:0 26px 80px rgba(0,0,0,.58); }
        .settings-help-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:16px; }
        .settings-help-head h2 { margin:0; color:#fff8ed; font-size:20px; }
        .settings-help-close { display:grid; place-items:center; width:34px; height:34px; padding:0; border-radius:10px; color:#d8d0c6; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.11); cursor:pointer; }
        .settings-help-close ha-icon { --mdc-icon-size:20px; }
        .settings-help-copy { display:grid; gap:12px; }
        .settings-help-copy p { margin:0; color:#c9c1b7; font-size:13px; line-height:1.6; }
        .settings-help-copy strong { color:#f4dfbd; }
        .rule-group.basics { background:rgba(240,161,59,.045); border-color:rgba(240,161,59,.15); }
        .rule-group.presence-settings { background:rgba(143,255,194,.04); border-color:rgba(143,255,194,.14); }
        .rule-group.device-settings { background:rgba(80,215,255,.035); border-color:rgba(80,215,255,.13); }
        .rule-group.onboarding-settings { background:rgba(240,185,79,.055); border-color:rgba(240,185,79,.18); }
        .rule-group.onboarding-settings .rule { grid-template-columns:minmax(0,1fr) 190px; }
        .rule-group.onboarding-settings input[type="text"] {
          width:190px; box-sizing:border-box; font-variant-numeric:tabular-nums;
        }
        .rule-group.detection-settings { background:rgba(182,140,255,.04); border-color:rgba(182,140,255,.14); }
        .rule-group.alert-rule-settings { background:rgba(255,215,102,.035); border-color:rgba(255,215,102,.14); }
        .rule-group.notification-settings { background:rgba(80,215,255,.035); border-color:rgba(80,215,255,.13); }
        .rule-group.notification-target-settings { background:rgba(143,255,194,.025); border-color:rgba(143,255,194,.12); }
        .notification-target-description { margin:4px 3px 8px; color:var(--ns-muted); font-size:10px; line-height:1.4; }
        .notify-target-section { display:grid; gap:8px; padding:10px 3px 4px; border-top:1px solid var(--ns-line); }
        .notify-target-heading { display:flex; align-items:end; justify-content:space-between; gap:10px; }
        .notify-target-heading > label { display:grid; gap:3px; color:var(--ns-text); font-size:13px; font-weight:750; }
        .notify-target-heading small { color:var(--ns-muted); font-size:10px; font-weight:500; }
        .notify-target-count { flex:0 0 auto; color:#f4dfbd; font-size:10px; font-weight:750; }
        .notify-target-toolbar { display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:6px; position:sticky; top:0; z-index:2; padding:2px 0 5px; background:var(--ns-panel); }
        .notify-target-search { min-width:0; height:34px; box-sizing:border-box; padding:7px 10px 7px 32px !important; text-align:left !important; background:rgba(255,255,255,.035) !important; }
        .notify-search-wrap { position:relative; min-width:0; }
        .notify-search-wrap ha-icon { position:absolute; z-index:1; left:9px; top:8px; color:var(--ns-muted); --mdc-icon-size:17px; pointer-events:none; }
        .notify-target-action { padding:0 9px; border:1px solid var(--ns-line); border-radius:9px; color:var(--ns-muted); background:rgba(255,255,255,.035); font:inherit; font-size:9px; font-weight:750; cursor:pointer; }
        .notify-target-action:hover { color:#fff7e9; border-color:rgba(240,161,59,.38); background:rgba(240,161,59,.12); }
        .notify-target-list { display:grid; gap:5px; max-height:210px; overflow:auto; padding-right:3px; scrollbar-gutter:stable; }
        .notify-target { display:grid; grid-template-columns:28px minmax(0,1fr) 24px; align-items:center; gap:9px; min-height:42px; padding:7px 9px; border:1px solid var(--ns-line); border-radius:10px; background:rgba(255,255,255,.018); cursor:pointer; transition:.18s ease; }
        .notify-target[hidden] { display:none; }
        .notify-target:hover { border-color:rgba(240,161,59,.28); background:rgba(240,161,59,.07); }
        .notify-target:has(input:checked) { border-color:rgba(240,161,59,.46); background:rgba(240,161,59,.11); box-shadow:inset 3px 0 #e5ad50; }
        .notify-target input { position:absolute; width:1px; height:1px; min-height:0; opacity:0; pointer-events:none; }
        .notify-target-icon { display:grid; place-items:center; width:28px; height:28px; border-radius:8px; color:var(--ns-cyan); background:rgba(80,215,255,.09); }
        .notify-target-icon.telegram { color:#69c9f2; background:rgba(45,169,225,.12); }
        .notify-target-icon ha-icon { --mdc-icon-size:17px; }
        .notify-target-copy { display:grid; gap:2px; min-width:0; }
        .notify-target strong { overflow:hidden; color:var(--ns-text); font-size:11px; text-overflow:ellipsis; white-space:nowrap; }
        .notify-target small, .notify-target-empty { color:var(--ns-muted); font-size:9px; overflow-wrap:anywhere; }
        .notify-target-check { display:grid; place-items:center; width:21px; height:21px; border:1px solid var(--ns-line); border-radius:7px; color:transparent; }
        .notify-target-check ha-icon { --mdc-icon-size:15px; }
        .notify-target input:checked ~ .notify-target-check { color:#2b2115; border-color:#e5ad50; background:#e5ad50; }
        .notify-target-empty { padding:10px; border:1px dashed var(--ns-line); border-radius:10px; }
        .notify-event-hint { display:flex; align-items:flex-start; gap:8px; margin-top:4px; padding:9px 10px; border-radius:10px; color:var(--ns-muted); background:rgba(80,215,255,.055); font-size:10px; line-height:1.4; }
        .notify-event-hint ha-icon { flex:0 0 auto; --mdc-icon-size:17px; color:var(--ns-cyan); }
        .notify-event-hint code, .notify-target-empty code { color:var(--ns-text); }
        .rule-group.ai-config-settings { background:rgba(182,140,255,.045); border-color:rgba(182,140,255,.17); }
        .rule-group.ai-config-settings .rule { grid-template-columns:minmax(0,1fr) 190px; }
        .rule-group.ai-config-settings .settings-select summary { white-space:nowrap; }
        .rule-group.ai-config-settings .settings-select .custom-filter-menu { left:auto; right:0; width:max-content; min-width:220px; }
        .rule-group.ai-config-settings .settings-select .custom-filter-option span { white-space:nowrap; }
        .rule { display:grid; grid-template-columns:minmax(0,1fr) 130px; align-items:center; gap:20px; padding:14px 4px; border-bottom:1px solid var(--ns-line); }
        .rule:last-child { border-bottom:0; }
        .rule label { color:#e4faf2; font-size:14px; font-weight:680; line-height:1.35; }
        .rule small { display:block; color:#78998f; font-size:12px; font-weight:450; line-height:1.4; margin-top:5px; }
        .rule input { min-height:44px; padding:10px 12px; text-align:right; font-size:15px; }
        .rule input[type="checkbox"] { width:25px; height:25px; min-height:25px; justify-self:end; accent-color:var(--ns-green); }
        .ai-settings .rule-list { grid-template-columns:repeat(3,minmax(0,1fr)); align-items:stretch; }
        .ai-settings .rule { grid-template-columns:1fr; align-content:start; border:1px solid var(--ns-line); border-radius:13px; padding:12px; }
        .ai-settings .rule input, .ai-settings .rule select { width:100%; justify-self:stretch; }
        .ai-settings .rule input[type="checkbox"] { width:22px; justify-self:end; }
        .ai-settings .rule select {
          min-width:0; box-sizing:border-box;
        }
        .rule-actions { display:flex; gap:9px; margin-top:22px; }
        .save-rules { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; border:0; border-radius:11px; padding:14px; color:#092018; background:var(--ns-green); font:inherit; font-size:14px; font-weight:800; cursor:pointer; transition:background .18s ease,color .18s ease,opacity .18s ease; }
        .watch-heading .save-rules { flex:0 0 auto; min-width:170px; padding:11px 16px; white-space:nowrap; }
        .save-rules ha-icon { --mdc-icon-size:18px; }
        .save-rules.busy ha-icon { animation:spin .8s linear infinite; }
        .save-rules.saved { color:#10271d; background:#76d89d; }
        .save-rules.failed { color:#fff3f1; background:#a94242; }
        .save-rules:disabled { cursor:wait; }
        .danger-zone { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:18px; margin-top:24px; padding:16px; border-radius:13px; background:rgba(255,107,120,.045); border:1px solid rgba(255,107,120,.18); }
        .danger-zone strong { display:block; color:#ffd5d9; font-size:13px; }
        .danger-zone p { margin:4px 0 0; color:#9d817e; font-size:11px; line-height:1.4; }
        .danger-zone .cleanup { flex:0 0 auto; }
        .danger-zone .cleanup-result { flex-basis:100%; margin:0; }
        .ai-panel { margin-top:18px; border-radius:18px; padding:22px; background:var(--ns-panel); border:1px solid rgba(182,140,255,.22); box-shadow:0 18px 50px rgba(0,0,0,.18); }
        .ai-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-bottom:18px; }
        .ai-head h2 { display:flex; align-items:center; gap:9px; margin:0 0 5px; font-size:19px; }
        .ai-head h2 ha-icon { color:#b68cff; --mdc-icon-size:23px; }
        .ai-head p { margin:0; color:#78998f; font-size:11px; }
        .ai-run { display:flex; align-items:center; gap:8px; padding:10px 13px; border-radius:10px; color:#f1eaff; background:rgba(182,140,255,.1); border:1px solid rgba(182,140,255,.3); font:inherit; font-size:12px; font-weight:800; cursor:pointer; white-space:nowrap; }
        .ai-run ha-icon { --mdc-icon-size:18px; }
        .ai-run.busy ha-icon { animation:spin .8s linear infinite; }
        .ai-run:disabled { opacity:.6; cursor:wait; }
        .ai-actions { display:flex; align-items:center; flex-wrap:wrap; justify-content:flex-end; gap:8px; }
        .ai-prompt-toggle { display:flex; align-items:center; gap:7px; padding:10px 12px; border-radius:10px; color:#cce5dc; background:rgba(255,255,255,.04); border:1px solid var(--ns-line); font:inherit; font-size:11px; font-weight:750; cursor:pointer; white-space:nowrap; }
        .ai-prompt-toggle ha-icon { --mdc-icon-size:17px; }
        .ai-prompt-toggle:disabled { opacity:.45; cursor:not-allowed; }
        .ai-prompt { margin:0 0 16px; padding:14px; max-height:360px; overflow:auto; border-radius:12px; color:#b9d8cd; background:rgba(2,10,8,.48); border:1px solid rgba(182,140,255,.22); font:500 11px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace; white-space:pre-wrap; overflow-wrap:anywhere; }
        .ai-prompt[hidden] { display:none; }
        .ai-error { margin-bottom:14px; padding:11px 13px; border-radius:10px; color:#ffd5d9; background:rgba(255,107,120,.08); border:1px solid rgba(255,107,120,.23); font-size:12px; }
        .ai-report { display:grid; grid-template-columns:150px minmax(0,1fr); gap:18px; }
        .ai-score { --score-color:var(--ns-green); display:grid; place-items:center; align-content:center; min-height:150px; padding:16px; border-radius:16px; color:var(--score-color); background:color-mix(in srgb,var(--score-color) 8%,rgba(2,10,8,.38)); border:1px solid color-mix(in srgb,var(--score-color) 25%,transparent); }
        .ai-score.warn { --score-color:#ffd766; } .ai-score.bad { --score-color:var(--ns-red); }
        .ai-score strong { font-size:48px; line-height:1; }
        .ai-score span { margin-top:7px; color:#9dbbb1; font-size:11px; font-weight:750; }
        .ai-score small { margin-top:7px; font-size:10px; }
        .ai-copy { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
        .ai-copy article { padding:13px; border-radius:12px; background:rgba(2,10,8,.3); border:1px solid var(--ns-line); }
        .ai-copy article.summary { grid-column:1/-1; }
        .ai-copy h3 { margin:0 0 7px; color:#b68cff; font-size:10px; text-transform:uppercase; letter-spacing:.8px; }
        .ai-copy p { margin:0; color:#cce5dc; font-size:12px; line-height:1.5; white-space:pre-line; }
        .ai-history { display:flex; align-items:flex-end; gap:5px; height:74px; margin-top:15px; padding:9px 10px 0; border-top:1px solid var(--ns-line); }
        .ai-history-bar { flex:1; min-width:8px; max-width:34px; height:calc(var(--score) * 10%); border-radius:5px 5px 2px 2px; background:linear-gradient(to top,rgba(182,140,255,.35),#b68cff); cursor:help; }
        .ai-empty { padding:35px 20px; text-align:center; color:#78998f; font-size:12px; }
        .ai-view { display:grid; grid-template-columns:minmax(0,1fr); gap:18px; align-items:start; }
        .ai-view .ai-panel { order:1; margin-top:0; }
        .ai-settings { order:2; border-color:rgba(182,140,255,.18); }
        @media (min-width:1700px) {
          .ai-panel { padding:30px; }
          .ai-head { margin-bottom:24px; }
          .ai-head h2 { font-size:25px; }
          .ai-head h2 ha-icon { --mdc-icon-size:29px; }
          .ai-head p { font-size:14px; }
          .ai-run, .ai-prompt-toggle { padding:13px 17px; font-size:14px; }
          .ai-run ha-icon, .ai-prompt-toggle ha-icon { --mdc-icon-size:20px; }
          .ai-report { grid-template-columns:190px minmax(0,1fr); gap:22px; }
          .ai-score { min-height:190px; padding:20px; }
          .ai-score strong { font-size:62px; }
          .ai-score span { font-size:14px; }
          .ai-score small { font-size:12px; }
          .ai-copy { gap:14px; }
          .ai-copy article { padding:18px; }
          .ai-copy h3 { font-size:12px; }
          .ai-copy p { font-size:15px; line-height:1.55; }
          .ai-history { height:100px; margin-top:20px; padding-top:13px; }
          .ai-history-bar { max-width:44px; }
          .ai-empty { padding:50px 24px; font-size:15px; }
        }

        /* Warm smoked-glass theme, inspired by the supplied dashboard reference. */
        header {
          margin-bottom:24px; padding:4px 2px 0;
          border-bottom:1px solid rgba(255,255,255,.035);
          padding-bottom:20px;
        }
        .logo {
          width:52px; height:52px; border-radius:16px;
          color:#2b2115;
          background:linear-gradient(145deg,#f7c36f,#c77722);
          border-color:rgba(255,229,180,.4);
          box-shadow:0 14px 30px rgba(221,139,42,.20), inset 0 1px rgba(255,255,255,.42);
        }
        .logo ha-icon { color:#342516; --mdc-icon-size:27px; }
        .version-info, .metric-note, .entity, .entity-id-link, .status-time,
        .log-date, .alert-time { color:#aaa49a; }
        .scan {
          color:#fff8ed; background:rgba(255,255,255,.055);
          border-color:rgba(255,241,215,.15); border-radius:999px; padding:11px 17px;
          box-shadow:inset 0 1px rgba(255,255,255,.04);
        }
        .scan:hover { background:rgba(240,161,59,.16); border-color:rgba(240,161,59,.38); }
        .metrics {
          gap:10px; padding:10px; border-radius:17px;
          background:rgba(91,87,81,.36); border:1px solid rgba(255,246,229,.075);
          box-shadow:inset 0 1px rgba(255,255,255,.025);
          backdrop-filter:none;
        }
        .metric {
          min-height:94px; padding:16px 18px; border-radius:13px;
          background:linear-gradient(135deg,#504d48,#3e3b38);
          box-shadow:none; backdrop-filter:none;
        }
        .metric::after { display:none; }
        .metric-label, .security-card span { color:#c1bbb1; font-size:10px; letter-spacing:.8px; }
        .metric-value, .device-count strong { color:#fffaf1; font-weight:650; }
        .device-count.online strong, .metric.network .metric-value,
        .metric.connections .metric-value { color:var(--ns-cyan); }
        .metric:is(button):hover {
          background:linear-gradient(135deg,rgba(124,116,105,.68),rgba(71,67,61,.64));
          border-color:rgba(240,161,59,.32);
        }
        .connection-panel {
          background:rgba(67,63,59,.48); border-color:var(--ns-line);
          backdrop-filter:none; box-shadow:none;
        }
        .tabs {
          background:rgba(67,63,59,.48); border-color:var(--ns-line);
          backdrop-filter:blur(22px); box-shadow:0 18px 45px rgba(10,8,5,.17);
        }
        .tabs { width:100%; padding:6px; border-radius:15px; }
        .tab { flex:1; justify-content:center; color:#bdb7ad; border-radius:11px; font-size:13px; }
        .tab.active, .filter.active {
          color:#fff9ee; background:linear-gradient(135deg,rgba(239,166,67,.86),rgba(194,105,29,.92));
          box-shadow:0 8px 22px rgba(224,139,40,.18), inset 0 1px rgba(255,255,255,.25);
        }
        .toolbar { padding:10px; border-radius:16px; }
        input, select {
          color:#fffaf1; background:rgba(33,31,29,.38);
          border-color:rgba(255,246,229,.1); border-radius:10px;
        }
        select {
          color-scheme:dark;
          cursor:pointer;
          background-color:#35322f;
          border-color:rgba(240,161,59,.20);
          box-shadow:inset 0 1px rgba(255,255,255,.035);
        }
        select:hover { border-color:rgba(240,161,59,.40); background-color:#3b3733; }
        select option, select optgroup {
          color:#f8f2e8;
          background:#35322f;
          font-family:"Manrope","Avenir Next","Segoe UI Variable","Segoe UI",sans-serif;
        }
        select option:checked {
          color:#fffaf1;
          background:#9a5d24;
        }
        input:focus, select:focus { border-color:rgba(240,161,59,.58); box-shadow:0 0 0 3px rgba(240,161,59,.10); }
        .search ha-icon { color:#b0a99e; }
        .filter { color:#bdb7ad; }
        .table-panel, .log-panel, .dns-panel, .mesh-panel, .watch-panel, .ai-panel {
          border-radius:16px; background:linear-gradient(145deg,rgba(76,72,67,.56),rgba(46,44,41,.60));
          border-color:rgba(255,246,229,.10);
          box-shadow:0 24px 58px rgba(8,6,4,.26), inset 0 1px rgba(255,255,255,.035);
          backdrop-filter:blur(22px);
        }
        th { color:#bcb5aa; background:rgba(48,45,42,.96); border-bottom-color:rgba(240,161,59,.18); }
        .column-filters th { background:rgba(43,40,37,.97); }
        td { color:#e8e1d7; border-bottom-color:rgba(255,246,229,.075); }
        tbody tr:nth-child(even) { background:rgba(255,255,255,.02); }
        tbody tr:hover { background:rgba(240,161,59,.075); }
        .entity-link, .detail-stack strong, .connection-name, .log-device,
        .alert-name, .rule label, .client-name { color:#fffaf1; }
        .device-icon, .log-icon {
          color:var(--ns-cyan); background:rgba(240,161,59,.10);
          border-color:rgba(240,161,59,.18);
        }
        .column-picker-button {
          color:#f4dfbd; background:rgba(240,161,59,.08); border-color:rgba(240,161,59,.25);
        }
        .column-picker, .adguard-modal {
          background:#393531; border-color:rgba(240,161,59,.28);
        }
        .column-picker { box-shadow:0 24px 60px rgba(10,8,5,.45); }
        .adguard-modal { box-shadow:0 16px 48px rgba(10,8,5,.48); }
        .security-card, .ai-copy article, .client, .connection-card {
          background:rgba(35,32,29,.30); border-color:rgba(255,246,229,.09);
        }
        .save-rules, .approve-internet {
          color:#2c2115; background:linear-gradient(135deg,#f6bd61,#d88328);
          box-shadow:0 8px 22px rgba(224,139,40,.20);
        }
        .internet {
          color:#f6d8a6; background:rgba(240,161,59,.09); border-color:rgba(240,161,59,.25);
        }
        .ap-node {
          background:linear-gradient(145deg,rgba(240,161,59,.18),rgba(255,255,255,.045));
          border-color:rgba(240,161,59,.28);
        }
        ::selection { color:#2b2115; background:#f0a13b; }

        /* Light theme follows Home Assistant's active light/dark setting. */
        :host([data-theme="light"]) {
          --ns-bg:#f6f3ee;
          --ns-panel:rgba(255,255,255,.78);
          --ns-line:rgba(91,72,48,.14);
          --ns-green:#a85b17;
          --ns-cyan:#8d5a1f;
          --ns-red:#c43f3f;
          color-scheme:light;
          color:#29241f;
          background:
            radial-gradient(ellipse at 54% 42%,rgba(229,164,80,.18),transparent 31rem),
            radial-gradient(ellipse at 16% 76%,rgba(184,136,78,.10),transparent 28rem),
            linear-gradient(135deg,rgba(255,255,255,.8),transparent 48%),
            var(--ns-bg);
        }
        :host([data-theme="light"]) .shell::before {
          opacity:.18;
          background-image:radial-gradient(rgba(92,69,43,.20) .45px,transparent .45px);
          mix-blend-mode:multiply;
        }
        :host([data-theme="light"]) header { border-bottom-color:rgba(91,72,48,.10); }
        :host([data-theme="light"]) h1,
        :host([data-theme="light"]) .metric-value,
        :host([data-theme="light"]) .device-count strong,
        :host([data-theme="light"]) .entity-link,
        :host([data-theme="light"]) .detail-stack strong,
        :host([data-theme="light"]) .connection-name,
        :host([data-theme="light"]) .log-device,
        :host([data-theme="light"]) .log-device-filter,
        :host([data-theme="light"]) .dns-host-link,
        :host([data-theme="light"]) .alert-name,
        :host([data-theme="light"]) .rule label,
        :host([data-theme="light"]) .client-name { color:#29241f; }
        :host([data-theme="light"]) .version-info,
        :host([data-theme="light"]) .metric-note,
        :host([data-theme="light"]) .entity,
        :host([data-theme="light"]) .entity-id-link,
        :host([data-theme="light"]) .status-time,
        :host([data-theme="light"]) .log-date,
        :host([data-theme="light"]) .alert-time,
        :host([data-theme="light"]) .ai-empty { color:#756d63; }
        :host([data-theme="light"]) .metric-label,
        :host([data-theme="light"]) .security-card span { color:#6e665c; }
        :host([data-theme="light"]) .scan {
          color:#5c3918; background:rgba(255,255,255,.76);
          border-color:rgba(139,83,26,.22); box-shadow:0 7px 18px rgba(91,61,29,.08);
        }
        :host([data-theme="light"]) .scan:hover { color:#3e240f; background:#fff6e8; }
        :host([data-theme="light"]) .metrics {
          background:rgba(229,221,210,.62); border-color:rgba(91,72,48,.12);
          box-shadow:inset 0 1px rgba(255,255,255,.72);
        }
        :host([data-theme="light"]) .metric {
          background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(242,237,229,.94));
          border-color:rgba(91,72,48,.12); box-shadow:0 8px 20px rgba(82,61,36,.07);
        }
        :host([data-theme="light"]) .metric:is(button):hover {
          background:linear-gradient(135deg,#fffaf2,#eee5d9); border-color:rgba(168,91,23,.30);
        }
        :host([data-theme="light"]) .connection-panel,
        :host([data-theme="light"]) .tabs,
        :host([data-theme="light"]) .toolbar {
          background:rgba(255,255,255,.76); border-color:rgba(91,72,48,.14);
          box-shadow:0 14px 36px rgba(82,61,36,.07);
        }
        :host([data-theme="light"]) .tab,
        :host([data-theme="light"]) .filter { color:#665f56; }
        :host([data-theme="light"]) .tab.active,
        :host([data-theme="light"]) .filter.active { color:#fffaf2; }
        :host([data-theme="light"]) input,
        :host([data-theme="light"]) select {
          color:#302a24; background:#fffdf9; border-color:rgba(91,72,48,.17); color-scheme:light;
        }
        :host([data-theme="light"]) select:hover { background-color:#fff8ec; }
        :host([data-theme="light"]) select option,
        :host([data-theme="light"]) select optgroup { color:#302a24; background:#fffdf9; }
        :host([data-theme="light"]) select option:checked { color:#fff; background:#a85b17; }
        :host([data-theme="light"]) .search ha-icon { color:#766d62; }
        :host([data-theme="light"]) .table-panel,
        :host([data-theme="light"]) .log-panel,
        :host([data-theme="light"]) .dns-panel,
        :host([data-theme="light"]) .mesh-panel,
        :host([data-theme="light"]) .watch-panel,
        :host([data-theme="light"]) .ai-panel {
          background:linear-gradient(145deg,rgba(255,255,255,.90),rgba(242,237,230,.86));
          border-color:rgba(91,72,48,.14);
          box-shadow:0 20px 48px rgba(82,61,36,.10),inset 0 1px rgba(255,255,255,.82);
        }
        :host([data-theme="light"]) th { color:#665e54; background:rgba(235,229,220,.98); }
        :host([data-theme="light"]) .column-filters th { background:rgba(245,241,235,.98); }
        :host([data-theme="light"]) td { color:#3d3731; border-bottom-color:rgba(91,72,48,.10); }
        :host([data-theme="light"]) tbody tr:nth-child(even) { background:rgba(104,82,55,.025); }
        :host([data-theme="light"]) tbody tr:hover { background:rgba(208,127,35,.08); }
        :host([data-theme="light"]) .column-picker,
        :host([data-theme="light"]) .custom-filter-menu,
        :host([data-theme="light"]) .adguard-modal,
        :host([data-theme="light"]) .dns-policy-modal,
        :host([data-theme="light"]) .guest-modal,
        :host([data-theme="light"]) .settings-help-dialog {
          color:#302a24; background:#fffaf3; border-color:rgba(168,91,23,.24);
          box-shadow:0 24px 60px rgba(82,61,36,.20);
        }
        :host([data-theme="light"]) .dns-policy-modal-backdrop,
        :host([data-theme="light"]) .guest-modal-backdrop,
        :host([data-theme="light"]) .adguard-modal-backdrop,
        :host([data-theme="light"]) .settings-help-backdrop { background:rgba(72,60,47,.38); }
        :host([data-theme="light"]) .security-card,
        :host([data-theme="light"]) .ai-copy article,
        :host([data-theme="light"]) .client,
        :host([data-theme="light"]) .connection-card,
        :host([data-theme="light"]) .adguard-box,
        :host([data-theme="light"]) .guest-status-card {
          background:rgba(255,255,255,.64); border-color:rgba(91,72,48,.13);
        }
        :host([data-theme="light"]) .guest-qr { background:rgba(255,255,255,.64); border-color:rgba(91,72,48,.13); }
        :host([data-theme="light"]) .guest-qr-copy h3 { color:#302a24; }
        :host([data-theme="light"]) .guest-qr-copy p,
        :host([data-theme="light"]) .guest-qr-unavailable { color:#665e54; }
        :host([data-theme="light"]) .client-detail,
        :host([data-theme="light"]) .log-route span,
        :host([data-theme="light"]) .dns-chip,
        :host([data-theme="light"]) .internet-label { color:#625a51; background:rgba(91,72,48,.06); border-color:rgba(91,72,48,.11); }
        :host([data-theme="light"]) .dns-chart,
        :host([data-theme="light"]) .adguard-config,
        :host([data-theme="light"]) .ai-prompt,
        :host([data-theme="light"]) .presence-timeline { background:rgba(109,85,54,.055); }
        :host([data-theme="light"]) .ai-copy p,
        :host([data-theme="light"]) .presence-summary,
        :host([data-theme="light"]) .dns-action { color:#514a43; }
        :host([data-theme="light"]) .settings-help-button,
        :host([data-theme="light"]) .settings-help-close,
        :host([data-theme="light"]) .adguard-modal-close { color:#625a51; background:rgba(91,72,48,.06); }
        :host([data-theme="light"]) .device-list tbody tr,
        :host([data-theme="light"]) .log-table tbody tr,
        :host([data-theme="light"]) .dns-table tbody tr { --light-card-bg:rgba(255,253,249,.96); }
        :host([data-theme="light"]) .function-count strong { color:#81501d; }
        :host([data-theme="light"]) .function-count.presence strong,
        :host([data-theme="light"]) .function-count.presence ha-icon { color:#2f7f50; }
        :host([data-theme="light"]) .function-count span,
        :host([data-theme="light"]) .device-count span { color:#72695f; }
        :host([data-theme="light"]) .metric.ai-metric .metric-value { color:#6f4bc1; }
        :host([data-theme="light"]) .connection-time,
        :host([data-theme="light"]) .connection-checked,
        :host([data-theme="light"]) .connection-device-info { color:#746b61; }
        :host([data-theme="light"]) .column-filter::placeholder { color:#7b746c; }
        :host([data-theme="light"]) .column-filter,
        :host([data-theme="light"]) .custom-filter-summary {
          color:#403a34; background:#fffdfa; border-color:rgba(91,72,48,.18);
        }
        :host([data-theme="light"]) .custom-filter-option { color:#514a43; }
        :host([data-theme="light"]) .custom-filter-option:hover { color:#30271f; background:rgba(168,91,23,.09); }
        :host([data-theme="light"]) .custom-filter-option.active { color:#6b390e; background:rgba(168,91,23,.14); }
        :host([data-theme="light"]) .custom-filter-count { color:#645b52; background:rgba(91,72,48,.07); }
        :host([data-theme="light"]) .onboarding-state.assigned { color:#25643f; background:#e2f2e7; border-color:#b9dcc5; }
        :host([data-theme="light"]) .onboarding-state.unknown { color:#645e57; background:#eeece8; }
        :host([data-theme="light"]) .detail-stack small,
        :host([data-theme="light"]) .log-ip,
        :host([data-theme="light"]) .log-time,
        :host([data-theme="light"]) .log-date,
        :host([data-theme="light"]) .dns-answer,
        :host([data-theme="light"]) .dns-chart-legend,
        :host([data-theme="light"]) .dns-chart-label { color:#70685f; }
        :host([data-theme="light"]) .rating.good,
        :host([data-theme="light"]) .rating.okay { --rating-color:#6d675f; }
        :host([data-theme="light"]) .log-entry { background:color-mix(in srgb,var(--log-color) 4%,#fffdf9); }
        :host([data-theme="light"]) .log-entry:hover { background:color-mix(in srgb,var(--log-color) 10%,#fffaf4); }
        :host([data-theme="light"]) .log-entry.discovered { --log-color:#28748d; }
        :host([data-theme="light"]) .log-entry.renamed { --log-color:#9b6a11; }
        :host([data-theme="light"]) .log-entry.mesh_changed { --log-color:#7650ce; }
        :host([data-theme="light"]) .log-message { color:#5c554e; }
        :host([data-theme="light"]) .log-device-filter ha-icon { color:#397e98; opacity:1; }
        :host([data-theme="light"]) .log-route { color:#655e56; }
        :host([data-theme="light"]) .dns-action,
        :host([data-theme="light"]) .ai-prompt-toggle,
        :host([data-theme="light"]) .simulate-mesh {
          color:#51483e; background:#fffaf2; border-color:rgba(91,72,48,.16);
        }
        :host([data-theme="light"]) .dns-client-filter { color:#286b84; background:#edf8fb; border-color:#c5e3eb; }
        :host([data-theme="light"]) .dns-row { --dns-color:#686159; background:color-mix(in srgb,var(--dns-color) 3%,#fffdf9); }
        :host([data-theme="light"]) .dns-row:hover { background:color-mix(in srgb,var(--dns-color) 9%,#fffaf4); }
        :host([data-theme="light"]) .dns-domain { color:#403932; }
        :host([data-theme="light"]) .dns-chart-title { color:#4b433b; }
        :host([data-theme="light"]) .dns-chart-bars {
          border-bottom-color:rgba(91,72,48,.16);
          background:repeating-linear-gradient(to bottom,rgba(91,72,48,.07) 0 1px,transparent 1px 41px);
        }
        :host([data-theme="light"]) .dns-policy { color:#5d554d; background:#fffaf3; }
        :host([data-theme="light"]) .dns-policy.block { color:#a93838; border-color:#e8bebe; }
        :host([data-theme="light"]) .dns-policy.allow { color:#277043; border-color:#b9dcc5; }
        :host([data-theme="light"]) .dns-policy-scope { color:#403932; background:#fff; border-color:rgba(91,72,48,.16); }
        :host([data-theme="light"]) .dns-policy-modal p,
        :host([data-theme="light"]) .adguard-config > p,
        :host([data-theme="light"]) .adguard-modal-head p,
        :host([data-theme="light"]) .guest-modal-head p,
        :host([data-theme="light"]) .guest-status-card span,
        :host([data-theme="light"]) .guest-client small,
        :host([data-theme="light"]) .mesh-head p,
        :host([data-theme="light"]) .mesh-legend { color:#6f675e; }
        :host([data-theme="light"]) .adguard-item { color:#49423b; background:#f3eee7; }
        :host([data-theme="light"]) .guest-close { color:#514a43; }
        :host([data-theme="light"]) .guest-client { background:#f3f8f7; border-color:#d5e6e2; }
        :host([data-theme="light"]) .empty { color:#70685f; }
        :host([data-theme="light"]) .empty strong { color:#403932; }
        :host([data-theme="light"]) .ap-node { color:#3c342c; box-shadow:0 10px 26px rgba(82,61,36,.10); }
        :host([data-theme="light"]) .ap-count,
        :host([data-theme="light"]) .client-ip { color:#6d655d; }
        :host([data-theme="light"]) .client-detail.signal { color:#267447; }
        :host([data-theme="light"]) .watch { color:#70685f; background:#f3efe9; }
        :host([data-theme="light"]) .watch.active { color:#91610b; background:#fff7dc; }
        :host([data-theme="light"]) .watch.notify.active { color:#2b7088; background:#edf8fb; }
        :host([data-theme="light"]) .watch.presence.active { color:#287247; background:#eaf7ee; }
        :host([data-theme="light"]) .watch-heading p,
        :host([data-theme="light"]) .rule small,
        :host([data-theme="light"]) .presence-state,
        :host([data-theme="light"]) .presence-axis { color:#6f675e; }
        :host([data-theme="light"]) .learning,
        :host([data-theme="light"]) .restart-learning { color:#8b5e0c; background:#fff8df; border-color:#e8d49b; }
        :host([data-theme="light"]) .presence-summary { color:#3f5948; background:#edf7f0; border-color:#cfe5d5; }
        :host([data-theme="light"]) .presence-summary strong,
        :host([data-theme="light"]) .presence-name { color:#343b36; }
        :host([data-theme="light"]) .presence-sensor-link { color:#5d5750; background:#f5f2ed; }
        :host([data-theme="light"]) .presence-sensor-link.on { color:#286f46; background:#eaf6ee; border-color:#bfdcc8; }
        :host([data-theme="light"]) .presence-row.home .presence-state { color:#347c51; }
        :host([data-theme="light"]) .presence-timeline::before {
          background:repeating-linear-gradient(90deg,transparent 0,transparent calc(25% - 1px),rgba(91,72,48,.10) 25%);
        }
        :host([data-theme="light"]) .alert-item {
          --alert-color:#946411;
          background:color-mix(in srgb,var(--alert-color) 7%,#fffdf9);
          border-color:color-mix(in srgb,var(--alert-color) 25%,#e5ded4);
        }
        :host([data-theme="light"]) .alert-item.critical { --alert-color:#b43b3b; }
        :host([data-theme="light"]) .alert-item.resolved { --alert-color:#77716a; opacity:.68; }
        :host([data-theme="light"]) .alert-name { color:#3b342d; }
        :host([data-theme="light"]) .alert-message { color:#625a52; }
        :host([data-theme="light"]) .alert-time { color:#756d65; }
        :host([data-theme="light"]) .ack { color:#6d460d; background:#fff8e9; border-color:#d9bd8c; }
        :host([data-theme="light"]) .rule-group { background:#fffdfa; border-color:rgba(91,72,48,.13); }
        :host([data-theme="light"]) .rule-group.basics { background:#fff9ef; border-color:#ead8bc; }
        :host([data-theme="light"]) .rule-group.presence-settings { background:#f5fbf7; border-color:#d5e9db; }
        :host([data-theme="light"]) .rule-group.device-settings,
        :host([data-theme="light"]) .rule-group.notification-settings { background:#f5fafb; border-color:#d7e7eb; }
        :host([data-theme="light"]) .rule-group.notification-target-settings { background:#f5faf7; border-color:#d5e7da; }
        :host([data-theme="light"]) .rule-group.onboarding-settings { background:#fffaf0; border-color:#eadfc6; }
        :host([data-theme="light"]) .rule-group.detection-settings,
        :host([data-theme="light"]) .rule-group.ai-config-settings { background:#faf8ff; border-color:#e1d9f2; }
        :host([data-theme="light"]) .rule-group h3 { color:#756044; }
        :host([data-theme="light"]) .rule label { color:#39332d; }
        :host([data-theme="light"]) .settings-help-head h2 { color:#342d26; }
        :host([data-theme="light"]) .settings-help-copy p { color:#5f574f; }
        :host([data-theme="light"]) .settings-help-copy strong { color:#79501c; }
        :host([data-theme="light"]) .danger-zone strong { color:#a43636; }
        :host([data-theme="light"]) .danger-zone p { color:#735f5c; }
        :host([data-theme="light"]) .ai-head p,
        :host([data-theme="light"]) .ai-score span { color:#6b635b; }
        :host([data-theme="light"]) .ai-run { color:#5f3daf; background:#f3effd; border-color:#d8cdf2; }
        :host([data-theme="light"]) .ai-prompt { color:#514a43; background:#f5f1eb; }
        :host([data-theme="light"]) .ai-score {
          background:color-mix(in srgb,var(--score-color) 9%,#fffdf9);
          border-color:color-mix(in srgb,var(--score-color) 28%,#e3ddd5);
        }
        :host([data-theme="light"]) .ai-score.warn { --score-color:#9a6a10; }
        :host([data-theme="light"]) .ai-copy h3 { color:#6844bd; }
        :host([data-theme="light"]) .ai-copy p { color:#514a43; }
        :host([data-theme="light"]) .tab:focus-visible {
          outline:2px solid rgba(141,90,31,.65); outline-offset:2px;
        }
        :host([data-theme="light"]) select.column-filter,
        :host([data-theme="light"]) .custom-column-filter summary {
          color:#40382f; background:#fffdfa; border-color:#cfc4b6;
          box-shadow:inset 0 1px rgba(255,255,255,.9);
        }
        :host([data-theme="light"]) select.column-filter:hover,
        :host([data-theme="light"]) select.column-filter:focus,
        :host([data-theme="light"]) .custom-column-filter[open] summary {
          color:#352a20; background:#fff8ed; border-color:#b6752f;
          box-shadow:0 0 0 3px rgba(182,117,47,.13);
        }
        :host([data-theme="light"]) .custom-column-filter summary::after {
          border-right-color:#675d52; border-bottom-color:#675d52;
        }
        :host([data-theme="light"]) select.column-filter option,
        :host([data-theme="light"]) select.column-filter optgroup {
          color:#342e28; background:#fffdfa;
        }
        :host([data-theme="light"]) select.column-filter option:checked {
          color:#fff; background:#a85b17;
        }
        :host([data-theme="light"]) .column-filter.has-value,
        :host([data-theme="light"]) select.column-filter.has-value,
        :host([data-theme="light"]) .custom-column-filter.has-value summary {
          color:#643706; background:#f6e5c3; border-color:#d89a42;
          box-shadow:inset 4px 0 #b66b1e,0 0 0 1px rgba(182,107,30,.10);
          font-weight:800;
        }
        :host([data-theme="light"]) .column-filter.has-value::placeholder { color:#77552d; }
        :host([data-theme="light"]) tbody tr { --state:#2d7b4c; }
        :host([data-theme="light"]) tbody tr.off { --state:#b33e3e; opacity:.88; }
        :host([data-theme="light"]) .status { text-shadow:none; }
        :host([data-theme="light"]) .status .dot { box-shadow:0 0 0 3px color-mix(in srgb,var(--state) 14%,transparent); }
        :host([data-theme="light"]) .dns-row.allowed { --dns-color:#287347; }
        :host([data-theme="light"]) .dns-row.blocked { --dns-color:#b33939; }
        :host([data-theme="light"]) .dns-row.allowed .dns-result { color:#287347; }
        :host([data-theme="light"]) .dns-row.blocked .dns-result { color:#b33939; }
        :host([data-theme="light"]) .dns-row.allowed { background:#f4faf6; }
        :host([data-theme="light"]) .dns-row.blocked { background:#fff5f4; }
        :host([data-theme="light"]) .dns-row.allowed:hover { background:#eaf6ee; }
        :host([data-theme="light"]) .dns-row.blocked:hover { background:#fce9e7; }
        :host([data-theme="light"]) .presence-summary {
          color:#294c36; background:#e5f3e9; border-color:#b8d9c2;
        }
        :host([data-theme="light"]) .presence-summary ha-icon { color:#28784a; }
        :host([data-theme="light"]) .presence-summary strong { color:#21452e; }
        :host([data-theme="light"]) .presence-dot { background:#777f79; }
        :host([data-theme="light"]) .presence-row.home .presence-dot {
          background:#31a45d; box-shadow:0 0 0 3px rgba(49,164,93,.17);
        }
        :host([data-theme="light"]) .presence-row.home .presence-state { color:#267044; font-weight:750; }
        :host([data-theme="light"]) .presence-timeline {
          background:#ebe9e4; border-color:#d3ccc2;
          box-shadow:inset 0 1px 3px rgba(70,54,35,.08);
        }
        :host([data-theme="light"]) .presence-segment {
          background:linear-gradient(90deg,#64ad79,#55d37b);
          box-shadow:0 0 0 1px rgba(45,123,76,.10),0 2px 7px rgba(45,123,76,.15);
        }
        :host([data-theme="light"]) .presence-axis { color:#625b53; }
        :host([data-theme="light"]) .settings-view .cleanup-settings .cleanup {
          color:#fff; background:#b83d3d; border-color:#a62f2f;
          box-shadow:0 6px 16px rgba(184,61,61,.18);
          opacity:1;
        }
        :host([data-theme="light"]) .settings-view .cleanup-settings .cleanup:hover {
          color:#fff; background:#9f3030; border-color:#8f2727;
        }
        :host([data-theme="light"]) .settings-view .cleanup-settings .cleanup:focus-visible {
          outline:2px solid rgba(184,61,61,.45); outline-offset:2px;
        }
        :host([data-theme="light"]) .settings-view .cleanup-settings .cleanup:disabled {
          color:#8a8178; background:#e9e4de; border-color:#d5cec5; box-shadow:none; opacity:.72;
        }
        :host([data-theme="light"]) .nav-metric.active { border-color:#c87825; background:#fff9ef; box-shadow:0 0 0 1px rgba(200,120,37,.16),0 12px 26px rgba(78,54,28,.10); }
        :host([data-theme="light"]) .header-action { color:#575048; background:#f7f4ef; border-color:#d8d1c8; }
        :host([data-theme="light"]) .header-action:hover,
        :host([data-theme="light"]) .header-action.active { color:#643b16; background:#fff7ea; border-color:#d99a4c; }
        :host([data-theme="light"]) .settings-tabs { background:#eeeae4; border-color:#d7d0c7; }
        :host([data-theme="light"]) .settings-tab { color:#6d665e; }
        :host([data-theme="light"]) .settings-tab:hover { color:#342d27; background:rgba(255,255,255,.65); }
        :host([data-theme="light"]) .settings-tab.active { color:#643b16; background:#fff7ea; border-color:#d99a4c; box-shadow:inset 0 -2px #c87825; }
        :host([data-theme="light"]) ::selection { color:#fff; background:#a85b17; }

        @media (max-width:1100px) {
          .tabs { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); width:100%; overflow:visible; }
          .tab { min-width:0; padding:10px 8px; }
          .settings-tab-panel.notifications-panel { grid-template-columns:1fr; }
          .settings-tab-panel.devices-panel { grid-template-columns:1fr; }
          .ai-settings .rule-list { grid-template-columns:repeat(2,minmax(0,1fr)); }
        }
        @media (max-width:1200px) { .metrics { grid-template-columns:repeat(3,1fr); } }
        @media (max-width:800px) {
          .shell { padding-top:20px; } header { align-items:flex-start; flex-wrap:wrap; } .scan span { display:none; }
          .header-actions { margin-left:auto; }
          .header-settings span { display:none; }
          .metrics { grid-template-columns:1fr 1fr; } .toolbar { flex-wrap:wrap; }
          .connection-panel { grid-template-columns:1fr; }
          .search { flex-basis:100%; } .filters { flex:1; } .filter { flex:1; }
          .cleanup { flex:1; justify-content:center; }
          select { min-width:120px; }
          .mesh-head { flex-direction:column; } .mesh-panel { padding:18px; }
          .watch-layout { grid-template-columns:1fr; } .security-metrics { grid-template-columns:1fr 1fr; }
          .presence-row { grid-template-columns:1fr; gap:7px; }
          .settings-tab-panel, .settings-tab-panel.ai-maintenance-panel { grid-template-columns:1fr; }
          .rule-group.ai-config-settings .rule { grid-template-columns:1fr; }
          .rule-group.ai-config-settings .settings-select { width:100%; }
          .ai-settings .rule-list { grid-template-columns:1fr; }
          .danger-zone { align-items:stretch; }
          .danger-zone .cleanup { width:100%; justify-content:center; }
          .ai-view { grid-template-columns:1fr; } .ai-head { flex-direction:column; } .ai-report { grid-template-columns:1fr; } .ai-copy { grid-template-columns:1fr; } .ai-copy article.summary { grid-column:auto; }
          .log-panel, .dns-panel { padding:16px; } .log-title, .dns-head { align-items:flex-start; }
          .dns-head { flex-direction:column; } .dns-toolbar { grid-template-columns:1fr; }
          .adguard-config-grid { grid-template-columns:1fr; }
          .adguard-form.rewrite { grid-template-columns:1fr; }
          .adguard-form button { min-height:48px; }
          .adguard-modal-backdrop { padding:12px; }
          .adguard-modal { max-height:calc(100dvh - 24px); padding:19px; border-radius:17px; }
        }
        @media (max-width:620px) {
          .shell { padding:14px 10px 34px; }
          header { gap:12px; margin-bottom:18px; }
          .header-actions { width:100%; display:grid; grid-template-columns:minmax(0,1fr) 44px 44px; }
          .header-action, .scan { justify-content:center; min-width:0; }
          .connection-status span { overflow:hidden; text-overflow:ellipsis; }
          .brand { min-width:0; gap:11px; }
          .logo { width:46px; height:46px; border-radius:14px; }
          .logo ha-icon { --mdc-icon-size:25px; }
          h1 { font-size:27px; }
          .version-info { font-size:9px; }
          .scan { flex:0 0 44px; width:44px; height:44px; justify-content:center; padding:0; }
          .metrics { grid-template-columns:1fr 1fr; }
          .metric.devices, .functions-metric, .metric.connections { grid-column:1 / -1; }
          .guest-qr { grid-template-columns:1fr; justify-items:center; text-align:center; }
          .tabs { grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; padding:6px; }
          .tab { min-height:43px; padding:9px 7px; font-size:12px; }
          .tab ha-icon { --mdc-icon-size:18px; }
          .table-column-picker { top:6px; right:8px; }
          .table-panel, .log-list, .dns-list { max-height:none; overflow:visible; }
          .device-list, .log-list { border:0; background:transparent; box-shadow:none; }
          .device-list table, .device-list tbody,
          .log-table, .log-table tbody,
          .dns-table, .dns-table tbody { display:block; width:100%; min-width:0; }
          .device-list thead, .log-table thead { display:block; width:100%; }
          .device-list thead > tr:first-child,
          .log-table thead > tr:first-child,
          .dns-table thead { display:none; }
          .device-list .column-filters,
          .log-table .log-filters {
            position:static; display:grid; grid-template-columns:1fr 1fr;
            gap:8px; margin:0 0 10px; padding:46px 0 10px;
          }
          .log-table .log-filters { padding-top:0; }
          .device-list .column-filters th,
          .log-table .log-filters th {
            position:static; display:block; min-width:0; padding:0; border:0;
            background:transparent;
          }
          .device-list .column-filters th[data-column="name"],
          .device-list .column-filters th[data-column="ip"],
          .log-table .log-filters th:first-child,
          .log-table .log-filters th:nth-child(2),
          .log-table .log-filters th:last-child { grid-column:1 / -1; }
          .device-list .column-filters th[data-column="mac"],
          .device-list .column-filters th[data-column="connection"],
          .device-list .column-filters th[data-column="rate"],
          .device-list .column-filters th[data-column="address"],
          .device-list .column-filters th[data-column="dns"],
          .device-list .column-filters th[data-column="source"],
          .device-list .column-filters th[data-column="internet"] { display:none; }
          .device-list .custom-column-filter,
          .device-list .column-filter,
          .log-table .custom-column-filter,
          .log-table .column-filter { width:100%; min-width:0 !important; }
          .custom-filter-menu { position:fixed; z-index:110; left:12px !important; right:12px !important; top:auto; bottom:12px; width:auto !important; max-width:none; max-height:62dvh; overflow:auto; }
          .device-list tbody tr,
          .log-table tbody tr,
          .dns-table tbody tr {
            display:block; margin:0 0 10px; overflow:hidden; border:1px solid var(--ns-line);
            border-radius:14px; background:var(--light-card-bg,rgba(38,35,32,.92));
            box-shadow:0 10px 24px rgba(0,0,0,.14);
          }
          .device-list tbody td,
          .log-table tbody td,
          .dns-table tbody td {
            display:grid; grid-template-columns:92px minmax(0,1fr); align-items:center;
            gap:10px; min-width:0; padding:10px 12px; white-space:normal;
            border-bottom:1px solid rgba(255,255,255,.055);
          }
          .device-list tbody td:last-child,
          .log-table tbody td:last-child,
          .dns-table tbody td:last-child { border-bottom:0; }
          .device-list tbody td[colspan],
          .log-table tbody td[colspan] { display:block; padding:18px; }
          .device-list tbody td[colspan]::before,
          .log-table tbody td[colspan]::before { display:none; }
          .device-list tbody td::before,
          .log-table tbody td::before,
          .dns-table tbody td::before {
            content:attr(data-label); color:#8eaea4; font-size:9px; font-weight:800;
            letter-spacing:.7px; text-transform:uppercase;
          }
          .device-list td[data-column="name"] { grid-template-columns:1fr; padding-top:14px; }
          .device-list td[data-column="name"]::before { display:none; }
          .device-list td[data-column="state"] { grid-template-columns:1fr; }
          .device-list td[data-column="state"]::before { display:none; }
          .device-list .status-cell { flex-direction:row; align-items:center; justify-content:space-between; gap:10px; }
          .device-list .card-actions { justify-content:flex-end; }
          .device-list .internet-state { min-width:0; }
          .log-panel, .dns-panel, .mesh-panel, .watch-panel, .ai-panel { padding:13px; border-radius:14px; }
          .log-table tbody td:first-child { grid-template-columns:1fr; }
          .log-table tbody td:first-child::before { display:none; }
          .dns-head .dns-actions { width:100%; display:grid; grid-template-columns:1fr 1fr; }
          .dns-action { justify-content:center; min-height:42px; }
          .dns-chart { padding:12px 8px; }
          .dns-chart-label { font-size:7px; }
          .dns-table .dns-answer { max-width:100%; }
          .mesh-canvas { min-width:0; }
          .mesh-groups { grid-template-columns:1fr; gap:30px; }
          .settings-view .watch-heading { flex-direction:column; align-items:stretch; }
          .settings-view .watch-heading > div { min-width:0; }
          .settings-view .watch-heading .save-rules {
            width:100%; min-width:0; max-width:100%; white-space:normal;
          }
          .rule-group.onboarding-settings .rule,
          .rule-group.ai-config-settings .rule,
          .settings-view .rule { grid-template-columns:1fr; }
          .rule-group.onboarding-settings input[type="text"] { width:100%; }
          .settings-view .rule input[type="checkbox"] { justify-self:end; }
          .settings-help-backdrop { padding:8px; }
          .settings-help-dialog { width:calc(100vw - 16px); max-height:calc(100dvh - 16px); padding:18px; }
        }
        @media (max-width:460px) { .metrics { gap:9px; } .metric { padding:15px; } .metric-value { font-size:27px; } .metric.network .metric-value { font-size:15px; } }
      </style>
      <div class="shell">
        <header>
          <div class="brand">
            <div class="logo"><ha-icon icon="mdi:shield-search"></ha-icon></div>
            <div>
              <div class="eyebrow">Engelsoft</div>
              <h1>Nodarion</h1>
              <div class="version-info"></div>
            </div>
          </div>
          <div class="header-actions">
            <button class="header-action connection-status" type="button" title="Verbindungsdetails anzeigen"><ha-icon icon="mdi:lan-connect"></ha-icon><span>Verbindungen werden geladen</span><ha-icon icon="mdi:chevron-down"></ha-icon></button>
            <button class="header-action header-settings" type="button" title="Einstellungen öffnen"><ha-icon icon="mdi:cog-outline"></ha-icon><span>Einstellungen</span></button>
            <button class="scan"><ha-icon icon="mdi:radar"></ha-icon><span>Jetzt scannen</span></button>
          </div>
        </header>
        <section class="connection-panel" hidden></section>
        <section class="metrics"></section>
        <section class="tab-view" data-view="participants">
          <button class="column-picker-button table-column-picker" type="button" title="Tabellenspalten auswählen" aria-label="Tabellenspalten auswählen"><ha-icon icon="mdi:cog-outline"></ha-icon></button>
          <div class="column-picker" hidden></div>
          <section class="table-panel device-list"></section>
        </section>
        <section class="tab-view" data-view="log" hidden>
          <section class="log-panel">
            <div class="log-title">
              <div class="log-heading"><strong>Live-Log</strong><span class="log-filter-summary" hidden><span class="log-filter-name"></span><button class="log-clear" title="Gerätefilter aufheben"><ha-icon icon="mdi:close"></ha-icon></button></span></div>
              <span class="live"><i class="dot"></i> LIVE</span>
            </div>
            <div class="log-list"></div>
          </section>
        </section>
        <section class="tab-view" data-view="dns" hidden>
          <section class="dns-panel">
            <div class="dns-live-content"></div>
          </section>
        </section>
        <section class="tab-view" data-view="ai" hidden>
          <section class="ai-view"></section>
        </section>
        <section class="tab-view" data-view="settings" hidden>
          <section class="settings-view"></section>
        </section>
        <section class="tab-view" data-view="watch" hidden>
          <section class="watch-view"></section>
        </section>
      </div><div class="guest-modal-host"></div>`;

    this.shadowRoot.querySelector(".scan").addEventListener("click", async () => {
      const button = this.shadowRoot.querySelector(".scan");
      button.classList.add("busy");
      const ids = this._entities().map((entity) => entity.entity_id);
      if (ids.length) {
        await this._hass.callService("homeassistant", "update_entity", { entity_id: ids });
      }
      window.setTimeout(() => button.classList.remove("busy"), 900);
    });
    this.shadowRoot.querySelector(".header-settings").addEventListener("click", () =>
      this._navigateTo("settings")
    );
    this.shadowRoot.querySelector(".connection-status").addEventListener("click", () => {
      this._connectionsExpanded = !this._connectionsExpanded;
      this._renderConnections();
    });
    this.shadowRoot.querySelector(".metrics").addEventListener("click", (event) => {
      if (event.target.closest(".guest-inline")) {
        this._guestModalOpen = true;
        this._renderGuest();
        return;
      }
      const quickFilter = event.target.closest("[data-quick-filter]");
      if (quickFilter) {
        const key = quickFilter.dataset.quickFilter;
        const value = quickFilter.dataset.quickFilterValue;
        this._columnFilters[key] = this._columnFilters[key] === value ? "" : value;
        this._showTab("participants");
        this._render();
        return;
      }
      const navigation = event.target.closest("[data-nav-tab]");
      if (navigation) this._navigateTo(navigation.dataset.navTab);
    });
    this.shadowRoot.querySelector(".metrics").addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      const navigation = event.target.closest("[data-nav-tab]");
      if (!navigation || event.target.closest("button")) return;
      event.preventDefault();
      this._navigateTo(navigation.dataset.navTab);
    });
    this.shadowRoot.querySelector(".device-list").addEventListener("click", (event) => {
      if (event.target.closest(".guest-badge")) {
        this._columnFilters.state = "guest";
        this._renderCards();
        return;
      }
      const customFilterOption = event.target.closest(
        "[data-column-filter-value]"
      );
      if (customFilterOption) {
        this._columnFilters[
          customFilterOption.dataset.columnFilterKey
        ] = customFilterOption.dataset.columnFilterValue;
        this._renderCards();
        return;
      }
      if (event.target.closest(".column-picker-button")) {
        this.shadowRoot.querySelector(".column-picker").toggleAttribute("hidden");
        return;
      }
      const sortButton = event.target.closest(".sort-head");
      if (sortButton) {
        const nextSort = sortButton.dataset.sort;
        this._sortDirection = this._sort === nextSort && this._sortDirection === "asc" ? "desc" : "asc";
        this._sort = nextSort;
        this._renderCards();
        return;
      }
      const entityLink = event.target.closest(".entity-link");
      if (entityLink) {
        this._logDeviceFilter = {
          key: entityLink.dataset.key,
          name: entityLink.dataset.name,
        };
        this._navigateTo("log");
        return;
      }
      const entityIdLink = event.target.closest(".entity-id-link");
      if (entityIdLink) {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          bubbles: true,
          composed: true,
          detail: { entityId: entityIdLink.dataset.entityId },
        }));
        return;
      }
      const approveInternet = event.target.closest(".approve-internet");
      if (approveInternet) {
        this._approveInternet(approveInternet);
        return;
      }
      const dnsLink = event.target.closest(".dns-live-link");
      if (dnsLink) {
        this._openDnsLive(dnsLink.dataset.ip, dnsLink.dataset.name);
        return;
      }
      const button = event.target.closest(".watch");
      if (!button) return;
      const key = button.dataset.key;
      const monitored = this._monitor.monitored.includes(key);
      const notify = this._monitor.notifications.includes(key);
      const presence = this._monitor.presence_devices.includes(key);
      if (button.classList.contains("notify")) {
        this._setMonitor(key, true, !notify, presence);
      } else if (button.classList.contains("presence")) {
        this._setMonitor(key, monitored, notify, !presence);
      } else {
        this._setMonitor(
          key,
          !monitored,
          monitored ? false : notify,
          presence
        );
      }
    });
    this.shadowRoot.querySelector(".guest-modal-host").addEventListener("click", (event) => {
      if (event.target.closest(".guest-show")) {
        this._columnFilters.state = "guest";
        this._guestModalOpen = false;
        this._showTab("participants");
        this._renderGuest();
        this._renderCards();
        return;
      }
      if (event.target.closest(".guest-close") || event.target.classList.contains("guest-modal-backdrop")) {
        this._guestModalOpen = false;
        this._renderGuest();
      }
    });
    this.shadowRoot.querySelector(".table-column-picker").addEventListener(
      "click", () => {
        this.shadowRoot.querySelector(".column-picker").toggleAttribute(
          "hidden"
        );
      }
    );
    const updateColumnFilter = (event) => {
      const input = event.target.closest("[data-column-filter]");
      if (!input) return;
      const key = input.dataset.columnFilter;
      this._columnFilters[key] = input.value.trim();
      const selection = input.selectionStart;
      this._renderCards();
      const replacement = this.shadowRoot.querySelector(
        `[data-column-filter="${key}"]`
      );
      replacement?.focus();
      if (selection !== null && replacement?.setSelectionRange) {
        replacement.setSelectionRange(selection, selection);
      }
    };
    this.shadowRoot.querySelector(".device-list").addEventListener(
      "input", updateColumnFilter
    );
    this.shadowRoot.querySelector(".device-list").addEventListener(
      "change", updateColumnFilter
    );
    this.shadowRoot.querySelector(".device-list").addEventListener(
      "dblclick", (event) => {
        const input = event.target.closest("[data-column-filter]");
        const customFilter = event.target.closest(".custom-column-filter");
        if (!input && !customFilter) return;
        event.preventDefault();
        event.stopPropagation();
        const key = input?.dataset.columnFilter
          || customFilter?.dataset.columnFilterKey
          || "mesh";
        this._columnFilters[key] = "";
        this._renderCards();
        if (customFilter) {
          this.shadowRoot.querySelector(
            `.custom-column-filter[data-column-filter-key="${key}"] summary`
          )?.focus();
        } else {
          this.shadowRoot.querySelector(
            `[data-column-filter="${key}"]`
          )?.focus();
        }
      }
    );
    this.shadowRoot.querySelector(".log-clear").addEventListener("click", () => {
      this._logDeviceFilter = null;
      this._renderLog(true);
    });
    this.shadowRoot.querySelector(".log-list").addEventListener("click", (event) => {
      const filterOption = event.target.closest("[data-log-filter-value]");
      if (filterOption) {
        this._logFilters[filterOption.dataset.logFilterKey] =
          filterOption.dataset.logFilterValue;
        this._renderLog(true);
        return;
      }
      const device = event.target.closest(".log-device-filter");
      if (!device) return;
      this._logDeviceFilter = {
        key: device.dataset.key,
        name: device.dataset.name,
      };
      this._renderLog(true);
    });
    const updateLogFilter = (event) => {
      const input = event.target.closest("[data-log-filter]");
      if (!input) return;
      const key = input.dataset.logFilter;
      const selection = input.selectionStart;
      this._logFilters[key] = input.value;
      this._renderLog(true);
      const replacement = this.shadowRoot.querySelector(`[data-log-filter="${key}"]`);
      replacement?.focus({ preventScroll:true });
      if (selection !== null && replacement?.setSelectionRange) {
        replacement.setSelectionRange(selection, selection);
      }
    };
    this.shadowRoot.querySelector(".log-list").addEventListener("input", updateLogFilter);
    this.shadowRoot.querySelector(".log-list").addEventListener("dblclick", (event) => {
      const input = event.target.closest("[data-log-filter]");
      const dropdown = event.target.closest("[data-log-filter-key]");
      if (!input && !dropdown) return;
      event.preventDefault();
      event.stopPropagation();
      const key = input?.dataset.logFilter || dropdown.dataset.logFilterKey;
      this._logFilters[key] = "";
      this._renderLog(true);
    });
    const dnsContent = this.shadowRoot.querySelector(".dns-live-content");
    dnsContent.addEventListener("focusin", (event) => {
      if (event.target.closest(".dns-toolbar, .adguard-modal")) this._dnsControlsActive = true;
    });
    dnsContent.addEventListener("focusout", () => {
      window.setTimeout(() => {
        const active = this.shadowRoot.activeElement;
        this._dnsControlsActive = Boolean(
          active?.closest?.(".dns-toolbar, .adguard-modal")
        );
        if (!this._dnsControlsActive) this._renderDnsLive();
      }, 0);
    });
    dnsContent.addEventListener("input", (event) => {
      const input = event.target.closest("[data-dns-filter]");
      if (!input) return;
      this._dnsLiveFilters[input.dataset.dnsFilter] = input.value;
      this._renderDnsLive();
      const replacement = this.shadowRoot.querySelector(
        `[data-dns-filter="${input.dataset.dnsFilter}"]`
      );
      replacement?.focus();
      if (input.selectionStart !== null && replacement?.setSelectionRange) {
        replacement.setSelectionRange(input.selectionStart, input.selectionStart);
      }
    });
    dnsContent.addEventListener("change", (event) => {
      const input = event.target.closest("[data-dns-filter]");
      if (!input) return;
      this._dnsLiveFilters[input.dataset.dnsFilter] = input.value;
      this._renderDnsLive();
    });
    dnsContent.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this._adguardConfigOpen) {
        this._adguardConfigOpen = false;
        this._dnsLivePaused = this._dnsPausedBeforeConfig;
        this._dnsControlsActive = false;
        this._dnsRenderedSignature = "";
        this._renderDnsLive();
        if (!this._dnsLivePaused) this._loadDnsLive();
        return;
      }
      if (event.key !== "Enter") return;
      if (event.target.closest(".adguard-form.rewrite")) {
        event.preventDefault();
        dnsContent.querySelector(".adguard-add-rewrite")?.click();
      } else if (event.target.closest(".adguard-form")) {
        event.preventDefault();
        dnsContent.querySelector(".adguard-add-rule")?.click();
      }
    });
    dnsContent.addEventListener("click", (event) => {
      const hostLink = event.target.closest(".dns-host-link");
      if (hostLink) {
        this._openDnsLive(hostLink.dataset.client, hostLink.dataset.name);
        return;
      }
      const dnsStatus = event.target.closest("[data-dns-status]");
      if (dnsStatus) {
        this._dnsLiveFilters.status = dnsStatus.dataset.dnsStatus;
        this._renderDnsLive();
        return;
      }
      const configButton = event.target.closest(".adguard-config-open");
      if (configButton) {
        this._dnsPausedBeforeConfig = this._dnsLivePaused;
        this._adguardConfigOpen = true;
        this._dnsLivePaused = true;
        this._dnsControlsActive = true;
        this._dnsRenderedSignature = "";
        this._renderDnsLive();
        return;
      }
      if (event.target.closest(".dns-chart-toggle")) {
        this._dnsChartVisible = !this._dnsChartVisible;
        this._dnsRenderedSignature = "";
        this._renderDnsLive();
        return;
      }
      if (
        event.target.closest(".adguard-modal-close")
        || (
          event.target.classList.contains("adguard-modal-backdrop")
          && !event.target.closest(".adguard-modal")
        )
      ) {
        this._adguardConfigOpen = false;
        this._dnsLivePaused = this._dnsPausedBeforeConfig;
        this._dnsControlsActive = false;
        this._dnsRenderedSignature = "";
        this._renderDnsLive();
        if (!this._dnsLivePaused) this._loadDnsLive();
        return;
      }
      const policy = event.target.closest(".dns-policy");
      if (policy) {
        if (policy.dataset.policy === "allow") {
          this._dnsPolicyPrompt = {
            domain: policy.dataset.domain,
            client: policy.dataset.client,
          };
          this._dnsRenderedSignature = "";
          this._renderDnsLive();
          this.shadowRoot.querySelector('[data-dns-policy-scope="client"]')?.focus();
          return;
        }
        this._adguardAction(
          {
            action: "adguard_set_domain_policy",
            domain: policy.dataset.domain,
            policy: policy.dataset.policy,
          },
          `Domain „${policy.dataset.domain}“ wirklich blockieren?`
        );
        return;
      }
      const policyScope = event.target.closest("[data-dns-policy-scope]");
      if (policyScope) {
        const prompt = this._dnsPolicyPrompt;
        this._dnsPolicyPrompt = null;
        this._dnsRenderedSignature = "";
        if (policyScope.dataset.dnsPolicyScope === "cancel" || !prompt) {
          this._renderDnsLive();
          return;
        }
        this._adguardAction({
          action: "adguard_set_domain_policy",
          domain: prompt.domain,
          policy: "allow",
          client: policyScope.dataset.dnsPolicyScope === "client" ? prompt.client : null,
        });
        return;
      }
      if (event.target.classList.contains("dns-policy-modal-backdrop")) {
        this._dnsPolicyPrompt = null;
        this._dnsRenderedSignature = "";
        this._renderDnsLive();
        return;
      }
      const deleteRule = event.target.closest(".adguard-delete-rule");
      if (deleteRule) {
        this._adguardAction(
          { action: "adguard_delete_rule", rule: deleteRule.dataset.rule },
          `Eigene Filterregel wirklich löschen?\n\n${deleteRule.dataset.rule}`
        );
        return;
      }
      const deleteRewrite = event.target.closest(".adguard-delete-rewrite");
      if (deleteRewrite) {
        this._adguardAction(
          {
            action: "adguard_delete_rewrite",
            domain: deleteRewrite.dataset.domain,
            answer: deleteRewrite.dataset.answer,
          },
          `DNS-Rewrite „${deleteRewrite.dataset.domain} → ${deleteRewrite.dataset.answer}“ wirklich löschen?`
        );
        return;
      }
      const addRule = event.target.closest(".adguard-add-rule");
      if (addRule) {
        const input = dnsContent.querySelector(".adguard-rule-input");
        if (input?.value.trim()) {
          this._adguardAction({ action: "adguard_add_rule", rule: input.value.trim() });
        }
        return;
      }
      const addRewrite = event.target.closest(".adguard-add-rewrite");
      if (addRewrite) {
        const domain = dnsContent.querySelector(".adguard-rewrite-domain")?.value.trim();
        const answer = dnsContent.querySelector(".adguard-rewrite-answer")?.value.trim();
        if (domain && answer) {
          this._adguardAction({ action: "adguard_add_rewrite", domain, answer });
        }
        return;
      }
      if (event.target.closest(".dns-client-clear")) {
        this._openDnsLive();
        return;
      }
      if (event.target.closest(".dns-refresh")) {
        window.clearTimeout(this._dnsLiveTimer);
        this._loadDnsLive();
        return;
      }
      if (event.target.closest(".dns-pause")) {
        this._dnsLivePaused = !this._dnsLivePaused;
        window.clearTimeout(this._dnsLiveTimer);
        this._renderDnsLive();
        if (!this._dnsLivePaused) this._loadDnsLive();
      }
    });
    this.shadowRoot.querySelector(".column-picker").addEventListener("change", (event) => {
      const input = event.target.closest("[data-column-toggle]");
      if (!input) return;
      this._columnVisibility[input.dataset.columnToggle] = input.checked;
      this._saveColumnVisibility();
      this._renderCards();
    });
    this.shadowRoot.querySelector(".column-picker").addEventListener(
      "click", (event) => {
        if (!event.target.closest(".column-picker-close")) return;
        this.shadowRoot.querySelector(".column-picker").hidden = true;
      }
    );
    this.shadowRoot.addEventListener("click", (event) => {
      const clickedDropdown = event.target.closest(".custom-column-filter");
      this.shadowRoot.querySelectorAll(".custom-column-filter[open]").forEach(
        (dropdown) => {
          if (dropdown !== clickedDropdown) dropdown.removeAttribute("open");
        }
      );
      const picker = this.shadowRoot.querySelector(".column-picker");
      if (
        picker.hidden
        || event.target.closest(".column-picker")
        || event.target.closest(".column-picker-button")
      ) return;
      picker.hidden = true;
    });
    this.shadowRoot.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const helpModal = this.shadowRoot.querySelector(".settings-help-backdrop:not([hidden])");
      if (helpModal) {
        helpModal.hidden = true;
        this._settingsHelp = null;
      }
      this.shadowRoot.querySelectorAll(".custom-column-filter[open]").forEach(
        (dropdown) => dropdown.removeAttribute("open")
      );
      const picker = this.shadowRoot.querySelector(".column-picker");
      if (!picker.hidden) {
        picker.hidden = true;
        this.shadowRoot.querySelector(".column-picker-button")?.focus();
      }
    });
    this.shadowRoot.querySelector(".watch-view").addEventListener("click", (event) => {
      const entityLink = event.target.closest(".watch-entity-link");
      if (entityLink) {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          bubbles:true, composed:true,
          detail:{ entityId:entityLink.dataset.entityId },
        }));
        return;
      }
      const presenceSensor = event.target.closest(".presence-sensor-link");
      if (presenceSensor) {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          bubbles:true, composed:true,
          detail:{ entityId:presenceSensor.dataset.entityId },
        }));
        return;
      }
      if (event.target.closest(".restart-learning")) {
        this._monitorAction({ action: "restart_learning" });
        return;
      }
      const acknowledge = event.target.closest(".ack");
      if (acknowledge) {
        this._monitorAction({
          action: "acknowledge",
          alert_id: acknowledge.dataset.alertId,
        });
        return;
      }
    });
    this.shadowRoot.querySelector(".ai-view").addEventListener("click", (event) => {
      if (event.target.closest(".ai-prompt-toggle")) {
        const prompt = this.shadowRoot.querySelector(".ai-prompt");
        if (!prompt) return;
        prompt.toggleAttribute("hidden");
        const button = event.target.closest(".ai-prompt-toggle");
        const open = !prompt.hasAttribute("hidden");
        button.innerHTML = `<ha-icon icon="${open ? "mdi:eye-off-outline" : "mdi:code-json"}"></ha-icon>${open ? "Prompt ausblenden" : "Prompt anzeigen"}`;
        return;
      }
      const aiButton = event.target.closest(".ai-run");
      if (aiButton) {
        this._runAiAnalysis(aiButton);
        return;
      }
    });
    const settingsView = this.shadowRoot.querySelector(".settings-view");
    settingsView.addEventListener("click", (event) => {
      const tabButton = event.target.closest("[data-settings-tab]");
      if (tabButton) {
        this._settingsTab = tabButton.dataset.settingsTab;
        this._saveSettingsTab();
        settingsView.querySelectorAll("[data-settings-tab]").forEach((button) => {
          const active = button.dataset.settingsTab === this._settingsTab;
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
        });
        settingsView.querySelectorAll("[data-settings-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.settingsPanel !== this._settingsTab;
        });
        return;
      }
      const helpButton = event.target.closest("[data-settings-help]");
      if (helpButton) {
        const help = {
          basics:["Grundlagen", "Mit Überwachung aktiv werden sämtliche Warn- und Prüfregeln gemeinsam geschaltet. Die Erkennung und Anzeige der Teilnehmer läuft unabhängig davon weiter.", "Die Lernphase behandelt bereits vorhandene Teilnehmer vorübergehend als bekannt. Neue Warnungen greifen nach Ablauf der eingestellten Tage."],
          presence:["Anwesenheit", "Haus-markierte Geräte melden sich sofort als anwesend. Erst wenn ein Gerät länger als das Anwesenheits-Timeout nicht erreichbar ist, gilt es als abwesend.", "Der optionale Home-Assistant-Binary-Sensor ist aktiv, sobald mindestens eines dieser Geräte zuhause ist. Er eignet sich beispielsweise für Licht-, Heizungs- oder Alarm-Automationen."],
          devices:["Geräteüberwachung", "Neue Geräte werden erst nach der Bestätigungszeit gemeldet. Kurze oder fehlerhafte Erkennungen lösen dadurch nicht sofort eine Warnung aus.", "Für Geräte mit Stern gilt die Offline-Frist. Nach deren Ablauf erscheint eine Warnung, sofern das Gerät weiterhin nicht erreichbar ist."],
          onboarding:["Geräte-Einrichtung", "Der Einrichtungsbereich kennzeichnet Geräte im angegebenen DHCP-Adressbereich als Neu. Nach der Vergabe einer festen Adresse außerhalb dieses Bereichs gelten sie als zugeordnet.", "Bei automatischer Übernahme liest Nodarion Start und Ende direkt aus der FRITZ!Box. Optional können neue Geräte sofort überwacht oder zusätzlich in Home Assistant gemeldet werden."],
          quiet:["Ruhezeiten", "Während der Ruhezeit kann das Aktivwerden eines Geräts als Auffälligkeit gemeldet werden. Zeiträume über Mitternacht, beispielsweise 23:00 bis 06:00 Uhr, werden automatisch korrekt behandelt.", "Ist die Prüfung deaktiviert, beeinflusst die Ruhezeit weder Erkennung noch Anwesenheitssteuerung."],
          notifications:["Benachrichtigungen und Prüfungen", "Häufige Online-/Offline-Wechsel innerhalb einer Stunde kennzeichnen eine instabile Verbindung. Der Grenzwert bestimmt, ab wie vielen Wechseln gewarnt wird.", "Die HA-Glocke zeigt Meldungen direkt in Home Assistant. Ausgewählte Benachrichtigungsziele senden Warnungen zusätzlich etwa an die Companion App oder einen eingerichteten Telegram Bot.", "Unabhängig von diesen Schaltern erzeugt jede neue Warnung das Home-Assistant-Ereignis nodarion_alert. Damit lassen sich eigene Automationen und weitere Eskalationswege bauen."],
          ai:["KI-Analyse", "Die tägliche Auswertung fasst Netzwerkzustand, Änderungen und Auffälligkeiten nach dem gewählten Zeitpunkt zusammen. Eine manuelle Analyse bleibt im KI-Reiter jederzeit möglich.", "Mit anonymisiertem DNS-Datenschutz werden keine lesbaren Domainnamen an die KI übergeben. Domainnamen mitsenden ermöglicht detailliertere Bewertungen, gibt aber entsprechend mehr Informationen weiter."],
          cleanup:["Bereinigung", "Offline-Teilnehmer löschen entfernt alle derzeit offline geführten Geräte samt gespeicherter Markierungen und Überwachungseinstellungen.", "Diese Aktion ist bewusst nicht Teil des normalen Speicherns und wird erst nach einer zusätzlichen Bestätigung ausgeführt."],
        }[helpButton.dataset.settingsHelp];
        if (!help) return;
        this._settingsHelp = help;
        const modal = settingsView.querySelector(".settings-help-backdrop");
        modal.querySelector("h2").textContent = help[0];
        modal.querySelector(".settings-help-copy").innerHTML = help.slice(1)
          .map((paragraph) => `<p>${esc(paragraph)}</p>`).join("");
        modal.hidden = false;
        modal.querySelector(".settings-help-close")?.focus();
        return;
      }
      if (event.target.closest(".settings-help-close") || event.target.classList.contains("settings-help-backdrop")) {
        settingsView.querySelector(".settings-help-backdrop").hidden = true;
        this._settingsHelp = null;
        return;
      }
      const notifyTargetAction = event.target.closest("[data-notify-target-action]");
      if (notifyTargetAction) {
        const checked = notifyTargetAction.dataset.notifyTargetAction === "all";
        this._notifyTargetsDirty = true;
        settingsView.querySelectorAll(
          ".notify-target:not([hidden]) [data-notify-target]"
        ).forEach((input) => { input.checked = checked; });
        const selected = settingsView.querySelectorAll("[data-notify-target]:checked").length;
        const total = settingsView.querySelectorAll("[data-notify-target]").length;
        const count = settingsView.querySelector(".notify-target-count");
        if (count) count.textContent = `${selected} von ${total} ausgewählt`;
        return;
      }
      const settingOption = event.target.closest("[data-setting-rule]");
      if (settingOption) {
        const rule = settingOption.dataset.settingRule;
        const value = settingOption.dataset.settingValue;
        const input = settingsView.querySelector(`[data-rule="${rule}"]`);
        if (input) input.value = value;
        const details = settingOption.closest("details");
        const summary = details?.querySelector("summary");
        if (summary) summary.textContent = settingOption.textContent.trim();
        details?.querySelectorAll(".custom-filter-option").forEach((option) =>
          option.classList.toggle("active", option === settingOption)
        );
        details?.removeAttribute("open");
        return;
      }
      const cleanup = event.target.closest(".cleanup");
      if (cleanup) {
        this._cleanupOffline(cleanup);
        return;
      }
      const watchSave = event.target.closest(".save-watch-rules");
      if (watchSave) {
        const rules = {};
        settingsView.querySelectorAll(
          ".watch-settings-panel [data-rule]"
        ).forEach((input) => {
          rules[input.dataset.rule] = input.type === "checkbox"
            ? input.checked
            : input.type === "number" ? Number(input.value) : input.value;
        });
        rules.notify_targets = [...settingsView.querySelectorAll(
          ".watch-settings-panel [data-notify-target]:checked"
        )].map((input) => input.dataset.notifyTarget);
        this._saveRuleSettings(watchSave, rules, "watch");
        return;
      }
    });
    settingsView.addEventListener("change", (event) => {
      if (event.target?.matches?.("[data-notify-target]")) {
        this._notifyTargetsDirty = true;
        const selected = settingsView.querySelectorAll("[data-notify-target]:checked").length;
        const total = settingsView.querySelectorAll("[data-notify-target]").length;
        const count = settingsView.querySelector(".notify-target-count");
        if (count) count.textContent = `${selected} von ${total} ausgewählt`;
      }
      const rule = event.target?.dataset?.rule;
      if (rule === "onboarding_auto_range") {
        settingsView.querySelectorAll(
          '[data-rule="onboarding_start"], [data-rule="onboarding_end"]'
        ).forEach((input) => {
          input.disabled = event.target.checked;
        });
      }
      if (rule === "guest_monitoring_enabled") {
        settingsView.querySelectorAll(
          '[data-rule="guest_new_enabled"], [data-rule="guest_quiet_enabled"], [data-rule="guest_max_hours"]'
        ).forEach((input) => {
          input.disabled = !event.target.checked;
        });
      }
    });
    settingsView.addEventListener("input", (event) => {
      if (!event.target?.matches?.(".notify-target-search")) return;
      this._notifyTargetQuery = event.target.value;
      const query = event.target.value.trim().toLocaleLowerCase("de-DE");
      settingsView.querySelectorAll(".notify-target").forEach((target) => {
        const searchable = `${target.textContent} ${target.title}`
          .toLocaleLowerCase("de-DE");
        target.hidden = Boolean(query && !searchable.includes(query));
      });
    });
  }

  _render() {
    const activeElement = this.shadowRoot.activeElement;
    const participantDropdown = activeElement?.closest?.(".device-list .custom-column-filter");
    const logDropdown = activeElement?.closest?.(".log-list .custom-column-filter");
    const dnsDropdown = activeElement?.closest?.(".dns-live-content .dns-status-select");
    const dnsPolicyChoice = activeElement?.closest?.("[data-dns-policy-scope]");
    const notifyTargetInput = activeElement?.closest?.("[data-notify-target]");
    const notifyTargetSearch = activeElement?.matches?.(".notify-target-search");
    const focusState = activeElement?.dataset?.columnFilter ? {
      type:"participant-input", key:activeElement.dataset.columnFilter,
      start:activeElement.selectionStart, end:activeElement.selectionEnd,
    } : activeElement?.dataset?.logFilter ? {
      type:"log-input", key:activeElement.dataset.logFilter,
      start:activeElement.selectionStart, end:activeElement.selectionEnd,
    } : participantDropdown ? {
      type:"participant-dropdown",
      key:participantDropdown.dataset.columnFilterKey
        || participantDropdown.closest("th")?.dataset.column,
    } : logDropdown ? {
      type:"log-dropdown", key:logDropdown.dataset.logFilterKey,
    } : dnsPolicyChoice ? {
      type:"dns-policy-choice", key:dnsPolicyChoice.dataset.dnsPolicyScope,
    } : notifyTargetSearch ? {
      type:"notify-search", start:activeElement.selectionStart, end:activeElement.selectionEnd,
    } : notifyTargetInput ? {
      type:"notify-target", key:notifyTargetInput.dataset.notifyTarget,
    } : dnsDropdown ? {
      type:"dns-dropdown",
    } : null;
    const deviceList = this.shadowRoot.querySelector(".device-list");
    const logList = this.shadowRoot.querySelector(".log-list");
    const notifyTargetList = this.shadowRoot.querySelector(".notify-target-list");
    const notifyTargetDraft = this._notifyTargetsDirty && notifyTargetList
      ? new Set([...notifyTargetList.querySelectorAll("[data-notify-target]:checked")]
        .map((input) => input.dataset.notifyTarget))
      : null;
    const scrollState = {
      deviceLeft:deviceList?.scrollLeft || 0,
      deviceTop:deviceList?.scrollTop || 0,
      logLeft:logList?.scrollLeft || 0,
      logTop:logList?.scrollTop || 0,
      notifyTargetTop:notifyTargetList?.scrollTop || 0,
    };
    const entities = this._entities();
    const online = entities.filter((entity) => entity.state === "on").length;
    const onboarding = entities.filter((entity) =>
      onboardingStatus(entity.attributes.ip_address, this._monitor.rules)
      === "onboarding"
    ).length;
    const guestInfo = this._monitor.guest_access || {};
    const guestMonitoring = this._monitor.rules?.guest_monitoring_enabled !== false;
    if (!guestMonitoring) this._guestModalOpen = false;
    const guestClients = entities.filter((entity) =>
      entity.state === "on" && entity.attributes.guest_network
    ).length;
    const important = this._monitor.monitored.length;
    const notifications = this._monitor.notifications.length;
    const presenceDevices = this._monitor.presence_devices.length;
    const onlineKeys = new Set(entities
      .filter((entity) => entity.state === "on")
      .map((entity) => entity.attributes.nodarion_key
        || `ip_${entity.attributes.ip_address}`));
    const importantOnline = this._monitor.monitored.filter((key) =>
      onlineKeys.has(key)
    ).length;
    const notificationsOnline = this._monitor.notifications.filter((key) =>
      onlineKeys.has(key)
    ).length;
    const presenceOnline = this._monitor.presence_devices.filter((key) =>
      onlineKeys.has(key)
    ).length;
    const alertCount = Number(this._monitor.summary?.active || 0);
    const versions = this._monitor.versions || {};
    this.shadowRoot.querySelector(".version-info").textContent = [
      versions.integration ? `Version ${versions.integration}` : null,
      versions.frontend ? `Frontend ${versions.frontend}` : null,
    ].filter(Boolean).join(" · ");
    const latest = entities.reduce((date, entity) => entity.last_updated > date ? entity.last_updated : date, "");
    const age = latest ? new Intl.DateTimeFormat(activeLocale(), { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(latest)) : "–";
    const connections = entities[0]?.attributes.connection_status || {};
    const configuredConnections = Object.values(connections).filter(
      (connection) => connection.configured
    );
    const activeConnections = configuredConnections.filter(
      (connection) => connection.available
    ).length;
    const connectionStatus = this.shadowRoot.querySelector(".connection-status");
    if (connectionStatus) {
      const connectionLabel = `${activeConnections}/${configuredConnections.length} Verbindungen aktiv`;
      const label = connectionStatus.querySelector("span");
      if (label) label.textContent = connectionLabel;
      connectionStatus.title = `${connectionLabel} · letztes Update ${age}`;
    }
    const eventCount = (this._monitor.events || []).length;
    const adguardConnection = connections.adguard || {};
    const dnsStatus = !adguardConnection.configured
      ? "Nicht eingerichtet"
      : adguardConnection.available ? "Schutz aktiv" : "Nicht erreichbar";
    const latestAiReport = this._monitor.ai_analysis?.reports?.[0];
    const aiScore = latestAiReport ? `${Number(latestAiReport.score)}/10` : "–";
    const aiNote = latestAiReport?.summary || (
      this._monitor.rules?.ai_analysis_enabled
        ? "Tägliche Analyse aktiviert"
        : "Noch keine Bewertung"
    );
    const metrics = this.shadowRoot.querySelector(".metrics");
    metrics.innerHTML = `
      <article class="metric nav-metric devices ${this._activeTab === "participants" ? "active" : ""}" role="button" tabindex="0" data-nav-tab="participants" aria-current="${this._activeTab === "participants" ? "page" : "false"}">
        <div class="metric-label">Netzwerkgeräte</div>
        <div class="device-counts">
          <button class="device-count online ${this._columnFilters.state === "on" ? "active" : ""}" type="button" data-quick-filter="state" data-quick-filter-value="on" title="Nur Online-Geräte anzeigen"><strong>${online}</strong><span>Online</span></button>
          <button class="device-count offline ${this._columnFilters.state === "off" ? "active" : ""}" type="button" data-quick-filter="state" data-quick-filter-value="off" title="Nur Offline-Geräte anzeigen"><strong>${entities.length - online}</strong><span>Offline</span></button>
          <button class="device-count new ${this._columnFilters.onboarding === "onboarding" ? "active" : ""}" type="button" data-quick-filter="onboarding" data-quick-filter-value="onboarding" title="${onboarding} neue Geräte im Einrichtungsbereich"><strong>${onboarding}</strong><span>NEU</span></button>
        </div>
        ${guestMonitoring ? `<button class="guest-inline" type="button" title="Gastzugang anzeigen"><ha-icon icon="mdi:wifi-star"></ha-icon>${guestClients} ${guestClients === 1 ? "Gast" : "Gäste"} · ${guestInfo.enabled ? "aktiv" : "deaktiviert"}</button>` : ""}
      </article>
      <button class="metric nav-metric events-metric ${this._activeTab === "log" ? "active" : ""}" type="button" data-nav-tab="log" aria-current="${this._activeTab === "log" ? "page" : "false"}">
        <div class="metric-label">Ereignisse</div>
        <div class="metric-status-value"><ha-icon icon="mdi:text-box-search-outline"></ha-icon>${eventCount}</div>
        <span class="metric-note">${alertCount ? `${alertCount} offene ${alertCount === 1 ? "Warnung" : "Warnungen"}` : "Keine offenen Warnungen"}</span>
      </button>
      <button class="metric nav-metric dns-metric ${this._activeTab === "dns" ? "active" : ""}" type="button" data-nav-tab="dns" aria-current="${this._activeTab === "dns" ? "page" : "false"}">
        <div class="metric-label">DNS-Schutz</div>
        <div class="metric-status-value"><ha-icon icon="mdi:shield-check-outline"></ha-icon>${esc(dnsStatus)}</div>
        <span class="metric-note">AdGuard DNS-Live</span>
      </button>
      <button class="metric nav-metric ai-metric ${this._activeTab === "ai" ? "active" : ""}" type="button" data-nav-tab="ai" aria-current="${this._activeTab === "ai" ? "page" : "false"}" title="${esc(aiNote)}">
        <div class="metric-label">Netzbewertung</div>
        <div class="metric-value">${esc(aiScore)}</div>
        <span class="metric-note">${esc(aiNote)}</span>
      </button>
      <article class="metric nav-metric watch-metric ${this._activeTab === "watch" ? "active" : ""}" role="button" tabindex="0" data-nav-tab="watch" aria-current="${this._activeTab === "watch" ? "page" : "false"}">
        <div class="metric-label">Überwachung ${alertCount ? `<span class="metric-alert-badge">${alertCount}</span>` : ""}</div>
        <div class="function-counts">
          <button class="function-count favorite ${this._columnFilters.watch === "monitored" ? "active" : ""}" type="button" data-quick-filter="watch" data-quick-filter-value="monitored" title="Favoriten: ${important} gesamt, ${importantOnline} online"><strong><ha-icon icon="mdi:star-outline"></ha-icon>${important}/${importantOnline}</strong><span>Favoriten</span></button>
          <button class="function-count notify ${this._columnFilters.watch === "notify" ? "active" : ""}" type="button" data-quick-filter="watch" data-quick-filter-value="notify" title="Glocke: ${notifications} gesamt, ${notificationsOnline} online"><strong><ha-icon icon="mdi:bell-outline"></ha-icon>${notifications}/${notificationsOnline}</strong><span>Glocke</span></button>
          <button class="function-count presence ${this._columnFilters.watch === "presence" ? "active" : ""}" type="button" data-quick-filter="watch" data-quick-filter-value="presence" title="Anwesenheit: ${presenceDevices} gesamt, ${presenceOnline} online"><strong><ha-icon icon="mdi:home-outline"></ha-icon>${presenceDevices}/${presenceOnline}</strong><span>Anwesenheit</span></button>
        </div>
      </article>`;
    this._renderConnections();
    this._renderGuest();
    this._renderCards();
    this._renderLog();
    this._renderDnsLive();
    this._renderAi();
    this._renderWatch();
    this._renderSettings();
    if (focusState) {
      const selector = focusState.type === "participant-input"
        ? `[data-column-filter="${focusState.key}"]`
        : focusState.type === "log-input"
          ? `[data-log-filter="${focusState.key}"]`
          : focusState.type === "participant-dropdown"
            ? `.device-list [data-column-filter-key="${focusState.key}"] summary`
            : focusState.type === "log-dropdown"
              ? `.log-list [data-log-filter-key="${focusState.key}"] summary`
              : focusState.type === "dns-policy-choice"
                ? `[data-dns-policy-scope="${focusState.key}"]`
                : focusState.type === "notify-target"
                  ? `[data-notify-target="${focusState.key}"]`
                  : focusState.type === "notify-search"
                    ? ".notify-target-search"
                : `.dns-live-content .dns-status-select summary`;
      const replacement = this.shadowRoot.querySelector(selector);
      if (focusState.type.endsWith("-dropdown")) {
        replacement?.closest("details")?.setAttribute("open", "");
      }
      replacement?.focus({ preventScroll:true });
      if (
        replacement?.setSelectionRange
        && focusState.start !== null && focusState.start !== undefined
        && focusState.end !== null && focusState.end !== undefined
      ) {
        replacement.setSelectionRange(focusState.start, focusState.end);
      }
    }
    const updatedDeviceList = this.shadowRoot.querySelector(".device-list");
    const updatedLogList = this.shadowRoot.querySelector(".log-list");
    const updatedNotifyTargetList = this.shadowRoot.querySelector(".notify-target-list");
    if (updatedDeviceList) {
      updatedDeviceList.scrollLeft = scrollState.deviceLeft;
      updatedDeviceList.scrollTop = scrollState.deviceTop;
    }
    if (updatedLogList) {
      updatedLogList.scrollLeft = scrollState.logLeft;
      updatedLogList.scrollTop = scrollState.logTop;
    }
    if (updatedNotifyTargetList) {
      if (notifyTargetDraft) {
        updatedNotifyTargetList.querySelectorAll("[data-notify-target]")
          .forEach((input) => {
            input.checked = notifyTargetDraft.has(input.dataset.notifyTarget);
          });
        const selected = updatedNotifyTargetList.querySelectorAll(
          "[data-notify-target]:checked"
        ).length;
        const total = updatedNotifyTargetList.querySelectorAll(
          "[data-notify-target]"
        ).length;
        const count = this.shadowRoot.querySelector(".notify-target-count");
        if (count) count.textContent = `${selected} von ${total} ausgewählt`;
      }
      updatedNotifyTargetList.scrollTop = scrollState.notifyTargetTop;
    }
  }

  async _cleanupOffline(button) {
    if (!window.confirm(
      "Wirklich ALLE derzeit offline angezeigten Geräte sofort entfernen? Offline überwachte Geräte und deren Überwachungseinstellungen werden ebenfalls gelöscht."
    )) return;
    button.classList.add("busy");
    button.disabled = true;
    try {
      const response = await this._hass.callApi(
        "POST", "nodarion/monitor", { action: "cleanup_inactive" }
      );
      const removed = Number(response.cleanup_result?.removed || 0);
      this._monitor = response;
      this._render();
      const result = this.shadowRoot.querySelector(".cleanup-result");
      result.textContent = removed
        ? `${removed} Offline-${removed === 1 ? "Gerät" : "Geräte"} entfernt.`
        : "Keine Offline-Geräte gefunden.";
      result.classList.add("visible");
    } catch (_error) {
      const result = this.shadowRoot.querySelector(".cleanup-result");
      result.textContent = "Bereinigung konnte nicht ausgeführt werden.";
      result.classList.add("visible");
    } finally {
      const currentButton = this.shadowRoot.querySelector(".danger-zone .cleanup");
      currentButton?.classList.remove("busy");
      if (currentButton) currentButton.disabled = false;
    }
  }

  async _approveInternet(button) {
    const name = button.dataset.name || button.dataset.key;
    if (!window.confirm(
      `Internetzugang für „${name}“ freigeben und das Gerät dauerhaft bestätigen?`
    )) return;
    button.disabled = true;
    const original = button.textContent;
    button.textContent = "Wird freigegeben …";
    try {
      this._monitor = await this._hass.callApi(
        "POST",
        "nodarion/monitor",
        { action: "approve_internet", key: button.dataset.key }
      );
      button.textContent = "Freigegeben";
    } catch (error) {
      const detail = error?.body?.message || error?.message;
      window.alert(
        detail
          ? `Die FRITZ!Box konnte den Internetzugang nicht freigeben:\n\n${detail}`
          : "Die FRITZ!Box konnte den Internetzugang nicht freigeben. Bitte Benutzerrechte und TR-064-Unterstützung prüfen."
      );
      button.disabled = false;
      button.textContent = original;
    }
  }

  _renderGuest() {
    const host = this.shadowRoot.querySelector(".guest-modal-host");
    if (!host) return;
    if (!this._guestModalOpen) {
      host.innerHTML = "";
      return;
    }
    const info = this._monitor.guest_access || {};
    const guests = this._entities().filter((entity) =>
      entity.state === "on" && entity.attributes.guest_network
    );
    const since = this._monitor.guest_since || {};
    const detail = (label, value) => `<div class="guest-status-card"><span>${esc(label)}</span><strong>${esc(value ?? "–")}</strong></div>`;
    const clients = guests.map((entity) => {
      const attr = entity.attributes;
      const key = attr.nodarion_key || `ip_${attr.ip_address}`;
      const name = attr.hostname || attr.friendly_name || attr.ip_address;
      const connected = since[key] ? formatStateChanged(since[key]) : "Online";
      return `<div class="guest-client"><div><strong>${esc(name)}</strong><small>${esc(attr.ip_address || "–")} · ${esc(attr.mac_address || "MAC unbekannt")}${attr.mac_vendor ? ` · ${esc(attr.mac_vendor)}` : ""}</small></div><small>${esc(connected)}</small></div>`;
    }).join("");
    const remaining = Number(info.time_remaining_seconds);
    const qrCode = String(info.qr_code || "");
    const qrHtml = qrCode.startsWith("data:image/svg+xml;base64,")
      ? `<div class="guest-qr"><img src="${esc(qrCode)}" alt="QR-Code für das Gast-WLAN ${esc(info.ssid || "")}"><div class="guest-qr-copy"><h3>Mit dem Gast-WLAN verbinden</h3><p>QR-Code mit der Handykamera scannen und direkt mit <strong>${esc(info.ssid || "dem Gast-WLAN")}</strong> verbinden.</p></div></div>`
      : `<div class="guest-qr-unavailable">${info.qr_code_restricted ? "Der WLAN-QR-Code ist nur für Home-Assistant-Administratoren sichtbar." : info.enabled ? "Die FRITZ!Box konnte für dieses Gast-WLAN keinen QR-Code bereitstellen." : "Der QR-Code ist verfügbar, sobald der Gastzugang aktiv ist."}</div>`;
    host.innerHTML = `<div class="guest-modal-backdrop"><section class="guest-modal" role="dialog" aria-modal="true" aria-labelledby="guest-modal-title">
      <div class="guest-modal-head"><div><h2 id="guest-modal-title"><ha-icon icon="mdi:wifi-star"></ha-icon>FRITZ!Box-Gastzugang</h2><p>Nur lesende Anzeige – Nodarion verändert hier keine FRITZ!Box-Einstellungen.</p></div><button class="guest-close" type="button" aria-label="Schließen"><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="guest-status-grid">
        ${detail("Status", info.available === false ? "Nicht verfügbar" : info.enabled ? "Aktiv" : "Deaktiviert")}
        ${detail("Gäste online", guests.length)}
        ${detail("WLAN-Name", info.ssid || "Nicht gemeldet")}
        ${detail("Verschlüsselung", info.encryption_mode || info.beacontype || "Nicht gemeldet")}
        ${detail("Frequenz", info.frequency_band || "Nicht gemeldet")}
        ${detail("Restlaufzeit", Number.isFinite(remaining) ? formatLease(remaining) : info.timeout_active ? "Aktiv" : "Ohne Zeitlimit")}
      </div>
      ${qrHtml}
      <div class="guest-client-list">${clients || `<div class="empty"><ha-icon icon="mdi:wifi-off"></ha-icon><strong>Keine Gäste online</strong>Der Gastzugang ist gerade angenehm übersichtlich.</div>`}</div>
      <div class="guest-actions"><button class="guest-show" type="button"><ha-icon icon="mdi:filter-variant"></ha-icon>Gäste in Tabelle anzeigen</button></div>
    </section></div>`;
  }

  _renderConnections() {
    const panel = this.shadowRoot.querySelector(".connection-panel");
    const button = this.shadowRoot.querySelector(".connection-status");
    if (!panel || !button) return;
    button.classList.toggle("open", this._connectionsExpanded);
    panel.toggleAttribute("hidden", !this._connectionsExpanded);
    if (!this._connectionsExpanded) return;

    const connections =
      this._entities()[0]?.attributes.connection_status || {};
    const router = this._entities().find((entity) =>
      entity.attributes.fritzbox_model || entity.attributes.fritzos_version
    )?.attributes;
    const order = ["scanner", "fritzbox", "adguard"];
    const duration = (value) => {
      const milliseconds = Number(value);
      if (!Number.isFinite(milliseconds)) return "–";
      return milliseconds < 1000
        ? `${Math.round(milliseconds)} ms`
        : `${(milliseconds / 1000).toFixed(1)} s`;
    };
    const checked = (value) => {
      if (!value) return "Noch nicht geprüft";
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? "Noch nicht geprüft"
        : `Geprüft ${new Intl.DateTimeFormat(activeLocale(), {
            hour: "2-digit", minute: "2-digit", second: "2-digit",
          }).format(date)}`;
    };
    const interval = (seconds) => {
      const value = Number(seconds);
      if (!Number.isFinite(value)) return "";
      return value < 60
        ? `alle ${value} Sek.`
        : `alle ${Math.round(value / 60)} Min.`;
    };
    panel.innerHTML = order.map((key) => {
      const connection = connections[key] || {
        label: key,
        configured: false,
        available: false,
      };
      const stateClass = !connection.configured
        ? "disabled"
        : connection.available ? "online" : "offline";
      const stateLabel = !connection.configured
        ? "Nicht eingerichtet"
        : connection.available ? "Verbunden" : "Nicht erreichbar";
      const deviceInfo = key === "fritzbox" && router
        ? [
            router.fritzbox_model,
            router.fritzos_version
              ? `FRITZ!OS ${router.fritzos_version}`
              : null,
          ].filter(Boolean).join(" · ")
        : "";
      return `<article class="connection-card ${stateClass}">
        <i class="connection-dot"></i>
        <div><div class="connection-name">${esc(connection.label)}</div>${deviceInfo ? `<span class="connection-device-info">${esc(deviceInfo)}</span>` : ""}<div class="connection-state">${stateLabel}</div></div>
        <div class="connection-time">${connection.configured ? duration(connection.duration_ms) : "–"}<span class="connection-checked">${connection.configured ? `${checked(connection.last_checked)} · ${interval(connection.interval_seconds)}` : "In den Optionen deaktiviert"}</span></div>
      </article>`;
    }).join("");
  }

  _renderCards() {
    const activeFilter = this.shadowRoot.activeElement?.closest?.(
      "[data-column-filter]"
    );
    const activeFilterState = activeFilter ? {
      key: activeFilter.dataset.columnFilter,
      start: activeFilter.selectionStart,
      end: activeFilter.selectionEnd,
      direction: activeFilter.selectionDirection,
    } : null;
    const matches = (value, pattern) => {
      const needle = String(pattern || "").toLocaleLowerCase("de-DE");
      if (!needle) return true;
      const haystack = String(value || "").toLocaleLowerCase("de-DE");
      if (!needle.includes("*") && !needle.includes("?")) {
        return haystack.includes(needle);
      }
      const expression = needle
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replaceAll("*", ".*")
        .replaceAll("?", ".");
      return new RegExp(`^${expression}$`, "i").test(haystack);
    };
    let entities = this._entities().filter((entity) => {
      const attr = entity.attributes;
      const filters = this._columnFilters;
      const key = attr.nodarion_key || `ip_${attr.ip_address}`;
      if (filters.state === "guest" && !attr.guest_network) return false;
      if (["on", "off"].includes(filters.state) && entity.state !== filters.state) return false;
      if (
        filters.onboarding
        && onboardingStatus(attr.ip_address, this._monitor.rules)
          !== filters.onboarding
      ) return false;
      if (
        filters.watch === "monitored"
        && !this._monitor.monitored.includes(key)
      ) return false;
      if (
        filters.watch === "notify"
        && !this._monitor.notifications.includes(key)
      ) return false;
      if (
        filters.watch === "presence"
        && !this._monitor.presence_devices.includes(key)
      ) return false;
      if (
        filters.watch === "none"
        && (
          this._monitor.monitored.includes(key)
          || this._monitor.notifications.includes(key)
          || this._monitor.presence_devices.includes(key)
        )
      ) return false;
      return (
        (
          matches(entity.entity_id, filters.name)
          || matches(attr.friendly_name, filters.name)
          || matches(attr.hostname, filters.name)
        )
        && matches(attr.ip_address, filters.ip)
        && matches(
          [attr.mac_address, attr.mac_vendor, attr.mac_vendor_prefix].join(" "),
          filters.mac
        )
        && matches([attr.connection_type, attr.wifi_band, attr.access_point].join(" "), filters.connection)
        && matches(attr.access_point, filters.mesh)
        && matches([attr.link_rate_mbps, attr.link_rate_rx_mbps, attr.link_rate_tx_mbps, attr.signal_strength_percent, attr.signal_strength_dbm].join(" "), filters.rate)
        && matches([attr.address_source, formatLease(attr.lease_time_remaining)].join(" "), filters.address)
        && matches([attr.dns_queries, attr.dns_blocked, attr.dns_blocked_ratio, attr.dns_last_domain].join(" "), filters.dns)
        && matches((attr.detection_sources || []).join(" "), filters.source)
        && matches(
          [attr.wan_access, attr.internet_approval_required ? "freigabe ausstehend gesperrt" : "bestätigt"].join(" "),
          filters.internet
        )
      );
    });
    const ipNumber = (ip) => (ip || "0.0.0.0").split(".").reduce((sum, part) => sum * 256 + Number(part), 0);
    const text = (value) => String(value || "").toLocaleLowerCase("de-DE");
    const valueFor = (entity) => {
      const attr = entity.attributes;
      if (this._sort === "state") return entity.state === "on" ? 0 : 1;
      if (this._sort === "name") return text(attr.hostname || attr.friendly_name);
      if (this._sort === "onboarding") {
        return text(onboardingStatus(attr.ip_address, this._monitor.rules));
      }
      if (this._sort === "mac") return text(attr.mac_address);
      if (this._sort === "connection") return text(`${attr.connection_type || ""} ${attr.wifi_band || ""} ${attr.access_point || ""}`);
      if (this._sort === "mesh") return text(attr.access_point);
      if (this._sort === "rate") return Number(attr.link_rate_mbps ?? attr.link_rate_rx_mbps ?? -1);
      if (this._sort === "address") return text(attr.address_source);
      if (this._sort === "dns") return Number(attr.dns_queries ?? -1);
      if (this._sort === "source") return text((attr.detection_sources || []).join(" "));
      return ipNumber(attr.ip_address);
    };
    entities.sort((a, b) => {
      const av = valueFor(a);
      const bv = valueFor(b);
      const result = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "de", { numeric: true, sensitivity: "base" });
      return result * (this._sortDirection === "asc" ? 1 : -1);
    });

    const grid = this.shadowRoot.querySelector(".device-list");
    const rows = entities.map((entity) => {
      const attr = entity.attributes;
      const online = entity.state === "on";
      const name = attr.hostname || attr.friendly_name || attr.ip_address;
      const key = attr.nodarion_key || `ip_${attr.ip_address}`;
      const monitored = this._monitor.monitored.includes(key);
      const notify = this._monitor.notifications.includes(key);
      const presence = this._monitor.presence_devices.includes(key);
      const lifecycle = onboardingStatus(
        attr.ip_address, this._monitor.rules
      );
      const lifecycleLabel = lifecycle === "onboarding"
        ? "Neu"
        : lifecycle === "assigned" ? "Zugeordnet" : "Unbekannt";
      const stateChanged = entity.last_changed || (this._monitor.events || []).find(
        (item) => item.key === key && ["online", "offline"].includes(item.type)
      )?.timestamp;
      const privateMac = isPrivateMac(attr.mac_address);
      const vendorTitle = attr.mac_vendor ? [
        `Hersteller: ${attr.mac_vendor}`,
        `Registrierter Präfix: ${attr.mac_vendor_prefix || "–"}`,
        `Zuteilung: ${attr.mac_vendor_block_type || "–"}`,
        `Registerstand: ${attr.mac_vendor_last_update || "–"}`,
        "Quelle: lokale MAC-Vendor-Datei",
      ].join("\n") : privateMac
        ? "Lokale bzw. randomisierte MAC-Adresse – eine Herstellerzuordnung ist nicht zuverlässig möglich."
        : "Für diesen MAC-Präfix wurde in der lokalen Datei kein Hersteller gefunden.";
      const approvalRequired = Boolean(attr.internet_approval_required);
      const wanAccess = attr.wan_access;
      const learningActive = Boolean(this._monitor.learning?.active);
      const learnedFritzDevice = learningActive
        && (attr.detection_sources || []).includes("fritzbox");
      const internetLabel = approvalRequired
        ? wanAccess === "denied" ? "Gesperrt · Freigabe ausstehend"
          : wanAccess === "error" ? "Freigabe fehlgeschlagen"
            : "Freigabe ausstehend"
        : learnedFritzDevice ? "Lernphase · automatisch freigegeben"
        : wanAccess === "granted" ? "Freigegeben" : "Nicht verwaltet";
      const internetClass = learnedFritzDevice && !approvalRequired
        ? "granted"
        : (wanAccess || "");
      const sources = (attr.detection_sources || [])
        .map((source) => ({
          fritzbox: "FRITZ!Box",
          ping: "Ping",
          tcp: "TCP",
          ping_tcp: "Ping/TCP",
        })[source] || source)
        .join(" + ") || "Unbekannt";
      const accessPoint = attr.access_point || "–";
      const connection = [attr.connection_type, attr.wifi_band].filter(Boolean).join(" · ") || "Unbekannt";
      const rates = attr.link_rate_mbps !== null && attr.link_rate_mbps !== undefined
        ? `${attr.link_rate_mbps} Mbit/s`
        : [
            attr.link_rate_rx_mbps !== null && attr.link_rate_rx_mbps !== undefined ? `↓ ${attr.link_rate_rx_mbps} Mbit/s` : null,
            attr.link_rate_tx_mbps !== null && attr.link_rate_tx_mbps !== undefined ? `↑ ${attr.link_rate_tx_mbps} Mbit/s` : null,
          ].filter(Boolean).join(" · ");
      const signal = attr.signal_strength_percent !== null && attr.signal_strength_percent !== undefined
        ? `${attr.signal_strength_percent} % Signal`
        : attr.signal_strength_dbm !== null && attr.signal_strength_dbm !== undefined
          ? `${attr.signal_strength_dbm} dBm`
          : null;
      const signalAssessment = signalRating(attr);
      const sourceKey = String(attr.address_source || "").toUpperCase();
      const addressSource = sourceKey === "DHCP"
        ? "DHCP"
        : sourceKey === "STATIC" ? "Statisch" : attr.address_source;
      const lease = formatLease(attr.lease_time_remaining);
      const hasAdGuard = attr.adguard_period_hours !== null && attr.adguard_period_hours !== undefined;
      const dnsTitle = hasAdGuard ? [
        `Zeitraum: ${attr.adguard_period_hours} Stunden`,
        `Daten vollständig: ${attr.adguard_data_complete === false ? "Nein (Abfragelimit erreicht)" : "Ja"}`,
        `Letzte Aktivität: ${formatDateTime(attr.dns_last_activity)}`,
        `Letzte Domain: ${attr.dns_last_domain || "–"}`,
        `Zuletzt blockiert: ${attr.dns_last_blocked_domain || "–"}`,
        `Treffergrund: ${blockReason(attr.dns_last_block_reason)}`,
        `DNS-Protokoll: ${attr.dns_last_protocol || "–"}`,
        `Häufig abgefragt: ${topDomains(attr.dns_top_queried_domains) || "–"}`,
        `Häufig blockiert: ${topDomains(attr.dns_top_blocked_domains) || "–"}`,
      ].join("\n") : "AdGuard Home ist in Nodarion nicht aktiviert oder nicht erreichbar";
      const dnsPrimary = attr.adguard_bypass_suspected
        ? "Kein AdGuard-DNS"
        : hasAdGuard ? `${attr.dns_queries || 0} Anfragen` : "–";
      const dnsSecondary = hasAdGuard
        ? `${attr.dns_blocked || 0} blockiert · ${attr.dns_blocked_ratio || 0} %`
        : "";
      const dnsAssessment = hasAdGuard ? dnsRating(attr.dns_blocked_ratio) : null;
      return `<tr class="${online ? "on" : "off"} ${lifecycle === "onboarding" ? "onboarding-row" : ""} ${attr.guest_network ? "guest-row" : ""}" ${lifecycle === "onboarding" ? 'title="Gerät im DHCP-Einrichtungsbereich"' : ""}>
        <td data-column="state" data-label="Status"><div class="status-cell"><div class="status"><i class="dot"></i>${online ? "Online" : "Offline"}</div><span class="status-time">${esc(formatStateChanged(stateChanged))}</span></div></td>
        <td data-column="onboarding" data-label="Gerätestatus"><span class="onboarding-state ${lifecycle}">${esc(lifecycleLabel)}</span></td>
        <td data-column="name" data-label="Teilnehmer"><div class="device-cell">
          <span class="device-icon" title="Automatisch erkannter Gerätetyp"><ha-icon icon="${deviceIcon(entity)}"></ha-icon></span>
          <div class="device-label"><button class="entity-link" data-key="${esc(key)}" data-name="${esc(name)}" title="Live-Log dieses Geräts anzeigen">${esc(name)}</button>
          ${attr.guest_network ? `<button class="guest-badge" type="button" title="Nur Geräte im Gastzugang anzeigen"><ha-icon icon="mdi:wifi-star"></ha-icon>GAST</button>` : ""}<button class="entity-id-link" data-entity-id="${esc(entity.entity_id)}" title="Home-Assistant-Dialog öffnen">${esc(entity.entity_id)}</button></div>
        </div>
        </td>
        <td data-column="ip" data-label="IP-Adresse" class="mono">${esc(attr.ip_address || "–")}</td>
        <td data-column="mac" data-label="MAC-Adresse" class="mono" title="${esc(vendorTitle)}">${esc(attr.mac_address || "Unbekannt")}${attr.mac_vendor ? `<span class="mac-vendor" title="${esc(vendorTitle)}"><ha-icon icon="mdi:factory"></ha-icon>${esc(attr.mac_vendor)}</span>` : ""}${privateMac ? `<span class="private-mac" title="Lokal verwaltete bzw. randomisierte MAC-Adresse; Änderungen lösen keine Identitätswarnung aus"><ha-icon icon="mdi:incognito"></ha-icon>Privat / randomisiert</span>` : ""}</td>
        <td data-column="connection" data-label="Verbindung"><div class="detail-stack"><strong>${esc(connection)}</strong></div></td>
        <td data-column="mesh" data-label="Mesh-Punkt"><div class="detail-stack"><strong>${esc(accessPoint)}</strong></div></td>
        <td data-column="rate" data-label="WLAN"><div class="detail-stack"><strong>${esc(rates || "–")}</strong>${signal ? `<span class="rating ${signalAssessment?.level || "okay"}" title="WLAN-Empfang: ${esc(signalAssessment?.label || "Nicht bewertet")}"><span class="rating-label">${esc(signal)} · ${esc(signalAssessment?.label || "")}</span></span>` : ""}</div></td>
        <td data-column="address" data-label="Adressvergabe"><div class="detail-stack"><strong>${esc(addressSource || "–")}</strong>${addressSource === "DHCP" && lease ? `<small>Noch ${esc(lease)}</small>` : ""}</div></td>
        <td data-column="dns" data-label="AdGuard DNS" title="${esc(dnsTitle)}"><button class="dns-live-link" type="button" data-ip="${esc(attr.ip_address)}" data-name="${esc(name)}" title="DNS-Live-Log für ${esc(name)} öffnen"><span class="detail-stack"><strong class="${attr.adguard_bypass_suspected ? "dns-alert" : ""}">${esc(dnsPrimary)}</strong>${dnsSecondary ? `<span class="rating ${dnsAssessment?.level || "okay"}" title="Anteil blockierter DNS-Anfragen: ${esc(dnsAssessment?.label || "Nicht bewertet")}"><span class="rating-label">${esc(dnsSecondary)} · ${esc(dnsAssessment?.label || "")}</span></span>` : ""}</span></button></td>
        <td data-column="source" data-label="Erkannt durch">${esc(sources)}</td>
        <td data-column="internet" data-label="Internetzugang"><div class="internet-state"><span class="internet-label ${esc(internetClass)}">${esc(internetLabel)}</span>${approvalRequired ? `<button class="approve-internet" data-key="${esc(key)}" data-name="${esc(name)}" data-entity-id="${esc(entity.entity_id)}">Freigeben</button>` : ""}</div></td>
        <td data-column="watch" data-label="Überwachung">
          <div class="card-actions">
            <button class="watch ${monitored ? "active" : ""}" data-key="${esc(key)}" title="${monitored ? "Überwachung beenden" : "Als wichtig überwachen"}"><ha-icon icon="${monitored ? "mdi:star" : "mdi:star-outline"}"></ha-icon></button>
            <button class="watch notify ${notify ? "active" : ""}" data-key="${esc(key)}" title="${notify ? "Offline-Meldung deaktivieren" : "Bei Offline melden"}"><ha-icon icon="${notify ? "mdi:bell" : "mdi:bell-outline"}"></ha-icon></button>
            <button class="watch presence ${presence ? "active" : ""}" data-key="${esc(key)}" title="${presence ? "Aus Anwesenheitssteuerung entfernen" : `Für Anwesenheitssteuerung verwenden · Offline nach ${Number(this._monitor.rules?.presence_timeout_minutes || 5)} Min.`}"><ha-icon icon="mdi:home-account"></ha-icon></button>
          </div>
        </td>
      </tr>`;
    }).join("");
    const columns = [
      ["state", "Status"], ["onboarding", "Gerätestatus"],
      ["name", "Teilnehmer"], ["ip", "IP-Adresse"],
      ["mac", "MAC-Adresse"], ["connection", "Verbindung"], ["mesh", "Mesh-Zugangspunkt"],
      ["rate", "WLAN-Daten"], ["address", "Adressvergabe"], ["dns", "AdGuard DNS"],
      ["source", "Erkannt durch"], ["internet", "Internetzugang"], ["watch", "Überwachung"],
    ];
    const heading = (label, key) => {
      const active = this._sort === key;
      const icon = active && this._sortDirection === "desc" ? "mdi:arrow-down" : "mdi:arrow-up";
      const direction = active ? (this._sortDirection === "asc" ? "aufsteigend" : "absteigend") : "sortieren";
      return `<th data-column="${key}" aria-sort="${active ? (this._sortDirection === "asc" ? "ascending" : "descending") : "none"}"><button class="sort-head ${active ? "active" : ""}" data-sort="${key}" title="${esc(`${label} ${direction}`)}">${esc(label)}<ha-icon icon="${icon}"></ha-icon></button></th>`;
    };
    const filterInput = (key, placeholder) =>
      `<th data-column="${key}"><input class="column-filter ${this._columnFilters[key] ? "has-value" : ""}" data-column-filter="${key}" value="${esc(this._columnFilters[key] || "")}" placeholder="${esc(placeholder)}" title="* und ? als Wildcards möglich"></th>`;
    const allEntities = this._entities();
    const countWhere = (predicate) => allEntities.filter(predicate).length;
    const customFilter = (key, options, minWidth = "") => {
      const value = this._columnFilters[key] || "";
      const selected = options.find((option) => option.value === value) || options[0];
      const buttons = options.map((option) => `<button type="button" class="custom-filter-option ${value === option.value ? "active" : ""}" data-column-filter-key="${key}" data-column-filter-value="${esc(option.value)}"><ha-icon icon="${value === option.value ? "mdi:check" : option.icon}"></ha-icon><span>${esc(option.label)}</span><span class="custom-filter-count">${Number(option.count || 0)}</span></button>`).join("");
      return `<details class="custom-column-filter ${value ? "has-value" : ""}" data-column-filter-key="${key}" ${minWidth ? `style="min-width:${minWidth}"` : ""}><summary>${esc(selected.label)}</summary><div class="custom-filter-menu">${buttons}</div></details>`;
    };
    const stateFilter = customFilter("state", [
      { value:"", label:"Alle", icon:"mdi:lan", count:allEntities.length },
      { value:"on", label:"Online", icon:"mdi:check-network-outline", count:countWhere((entity) => entity.state === "on") },
      { value:"off", label:"Offline", icon:"mdi:lan-disconnect", count:countWhere((entity) => entity.state === "off") },
      { value:"guest", label:"Gastzugang", icon:"mdi:wifi-star", count:countWhere((entity) => Boolean(entity.attributes.guest_network)) },
    ], "150px");
    const onboardingFilter = customFilter("onboarding", [
      { value:"", label:"Alle Gerätestatus", icon:"mdi:tag-multiple-outline", count:allEntities.length },
      { value:"onboarding", label:"Neu", icon:"mdi:star-four-points-outline", count:countWhere((entity) => onboardingStatus(entity.attributes.ip_address, this._monitor.rules) === "onboarding") },
      { value:"assigned", label:"Zugeordnet", icon:"mdi:check-decagram-outline", count:countWhere((entity) => onboardingStatus(entity.attributes.ip_address, this._monitor.rules) === "assigned") },
      { value:"unknown", label:"Unbekannt", icon:"mdi:help-circle-outline", count:countWhere((entity) => onboardingStatus(entity.attributes.ip_address, this._monitor.rules) === "unknown") },
    ]);
    const watchFilter = customFilter("watch", [
      { value:"", label:"Alle Funktionen", icon:"mdi:tune-variant", count:allEntities.length },
      { value:"monitored", label:"Überwacht", icon:"mdi:star-outline", count:countWhere((entity) => this._monitor.monitored.includes(entity.attributes.nodarion_key)) },
      { value:"notify", label:"Offline-Meldung", icon:"mdi:bell-outline", count:countWhere((entity) => this._monitor.notifications.includes(entity.attributes.nodarion_key)) },
      { value:"presence", label:"Anwesenheit", icon:"mdi:home-account", count:countWhere((entity) => this._monitor.presence_devices.includes(entity.attributes.nodarion_key)) },
      { value:"none", label:"Keine Funktion", icon:"mdi:minus-circle-outline", count:countWhere((entity) => { const key = entity.attributes.nodarion_key; return !this._monitor.monitored.includes(key) && !this._monitor.notifications.includes(key) && !this._monitor.presence_devices.includes(key); }) },
    ], "180px");
    const meshCounts = new Map();
    allEntities.filter((entity) => entity.state === "on").forEach((entity) => {
      const accessPoint = entity.attributes.access_point;
      if (accessPoint) meshCounts.set(accessPoint, (meshCounts.get(accessPoint) || 0) + 1);
    });
    const meshOptions = [...meshCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "de"))
      .map(([name, count]) => `<button type="button" class="custom-filter-option ${this._columnFilters.mesh === name ? "active" : ""}" data-column-filter-key="mesh" data-column-filter-value="${esc(name)}"><ha-icon icon="${this._columnFilters.mesh === name ? "mdi:check" : "mdi:access-point"}"></ha-icon><span>${esc(name)}</span><span class="custom-filter-count">${count}</span></button>`)
      .join("");
    const selectedMesh = this._columnFilters.mesh || "Alle Mesh-Punkte";
    const emptyRow = `<tr><td colspan="13"><div class="empty"><ha-icon icon="mdi:filter-off-outline"></ha-icon><strong>Keine passenden Geräte</strong>Filter ändern oder leeren.</div></td></tr>`;
    grid.innerHTML = `<table>
      <thead>
        <tr>${heading("Status", "state")}${heading("Gerätestatus", "onboarding")}${heading("Teilnehmer", "name")}${heading("IP-Adresse", "ip")}${heading("MAC-Adresse", "mac")}${heading("Verbindung", "connection")}${heading("Mesh-Zugangspunkt", "mesh")}${heading("WLAN-Daten", "rate")}${heading("Adressvergabe", "address")}${heading("AdGuard DNS", "dns")}${heading("Erkannt durch", "source")}<th data-column="internet" class="no-sort">Internetzugang</th><th data-column="watch" class="no-sort">Überwachung</th></tr>
        <tr class="column-filters">
          <th data-column="state">${stateFilter}</th>
          <th data-column="onboarding">${onboardingFilter}</th>
          ${filterInput("name", "Name oder *")}
          ${filterInput("ip", "IP oder *")}
          ${filterInput("mac", "MAC oder *")}
          ${filterInput("connection", "z. B. WLAN")}
          <th data-column="mesh"><details class="custom-column-filter ${this._columnFilters.mesh ? "has-value" : ""}" data-column-filter-key="mesh"><summary>${esc(selectedMesh)}</summary><div class="custom-filter-menu"><button type="button" class="custom-filter-option ${this._columnFilters.mesh ? "" : "active"}" data-column-filter-key="mesh" data-column-filter-value=""><ha-icon icon="${this._columnFilters.mesh ? "mdi:access-point-network" : "mdi:check"}"></ha-icon><span>Alle Mesh-Punkte</span><span class="custom-filter-count">${[...meshCounts.values()].reduce((sum, count) => sum + count, 0)}</span></button>${meshOptions}</div></details></th>
          ${filterInput("rate", "Rate / Signal")}
          ${filterInput("address", "DHCP / statisch")}
          ${filterInput("dns", "DNS / Domain")}
          ${filterInput("source", "Ping / TCP")}
          ${filterInput("internet", "Gesperrt / frei")}
          <th data-column="watch">${watchFilter}</th>
        </tr>
      </thead>
      <tbody>${rows || emptyRow}</tbody>
    </table>`;
    grid.querySelectorAll("[data-column]").forEach((cell) => {
      cell.toggleAttribute("hidden", this._columnVisibility[cell.dataset.column] === false);
    });
    if (activeFilterState) {
      const replacement = grid.querySelector(
        `[data-column-filter="${activeFilterState.key}"]`
      );
      replacement?.focus({ preventScroll: true });
      if (
        replacement?.setSelectionRange
        && activeFilterState.start !== null
        && activeFilterState.end !== null
      ) {
        replacement.setSelectionRange(
          activeFilterState.start,
          activeFilterState.end,
          activeFilterState.direction || "none"
        );
      }
    }
    this.shadowRoot.querySelector(".column-picker").innerHTML = `
      <div class="column-picker-head"><span>Spalten auswählen</span><button class="column-picker-close" type="button" title="Schließen" aria-label="Spaltenauswahl schließen"><ha-icon icon="mdi:close"></ha-icon></button></div>
      ${columns.map(([key, label]) =>
        `<label><input type="checkbox" data-column-toggle="${key}" ${this._columnVisibility[key] === false ? "" : "checked"}>${esc(label)}</label>`
      ).join("")}`;
  }

  _renderLog(resetVerticalScroll = false) {
    const list = this.shadowRoot.querySelector(".log-list");
    const previousScrollLeft = list.scrollLeft;
    const previousScrollTop = list.scrollTop;
    const filterSummary = this.shadowRoot.querySelector(".log-filter-summary");
    const filterName = this.shadowRoot.querySelector(".log-filter-name");
    filterSummary.toggleAttribute("hidden", !this._logDeviceFilter);
    filterName.textContent = this._logDeviceFilter
      ? `Gerät: ${this._logDeviceFilter.name}`
      : "";
    const icons = {
      online: "mdi:lan-connect",
      offline: "mdi:lan-disconnect",
      renamed: "mdi:rename-box",
      discovered: "mdi:radar",
      mesh_changed: "mdi:access-point-network",
      guest_joined: "mdi:wifi-star",
      guest_left: "mdi:wifi-off",
    };
    const labels = {
      online: "Online",
      offline: "Offline",
      renamed: "Umbenannt",
      discovered: "Neu erkannt",
      mesh_changed: "Mesh-Wechsel",
      guest_joined: "Gast verbunden",
      guest_left: "Gast getrennt",
    };
    const logText = (value) => String(value || "").toLocaleLowerCase("de-DE");
    const contains = (value, needle) => !needle
      || logText(value).includes(logText(needle));
    const guestMonitoring = this._monitor.rules?.guest_monitoring_enabled !== false;
    const guestKeys = new Set((this._monitor.participants || [])
      .filter((participant) => participant.attributes?.guest_network)
      .map((participant) => participant.attributes?.nodarion_key || `ip_${participant.attributes?.ip_address}`));
    const allEvents = [...(this._monitor.events || [])].filter((item) =>
      guestMonitoring || (!guestKeys.has(item.key) && !["guest_joined", "guest_left"].includes(item.type))
    );
    const events = allEvents
      .filter((item) => {
        if (this._logDeviceFilter && item.key !== this._logDeviceFilter.key) return false;
        const stamp = new Date(item.timestamp);
        const formattedStamp = Number.isNaN(stamp.getTime()) ? item.timestamp : new Intl.DateTimeFormat(activeLocale(), {
          day:"2-digit", month:"2-digit", year:"numeric",
          hour:"2-digit", minute:"2-digit", second:"2-digit",
        }).format(stamp);
        return contains(`${formattedStamp} ${item.timestamp}`, this._logFilters.time)
          && contains(`${item.name || ""} ${item.ip || ""}`, this._logFilters.device)
          && (!this._logFilters.type || item.type === this._logFilters.type)
          && contains(item.service, this._logFilters.service)
          && contains(`${item.message || ""} ${item.from_access_point || ""} ${item.to_access_point || ""}`, this._logFilters.details);
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const rows = events.map((item) => {
      const timestamp = new Date(item.timestamp);
      const time = new Intl.DateTimeFormat(activeLocale(), {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }).format(timestamp);
      const date = new Intl.DateTimeFormat(activeLocale(), {
        day: "2-digit", month: "2-digit", year: "numeric",
      }).format(timestamp);
      const message = item.type === "mesh_changed" && item.from_access_point && item.to_access_point
        ? `<div class="log-route"><span>${esc(item.from_access_point)}</span><ha-icon icon="mdi:arrow-right"></ha-icon><span>${esc(item.to_access_point)}</span></div>`
        : esc(item.message);
      return `<tr class="log-entry ${esc(item.type)}">
        <td data-label="Zeit"><span class="log-time">${esc(time)}</span><span class="log-date">${esc(date)}</span></td>
        <td data-label="Gerät"><button class="log-device-filter" type="button" data-key="${esc(item.key)}" data-name="${esc(item.name || item.ip)}" title="Live-Log nach ${esc(item.name || item.ip)} filtern"><ha-icon icon="mdi:filter-variant"></ha-icon><span>${esc(item.name || item.ip)}</span></button><div class="log-ip">${esc(item.ip)}</div></td>
        <td data-label="Ereignis"><div class="log-event"><span class="log-icon"><ha-icon icon="${icons[item.type] || "mdi:information-outline"}"></ha-icon></span>${esc(labels[item.type] || item.type)}</div></td>
        <td data-label="Dienst"><div class="log-device">${esc(item.service || "Nicht protokolliert")}</div></td>
        <td data-label="Details"><div class="log-message">${message}</div></td>
      </tr>`;
    }).join("");
    const eventTypes = [...new Set(allEvents.map((item) => item.type).filter(Boolean))]
      .sort((a, b) => String(labels[a] || a).localeCompare(String(labels[b] || b), "de"));
    const typeOptions = ["", ...eventTypes].map((type) => {
      const active = this._logFilters.type === type;
      const label = type ? (labels[type] || type) : "Alle Ereignisse";
      const count = type ? allEvents.filter((item) => item.type === type).length : allEvents.length;
      return `<button type="button" class="custom-filter-option ${active ? "active" : ""}" data-log-filter-key="type" data-log-filter-value="${esc(type)}"><ha-icon icon="${active ? "mdi:check" : (icons[type] || "mdi:format-list-bulleted")}"></ha-icon><span>${esc(label)}</span><span class="custom-filter-count">${count}</span></button>`;
    }).join("");
    const selectedType = this._logFilters.type
      ? (labels[this._logFilters.type] || this._logFilters.type)
      : "Alle Ereignisse";
    const filterInput = (key, placeholder) => `<input class="column-filter ${this._logFilters[key] ? "has-value" : ""}" data-log-filter="${key}" value="${esc(this._logFilters[key])}" placeholder="${esc(placeholder)}">`;
    const emptyRow = `<tr><td colspan="5"><div class="empty"><ha-icon icon="mdi:text-box-search-outline"></ha-icon><strong>Keine Ereignisse gefunden</strong>Filter ändern oder leeren.</div></td></tr>`;
    list.innerHTML = `<table class="log-table">
      <thead><tr><th>Zeit ↓</th><th>Gerät</th><th>Ereignis</th><th>Dienst</th><th>Details</th></tr>
      <tr class="log-filters"><th>${filterInput("time", "Datum / Uhrzeit")}</th><th>${filterInput("device", "Name / IP")}</th><th><details class="custom-column-filter ${this._logFilters.type ? "has-value" : ""}" data-log-filter-key="type"><summary>${esc(selectedType)}</summary><div class="custom-filter-menu">${typeOptions}</div></details></th><th>${filterInput("service", "Dienst")}</th><th>${filterInput("details", "Meldung")}</th></tr></thead>
      <tbody>${rows || emptyRow}</tbody>
    </table>`;
    list.scrollLeft = previousScrollLeft;
    list.scrollTop = resetVerticalScroll ? 0 : previousScrollTop;
  }

  _renderDnsLive() {
    const content = this.shadowRoot.querySelector(".dns-live-content");
    if (!content) return;
    const hostnameEntries = this._entities().map((entity) => [
      String(entity.attributes.ip_address || ""),
      entity.attributes.hostname
        || entity.attributes.friendly_name
        || entity.attributes.ip_address,
    ]);
    const hostnames = new Map(hostnameEntries);
    const renderSignature = JSON.stringify({
      entries: this._dnsLive.entries,
      series: this._dnsLive.series,
      client: this._dnsLive.client,
      name: this._dnsLive.name,
      updated_at: this._dnsLive.updated_at,
      error: this._dnsLive.error,
      filters: this._dnsLiveFilters,
      paused: this._dnsLivePaused,
      chart_visible: this._dnsChartVisible,
      initial_loading: !this._dnsLive.entries.length && this._dnsLiveLoading,
      hostnames: hostnameEntries,
      adguard_config: this._adguardConfig,
      adguard_config_open: this._adguardConfigOpen,
      policy_prompt: this._dnsPolicyPrompt,
      is_admin: Boolean(this._hass?.user?.is_admin),
    });
    if (renderSignature === this._dnsRenderedSignature) return;
    this._dnsRenderedSignature = renderSignature;
    const domainNeedle = this._dnsLiveFilters.domain.toLocaleLowerCase("de-DE");
    const entries = (this._dnsLive.entries || []).filter((item) => {
      if (
        domainNeedle
        && !String(item.domain || "").toLocaleLowerCase("de-DE").includes(domainNeedle)
      ) return false;
      if (this._dnsLiveFilters.status === "blocked" && !item.blocked) return false;
      if (this._dnsLiveFilters.status === "allowed" && item.blocked) return false;
      return true;
    });
    const rows = entries.map((item) => {
      const timestamp = new Date(item.time);
      const time = Number.isNaN(timestamp.getTime()) ? "–" : new Intl.DateTimeFormat(
        activeLocale(),
        {
          day: "2-digit", month: "2-digit", hour: "2-digit",
          minute: "2-digit", second: "2-digit",
        }
      ).format(timestamp);
      const resultLabel = item.blocked ? "Blockiert" : "Erlaubt";
      const resultIcon = item.blocked
        ? "mdi:shield-lock-outline"
        : "mdi:shield-check-outline";
      const rawStatus = String(item.status || "");
      const reason = item.blocked
        ? blockReason(item.reason)
        : rawStatus.toUpperCase() === "NOERROR" ? "OK" : (rawStatus || "Verarbeitet");
      const dnsServer = item.dns_server || (item.cached ? "Cache" : item.upstream) || "AdGuard Home";
      const answer = (item.answer || []).join(", ") || "–";
      const elapsed = Number(item.elapsed_ms);
      const elapsedFormatted = Number.isFinite(elapsed)
        ? new Intl.NumberFormat(activeLocale(), {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(elapsed)
        : null;
      const hostname = hostnames.get(String(item.client || "")) || "Unbekannt";
      const domain = String(item.domain || "");
      const policyActions = this._hass?.user?.is_admin && domain
        ? item.blocked
          ? `<div class="dns-policy-actions"><button class="dns-policy allow" type="button" data-domain="${esc(domain)}" data-client="${esc(item.client || "")}" data-policy="allow">Freigeben</button></div>`
          : `<div class="dns-policy-actions"><button class="dns-policy block" type="button" data-domain="${esc(domain)}" data-policy="block">Blockieren</button></div>`
        : "–";
      return `<tr class="dns-row ${item.blocked ? "blocked" : "allowed"}">
        <td data-label="Zeit" class="mono">${esc(time)}</td>
        <td data-label="Ergebnis"><div class="dns-result"><ha-icon icon="${resultIcon}"></ha-icon>${resultLabel}</div></td>
        <td data-label="Domain / Antwort"><div class="dns-domain">${esc(item.domain || "–")}</div><div class="dns-answer" title="${esc(answer)}">${esc(answer)}</div></td>
        <td data-label="Typ"><span class="dns-chip">${esc(item.query_type || "–")}</span></td>
        <td data-label="Client-IP" class="mono">${esc(item.client || "–")}</td>
        <td data-label="Hostname">${item.client ? `<button class="dns-host-link" type="button" data-client="${esc(item.client)}" data-name="${esc(hostname)}" title="DNS-Live nach ${esc(hostname)} filtern"><ha-icon icon="mdi:filter-variant"></ha-icon><span>${esc(hostname)}</span></button><div class="log-ip">${esc(item.client)}</div>` : esc(hostname)}</td>
        <td data-label="DNS-Server"><span class="dns-chip" title="Für diese Anfrage verwendete DNS-Quelle">${esc(dnsServer)}</span></td>
        <td data-label="Grund">${esc(reason)}</td>
        <td data-label="Dauer" class="mono">${elapsedFormatted ? `${esc(elapsedFormatted)} ms` : "–"}</td>
        <td data-label="Aktion">${policyActions}</td>
      </tr>`;
    }).join("");
    const updated = this._dnsLive.updated_at
      ? new Intl.DateTimeFormat(activeLocale(), {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        }).format(new Date(this._dnsLive.updated_at))
      : "–";
    const clientLabel = this._dnsLive.name
      ? `${this._dnsLive.name} · ${this._dnsLive.client}`
      : this._dnsLive.client;
    const series = this._dnsLive.series || [];
    const chartMax = Math.max(
      1,
      ...series.flatMap((bucket) => [
        Number(bucket.allowed || 0),
        Number(bucket.blocked || 0),
      ])
    );
    const allowedTotal = series.reduce(
      (sum, bucket) => sum + Number(bucket.allowed || 0), 0
    );
    const blockedTotal = series.reduce(
      (sum, bucket) => sum + Number(bucket.blocked || 0), 0
    );
    const chartBars = series.map((bucket, index) => {
      const allowed = Number(bucket.allowed || 0);
      const blocked = Number(bucket.blocked || 0);
      const stamp = new Date(bucket.time);
      const hour = Number.isNaN(stamp.getTime())
        ? "–"
        : new Intl.DateTimeFormat(activeLocale(), { hour: "2-digit" }).format(stamp);
      const fullTime = Number.isNaN(stamp.getTime())
        ? "–"
        : new Intl.DateTimeFormat(activeLocale(), {
            day: "2-digit", month: "2-digit", hour: "2-digit",
            minute: "2-digit",
          }).format(stamp);
      const allowedHeight = allowed ? Math.max(2, allowed * 100 / chartMax) : 0;
      const blockedHeight = blocked ? Math.max(2, blocked * 100 / chartMax) : 0;
      return `<div class="dns-chart-bucket" title="${esc(fullTime)} · ${allowed} erlaubt · ${blocked} blockiert">
        <div class="dns-chart-columns">
          <i class="dns-chart-bar allowed" style="height:${allowedHeight}%"></i>
          <i class="dns-chart-bar blocked" style="height:${blockedHeight}%"></i>
        </div>
        <span class="dns-chart-label">${index % 4 === 0 || index === series.length - 1 ? esc(hour) : ""}</span>
      </div>`;
    }).join("");
    const customRules = (this._adguardConfig.rules || []).map((rule) => `
      <div class="adguard-item"><span>${esc(rule)}</span><button class="adguard-delete-rule" type="button" data-rule="${esc(rule)}" title="Regel löschen"><ha-icon icon="mdi:delete-outline"></ha-icon></button></div>
    `).join("") || `<div class="adguard-item"><span>Keine eigenen Regeln vorhanden</span></div>`;
    const rewrites = (this._adguardConfig.rewrites || []).map((item) => `
      <div class="adguard-item"><span>${esc(item.domain)} → ${esc(item.answer)}${item.enabled === false ? " (deaktiviert)" : ""}</span><button class="adguard-delete-rewrite" type="button" data-domain="${esc(item.domain)}" data-answer="${esc(item.answer)}" title="Rewrite löschen"><ha-icon icon="mdi:delete-outline"></ha-icon></button></div>
    `).join("") || `<div class="adguard-item"><span>Keine DNS-Rewrites vorhanden</span></div>`;
    const configurationModal = this._hass?.user?.is_admin && this._adguardConfigOpen ? `
      <div class="adguard-modal-backdrop" role="presentation">
        <section class="adguard-modal" role="dialog" aria-modal="true" aria-label="AdGuard-Konfiguration">
          <div class="adguard-modal-head">
            <div>
              <h3><ha-icon icon="mdi:shield-cog-outline"></ha-icon>AdGuard-Konfiguration</h3>
              <p>Änderungen werden direkt in AdGuard Home gespeichert. DNS-Live ist während der Bearbeitung pausiert.</p>
            </div>
            <button class="adguard-modal-close" type="button" title="Schließen"><ha-icon icon="mdi:close"></ha-icon></button>
          </div>
          ${this._adguardConfig.error ? `<div class="dns-error">${esc(this._adguardConfig.error)}</div>` : ""}
          <div class="adguard-config-grid">
            <div class="adguard-box">
              <h4>Eigene Filterregeln</h4>
              <div class="adguard-form"><input class="adguard-rule-input" placeholder="z. B. ||example.org^"><button class="adguard-add-rule" type="button">Hinzufügen</button></div>
              <div class="adguard-items">${customRules}</div>
            </div>
            <div class="adguard-box">
              <h4>DNS-Rewrites</h4>
              <div class="adguard-form rewrite"><input class="adguard-rewrite-domain" placeholder="host.example.org"><input class="adguard-rewrite-answer" placeholder="192.168.178.10"><button class="adguard-add-rewrite" type="button">Hinzufügen</button></div>
              <div class="adguard-items">${rewrites}</div>
            </div>
          </div>
        </section>
      </div>` : "";
    const policyPrompt = this._dnsPolicyPrompt;
    const policyModal = policyPrompt ? `
      <div class="dns-policy-modal-backdrop" role="presentation">
        <section class="dns-policy-modal" role="dialog" aria-modal="true" aria-labelledby="dns-policy-title">
          <h3 id="dns-policy-title"><ha-icon icon="mdi:shield-check-outline"></ha-icon>Domain freigeben</h3>
          <p>Soll <strong>${esc(policyPrompt.domain)}</strong> nur für diesen Client oder für alle Geräte freigegeben werden?</p>
          <div class="dns-policy-scope-actions">
            <button class="dns-policy-scope" type="button" data-dns-policy-scope="client" ${policyPrompt.client ? "" : "disabled"}><ha-icon icon="mdi:laptop"></ha-icon>Nur dieser Client · ${esc(policyPrompt.client || "unbekannt")}</button>
            <button class="dns-policy-scope" type="button" data-dns-policy-scope="all"><ha-icon icon="mdi:lan"></ha-icon>Für alle Clients</button>
            <button class="dns-policy-scope cancel" type="button" data-dns-policy-scope="cancel">Abbrechen</button>
          </div>
        </section>
      </div>` : "";
    content.innerHTML = `
      <div class="dns-head">
        <div><h2><ha-icon icon="mdi:dns-outline"></ha-icon>AdGuard DNS-Live</h2><p>Neueste DNS-Anfragen · zuletzt aktualisiert ${esc(updated)} · automatisch alle 3 Sekunden</p></div>
        <div class="dns-actions">
          ${this._hass?.user?.is_admin ? `<button class="dns-action adguard-config-open" type="button"><ha-icon icon="mdi:cog-outline"></ha-icon>Konfiguration</button>` : ""}
          <button class="dns-action dns-chart-toggle" type="button" title="Stundendiagramm ${this._dnsChartVisible ? "ausblenden" : "einblenden"}"><ha-icon icon="${this._dnsChartVisible ? "mdi:chart-box-outline" : "mdi:chart-box-plus-outline"}"></ha-icon>Diagramm ${this._dnsChartVisible ? "aus" : "an"}</button>
          <button class="dns-action dns-pause" type="button"><ha-icon icon="${this._dnsLivePaused ? "mdi:play" : "mdi:pause"}"></ha-icon>${this._dnsLivePaused ? "Fortsetzen" : "Pause"}</button>
          <button class="dns-action dns-refresh ${this._dnsLiveLoading ? "busy" : ""}" type="button" ${this._dnsLiveLoading ? "disabled" : ""}><ha-icon icon="mdi:refresh"></ha-icon>Aktualisieren</button>
        </div>
      </div>
      ${this._dnsLive.error ? `<div class="dns-error"><strong>AdGuard-Log nicht verfügbar:</strong> ${esc(this._dnsLive.error)}</div>` : ""}
      ${this._dnsChartVisible ? `<div class="dns-chart">
        <div class="dns-chart-head">
          <span class="dns-chart-title">DNS-Anfragen der letzten ${series.length || 24} Stunden${this._dnsLive.client ? ` · ${esc(clientLabel)}` : ""}</span>
          <div class="dns-chart-legend">
            <span style="--legend-color:var(--ns-green)"><i></i>${allowedTotal} erlaubt</span>
            <span style="--legend-color:var(--ns-red)"><i></i>${blockedTotal} blockiert</span>
          </div>
        </div>
        <div class="dns-chart-bars">${chartBars}</div>
      </div>` : ""}
      <div class="dns-toolbar">
        <input data-dns-filter="domain" value="${esc(this._dnsLiveFilters.domain)}" placeholder="Domain durchsuchen …">
        <details class="custom-column-filter dns-status-select">
          <summary>${this._dnsLiveFilters.status === "allowed" ? "Nur erlaubt" : this._dnsLiveFilters.status === "blocked" ? "Nur blockiert" : "Alle Ergebnisse"}</summary>
          <div class="custom-filter-menu">
            <button type="button" class="custom-filter-option ${this._dnsLiveFilters.status === "all" ? "active" : ""}" data-dns-status="all"><ha-icon icon="${this._dnsLiveFilters.status === "all" ? "mdi:check" : "mdi:format-list-bulleted"}"></ha-icon><span>Alle Ergebnisse</span></button>
            <button type="button" class="custom-filter-option ${this._dnsLiveFilters.status === "allowed" ? "active" : ""}" data-dns-status="allowed"><ha-icon icon="${this._dnsLiveFilters.status === "allowed" ? "mdi:check" : "mdi:shield-check-outline"}"></ha-icon><span>Nur erlaubt</span></button>
            <button type="button" class="custom-filter-option ${this._dnsLiveFilters.status === "blocked" ? "active" : ""}" data-dns-status="blocked"><ha-icon icon="${this._dnsLiveFilters.status === "blocked" ? "mdi:check" : "mdi:shield-off-outline"}"></ha-icon><span>Nur blockiert</span></button>
          </div>
        </details>
        ${this._dnsLive.client ? `<div class="dns-client-filter"><ha-icon icon="mdi:filter-outline"></ha-icon>${esc(clientLabel)}<button class="dns-client-clear" type="button" title="IP-Filter aufheben"><ha-icon icon="mdi:close"></ha-icon></button></div>` : `<div class="dns-client-filter"><ha-icon icon="mdi:earth"></ha-icon>Alle Clients</div>`}
      </div>
      <div class="dns-list">
        ${rows ? `<table class="dns-table">
          <thead><tr><th>Zeit</th><th>Ergebnis</th><th>Domain / Antwort</th><th>Typ</th><th>Client-IP</th><th>Hostname</th><th>DNS-Server</th><th>Grund</th><th>Dauer</th><th>Aktion</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>` : `<div class="empty"><ha-icon icon="${this._dnsLiveLoading ? "mdi:progress-clock" : "mdi:dns-outline"}"></ha-icon><strong>${this._dnsLiveLoading ? "DNS-Anfragen werden geladen" : "Keine passenden DNS-Anfragen"}</strong>${this._dnsLiveLoading ? "Einen kleinen Moment …" : "Filter ändern oder auf neue Anfragen warten."}</div>`}
      </div>
      ${configurationModal}
      ${policyModal}`;
  }

  _renderAi() {
    const panel = this.shadowRoot.querySelector(".ai-view");
    if (!panel) return;
    const ai = this._monitor.ai_analysis || {};
    const reports = ai.reports || [];
    const latestReport = reports[0];
    const previousReport = reports[1];
    const score = Number(latestReport?.score || 0);
    const scoreDelta = latestReport && previousReport
      ? score - Number(previousReport.score || 0)
      : null;
    const scoreClass = score <= 3 ? "bad" : score <= 6 ? "warn" : "";
    const reportTime = latestReport?.timestamp
      ? new Intl.DateTimeFormat(activeLocale(), {
          dateStyle: "medium", timeStyle: "short",
        }).format(new Date(latestReport.timestamp))
      : "–";
    const history = reports.slice(0, 14).reverse().map((report) => {
      const stamp = new Intl.DateTimeFormat(activeLocale(), {
        dateStyle: "short",
      }).format(new Date(report.timestamp));
      return `<i class="ai-history-bar" style="--score:${Number(report.score || 1)}" title="${esc(stamp)} · ${Number(report.score || 0)}/10"></i>`;
    }).join("");
    const aiReportHtml = latestReport ? `
      <div class="ai-report">
        <div class="ai-score ${scoreClass}">
          <strong>${score}</strong><span>von 10</span>
          <small>${scoreDelta === null ? "Erste Bewertung" : scoreDelta > 0 ? `▲ ${scoreDelta} zum Vortag` : scoreDelta < 0 ? `▼ ${Math.abs(scoreDelta)} zum Vortag` : "● unverändert"}</small>
        </div>
        <div class="ai-copy">
          <article class="summary"><h3>Zusammenfassung</h3><p>${esc(latestReport.summary)}</p></article>
          <article><h3>Auffälligkeiten</h3><p>${esc(latestReport.risks)}</p></article>
          <article><h3>Änderungen</h3><p>${esc(latestReport.changes)}</p></article>
          <article><h3>Empfehlungen</h3><p>${esc(latestReport.recommendations)}</p></article>
          <article><h3>Vertrauen und Datenlage</h3><p>${esc(latestReport.confidence)}</p></article>
        </div>
      </div>
      ${history ? `<div class="ai-history" aria-label="Bewertungsverlauf">${history}</div>` : ""}`
      : `<div class="ai-empty">Noch keine KI-Auswertung vorhanden. Aktiviere den täglichen Bericht oder starte die erste Analyse manuell.</div>`;
    panel.innerHTML = `
      <section class="ai-panel">
        <div class="ai-head">
          <div><h2><ha-icon icon="mdi:creation-outline"></ha-icon>KI-Netzwerkanalyse</h2><p>24-Stunden-Bewertung mit Tagesvergleich · letzter Bericht ${esc(reportTime)}</p></div>
          <div class="ai-actions">
            <button class="ai-prompt-toggle" type="button" ${latestReport?.prompt ? "" : "disabled"}><ha-icon icon="mdi:code-json"></ha-icon>Prompt anzeigen</button>
            <button class="ai-run ${ai.running ? "busy" : ""}" type="button" ${ai.running ? "disabled" : ""}><ha-icon icon="mdi:creation-outline"></ha-icon>${ai.running ? "Analyse läuft …" : "Jetzt analysieren"}</button>
          </div>
        </div>
        ${ai.last_error ? `<div class="ai-error"><strong>Letzte Analyse fehlgeschlagen:</strong> ${esc(ai.last_error)}</div>` : ""}
        ${latestReport?.prompt ? `<pre class="ai-prompt" hidden>${esc(latestReport.prompt)}</pre>` : ""}
        ${aiReportHtml}
      </section>`;
  }

  _renderWatch() {
    const panel = this.shadowRoot.querySelector(".watch-view");
    const summary = this._monitor.summary || {};
    const rules = {
      enabled: true,
      learning_days: 7,
      presence_timeout_minutes: 5,
      presence_sensor_enabled: false,
      onboarding_enabled: true,
      onboarding_auto_range: true,
      onboarding_start: "192.168.178.200",
      onboarding_end: "192.168.178.250",
      onboarding_auto_monitor: false,
      onboarding_notify: false,
      new_device_minutes: 5,
      quiet_hours_enabled: true,
      guest_monitoring_enabled: true,
      guest_new_enabled: true,
      guest_quiet_enabled: true,
      guest_max_hours: 8,
      quiet_start: "23:00",
      quiet_end: "06:00",
      flap_limit: 6,
      offline_minutes: 10,
      identity_changes: true,
      notify_alerts: false,
      notify_targets: [],
      notify_warning: true,
      notify_critical: true,
      ai_analysis_enabled: false,
      ai_analysis_time: "03:15",
      ai_privacy: "anonymized",
      ...(this._monitor.rules || {}),
    };
    const selectedNotifyTargets = new Set(rules.notify_targets || []);
    const notifyEntities = Object.values(this._hass?.states || {})
      .filter((state) => state.entity_id.startsWith("notify."))
      .sort((a, b) => String(a.attributes?.friendly_name || a.entity_id)
        .localeCompare(String(b.attributes?.friendly_name || b.entity_id), "de"));
    const notifyQuery = this._notifyTargetQuery.trim().toLocaleLowerCase("de-DE");
    const selectedNotifyCount = notifyEntities.filter((state) =>
      selectedNotifyTargets.has(state.entity_id)
    ).length;
    const notifyTargetHtml = notifyEntities.length
      ? notifyEntities.map((state) => {
        const name = state.attributes?.friendly_name || state.entity_id;
        const telegram = state.entity_id.includes("telegram_bot");
        const companion = state.entity_id.includes("mobile_app");
        const channel = telegram ? "Telegram" : companion ? "Companion App" : "Home Assistant";
        const icon = telegram ? "mdi:send" : companion ? "mdi:cellphone-message" : "mdi:bell-outline";
        const hidden = notifyQuery
          && !`${name} ${state.entity_id} ${channel}`.toLocaleLowerCase("de-DE").includes(notifyQuery);
        return `<label class="notify-target" title="${esc(state.entity_id)}" ${hidden ? "hidden" : ""}><input type="checkbox" data-notify-target="${esc(state.entity_id)}" ${selectedNotifyTargets.has(state.entity_id) ? "checked" : ""}><span class="notify-target-icon ${telegram ? "telegram" : ""}"><ha-icon icon="${icon}"></ha-icon></span><span class="notify-target-copy"><strong>${esc(name)}</strong><small>${channel}</small></span><span class="notify-target-check"><ha-icon icon="mdi:check"></ha-icon></span></label>`;
      }).join("")
      : `<div class="notify-target-empty">Noch kein <code>notify.*</code>-Ziel in Home Assistant vorhanden.</div>`;
    const learning = this._monitor.learning || {};
    const learningEnd = learning.ends_at
      ? new Intl.DateTimeFormat(activeLocale(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(learning.ends_at))
      : "–";
    const learningRemainingMs = learning.ends_at
      ? Math.max(0, new Date(learning.ends_at).getTime() - Date.now())
      : 0;
    const learningRemaining = formatRemainingDuration(learningRemainingMs);
    const icons = {
      new_device: "mdi:account-question-outline",
      quiet_activity: "mdi:weather-night",
      flapping: "mdi:pulse",
      identity_changed: "mdi:swap-horizontal-bold",
      important_offline: "mdi:lan-disconnect",
      guest_new: "mdi:wifi-star",
      guest_quiet: "mdi:weather-night-partly-cloudy",
      guest_long: "mdi:timer-alert-outline",
    };
    const labels = {
      new_device: "Unbekanntes Gerät",
      quiet_activity: "Aktivität zur Ruhezeit",
      flapping: "Instabile Verbindung",
      identity_changed: "Identität geändert",
      important_offline: "Wichtiges Gerät offline",
      guest_new: "Neuer Gast",
      guest_quiet: "Gast zur Ruhezeit",
      guest_long: "Gast lange verbunden",
    };
    const participantEntities = this._entities();
    const entityIdByKey = new Map(participantEntities.map((entity) => [
      entity.attributes.nodarion_key || `ip_${entity.attributes.ip_address}`,
      entity.entity_id,
    ]));
    const guestKeys = new Set((this._monitor.participants || [])
      .filter((participant) => participant.attributes?.guest_network)
      .map((participant) => participant.attributes?.nodarion_key || `ip_${participant.attributes?.ip_address}`));
    const guestAlertTypes = new Set(["guest_new", "guest_quiet", "guest_long"]);
    const alerts = [...(this._monitor.alerts || [])]
      .filter((alert) => rules.guest_monitoring_enabled || (!guestKeys.has(alert.key) && !guestAlertTypes.has(alert.type)))
      .sort((a, b) => Number(Boolean(b.active)) - Number(Boolean(a.active)) || new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 30);
    const alertHtml = alerts.length ? alerts.map((alert) => {
      const active = alert.active && !alert.acknowledged;
      const alertEntityId = entityIdByKey.get(alert.key);
      const time = new Intl.DateTimeFormat(activeLocale(), {
        dateStyle: "short", timeStyle: "short",
      }).format(new Date(alert.timestamp));
      return `<article class="alert-item ${esc(alert.severity)} ${active ? "" : "resolved"}">
        <div class="alert-symbol"><ha-icon icon="${icons[alert.type] || "mdi:alert-circle-outline"}"></ha-icon></div>
        <div>
          <div class="alert-name">${esc(labels[alert.type] || "Netzwerkhinweis")} · ${alertEntityId ? `<button class="watch-entity-link" type="button" data-entity-id="${esc(alertEntityId)}" title="Home-Assistant-Dialog öffnen">${esc(alert.name || alert.ip)}</button>` : esc(alert.name || alert.ip)}</div>
          <div class="alert-message">${esc(alert.message)}</div>
          <div class="alert-time">${esc(time)} · ${esc(alert.ip)}${active ? "" : " · Erledigt"}</div>
        </div>
        ${active ? `<button class="ack" data-alert-id="${esc(alert.id)}">Bestätigen</button>` : ""}
      </article>`;
    }).join("") : `<div class="empty"><ha-icon icon="mdi:shield-check-outline"></ha-icon><strong>Alles ruhig im Netz</strong>Erkannte Auffälligkeiten erscheinen automatisch hier.</div>`;

    const presenceKeys = new Set(this._monitor.presence_devices || []);
    const presenceEntities = participantEntities.filter((entity) =>
      presenceKeys.has(entity.attributes.nodarion_key)
    );
    const timelineEnd = Date.now();
    const timelineStart = timelineEnd - 24 * 60 * 60 * 1000;
    const presenceRows = presenceEntities
      .sort((a, b) => String(a.attributes.hostname || a.attributes.friendly_name || "")
        .localeCompare(String(b.attributes.hostname || b.attributes.friendly_name || "")))
      .map((entity) => {
        const key = entity.attributes.nodarion_key;
        const name = entity.attributes.hostname || entity.attributes.friendly_name
          || entity.attributes.ip_address || key;
        const currentHome = entity.state === "on";
        const changes = (this._monitor.events || [])
          .filter((item) => item.key === key && ["online", "offline"].includes(item.type))
          .map((item) => ({ time: new Date(item.timestamp).getTime(), home: item.type === "online" }))
          .filter((item) => Number.isFinite(item.time) && item.time <= timelineEnd)
          .sort((a, b) => a.time - b.time);
        const before = changes.filter((item) => item.time <= timelineStart).at(-1);
        const within = changes.filter((item) => item.time > timelineStart);
        let home = before ? before.home : within.length ? !within[0].home : currentHome;
        let cursor = timelineStart;
        const segments = [];
        [...within, { time: timelineEnd, home: currentHome }].forEach((change) => {
          const end = Math.min(timelineEnd, Math.max(cursor, change.time));
          if (home && end > cursor) segments.push([cursor, end]);
          cursor = end;
          home = change.home;
        });
        if (home && cursor < timelineEnd) segments.push([cursor, timelineEnd]);
        const bars = segments.map(([start, end]) => {
          const left = ((start - timelineStart) / (timelineEnd - timelineStart)) * 100;
          const width = ((end - start) / (timelineEnd - timelineStart)) * 100;
          return `<i class="presence-segment" style="left:${left.toFixed(3)}%;width:${width.toFixed(3)}%"></i>`;
        }).join("");
        const lastChange = changes.at(-1)?.time;
        const changed = lastChange ? new Intl.DateTimeFormat(activeLocale(), {
          hour: "2-digit", minute: "2-digit",
        }).format(new Date(lastChange)) : null;
        return `<div class="presence-row ${currentHome ? "home" : "away"}">
          <div class="presence-person"><i class="presence-dot"></i><button class="presence-name watch-entity-link" type="button" data-entity-id="${esc(entity.entity_id)}" title="Home-Assistant-Dialog öffnen">${esc(name)}</button><small class="presence-state">${currentHome ? "Zuhause" : "Abwesend"}${changed ? ` · seit ${esc(changed)} Uhr` : ""}</small></div>
          <div><div class="presence-timeline" title="Anwesenheit in den letzten 24 Stunden">${bars}</div><div class="presence-axis"><span>vor 24 Std.</span><span>vor 18 Std.</span><span>vor 12 Std.</span><span>vor 6 Std.</span><span>jetzt</span></div></div>
        </div>`;
      }).join("");
    const homeCount = presenceEntities.filter((entity) => entity.state === "on").length;
    const presenceSensorEntity = Object.values(this._hass?.states || {}).find(
      (state) => state.attributes?.nodarion_presence_summary
    ) || this._hass?.states?.["binary_sensor.nodarion_anwesenheit"];
    const presenceSensorOn = presenceSensorEntity
      ? presenceSensorEntity.state === "on"
      : homeCount > 0;
    const presenceSensorButton = rules.presence_sensor_enabled ? `<button class="presence-sensor-link ${presenceSensorOn ? "on" : "off"}" type="button" data-entity-id="${esc(presenceSensorEntity?.entity_id || "binary_sensor.nodarion_anwesenheit")}" title="Home-Assistant-Dialog des Anwesenheitssensors öffnen"><ha-icon icon="${presenceSensorOn ? "mdi:home-account" : "mdi:home-outline"}"></ha-icon><span>Anwesenheit: ${presenceSensorOn ? "Anwesend" : "Abwesend"}</span></button>` : "";
    const presenceHtml = presenceRows ? `
      <section class="watch-panel presence-overview">
        <div class="watch-heading"><div><h2>Anwesenheit</h2><p>Aktueller Zustand und Verlauf der letzten 24 Stunden.</p></div>${presenceSensorButton}</div>
        <div class="presence-summary"><ha-icon icon="${homeCount ? "mdi:home-account" : "mdi:home-export-outline"}"></ha-icon><strong>${homeCount ? `${homeCount} von ${presenceEntities.length} zuhause` : "Niemand zuhause"}</strong><span>· basiert auf den markierten Home-Geräten</span></div>
        <div class="presence-list">${presenceRows}</div>
      </section>` : `
      <section class="watch-panel presence-overview">
        ${presenceSensorButton ? `<div class="watch-heading"><div><h2>Anwesenheit</h2><p>Der Anwesenheitssensor ist aktiviert.</p></div>${presenceSensorButton}</div>` : ""}<div class="empty"><ha-icon icon="mdi:home-plus-outline"></ha-icon><strong>Noch keine Anwesenheitsgeräte</strong>Markiere Teilnehmer in der Tabelle mit dem Haus-Symbol.</div>
      </section>`;

    const checked = (value) => value ? "checked" : "";
    panel.innerHTML = `
      <div class="security-metrics">
        <article class="security-card"><span>Aktive Warnungen</span><strong>${Number(summary.active || 0)}</strong></article>
        <article class="security-card"><span>Kritisch</span><strong>${Number(summary.critical || 0)}</strong></article>
        <article class="security-card"><span>Unbekannte Geräte</span><strong>${Number(summary.unknown || 0)}</strong></article>
        <article class="security-card"><span>Instabile Geräte</span><strong>${Number(summary.unstable || 0)}</strong></article>
      </div>
      <div class="watch-overview-grid">
      <div class="watch-layout alerts-only">
        <section class="watch-panel alerts-panel">
          <div class="watch-heading">
            <div><h2>Warnungen und Auffälligkeiten</h2><p>Aktive Hinweise stehen oben, erledigte bleiben als Verlauf erhalten.</p></div>
            <div class="learning-actions">
              ${learning.active ? `<span class="learning" title="Endet am ${esc(learningEnd)}"><ha-icon icon="mdi:school-outline"></ha-icon>Noch ${esc(learningRemaining)}</span>` : `<span class="learning"><ha-icon icon="mdi:school-outline"></ha-icon>Lernphase beendet</span>`}
              <button class="restart-learning" type="button" title="Aktuelle Teilnehmer übernehmen und Lernzeit ab jetzt neu beginnen"><ha-icon icon="mdi:restart"></ha-icon>Neu starten</button>
            </div>
          </div>
          <div class="alert-list">${alertHtml}</div>
        </section>
        <section class="watch-panel watch-settings-panel">
          <div class="watch-heading"><div><h2>Einstellungen</h2><p>Änderungen gelten ab dem nächsten Netzwerkscan.</p></div><button class="save-rules save-watch-rules" type="button"><ha-icon icon="mdi:content-save-outline"></ha-icon>Alle Einstellungen speichern</button></div>
          <nav class="settings-tabs" role="tablist" aria-label="Einstellungsbereiche">
            <button class="settings-tab ${this._settingsTab === "general" ? "active" : ""}" type="button" role="tab" aria-selected="${this._settingsTab === "general"}" data-settings-tab="general"><ha-icon icon="mdi:tune-variant"></ha-icon>Allgemein</button>
            <button class="settings-tab ${this._settingsTab === "devices" ? "active" : ""}" type="button" role="tab" aria-selected="${this._settingsTab === "devices"}" data-settings-tab="devices"><ha-icon icon="mdi:devices"></ha-icon>Geräte</button>
            <button class="settings-tab ${this._settingsTab === "rules" ? "active" : ""}" type="button" role="tab" aria-selected="${this._settingsTab === "rules"}" data-settings-tab="rules"><ha-icon icon="mdi:shield-alert-outline"></ha-icon>Regeln &amp; Alarme</button>
            <button class="settings-tab ${this._settingsTab === "notifications" ? "active" : ""}" type="button" role="tab" aria-selected="${this._settingsTab === "notifications"}" data-settings-tab="notifications"><ha-icon icon="mdi:bell-outline"></ha-icon>Benachrichtigungen</button>
            <button class="settings-tab ${this._settingsTab === "ai-maintenance" ? "active" : ""}" type="button" role="tab" aria-selected="${this._settingsTab === "ai-maintenance"}" data-settings-tab="ai-maintenance"><ha-icon icon="mdi:creation-outline"></ha-icon>KI-Analyse</button>
          </nav>
          <div class="rule-list">
            <div class="settings-tab-panel general-panel" role="tabpanel" data-settings-panel="general" ${this._settingsTab === "general" ? "" : "hidden"}>
            <section class="rule-group basics">
              <h3>Grundlagen<button class="settings-help-button" type="button" data-settings-help="basics" title="Grundlagen erklären" aria-label="Hilfe zu Grundlagen">?</button></h3>
              <div class="rule"><label>Überwachung aktiv<small>Alle Regeln gemeinsam ein- oder ausschalten</small></label><input type="checkbox" data-rule="enabled" ${checked(rules.enabled)}></div>
              <div class="rule"><label>Lernphase<small>Tage, in denen aktuelle Geräte als bekannt gelten</small></label><input type="number" min="0" max="30" data-rule="learning_days" value="${Number(rules.learning_days)}"></div>
            </section>
            <section class="rule-group presence-settings">
              <h3>Anwesenheit<button class="settings-help-button" type="button" data-settings-help="presence" title="Anwesenheit erklären" aria-label="Hilfe zu Anwesenheit">?</button></h3>
              <div class="rule"><label>Anwesenheits-Timeout<small>Markierte Geräte gehen sofort online und erst nach dieser Zeit offline (Minuten)</small></label><input type="number" min="1" max="1440" data-rule="presence_timeout_minutes" value="${Number(rules.presence_timeout_minutes)}"></div>
              <div class="rule"><label>Anwesenheitssensor<small>Binary Sensor &bdquo;Anwesenheit&ldquo; f&uuml;r Automationen aktivieren</small></label><input type="checkbox" data-rule="presence_sensor_enabled" ${checked(rules.presence_sensor_enabled)}></div>
            </section>
            </div>
            <div class="settings-tab-panel devices-panel" role="tabpanel" data-settings-panel="devices" ${this._settingsTab === "devices" ? "" : "hidden"}>
            <section class="rule-group onboarding-settings">
              <h3>Geräte-Einrichtung<button class="settings-help-button" type="button" data-settings-help="onboarding" title="Geräte-Einrichtung erklären" aria-label="Hilfe zu Geräte-Einrichtung">?</button></h3>
              <div class="rule"><label>Einrichtungsbereich aktiv<small>Geräte in diesem IP-Bereich als neu kennzeichnen</small></label><input type="checkbox" data-rule="onboarding_enabled" ${checked(rules.onboarding_enabled)}></div>
              <div class="rule"><label>Von FRITZ!Box übernehmen<small>DHCP-Start und -Ende automatisch per TR-064 abfragen</small></label><input type="checkbox" data-rule="onboarding_auto_range" ${checked(rules.onboarding_auto_range)}></div>
              <div class="rule"><label>Bereich beginnt<small>${rules.onboarding_auto_range ? "Automatisch von der FRITZ!Box erkannt" : "Erste DHCP-Adresse für neue Geräte"}</small></label><input type="text" data-rule="onboarding_start" value="${esc(rules.onboarding_start)}" placeholder="192.168.178.200" ${rules.onboarding_auto_range ? "disabled" : ""}></div>
              <div class="rule"><label>Bereich endet<small>${rules.onboarding_auto_range ? "Automatisch von der FRITZ!Box erkannt" : "Letzte DHCP-Adresse für neue Geräte"}</small></label><input type="text" data-rule="onboarding_end" value="${esc(rules.onboarding_end)}" placeholder="192.168.178.250" ${rules.onboarding_auto_range ? "disabled" : ""}></div>
              <div class="rule"><label>Automatisch überwachen<small>Neue Geräte im Einrichtungsbereich direkt mit Stern markieren</small></label><input type="checkbox" data-rule="onboarding_auto_monitor" ${checked(rules.onboarding_auto_monitor)}></div>
              <div class="rule"><label>Benachrichtigung<small>Neue Geräte im Einrichtungsbereich in Home Assistant melden</small></label><input type="checkbox" data-rule="onboarding_notify" ${checked(rules.onboarding_notify)}></div>
            </section>
            <section class="rule-group guest-settings">
              <h3>Gastzugang</h3>
              <div class="rule"><label>Gastnetz anzeigen und überwachen<small>Gastgeräte in Nodarion erfassen, anzeigen und protokollieren</small></label><input type="checkbox" data-rule="guest_monitoring_enabled" ${checked(rules.guest_monitoring_enabled)}></div>
              <div class="rule"><label>Neue Gäste melden<small>Beim erstmaligen Verbinden mit dem FRITZ!Box-Gastzugang warnen</small></label><input type="checkbox" data-rule="guest_new_enabled" ${checked(rules.guest_new_enabled)} ${rules.guest_monitoring_enabled ? "" : "disabled"}></div>
              <div class="rule"><label>Gäste zur Ruhezeit melden<small>Verbindungen im eingestellten Ruhezeitraum hervorheben</small></label><input type="checkbox" data-rule="guest_quiet_enabled" ${checked(rules.guest_quiet_enabled)} ${rules.guest_monitoring_enabled ? "" : "disabled"}></div>
              <div class="rule"><label>Maximale Gastdauer<small>Nach dieser Anzahl Stunden eine Warnung anzeigen</small></label><input type="number" min="1" max="168" data-rule="guest_max_hours" value="${Number(rules.guest_max_hours)}" ${rules.guest_monitoring_enabled ? "" : "disabled"}></div>
            </section>
            <section class="rule-group danger-zone cleanup-settings">
              <h3>Bereinigung<button class="settings-help-button" type="button" data-settings-help="cleanup" title="Bereinigung erklären" aria-label="Hilfe zur Bereinigung">?</button></h3>
              <div class="rule">
                <label>Offline-Teilnehmer löschen<small>Entfernt alle aktuell offline geführten Geräte einschließlich ihrer gespeicherten Einstellungen.</small></label>
                <button class="cleanup" type="button" title="Alle derzeit offline geführten Geräte sofort entfernen"><ha-icon icon="mdi:broom"></ha-icon>Löschen</button>
              </div>
              <div class="cleanup-result" role="status"></div>
            </section>
            </div>
            <div class="settings-tab-panel rules-panel" role="tabpanel" data-settings-panel="rules" ${this._settingsTab === "rules" ? "" : "hidden"}>
            <section class="rule-group device-settings">
              <h3>Geräteüberwachung<button class="settings-help-button" type="button" data-settings-help="devices" title="Geräteüberwachung erklären" aria-label="Hilfe zu Geräteüberwachung">?</button></h3>
              <div class="rule"><label>Neue Geräte bestätigen<small>Erst nach dieser Online-Zeit warnen (Minuten)</small></label><input type="number" min="1" max="1440" data-rule="new_device_minutes" value="${Number(rules.new_device_minutes)}"></div>
              <div class="rule"><label>Wichtiges Gerät offline<small>Warnung nach Minuten</small></label><input type="number" min="1" max="10080" data-rule="offline_minutes" value="${Number(rules.offline_minutes)}"></div>
            </section>
            <section class="rule-group detection-settings">
              <h3>Ruhezeiten<button class="settings-help-button" type="button" data-settings-help="quiet" title="Ruhezeiten erklären" aria-label="Hilfe zu Ruhezeiten">?</button></h3>
              <div class="rule"><label>Ruhezeit überwachen<small>Aktivierungen in diesem Zeitraum melden</small></label><input type="checkbox" data-rule="quiet_hours_enabled" ${checked(rules.quiet_hours_enabled)}></div>
              <div class="rule"><label>Ruhezeit beginnt</label><input type="time" data-rule="quiet_start" value="${esc(rules.quiet_start)}"></div>
              <div class="rule"><label>Ruhezeit endet</label><input type="time" data-rule="quiet_end" value="${esc(rules.quiet_end)}"></div>
            </section>
            <section class="rule-group alert-rule-settings">
              <h3>Weitere Prüfungen<button class="settings-help-button" type="button" data-settings-help="notifications" title="Prüfungen erklären" aria-label="Hilfe zu weiteren Prüfungen">?</button></h3>
              <div class="rule"><label>Statuswechsel pro Stunde<small>Ab dieser Anzahl als instabil melden</small></label><input type="number" min="2" max="100" data-rule="flap_limit" value="${Number(rules.flap_limit)}"></div>
              <div class="rule"><label>Identitätswechsel melden<small>Andere MAC-Adresse am gleichen IP-Platz</small></label><input type="checkbox" data-rule="identity_changes" ${checked(rules.identity_changes)}></div>
            </section>
            </div>
            <div class="settings-tab-panel notifications-panel" role="tabpanel" data-settings-panel="notifications" ${this._settingsTab === "notifications" ? "" : "hidden"}>
            <section class="rule-group notification-settings">
              <h3>Benachrichtigungen<button class="settings-help-button" type="button" data-settings-help="notifications" title="Benachrichtigungen erklären" aria-label="Hilfe zu Benachrichtigungen">?</button></h3>
              <div class="rule"><label>HA-Glocke<small>Neue Auffälligkeiten als dauerhafte Meldung in Home Assistant anzeigen</small></label><input type="checkbox" data-rule="notify_alerts" ${checked(rules.notify_alerts)}></div>
              <div class="rule"><label>Warnungen senden<small>Normale Warnungen an die ausgewählten Ziele senden</small></label><input type="checkbox" data-rule="notify_warning" ${checked(rules.notify_warning)}></div>
              <div class="rule"><label>Kritische Meldungen senden<small>Kritische Ausfälle an die ausgewählten Ziele senden</small></label><input type="checkbox" data-rule="notify_critical" ${checked(rules.notify_critical)}></div>
              <div class="notify-event-hint"><ha-icon icon="mdi:transit-connection-variant"></ha-icon><span>Für eigene Automationen wird immer das Ereignis <code>nodarion_alert</code> ausgelöst.</span></div>
            </section>
            <section class="rule-group notification-target-settings">
              <h3><span>Benachrichtigungsziele</span><span class="notify-target-count">${selectedNotifyCount} von ${notifyEntities.length} ausgewählt</span></h3>
              <p class="notification-target-description">Companion App, Telegram und andere in Home Assistant eingerichtete Ziele</p>
              <div class="notify-target-section"><div class="notify-target-toolbar"><span class="notify-search-wrap"><ha-icon icon="mdi:magnify"></ha-icon><input class="notify-target-search" type="search" value="${esc(this._notifyTargetQuery)}" placeholder="Ziel durchsuchen …" aria-label="Benachrichtigungsziel durchsuchen"></span><button class="notify-target-action" type="button" data-notify-target-action="all">Alle</button><button class="notify-target-action" type="button" data-notify-target-action="none">Keine</button></div><div class="notify-target-list">${notifyTargetHtml}</div></div>
            </section>
            </div>
            <div class="settings-tab-panel ai-maintenance-panel" role="tabpanel" data-settings-panel="ai-maintenance" ${this._settingsTab === "ai-maintenance" ? "" : "hidden"}>
            <section class="rule-group ai-config-settings">
              <h3>KI-Analyse<button class="settings-help-button" type="button" data-settings-help="ai" title="KI-Analyse erklären" aria-label="Hilfe zur KI-Analyse">?</button></h3>
              <div class="rule"><label>Tägliche KI-Auswertung<small>Automatisch einmal täglich einen Bericht erstellen</small></label><input type="checkbox" data-rule="ai_analysis_enabled" ${checked(rules.ai_analysis_enabled)}></div>
              <div class="rule"><label>KI-Auswertung um<small>Erster Netzwerkscan nach diesem Zeitpunkt</small></label><input type="time" data-rule="ai_analysis_time" value="${esc(rules.ai_analysis_time)}"></div>
              <div class="rule"><label>DNS-Datenschutz<small>Anonymisiert überträgt nur Zähler und stabile, neutrale Domain-IDs</small></label><input type="hidden" data-rule="ai_privacy" value="${esc(rules.ai_privacy)}"><details class="custom-column-filter settings-select"><summary>${rules.ai_privacy === "domains" ? "Domainnamen mitsenden" : "Domains anonymisieren"}</summary><div class="custom-filter-menu"><button type="button" class="custom-filter-option ${rules.ai_privacy === "anonymized" ? "active" : ""}" data-setting-rule="ai_privacy" data-setting-value="anonymized"><ha-icon icon="${rules.ai_privacy === "anonymized" ? "mdi:check" : "mdi:incognito"}"></ha-icon><span>Domains anonymisieren</span></button><button type="button" class="custom-filter-option ${rules.ai_privacy === "domains" ? "active" : ""}" data-setting-rule="ai_privacy" data-setting-value="domains"><ha-icon icon="${rules.ai_privacy === "domains" ? "mdi:check" : "mdi:web"}"></ha-icon><span>Domainnamen mitsenden</span></button></div></details></div>
            </section>
            </div>
          </div>
          <div class="settings-help-backdrop" hidden><section class="settings-help-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-help-title"><div class="settings-help-head"><h2 id="settings-help-title">Hilfe</h2><button class="settings-help-close" type="button" title="Hilfe schließen" aria-label="Hilfe schließen"><ha-icon icon="mdi:close"></ha-icon></button></div><div class="settings-help-copy"></div></section></div>
        </section>
      </div>
      ${presenceHtml}
      </div>`;
  }

  _renderSettings() {
    const panel = this.shadowRoot.querySelector(".settings-view");
    if (!panel) return;
    const watchSettings = this.shadowRoot.querySelector(
      ".watch-view .watch-settings-panel"
    ) || this.shadowRoot.querySelector(
      ".settings-view .watch-settings-panel"
    );
    panel.replaceChildren(...[watchSettings].filter(Boolean));
    if (this._settingsHelp) {
      const modal = panel.querySelector(".settings-help-backdrop");
      if (modal) {
        modal.querySelector("h2").textContent = this._settingsHelp[0];
        modal.querySelector(".settings-help-copy").innerHTML = this._settingsHelp
          .slice(1).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("");
        modal.hidden = false;
      }
    }
  }

  _renderMesh() {
    const panel = this.shadowRoot.querySelector(".mesh-panel");
    const entities = this._entities().filter((entity) => entity.state === "on");
    const groups = new Map();
    entities.forEach((entity) => {
      const accessPoint = entity.attributes.access_point || "Direkt am Router";
      if (!groups.has(accessPoint)) groups.set(accessPoint, []);
      groups.get(accessPoint).push(entity);
    });
    if (!entities.length) {
      panel.innerHTML = `<div class="empty"><ha-icon icon="mdi:access-point-network-off"></ha-icon><strong>Noch keine Mesh-Daten</strong>Nach dem nächsten Scan erscheint hier deine Netzwerktopologie.</div>`;
      return;
    }
    const groupHtml = [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([accessPoint, clients]) => {
        const clientHtml = clients
          .sort((a, b) => (a.attributes.hostname || a.attributes.friendly_name || "").localeCompare(b.attributes.hostname || b.attributes.friendly_name || ""))
          .map((entity) => {
            const attr = entity.attributes;
            const name = attr.hostname || attr.friendly_name || attr.ip_address;
            const connection = [attr.connection_type, attr.wifi_band].filter(Boolean).join(" · ");
            const rateValue = attr.link_rate_mbps ?? attr.link_rate_rx_mbps;
            const rate = rateValue !== null && rateValue !== undefined
              ? `${rateValue} Mbit/s`
              : null;
            const signal = attr.signal_strength_percent !== null && attr.signal_strength_percent !== undefined
              ? `${attr.signal_strength_percent} % Signal`
              : attr.signal_strength_dbm !== null && attr.signal_strength_dbm !== undefined
                ? `${attr.signal_strength_dbm} dBm`
                : null;
            return `<div class="client on" title="${esc(attr.mac_address || "")}">
              <i class="dot"></i><ha-icon icon="${deviceIcon(entity)}"></ha-icon>
              <div class="client-info">
                <div class="client-name">${esc(name)}</div>
                <div class="client-ip">${esc(attr.ip_address || "–")}</div>
                <div class="client-details">
                  ${connection ? `<span class="client-detail">${esc(connection)}</span>` : ""}
                  ${rate ? `<span class="client-detail">${esc(rate)}</span>` : ""}
                  ${signal ? `<span class="client-detail signal">${esc(signal)}</span>` : ""}
                </div>
              </div>
            </div>`;
          }).join("");
        return `<section class="mesh-group" data-access-point="${esc(accessPoint)}">
          <div class="ap-node"><ha-icon icon="mdi:${accessPoint === "Direkt am Router" ? "router-wireless" : "access-point"}"></ha-icon>
            <div><span class="ap-name">${esc(accessPoint)}</span><span class="ap-count">${clients.length} Teilnehmer online</span></div>
          </div>
          <div class="clients">${clientHtml}</div>
        </section>`;
      }).join("");
    panel.innerHTML = `<div class="mesh-head">
      <div><h2>Mesh-Topologie</h2><p>Live-Zuordnung der aktuell erreichbaren Teilnehmer zu Router und Repeatern</p></div>
      <div class="mesh-actions">
        <div class="mesh-legend"><span class="legend-item"><i class="dot"></i> Online</span></div>
        <button class="simulate-mesh" type="button" ${groups.size < 2 ? "disabled" : ""} title="${groups.size < 2 ? "Mindestens zwei Zugangspunkte erforderlich" : "Rein visuelle Demonstration ohne Änderung am Netzwerk"}"><ha-icon icon="mdi:swap-horizontal-bold"></ha-icon>Repeater-Wechsel simulieren</button>
      </div>
    </div>
    <div class="simulation-status"><ha-icon icon="mdi:access-point-sync"></ha-icon><span></span></div>
    <div class="mesh-canvas">
      <div class="internet"><ha-icon icon="mdi:web"></ha-icon> Internet / Heimnetz</div>
      <div class="mesh-groups">${groupHtml}</div>
    </div>`;
  }

  async _simulateMeshHandover(button) {
    const panel = this.shadowRoot.querySelector(".mesh-panel");
    const groups = [...panel.querySelectorAll(".mesh-group")];
    const sourceGroup = groups.find((group) => group.querySelector(".client"));
    const targetGroup = groups.find((group) => group !== sourceGroup);
    const source = sourceGroup?.querySelector(".client");
    const target = targetGroup?.querySelector(".ap-node");
    if (!source || !target) return;

    button.disabled = true;
    const status = panel.querySelector(".simulation-status");
    const deviceName = source.querySelector(".client-name")?.textContent || "Gerät";
    const from = sourceGroup.dataset.accessPoint;
    const to = targetGroup.dataset.accessPoint;
    status.querySelector("span").textContent =
      `${deviceName}: Verbindung wird von „${from}“ zu „${to}“ übergeben …`;
    status.classList.add("visible");
    targetGroup.classList.add("handover-target");

    const panelRect = panel.getBoundingClientRect();
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const ghost = source.cloneNode(true);
    ghost.classList.add("simulation-ghost");
    ghost.style.left = `${sourceRect.left - panelRect.left + panel.scrollLeft}px`;
    ghost.style.top = `${sourceRect.top - panelRect.top + panel.scrollTop}px`;
    ghost.style.width = `${sourceRect.width}px`;
    panel.appendChild(ghost);
    source.style.opacity = ".25";

    const moveX = targetRect.left + targetRect.width / 2
      - (sourceRect.left + sourceRect.width / 2);
    const moveY = targetRect.bottom - sourceRect.top + 18;
    const animation = ghost.animate([
      { transform: "translate(0, 0) scale(1)", opacity: .96 },
      { transform: `translate(${moveX * .48}px, ${moveY * .35}px) scale(.88)`, opacity: .82, offset: .48 },
      { transform: `translate(${moveX}px, ${moveY}px) scale(.72)`, opacity: 0 },
    ], { duration: 2400, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    try {
      await animation.finished;
    } catch (_error) {
      // A panel refresh may cancel the purely visual demonstration.
    }
    ghost.remove();
    source.style.opacity = "";
    targetGroup.classList.remove("handover-target");
    status.querySelector("span").textContent =
      `Simulation abgeschlossen: ${deviceName} ist jetzt mit „${to}“ verbunden.`;
    window.setTimeout(() => {
      status.classList.remove("visible");
      button.disabled = false;
    }, 2200);
  }
}

if (!customElements.get("engelsoft-nodarion-panel")) {
  customElements.define("engelsoft-nodarion-panel", EngelsoftNodarionPanel);
}
