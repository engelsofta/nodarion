import { esc, deviceWebControl, onboardingStatus, formatLease, formatDateTime, isPrivateMac, formatStateChanged, isNetworkInfrastructure, deviceIcon, deviceIconTitle, blockReason, topDomains, signalRating, dnsRating } from "./panel-formatters.mjs?v=1.30.14";
import { t } from "./panel-i18n.mjs?v=1.30.14";
import { internetStatusFor } from "./internet-status.mjs?v=1.30.14";

export function renderCards() {
  const focusedDevice = this.shadowRoot.activeElement?.closest(".mobile-details")?.dataset.device;
  for (const button of this.shadowRoot.querySelectorAll(".metrics [data-quick-filter]")) {
    const { quickFilter, quickFilterValue } = button.dataset;
    button.classList.toggle("active", this._columnFilters[quickFilter] === quickFilterValue);
  }
  const activeFilter = this.shadowRoot.activeElement?.closest?.(
    "[data-column-filter]"
  );
  const activeFilterState = activeFilter ? {
    key: activeFilter.dataset.columnFilter,
    start: activeFilter.selectionStart,
    end: activeFilter.selectionEnd,
    direction: activeFilter.selectionDirection,
    mobile: Boolean(activeFilter.closest(".mobile-device-controls")),
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
  const internetPresentation = (entity) => {
    const attr = entity.attributes;
    const key = attr.nodarion_key || `ip_${attr.ip_address}`;
    const name = attr.hostname || attr.friendly_name || attr.ip_address;
    const isRouter = ["fritz.box", "fritz!box", "fritzbox"].includes(
      String(attr.hostname || name || "").trim().replace(/\.$/, "").toLocaleLowerCase("de-DE")
    );
    const vpn = Boolean(attr.vpn_connection)
      || /^(vpn|wireguard)/i.test(String(attr.hostname || name));
    const infrastructure = isNetworkInfrastructure(entity);
    return internetStatusFor({
      approvalRequired: !isRouter && !infrastructure && !vpn && !attr.guest_network
        && Boolean(attr.internet_approval_required),
      wanAccess: isRouter ? "granted" : attr.wan_access,
      learningActive: Boolean(this._monitor.learning?.active),
      knownHost: Boolean(attr.trusted) || this._monitor.known_hosts.includes(key),
      guestNetwork: Boolean(attr.guest_network),
      vpnConnection: vpn,
      networkInfrastructure: infrastructure,
    });
  };
  const connectionValue = (entity) => {
    const attr = entity.attributes;
    const name = attr.hostname || attr.friendly_name || "";
    if (attr.vpn_connection || /^(vpn|wireguard)/i.test(String(name))) return "VPN";
    return [attr.connection_type, attr.wifi_band].filter(Boolean).join(" · ") || t("Nicht verfügbar");
  };
  const addressValue = (entity) => entity.attributes.address_source || t("Nicht verfügbar");
  const sourceValues = (entity) => entity.attributes.detection_sources || [];
  let entities = this._entities().filter((entity) => {
    const attr = entity.attributes;
    const filters = this._columnFilters;
    const key = attr.nodarion_key || `ip_${attr.ip_address}`;
    if (!this._matchesDeviceSearch(entity, filters.search)) return false;
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
    if (
      filters.internet
      && internetPresentation(entity).cssClass !== filters.internet
    ) return false;
    if (filters.connection && connectionValue(entity) !== filters.connection) return false;
    if (filters.vlan && (attr.segment_id || "unassigned") !== filters.vlan) return false;
    if (filters.address && addressValue(entity) !== filters.address) return false;
    if (filters.source && !sourceValues(entity).includes(filters.source)) return false;
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
      && matches(attr.access_point, filters.mesh)
      && matches([attr.link_rate_mbps, attr.link_rate_rx_mbps, attr.link_rate_tx_mbps, attr.signal_strength_percent, attr.signal_strength_dbm].join(" "), filters.rate)
      && matches([attr.dns_queries, attr.dns_blocked, attr.dns_blocked_ratio, attr.dns_last_domain].join(" "), filters.dns)
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
    if (this._sort === "vlan") return Number(attr.vlan_id ?? 9999);
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
      ? t("Einrichtungsbereich")
      : lifecycle === "assigned" ? t("Regulärer Bereich") : t("Einrichtung deaktiviert");
    const transitionEvent = (this._monitor.events || []).find(
      (item) => item.key === key && item.type === (online ? "online" : "offline")
    );
    const stateChanged = online
      ? this._monitor.online_since?.[key] || transitionEvent?.timestamp || entity.last_changed
      : this._monitor.offline_since?.[key] || transitionEvent?.timestamp || entity.last_changed;
    const privateMac = isPrivateMac(attr.mac_address);
    const vendorTitle = attr.mac_vendor ? [
      t("Hersteller: {0}", attr.mac_vendor),
      t("Registrierter Präfix: {0}", attr.mac_vendor_prefix || t("Nicht verfügbar")),
      t("Zuteilung: {0}", attr.mac_vendor_block_type || t("Nicht verfügbar")),
      t("Registerstand: {0}", attr.mac_vendor_last_update || t("Nicht verfügbar")),
      t("Quelle: lokale MAC-Vendor-Datei"),
    ].join("\n") : privateMac
      ? t("Lokale bzw. randomisierte MAC-Adresse – eine Herstellerzuordnung ist nicht zuverlässig möglich.")
      : t("Für diesen MAC-Präfix wurde in der lokalen Datei kein Hersteller gefunden.");
    const isFritzRouter = ["fritz.box", "fritz!box", "fritzbox"].includes(
      String(attr.hostname || name || "").trim().replace(/\.$/, "").toLocaleLowerCase("de-DE")
    );
    const vpnConnection = Boolean(attr.vpn_connection)
      || /^(vpn|wireguard)/i.test(String(attr.hostname || name));
    const networkInfrastructure = isNetworkInfrastructure(entity);
    const approvalRequired = !isFritzRouter
      && !networkInfrastructure
      && !vpnConnection
      && !attr.guest_network
      && Boolean(attr.internet_approval_required);
    const wanAccess = isFritzRouter ? "granted" : attr.wan_access;
    const learningActive = Boolean(this._monitor.learning?.active) && !attr.internet_manually_blocked;
    const knownHost = Boolean(attr.trusted)
      || this._monitor.known_hosts.includes(key);
    const internetStatus = internetStatusFor({
      approvalRequired,
      wanAccess,
      learningActive,
      knownHost,
      guestNetwork: Boolean(attr.guest_network),
      vpnConnection,
      networkInfrastructure,
    });
    const internetLabel = t(internetStatus.label);
    const internetClass = internetStatus.cssClass;
    const internetHint = (!attr.internet_control_available && attr.internet_control_reason) || (networkInfrastructure
      ? t("Router und Mesh-Komponenten werden nicht durch den FRITZ!Box-Hostfilter gesteuert.")
      : vpnConnection
      ? t("VPN-Verbindungen werden nicht durch den FRITZ!Box-Hostfilter gesteuert.")
      : attr.guest_network
        ? t("Der Gastzugang wird durch die FRITZ!Box verwaltet.")
        : internetClass === "error"
          ? t("Die FRITZ!Box konnte die gewünschte Änderung nicht ausführen.")
          : approvalRequired ? t("Freigabe durch einen Administrator erforderlich.") : "");
    const specialDeviceClass = vpnConnection
      ? "vpn"
      : attr.guest_network ? "guest" : isFritzRouter ? "router" : networkInfrastructure ? "mesh" : "";
    const sources = (attr.detection_sources || [])
      .map((source) => ({
        fritzbox: "FRITZ!Box",
        ping: "Ping",
        tcp: "TCP",
        ping_tcp: "Ping/TCP",
      })[source] || source)
      .join(" + ") || t("Nicht erkannt");
    const accessPoint = attr.access_point || t("Nicht verfügbar");
    const connection = vpnConnection
      ? "VPN"
      : [attr.connection_type, attr.wifi_band].filter(Boolean).join(" · ") || t("Nicht verfügbar");
    const rates = attr.link_rate_mbps !== null && attr.link_rate_mbps !== undefined
      ? `${attr.link_rate_mbps} Mbit/s`
      : [
          attr.link_rate_rx_mbps !== null && attr.link_rate_rx_mbps !== undefined ? `↓ ${attr.link_rate_rx_mbps} Mbit/s` : null,
          attr.link_rate_tx_mbps !== null && attr.link_rate_tx_mbps !== undefined ? `↑ ${attr.link_rate_tx_mbps} Mbit/s` : null,
        ].filter(Boolean).join(" · ");
    const signal = attr.signal_strength_percent !== null && attr.signal_strength_percent !== undefined
      ? t("{0} % Signal", attr.signal_strength_percent)
      : attr.signal_strength_dbm !== null && attr.signal_strength_dbm !== undefined
        ? `${attr.signal_strength_dbm} dBm`
        : null;
    const signalAssessment = signalRating(attr);
    const sourceKey = String(attr.address_source || "").toUpperCase();
    const addressSource = sourceKey === "DHCP"
      ? "DHCP"
      : sourceKey === "STATIC" ? t("Statisch") : attr.address_source;
    const lease = formatLease(attr.lease_time_remaining);
    const hasAdGuard = attr.adguard_period_hours !== null && attr.adguard_period_hours !== undefined;
    const dnsTitle = hasAdGuard ? [
      t("Zeitraum: {0} Stunden", attr.adguard_period_hours),
      t("Daten vollständig: {0}", attr.adguard_data_complete === false ? t("Nein (Abfragelimit erreicht)") : t("Ja")),
      t("Letzte Aktivität: {0}", formatDateTime(attr.dns_last_activity)),
      t("Letzte Domain: {0}", attr.dns_last_domain || t("Nicht verfügbar")),
      t("Zuletzt blockiert: {0}", attr.dns_last_blocked_domain || t("Nicht verfügbar")),
      t("Treffergrund: {0}", blockReason(attr.dns_last_block_reason)),
      t("DNS-Protokoll: {0}", attr.dns_last_protocol || t("Nicht verfügbar")),
      t("Häufig abgefragt: {0}", topDomains(attr.dns_top_queried_domains) || t("Nicht verfügbar")),
      t("Häufig blockiert: {0}", topDomains(attr.dns_top_blocked_domains) || t("Nicht verfügbar")),
    ].join("\n") : t("DNS-Anbieter ist in Nodarion nicht aktiviert oder nicht erreichbar");
    const dnsPrimary = attr.adguard_bypass_suspected
      ? t("Kein AdGuard-DNS")
      : hasAdGuard ? t("{0} Anfragen", attr.dns_queries || 0) : "–";
    const dnsSecondary = hasAdGuard
      ? `${attr.dns_blocked || 0} blockiert · ${attr.dns_blocked_ratio || 0} %`
      : "";
    const dnsAssessment = hasAdGuard ? dnsRating(attr.dns_blocked_ratio) : null;
    const segmentColor = /^#[0-9a-f]{6}$/i.test(String(attr.segment_color || "")) ? attr.segment_color : "#58b9d6";
    const segmentLabel = attr.segment_name
      ? `${attr.segment_name}${attr.vlan_id ? ` · VLAN ${attr.vlan_id}` : ""}`
      : "Nicht zugeordnet";
    const rowTitle = [
      attr.guest_network ? t("Gerät im Gastnetz") : "",
      lifecycle === "onboarding" ? t("Gerät im DHCP-Einrichtungsbereich") : "",
    ].filter(Boolean).join(" · ");
    const expanded = this._expandedDevices.has(key);
    return `<tr class="${online ? "on" : "off"} ${!online && monitored ? "important-offline" : ""} ${lifecycle === "onboarding" ? "onboarding-row" : ""} ${attr.guest_network ? "guest-row" : ""} ${attr.segment_id ? "vlan-device-row" : ""} ${expanded ? "mobile-expanded" : ""}" style="--vlan-color:${esc(segmentColor)}" ${rowTitle ? `title="${esc(rowTitle)}"` : ""}>
      <td data-column="state" data-label="Status"><div class="status-cell"><div class="status"><i class="dot"></i>${online ? "Online" : "Offline"}</div><span class="status-time">${esc(formatStateChanged(stateChanged))}</span></div></td>
      <td data-column="onboarding" data-label="${t("IP-Bereich")}"><span class="onboarding-state ${lifecycle}">${esc(lifecycleLabel)}</span></td>
      <td data-column="vlan" data-label="VLAN"><div class="detail-stack"><strong>${esc(segmentLabel)}</strong><small>${esc(({trusted:t("Vertrauenswürdig"),restricted:t("Eingeschränkt"),guest:t("Gast"),isolated:t("Isoliert"),infrastructure:t("Infrastruktur")})[attr.segment_role] || attr.segment_role || t("Keine Rolle"))}${attr.segment_monitoring === false ? t(" · nicht überwacht") : ""}</small></div></td>
      <td data-column="name" data-label="${t("Teilnehmer")}"><div class="device-cell">
        <span class="device-icon ${specialDeviceClass}" title="${esc(deviceIconTitle(entity))}"><ha-icon icon="${deviceIcon(entity)}"></ha-icon></span>
        <div class="device-label"><div class="device-name-line"><button class="entity-link" data-key="${esc(key)}" data-name="${esc(name)}" title="${t("Live-Log dieses Geräts anzeigen")}">${esc(name)}</button><span class="status mobile-device-status"><i class="dot"></i>${online ? "Online" : "Offline"}</span></div>
        <button class="entity-id-link" data-entity-id="${esc(entity.entity_id)}" title="${t("Home-Assistant-Dialog öffnen")}">${esc(entity.entity_id)}</button></div>
        <button class="watch mobile-details" type="button" data-device="${esc(key)}" aria-expanded="${expanded}" aria-label="${t("Weitere Gerätedetails anzeigen")}" title="${t("Weitere Gerätedetails anzeigen")}"><ha-icon icon="mdi:chevron-down"></ha-icon></button>
      </div>
      </td>
      <td data-column="ip" data-label="${t("IP-Adresse")}" class="mono"><div class="device-ip-line"><span>${esc(attr.ip_address || t("Nicht verfügbar"))}</span>${deviceWebControl(entity)}</div></td>
      <td data-column="mac" data-label="${t("MAC-Adresse")}" class="mono" title="${esc(vendorTitle)}">${esc(attr.mac_address || t("Nicht erkannt"))}${attr.mac_vendor ? `<span class="mac-vendor" title="${esc(vendorTitle)}"><ha-icon icon="mdi:factory"></ha-icon>${esc(attr.mac_vendor)}</span>` : ""}${privateMac ? `<span class="private-mac" title="${t("Lokal verwaltete bzw. randomisierte MAC-Adresse; Änderungen lösen keine Identitätswarnung aus")}"><ha-icon icon="mdi:incognito"></ha-icon>${t("Privat / randomisiert")}</span>` : ""}</td>
      <td data-column="connection" data-label="${t("Verbindung")}"><div class="detail-stack"><strong>${esc(connection)}</strong></div></td>
      <td data-column="mesh" data-label="${t("Mesh-Punkt")}"><div class="detail-stack"><strong>${esc(accessPoint)}</strong></div></td>
      <td data-column="rate" data-label="WLAN"><div class="detail-stack"><strong>${esc(rates || t("Nicht verfügbar"))}</strong>${signal ? `<span class="rating ${signalAssessment?.level || "okay"}" title="${t("WLAN-Empfang: {0}", esc(signalAssessment?.label || t("Nicht bewertet")))}"><span class="rating-label">${esc(signal)} · ${esc(signalAssessment?.label || "")}</span></span>` : ""}</div></td>
      <td data-column="address" data-label="${t("Adressvergabe")}"><div class="detail-stack"><strong>${esc(addressSource || t("Nicht verfügbar"))}</strong>${addressSource === "DHCP" && lease ? `<small>${t("Noch {0}", esc(lease))}</small>` : ""}</div></td>
      <td data-column="dns" data-label="DNS" title="${esc(dnsTitle)}"><button class="dns-live-link" type="button" data-ip="${esc(attr.ip_address)}" data-name="${esc(name)}" title="${t("DNS-Live-Log für {0} öffnen", esc(name))}"><span class="detail-stack"><strong class="${attr.adguard_bypass_suspected ? "dns-alert" : ""}">${esc(dnsPrimary)}</strong>${dnsSecondary ? `<span class="rating ${dnsAssessment?.level || "okay"}" title="${t("Anteil blockierter DNS-Anfragen: {0}", esc(dnsAssessment?.label || t("Nicht bewertet")))}"><span class="rating-label">${esc(dnsSecondary)} · ${esc(dnsAssessment?.label || "")}</span></span>` : ""}</span></button></td>
      <td data-column="source" data-label="${t("Erkannt durch")}">${esc(sources)}</td>
      <td data-column="internet" data-label="${t("Internetzugang")}"><div class="internet-state"><span class="internet-label ${esc(internetClass)}">${esc(internetLabel)}</span>${internetHint ? `<small class="internet-hint">${esc(internetHint)}</small>` : ""}${(approvalRequired && attr.internet_control_available) ? `<button class="approve-internet" data-key="${esc(key)}" data-name="${esc(name)}" data-entity-id="${esc(entity.entity_id)}">${t("Freigeben")}</button>` : attr.internet_control_available ? `<button class="block-internet" data-key="${esc(key)}" data-name="${esc(name)}" title="${t("Internetzugang sperren")}"><ha-icon icon="mdi:lock-outline"></ha-icon>${t("Sperren")}</button>` : ""}</div></td>
      <td data-column="watch" data-label="${t("Überwachung")}">
        <div class="card-actions">
          <button class="watch ${monitored ? "active" : ""}" data-key="${esc(key)}" title="${monitored ? t("Überwachung beenden") : t("Als wichtig überwachen")}"><ha-icon icon="${monitored ? "mdi:star" : "mdi:star-outline"}"></ha-icon></button>
          <button class="watch notify ${notify ? "active" : ""}" data-key="${esc(key)}" title="${notify ? "Offline-Meldung deaktivieren" : "Bei Offline melden"}"><ha-icon icon="${notify ? "mdi:bell" : "mdi:bell-outline"}"></ha-icon></button>
          <button class="watch presence ${presence ? "active" : ""}" data-key="${esc(key)}" title="${presence ? "Aus Anwesenheitssteuerung entfernen" : t("Für Anwesenheitssteuerung verwenden · Offline nach {0} Min.", Number(this._monitor.rules?.presence_timeout_minutes || 5))}"><ha-icon icon="mdi:home-account"></ha-icon></button>
        </div>
      </td>
    </tr>`;
  }).join("");
  const columns = [
    ["state", "Status"], ["onboarding", t("IP-Bereich")],
    ["vlan", "VLAN"],
    ["name", t("Teilnehmer")], ["ip", t("IP-Adresse")],
    ["mac", t("MAC-Adresse")], ["connection", t("Verbindung")], ["mesh", t("Mesh-Zugangspunkt")],
    ["rate", t("WLAN-Daten")], ["address", t("Adressvergabe")], ["dns", "DNS"],
    ["source", t("Erkannt durch")], ["internet", t("Internetzugang")], ["watch", t("Überwachung")],
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
    const buttons = options.map((option) => `<button type="button" role="option" aria-selected="${value === option.value}" class="custom-filter-option ${value === option.value ? "active" : ""}" data-column-filter-key="${key}" data-column-filter-value="${esc(option.value)}"><ha-icon icon="${value === option.value ? "mdi:check" : option.icon}"></ha-icon><span>${esc(option.label)}</span><span class="custom-filter-count">${Number(option.count || 0)}</span></button>`).join("");
    return `<details class="custom-column-filter ${value ? "has-value" : ""}" data-column-filter-key="${key}" ${minWidth ? `style="min-width:${minWidth}"` : ""}><summary aria-label="${esc(`${selected.label}; Filter ${key}`)}">${esc(selected.label)}</summary><div class="custom-filter-menu" role="listbox">${buttons}</div></details>`;
  };
  const stateFilter = customFilter("state", [
    { value:"", label:t("Alle"), icon:"mdi:lan", count:allEntities.length },
    { value:"on", label:"Online", icon:"mdi:check-network-outline", count:countWhere((entity) => entity.state === "on") },
    { value:"off", label:"Offline", icon:"mdi:lan-disconnect", count:countWhere((entity) => entity.state === "off") },
    { value:"guest", label:t("Gastzugang"), icon:"mdi:wifi-star", count:countWhere((entity) => Boolean(entity.attributes.guest_network)) },
  ], "150px");
  const onboardingFilter = customFilter("onboarding", [
    { value:"", label:t("Alle IP-Bereiche"), icon:"mdi:tag-multiple-outline", count:allEntities.length },
    { value:"onboarding", label:t("Einrichtungsbereich"), icon:"mdi:star-four-points-outline", count:countWhere((entity) => onboardingStatus(entity.attributes.ip_address, this._monitor.rules) === "onboarding") },
    { value:"assigned", label:t("Regulärer Bereich"), icon:"mdi:check-decagram-outline", count:countWhere((entity) => onboardingStatus(entity.attributes.ip_address, this._monitor.rules) === "assigned") },
    { value:"unknown", label:t("Einrichtung deaktiviert"), icon:"mdi:minus-circle-outline", count:countWhere((entity) => onboardingStatus(entity.attributes.ip_address, this._monitor.rules) === "unknown") },
  ]);
  const segmentCounts = new Map();
  allEntities.forEach((entity) => {
    const id = entity.attributes.segment_id || "unassigned";
    const current = segmentCounts.get(id) || {
      id,
      name:entity.attributes.segment_name || "Nicht zugeordnet",
      vlanId:entity.attributes.vlan_id,
      count:0,
    };
    current.count += 1;
    segmentCounts.set(id, current);
  });
  const vlanFilter = customFilter("vlan", [
    { value:"", label:"Alle VLANs", icon:"mdi:lan", count:allEntities.length },
    ...[...segmentCounts.values()].sort((a, b) => Number(a.vlanId || 9999) - Number(b.vlanId || 9999)).map((segment) => ({
      value:segment.id,
      label:segment.vlanId ? `${segment.name} · VLAN ${segment.vlanId}` : segment.name,
      icon:"mdi:lan-connect",
      count:segment.count,
    })),
  ], "190px");
  const watchFilter = customFilter("watch", [
    { value:"", label:t("Alle Funktionen"), icon:"mdi:tune-variant", count:allEntities.length },
    { value:"monitored", label:t("Überwacht"), icon:"mdi:star-outline", count:countWhere((entity) => this._monitor.monitored.includes(entity.attributes.nodarion_key)) },
    { value:"notify", label:t("Offline-Meldung"), icon:"mdi:bell-outline", count:countWhere((entity) => this._monitor.notifications.includes(entity.attributes.nodarion_key)) },
    { value:"presence", label:t("Anwesenheit"), icon:"mdi:home-account", count:countWhere((entity) => this._monitor.presence_devices.includes(entity.attributes.nodarion_key)) },
    { value:"none", label:t("Keine Funktion"), icon:"mdi:minus-circle-outline", count:countWhere((entity) => { const key = entity.attributes.nodarion_key; return !this._monitor.monitored.includes(key) && !this._monitor.notifications.includes(key) && !this._monitor.presence_devices.includes(key); }) },
  ], "180px");
  const internetCounts = new Map();
  allEntities.forEach((entity) => {
    const status = internetPresentation(entity);
    const current = internetCounts.get(status.cssClass) || {
      value: status.cssClass,
      label: status.label,
      count: 0,
    };
    current.count += 1;
    internetCounts.set(status.cssClass, current);
  });
  const internetOrder = ["denied", "pending", "error", "unchecked", "unmanaged", "infrastructure", "learning", "trusted", "allowed"];
  const internetFilter = customFilter("internet", [
    { value:"", label:t("Alle Internetstatus"), icon:"mdi:web", count:allEntities.length },
    ...[...internetCounts.values()]
      .sort((a, b) => internetOrder.indexOf(a.value) - internetOrder.indexOf(b.value))
      .map((option) => ({ ...option, icon:"mdi:shield-outline" })),
  ], "210px");
  const countedOptions = (values, allLabel, icon) => {
    const counts = new Map();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    return [
      { value:"", label:allLabel, icon, count:values.length },
      ...[...counts.entries()].sort(([a], [b]) => a.localeCompare(b, "de"))
        .map(([value, count]) => ({ value, label:value, icon, count })),
    ];
  };
  const connectionFilter = customFilter("connection", countedOptions(
    allEntities.map(connectionValue), t("Alle Verbindungen"), "mdi:lan-connect"
  ), "180px");
  const addressFilter = customFilter("address", countedOptions(
    allEntities.map(addressValue), t("Alle Adressvergaben"), "mdi:ip-network-outline"
  ), "185px");
  const sourceLabels = { fritzbox:"FRITZ!Box", ping:"Ping", tcp:"TCP", ping_tcp:"Ping/TCP" };
  const sourceOptions = countedOptions(
    allEntities.flatMap(sourceValues), t("Alle Erkennungsquellen"), "mdi:radar"
  ).map((option) => ({ ...option, label:sourceLabels[option.value] || option.label }));
  const sourceFilter = customFilter("source", sourceOptions, "190px");
  const meshCounts = new Map();
  allEntities.filter((entity) => entity.state === "on").forEach((entity) => {
    const accessPoint = entity.attributes.access_point;
    if (accessPoint) meshCounts.set(accessPoint, (meshCounts.get(accessPoint) || 0) + 1);
  });
  const meshOptions = [...meshCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "de"))
    .map(([name, count]) => `<button type="button" class="custom-filter-option ${this._columnFilters.mesh === name ? "active" : ""}" data-column-filter-key="mesh" data-column-filter-value="${esc(name)}"><ha-icon icon="${this._columnFilters.mesh === name ? "mdi:check" : "mdi:access-point"}"></ha-icon><span>${esc(name)}</span><span class="custom-filter-count">${count}</span></button>`)
    .join("");
  const selectedMesh = this._columnFilters.mesh || t("Alle Mesh-Punkte");
  const filterNames = { search:t("Suche"), state:"Status", onboarding:t("IP-Bereich"), vlan:"VLAN", name:t("Teilnehmer"), ip:t("IP-Adresse"), mac:t("MAC-Adresse"), connection:t("Verbindung"), mesh:"Mesh", rate:"WLAN", address:t("Adressvergabe"), dns:"DNS", source:t("Erkannt durch"), internet:t("Internetzugang"), watch:t("Überwachung") };
  const filterValueNames = { on:"Online", off:"Offline", guest:t("Gastzugang"), onboarding:t("Einrichtungsbereich"), assigned:t("Regulärer Bereich"), unknown:t("Einrichtung deaktiviert"), monitored:t("Überwacht"), notify:t("Offline-Meldung"), presence:t("Anwesenheit"), none:t("Keine Funktion"), denied:t("Gesperrt"), pending:t("Freigabe ausstehend"), error:t("Freigabe fehlgeschlagen"), unchecked:t("Noch nicht geprüft"), unmanaged:t("Nicht verwaltet"), infrastructure:t("Netzwerkinfrastruktur"), learning:t("Lernphase"), trusted:t("Vertrauenswürdig"), allowed:t("Freigegeben"), ...sourceLabels, ...Object.fromEntries([...segmentCounts.values()].map((segment) => [segment.id, segment.vlanId ? `${segment.name} · VLAN ${segment.vlanId}` : segment.name])) };
  const activeFilters = Object.entries(this._columnFilters).filter(([, value]) => value);
  const filterChips = activeFilters.length ? `<div class="filter-chips" role="status" aria-label="${t("Aktive Filter")}">${activeFilters.map(([key, value]) => `<button class="filter-chip" type="button" data-clear-column-filter="${esc(key)}" aria-label="${t("Filter {0} entfernen", esc(filterNames[key] || key))}"><span>${esc(filterNames[key] || key)}: ${esc(filterValueNames[value] || value)}</span><ha-icon icon="mdi:close"></ha-icon></button>`).join("")}<button class="filter-reset" type="button" data-clear-all-filters>${t("Alle Filter zurücksetzen")}</button></div>` : "";
  const emptyRow = `<tr><td colspan="14"><div class="empty" role="status">${allEntities.length
    ? `<ha-icon icon="mdi:filter-off-outline"></ha-icon><strong>${t("Keine passenden Geräte")}</strong>${t("Filter ändern oder leeren.")}`
    : this._emptyScanMessage()}</div></td></tr>`;
  const mobileFilterCount = activeFilters.filter(([key]) => key !== "search").length;
  const mobileFilter = (label, control) => `<div class="mobile-filter-field"><span>${esc(label)}</span>${control}</div>`;
  const meshFilter = customFilter("mesh", countedOptions(allEntities.map(entity => entity.attributes.access_point).filter(Boolean), t("Alle Mesh-Punkte"), "mdi:access-point"));
  const mobileControls = `<div class="mobile-device-controls"><div class="mobile-search-row"><label class="mobile-device-search"><ha-icon icon="mdi:magnify"></ha-icon><input type="search" data-column-filter="search" value="${esc(this._columnFilters.search || "")}" placeholder="${t("Geräte suchen …")}" aria-label="${t("Geräte suchen")}" autocomplete="off"></label><button class="mobile-filter-toggle ${mobileFilterCount ? "active" : ""}" type="button" aria-label="${t("Geräte filtern")}" aria-expanded="${this._mobileFiltersExpanded}" aria-controls="mobile-device-filters"><ha-icon icon="mdi:filter-variant"></ha-icon>${mobileFilterCount ? `<span>${mobileFilterCount}</span>` : ""}</button></div>
    <div class="mobile-device-filters" id="mobile-device-filters" ${this._mobileFiltersExpanded ? "" : "hidden"}>
      ${mobileFilter("Status", stateFilter)}${mobileFilter(t("IP-Bereich"), onboardingFilter)}${mobileFilter("VLAN", vlanFilter)}${mobileFilter("Mesh", meshFilter)}${mobileFilter("Funktion", watchFilter)}${mobileFilter(t("Verbindung"), connectionFilter)}${mobileFilter(t("Internetzugang"), internetFilter)}${mobileFilter(t("Adressvergabe"), addressFilter)}${mobileFilter(t("Erkannt durch"), sourceFilter)}
    </div></div>`;
  grid.innerHTML = `${mobileControls}${filterChips}<table aria-label="${t("Netzwerkgeräte")}">
    <thead>
      <tr>${heading("Status", "state")}${heading(t("IP-Bereich"), "onboarding")}${heading("VLAN", "vlan")}${heading(t("Teilnehmer"), "name")}${heading(t("IP-Adresse"), "ip")}${heading(t("MAC-Adresse"), "mac")}${heading(t("Verbindung"), "connection")}${heading(t("Mesh-Zugangspunkt"), "mesh")}${heading(t("WLAN-Daten"), "rate")}${heading(t("Adressvergabe"), "address")}${heading("DNS", "dns")}${heading(t("Erkannt durch"), "source")}<th data-column="internet" class="no-sort">${t("Internetzugang")}</th><th data-column="watch" class="no-sort">${t("Überwachung")}</th></tr>
      <tr class="column-filters">
        <th data-column="state">${stateFilter}</th>
        <th data-column="onboarding">${onboardingFilter}</th>
        <th data-column="vlan">${vlanFilter}</th>
        ${filterInput("name", "Name oder *")}
        ${filterInput("ip", "IP oder *")}
        ${filterInput("mac", "MAC oder *")}
        <th data-column="connection">${connectionFilter}</th>
        <th data-column="mesh"><details class="custom-column-filter ${this._columnFilters.mesh ? "has-value" : ""}" data-column-filter-key="mesh"><summary>${esc(selectedMesh)}</summary><div class="custom-filter-menu"><button type="button" class="custom-filter-option ${this._columnFilters.mesh ? "" : "active"}" data-column-filter-key="mesh" data-column-filter-value=""><ha-icon icon="${this._columnFilters.mesh ? "mdi:access-point-network" : "mdi:check"}"></ha-icon><span>${t("Alle Mesh-Punkte")}</span><span class="custom-filter-count">${[...meshCounts.values()].reduce((sum, count) => sum + count, 0)}</span></button>${meshOptions}</div></details></th>
        ${filterInput("rate", "Rate / Signal")}
        <th data-column="address">${addressFilter}</th>
        ${filterInput("dns", "DNS / Domain")}
        <th data-column="source">${sourceFilter}</th>
        <th data-column="internet">${internetFilter}</th>
        <th data-column="watch">${watchFilter}</th>
      </tr>
    </thead>
    <tbody>${rows || emptyRow}</tbody>
  </table>`;
  grid.querySelectorAll("[data-column]").forEach((cell) => {
    cell.toggleAttribute("hidden", this._columnVisibility[cell.dataset.column] === false);
  });
  if (focusedDevice) {
    [...grid.querySelectorAll(".mobile-details")]
      .find(button => button.dataset.device === focusedDevice)?.focus({ preventScroll: true });
  }
  if (activeFilterState) {
    const replacement = grid.querySelector(
      `${activeFilterState.mobile ? ".mobile-device-controls " : "table "}[data-column-filter="${activeFilterState.key}"]`
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
    <div class="column-picker-head"><span>${t("Spalten auswählen")}</span><button class="column-picker-close" type="button" title="${t("Schließen")}" aria-label="${t("Spaltenauswahl schließen")}"><ha-icon icon="mdi:close"></ha-icon></button></div>
    ${columns.map(([key, label]) =>
      `<label><input type="checkbox" data-column-toggle="${key}" ${this._columnVisibility[key] === false ? "" : "checked"}>${esc(label)}</label>`
    ).join("")}`;
}
