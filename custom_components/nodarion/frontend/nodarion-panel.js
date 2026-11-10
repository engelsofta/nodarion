import { esc, onboardingStatus, formatLease, formatStateChanged } from "./panel-formatters.mjs?v=1.30.3";
import { renderWatch, renderSettings } from "./panel-settings.mjs?v=1.30.3";
import { renderLog, renderDnsLive, renderAi } from "./panel-activity.mjs?v=1.30.3";
import { renderCards } from "./panel-devices.mjs?v=1.30.3";
import { panelStyles } from "./panel-styles.mjs?v=1.30.3";
import { NodarionStateClient } from "./nodarion-state.mjs?v=1.30.3";
import { activeLocale, panelLocale, setPanelLocale, t, unsavedChanges } from "./panel-i18n.mjs?v=1.30.3";

class EngelsoftNodarionPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._columnFilters = {};
    this._mobileOverviewExpanded = false;
    this._mobileFiltersExpanded = false;
    this._expandedDevices = new Set();
    this._columnVisibility = this._loadColumnVisibility();
    this._sort = "ip";
    this._sortDirection = "asc";
    this._logDeviceFilter = null;
    this._logFilters = { time: "", device: "", type: "", service: "", details: "" };
    this._settingsHelp = null;
    this._settingsTab = this._loadSettingsTab();
    this._settingsReturnTab = "participants";
    this._notifyTargetQuery = "";
    this._notifyTargetsDirty = false;
    this._settingsDraft = null;
    this._dirtyRules = new Set();
    this._openSettingsDetails = new Set();
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
    this._adguardConfig = { filters: [], rules: [], rewrites: [], loading: false, error: null };
    this._dnsPolicyPrompt = null;
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
    this._stateClient = null;
    this._stateConnection = null;
    this._edgeSwipe = null;
    this._onEdgeTouchStart = (event) => {
      const touch = event.touches?.[0];
      if (!touch || touch.clientX > 24 || (!this.hasAttribute("narrow") && window.innerWidth > 800)) {
        this._edgeSwipe = null;
        return;
      }
      this._edgeSwipe = { x: touch.clientX, y: touch.clientY, opened: false };
    };
    this._onEdgeTouchMove = (event) => {
      const touch = event.touches?.[0];
      if (!touch || !this._edgeSwipe || this._edgeSwipe.opened) return;
      const deltaX = touch.clientX - this._edgeSwipe.x;
      const deltaY = Math.abs(touch.clientY - this._edgeSwipe.y);
      if (deltaX >= 72 && deltaY <= 48) {
        this._edgeSwipe.opened = true;
        this._toggleHomeAssistantMenu();
      }
    };
    this._onEdgeTouchEnd = () => { this._edgeSwipe = null; };
  }

  connectedCallback() {
    this.addEventListener("touchstart", this._onEdgeTouchStart, { passive: true });
    this.addEventListener("touchmove", this._onEdgeTouchMove, { passive: true });
    this.addEventListener("touchend", this._onEdgeTouchEnd, { passive: true });
    this.addEventListener("touchcancel", this._onEdgeTouchEnd, { passive: true });
  }

  disconnectedCallback() {
    this._stateClient?.stop();
    this._stateClient = null;
    this._stateConnection = null;
    window.clearTimeout(this._dnsLiveTimer);
    this.removeEventListener("touchstart", this._onEdgeTouchStart);
    this.removeEventListener("touchmove", this._onEdgeTouchMove);
    this.removeEventListener("touchend", this._onEdgeTouchEnd);
    this.removeEventListener("touchcancel", this._onEdgeTouchEnd);
  }

  _toggleHomeAssistantMenu() {
    this.dispatchEvent(new CustomEvent("hass-toggle-menu", {
      bubbles: true,
      composed: true,
    }));
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
      return ["general", "devices", "rules", "notifications", "dns", "ai-maintenance"].includes(tab)
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
    if (value?.connection && value.connection !== this._stateConnection) {
      this._stateClient?.stop();
      this._stateConnection = value.connection;
      this._stateClient = new NodarionStateClient(value, (state, changed) => {
        this._monitor = state;
        this._lastMonitorLoad = Date.now();
        this._render(changed);
      });
      this._stateClient.start();
    }
    const nextLocale = String(value?.language || "en").toLowerCase().startsWith("de") ? "de" : "en";
    const languageChanged = nextLocale !== panelLocale;
    if (languageChanged) {
      setPanelLocale(nextLocale);
      this._dnsRenderedSignature = null;
      this._built = false;
    }
    if (!this._built) this._build();
    const darkMode = value?.themes?.darkMode;
    this.dataset.theme = darkMode === undefined
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : (darkMode ? "dark" : "light");
    // The coordinator subscription carries attribute changes. HA state updates
    // only need a compact identity/state signature, avoiding JSON serialization
    // of every device on every global Home Assistant update.
    const signature = this._entities()
      .map((entity) => `${entity.entity_id}:${entity.state}:${entity.last_changed}`)
      .join("|");
    if (languageChanged || signature !== this._lastSignature) {
      this._lastSignature = signature;
      this._render(languageChanged ? null : new Set(["participants"]));
    }
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
      if (!this._stateClient) return;
      await this._stateClient.refresh();
    } catch (_error) {
      // The integration may briefly be unavailable while Home Assistant reloads.
    } finally {
      this._lastMonitorLoad = Date.now();
      this._monitorLoading = false;
    }
  }

  async _setMonitor(key, monitored, notify, presence) {
    try {
      await this._stateClient.mutate({ key, monitored, notify, presence });
    } catch (_error) {
      // A later state update retries loading the saved settings.
    }
  }

  async _monitorAction(payload) {
    try {
      await this._stateClient.mutate(payload);
    } catch (_error) {
      // The next state refresh retries the request.
    }
  }

  _captureSettingsDraft(settingsView) {
    const rules = {};
    settingsView.querySelectorAll(".watch-settings-panel [data-rule]").forEach((input) => {
      rules[input.dataset.rule] = input.type === "checkbox"
        ? input.checked
        : input.type === "number" ? Number(input.value) : input.value;
    });
    rules.notify_targets = [...settingsView.querySelectorAll(
      ".watch-settings-panel [data-notify-target]:checked"
    )].map((input) => input.dataset.notifyTarget);
    rules.network_segments = [...settingsView.querySelectorAll("[data-vlan-row]")]
      .map((row) => {
        const value = (field) => row.querySelector(`[data-segment-field="${field}"]`);
        return {
          id: row.dataset.segmentId,
          name: value("name")?.value || "",
          vlan_id: Number(value("vlan_id")?.value),
          network: value("network")?.value || "",
          role: value("role")?.value || "trusted",
          color: value("color")?.value || "#58b9d6",
          monitoring: Boolean(value("monitoring")?.checked),
        };
      });
    this._settingsDraft = rules;
  }

  _updateSettingsDirtyUi(settingsView) {
    const dirty = settingsView.querySelector(".settings-dirty");
    const save = settingsView.querySelector(".save-watch-rules");
    if (dirty) {
      dirty.hidden = this._dirtyRules.size === 0;
      const label = dirty.querySelector("span");
      if (label) label.textContent = unsavedChanges(this._dirtyRules.size);
    }
    if (save) save.disabled = this._dirtyRules.size === 0;
  }

  _confirm({ title, message, confirmLabel = t("Bestätigen"), danger = false, showCancel = true }) {
    const host = this.shadowRoot.querySelector(".confirm-host");
    if (!host) return Promise.resolve(false);
    return new Promise((resolve) => {
      const previousFocus = this.shadowRoot.activeElement;
      const close = (accepted) => {
        host.replaceChildren();
        previousFocus?.focus?.();
        resolve(accepted);
      };
      host.innerHTML = `<div class="confirm-backdrop"><section class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message"><div class="confirm-icon ${danger ? "danger" : ""}"><ha-icon icon="${danger ? "mdi:alert-outline" : "mdi:help-circle-outline"}"></ha-icon></div><h2 id="confirm-title">${esc(title)}</h2><p id="confirm-message">${esc(message)}</p><div class="confirm-actions">${showCancel ? `<button class="confirm-cancel" type="button">${t("Abbrechen")}</button>` : ""}<button class="confirm-accept ${danger ? "danger" : ""}" type="button">${esc(confirmLabel)}</button></div></section></div>`;
      const backdrop = host.querySelector(".confirm-backdrop");
      const keyHandler = (event) => {
        if (event.key === "Escape") close(false);
        if (event.key === "Tab") {
          const buttons = [...host.querySelectorAll("button")];
          const index = buttons.indexOf(this.shadowRoot.activeElement);
          if (event.shiftKey && index <= 0) { event.preventDefault(); buttons.at(-1)?.focus(); }
          if (!event.shiftKey && index === buttons.length - 1) { event.preventDefault(); buttons[0]?.focus(); }
        }
      };
      backdrop.addEventListener("keydown", keyHandler);
      backdrop.addEventListener("click", (event) => {
        if (event.target.closest(".confirm-accept")) close(true);
        else if (event.target.closest(".confirm-cancel") || event.target === backdrop) close(false);
      });
      (host.querySelector(".confirm-cancel") || host.querySelector(".confirm-accept"))?.focus();
    });
  }

  async _saveRuleSettings(button, rules, kind) {
    const selector = ".save-watch-rules";
    const defaultLabel = t("Alle Einstellungen speichern");
    const defaultContent = `<ha-icon icon="mdi:content-save-outline"></ha-icon>${defaultLabel}`;
    button.disabled = true;
    button.classList.remove("saved", "failed");
    button.classList.add("busy");
    button.innerHTML = `<ha-icon icon="mdi:loading"></ha-icon>${t("Speichert …")}`;
    try {
      await this._stateClient.mutate({ action: "set_rules", rules });
      this._notifyTargetsDirty = false;
      this._settingsDraft = null;
      this._dirtyRules.clear();
      const savedButton = this.shadowRoot.querySelector(selector);
      if (!savedButton) return;
      savedButton.disabled = true;
      savedButton.classList.add("saved");
      savedButton.innerHTML = `<ha-icon icon="mdi:check"></ha-icon>${t("Gespeichert")}`;
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
      button.innerHTML = `<ha-icon icon="mdi:alert-circle-outline"></ha-icon>${t("Speichern fehlgeschlagen")}`;
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
      await this._stateClient.mutate({
        action: "run_ai_analysis", language: panelLocale,
      });
    } catch (error) {
      this._monitor.ai_analysis = {
        ...(this._monitor.ai_analysis || {}),
        last_error: error?.message || t("KI-Analyse fehlgeschlagen"),
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

  _openSettings(section = "general", returnTab = null) {
    const allowed = ["general", "devices", "rules", "notifications", "dns", "ai-maintenance"];
    this._settingsTab = allowed.includes(section) ? section : "general";
    if (returnTab) {
      this._settingsReturnTab = returnTab;
    } else if (this._activeTab !== "settings") {
      this._settingsReturnTab = this._activeTab;
    }
    this._saveSettingsTab();
    this._renderWatch();
    this._navigateTo("settings");
    if (this._settingsTab === "dns" && this._hass?.user?.is_admin) {
      this._loadAdguardConfig();
    }
  }

  async _toggleAdguardSwitch(button) {
    const entityId = button.dataset.entityId;
    const state = this._hass.states[entityId]?.state;
    const turnOff = state === "on";
    if (turnOff && entityId.endsWith("_query_log")) {
      const confirmed = await this._confirm({
        title: "Query-Log ausschalten?",
        message: "Ohne Query-Log fehlen DNS-Live, Gerätezuordnung und Teile der KI-Auswertung.",
        confirmLabel: "Trotzdem ausschalten",
        danger: true,
      });
      if (!confirmed) return;
    }
    button.disabled = true;
    try {
      await this._hass.callService("switch", turnOff ? "turn_off" : "turn_on", { entity_id: entityId });
      await this._hass.callService("homeassistant", "update_entity", { entity_id: entityId });
    } finally {
      button.disabled = false;
    }
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

  _dnsProvider() {
    return this._monitor?.dns_provider || { id:"adguard", name:"AdGuard Home", capabilities:["client_policy"] };
  }

  async _loadAdguardConfig() {
    if (!this._hass?.user?.is_admin || this._adguardConfig.loading) return;
    this._adguardConfig.loading = true;
    try {
      const result = await this._hass.callApi(
        "GET", "nodarion/monitor?view=adguard_config"
      );
      this._adguardConfig = {
        provider: result.provider,
        capabilities: result.capabilities || [],
        filters: result.filters || [],
        rules: result.rules || [],
        rewrites: result.rewrites || [],
        loading: false,
        error: null,
      };
    } catch (error) {
      this._adguardConfig = {
        ...this._adguardConfig,
        loading: false,
        error: error?.message || "DNS-Konfiguration ist nicht erreichbar.",
      };
    }
    this._dnsRenderedSignature = "";
    this._renderDnsLive();
    if (this._activeTab === "settings" && this._settingsTab === "dns") {
      this._renderWatch();
      this._renderSettings();
    }
  }

  async _adguardAction(payload, confirmation = null) {
    if (confirmation && !await this._confirm({ title:t("Änderung bestätigen"), message:confirmation, confirmLabel:t("Ausführen"), danger:true })) return;
    if (this._activeTab === "dns") this._dnsLivePaused = true;
    try {
      const result = await this._hass.callApi(
        "POST", "nodarion/monitor", payload
      );
      this._adguardConfig = {
        provider: result.provider,
        capabilities: result.capabilities || [],
        filters: result.filters || [],
        rules: result.rules || [],
        rewrites: result.rewrites || [],
        loading: false,
        error: null,
      };
      this._dnsRenderedSignature = "";
      this._renderDnsLive();
      if (this._activeTab === "settings" && this._settingsTab === "dns") {
        this._renderWatch();
        this._renderSettings();
      }
    } catch (error) {
      await this._confirm({ title:t("Änderung fehlgeschlagen"), message:error?.message || t("DNS-Änderung fehlgeschlagen."), confirmLabel:t("Schließen"), danger:true, showCancel:false });
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
      const message = error?.message || t("DNS-Anbieter ist nicht erreichbar.");
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
    const navigation = [
      ["participants", "mdi:devices", t("Geräte")],
      ["log", "mdi:text-box-search-outline", t("Ereignisse")],
      ["dns", "mdi:shield-check-outline", "DNS"],
      ["ai", "mdi:chart-line", t("Analyse")],
      ["watch", "mdi:eye-outline", t("Überwachung")],
      ["settings", "mdi:cog-outline", t("Allgemeine Einstellungen öffnen")],
    ];
    this.shadowRoot.innerHTML = `
      <style>${panelStyles}</style>
      <div class="shell">
        <nav class="panel-navigation" aria-label="${t("Nodarion-Ansichten")}">
          ${navigation.map(([tab, icon, label]) => `
            <button type="button" data-nav-tab="${tab}" title="${esc(label)}" aria-label="${esc(label)}">
              <ha-icon icon="${icon}" aria-hidden="true"></ha-icon>
            </button>`).join("")}
        </nav>
        <div class="panel-content">
          <header>
            <div class="brand">
              <button class="ha-menu" type="button" title="${t("Home-Assistant-Menü öffnen")}" aria-label="${t("Home-Assistant-Menü öffnen")}"><ha-icon icon="mdi:menu"></ha-icon></button>
              <span class="logo"><img src="/engelsoft_nodarion_icon.png" alt=""></span>
              <div>
                <div class="eyebrow">Engelsoft</div>
                <h1>Nodarion</h1>
              </div>
            </div>
            <div class="header-actions">
              <button class="header-action connection-status" type="button" title="${t("Verbindungsdetails anzeigen")}"><ha-icon icon="mdi:lan-connect"></ha-icon><span>${t("Verbindungen werden geladen")}</span><ha-icon icon="mdi:chevron-down"></ha-icon></button>
            </div>
          </header>
          <section class="connection-panel" hidden></section>
          <section class="metrics"></section>
          <section class="tab-view" data-view="participants">
            <button class="column-picker-button table-column-picker" type="button" title="Tabellenspalten auswählen" aria-label="Tabellenspalten auswählen"><ha-icon icon="mdi:checkbox-multiple-marked-outline"></ha-icon></button>
            <div class="column-picker" hidden></div>
            <section class="table-panel device-list"></section>
          </section>
          <section class="tab-view" data-view="log" hidden>
            <section class="log-panel">
              <div class="log-title">
                <div class="log-heading"><strong>${t("Live-Log")}</strong><span class="log-filter-summary" hidden><span class="log-filter-name"></span><button class="log-clear" title="Gerätefilter aufheben"><ha-icon icon="mdi:close"></ha-icon></button></span></div>
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
        </div>
      </div><div class="guest-modal-host"></div><div class="confirm-host"></div>`;

    this.shadowRoot.querySelector(".ha-menu").addEventListener("click", () =>
      this._toggleHomeAssistantMenu()
    );
    this.shadowRoot.querySelector(".connection-status").addEventListener("click", () => {
      this._connectionsExpanded = !this._connectionsExpanded;
      this._renderConnections();
    });
    this.shadowRoot.querySelector(".metrics").addEventListener("click", (event) => {
      if (event.target.closest(".mobile-overview-toggle")) {
        this._mobileOverviewExpanded = !this._mobileOverviewExpanded;
        const metrics = this.shadowRoot.querySelector(".metrics");
        metrics.classList.toggle("overview-expanded", this._mobileOverviewExpanded);
        metrics.querySelector(".mobile-overview-toggle").setAttribute("aria-expanded", String(this._mobileOverviewExpanded));
        return;
      }
      const settingsLink = event.target.closest(".metric-settings");
      if (settingsLink) {
        this._openSettings(settingsLink.dataset.settingsSection, settingsLink.dataset.returnTab);
        return;
      }
      const entityIdLink = event.target.closest(".metric-entity-link");
      if (entityIdLink) {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          bubbles: true,
          composed: true,
          detail: { entityId: entityIdLink.dataset.entityId },
        }));
        return;
      }
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
      if (event.target.closest("[data-open-watch]")) this._navigateTo("watch");
    });
    this.shadowRoot.querySelector(".panel-navigation").addEventListener("click", (event) => {
      const button = event.target.closest("[data-nav-tab]");
      if (!button) return;
      const tab = button.dataset.navTab;
      if (tab === "settings") this._openSettings("general");
      else this._navigateTo(tab);
    });
    this._showTab(this._activeTab);
    this.shadowRoot.querySelector(".device-list").addEventListener("click", (event) => {
      if (event.target.closest(".mobile-filter-toggle")) {
        this._mobileFiltersExpanded = !this._mobileFiltersExpanded;
        this._renderCards();
        this.shadowRoot.querySelector(".mobile-filter-toggle")?.focus({ preventScroll: true });
        return;
      }
      const clearFilter = event.target.closest("[data-clear-column-filter]");
      if (clearFilter) {
        delete this._columnFilters[clearFilter.dataset.clearColumnFilter];
        this._renderCards();
        return;
      }
      if (event.target.closest("[data-clear-all-filters]")) {
        this._columnFilters = {};
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
      const approveInternet = event.target.closest(".approve-internet, .block-internet");
      if (approveInternet) {
        this._approveInternet(approveInternet);
        return;
      }
      const dnsLink = event.target.closest(".dns-live-link");
      if (dnsLink) {
        this._openDnsLive(dnsLink.dataset.ip, dnsLink.dataset.name);
        return;
      }
      const mobileDetails = event.target.closest(".mobile-details");
      if (mobileDetails) {
        const row = mobileDetails.closest("tr");
        const key = mobileDetails.dataset.device;
        const expanded = !this._expandedDevices.has(key);
        if (expanded) this._expandedDevices.add(key);
        else this._expandedDevices.delete(key);
        row.classList.toggle("mobile-expanded", expanded);
        mobileDetails.setAttribute("aria-expanded", String(expanded));
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
      if (event.target.closest(".guest-toggle")) {
        this._toggleGuest();
        return;
      }
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
      const mobile = Boolean(input.closest(".mobile-device-controls"));
      this._renderCards();
      const replacement = this.shadowRoot.querySelector(
        `${mobile ? ".mobile-device-controls " : "table "}[data-column-filter="${key}"]`
      );
      replacement?.focus({ preventScroll: true });
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
      if (event.target.closest(".dns-toolbar")) this._dnsControlsActive = true;
    });
    dnsContent.addEventListener("focusout", () => {
      window.setTimeout(() => {
        const active = this.shadowRoot.activeElement;
        this._dnsControlsActive = Boolean(
          active?.closest?.(".dns-toolbar")
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
    dnsContent.addEventListener("click", (event) => {
      const entityLink = event.target.closest(".metric-entity-link");
      if (entityLink) {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          bubbles:true,
          composed:true,
          detail:{ entityId:entityLink.dataset.entityId },
        }));
        return;
      }
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
      if (event.target.closest(".dns-chart-toggle")) {
        this._dnsChartVisible = !this._dnsChartVisible;
        this._dnsRenderedSignature = "";
        this._renderDnsLive();
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
          this.shadowRoot.querySelector(this._dnsProvider().id === 'pihole' ? '[data-dns-policy-scope="all"]' : '[data-dns-policy-scope="client"]')?.focus();
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
    this.shadowRoot.querySelector(".device-list").addEventListener("scroll", () => {
      this.shadowRoot.querySelectorAll(".device-gui-menu:popover-open").forEach(menu => menu.hidePopover());
    }, { passive:true });
    this.shadowRoot.addEventListener("submit", event => {
      if (!event.target.matches(".pihole-domain-form")) return;
      event.preventDefault();
      const form = new FormData(event.target);
      this._adguardAction({ action:"adguard_set_domain_policy", domain:String(form.get("domain") || "").trim(), policy:form.get("policy") }, t("Domain-Regel für alle derzeit konfigurierten Pi-hole-Gruppen speichern? Beim Sperren wird eine vorhandene exakte Freigabe dieser Domain entfernt."));
    });
    this.shadowRoot.addEventListener("click", (event) => {
      const guiButton = event.target.closest(".device-gui-button");
      if (guiButton) {
        const menu = this.shadowRoot.getElementById(guiButton.getAttribute("popovertarget"));
        const rect = guiButton.getBoundingClientRect();
        const menuHeight = menu.querySelectorAll("a").length * 38 + 14;
        menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 198))}px`;
        menu.style.top = `${rect.bottom + menuHeight < window.innerHeight - 8 ? rect.bottom + 5 : Math.max(8, rect.top - menuHeight - 5)}px`;
      }
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
      if (event.target.closest(".extend-learning")) {
        this._monitorAction({ action: "extend_learning" });
        return;
      }
      if (event.target.closest(".end-learning")) {
        this._confirm({ title:t("Lernphase beenden"), message:t("Neue Geräte werden danach wieder geprüft."), confirmLabel:t("Jetzt beenden") }).then((confirmed) => {
          if (confirmed) {
          this._monitorAction({ action: "end_learning" });
          }
        });
        return;
      }
      const alertMonitor = event.target.closest(".alert-monitor");
      if (alertMonitor) {
        const key = alertMonitor.dataset.key;
        this._monitorAction({
          key,
          monitored: true,
          notify: this._monitor.notifications.includes(key),
          presence: this._monitor.presence_devices.includes(key),
        });
        return;
      }
      const alertApprove = event.target.closest(".alert-approve");
      if (alertApprove) {
        this._approveInternet(alertApprove);
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
        button.innerHTML = `<ha-icon icon="${open ? "mdi:eye-off-outline" : "mdi:code-json"}"></ha-icon>${open ? t("Prompt ausblenden") : t("Prompt anzeigen")}`;
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
      if (event.target.closest(".settings-back")) {
        this._navigateTo(this._settingsReturnTab || "participants");
        return;
      }
      const removePiHoleRule = event.target.closest("[data-pihole-remove]");
      if (removePiHoleRule) {
        this._adguardAction({ action:"adguard_delete_rule", rule:removePiHoleRule.dataset.piholeRemove }, t("Diese Pi-hole-Domain-Regel wirklich entfernen?"));
        return;
      }
      const adguardSwitch = event.target.closest("[data-adguard-switch]");
      if (adguardSwitch) {
        this._toggleAdguardSwitch(adguardSwitch);
        return;
      }
      const adguardEntity = event.target.closest(".adguard-stat[data-entity-id]");
      if (adguardEntity) {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          bubbles: true, composed: true,
          detail: { entityId: adguardEntity.dataset.entityId },
        }));
        return;
      }
      const helpButton = event.target.closest("[data-settings-help]");
      if (helpButton) {
        const help = {
          basics:[t("Grundlagen"), t("Mit Überwachung aktiv werden sämtliche Warn- und Prüfregeln gemeinsam geschaltet. Die Erkennung und Anzeige der Teilnehmer läuft unabhängig davon weiter."), t("Die Lernphase behandelt bereits vorhandene Teilnehmer vorübergehend als bekannt. Neue Warnungen greifen nach Ablauf der eingestellten Tage.")],
          vlans:[t("VLANs und Netzwerksegmente"), t("Jeder Eintrag ordnet ein IPv4-Subnetz einem Namen, einer VLAN-ID und einer Farbe zu. Die VLAN-Farbe erscheint am rechten Rand der Gerätetabelle; interne Kennzeichnungen wie Gastnetz oder Einrichtungsbereich bleiben links."), t("Vertrauenswürdig steht für normale interne Geräte. Eingeschränkt ist für IoT- oder begrenzte Netze gedacht. Gast nimmt Teilnehmer von der regulären Internet-Freigabeprüfung aus. Isoliert stuft einen Wechsel in dieses Segment als kritisch ein. Infrastruktur schützt Router, Switches und Access Points vor der normalen Gerätesperre."), t("Überwachung aktiviert den Ping-/TCP-Scanner und VLAN-Wechselwarnungen für dieses Subnetz. Deaktivierte Segmente bleiben zugeordnet und sichtbar, werden aber nicht aktiv durch den Segmentscanner geprüft. Subnetze dürfen sich nicht überschneiden.")],
          presence:[t("Anwesenheit"), t("Haus-markierte Geräte melden sich sofort als anwesend. Erst wenn ein Gerät länger als das Anwesenheits-Timeout nicht erreichbar ist, gilt es als abwesend."), t("Der optionale Home-Assistant-Binary-Sensor ist aktiv, sobald mindestens eines dieser Geräte zuhause ist. Er eignet sich beispielsweise für Licht-, Heizungs- oder Alarm-Automationen.")],
          devices:[t("Geräteüberwachung"), t("Neue Geräte werden erst nach der Bestätigungszeit gemeldet. Kurze oder fehlerhafte Erkennungen lösen dadurch nicht sofort eine Warnung aus."), t("Für Geräte mit Stern gilt die Offline-Frist. Nach deren Ablauf erscheint eine Warnung, sofern das Gerät weiterhin nicht erreichbar ist.")],
          onboarding:[t("Neue Geräte"), t("Der Bereich für neue Geräte kennzeichnet Teilnehmer im angegebenen DHCP-Adressbereich als neu. Adressen außerhalb dieses Bereichs erscheinen als regulärer Bereich."), t("Bei automatischer Übernahme liest Nodarion Start und Ende direkt aus der FRITZ!Box. Optional können neue Geräte sofort überwacht oder zusätzlich in Home Assistant gemeldet werden.")],
          guest:[t("Gastzugang"), t("Ist die Gastnetzüberwachung aktiv, übernimmt Nodarion Teilnehmer aus dem FRITZ!Box-Gastzugang, zeigt sie in der Tabelle an und protokolliert ihre Aktivität. Gastgeräte sind von der normalen Internet-Freigabeprüfung ausgenommen."), t("Neue Gäste können beim ersten Verbinden gemeldet werden. Die Ruhezeitprüfung hebt Gastaktivität im festgelegten Zeitraum hervor; die maximale Gastdauer erzeugt nach Ablauf der gewählten Stunden eine Warnung.")],
          quiet:[t("Ruhezeiten"), t("Während der Ruhezeit kann das Aktivwerden eines Geräts als Auffälligkeit gemeldet werden. Zeiträume über Mitternacht, beispielsweise 23:00 bis 06:00 Uhr, werden automatisch korrekt behandelt."), t("Ist die Prüfung deaktiviert, beeinflusst die Ruhezeit weder Erkennung noch Anwesenheitssteuerung.")],
          checks:[t("Weitere Prüfungen"), t("Häufige Online-/Offline-Wechsel innerhalb einer Stunde kennzeichnen eine instabile Verbindung. Der Grenzwert bestimmt, ab wie vielen Wechseln eine Warnung wegen instabiler Verbindung entsteht."), t("Die Identitätsprüfung meldet, wenn an derselben IP-Adresse eine andere MAC-Adresse erscheint. Ein Wechsel wird erst nach wiederholter Bestätigung übernommen, damit einzelne fehlerhafte Scans keinen Alarm auslösen.")],
          notifications:[t("Benachrichtigungen"), t("Die HA-Glocke zeigt neue Auffälligkeiten als dauerhafte Meldung direkt in Home Assistant. Warnungen und kritische Meldungen können unabhängig voneinander an die ausgewählten Ziele gesendet werden."), t("Unabhängig von diesen Schaltern erzeugt jede neue Warnung das Home-Assistant-Ereignis nodarion_alert. Damit lassen sich eigene Automationen und weitere Eskalationswege bauen.")],
          targets:[t("Benachrichtigungsziele"), t("Hier legst du fest, welche in Home Assistant eingerichteten Notify-Dienste Nodarion verwenden darf, beispielsweise die Companion App oder einen Telegram Bot."), t("Alle und Keine ändern nur die aktuelle Auswahl. Wirksam wird sie zusammen mit den übrigen Änderungen erst nach dem Speichern. Ohne ausgewähltes Ziel bleiben HA-Glocke und nodarion_alert weiterhin verfügbar.")],
          adguard:[...(this._dnsProvider().id === "pihole" ? [t("Pi-hole DNS-Schutz"), t("Der Schalter aktiviert oder deaktiviert die DNS-Blockierung von Pi-hole. Protokollierung, Datenschutzstufe und Gruppen verwaltest du in Pi-hole."), t("Domain-Regeln in Nodarion gelten für alle derzeit konfigurierten Pi-hole-Gruppen. Clientbezogene Freigaben, Regex-Regeln und weitere Pi-hole-Einstellungen bleiben in der Pi-hole-Oberfläche.")] : [t("Schutzfunktionen"), t("Gesamtschutz ist der Hauptschalter von AdGuard Home. DNS-Filterung wendet Blocklisten und eigene Regeln an; Safe Browsing blockiert bekannte Phishing- und Malware-Ziele; Jugendschutz sperrt nicht jugendfreie Inhalte; Safe Search erzwingt den sicheren Modus unterstützter Suchmaschinen."), t("Das Query-Log wird für DNS-Live, Gerätezuordnung und KI-Auswertungen benötigt. Wird es ausgeschaltet, arbeitet der DNS-Schutz weiter, Nodarion erhält jedoch keine aktuellen DNS-Anfragen mehr.")])],
          ai:[t("KI-Analyse"), t("Die tägliche Auswertung fasst Netzwerkzustand, Änderungen und Auffälligkeiten nach dem gewählten Zeitpunkt zusammen. Eine manuelle Analyse bleibt im KI-Reiter jederzeit möglich."), t("Mit anonymisiertem DNS-Datenschutz werden keine lesbaren Domainnamen an die KI übergeben. Domainnamen mitsenden ermöglicht detailliertere Bewertungen, gibt aber entsprechend mehr Informationen weiter.")],
          cleanup:[t("Bereinigung"), t("Anzeige bereinigen entfernt alte Offline-Einträge, behält aber gespeicherte Gerätefreigaben. Vollständig vergessen entfernt zusätzlich Überwachungs- und Anwesenheitsmarkierungen."), t("Vor beiden Aktionen zeigt Nodarion die Anzahl betroffener und geschützter Teilnehmer an und fragt nochmals nach.")],
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
        if (count) count.textContent = t("{0} von {1} ausgewählt", selected, total);
        this._dirtyRules.add("notify_targets");
        this._captureSettingsDraft(settingsView);
        this._updateSettingsDirtyUi(settingsView);
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
        this._dirtyRules.add(rule);
        this._captureSettingsDraft(settingsView);
        this._updateSettingsDirtyUi(settingsView);
        return;
      }
      if (event.target.closest(".discard-settings")) {
        this._settingsDraft = null;
        this._dirtyRules.clear();
        this._notifyTargetsDirty = false;
        this._renderWatch();
        this._renderSettings();
        return;
      }
      const addVlan = event.target.closest(".vlan-add");
      if (addVlan) {
        this._captureSettingsDraft(settingsView);
        const segments = [...(this._settingsDraft.network_segments || [])];
        const usedIds = new Set(segments.map((segment) => Number(segment.vlan_id)));
        let vlanId = 1;
        while (usedIds.has(vlanId) && vlanId < 4094) vlanId += 1;
        segments.push({
          id:`vlan-${Date.now()}`,
          name:`VLAN ${vlanId}`,
          vlan_id:vlanId,
          network:`192.168.${Math.min(vlanId, 254)}.0/24`,
          role:"restricted",
          color:"#58b9d6",
          monitoring:true,
        });
        this._settingsDraft.network_segments = segments;
        this._dirtyRules.add("network_segments");
        this._renderWatch();
        this._renderSettings();
        return;
      }
      const removeVlan = event.target.closest(".vlan-remove");
      if (removeVlan) {
        this._captureSettingsDraft(settingsView);
        const segments = [...(this._settingsDraft.network_segments || [])];
        if (segments.length <= 1) return;
        segments.splice(Number(removeVlan.dataset.segmentIndex), 1);
        this._settingsDraft.network_segments = segments;
        this._dirtyRules.add("network_segments");
        this._renderWatch();
        this._renderSettings();
        return;
      }
      const cleanup = event.target.closest(".cleanup");
      if (cleanup) {
        this._cleanupOffline(cleanup, cleanup.dataset.forget !== "false");
        return;
      }
      const watchSave = event.target.closest(".save-watch-rules");
      if (watchSave) {
        this._captureSettingsDraft(settingsView);
        const rules = { ...this._settingsDraft };
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
        if (count) count.textContent = t("{0} von {1} ausgewählt", selected, total);
        this._dirtyRules.add("notify_targets");
      }
      const rule = event.target?.dataset?.rule;
      if (rule) this._dirtyRules.add(rule);
      if (event.target?.dataset?.segmentField) {
        this._dirtyRules.add("network_segments");
        const row = event.target.closest("[data-vlan-row]");
        if (event.target.dataset.segmentField === "color" && row) {
          row.style.setProperty("--vlan-color", event.target.value);
        }
      }
      if (["onboarding_enabled", "guest_monitoring_enabled", "quiet_hours_enabled", "ai_analysis_enabled"].includes(rule)) {
        settingsView.querySelectorAll(`[data-depends-on="${rule}"]`).forEach((group) => {
          group.hidden = !event.target.checked;
        });
      }
      if (rule === "onboarding_auto_range") {
        settingsView.querySelectorAll("[data-manual-range]").forEach((group) => {
          group.hidden = event.target.checked;
        });
      }
      if (rule || event.target?.dataset?.segmentField || event.target?.matches?.("[data-notify-target]")) {
        this._captureSettingsDraft(settingsView);
        this._updateSettingsDirtyUi(settingsView);
      }
    });
    settingsView.addEventListener("input", (event) => {
      if (event.target?.dataset?.rule) {
        this._dirtyRules.add(event.target.dataset.rule);
        this._captureSettingsDraft(settingsView);
        this._updateSettingsDirtyUi(settingsView);
      }
      if (event.target?.dataset?.segmentField) {
        this._dirtyRules.add("network_segments");
        const row = event.target.closest("[data-vlan-row]");
        if (event.target.dataset.segmentField === "color" && row) {
          row.style.setProperty("--vlan-color", event.target.value);
        }
        this._captureSettingsDraft(settingsView);
        this._updateSettingsDirtyUi(settingsView);
      }
      if (!event.target?.matches?.(".notify-target-search")) return;
      this._notifyTargetQuery = event.target.value;
      const query = event.target.value.trim().toLocaleLowerCase("de-DE");
      settingsView.querySelectorAll(".notify-target").forEach((target) => {
        const searchable = `${target.textContent} ${target.title}`
          .toLocaleLowerCase("de-DE");
        target.hidden = Boolean(query && !searchable.includes(query));
      });
    });
    settingsView.addEventListener("toggle", (event) => {
      const details = event.target.closest?.("details.advanced-settings");
      if (!details) return;
      const key = details.querySelector(":scope > summary")?.textContent?.trim();
      if (!key) return;
      if (details.open) this._openSettingsDetails.add(key);
      else this._openSettingsDetails.delete(key);
    }, true);
  }

  _render(changed = null) {
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
      mobile:Boolean(activeElement.closest(".mobile-device-controls")),
    } : activeElement?.dataset?.logFilter ? {
      type:"log-input", key:activeElement.dataset.logFilter,
      start:activeElement.selectionStart, end:activeElement.selectionEnd,
    } : participantDropdown ? {
      type:"participant-dropdown",
      mobile:Boolean(participantDropdown.closest(".mobile-device-controls")),
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
    const latest = entities.reduce((date, entity) => entity.last_updated > date ? entity.last_updated : date, "");
    const age = latest ? new Intl.DateTimeFormat(activeLocale(), { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(latest)) : "–";
    const connections = this._monitor.connection_status || {};
    const configuredConnections = Object.values(connections).filter(
      (connection) => connection.configured
    );
    const activeConnections = configuredConnections.filter(
      (connection) => connection.available
    ).length;
    const connectionStatus = this.shadowRoot.querySelector(".connection-status");
    if (connectionStatus) {
      const connectionLabel = t("{0}/{1} Verbindungen aktiv", activeConnections, configuredConnections.length);
      const label = connectionStatus.querySelector("span");
      if (label) label.textContent = connectionLabel;
      connectionStatus.title = `${connectionLabel} · letztes Update ${age}`;
    }
    const eventCount = (this._monitor.events || []).length;
    const adguardConnection = connections.adguard || {};
    const protection = this._hass.states[this._dnsProvider().id === "pihole" ? "switch.nodarion_pihole_gesamtschutz" : "switch.nodarion_adguard_gesamtschutz"]?.state;
    const dnsStatus = !adguardConnection.configured
      ? t("Nicht eingerichtet")
      : adguardConnection.available ? protection === "on" ? t("Schutz aktiv") : protection === "off" ? t("Schutz aus") : t("Verbunden") : t("Nicht erreichbar");
    const dnsRatioEntity = this._hass.states["sensor.nodarion_dns_blockquote"];
    const dnsRatio = dnsRatioEntity && !["unknown", "unavailable"].includes(dnsRatioEntity.state)
      ? t("{0} % blockiert", Number(dnsRatioEntity.state).toLocaleString(activeLocale(), {
        minimumFractionDigits: 1, maximumFractionDigits: 1,
      }))
      : t("Blockquote nicht verfügbar");
    const latestAiReport = this._monitor.ai_analysis?.reports?.[0];
    const aiScore = latestAiReport ? `${Number(latestAiReport.score)}/10` : "–";
    const aiNote = latestAiReport?.summary || (
      this._monitor.rules?.ai_analysis_enabled
        ? t("Tägliche Analyse aktiviert")
        : t("Noch keine Bewertung")
    );
    const metrics = this.shadowRoot.querySelector(".metrics");
    metrics.classList.toggle("overview-expanded", this._mobileOverviewExpanded);
    metrics.innerHTML = `
      <article class="metric devices">
        <div class="metric-label-row"><div class="metric-label">${t("Netzwerkgeräte")}</div><div class="metric-header-actions">
            <button class="mobile-overview-toggle" type="button" aria-label="${t("Übersicht ein- oder ausklappen")}" title="${t("Übersicht ein- oder ausklappen")}" aria-expanded="${this._mobileOverviewExpanded}" aria-controls="mobile-metric-overview"><ha-icon icon="mdi:chevron-down"></ha-icon></button>
            <button class="metric-settings" type="button" data-settings-section="devices" data-return-tab="participants" title="${t("Geräteeinstellungen öffnen")}" aria-label="${t("Geräteeinstellungen öffnen")}"><ha-icon icon="mdi:cog-outline"></ha-icon></button></div></div>
        <div class="device-counts">
          <button class="device-count online ${this._columnFilters.state === "on" ? "active" : ""}" type="button" data-quick-filter="state" data-quick-filter-value="on" title="${t("Nur Online-Geräte anzeigen")}"><strong>${online}</strong><span>Online</span></button>
          <button class="device-count offline ${this._columnFilters.state === "off" ? "active" : ""}" type="button" data-quick-filter="state" data-quick-filter-value="off" title="${t("Nur Offline-Geräte anzeigen")}"><strong>${entities.length - online}</strong><span>Offline</span></button>
          <button class="device-count new ${this._columnFilters.onboarding === "onboarding" ? "active" : ""}" type="button" data-quick-filter="onboarding" data-quick-filter-value="onboarding" title="${t("{0} neue Geräte im Einrichtungsbereich", onboarding)}"><strong>${onboarding}</strong><span>${t("Neu")}</span></button>
          ${guestMonitoring ? `<button class="device-count guest-inline" type="button" title="${t("Gastzugang anzeigen")}"><strong>${guestClients}</strong><span>${guestInfo.enabled ? t("Gastnetz an") : t("Gastnetz aus")}</span></button>` : ""}
        </div>
      </article>
      ${alertCount ? `<div class="mobile-overview-actions"><button class="mobile-alert-summary" type="button" data-open-watch><ha-icon icon="mdi:alert-outline"></ha-icon>${t("{0} offene Warnungen", alertCount)}</button></div>` : ""}
      <div class="metric-overview" id="mobile-metric-overview">
      <article class="metric events-metric">
        <div class="metric-label-row"><div class="metric-label">${t("Ereignisse")}</div><button class="metric-settings" type="button" data-settings-section="notifications" data-return-tab="log" title="${t("Benachrichtigungen öffnen")}" aria-label="${t("Benachrichtigungseinstellungen öffnen")}"><ha-icon icon="mdi:cog-outline"></ha-icon></button></div>
        <div class="metric-reading">
          <div class="metric-status-value">${eventCount}</div>
          <span class="metric-note">${alertCount ? `${alertCount} offene ${alertCount === 1 ? t("Warnung") : t("Warnungen")}` : t("Keine offenen Warnungen")}</span>
        </div>
      </article>
      <article class="metric dns-metric">
        <div class="metric-label-row"><div class="metric-label">${t("DNS-Schutz")}</div><button class="metric-settings" type="button" data-settings-section="dns" data-return-tab="dns" title="${t("DNS-Einstellungen öffnen")}" aria-label="${t("DNS-Einstellungen öffnen")}"><ha-icon icon="mdi:cog-outline"></ha-icon></button></div>
        <div class="metric-reading">
          <div class="metric-status-value" title="${esc(dnsStatus)}">${esc(dnsStatus)}</div>
          <button class="metric-note metric-entity-link" type="button" data-entity-id="sensor.nodarion_dns_blockquote" title="${t("Home-Assistant-Dialog öffnen")}">${esc(dnsRatio)}</button>
        </div>
      </article>
      <article class="metric ai-metric" title="${esc(aiNote)}">
        <div class="metric-label-row"><div class="metric-label">${t("Netzbewertung")}</div><button class="metric-settings" type="button" data-settings-section="ai-maintenance" data-return-tab="ai" title="${t("KI-Einstellungen öffnen")}" aria-label="${t("KI-Einstellungen öffnen")}"><ha-icon icon="mdi:cog-outline"></ha-icon></button></div>
        <div class="metric-reading">
          <div class="metric-value">${esc(aiScore)}</div>
          <span class="metric-note">${esc(aiNote)}</span>
        </div>
      </article>
      <article class="metric watch-metric">
        <div class="metric-label-row"><div class="metric-label">${t("Überwachung {0}", alertCount ? `<span class="metric-alert-badge">${alertCount}</span>` : "")}</div><button class="metric-settings" type="button" data-settings-section="rules" data-return-tab="watch" title="${t("Überwachungsregeln öffnen")}" aria-label="${t("Überwachungseinstellungen öffnen")}"><ha-icon icon="mdi:cog-outline"></ha-icon></button></div>
        <div class="function-counts">
          <button class="function-count favorite ${this._columnFilters.watch === "monitored" ? "active" : ""}" type="button" data-quick-filter="watch" data-quick-filter-value="monitored" title="${t("Favoriten: {0} gesamt, {1} online", important, importantOnline)}"><strong><ha-icon icon="mdi:star-outline"></ha-icon>${important}/${importantOnline}</strong><span>${t("Favoriten")}</span></button>
          <button class="function-count notify ${this._columnFilters.watch === "notify" ? "active" : ""}" type="button" data-quick-filter="watch" data-quick-filter-value="notify" title="${t("Glocke: {0} gesamt, {1} online", notifications, notificationsOnline)}"><strong><ha-icon icon="mdi:bell-outline"></ha-icon>${notifications}/${notificationsOnline}</strong><span>${t("Glocke")}</span></button>
          <button class="function-count presence ${this._columnFilters.watch === "presence" ? "active" : ""}" type="button" data-quick-filter="watch" data-quick-filter-value="presence" title="${t("Anwesenheit: {0} gesamt, {1} online", presenceDevices, presenceOnline)}"><strong><ha-icon icon="mdi:home-outline"></ha-icon>${presenceDevices}/${presenceOnline}</strong><span>${t("Anwesenheit")}</span></button>
        </div>
      </article></div>`;
    const full = !changed;
    const preferencesChanged = full || changed.has("preferences");
    const lifecycleChanged = full || changed.has("lifecycle");
    const statusChanged = full || changed.has("status");
    const participantsChanged = full || changed.has("participants") || preferencesChanged;
    const eventsChanged = full || changed.has("events");
    const alertsChanged = full || changed.has("alerts");
    if (statusChanged) this._renderConnections();
    if (participantsChanged || lifecycleChanged) {
      this._renderGuest();
      this._renderCards();
    } else if (statusChanged && entities.length === 0) {
      this._renderCards();
    }
    if (eventsChanged) this._renderLog();
    if (statusChanged) this._renderDnsLive();
    if (statusChanged) this._renderAi();
    if (participantsChanged || alertsChanged || statusChanged || preferencesChanged) this._renderWatch();
    if (preferencesChanged) this._renderSettings();
    this.shadowRoot.querySelectorAll(".settings-view details.advanced-settings").forEach((details) => {
      const key = details.querySelector(":scope > summary")?.textContent?.trim();
      if (key && this._openSettingsDetails.has(key)) details.open = true;
    });
    if (focusState) {
      const selector = focusState.type === "participant-input"
        ? `${focusState.mobile ? ".mobile-device-controls " : "table "}[data-column-filter="${focusState.key}"]`
        : focusState.type === "log-input"
          ? `[data-log-filter="${focusState.key}"]`
          : focusState.type === "participant-dropdown"
            ? `.device-list ${focusState.mobile ? ".mobile-device-controls " : "table "}[data-column-filter-key="${focusState.key}"] summary`
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
        if (count) count.textContent = t("{0} von {1} ausgewählt", selected, total);
      }
      updatedNotifyTargetList.scrollTop = scrollState.notifyTargetTop;
    }
  }

  async _cleanupOffline(button, forget) {
    const offline = this._entities().filter((entity) => entity.state !== "on");
    const protectedCount = offline.filter((entity) => {
      const key = entity.attributes.nodarion_key;
      return this._monitor.monitored.includes(key)
        || this._monitor.presence_devices.includes(key)
        || this._monitor.known_hosts.includes(key);
    }).length;
    const question = forget
      ? t("{0} Offline-Teilnehmer vollständig vergessen? Bei {1} davon werden auch Freigaben oder Überwachungseinstellungen entfernt.", offline.length, protectedCount)
      : t("{0} Offline-Anzeigen bereinigen? Gespeicherte Gerätefreigaben bleiben erhalten.", offline.length);
    if (!offline.length || !await this._confirm({ title:t("Offline-Geräte bereinigen"), message:question, confirmLabel:forget ? t("Vollständig vergessen") : t("Anzeige bereinigen"), danger:forget })) return;
    button.classList.add("busy");
    button.disabled = true;
    try {
      const response = await this._stateClient.mutate({
        action: "cleanup_inactive", forget,
      });
      const removed = Number(response.cleanup_result?.removed || 0);
      const result = this.shadowRoot.querySelector(".cleanup-result");
      result.textContent = removed
        ? `${removed} Offline-${removed === 1 ? t("Gerät") : t("Geräte")} entfernt.`
        : t("Keine Offline-Geräte gefunden.");
      result.classList.add("visible");
    } catch (_error) {
      const result = this.shadowRoot.querySelector(".cleanup-result");
      result.textContent = t("Bereinigung konnte nicht ausgeführt werden.");
      result.classList.add("visible");
    } finally {
      this.shadowRoot.querySelectorAll(".danger-zone .cleanup").forEach((currentButton) => {
        currentButton.classList.remove("busy");
        currentButton.disabled = false;
      });
    }
  }

  async _approveInternet(button) {
    if (button.classList.contains("block-internet")) {
      const name = button.dataset.name || button.dataset.key;
      if (!await this._confirm({ title:t("Internetzugang sperren"), message:t("Internetzugang für „{0}“ sperren? Das Gerät bleibt im Heimnetz erreichbar. Die Sperre bleibt auch während der Lernphase bestehen.", name), confirmLabel:t("Sperren"), danger:true })) return;
      button.disabled = true;
      try {
        await this._stateClient.mutate({ action:"block_internet", key:button.dataset.key });
      } catch (error) {
        await this._confirm({ title:t("Sperre fehlgeschlagen"), message:error?.body?.message || error?.message || t("Internetzugang konnte nicht gesperrt werden."), confirmLabel:t("Schließen"), danger:true, showCancel:false });
      } finally {
        button.disabled = false;
      }
      return;
    }
    const name = button.dataset.name || button.dataset.key;
    if (!await this._confirm({ title:t("Gerät freigeben"), message:t("Internetzugang für „{0}“ freigeben und das Gerät dauerhaft bestätigen?", name), confirmLabel:t("Freigeben") })) return;
    button.disabled = true;
    const original = button.textContent;
    button.textContent = "Wird freigegeben …";
    try {
      await this._stateClient.mutate({
        action: "approve_internet", key: button.dataset.key,
      });
      button.textContent = t("Freigegeben");
    } catch (error) {
      const detail = error?.body?.message || error?.message;
      await this._confirm({ title:t("Freigabe fehlgeschlagen"), message:detail ? t("Die FRITZ!Box konnte den Internetzugang nicht freigeben: {0}", detail) : t("Die FRITZ!Box konnte den Internetzugang nicht freigeben. Bitte Benutzerrechte und TR-064-Unterstützung prüfen."), confirmLabel:t("Schließen"), danger:true, showCancel:false });
      button.disabled = false;
      button.textContent = original;
    }
  }

  async _toggleGuest() {
    if (this._guestToggleBusy) return;
    const enabled = !Boolean(this._monitor.guest_access?.enabled);
    this._guestToggleBusy = true;
    this._renderGuest();
    try {
      await this._stateClient.mutate({ action:"set_guest_enabled", enabled });
      this._guestToggleError = "";
    } catch (error) {
      this._guestToggleError = error?.body?.message || error?.message || t("Gast-WLAN konnte nicht umgeschaltet werden.");
    } finally {
      this._guestToggleBusy = false;
      this._renderGuest();
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
      info.enabled && entity.state === "on" && entity.attributes.guest_network
    );
    const since = this._monitor.guest_since || {};
    const detail = (label, value) => `<div class="guest-status-card"><span>${esc(label)}</span><strong>${esc(value ?? t("Nicht verfügbar"))}</strong></div>`;
    const clients = guests.map((entity) => {
      const attr = entity.attributes;
      const key = attr.nodarion_key || `ip_${attr.ip_address}`;
      const name = attr.hostname || attr.friendly_name || attr.ip_address;
      const connected = since[key] ? formatStateChanged(since[key]) : "Online";
      return `<div class="guest-client"><div><strong>${esc(name)}</strong><small>${esc(attr.ip_address || t("Nicht verfügbar"))} · ${esc(attr.mac_address || "MAC nicht erkannt")}${attr.mac_vendor ? ` · ${esc(attr.mac_vendor)}` : ""}</small></div><small>${esc(connected)}</small></div>`;
    }).join("");
    const remaining = Number(info.time_remaining_seconds);
    const qrCode = String(info.qr_code || "");
    const qrHtml = qrCode.startsWith("data:image/svg+xml;base64,")
      ? `<div class="guest-qr"><img src="${esc(qrCode)}" alt="${t("QR-Code für das Gast-WLAN {0}", esc(info.ssid || ""))}"><div class="guest-qr-copy"><h3>${t("Mit dem Gast-WLAN verbinden")}</h3><p>${t("QR-Code mit der Handykamera scannen und direkt mit")} <strong>${esc(info.ssid || "dem Gast-WLAN")}</strong> verbinden.</p></div></div>`
      : `<div class="guest-qr-unavailable">${info.qr_code_restricted ? t("Der WLAN-QR-Code ist nur für Home-Assistant-Administratoren sichtbar.") : info.enabled ? t("Die FRITZ!Box konnte für dieses Gast-WLAN keinen QR-Code bereitstellen.") : t("Der QR-Code ist verfügbar, sobald der Gastzugang aktiv ist.")}</div>`;
    host.innerHTML = `<div class="guest-modal-backdrop"><section class="guest-modal" role="dialog" aria-modal="true" aria-labelledby="guest-modal-title">
      <div class="guest-modal-head"><div><h2 id="guest-modal-title"><ha-icon icon="mdi:wifi-star"></ha-icon>${t("FRITZ!Box-Gastzugang")}</h2><p>${t("Gast-WLAN direkt auf der FRITZ!Box ein- oder ausschalten.")}</p></div><button class="guest-close" type="button" aria-label="${t("Schließen")}"><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="guest-control"><span>${t("Gast-WLAN")}</span><button class="guest-toggle" type="button" role="switch" aria-label="${t("Gast-WLAN")}" aria-checked="${Boolean(info.enabled)}" ${this._guestToggleBusy || !info.available || info.ap_type !== "guest" ? "disabled" : ""}><span class="guest-toggle-track"><span></span></span><strong>${this._guestToggleBusy ? t("Wird umgeschaltet …") : info.enabled ? t("Ein") : t("Aus")}</strong></button></div>
      ${this._guestToggleError ? `<p class="guest-toggle-error" role="alert">${esc(this._guestToggleError)}</p>` : ""}
      <div class="guest-status-grid">
        ${detail("Status", info.available === false ? t("Nicht verfügbar") : info.enabled ? t("Aktiv") : t("Deaktiviert"))}
        ${detail(t("Gäste online"), guests.length)}
        ${detail(t("WLAN-Name"), info.ssid || t("Nicht gemeldet"))}
        ${detail(t("Verschlüsselung"), info.encryption_mode || info.beacontype || t("Nicht gemeldet"))}
        ${detail(t("Frequenz"), info.frequency_band || t("Nicht gemeldet"))}
        ${detail(t("Restlaufzeit"), Number.isFinite(remaining) ? formatLease(remaining) : info.timeout_active ? t("Aktiv") : t("Ohne Zeitlimit"))}
      </div>
      ${qrHtml}
      <div class="guest-client-list">${clients || `<div class="empty"><ha-icon icon="mdi:wifi-off"></ha-icon><strong>${t("Keine Gäste online")}</strong>${t("Der Gastzugang ist gerade angenehm übersichtlich.")}</div>`}</div>
      <div class="guest-actions"><button class="guest-show" type="button"><ha-icon icon="mdi:filter-variant"></ha-icon>${t("Gäste in Tabelle anzeigen")}</button></div>
    </section></div>`;
  }

  _renderConnections() {
    const panel = this.shadowRoot.querySelector(".connection-panel");
    const button = this.shadowRoot.querySelector(".connection-status");
    if (!panel || !button) return;
    button.classList.toggle("open", this._connectionsExpanded);
    panel.toggleAttribute("hidden", !this._connectionsExpanded);
    if (!this._connectionsExpanded) return;

    const connections = this._monitor.connection_status || {};
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
      if (!value) return t("Noch nicht geprüft");
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? t("Noch nicht geprüft")
        : t("Geprüft {0}", new Intl.DateTimeFormat(activeLocale(), {
            hour: "2-digit", minute: "2-digit", second: "2-digit",
          }).format(date));
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
        ? t("Nicht eingerichtet")
        : connection.available ? t("Verbunden") : t("Nicht erreichbar");
      const deviceInfo = key === "fritzbox" && router
        ? [
            router.fritzbox_model,
            router.fritzos_version
              ? `FRITZ!OS ${router.fritzos_version}`
              : null,
          ].filter(Boolean).join(" · ")
        : "";
      const scanStats = key === "scanner" ? connection.scan_stats : null;
      const scanInfo = scanStats
        ? panelLocale === "de"
          ? `${Number(scanStats.checked || 0)} geprüft · ${Number(scanStats.detected || 0)} erkannt · ${Number(scanStats.discovery || 0)} Discovery · ${Number(scanStats.priority || 0)} wichtig`
          : `${Number(scanStats.checked || 0)} checked · ${Number(scanStats.detected || 0)} detected · ${Number(scanStats.discovery || 0)} discovery · ${Number(scanStats.priority || 0)} important`
        : "";
      const recoveryActive = key === "scanner"
        && connection.scan_mode === "priority_recovery";
      const scannerMode = key === "scanner"
        ? recoveryActive
          ? panelLocale === "de"
            ? t("Schnellprüfung aktiv · {0} wichtige offline · alle {1} Sek.", Number(connection.important_offline || 0), Number(connection.effective_interval_seconds || 15))
            : `Fast recovery active · ${Number(connection.important_offline || 0)} important offline · every ${Number(connection.effective_interval_seconds || 15)} sec.`
          : panelLocale === "de"
            ? t("Normalbetrieb · alle {0} Sek.", Number(connection.effective_interval_seconds || connection.interval_seconds || 60))
            : `Normal mode · every ${Number(connection.effective_interval_seconds || connection.interval_seconds || 60)} sec.`
        : "";
      return `<article class="connection-card ${stateClass}">
        <i class="connection-dot"></i>
        <div><div class="connection-name">${esc(connection.label)}</div>${scannerMode ? `<span class="connection-device-info">${esc(scannerMode)}</span>` : ""}${deviceInfo ? `<span class="connection-device-info">${esc(deviceInfo)}</span>` : ""}${scanInfo ? `<span class="connection-device-info">${esc(scanInfo)}</span>` : ""}<div class="connection-state">${stateLabel}</div></div>
        <div class="connection-time">${connection.configured ? duration(connection.duration_ms) : "–"}<span class="connection-checked">${connection.configured ? `${checked(connection.last_checked)} · ${interval(connection.interval_seconds)}` : t("In den Optionen deaktiviert")}</span></div>
      </article>`;
    }).join("");
  }

  _matchesDeviceSearch(entity, query) {
    const terms = String(query || "").trim().toLocaleLowerCase("de-DE").split(/\s+/).filter(Boolean);
    if (!terms.length) return true;
    const attr = entity.attributes;
    const key = attr.nodarion_key || `ip_${attr.ip_address}`;
    const functions = [
      this._monitor.monitored.includes(key) ? "Favorit Favoriten überwacht monitored" : "",
      this._monitor.notifications.includes(key) ? "Glocke Offline-Meldung notify" : "",
      this._monitor.presence_devices.includes(key) ? "Anwesenheit presence" : "",
    ];
    const haystack = [entity.entity_id, attr.friendly_name, attr.hostname, attr.ip_address,
      attr.mac_address, attr.mac_vendor, attr.mac_vendor_prefix, attr.manufacturer,
      attr.segment_id, attr.segment_name, attr.vlan_id, attr.vlan_id != null ? `VLAN ${attr.vlan_id}` : "",
      attr.access_point, attr.connection_type, attr.wifi_band, attr.address_source,
      attr.link_rate_mbps, attr.signal_strength_percent, attr.dns_queries, attr.dns_last_domain,
      ...(attr.detection_sources || []), ...(attr.detection_sources || []).map(source => ({fritzbox:"FRITZ!Box", ping_tcp:"Ping/TCP"})[source] || source), ...functions, entity.state === "on" ? "online" : "offline",
      attr.guest_network ? "Gast Gastzugang guest" : "",
    ].filter(value => value != null).join(" ").toLocaleLowerCase("de-DE");
    return terms.every(term => haystack.includes(term));
  }

  _emptyScanMessage() {
    const german = panelLocale === "de";
    const scanner = this._monitor.connection_status?.scanner;
    if (!scanner) {
      return german ? "Scanstatus wird geladen …" : "Loading scan status…";
    }
    if (!scanner.last_checked) {
      return german
        ? "<strong>Erster Netzwerkscan läuft …</strong>Je nach Netzgröße kann das etwas dauern."
        : "<strong>First network scan in progress…</strong>This can take a while, depending on the network size.";
    }
    const title = scanner.available
      ? (german ? t("Keine Geräte gefunden") : "No devices found")
      : (german ? "Netzwerkscan fehlgeschlagen" : "Network scan failed");
    const hint = german
      ? t("Prüfe unter Einstellungen → Allgemein das überwachte IPv4-Netz und ob Home Assistant es erreichen kann. Warte anschließend auf den nächsten automatischen Scan.")
      : "Check the monitored IPv4 network under Settings → General and make sure Home Assistant can reach it. Then select Scan now.";
    return `<strong>${title}</strong>${hint}`;
  }

  _renderCards() {
    renderCards.call(this);
  }

  _renderLog(resetVerticalScroll = false) {
    renderLog.call(this, resetVerticalScroll);
  }

  _renderDnsLive() {
    renderDnsLive.call(this);
  }

  _renderAi() {
    renderAi.call(this);
  }

  _renderWatch() {
    renderWatch.call(this);
  }

  _renderSettings() {
    renderSettings.call(this);
  }

}

if (!customElements.get("engelsoft-nodarion-panel")) {
  customElements.define("engelsoft-nodarion-panel", EngelsoftNodarionPanel);
}
