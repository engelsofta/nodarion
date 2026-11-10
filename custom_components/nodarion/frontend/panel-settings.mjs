import { esc, formatRemainingDuration } from "./panel-formatters.mjs?v=1.30.5";
import { activeLocale, t, unsavedChanges } from "./panel-i18n.mjs?v=1.30.5";

export function renderWatch() {
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
    ...(this._settingsDraft || {}),
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
    : `<div class="notify-target-empty">${t("Noch kein")} <code>notify.*</code>${t("-Ziel in Home Assistant vorhanden.")}</div>`;
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
    vlan_changed: "mdi:lan-disconnect",
    important_offline: "mdi:lan-disconnect",
    guest_new: "mdi:wifi-star",
    guest_quiet: "mdi:weather-night-partly-cloudy",
    guest_long: "mdi:timer-alert-outline",
  };
  const labels = {
    new_device: t("Unbekanntes Gerät"),
    quiet_activity: t("Aktivität zur Ruhezeit"),
    flapping: t("Instabile Verbindung"),
    identity_changed: t("Identität geändert"),
    vlan_changed: "VLAN gewechselt",
    important_offline: t("Wichtiges Gerät offline"),
    guest_new: t("Neuer Gast"),
    guest_quiet: t("Gast zur Ruhezeit"),
    guest_long: t("Gast lange verbunden"),
  };
  const participantEntities = this._entities();
  const entityIdByKey = new Map(participantEntities.map((entity) => [
    entity.attributes.nodarion_key || `ip_${entity.attributes.ip_address}`,
    entity.entity_id,
  ]));
  const entityByKey = new Map(participantEntities.map((entity) => [
    entity.attributes.nodarion_key || `ip_${entity.attributes.ip_address}`,
    entity,
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
    const alertEntity = entityByKey.get(alert.key);
    const canApprove = active
      && alert.type === "new_device"
      && Boolean(alertEntity?.attributes?.internet_approval_required)
      && !alertEntity?.attributes?.guest_network
      && !alertEntity?.attributes?.vpn_connection;
    const time = new Intl.DateTimeFormat(activeLocale(), {
      dateStyle: "short", timeStyle: "short",
    }).format(new Date(alert.timestamp));
    return `<article class="alert-item ${esc(alert.severity)} ${active ? "" : "resolved"}">
      <div class="alert-symbol"><ha-icon icon="${icons[alert.type] || "mdi:alert-circle-outline"}"></ha-icon></div>
      <div>
        <div class="alert-name">${esc(labels[alert.type] || t("Netzwerkhinweis"))} · ${alertEntityId ? `<button class="watch-entity-link" type="button" data-entity-id="${esc(alertEntityId)}" title="${t("Home-Assistant-Dialog öffnen")}">${esc(alert.name || alert.ip)}</button>` : esc(alert.name || alert.ip)}</div>
        <div class="alert-message">${esc(alert.message)}</div>
        <div class="alert-time">${esc(time)} · ${esc(alert.ip)}${active ? "" : " · Erledigt"}</div>
      </div>
      ${active ? `<div class="alert-actions">${canApprove ? `<button class="alert-action alert-approve" data-key="${esc(alert.key)}" data-name="${esc(alert.name || alert.ip)}">${t("Freigeben")}</button>` : ""}${alertEntityId ? `<button class="alert-action watch-entity-link" data-entity-id="${esc(alertEntityId)}">Details</button>` : ""}${alert.key && !this._monitor.monitored.includes(alert.key) ? `<button class="alert-action alert-monitor" data-key="${esc(alert.key)}">${t("Überwachen")}</button>` : ""}<button class="ack" data-alert-id="${esc(alert.id)}">${t("Erledigen")}</button></div>` : ""}
    </article>`;
  }).join("") : `<div class="empty"><ha-icon icon="mdi:shield-check-outline"></ha-icon><strong>${t("Alles ruhig im Netz")}</strong>${t("Erkannte Auffälligkeiten erscheinen automatisch hier.")}</div>`;

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
        <div class="presence-person"><i class="presence-dot"></i><button class="presence-name watch-entity-link" type="button" data-entity-id="${esc(entity.entity_id)}" title="${t("Home-Assistant-Dialog öffnen")}">${esc(name)}</button><small class="presence-state">${currentHome ? t("Zuhause") : t("Abwesend")}${changed ? ` · seit ${esc(changed)} Uhr` : ""}</small></div>
        <div><div class="presence-timeline" title="${t("Anwesenheit in den letzten 24 Stunden")}">${bars}</div><div class="presence-axis"><span>${t("vor 24 Std.")}</span><span>${t("vor 18 Std.")}</span><span>${t("vor 12 Std.")}</span><span>${t("vor 6 Std.")}</span><span>${t("jetzt")}</span></div></div>
      </div>`;
    }).join("");
  const homeCount = presenceEntities.filter((entity) => entity.state === "on").length;
  const presenceSensorEntity = Object.values(this._hass?.states || {}).find(
    (state) => state.attributes?.nodarion_presence_summary
  ) || this._hass?.states?.["binary_sensor.nodarion_anwesenheit"];
  const presenceSensorOn = presenceSensorEntity
    ? presenceSensorEntity.state === "on"
    : homeCount > 0;
  const presenceSensorButton = rules.presence_sensor_enabled ? `<button class="presence-sensor-link ${presenceSensorOn ? "on" : "off"}" type="button" data-entity-id="${esc(presenceSensorEntity?.entity_id || "binary_sensor.nodarion_anwesenheit")}" title="${t("Home-Assistant-Dialog des Anwesenheitssensors öffnen")}"><ha-icon icon="${presenceSensorOn ? "mdi:home-account" : "mdi:home-outline"}"></ha-icon><span>${t("Anwesenheit: {0}", presenceSensorOn ? t("Anwesend") : t("Abwesend"))}</span></button>` : "";
  const presenceHtml = presenceRows ? `
    <section class="watch-panel presence-overview">
      <div class="watch-heading"><div><h2>${t("Anwesenheit")}</h2><p>${t("Aktueller Zustand und Verlauf der letzten 24 Stunden.")}</p></div>${presenceSensorButton}</div>
      <div class="presence-summary"><ha-icon icon="${homeCount ? "mdi:home-account" : "mdi:home-export-outline"}"></ha-icon><strong>${homeCount ? `${homeCount} von ${presenceEntities.length} zuhause` : t("Niemand zuhause")}</strong><span>${t("· basiert auf den markierten Home-Geräten")}</span></div>
      <div class="presence-list">${presenceRows}</div>
    </section>` : `
    <section class="watch-panel presence-overview">
      ${presenceSensorButton ? `<div class="watch-heading"><div><h2>${t("Anwesenheit")}</h2><p>${t("Der Anwesenheitssensor ist aktiviert.")}</p></div>${presenceSensorButton}</div>` : ""}<div class="empty"><ha-icon icon="mdi:home-plus-outline"></ha-icon><strong>${t("Noch keine Anwesenheitsgeräte")}</strong>${t("Markiere Teilnehmer in der Tabelle mit dem Haus-Symbol.")}</div>
    </section>`;

  const offlineEntities = participantEntities.filter((entity) => entity.state !== "on");
  const offlineKeys = new Set(offlineEntities.map((entity) => entity.attributes.nodarion_key));
  const protectedOffline = [...offlineKeys].filter((key) =>
    this._monitor.monitored.includes(key)
    || this._monitor.presence_devices.includes(key)
    || this._monitor.known_hosts.includes(key)
  ).length;
  const checked = (value) => value ? "checked" : "";
  const segmentRoleLabels = {
    trusted:t("Vertrauenswürdig"),
    restricted:t("Eingeschränkt"),
    guest:t("Gast"),
    isolated:t("Isoliert"),
    infrastructure:t("Infrastruktur"),
  };
  const networkSegments = Array.isArray(rules.network_segments)
    ? rules.network_segments : [];
  const networkSegmentRows = networkSegments.map((segment, index) => {
    const roleOptions = Object.entries(segmentRoleLabels).map(([value, label]) =>
      `<option value="${value}" ${segment.role === value ? "selected" : ""}>${label}</option>`
    ).join("");
    const color = /^#[0-9a-f]{6}$/i.test(String(segment.color || ""))
      ? segment.color : "#58b9d6";
    return `<div class="vlan-row" data-vlan-row data-segment-id="${esc(segment.id || `segment-${index + 1}`)}" style="--vlan-color:${esc(color)}">
      <label class="vlan-field name"><span>Name</span><input type="text" maxlength="48" data-segment-field="name" value="${esc(segment.name || "")}" required></label>
      <label class="vlan-field"><span>VLAN-ID</span><input type="number" min="1" max="4094" data-segment-field="vlan_id" value="${Number(segment.vlan_id || 1)}" required></label>
      <label class="vlan-field network"><span>Subnetz</span><input type="text" data-segment-field="network" value="${esc(segment.network || "")}" placeholder="192.168.20.0/24" required></label>
      <label class="vlan-field"><span>Rolle</span><select data-segment-field="role">${roleOptions}</select></label>
      <label class="vlan-field"><span>Farbe</span><input type="color" data-segment-field="color" value="${esc(color)}"></label>
      <label class="vlan-field monitoring"><span>${t("Überwachung")}</span><input type="checkbox" data-segment-field="monitoring" ${checked(segment.monitoring)}></label>
      <button class="vlan-remove" type="button" data-segment-index="${index}" title="${t("VLAN entfernen")}" aria-label="VLAN ${esc(segment.name || String(segment.vlan_id))} entfernen" ${networkSegments.length <= 1 ? "disabled" : ""}><ha-icon icon="mdi:delete-outline"></ha-icon></button>
    </div>`;
  }).join("");
  const settingsSections = [
    ["general", t("Allgemein")],
    ["devices", t("Geräte")],
    ["rules", t("Überwachung")],
    ["notifications", t("Benachrichtigungen")],
    ["dns", "DNS"],
    ["ai-maintenance", t("KI-Analyse")],
  ];
  const adguardSwitches = (this._dnsProvider().id === "pihole" ? [["switch.nodarion_pihole_gesamtschutz", t("Pi-hole DNS-Schutz"), t("DNS-Blockierung ein- oder ausschalten")]] : [
    ["switch.nodarion_adguard_gesamtschutz", "Gesamtschutz", t("Master-Schalter für sämtliche Schutzfunktionen")],
    ["switch.nodarion_adguard_dns_filterung", "DNS-Filterung", "Blocklisten und eigene Filterregeln anwenden"],
    ["switch.nodarion_adguard_safe_browsing", "Safe Browsing", "Phishing- und Malware-Domains blockieren"],
    ["switch.nodarion_adguard_jugendschutz", t("Jugendschutz"), "Nicht jugendfreie Inhalte blockieren"],
    ["switch.nodarion_adguard_safe_search", "Safe Search", "Sichere Suche bei Suchmaschinen erzwingen"],
    ["switch.nodarion_adguard_query_log", "Query-Log", "Für DNS-Live, Gerätezuordnung und KI erforderlich"],
  ]).map(([entityId, label, note]) => {
    const state = this._hass.states[entityId]?.state;
    return `<button class="adguard-feature ${state === "on" ? "active" : ""}" type="button" data-adguard-switch data-entity-id="${entityId}"><span><strong>${label}</strong><small>${note}</small></span><span class="adguard-feature-state">${state === "on" ? "An" : state === "off" ? t("Aus") : "–"}</span></button>`;
  }).join("");
  const piHoleRules = this._dnsProvider().id === "pihole" ? `
    <section class="rule-group pihole-domain-settings">
      <h3>Pi-hole · Domains</h3>
      <p>${t("Exakte Domains für alle derzeit konfigurierten Pi-hole-Gruppen freigeben oder sperren. Regex-Regeln und Gruppenzuordnungen bleiben in Pi-hole verwaltbar.")}</p>
      <form class="pihole-domain-form"><label>Domain<input name="domain" type="text" required placeholder="example.com" autocomplete="off"></label><label>${t("Aktion")}<select name="policy"><option value="allow">${t("Freigeben")}</option><option value="block">${t("Sperren")}</option></select></label><button type="submit" class="dns-action">${t("Speichern")}</button></form>
      ${this._adguardConfig.error ? `<p role="alert">${esc(this._adguardConfig.error)}</p>` : ""}
      ${this._adguardConfig.loading ? `<p>${t("Domain-Regeln werden geladen …")}</p>` : ""}
      <div class="pihole-domain-list">${(this._adguardConfig.rules || []).map(rule => `<div><span>${rule.startsWith("@@") ? t("Freigegeben") : t("Gesperrt")} · ${esc(rule.replace(/^@@\|\||^\|\|/g, "").replace(/\^$/, ""))}</span><button type="button" class="dns-action" data-pihole-remove="${esc(rule)}" aria-label="${t("Domain-Regel entfernen")}">×</button></div>`).join("")}</div>
      <p>${t("Die Anfragen müssen in Pi-hole einzelnen Clients zugeordnet sein. Datenschutz oder deaktivierte Protokollierung können Details ausblenden. Nicht verfügbare AdGuard-Funktionen werden hier nicht angeboten.")}</p>
    </section>` : "";
  panel.innerHTML = `
    <dl class="security-metrics">
      <div><dt>${t("Aktive Warnungen")}</dt><dd>${Number(summary.active || 0)}</dd></div>
      <div><dt>${t("Kritisch")}</dt><dd>${Number(summary.critical || 0)}</dd></div>
      <div><dt>${t("Unbekannte Geräte")}</dt><dd>${Number(summary.unknown || 0)}</dd></div>
      <div><dt>${t("Instabile Geräte")}</dt><dd>${Number(summary.unstable || 0)}</dd></div>
    </dl>
    <div class="watch-overview-grid">
    <div class="watch-layout alerts-only">
      <section class="watch-panel alerts-panel">
        <div class="watch-heading">
          <div><h2>${t("Warnungen und Auffälligkeiten")}</h2><p>${t("Aktive Hinweise stehen oben, erledigte bleiben als Verlauf erhalten.")}</p></div>
          <div class="learning-actions">
            ${learning.active ? `<span class="learning" title="Endet am ${esc(learningEnd)}"><ha-icon icon="mdi:school-outline"></ha-icon>${t("Lernphase · noch {0}", esc(learningRemaining))}</span>` : `<span class="learning"><ha-icon icon="mdi:school-outline"></ha-icon>${t("Lernphase beendet")}</span>`}
          </div>
        </div>
        <div class="alert-list">${alertHtml}</div>
      </section>
      <section class="watch-panel watch-settings-panel">
        <div class="settings-toolbar">
          <nav class="settings-menu" aria-label="${t("Einstellungsbereiche")}">
            ${settingsSections.map(([key, label]) => `<button type="button" id="settings-menu-${key}" data-settings-section="${key}" aria-controls="settings-panel-${key}" aria-current="${this._settingsTab === key}">${esc(label)}</button>`).join("")}
          </nav>
          <div class="settings-save-area">
            <button class="save-rules save-watch-rules" type="button" ${this._dirtyRules.size ? "" : "disabled"}><ha-icon icon="mdi:content-save-outline"></ha-icon>${t("Alle Einstellungen speichern")}</button>
          </div>
        </div>
        <div class="settings-dirty" role="status" aria-live="polite" ${this._dirtyRules.size ? "" : "hidden"}>
          <span>${unsavedChanges(this._dirtyRules.size)}</span>
          <button class="discard-settings" type="button">${t("Verwerfen")}</button>
        </div>
        <div class="rule-list">
          <div class="settings-tab-panel general-panel" id="settings-panel-general" role="region" aria-labelledby="settings-menu-general" data-settings-panel="general" ${this._settingsTab === "general" ? "" : "hidden"}>
          <section class="rule-group basics">
            <h3>${t("Grundlagen")}<button class="settings-help-button" type="button" data-settings-help="basics" title="${t("Grundlagen erklären")}" aria-label="${t("Hilfe zu Grundlagen")}">?</button></h3>
            <div class="rule"><label>${t("Überwachung aktiv")}<small>${t("Alle Regeln gemeinsam ein- oder ausschalten")}</small></label><input type="checkbox" data-rule="enabled" ${checked(rules.enabled)}></div>
            <div class="learning-card"><strong>${learning.active ? t("Lernphase läuft bis {0}", esc(learningEnd)) : t("Lernphase ist beendet")}</strong><p>${learning.active ? t("Aktuell erkannte Geräte werden automatisch übernommen. Danach müssen neue Geräte wieder geprüft werden.") : t("Neue Geräte werden geprüft und bei aktiviertem Internetschutz zunächst gesperrt.")}</p><div class="learning-actions"><button class="learning-action restart-learning" type="button">${t("Neu beginnen")}</button><button class="learning-action extend-learning" type="button">${t("7 Tage verlängern")}</button>${learning.active ? `<button class="learning-action end-learning" type="button">${t("Jetzt beenden")}</button>` : ""}</div><label class="rule"><span>${t("Dauer bei Neustart")}<small>${t("Maximal 30 Tage")}</small></span><span class="unit-input"><input type="number" min="0" max="30" data-rule="learning_days" value="${Number(rules.learning_days)}"><span>${t("Tage")}</span></span></label></div>
          </section>
          <section class="rule-group vlan-settings">
            <div class="vlan-settings-head"><h3>${t("VLANs und Netzwerksegmente")}</h3><div class="settings-heading-actions"><button class="settings-help-button" type="button" data-settings-help="vlans" title="${t("VLANs und Rollen erklären")}" aria-label="${t("Hilfe zu VLANs und Netzwerksegmenten")}">?</button><button class="vlan-add" type="button"><ha-icon icon="mdi:plus"></ha-icon>${t("VLAN hinzufügen")}</button></div></div>
            <div class="vlan-list">${networkSegmentRows}</div>
            <p class="vlan-empty-note">${t("Subnetze dürfen sich nicht überschneiden. Überwachung aktiviert den Ping/TCP-Scanner und VLAN-Wechselwarnungen für das Segment.")}</p>
          </section>
          </div>
          <div class="settings-tab-panel devices-panel" id="settings-panel-devices" role="region" aria-labelledby="settings-menu-devices" data-settings-panel="devices" ${this._settingsTab === "devices" ? "" : "hidden"}>
          <section class="rule-group onboarding-settings">
            <h3>${t("Neue Geräte")}<button class="settings-help-button" type="button" data-settings-help="onboarding" title="${t("Erkennung neuer Geräte erklären")}" aria-label="${t("Hilfe zur Erkennung neuer Geräte")}">?</button></h3>
            <div class="rule"><label>${t("Neue Geräte automatisch erkennen")}<small>${t("Teilnehmer in einem festgelegten IP-Bereich als neu kennzeichnen")}</small></label><input type="checkbox" data-rule="onboarding_enabled" ${checked(rules.onboarding_enabled)}></div>
            <div class="dependent-settings" data-depends-on="onboarding_enabled" ${rules.onboarding_enabled ? "" : "hidden"}><div class="rule"><label>${t("IP-Bereich aus FRITZ!Box übernehmen")}<small>${t("DHCP-Start und -Ende automatisch abfragen")}</small></label><input type="checkbox" data-rule="onboarding_auto_range" ${checked(rules.onboarding_auto_range)}></div>
            <details class="advanced-settings dependent-settings" data-manual-range ${rules.onboarding_auto_range ? "hidden" : ""}><summary>${t("IP-Bereich manuell festlegen")}</summary><div><div class="rule"><label>${t("Erste IP-Adresse")}</label><input type="text" data-rule="onboarding_start" value="${esc(rules.onboarding_start)}" placeholder="192.168.178.200"></div><div class="rule"><label>${t("Letzte IP-Adresse")}</label><input type="text" data-rule="onboarding_end" value="${esc(rules.onboarding_end)}" placeholder="192.168.178.250"></div></div></details>
            <div class="rule"><label>${t("Automatisch überwachen")}<small>${t("Neue Geräte direkt mit Stern markieren")}</small></label><input type="checkbox" data-rule="onboarding_auto_monitor" ${checked(rules.onboarding_auto_monitor)}></div>
            <div class="rule"><label>${t("Benachrichtigung")}<small>${t("Neue Geräte in Home Assistant melden")}</small></label><input type="checkbox" data-rule="onboarding_notify" ${checked(rules.onboarding_notify)}></div></div>
          </section>
          <section class="rule-group guest-settings">
            <h3>${t("Gastzugang")}<button class="settings-help-button" type="button" data-settings-help="guest" title="${t("Gastzugang erklären")}" aria-label="${t("Hilfe zum Gastzugang")}">?</button></h3>
            <div class="rule"><label>${t("Gastnetz anzeigen und überwachen")}<small>${t("Gastgeräte in Nodarion erfassen, anzeigen und protokollieren")}</small></label><input type="checkbox" data-rule="guest_monitoring_enabled" ${checked(rules.guest_monitoring_enabled)}></div><div class="dependent-settings" data-depends-on="guest_monitoring_enabled" ${rules.guest_monitoring_enabled ? "" : "hidden"}>
            <div class="rule"><label>${t("Neue Gäste melden")}<small>${t("Beim erstmaligen Verbinden mit dem FRITZ!Box-Gastzugang warnen")}</small></label><input type="checkbox" data-rule="guest_new_enabled" ${checked(rules.guest_new_enabled)}></div>
            <div class="rule"><label>${t("Gäste zur Ruhezeit melden")}<small>${t("Verbindungen im eingestellten Ruhezeitraum hervorheben")}</small></label><input type="checkbox" data-rule="guest_quiet_enabled" ${checked(rules.guest_quiet_enabled)}></div>
            <div class="rule"><label>${t("Maximale Gastdauer")}<small>${t("Danach eine Warnung anzeigen")}</small></label><span class="unit-input"><input type="number" min="1" max="168" data-rule="guest_max_hours" value="${Number(rules.guest_max_hours)}"><span>${t("Stunden")}</span></span></div></div>
          </section>
          <section class="rule-group danger-zone cleanup-settings">
            <h3>${t("Bereinigung")}<button class="settings-help-button" type="button" data-settings-help="cleanup" title="${t("Bereinigung erklären")}" aria-label="${t("Hilfe zur Bereinigung")}">?</button></h3>
            <div class="rule">
              <label>${t("Offline-Teilnehmer bereinigen")}<small>${t("Aktuell {0} offline, davon {1} mit Freigabe oder Überwachung.", offlineEntities.length, protectedOffline)}</small></label><div class="cleanup-summary">${t("„Anzeige bereinigen“ behält Freigaben. „Vollständig vergessen“ entfernt zusätzlich Freigaben und Markierungen.")}</div><div class="cleanup-actions"><button class="cleanup preserve" data-forget="false" type="button"><ha-icon icon="mdi:broom"></ha-icon>${t("Anzeige bereinigen")}</button><button class="cleanup" data-forget="true" type="button"><ha-icon icon="mdi:delete-forever-outline"></ha-icon>${t("Vollständig vergessen")}</button></div>
            </div>
            <div class="cleanup-result" role="status"></div>
          </section>
          </div>
          <div class="settings-tab-panel rules-panel" id="settings-panel-rules" role="region" aria-labelledby="settings-menu-rules" data-settings-panel="rules" ${this._settingsTab === "rules" ? "" : "hidden"}>
          <section class="rule-group device-settings">
            <h3>${t("Geräteüberwachung")}<button class="settings-help-button" type="button" data-settings-help="devices" title="${t("Geräteüberwachung erklären")}" aria-label="${t("Hilfe zu Geräteüberwachung")}">?</button></h3>
            <div class="rule"><label>${t("Neue Geräte bestätigen")}<small>${t("Erst nach dieser Online-Zeit warnen")}</small></label><span class="unit-input"><input type="number" min="1" max="1440" data-rule="new_device_minutes" value="${Number(rules.new_device_minutes)}"><span>${t("Minuten")}</span></span></div>
            <div class="rule"><label>${t("Wichtiges Gerät offline")}<small>${t("Danach eine Warnung anzeigen")}</small></label><span class="unit-input"><input type="number" min="1" max="10080" data-rule="offline_minutes" value="${Number(rules.offline_minutes)}"><span>${t("Minuten")}</span></span></div>
          </section>
          <section class="rule-group presence-settings">
            <h3>${t("Anwesenheit")}<button class="settings-help-button" type="button" data-settings-help="presence" title="${t("Anwesenheit erklären")}" aria-label="${t("Hilfe zu Anwesenheit")}">?</button></h3>
            <div class="rule"><label>${t("Anwesenheits-Timeout")}<small>${t("Markierte Geräte gehen sofort online und erst danach offline")}</small></label><span class="unit-input"><input type="number" min="1" max="1440" data-rule="presence_timeout_minutes" value="${Number(rules.presence_timeout_minutes)}"><span>${t("Minuten")}</span></span></div>
            <div class="rule"><label>${t("Anwesenheitssensor")}<small>${t("Binary Sensor &bdquo;Anwesenheit&ldquo; f&uuml;r Automationen aktivieren")}</small></label><input type="checkbox" data-rule="presence_sensor_enabled" ${checked(rules.presence_sensor_enabled)}></div>
          </section>
          <section class="rule-group detection-settings">
            <h3>${t("Ruhezeiten")}<button class="settings-help-button" type="button" data-settings-help="quiet" title="${t("Ruhezeiten erklären")}" aria-label="${t("Hilfe zu Ruhezeiten")}">?</button></h3>
            <div class="rule"><label>${t("Ruhezeit überwachen")}<small>${t("Aktivierungen in diesem Zeitraum melden")}</small></label><input type="checkbox" data-rule="quiet_hours_enabled" ${checked(rules.quiet_hours_enabled)}></div><div class="dependent-settings" data-depends-on="quiet_hours_enabled" ${rules.quiet_hours_enabled ? "" : "hidden"}>
            <div class="rule"><label>${t("Ruhezeit beginnt")}</label><input type="time" data-rule="quiet_start" value="${esc(rules.quiet_start)}"></div>
            <div class="rule"><label>${t("Ruhezeit endet")}</label><input type="time" data-rule="quiet_end" value="${esc(rules.quiet_end)}"></div></div>
          </section>
          <details class="advanced-settings"><summary>${t("Erweiterte Prüfungen")}</summary><section class="rule-group alert-rule-settings">
            <h3>${t("Weitere Prüfungen")}<button class="settings-help-button" type="button" data-settings-help="checks" title="${t("Prüfungen erklären")}" aria-label="${t("Hilfe zu weiteren Prüfungen")}">?</button></h3>
            <div class="rule"><label>${t("Statuswechsel pro Stunde")}<small>${t("Ab dieser Anzahl als instabil melden")}</small></label><span class="unit-input"><input type="number" min="2" max="100" data-rule="flap_limit" value="${Number(rules.flap_limit)}"><span>${t("Wechsel/Std.")}</span></span></div>
            <div class="rule"><label>${t("Identitätswechsel melden")}<small>${t("Andere MAC-Adresse am gleichen IP-Platz")}</small></label><input type="checkbox" data-rule="identity_changes" ${checked(rules.identity_changes)}></div>
          </section></details>
          </div>
          <div class="settings-tab-panel notifications-panel" id="settings-panel-notifications" role="region" aria-labelledby="settings-menu-notifications" data-settings-panel="notifications" ${this._settingsTab === "notifications" ? "" : "hidden"}>
          <section class="rule-group notification-settings">
            <h3>${t("Benachrichtigungen")}<button class="settings-help-button" type="button" data-settings-help="notifications" title="${t("Benachrichtigungen erklären")}" aria-label="${t("Hilfe zu Benachrichtigungen")}">?</button></h3>
            <div class="rule"><label>${t("HA-Glocke")}<small>${t("Neue Auffälligkeiten als dauerhafte Meldung in Home Assistant anzeigen")}</small></label><input type="checkbox" data-rule="notify_alerts" ${checked(rules.notify_alerts)}></div>
            <div class="rule"><label>${t("Warnungen senden")}<small>${t("Normale Warnungen an die ausgewählten Ziele senden")}</small></label><input type="checkbox" data-rule="notify_warning" ${checked(rules.notify_warning)}></div>
            <div class="rule"><label>${t("Kritische Meldungen senden")}<small>${t("Kritische Ausfälle an die ausgewählten Ziele senden")}</small></label><input type="checkbox" data-rule="notify_critical" ${checked(rules.notify_critical)}></div>
            <div class="notify-event-hint"><ha-icon icon="mdi:transit-connection-variant"></ha-icon><span>${t("Für eigene Automationen wird immer das Ereignis")} <code>nodarion_alert</code> ${t("ausgelöst.")}</span></div>
          </section>
          <section class="rule-group notification-target-settings">
            <h3><span>${t("Benachrichtigungsziele")}</span><span class="settings-heading-actions"><span class="notify-target-count">${t("{0} von {1} ausgewählt", selectedNotifyCount, notifyEntities.length)}</span><button class="settings-help-button" type="button" data-settings-help="targets" title="${t("Benachrichtigungsziele erklären")}" aria-label="${t("Hilfe zu Benachrichtigungszielen")}">?</button></span></h3>
            <p class="notification-target-description">${t("Companion App, Telegram und andere in Home Assistant eingerichtete Ziele")}</p>
            <div class="notify-target-section"><div class="notify-target-toolbar"><span class="notify-search-wrap"><ha-icon icon="mdi:magnify"></ha-icon><input class="notify-target-search" type="search" value="${esc(this._notifyTargetQuery)}" placeholder="${t("Ziel durchsuchen …")}" aria-label="${t("Benachrichtigungsziel durchsuchen")}"></span><button class="notify-target-action" type="button" data-notify-target-action="all">${t("Alle")}</button><button class="notify-target-action" type="button" data-notify-target-action="none">${t("Keine")}</button></div><div class="notify-target-list">${notifyTargetHtml}</div></div>
          </section>
          </div>
          <div class="settings-tab-panel dns-settings-panel" id="settings-panel-dns" role="region" aria-labelledby="settings-menu-dns" data-settings-panel="dns" ${this._settingsTab === "dns" ? "" : "hidden"}>
            <section class="rule-group adguard-control-settings"><h3>${t("Schutzfunktionen")}<button class="settings-help-button" type="button" data-settings-help="adguard" title="${t("Schutzfunktionen erklären")}" aria-label="${t("Hilfe zu den DNS-Schutzfunktionen")}">?</button></h3><div class="adguard-feature-list">${adguardSwitches}</div><div class="query-log-warning"><ha-icon icon="mdi:alert-outline"></ha-icon>${this._dnsProvider().id === "pihole" ? t("Protokollierung und Datenschutzstufe werden in Pi-hole eingestellt.") : t("Das Ausschalten des Query-Logs unterbricht DNS-Live und reduziert die Auswertung.")}</div></section>${piHoleRules}
          </div>
          <div class="settings-tab-panel ai-maintenance-panel" id="settings-panel-ai-maintenance" role="region" aria-labelledby="settings-menu-ai-maintenance" data-settings-panel="ai-maintenance" ${this._settingsTab === "ai-maintenance" ? "" : "hidden"}>
          <section class="rule-group ai-config-settings">
            <h3>${t("KI-Analyse")}<button class="settings-help-button" type="button" data-settings-help="ai" title="${t("KI-Analyse erklären")}" aria-label="${t("Hilfe zur KI-Analyse")}">?</button></h3>
            <div class="rule"><label>${t("Tägliche KI-Auswertung")}<small>${t("Automatisch einmal täglich einen Bericht erstellen")}</small></label><input type="checkbox" data-rule="ai_analysis_enabled" ${checked(rules.ai_analysis_enabled)}></div><div class="dependent-settings" data-depends-on="ai_analysis_enabled" ${rules.ai_analysis_enabled ? "" : "hidden"}>
            <div class="rule"><label>${t("KI-Auswertung um")}<small>${t("Erster Netzwerkscan nach diesem Zeitpunkt")}</small></label><input type="time" data-rule="ai_analysis_time" value="${esc(rules.ai_analysis_time)}"></div>
            </div>
            <div class="rule"><label>${t("DNS-Datenschutz")}<small>${t("Anonymisiert überträgt nur Zähler und stabile, neutrale Domain-IDs")}</small></label><input type="hidden" data-rule="ai_privacy" value="${esc(rules.ai_privacy)}"><details class="custom-column-filter settings-select"><summary>${rules.ai_privacy === "domains" ? t("Domainnamen mitsenden") : t("Domains anonymisieren")}</summary><div class="custom-filter-menu"><button type="button" class="custom-filter-option ${rules.ai_privacy === "anonymized" ? "active" : ""}" data-setting-rule="ai_privacy" data-setting-value="anonymized"><ha-icon icon="${rules.ai_privacy === "anonymized" ? "mdi:check" : "mdi:incognito"}"></ha-icon><span>${t("Domains anonymisieren")}</span></button><button type="button" class="custom-filter-option ${rules.ai_privacy === "domains" ? "active" : ""}" data-setting-rule="ai_privacy" data-setting-value="domains"><ha-icon icon="${rules.ai_privacy === "domains" ? "mdi:check" : "mdi:web"}"></ha-icon><span>${t("Domainnamen mitsenden")}</span></button></div></details></div>
          </section>
          </div>
        </div>
        <div class="settings-help-backdrop" hidden><section class="settings-help-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-help-title"><div class="settings-help-head"><h2 id="settings-help-title">${t("Hilfe")}</h2><button class="settings-help-close" type="button" title="${t("Hilfe schließen")}" aria-label="${t("Hilfe schließen")}"><ha-icon icon="mdi:close"></ha-icon></button></div><div class="settings-help-copy"></div></section></div>
      </section>
    </div>
    ${presenceHtml}
    </div>`;
}

export function renderSettings() {
  const panel = this.shadowRoot.querySelector(".settings-view");
  if (!panel) return;
  const focusedSection = this.shadowRoot.activeElement?.closest(".settings-menu button");
  const watchSettings = this.shadowRoot.querySelector(
    ".watch-view .watch-settings-panel"
  ) || this.shadowRoot.querySelector(
    ".settings-view .watch-settings-panel"
  );
  panel.replaceChildren(...[watchSettings].filter(Boolean));
  if (focusedSection) {
    panel.querySelector('[data-settings-section][aria-current="true"]')?.focus({ preventScroll: true });
  }
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
