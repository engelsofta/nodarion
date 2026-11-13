import { activeLocale, t } from "./panel-i18n.mjs?v=1.30.7";

export const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Only link anonymous HTTP endpoints on the exact discovered device address.
export const deviceWebLinks = (entity) => {
  const attr = entity.attributes || {};
  if (entity.state !== "on" || !Array.isArray(attr.web_urls)) return [];
  return attr.web_urls.filter((value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol)
        && url.hostname === attr.ip_address && !url.username && !url.password
        && url.pathname === "/" && !url.search && !url.hash;
    } catch { return false; }
  });
};

export const deviceWebControl = (entity) => {
  const urls = [...new Set(deviceWebLinks(entity))];
  if (!urls.length) return "";
  const icon = '<ha-icon icon="mdi:open-in-new"></ha-icon>';
  if (urls.length === 1) return `<a class="device-web-link" href="${esc(urls[0])}" target="_blank" rel="noopener noreferrer" title="${esc(urls[0])}">GUI ${icon}</a>`;
  const id = `device-gui-${String(entity.attributes.ip_address).replaceAll(".", "-")}`;
  return `<button type="button" class="device-web-link device-gui-button" popovertarget="${esc(id)}" aria-label="${t("GUI auswählen")}">GUI ${icon}</button><div id="${esc(id)}" class="device-gui-menu" popover="auto">${urls.map(value => {
    const url = new URL(value);
    const label = url.protocol.replace(":", "").toUpperCase() + (url.port ? " · " + url.port : "");
    return `<a href="${esc(value)}" target="_blank" rel="noopener noreferrer" title="${esc(value)}">${esc(label)} ${icon}</a>`;
  }).join("")}</div>`;
};

const ipv4Number = (value) => {
  const parts = String(value || "").split(".");
  if (parts.length !== 4 || parts.some((part) =>
    !/^\d+$/.test(part) || Number(part) > 255
  )) return null;
  return parts.reduce((result, part) => result * 256 + Number(part), 0);
};

export const onboardingStatus = (ip, rules = {}) => {
  if (!rules.onboarding_enabled) return "unknown";
  const value = ipv4Number(ip);
  const start = ipv4Number(rules.onboarding_start);
  const end = ipv4Number(rules.onboarding_end);
  if (value === null || start === null || end === null) return "unknown";
  return value >= Math.min(start, end) && value <= Math.max(start, end)
    ? "onboarding"
    : "assigned";
};

export const formatLease = (seconds) => {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return null;
  const value = Math.max(0, Number(seconds));
  // Some FRITZ!OS versions report 0 when no remaining lease duration is
  // exposed. Treat that as unavailable instead of showing a misleading timer.
  if (value <= 0) return null;
  if (value < 60) return `${Math.round(value)} Sek.`;
  if (value < 3600) return `${Math.round(value / 60)} Min.`;
  if (value < 86400) return `${Math.round(value / 3600)} Std.`;
  return t("{0} Tage", Math.round(value / 86400));
};

export const formatRemainingDuration = (milliseconds) => {
  const value = Math.max(0, Number(milliseconds) || 0);
  if (value < 3600000) {
    return t("{0} Minuten", Math.max(1, Math.ceil(value / 60000)));
  }
  if (value < 86400000) {
    return t("{0} Stunden", Math.ceil(value / 3600000));
  }
  const totalHours = Math.round(value / 3600000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const dayLabel = `${days} ${days === 1 ? t("Tag") : t("Tage")}`;
  return hours ? t("{0} {1} Stunden", dayLabel, hours) : dayLabel;
};

export const formatDateTime = (value) => {
  if (!value) return "–";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "–"
    : new Intl.DateTimeFormat(activeLocale(), {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
      }).format(date);
};

export const isPrivateMac = (value) => {
  const firstOctet = Number.parseInt(String(value || "").replaceAll("-", ":").split(":")[0], 16);
  return Number.isFinite(firstOctet) && Boolean(firstOctet & 0x02);
};

export const formatStateChanged = (value) => {
  if (!value) return t("Zeit unbekannt");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("Zeit unbekannt");
  const day = new Intl.DateTimeFormat(activeLocale(), {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat(activeLocale(), {
    hour: "2-digit", minute: "2-digit",
  }).format(date);
  return `${day}\n${time} Uhr`;
};

export const isRootRouter = (entity) => ["fritz.box", "fritz!box", "fritzbox"].includes(
  String(entity.attributes?.hostname || entity.attributes?.friendly_name || "")
    .trim().replace(/\.$/, "").toLocaleLowerCase("de-DE")
);

export const isNetworkInfrastructure = (entity) => {
  const attr = entity.attributes || {};
  const hostname = String(attr.fritz_hostname || attr.hostname || attr.friendly_name || "")
    .trim().replace(/\.$/, "").toLocaleLowerCase("de-DE");
  if (typeof attr.network_infrastructure === "boolean") return attr.network_infrastructure;
  if (["fritz.box", "fritz!box", "fritzbox"].includes(hostname)) return true;
  const tokens = new Set(hostname.split(/[^a-z0-9!]+/).filter(Boolean));
  return ["router", "repeater", "powerline", "accesspoint"].some((marker) => tokens.has(marker));
};

export const deviceIcon = (entity) => {
  const attr = entity.attributes || {};
  if (attr.vpn_connection || /^(vpn|wireguard)/i.test(String(attr.hostname || attr.friendly_name || ""))) return "mdi:vpn";
  const name = [
    attr.hostname,
    attr.friendly_name,
    attr.model,
    attr.manufacturer,
    attr.mac_vendor,
  ].filter(Boolean).join(" ").toLocaleLowerCase("de-DE");
  const matches = (...terms) => terms.some((term) => name.includes(term));

  if (isNetworkInfrastructure(entity) && !isRootRouter(entity)) return "mdi:access-point-network";

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
  if (matches("repeater", "powerline", "access point", "access-point", "fritz!repeater")) return "mdi:access-point-network";
  if (matches("router", "fritz!box", "gateway")) return "mdi:router-wireless";
  if (matches("thermostat", "sensor", "steckdose", "plug", "shelly", "tuya", "esp", "zigbee", "iot")) return "mdi:chip";
  if (String(attr.connection_type || "").toUpperCase() === "WLAN") return "mdi:wifi";
  return "mdi:lan";
};

export const deviceIconTitle = (entity) => {
  const attr = entity.attributes || {};
  if (attr.vpn_connection || /^(vpn|wireguard)/i.test(String(attr.hostname || attr.friendly_name || ""))) {
    return t("VPN-Verbindung · nicht durch den FRITZ!Box-Hostfilter verwaltet");
  }
  if (attr.guest_network) return t("Gastgerät · durch den FRITZ!Box-Gastzugang verwaltet");
  if (isRootRouter(entity)) return t("Router · geschützte Netzwerkinfrastruktur");
  if (isNetworkInfrastructure(entity)) {
    return attr.infrastructure_source === "mesh_topology"
      ? t("Mesh-Komponente · aus FRITZ!Box-Topologie erkannt")
      : t("Mesh-Komponente · anhand verfügbarer Gerätedaten erkannt");
  }
  return t("Netzwerkteilnehmer · Symbol anhand verfügbarer Gerätedaten");
};

export const blockReason = (value) => ({
  FilteredBlackList: t("Blockliste"),
  FilteredSafeBrowsing: "Safe Browsing",
  FilteredParental: t("Jugendschutz"),
  FilteredSafeSearch: "Safe Search",
  FilteredBlockedService: t("Gesperrter Dienst"),
  FilteredInvalid: t("Ungültige Anfrage"),
}[value] || value || "–");

export const topDomains = (items) => (items || [])
  .map(([domain, count]) => `${domain} (${count})`)
  .join(", ");

export const signalRating = (attr) => {
  const hasDbm = attr.signal_strength_dbm !== null && attr.signal_strength_dbm !== undefined;
  const dbm = Number(attr.signal_strength_dbm);
  if (hasDbm && Number.isFinite(dbm)) {
    if (dbm >= -55) return { level: "good", label: t("Sehr gut") };
    if (dbm >= -67) return { level: "okay", label: t("Gut") };
    if (dbm >= -75) return { level: "warn", label: t("Schwach") };
    return { level: "bad", label: t("Sehr schwach") };
  }
  const hasPercent = attr.signal_strength_percent !== null && attr.signal_strength_percent !== undefined;
  const percent = Number(attr.signal_strength_percent);
  if (!hasPercent || !Number.isFinite(percent)) return null;
  if (percent >= 75) return { level: "good", label: t("Sehr gut") };
  if (percent >= 50) return { level: "okay", label: t("Gut") };
  if (percent >= 25) return { level: "warn", label: t("Schwach") };
  return { level: "bad", label: t("Sehr schwach") };
};

export const dnsRating = (ratio) => {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return null;
  if (value < 5) return { level: "good", label: t("Unauffällig") };
  if (value < 15) return { level: "okay", label: t("Moderat") };
  if (value < 30) return { level: "warn", label: t("Erhöht") };
  return { level: "bad", label: t("Auffällig hoch") };
};
