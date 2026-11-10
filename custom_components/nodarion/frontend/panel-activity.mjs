import { esc, blockReason } from "./panel-formatters.mjs?v=1.30.4";
import { activeLocale, t } from "./panel-i18n.mjs?v=1.30.4";

export function renderLog(resetVerticalScroll = false) {
  const list = this.shadowRoot.querySelector(".log-list");
  const previousScrollLeft = list.scrollLeft;
  const previousScrollTop = list.scrollTop;
  const filterSummary = this.shadowRoot.querySelector(".log-filter-summary");
  const filterName = this.shadowRoot.querySelector(".log-filter-name");
  filterSummary.toggleAttribute("hidden", !this._logDeviceFilter);
  filterName.textContent = this._logDeviceFilter
    ? t("Gerät: {0}", this._logDeviceFilter.name)
    : "";
  const icons = {
    online: "mdi:lan-connect",
    offline: "mdi:lan-disconnect",
    renamed: "mdi:rename-box",
    internet_approval_revoked: "mdi:shield-lock-outline",
    internet_approval_granted: "mdi:shield-check-outline",
    inventory_pruned: "mdi:archive-arrow-down-outline",
    device_forgotten: "mdi:delete-forever-outline",
    internet_blocked: "mdi:shield-lock-outline",
    internet_enforcement_failed: "mdi:shield-alert-outline",
    discovered: "mdi:radar",
    mesh_changed: "mdi:access-point-network",
    guest_joined: "mdi:wifi-star",
    guest_left: "mdi:wifi-off",
  };
  const labels = {
    online: "Online",
    offline: "Offline",
    renamed: t("Umbenannt"),
    internet_approval_revoked: t("Freigabe entzogen"),
    internet_approval_granted: t("Freigabe gespeichert"),
    inventory_pruned: t("Archiv bereinigt"),
    device_forgotten: t("Gerät vergessen"),
    internet_blocked: t("Internetzugang gesperrt"),
    internet_enforcement_failed: t("Freigabe fehlgeschlagen"),
    discovered: t("Neu erkannt"),
    mesh_changed: t("Mesh-Wechsel"),
    guest_joined: t("Gast verbunden"),
    guest_left: t("Gast getrennt"),
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
      <td data-label="${t("Zeit")}"><span class="log-time">${esc(time)}</span><span class="log-date">${esc(date)}</span></td>
      <td data-label="${t("Gerät")}"><button class="log-device-filter" type="button" data-key="${esc(item.key)}" data-name="${esc(item.name || item.ip)}" title="${t("Live-Log nach {0} filtern", esc(item.name || item.ip))}"><ha-icon icon="mdi:filter-variant"></ha-icon><span>${esc(item.name || item.ip)}</span></button><div class="log-ip">${esc(item.ip)}</div></td>
      <td data-label="${t("Ereignis")}"><div class="log-event"><span class="log-icon"><ha-icon icon="${icons[item.type] || "mdi:information-outline"}"></ha-icon></span>${esc(labels[item.type] || item.type)}</div></td>
      <td data-label="${t("Dienst")}"><div class="log-device">${esc(item.service || t("Nicht protokolliert"))}</div></td>
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
  const emptyRow = `<tr><td colspan="5"><div class="empty"><ha-icon icon="mdi:text-box-search-outline"></ha-icon><strong>${t("Keine Ereignisse gefunden")}</strong>${t("Filter ändern oder leeren.")}</div></td></tr>`;
  list.innerHTML = `<table class="log-table">
    <thead><tr><th>${t("Zeit ↓")}</th><th>${t("Gerät")}</th><th>${t("Ereignis")}</th><th>${t("Dienst")}</th><th>Details</th></tr>
    <tr class="log-filters"><th>${filterInput("time", t("Datum / Uhrzeit"))}</th><th>${filterInput("device", "Name / IP")}</th><th><details class="custom-column-filter ${this._logFilters.type ? "has-value" : ""}" data-log-filter-key="type"><summary>${esc(selectedType)}</summary><div class="custom-filter-menu">${typeOptions}</div></details></th><th>${filterInput("service", t("Dienst"))}</th><th>${filterInput("details", t("Meldung"))}</th></tr></thead>
    <tbody>${rows || emptyRow}</tbody>
  </table>`;
  list.scrollLeft = previousScrollLeft;
  list.scrollTop = resetVerticalScroll ? 0 : previousScrollTop;
}

export function renderDnsLive() {
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
    policy_prompt: this._dnsPolicyPrompt,
    dns_provider: this._dnsProvider(),
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
    const resultLabel = item.blocked ? t("Blockiert") : t("Erlaubt");
    const resultIcon = item.blocked
      ? "mdi:shield-lock-outline"
      : "mdi:shield-check-outline";
    const rawStatus = String(item.status || "");
    const reason = item.blocked
      ? blockReason(item.reason)
      : rawStatus.toUpperCase() === "NOERROR" ? "OK" : (rawStatus || t("Verarbeitet"));
    const dnsServer = item.dns_server || (item.cached ? "Cache" : item.upstream) || this._dnsProvider().name;
    const answer = (item.answer || []).join(", ") || "–";
    const elapsed = Number(item.elapsed_ms);
    const elapsedFormatted = Number.isFinite(elapsed)
      ? new Intl.NumberFormat(activeLocale(), {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(elapsed)
      : null;
    const hostname = hostnames.get(String(item.client || "")) || t("Nicht erkannt");
    const domain = String(item.domain || "");
    const policyActions = this._hass?.user?.is_admin && domain
      ? item.blocked
        ? `<div class="dns-policy-actions"><button class="dns-policy allow" type="button" data-domain="${esc(domain)}" data-client="${esc(item.client || "")}" data-policy="allow">${t("Freigeben")}</button></div>`
        : `<div class="dns-policy-actions"><button class="dns-policy block" type="button" data-domain="${esc(domain)}" data-policy="block">${t("Blockieren")}</button></div>`
      : "–";
    return `<tr class="dns-row ${item.blocked ? "blocked" : "allowed"}">
      <td data-label="${t("Zeit")}" class="mono">${esc(time)}</td>
      <td data-label="${t("Ergebnis")}"><div class="dns-result"><ha-icon icon="${resultIcon}"></ha-icon>${resultLabel}</div></td>
      <td data-label="${t("Domain / Antwort")}"><div class="dns-domain">${esc(item.domain || "–")}</div><div class="dns-answer" title="${esc(answer)}">${esc(answer)}</div></td>
      <td data-label="Typ"><span class="dns-chip">${esc(item.query_type || "–")}</span></td>
      <td data-label="${t("Client-IP")}" class="mono">${esc(item.client || "–")}</td>
      <td data-label="Hostname">${item.client ? `<button class="dns-host-link" type="button" data-client="${esc(item.client)}" data-name="${esc(hostname)}" title="${t("DNS-Live nach {0} filtern", esc(hostname))}"><ha-icon icon="mdi:filter-variant"></ha-icon><span>${esc(hostname)}</span></button><div class="log-ip">${esc(item.client)}</div>` : esc(hostname)}</td>
      <td data-label="${t("DNS-Server")}"><span class="dns-chip" title="Für diese Anfrage verwendete DNS-Quelle">${esc(dnsServer)}</span></td>
      <td data-label="${t("Grund")}">${esc(reason)}</td>
      <td data-label="${t("Dauer")}" class="mono">${elapsedFormatted ? `${esc(elapsedFormatted)} ms` : "–"}</td>
      <td data-label="${t("Aktion")}">${policyActions}</td>
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
  const adguardStats = [
    ["sensor.nodarion_dns_anfragen", "DNS-Anfragen"],
    ["sensor.nodarion_dns_blockiert", t("Blockiert")],
    ["sensor.nodarion_dns_blockquote", "Blockquote"],
    ["sensor.nodarion_dns_verarbeitungszeit", "Verarbeitungszeit"],
  ].filter(([entityId]) => this._dnsProvider().id !== "pihole" || entityId !== "sensor.nodarion_dns_verarbeitungszeit").map(([entityId, label]) => {
    const entity = this._hass.states[entityId];
    const value = entity && !["unknown", "unavailable"].includes(entity.state)
      ? `${entity.state}${entity.attributes.unit_of_measurement ? ` ${entity.attributes.unit_of_measurement}` : ""}`
      : "–";
    return `<button class="adguard-stat metric-entity-link" type="button" data-entity-id="${entityId}" title="${t("Home-Assistant-Dialog öffnen")}"><span>${label}</span><strong>${esc(value)}</strong></button>`;
  }).join("");
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
    return `<div class="dns-chart-bucket" title="${t("{0} · {1} erlaubt · {2} blockiert", esc(fullTime), allowed, blocked)}">
      <div class="dns-chart-columns">
        <i class="dns-chart-bar allowed" style="height:${allowedHeight}%"></i>
        <i class="dns-chart-bar blocked" style="height:${blockedHeight}%"></i>
      </div>
      <span class="dns-chart-label">${index % 4 === 0 || index === series.length - 1 ? esc(hour) : ""}</span>
    </div>`;
  }).join("");
  const policyPrompt = this._dnsPolicyPrompt;
  const policyModal = policyPrompt ? `
    <div class="dns-policy-modal-backdrop" role="presentation">
      <section class="dns-policy-modal" role="dialog" aria-modal="true" aria-labelledby="dns-policy-title">
        <h3 id="dns-policy-title"><ha-icon icon="mdi:shield-check-outline"></ha-icon>${t("Domain freigeben")}</h3>
        <p>Soll <strong>${esc(policyPrompt.domain)}</strong> ${this._dnsProvider().id === "pihole" ? t("für alle derzeit konfigurierten Pi-hole-Gruppen freigegeben werden?") : t("nur für diesen Client oder für alle Geräte freigegeben werden?")}</p>
        <div class="dns-policy-scope-actions">
          <button class="dns-policy-scope" type="button" data-dns-policy-scope="client" ${this._dnsProvider().id === "pihole" ? "hidden" : ""} ${policyPrompt.client ? "" : "disabled"}><ha-icon icon="mdi:laptop"></ha-icon>${t("Nur dieser Client · {0}", esc(policyPrompt.client || t("unbekannt")))}</button>
          <button class="dns-policy-scope" type="button" data-dns-policy-scope="all"><ha-icon icon="mdi:lan"></ha-icon>${t("Für alle Clients")}</button>
          <button class="dns-policy-scope cancel" type="button" data-dns-policy-scope="cancel">${t("Abbrechen")}</button>
        </div>
      </section>
    </div>` : "";
  content.innerHTML = `
    <div class="dns-head">
      <div><h2><ha-icon icon="mdi:dns-outline"></ha-icon>${esc(this._dnsProvider().name)} DNS-Live</h2><p>${t("Neueste DNS-Anfragen · zuletzt aktualisiert {0} · automatisch alle 3 Sekunden", esc(updated))}</p></div>
      <div class="dns-head-tools">
        <section class="dns-live-stats dns-quick-stats"><h3>${t("Letzte 24 Stunden")}</h3><div class="adguard-stat-grid">${adguardStats}</div></section>
        <div class="dns-actions">
          <button class="dns-action dns-chart-toggle" type="button" title="Stundendiagramm ${this._dnsChartVisible ? "ausblenden" : "einblenden"}"><ha-icon icon="${this._dnsChartVisible ? "mdi:chart-box-outline" : "mdi:chart-box-plus-outline"}"></ha-icon>Diagramm ${this._dnsChartVisible ? "aus" : "an"}</button>
          <button class="dns-action dns-pause" type="button"><ha-icon icon="${this._dnsLivePaused ? "mdi:play" : "mdi:pause"}"></ha-icon>${this._dnsLivePaused ? "Fortsetzen" : "Pause"}</button>
          <button class="dns-action dns-refresh ${this._dnsLiveLoading ? "busy" : ""}" type="button" ${this._dnsLiveLoading ? "disabled" : ""}><ha-icon icon="mdi:refresh"></ha-icon>${t("Aktualisieren")}</button>
        </div>
      </div>
    </div>
    ${this._dnsLive.error ? `<div class="dns-error"><strong>${t("DNS-Log nicht verfügbar:")}</strong> ${esc(this._dnsLive.error)}</div>` : ""}
    ${this._dnsChartVisible ? `<div class="dns-chart">
      <div class="dns-chart-head">
        <span class="dns-chart-title">${t("DNS-Anfragen der letzten {0} Stunden{1}", series.length || 24, this._dnsLive.client ? ` · ${esc(clientLabel)}` : "")}</span>
        <div class="dns-chart-legend">
          <span style="--legend-color:var(--ns-green)"><i></i>${t("{0} erlaubt", allowedTotal)}</span>
          <span style="--legend-color:var(--ns-red)"><i></i>${t("{0} blockiert", blockedTotal)}</span>
        </div>
      </div>
      <div class="dns-chart-bars">${chartBars}</div>
    </div>` : ""}
    <div class="dns-toolbar">
      <input data-dns-filter="domain" value="${esc(this._dnsLiveFilters.domain)}" placeholder="Domain durchsuchen …">
      <details class="custom-column-filter dns-status-select">
        <summary>${this._dnsLiveFilters.status === "allowed" ? t("Nur erlaubt") : this._dnsLiveFilters.status === "blocked" ? t("Nur blockiert") : t("Alle Ergebnisse")}</summary>
        <div class="custom-filter-menu">
          <button type="button" class="custom-filter-option ${this._dnsLiveFilters.status === "all" ? "active" : ""}" data-dns-status="all"><ha-icon icon="${this._dnsLiveFilters.status === "all" ? "mdi:check" : "mdi:format-list-bulleted"}"></ha-icon><span>${t("Alle Ergebnisse")}</span></button>
          <button type="button" class="custom-filter-option ${this._dnsLiveFilters.status === "allowed" ? "active" : ""}" data-dns-status="allowed"><ha-icon icon="${this._dnsLiveFilters.status === "allowed" ? "mdi:check" : "mdi:shield-check-outline"}"></ha-icon><span>${t("Nur erlaubt")}</span></button>
          <button type="button" class="custom-filter-option ${this._dnsLiveFilters.status === "blocked" ? "active" : ""}" data-dns-status="blocked"><ha-icon icon="${this._dnsLiveFilters.status === "blocked" ? "mdi:check" : "mdi:shield-off-outline"}"></ha-icon><span>${t("Nur blockiert")}</span></button>
        </div>
      </details>
      ${this._dnsLive.client ? `<div class="dns-client-filter"><ha-icon icon="mdi:filter-outline"></ha-icon>${esc(clientLabel)}<button class="dns-client-clear" type="button" title="IP-Filter aufheben"><ha-icon icon="mdi:close"></ha-icon></button></div>` : `<div class="dns-client-filter"><ha-icon icon="mdi:earth"></ha-icon>${t("Alle Clients")}</div>`}
    </div>
    <div class="dns-list">
      ${rows ? `<table class="dns-table">
        <thead><tr><th>${t("Zeit")}</th><th>${t("Ergebnis")}</th><th>${t("Domain / Antwort")}</th><th>Typ</th><th>${t("Client-IP")}</th><th>Hostname</th><th>${t("DNS-Server")}</th><th>${t("Grund")}</th><th>${t("Dauer")}</th><th>${t("Aktion")}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>` : `<div class="empty"><ha-icon icon="${this._dnsLiveLoading ? "mdi:progress-clock" : "mdi:dns-outline"}"></ha-icon><strong>${this._dnsLiveLoading ? t("DNS-Anfragen werden geladen") : t("Keine passenden DNS-Anfragen")}</strong>${this._dnsLiveLoading ? "Einen kleinen Moment …" : t("Filter ändern oder auf neue Anfragen warten.")}</div>`}
    </div>
    ${policyModal}`;
}

export function renderAi() {
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
        <strong>${score}</strong><span>${t("von 10")}</span>
        <small>${scoreDelta === null ? t("Erste Bewertung") : scoreDelta > 0 ? t("▲ {0} zum Vortag", scoreDelta) : scoreDelta < 0 ? t("▼ {0} zum Vortag", Math.abs(scoreDelta)) : t("● unverändert")}</small>
      </div>
      <div class="ai-copy">
        <article class="summary"><h3>${t("Zusammenfassung")}</h3><p>${esc(latestReport.summary)}</p></article>
        <article><h3>${t("Auffälligkeiten")}</h3><p>${esc(latestReport.risks)}</p></article>
        <article><h3>${t("Änderungen")}</h3><p>${esc(latestReport.changes)}</p></article>
        <article><h3>${t("Empfehlungen")}</h3><p>${esc(latestReport.recommendations)}</p></article>
        <article><h3>${t("Vertrauen und Datenlage")}</h3><p>${esc(latestReport.confidence)}</p></article>
      </div>
    </div>
    ${history ? `<div class="ai-history" aria-label="Bewertungsverlauf">${history}</div>` : ""}`
    : `<div class="ai-empty">${t("Noch keine KI-Auswertung vorhanden. Aktiviere den täglichen Bericht oder starte die erste Analyse manuell.")}</div>`;
  panel.innerHTML = `
    <section class="ai-panel">
      <div class="ai-head">
        <div><h2><ha-icon icon="mdi:creation-outline"></ha-icon>${t("KI-Netzwerkanalyse")}</h2><p>${t("24-Stunden-Bewertung mit Tagesvergleich · letzter Bericht {0}", esc(reportTime))}</p></div>
        <div class="ai-actions">
          <button class="ai-prompt-toggle" type="button" ${latestReport?.prompt ? "" : "disabled"}><ha-icon icon="mdi:code-json"></ha-icon>${t("Prompt anzeigen")}</button>
          <button class="ai-run ${ai.running ? "busy" : ""}" type="button" ${ai.running ? "disabled" : ""}><ha-icon icon="mdi:creation-outline"></ha-icon>${ai.running ? t("Analyse läuft …") : t("Jetzt analysieren")}</button>
        </div>
      </div>
      ${ai.last_error ? `<div class="ai-error"><strong>${t("Letzte Analyse fehlgeschlagen:")}</strong> ${esc(ai.last_error)}</div>` : ""}
      ${latestReport?.prompt ? `<pre class="ai-prompt" hidden>${esc(latestReport.prompt)}</pre>` : ""}
      ${aiReportHtml}
    </section>`;
}
