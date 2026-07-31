const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

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
    : new Intl.DateTimeFormat("de-DE", {
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
  const day = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("de-DE", {
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
    this._dnsPausedBeforeConfig = false;
    this._connectionsExpanded = false;
    this._activeTab = "participants";
    this._lastSignature = "";
    this._lastMonitorLoad = 0;
    this._built = false;
    this._monitor = {
      monitored: [], notifications: [], events: [], alerts: [], known_hosts: [],
      presence_devices: [],
      rules: {}, learning: { active: true }, summary: {}, participants: [],
      ai_analysis: { reports: [], running: false, last_error: null },
    };
    this._monitorLoading = false;
  }

  disconnectedCallback() {
    window.clearTimeout(this._dnsLiveTimer);
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

  set hass(value) {
    this._hass = value;
    if (!this._built) this._build();
    const signature = this._entities()
      .map((entity) => `${entity.entity_id}:${entity.state}:${entity.last_changed}:${JSON.stringify(entity.attributes)}`)
      .join("|");
    if (signature !== this._lastSignature) {
      this._lastSignature = signature;
      this._render();
    }
    if (Date.now() - this._lastMonitorLoad > 10000) this._loadMonitor();
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
    return states;
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
    const selector = kind === "ai" ? ".save-ai-rules" : ".save-watch-rules";
    const defaultLabel = kind === "ai"
      ? "KI-Einstellungen speichern"
      : "Regeln speichern";
    const defaultContent = `<ha-icon icon="mdi:content-save-outline"></ha-icon>${defaultLabel}`;
    button.disabled = true;
    button.classList.remove("saved", "failed");
    button.classList.add("busy");
    button.innerHTML = '<ha-icon icon="mdi:loading"></ha-icon>Speichert …';
    try {
      this._monitor = await this._hass.callApi(
        "POST", "nodarion/monitor", { action: "set_rules", rules }
      );
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
        "POST", "nodarion/monitor", { action: "run_ai_analysis" }
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
    this.shadowRoot.querySelectorAll(".tab").forEach((item) =>
      item.classList.toggle("active", item.dataset.tab === tab));
    this.shadowRoot.querySelectorAll(".tab-view").forEach((view) =>
      view.toggleAttribute("hidden", view.dataset.view !== tab));
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
        .metrics { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:14px; margin-bottom:18px; }
        .metric, .toolbar, .table-panel, .log-panel, .mesh-panel, .watch-panel {
          background:var(--ns-panel); border:1px solid var(--ns-line);
          backdrop-filter:blur(22px) saturate(110%); box-shadow:0 22px 55px rgba(10,8,5,.22), inset 0 1px rgba(255,255,255,.035);
        }
        .metric { padding:18px 20px; border-radius:17px; position:relative; overflow:hidden; }
        .metric::after { content:""; position:absolute; inset:auto -20px -35px auto; width:90px; height:90px; border-radius:50%; background:var(--glow); filter:blur(32px); opacity:.24; }
        .metric-label { color:#9bb8af; font-size:13px; text-transform:uppercase; letter-spacing:1.2px; font-weight:700; }
        .metric-value { font-size:31px; font-weight:780; margin-top:7px; letter-spacing:-1px; }
        .metric.devices { --glow:var(--ns-green); }
        .device-counts { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:7px; }
        .device-count { appearance:none; min-width:0; border:0; outline:0; padding:0; color:inherit; background:transparent; text-align:left; font:inherit; cursor:pointer; border-radius:0; transition:.18s ease; }
        .device-count:hover { background:transparent; }
        .device-count.active { background:transparent; box-shadow:none; }
        .device-count:focus, .device-count:focus-visible { border:0; outline:0; box-shadow:none; }
        .device-count + .device-count { padding-left:12px; border-left:1px solid var(--ns-line); }
        .device-count strong { display:block; font-size:31px; line-height:1; letter-spacing:-1px; }
        .device-count.online strong { color:var(--ns-green); }
        .device-count.offline strong { color:var(--ns-red); }
        .device-count span { display:block; margin-top:6px; color:#8eaea4; font-size:10px; font-weight:750; text-transform:uppercase; letter-spacing:.8px; }
        .function-counts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:9px; }
        .function-count { appearance:none; min-width:0; border:0; outline:0; padding:0 8px; color:inherit; background:transparent; text-align:left; font:inherit; cursor:pointer; }
        .function-count + .function-count { border-left:1px solid var(--ns-line); }
        .function-count:focus, .function-count:focus-visible { outline:0; box-shadow:none; }
        .function-count strong { display:flex; align-items:center; gap:6px; color:#f4dfbd; font-size:24px; line-height:1; }
        .function-count ha-icon { color:var(--ns-green); --mdc-icon-size:17px; }
        .function-count.notify ha-icon { color:var(--ns-cyan); }
        .function-count.presence ha-icon { color:#8fffc2; }
        .function-count span { display:block; margin-top:7px; overflow:hidden; color:#8eaea4; font-size:9px; font-weight:750; text-overflow:ellipsis; text-transform:uppercase; letter-spacing:.65px; white-space:nowrap; }
        .metric.network { --glow:var(--ns-cyan); } .metric.network .metric-value { color:var(--ns-cyan); font-size:20px; margin-top:13px; }
        .metric.quick-filter { width:100%; color:inherit; text-align:left; font:inherit; cursor:pointer; }
        .metric.quick-filter:hover { border-color:rgba(240,161,59,.4); background:rgba(240,161,59,.07); }
        .metric.quick-filter.active { border-color:rgba(240,161,59,.62); box-shadow:0 0 0 1px rgba(240,161,59,.2), 0 22px 55px rgba(10,8,5,.22); }
        .metric.connections { --glow:var(--ns-cyan); width:100%; color:inherit; text-align:left; font:inherit; cursor:pointer; }
        .metric.connections:hover { border-color:rgba(80,215,255,.4); background:rgba(20,45,40,.82); }
        .metric.connections .metric-value { display:flex; align-items:center; justify-content:space-between; color:var(--ns-cyan); font-size:20px; margin-top:13px; }
        .metric.connections ha-icon { --mdc-icon-size:21px; transition:transform .18s ease; }
        .metric.connections.open ha-icon { transform:rotate(180deg); }
        .metric.ai-metric { --glow:#b68cff; width:100%; color:inherit; text-align:left; font:inherit; cursor:pointer; }
        .metric.ai-metric:hover { border-color:rgba(182,140,255,.4); background:rgba(35,25,49,.72); }
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
        .rating { width:max-content; display:inline-flex; align-items:center; gap:6px; margin-top:2px; padding:3px 7px; border-radius:999px; color:var(--rating-color); background:color-mix(in srgb,var(--rating-color) 10%,transparent); border:1px solid color-mix(in srgb,var(--rating-color) 24%,transparent); font-size:11px; font-weight:750; }
        .rating::before { content:""; width:6px; height:6px; border-radius:50%; background:var(--rating-color); box-shadow:0 0 7px color-mix(in srgb,var(--rating-color) 65%,transparent); }
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
        .settings-view { display:grid; gap:18px; }
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
        .settings-view .watch-settings-panel .rule-list {
          display:block; column-count:3; column-gap:10px;
        }
        .settings-view .watch-settings-panel .rule-group {
          display:inline-block; width:100%; margin:0 0 10px;
          padding:5px 10px; box-sizing:border-box; break-inside:avoid;
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
        .rule-group.basics { background:rgba(240,161,59,.045); border-color:rgba(240,161,59,.15); }
        .rule-group.presence-settings { background:rgba(143,255,194,.04); border-color:rgba(143,255,194,.14); }
        .rule-group.onboarding-settings { background:rgba(240,185,79,.055); border-color:rgba(240,185,79,.18); }
        .rule-group.onboarding-settings .rule { grid-template-columns:minmax(0,1fr) 190px; }
        .rule-group.onboarding-settings input[type="text"] {
          width:190px; box-sizing:border-box; font-variant-numeric:tabular-nums;
        }
        .rule-group.detection-settings { background:rgba(182,140,255,.04); border-color:rgba(182,140,255,.14); }
        .rule-group.notification-settings { background:rgba(80,215,255,.035); border-color:rgba(80,215,255,.13); }
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
        .metric.connections:hover, .metric.ai-metric:hover {
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

        @media (max-width:1100px) {
          .settings-view .watch-settings-panel .rule-list { column-count:2; }
          .ai-settings .rule-list { grid-template-columns:repeat(2,minmax(0,1fr)); }
        }
        @media (max-width:1200px) { .metrics { grid-template-columns:repeat(3,1fr); } }
        @media (max-width:800px) {
          .shell { padding-top:20px; } header { align-items:flex-start; } .scan span { display:none; }
          .metrics { grid-template-columns:1fr 1fr; } .toolbar { flex-wrap:wrap; }
          .connection-panel { grid-template-columns:1fr; }
          .search { flex-basis:100%; } .filters { flex:1; } .filter { flex:1; }
          .cleanup { flex:1; justify-content:center; }
          select { min-width:120px; }
          .mesh-head { flex-direction:column; } .mesh-panel { padding:18px; }
          .watch-layout { grid-template-columns:1fr; } .security-metrics { grid-template-columns:1fr 1fr; }
          .settings-view .watch-settings-panel .rule-list { column-count:1; }
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
          <button class="scan"><ha-icon icon="mdi:radar"></ha-icon><span>Jetzt scannen</span></button>
        </header>
        <section class="metrics"></section>
        <section class="connection-panel" hidden></section>
        <nav class="tabs" aria-label="Netzwerkansichten">
          <button class="tab active" data-tab="participants"><ha-icon icon="mdi:devices"></ha-icon>Teilnehmer</button>
          <button class="tab" data-tab="log"><ha-icon icon="mdi:text-box-search-outline"></ha-icon>Live-Log</button>
          <button class="tab" data-tab="dns"><ha-icon icon="mdi:dns-outline"></ha-icon>DNS-Live</button>
          <button class="tab" data-tab="ai"><ha-icon icon="mdi:creation-outline"></ha-icon>KI-Analyse</button>
          <button class="tab" data-tab="watch"><ha-icon icon="mdi:shield-alert-outline"></ha-icon>Überwachung<span class="tab-badge"></span></button>
          <button class="tab" data-tab="settings"><ha-icon icon="mdi:cog-outline"></ha-icon>Einstellungen</button>
        </nav>
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
      </div>`;

    this.shadowRoot.querySelectorAll(".tab").forEach((button) =>
      button.addEventListener("click", () => {
        this._activeTab = button.dataset.tab;
        this.shadowRoot.querySelectorAll(".tab").forEach((item) =>
          item.classList.toggle("active", item === button));
        this.shadowRoot.querySelectorAll(".tab-view").forEach((view) =>
          view.toggleAttribute("hidden", view.dataset.view !== this._activeTab));
        window.clearTimeout(this._dnsLiveTimer);
        if (this._activeTab === "dns") {
          this._openDnsLive();
        }
        if (["watch", "ai", "settings"].includes(this._activeTab)) this._loadMonitor();
      })
    );

    this.shadowRoot.querySelector(".scan").addEventListener("click", async () => {
      const button = this.shadowRoot.querySelector(".scan");
      button.classList.add("busy");
      const ids = this._entities().map((entity) => entity.entity_id);
      if (ids.length) {
        await this._hass.callService("homeassistant", "update_entity", { entity_id: ids });
      }
      window.setTimeout(() => button.classList.remove("busy"), 900);
    });
    this.shadowRoot.querySelector(".metrics").addEventListener("click", (event) => {
      const quickFilter = event.target.closest("[data-quick-filter]");
      if (quickFilter) {
        const key = quickFilter.dataset.quickFilter;
        const value = quickFilter.dataset.quickFilterValue;
        this._columnFilters[key] = this._columnFilters[key] === value ? "" : value;
        this._showTab("participants");
        this._render();
        return;
      }
      if (event.target.closest(".onboarding-metric")) {
        this._columnFilters.onboarding = "onboarding";
        this._showTab("participants");
        this._renderCards();
        return;
      }
      if (event.target.closest(".ai-metric")) {
        this._showTab("ai");
        this._renderAi();
        return;
      }
      if (event.target.closest(".connections")) {
        this._connectionsExpanded = !this._connectionsExpanded;
        this._renderConnections();
      }
    });
    this.shadowRoot.querySelector(".device-list").addEventListener("click", (event) => {
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
        this._activeTab = "log";
        this.shadowRoot.querySelectorAll(".tab").forEach((item) =>
          item.classList.toggle("active", item.dataset.tab === "log"));
        this.shadowRoot.querySelectorAll(".tab-view").forEach((view) =>
          view.toggleAttribute("hidden", view.dataset.view !== "log"));
        this._renderLog();
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
        const key = input?.dataset.columnFilter || "mesh";
        this._columnFilters[key] = "";
        this._renderCards();
        if (key === "mesh") {
          this.shadowRoot.querySelector(
            ".custom-column-filter summary"
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
      this._renderLog();
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
        const label = policy.dataset.policy === "block" ? "blockieren" : "freigeben";
        this._adguardAction(
          {
            action: "adguard_set_domain_policy",
            domain: policy.dataset.domain,
            policy: policy.dataset.policy,
          },
          `Domain „${policy.dataset.domain}“ wirklich ${label}?`
        );
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
      const picker = this.shadowRoot.querySelector(".column-picker");
      if (!picker.hidden) {
        picker.hidden = true;
        this.shadowRoot.querySelector(".column-picker-button")?.focus();
      }
    });
    this.shadowRoot.querySelector(".watch-view").addEventListener("click", (event) => {
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
        this._saveRuleSettings(watchSave, rules, "watch");
        return;
      }
      const aiSave = event.target.closest(".save-ai-rules");
      if (!aiSave) return;
      const rules = {};
      settingsView.querySelectorAll(".ai-settings [data-rule]").forEach((input) => {
        rules[input.dataset.rule] = input.type === "checkbox"
          ? input.checked
          : input.value;
      });
      this._saveRuleSettings(aiSave, rules, "ai");
    });
    settingsView.addEventListener("change", (event) => {
      if (event.target?.dataset?.rule !== "onboarding_auto_range") return;
      settingsView.querySelectorAll(
        '[data-rule="onboarding_start"], [data-rule="onboarding_end"]'
      ).forEach((input) => {
        input.disabled = event.target.checked;
      });
    });
  }

  _render() {
    const entities = this._entities();
    const online = entities.filter((entity) => entity.state === "on").length;
    const onboarding = entities.filter((entity) =>
      onboardingStatus(entity.attributes.ip_address, this._monitor.rules)
      === "onboarding"
    ).length;
    const important = this._monitor.monitored.length;
    const notifications = this._monitor.notifications.length;
    const presenceDevices = this._monitor.presence_devices.length;
    const alertCount = Number(this._monitor.summary?.active || 0);
    const badge = this.shadowRoot.querySelector(".tab-badge");
    badge.textContent = alertCount;
    badge.classList.toggle("visible", alertCount > 0);
    const versions = this._monitor.versions || {};
    this.shadowRoot.querySelector(".version-info").textContent = [
      versions.integration ? `Version ${versions.integration}` : null,
      versions.frontend ? `Frontend ${versions.frontend}` : null,
    ].filter(Boolean).join(" · ");
    const latest = entities.reduce((date, entity) => entity.last_updated > date ? entity.last_updated : date, "");
    const age = latest ? new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(latest)) : "–";
    const connections = entities[0]?.attributes.connection_status || {};
    const configuredConnections = Object.values(connections).filter(
      (connection) => connection.configured
    );
    const activeConnections = configuredConnections.filter(
      (connection) => connection.available
    ).length;
    const latestAiReport = this._monitor.ai_analysis?.reports?.[0];
    const aiScore = latestAiReport ? `${Number(latestAiReport.score)}/10` : "–";
    const aiNote = latestAiReport?.summary || (
      this._monitor.rules?.ai_analysis_enabled
        ? "Tägliche Analyse aktiviert"
        : "Noch keine Bewertung"
    );
    this.shadowRoot.querySelector(".metrics").innerHTML = `
      <article class="metric devices">
        <div class="metric-label">Gerätestatus</div>
        <div class="device-counts">
          <button class="device-count online ${this._columnFilters.state === "on" ? "active" : ""}" type="button" data-quick-filter="state" data-quick-filter-value="on" title="Nur Online-Geräte anzeigen"><strong>${online}</strong><span>Online</span></button>
          <button class="device-count offline ${this._columnFilters.state === "off" ? "active" : ""}" type="button" data-quick-filter="state" data-quick-filter-value="off" title="Nur Offline-Geräte anzeigen"><strong>${entities.length - online}</strong><span>Offline</span></button>
        </div>
      </article>
      <article class="metric functions-metric">
        <div class="metric-label">Gerätefunktionen</div>
        <div class="function-counts">
          <button class="function-count favorite" type="button" data-quick-filter="watch" data-quick-filter-value="monitored" title="Nur Favoriten anzeigen"><strong><ha-icon icon="mdi:star-outline"></ha-icon>${important}</strong><span>Favoriten</span></button>
          <button class="function-count notify" type="button" data-quick-filter="watch" data-quick-filter-value="notify" title="Nur Geräte mit Offline-Meldung anzeigen"><strong><ha-icon icon="mdi:bell-outline"></ha-icon>${notifications}</strong><span>Glocke</span></button>
          <button class="function-count presence" type="button" data-quick-filter="watch" data-quick-filter-value="presence" title="Nur Anwesenheitsgeräte anzeigen"><strong><ha-icon icon="mdi:home-outline"></ha-icon>${presenceDevices}</strong><span>Anwesenheit</span></button>
        </div>
      </article>
      <button class="metric onboarding-metric" type="button" title="Teilnehmer im Einrichtungsbereich anzeigen">
        <div class="metric-label">Neue Geräte</div><div class="metric-value">${onboarding}</div>
        <span class="metric-note">Im Einrichtungsbereich</span>
      </button>
      <button class="metric ai-metric" type="button" title="${esc(aiNote)}">
        <div class="metric-label">KI-Bewertung</div>
        <div class="metric-value">${esc(aiScore)}</div>
        <span class="metric-note">${esc(aiNote)}</span>
      </button>
      <button class="metric connections ${this._connectionsExpanded ? "open" : ""}" type="button">
        <div class="metric-label">Aktive Verbindungen</div>
        <div class="metric-value">${activeConnections} / ${configuredConnections.length}<ha-icon icon="mdi:chevron-down"></ha-icon></div>
        <span class="metric-note">Letztes Update: ${esc(age)}</span>
      </button>`;
    this._renderConnections();
    this._renderCards();
    this._renderLog();
    this._renderDnsLive();
    this._renderAi();
    this._renderWatch();
    this._renderSettings();
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
    } catch (_error) {
      window.alert(
        "Die FRITZ!Box konnte den Internetzugang nicht freigeben. Bitte Benutzerrechte und TR-064-Unterstützung prüfen."
      );
      button.disabled = false;
      button.textContent = original;
    }
  }

  _renderConnections() {
    const panel = this.shadowRoot.querySelector(".connection-panel");
    const button = this.shadowRoot.querySelector(".metric.connections");
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
        : `Geprüft ${new Intl.DateTimeFormat("de-DE", {
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
      if (filters.state && entity.state !== filters.state) return false;
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
      return `<tr class="${online ? "on" : "off"} ${lifecycle === "onboarding" ? "onboarding-row" : ""}" ${lifecycle === "onboarding" ? 'title="Gerät im DHCP-Einrichtungsbereich"' : ""}>
        <td data-column="state"><div class="status-cell"><div class="status"><i class="dot"></i>${online ? "Online" : "Offline"}</div><span class="status-time">${esc(formatStateChanged(stateChanged))}</span></div></td>
        <td data-column="onboarding"><span class="onboarding-state ${lifecycle}">${esc(lifecycleLabel)}</span></td>
        <td data-column="name"><div class="device-cell">
          <span class="device-icon" title="Automatisch erkannter Gerätetyp"><ha-icon icon="${deviceIcon(entity)}"></ha-icon></span>
          <div class="device-label"><button class="entity-link" data-key="${esc(key)}" data-name="${esc(name)}" title="Live-Log dieses Geräts anzeigen">${esc(name)}</button>
          <button class="entity-id-link" data-entity-id="${esc(entity.entity_id)}" title="Home-Assistant-Dialog öffnen">${esc(entity.entity_id)}</button></div>
        </div>
        </td>
        <td data-column="ip" class="mono">${esc(attr.ip_address || "–")}</td>
        <td data-column="mac" class="mono" title="${esc(vendorTitle)}">${esc(attr.mac_address || "Unbekannt")}${attr.mac_vendor ? `<span class="mac-vendor" title="${esc(vendorTitle)}"><ha-icon icon="mdi:factory"></ha-icon>${esc(attr.mac_vendor)}</span>` : ""}${privateMac ? `<span class="private-mac" title="Lokal verwaltete bzw. randomisierte MAC-Adresse; Änderungen lösen keine Identitätswarnung aus"><ha-icon icon="mdi:incognito"></ha-icon>Privat / randomisiert</span>` : ""}</td>
        <td data-column="connection"><div class="detail-stack"><strong>${esc(connection)}</strong></div></td>
        <td data-column="mesh"><div class="detail-stack"><strong>${esc(accessPoint)}</strong></div></td>
        <td data-column="rate"><div class="detail-stack"><strong>${esc(rates || "–")}</strong>${signal ? `<span class="rating ${signalAssessment?.level || "okay"}" title="WLAN-Empfang: ${esc(signalAssessment?.label || "Nicht bewertet")}">${esc(signal)} · ${esc(signalAssessment?.label || "")}</span>` : ""}</div></td>
        <td data-column="address"><div class="detail-stack"><strong>${esc(addressSource || "–")}</strong>${addressSource === "DHCP" && lease ? `<small>Noch ${esc(lease)}</small>` : ""}</div></td>
        <td data-column="dns" title="${esc(dnsTitle)}"><button class="dns-live-link" type="button" data-ip="${esc(attr.ip_address)}" data-name="${esc(name)}" title="DNS-Live-Log für ${esc(name)} öffnen"><span class="detail-stack"><strong class="${attr.adguard_bypass_suspected ? "dns-alert" : ""}">${esc(dnsPrimary)}</strong>${dnsSecondary ? `<span class="rating ${dnsAssessment?.level || "okay"}" title="Anteil blockierter DNS-Anfragen: ${esc(dnsAssessment?.label || "Nicht bewertet")}">${esc(dnsSecondary)} · ${esc(dnsAssessment?.label || "")}</span>` : ""}</span></button></td>
        <td data-column="source">${esc(sources)}</td>
        <td data-column="internet"><div class="internet-state"><span class="internet-label ${esc(internetClass)}">${esc(internetLabel)}</span>${approvalRequired ? `<button class="approve-internet" data-key="${esc(key)}" data-name="${esc(name)}" data-entity-id="${esc(entity.entity_id)}">Freigeben</button>` : ""}</div></td>
        <td data-column="watch">
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
    const meshCounts = new Map();
    this._entities().filter((entity) => entity.state === "on").forEach((entity) => {
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
          <th data-column="state"><select class="column-filter ${this._columnFilters.state ? "has-value" : ""}" data-column-filter="state"><option value="">Alle</option><option value="on" ${this._columnFilters.state === "on" ? "selected" : ""}>Online</option><option value="off" ${this._columnFilters.state === "off" ? "selected" : ""}>Offline</option></select></th>
          <th data-column="onboarding"><select class="column-filter ${this._columnFilters.onboarding ? "has-value" : ""}" data-column-filter="onboarding"><option value="">Alle Gerätestatus</option><option value="onboarding" ${this._columnFilters.onboarding === "onboarding" ? "selected" : ""}>Neu</option><option value="assigned" ${this._columnFilters.onboarding === "assigned" ? "selected" : ""}>Zugeordnet</option><option value="unknown" ${this._columnFilters.onboarding === "unknown" ? "selected" : ""}>Unbekannt</option></select></th>
          ${filterInput("name", "Name oder *")}
          ${filterInput("ip", "IP oder *")}
          ${filterInput("mac", "MAC oder *")}
          ${filterInput("connection", "z. B. WLAN")}
          <th data-column="mesh"><details class="custom-column-filter ${this._columnFilters.mesh ? "has-value" : ""}"><summary>${esc(selectedMesh)}</summary><div class="custom-filter-menu"><button type="button" class="custom-filter-option ${this._columnFilters.mesh ? "" : "active"}" data-column-filter-key="mesh" data-column-filter-value=""><ha-icon icon="${this._columnFilters.mesh ? "mdi:access-point-network" : "mdi:check"}"></ha-icon><span>Alle Mesh-Punkte</span><span class="custom-filter-count">${[...meshCounts.values()].reduce((sum, count) => sum + count, 0)}</span></button>${meshOptions}</div></details></th>
          ${filterInput("rate", "Rate / Signal")}
          ${filterInput("address", "DHCP / statisch")}
          ${filterInput("dns", "DNS / Domain")}
          ${filterInput("source", "Ping / TCP")}
          ${filterInput("internet", "Gesperrt / frei")}
          <th data-column="watch"><select class="column-filter marker-filter ${this._columnFilters.watch ? "has-value" : ""}" data-column-filter="watch" title="Nach aktiver Gerätefunktion filtern">
            <option value="">Alle Funktionen</option>
            <option value="monitored" ${this._columnFilters.watch === "monitored" ? "selected" : ""}>Überwacht</option>
            <option value="notify" ${this._columnFilters.watch === "notify" ? "selected" : ""}>Offline-Meldung</option>
            <option value="presence" ${this._columnFilters.watch === "presence" ? "selected" : ""}>Anwesenheit</option>
            <option value="none" ${this._columnFilters.watch === "none" ? "selected" : ""}>Keine Funktion</option>
          </select></th>
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

  _renderLog() {
    const list = this.shadowRoot.querySelector(".log-list");
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
    };
    const labels = {
      online: "Online",
      offline: "Offline",
      renamed: "Umbenannt",
      discovered: "Neu erkannt",
      mesh_changed: "Mesh-Wechsel",
    };
    const events = [...(this._monitor.events || [])]
      .filter((item) =>
        !this._logDeviceFilter || item.key === this._logDeviceFilter.key
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (!events.length) {
      list.innerHTML = `<div class="empty"><ha-icon icon="mdi:text-box-search-outline"></ha-icon><strong>Keine Ereignisse gefunden</strong>${this._logDeviceFilter ? "Für dieses Gerät sind noch keine Ereignisse gespeichert." : "Änderungen erscheinen nach dem nächsten Scan hier."}</div>`;
      return;
    }
    const rows = events.map((item) => {
      const timestamp = new Date(item.timestamp);
      const time = new Intl.DateTimeFormat("de-DE", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }).format(timestamp);
      const date = new Intl.DateTimeFormat("de-DE", {
        day: "2-digit", month: "2-digit", year: "numeric",
      }).format(timestamp);
      const message = item.type === "mesh_changed" && item.from_access_point && item.to_access_point
        ? `<div class="log-route"><span>${esc(item.from_access_point)}</span><ha-icon icon="mdi:arrow-right"></ha-icon><span>${esc(item.to_access_point)}</span></div>`
        : esc(item.message);
      return `<tr class="log-entry ${esc(item.type)}">
        <td><span class="log-time">${esc(time)}</span><span class="log-date">${esc(date)}</span></td>
        <td><div class="log-device">${esc(item.name || item.ip)}</div><div class="log-ip">${esc(item.ip)}</div></td>
        <td><div class="log-event"><span class="log-icon"><ha-icon icon="${icons[item.type] || "mdi:information-outline"}"></ha-icon></span>${esc(labels[item.type] || item.type)}</div></td>
        <td><div class="log-device">${esc(item.service || "Nicht protokolliert")}</div></td>
        <td><div class="log-message">${message}</div></td>
      </tr>`;
    }).join("");
    list.innerHTML = `<table class="log-table">
      <thead><tr><th>Zeit</th><th>Gerät</th><th>Ereignis</th><th>Dienst</th><th>Details</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
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
        "de-DE",
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
      const answer = (item.answer || []).join(", ") || "–";
      const elapsed = Number(item.elapsed_ms);
      const elapsedFormatted = Number.isFinite(elapsed)
        ? new Intl.NumberFormat("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(elapsed)
        : null;
      const hostname = hostnames.get(String(item.client || "")) || "Unbekannt";
      const domain = String(item.domain || "");
      const policyActions = this._hass?.user?.is_admin && domain
        ? item.blocked
          ? `<div class="dns-policy-actions"><button class="dns-policy allow" type="button" data-domain="${esc(domain)}" data-policy="allow">Freigeben</button></div>`
          : `<div class="dns-policy-actions"><button class="dns-policy block" type="button" data-domain="${esc(domain)}" data-policy="block">Blockieren</button></div>`
        : "–";
      return `<tr class="dns-row ${item.blocked ? "blocked" : "allowed"}">
        <td class="mono">${esc(time)}</td>
        <td><div class="dns-result"><ha-icon icon="${resultIcon}"></ha-icon>${resultLabel}</div></td>
        <td><div class="dns-domain">${esc(item.domain || "–")}</div><div class="dns-answer" title="${esc(answer)}">${esc(answer)}</div></td>
        <td><span class="dns-chip">${esc(item.query_type || "–")}</span></td>
        <td class="mono">${esc(item.client || "–")}</td>
        <td>${esc(hostname)}</td>
        <td><span class="dns-chip">${esc(item.protocol || "DNS")}</span></td>
        <td>${esc(reason)}</td>
        <td class="mono">${elapsedFormatted ? `${esc(elapsedFormatted)} ms` : "–"}</td>
        <td>${policyActions}</td>
      </tr>`;
    }).join("");
    const updated = this._dnsLive.updated_at
      ? new Intl.DateTimeFormat("de-DE", {
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
        : new Intl.DateTimeFormat("de-DE", { hour: "2-digit" }).format(stamp);
      const fullTime = Number.isNaN(stamp.getTime())
        ? "–"
        : new Intl.DateTimeFormat("de-DE", {
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
        <select data-dns-filter="status">
          <option value="all" ${this._dnsLiveFilters.status === "all" ? "selected" : ""}>Alle Ergebnisse</option>
          <option value="allowed" ${this._dnsLiveFilters.status === "allowed" ? "selected" : ""}>Nur erlaubt</option>
          <option value="blocked" ${this._dnsLiveFilters.status === "blocked" ? "selected" : ""}>Nur blockiert</option>
        </select>
        ${this._dnsLive.client ? `<div class="dns-client-filter"><ha-icon icon="mdi:filter-outline"></ha-icon>${esc(clientLabel)}<button class="dns-client-clear" type="button" title="IP-Filter aufheben"><ha-icon icon="mdi:close"></ha-icon></button></div>` : `<div class="dns-client-filter"><ha-icon icon="mdi:earth"></ha-icon>Alle Clients</div>`}
      </div>
      <div class="dns-list">
        ${rows ? `<table class="dns-table">
          <thead><tr><th>Zeit</th><th>Ergebnis</th><th>Domain / Antwort</th><th>Typ</th><th>Client-IP</th><th>Hostname</th><th>Protokoll</th><th>Grund</th><th>Dauer</th><th>Aktion</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>` : `<div class="empty"><ha-icon icon="${this._dnsLiveLoading ? "mdi:progress-clock" : "mdi:dns-outline"}"></ha-icon><strong>${this._dnsLiveLoading ? "DNS-Anfragen werden geladen" : "Keine passenden DNS-Anfragen"}</strong>${this._dnsLiveLoading ? "Einen kleinen Moment …" : "Filter ändern oder auf neue Anfragen warten."}</div>`}
      </div>
      ${configurationModal}`;
  }

  _renderAi() {
    const panel = this.shadowRoot.querySelector(".ai-view");
    if (!panel) return;
    const rules = {
      ai_analysis_enabled: false,
      ai_analysis_time: "03:15",
      ai_privacy: "anonymized",
      ...(this._monitor.rules || {}),
    };
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
      ? new Intl.DateTimeFormat("de-DE", {
          dateStyle: "medium", timeStyle: "short",
        }).format(new Date(latestReport.timestamp))
      : "–";
    const history = reports.slice(0, 14).reverse().map((report) => {
      const stamp = new Intl.DateTimeFormat("de-DE", {
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
      <section class="watch-panel ai-settings">
        <div class="watch-heading"><div><h2>KI-Einstellungen</h2><p>Verwendet die bevorzugte Home-Assistant-AI-Task-Entität.</p></div><button class="save-rules save-ai-rules" type="button"><ha-icon icon="mdi:content-save-outline"></ha-icon>KI-Einstellungen speichern</button></div>
        <div class="rule-list">
          <div class="rule"><label>Tägliche KI-Auswertung<small>Automatisch einmal täglich einen Bericht erstellen</small></label><input type="checkbox" data-rule="ai_analysis_enabled" ${rules.ai_analysis_enabled ? "checked" : ""}></div>
          <div class="rule"><label>KI-Auswertung um<small>Erster Netzwerkscan nach diesem Zeitpunkt</small></label><input type="time" data-rule="ai_analysis_time" value="${esc(rules.ai_analysis_time)}"></div>
          <div class="rule"><label>DNS-Datenschutz<small>Anonymisiert überträgt nur Zähler und stabile, neutrale Domain-IDs</small></label><select data-rule="ai_privacy"><option value="anonymized" ${rules.ai_privacy === "anonymized" ? "selected" : ""}>Domains anonymisieren</option><option value="domains" ${rules.ai_privacy === "domains" ? "selected" : ""}>Domainnamen mitsenden</option></select></div>
        </div>
      </section>
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
      onboarding_enabled: true,
      onboarding_auto_range: true,
      onboarding_start: "192.168.178.200",
      onboarding_end: "192.168.178.250",
      onboarding_auto_monitor: false,
      onboarding_notify: false,
      new_device_minutes: 5,
      quiet_hours_enabled: true,
      quiet_start: "23:00",
      quiet_end: "06:00",
      flap_limit: 6,
      offline_minutes: 10,
      identity_changes: true,
      notify_alerts: false,
      ...(this._monitor.rules || {}),
    };
    const learning = this._monitor.learning || {};
    const learningEnd = learning.ends_at
      ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(learning.ends_at))
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
    };
    const labels = {
      new_device: "Unbekanntes Gerät",
      quiet_activity: "Aktivität zur Ruhezeit",
      flapping: "Instabile Verbindung",
      identity_changed: "Identität geändert",
      important_offline: "Wichtiges Gerät offline",
    };
    const alerts = [...(this._monitor.alerts || [])]
      .sort((a, b) => Number(Boolean(b.active)) - Number(Boolean(a.active)) || new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 30);
    const alertHtml = alerts.length ? alerts.map((alert) => {
      const active = alert.active && !alert.acknowledged;
      const time = new Intl.DateTimeFormat("de-DE", {
        dateStyle: "short", timeStyle: "short",
      }).format(new Date(alert.timestamp));
      return `<article class="alert-item ${esc(alert.severity)} ${active ? "" : "resolved"}">
        <div class="alert-symbol"><ha-icon icon="${icons[alert.type] || "mdi:alert-circle-outline"}"></ha-icon></div>
        <div>
          <div class="alert-name">${esc(labels[alert.type] || "Netzwerkhinweis")} · ${esc(alert.name || alert.ip)}</div>
          <div class="alert-message">${esc(alert.message)}</div>
          <div class="alert-time">${esc(time)} · ${esc(alert.ip)}${active ? "" : " · Erledigt"}</div>
        </div>
        ${active ? `<button class="ack" data-alert-id="${esc(alert.id)}">Bestätigen</button>` : ""}
      </article>`;
    }).join("") : `<div class="empty"><ha-icon icon="mdi:shield-check-outline"></ha-icon><strong>Alles ruhig im Netz</strong>Erkannte Auffälligkeiten erscheinen automatisch hier.</div>`;

    const checked = (value) => value ? "checked" : "";
    panel.innerHTML = `
      <div class="security-metrics">
        <article class="security-card"><span>Aktive Warnungen</span><strong>${Number(summary.active || 0)}</strong></article>
        <article class="security-card"><span>Kritisch</span><strong>${Number(summary.critical || 0)}</strong></article>
        <article class="security-card"><span>Unbekannte Geräte</span><strong>${Number(summary.unknown || 0)}</strong></article>
        <article class="security-card"><span>Instabile Geräte</span><strong>${Number(summary.unstable || 0)}</strong></article>
      </div>
      <div class="watch-layout alerts-only">
        <section class="watch-panel">
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
          <div class="watch-heading"><div><h2>Überwachungsregeln</h2><p>Grenzwerte gelten ab dem nächsten Netzwerkscan.</p></div><button class="save-rules save-watch-rules" type="button"><ha-icon icon="mdi:content-save-outline"></ha-icon>Regeln speichern</button></div>
          <div class="rule-list">
            <section class="rule-group basics">
              <h3>Grundlagen</h3>
              <div class="rule"><label>Überwachung aktiv<small>Alle Regeln gemeinsam ein- oder ausschalten</small></label><input type="checkbox" data-rule="enabled" ${checked(rules.enabled)}></div>
              <div class="rule"><label>Lernphase<small>Tage, in denen aktuelle Geräte als bekannt gelten</small></label><input type="number" min="0" max="30" data-rule="learning_days" value="${Number(rules.learning_days)}"></div>
            </section>
            <section class="rule-group presence-settings">
              <h3>Anwesenheit und Geräte</h3>
              <div class="rule"><label>Anwesenheits-Timeout<small>Markierte Geräte gehen sofort online und erst nach dieser Zeit offline (Minuten)</small></label><input type="number" min="1" max="1440" data-rule="presence_timeout_minutes" value="${Number(rules.presence_timeout_minutes)}"></div>
              <div class="rule"><label>Neue Geräte bestätigen<small>Erst nach dieser Online-Zeit warnen (Minuten)</small></label><input type="number" min="1" max="1440" data-rule="new_device_minutes" value="${Number(rules.new_device_minutes)}"></div>
              <div class="rule"><label>Wichtiges Gerät offline<small>Warnung nach Minuten</small></label><input type="number" min="1" max="10080" data-rule="offline_minutes" value="${Number(rules.offline_minutes)}"></div>
            </section>
            <section class="rule-group onboarding-settings">
              <h3>Geräte-Einrichtung</h3>
              <div class="rule"><label>Einrichtungsbereich aktiv<small>Geräte in diesem IP-Bereich als neu kennzeichnen</small></label><input type="checkbox" data-rule="onboarding_enabled" ${checked(rules.onboarding_enabled)}></div>
              <div class="rule"><label>Von FRITZ!Box übernehmen<small>DHCP-Start und -Ende automatisch per TR-064 abfragen</small></label><input type="checkbox" data-rule="onboarding_auto_range" ${checked(rules.onboarding_auto_range)}></div>
              <div class="rule"><label>Bereich beginnt<small>${rules.onboarding_auto_range ? "Automatisch von der FRITZ!Box erkannt" : "Erste DHCP-Adresse für neue Geräte"}</small></label><input type="text" data-rule="onboarding_start" value="${esc(rules.onboarding_start)}" placeholder="192.168.178.200" ${rules.onboarding_auto_range ? "disabled" : ""}></div>
              <div class="rule"><label>Bereich endet<small>${rules.onboarding_auto_range ? "Automatisch von der FRITZ!Box erkannt" : "Letzte DHCP-Adresse für neue Geräte"}</small></label><input type="text" data-rule="onboarding_end" value="${esc(rules.onboarding_end)}" placeholder="192.168.178.250" ${rules.onboarding_auto_range ? "disabled" : ""}></div>
              <div class="rule"><label>Automatisch überwachen<small>Neue Geräte im Einrichtungsbereich direkt mit Stern markieren</small></label><input type="checkbox" data-rule="onboarding_auto_monitor" ${checked(rules.onboarding_auto_monitor)}></div>
              <div class="rule"><label>Benachrichtigung<small>Neue Geräte im Einrichtungsbereich in Home Assistant melden</small></label><input type="checkbox" data-rule="onboarding_notify" ${checked(rules.onboarding_notify)}></div>
            </section>
            <section class="rule-group detection-settings">
              <h3>Ruhezeiten</h3>
              <div class="rule"><label>Ruhezeit überwachen<small>Aktivierungen in diesem Zeitraum melden</small></label><input type="checkbox" data-rule="quiet_hours_enabled" ${checked(rules.quiet_hours_enabled)}></div>
              <div class="rule"><label>Ruhezeit beginnt</label><input type="time" data-rule="quiet_start" value="${esc(rules.quiet_start)}"></div>
              <div class="rule"><label>Ruhezeit endet</label><input type="time" data-rule="quiet_end" value="${esc(rules.quiet_end)}"></div>
            </section>
            <section class="rule-group notification-settings">
              <h3>Benachrichtigungen und Prüfungen</h3>
              <div class="rule"><label>Statuswechsel pro Stunde<small>Ab dieser Anzahl als instabil melden</small></label><input type="number" min="2" max="100" data-rule="flap_limit" value="${Number(rules.flap_limit)}"></div>
              <div class="rule"><label>Identitätswechsel melden<small>Andere MAC-Adresse am gleichen IP-Platz</small></label><input type="checkbox" data-rule="identity_changes" ${checked(rules.identity_changes)}></div>
              <div class="rule"><label>HA-Benachrichtigungen<small>Neue Auffälligkeiten zusätzlich in Home Assistant melden</small></label><input type="checkbox" data-rule="notify_alerts" ${checked(rules.notify_alerts)}></div>
            </section>
            <section class="rule-group danger-zone cleanup-settings">
              <h3>Bereinigung</h3>
              <div class="rule">
                <label>Offline-Teilnehmer löschen<small>Entfernt alle aktuell offline geführten Geräte einschließlich ihrer gespeicherten Einstellungen.</small></label>
                <button class="cleanup" type="button" title="Alle derzeit offline geführten Geräte sofort entfernen"><ha-icon icon="mdi:broom"></ha-icon>Löschen</button>
              </div>
              <div class="cleanup-result" role="status"></div>
            </section>
          </div>
        </section>
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
    const aiSettings = this.shadowRoot.querySelector(
      ".ai-view .ai-settings"
    ) || this.shadowRoot.querySelector(
      ".settings-view .ai-settings"
    );
    panel.replaceChildren(
      ...[watchSettings, aiSettings].filter(Boolean)
    );
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
