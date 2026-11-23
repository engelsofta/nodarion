import { deviceIcon, esc } from "./panel-formatters.mjs?v=1.32.0";
import { panelLocale, t as panelText } from "./panel-i18n.mjs?v=1.32.0";

const english = {
  "Mesh-Karte": "Mesh map",
  "Mesh-Knoten": "Mesh nodes",
  "Uplink nicht gemeldet": "Uplink not reported",
  "WLAN-Geräte": "Wi-Fi devices",
  "Zuletzt gemeldete Topologie": "Last reported topology",
  "Keine Mesh-Knoten gemeldet": "No mesh nodes reported",
  "Warte auf FRITZ!Box-Topologiedaten.": "Waiting for FRITZ!Box topology data.",
  "FRITZ!Box-Verbindung in Nodarion einrichten.": "Set up the FRITZ!Box connection in Nodarion.",
  "Ein Gerät für Verbindungsdetails auswählen.": "Select a device for connection details.",
  "Kein aktiver Mesh-Link gemeldet": "No active mesh link reported",
  "Weg zum Mesh-Master": "Path to the mesh master",
  "Mesh-Master": "Mesh master",
  "Verbindungstyp unbekannt": "Unknown link type",
  "Signal unbekannt": "Unknown signal",
  "Stark": "Strong",
  "Mittel": "Fair",
  "Schwach": "Weak",
};
const t = (label) => panelLocale === "de" ? label : english[label] ?? panelText(label);
export const meshMapLabel = () => t("Mesh-Karte");

export const meshStyles = `
  .mesh-map {
    --mesh-lan: #6ce3fc;
    --mesh-strong: #85ebae;
    --mesh-fair: #ffd177;
    --mesh-weak: #ff858a;
    --mesh-unknown: #98a4bd;
    padding: clamp(14px, 2.5vw, 28px);
    border: 1px solid #35425c;
    border-radius: 22px;
    color: #eaf0fc;
    background: radial-gradient(ellipse at 50% 28%, #1b2a44, #101827 72%);
  }
  .mesh-map [hidden] { display: none !important; }
  .mesh-heading, .mesh-legend {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  }
  .mesh-heading { justify-content: space-between; margin-bottom: 16px; }
  .mesh-heading h2 { margin: 0; font-size: clamp(22px, 3vw, 34px); letter-spacing: -.04em; }
  .mesh-count, .mesh-empty { margin: 5px 0 0; color: #bcc8dd; }
  .mesh-status {
    display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px;
    color: #ffd177; border: 1px solid currentColor; border-radius: 999px; font-size: 11px;
  }
  .mesh-status.fresh { color: var(--mesh-strong); letter-spacing: .12em; }
  .mesh-status i, .mesh-device i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
  .mesh-scroll { overflow: auto; height: clamp(280px, 65vh, 860px); min-width: 0; }
  .mesh-canvas { position: relative; overflow: clip; }
  .mesh-heading small { margin-left: auto; color: var(--ns-muted); }
  .mesh-map .mesh-node:not(.client) { --node-size: 60px; z-index: 2; }
  .mesh-map .mesh-node.master { --node-size: 72px; }
  .mesh-map .mesh-node:not(.client) strong { font-size: 13px; font-weight: 700; }
  .mesh-lines line.backhaul { stroke-width: 3; opacity: .78; }
  .mesh-lines line.backhaul[data-quality="unreported"] { stroke-width: 3; }
  .mesh-stage {
    position: absolute; transform-origin: top left;
    min-width: max(290px, calc(var(--stage-width, 310px) * var(--rings, 1)));
    height: max(clamp(340px, 50vw, 490px), calc(var(--stage-height, 300px) * var(--rings, 1)));
    isolation: isolate;

  }
  .mesh-lines { position: absolute; inset: 0; overflow: visible; pointer-events: none; }
  .mesh-lines line {
    stroke: var(--mesh-unknown); stroke-width: 2; stroke-linecap: round;
    stroke-dasharray: 4 6; transition: stroke .25s, opacity .25s, stroke-width .25s;
    animation: mesh-link-in .75s both;
  }
  .mesh-lines [data-quality="lan"] { stroke: var(--mesh-lan); stroke-dasharray: none; }
  .mesh-lines [data-quality="strong"] { stroke: var(--mesh-strong); }
  .mesh-lines [data-quality="fair"] { stroke: var(--mesh-fair); }
  .mesh-lines [data-quality="weak"] { stroke: var(--mesh-weak); }
  .mesh-lines [data-quality="powerline"] { stroke: #c4a0ff; stroke-dasharray: 9 4; }
  .mesh-lines [data-quality="unreported"] { stroke: #98a4bd; stroke-dasharray: 2 8; opacity: .55; }
  .mesh-stage.has-path line:not(.on-path) { opacity: .26; }
  .mesh-lines .on-path { stroke-width: 4; filter: drop-shadow(0 0 5px #71dfff9c); }
  .mesh-node {
    position: absolute; z-index: 1; display: grid; justify-items: center;
    gap: 7px; width: 112px; padding: 0; border: 0; border-radius: 10px;
    background: transparent; color: #eaf0fc; font: inherit; cursor: pointer;
    transform: translate(-50%, calc(-1 * var(--node-size) / 2));
    --node-size: 44px;
    animation: mesh-link-in .45s both;
  }
  .mesh-node.master { --node-size: 58px; }
  .mesh-node.client { --node-size: 34px; width: 116px; }
  .mesh-node.client ha-icon { --mdc-icon-size: 16px; }
  .mesh-node.client strong { font-size: 12px; font-weight: 500; }
  .mesh-node.client .mesh-device { box-shadow: none; }
  .mesh-legend .radio-sample::before { display: none; }
  .radio-sample svg { margin-right: 5px; vertical-align: middle; }
  .mesh-node.client .mesh-device i { width: 5px; height: 5px; }
  .mesh-map:has(.mesh-node.client) .mesh-scroll { max-height: 70vh; }
  .mesh-node:focus-visible { outline: 2px solid #8fe3ff; outline-offset: 4px; }
  .mesh-device {
    position: relative; display: grid; place-items: center;
    width: var(--node-size); height: var(--node-size); border-radius: 50%;
    color: #b2e6ff; background: #152940; border: 1px solid #679bbc;
    box-shadow: 0 0 22px #63c8ff30; transition: box-shadow .25s, scale .25s;
  }
  .mesh-node.master .mesh-device {
    color: #ffe1a1; background: #302a2f; border-color: #f3c674;
    box-shadow: 0 0 0 7px #f3c67420, 0 0 30px #f3c67448;
  }
  .mesh-device i {
    position: absolute; right: 0; bottom: 2px; color: var(--mesh-strong);
    outline: 2px solid #142136;
  }
  .mesh-node.offline .mesh-device { color: #adb7ca; border-color: #748097; box-shadow: none; }
  .mesh-node.offline .mesh-device i { color: var(--mesh-weak); }
  .mesh-node:hover .mesh-device, .mesh-node[aria-pressed="true"] .mesh-device {
    scale: 1.1; box-shadow: 0 0 0 5px #81d6ff46, 0 0 30px #81d6ff65;
  }
  .mesh-node strong {
    padding: 2px 5px; border-radius: 5px; background: #0b1323e8;
    max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: 11px; line-height: 1.4;
  }
  .mesh-map .leaving { pointer-events: none; animation: mesh-link-out .4s both; }
  .mesh-legend { padding: 13px 0; color: #d3def1; font-size: 12px; }
  .mesh-legend span::before {
    content: ""; display: inline-block; width: 13px; margin-right: 5px;
    vertical-align: middle; border-top: 2px dashed var(--mesh-unknown);
  }
  .mesh-legend .lan::before { border-top: 2px solid var(--mesh-lan); }
  .mesh-legend .strong::before { border-color: var(--mesh-strong); }
  .mesh-legend .fair::before { border-color: var(--mesh-fair); }
  .mesh-legend .weak::before { border-color: var(--mesh-weak); }
  .mesh-legend .unreported::before { border-top-style: dotted; }
  .mesh-legend .powerline::before { border-color: #c4a0ff; }
  .mesh-details {
    min-height: 54px; padding: 12px; border-radius: 10px; background: #0b1323;
    color: #c1cee5; font-size: 13px; overflow-wrap: anywhere;
  }
  .mesh-details strong { color: #eaf0fc; margin-right: 9px; }
  .mesh-details small { color: #aec6e6; }
  .mesh-details ul { padding-left: 18px; margin: 5px 0 0; }
  .mesh-details li span { margin-right: 9px; }
  .mesh-map {
    border: 1px solid var(--ns-line); border-radius: 25px;
    background: var(--ns-room-glass); box-shadow: var(--ns-room-shadow);
    backdrop-filter: blur(18px); color: var(--ns-text);
  }
  .mesh-count, .mesh-empty, .mesh-legend, .mesh-details small { color: var(--ns-muted); }
  .mesh-details, .mesh-node strong {
    background: var(--ns-room-glass); color: var(--ns-text); border: 1px solid var(--ns-line);
  }
  .mesh-details strong { color: var(--ns-text); }
  .mesh-node strong { border-radius: 8px; }
  .mesh-node { transition: opacity .22s ease; }
  .mesh-node.outside-selection { opacity: .42; }
  .mesh-search { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .mesh-search input { max-width:100%; padding:8px 12px; border-radius:10px; border:1px solid var(--ns-line); background:var(--ns-room-glass); color:var(--ns-text); font:inherit; }
  .mesh-search output { color:var(--ns-muted); font-size:12px; }
  .mesh-legend button { appearance:none; cursor:pointer; font:inherit; color:inherit; background:transparent; border:1px solid transparent; border-radius:6px; padding:4px; }
  .mesh-legend button:hover, .mesh-legend button[aria-pressed="true"] { background:var(--ns-room-glass); border-color:currentColor; }
  .mesh-map .mesh-lines line.filter-miss { opacity:.10; }
  .mesh-map .mesh-node.search-miss { opacity:.28; }
  .mesh-map .mesh-node.search-hit { opacity:1; z-index:3; }
  .mesh-node.search-hit .mesh-device { outline:3px solid #f6bf58; outline-offset:3px; }
  .mesh-node.outside-selection:hover, .mesh-node.outside-selection:focus-visible { opacity: 1; }
  :host([data-theme="light"]) .mesh-map {
    --mesh-lan: #007799; --mesh-strong: #217346; --mesh-fair: #936000;
    --mesh-weak: #aa3841; --mesh-unknown: #646873;
  }
  @keyframes mesh-link-in {
    0% { opacity: 0; filter: drop-shadow(0 0 8px #80dfff); }
    45% { opacity: 1; filter: drop-shadow(0 0 8px #80dfff); }
  }
  @keyframes mesh-link-out { to { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .mesh-map *, .mesh-map .leaving { animation: none !important; transition: none !important; }
    .mesh-map .leaving { visibility: hidden; }
  }
  @media (max-width: 800px) {
    .panel-navigation { grid-template-columns: repeat(7, minmax(0, 1fr)); }
  }
`;

const SVG = "http://www.w3.org/2000/svg";
const radioPatterns = { "2,4 GHz": "1 6", "5 GHz": "13 6", "6 GHz": "9 4 3 4" };
const mixedRadioPattern = "13 5 1 5";
const CENTER = 50;
const linkKey = (link) => JSON.stringify([link.source, link.target, link.medium]);

function quality(link) {
  if (link.unreported) return "unreported";
  if (link.medium === "Powerline") return "powerline";
  if (link.medium === "LAN") return "lan";
  if (link.medium !== "WLAN" || !Number.isFinite(link.signal)) return "unknown";
  if (link.signal >= -62) return "strong";
  return link.signal >= -75 ? "fair" : "weak";
}

function pathToMaster(selected, nodes, links) {
  const masters = new Set(nodes.filter((node) => node.master).map((node) => node.id));
  const clients = new Set(nodes.filter((node) => node.client).map((node) => node.id));
  const visited = new Set([selected]);
  const queue = [{ id: selected, path: [] }];
  for (const { id, path } of queue) {
    if (masters.has(id)) return new Set(path);
    for (const link of links) {
      if (link.unreported) continue;
      const neighbor = link.source === id ? link.target : link.target === id ? link.source : null;
      if (neighbor === null || visited.has(neighbor) || clients.has(neighbor)) continue;
      visited.add(neighbor);
      queue.push({ id: neighbor, path: [...path, linkKey(link)] });
    }
  }
  return new Set();
}

function displayLinks(nodes, reported) {
  const master = nodes.find((node) => node.master);
  if (!master) return reported;
  const meshIds = new Set(nodes.filter((node) => !node.client).map(({ id }) => id));
  const hasBackhaul = new Set(reported
    .filter(({ source, target }) => meshIds.has(source) && meshIds.has(target))
    .flatMap(({ source, target }) => [source, target]));
  // Indicate missing telemetry without asserting a direct physical connection.
  const links = [...reported];
  for (const node of nodes) {
    if (!node.online || node.client || node.master || hasBackhaul.has(node.id)) continue;
    links.push({ source: master.id, target: node.id, medium: "", unreported: true });
  }
  return links;
}

export class NodarionMeshMap {
  constructor(container) {
    this.container = container;
    this.nodes = new Map();
    this.lines = new Map();
    this.positions = new Map();
    this.selected = null;
    container.innerHTML = `
      <section class="mesh-map">
        <div class="mesh-heading">
          <div><h2>${t("Mesh-Karte")}</h2><p class="mesh-count"></p></div>
          <div class="mesh-search"><input type="search" aria-label="${panelLocale === "de" ? "Geräte suchen" : "Search devices"}" placeholder="${panelLocale === "de" ? "Geräte suchen …" : "Search devices …"}"><output aria-live="polite"></output></div>
          <small>${panelLocale === "de" ? "Strg + Mausrad zum Zoomen" : "Ctrl + scroll to zoom"}</small>
          <span class="mesh-status"><i></i><span></span></span>
        </div>
        <p class="mesh-empty" hidden></p>
        <div class="mesh-scroll">
          <div class="mesh-canvas"><div class="mesh-stage">
            <svg class="mesh-lines" width="100%" height="100%" aria-hidden="true"></svg>
          </div></div>
        </div>
        <div class="mesh-legend">
          ${Object.entries(radioPatterns).map(([band, pattern]) => `<span class="radio-sample"><svg aria-hidden="true" width="38" height="8"><line x1="2" x2="36" y1="4" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="${pattern}"/></svg>${band}</span>`).join("")}
          <span class="lan">LAN</span><span class="powerline">Powerline</span><span class="strong">${t("Stark")}</span>
          <span class="fair">${t("Mittel")}</span><span class="weak">${t("Schwach")}</span>
          <span class="unknown">${t("Signal unbekannt")}</span>
          <span class="unreported">${t("Uplink nicht gemeldet")}</span>
        </div>
        <div class="mesh-details"></div>
      </section>`;
    this.stage = container.querySelector(".mesh-stage");
    this.legendFilters = new Set();
    const legend = container.querySelector(".mesh-legend");
    for (const sample of [...legend.children]) {
      const value = sample.classList.contains("radio-sample") ? sample.textContent.trim() : sample.className;
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      sample.replaceWith(button);
      button.append(sample);
      button.addEventListener("click", () => {
        if (this.legendFilters.has(value)) this.legendFilters.delete(value);
        else this.legendFilters.add(value);
        button.setAttribute("aria-pressed", String(this.legendFilters.has(value)));
        this.markSearchResults();
      });
    }
    this.search = container.querySelector(".mesh-search input");
    this.searchCount = container.querySelector(".mesh-search output");
    this.search.addEventListener("input", () => this.markSearchResults());
    this.svg = container.querySelector("svg");
    this.zoom = 1;
    this.viewport = container.querySelector(".mesh-scroll");
    this.resizeObserver = new ResizeObserver(() => this.fitGraph());
    this.resizeObserver.observe(this.viewport);
    this.viewport.addEventListener("wheel", (event) => {
      if (!event.ctrlKey || !event.deltaY) return;
      event.preventDefault();
      const before = this.stage.getBoundingClientRect();
      if (!before.width || !before.height) return;
      const x = (event.clientX - before.left) / before.width;
      const y = (event.clientY - before.top) / before.height;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.viewport.clientHeight : 1;
      this.zoom = Math.min(12, Math.max(1, this.zoom * Math.exp(-event.deltaY * unit * .002)));
      this.fitGraph();
      const after = this.stage.getBoundingClientRect();
      this.viewport.scrollBy(after.left + x * after.width - event.clientX, after.top + y * after.height - event.clientY);
    }, { passive: false });
    this.stage.addEventListener("click", (event) => {
      const button = event.target.closest(".mesh-node");
      if (!button) return;
      this.selected = this.selected === button.dataset.node ? null : button.dataset.node;
      this.renderSelection();
    });
  }

  update(topology, connection) {
    const signature = JSON.stringify([topology, connection?.configured]);
    if (signature === this.signature) return;
    this.signature = signature;
    const nodes = topology?.nodes ?? [];
    const links = displayLinks(nodes, topology?.links ?? []);
    this.topology = { nodes, links };
    const wifiCount = nodes.filter((node) => node.client).length;
    this.container.querySelector(".mesh-count").textContent =
      `${nodes.length - wifiCount} ${t("Mesh-Knoten")} · ${wifiCount} ${t("WLAN-Geräte")}`;
    const status = this.container.querySelector(".mesh-status");
    status.classList.toggle("fresh", topology?.fresh === true);
    status.lastElementChild.textContent = topology?.fresh ? "LIVE" : t("Zuletzt gemeldete Topologie");
    status.hidden = !nodes.length;
    const empty = this.container.querySelector(".mesh-empty");
    empty.hidden = Boolean(nodes.length);
    empty.textContent = topology?.fresh ? t("Keine Mesh-Knoten gemeldet")
      : connection?.configured ? t("Warte auf FRITZ!Box-Topologiedaten.")
        : t("FRITZ!Box-Verbindung in Nodarion einrichten.");
    for (const selector of [".mesh-scroll", ".mesh-legend", ".mesh-details"]) {
      this.container.querySelector(selector).hidden = !nodes.length;
    }

    const ids = new Set(nodes.map((node) => node.id));
    if (!ids.has(this.selected)) this.selected = null;
    for (const [id, button] of this.nodes) {
      if (ids.has(id)) continue;
      this.removeWithFade(button);
      this.nodes.delete(id);
      this.positions.delete(id);
    }
    const bands = new Map();
    for (const link of links) {
      for (const id of [link.source, link.target]) {
        if (!bands.has(id)) bands.set(id, new Set());
        for (const band of Object.keys(link.radios ?? {})) if (band) bands.get(id).add(band);
      }
    }
    for (const node of [...nodes].sort((a, b) => Number(b.master) - Number(a.master))) {
      this.updateNode(node, [...(bands.get(node.id) ?? [])].sort().join(" / "));
    }
    const rings = Math.max(1, ...[...this.positions.values()]
      .filter(({ slot }) => slot !== undefined)
      .map(({ slot }) => Math.floor(slot / 8) + 1));
    this.positionClients(nodes, links);
    this.stage.style.setProperty("--rings", rings);
    this.coordinates = (point) => ({
      x: CENTER + point.x * (wifiCount ? 30 : 34) / rings,
      y: CENTER + point.y * (wifiCount ? 28 : 30) / rings,
    });
    this.updateLinks(links);
    this.moveGraph(links);
    this.fitGraph();
    this.renderSelection();
  }

  fitGraph() {
    const viewport = this.viewport;
    if (!this.coordinates || !viewport.clientWidth || !this.positions.size) return;
    const points = [...this.positions.values()].map(this.coordinates);
    const xs = points.map(({ x }) => x * this.stage.offsetWidth / 100);
    const ys = points.map(({ y }) => y * this.stage.offsetHeight / 100);
    const left = Math.min(...xs) - 82;
    const top = Math.min(...ys) - 46;
    const width = Math.max(...xs) + 82 - left;
    const height = Math.max(...ys) + 72 - top;
    const scale = Math.min(1, viewport.clientWidth / width, viewport.clientHeight / height) * this.zoom;
    const canvas = this.stage.parentElement;
    const w = this.zoom === 1 ? viewport.clientWidth : Math.max(viewport.clientWidth, Math.ceil(width * scale));
    const h = this.zoom === 1 ? viewport.clientHeight : Math.max(viewport.clientHeight, Math.ceil(height * scale));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const x = (w - width * scale) / 2 - left * scale;
    const y = (h - height * scale) / 2 - top * scale;
    this.stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  positionClients(nodes, links) {
    const clients = new Set(nodes.filter((node) => node.client).map(({ id }) => id));
    const parents = new Map();
    for (const link of links) {
      const client = clients.has(link.source) ? link.source : link.target;
      if (!clients.has(client)) continue;
      if (!parents.has(client) || (link.signal ?? -Infinity) > (parents.get(client).signal ?? -Infinity)) {
        parents.set(client, { id: link.source === client ? link.target : link.source, signal: link.signal });
      }
    }
    const groups = new Map();
    for (const [client, parent] of parents) {
      if (!groups.has(parent.id)) groups.set(parent.id, []);
      groups.get(parent.id).push(client);
    }
    const horizontal = [...this.positions.values()]
      .filter(({ slot }) => slot !== undefined)
      .every(({ slot }) => slot < 2);
    const verticalRadius = horizontal ? .92 : .44;
    const backbone = links.filter(({ source, target }) => !clients.has(source) && !clients.has(target))
      .map(({ source, target }) => [this.positions.get(source), this.positions.get(target)]);
    const width = horizontal ? 1440 : 1280;
    const height = horizontal ? 620 : 720;
    // Elliptical clearance encloses the icon and label together.
    const clearance = (point) => {
      let nearest = Infinity;
      for (const [a, b] of backbone) {
        const dx = (b.x - a.x) * .30 * width / 106;
        const dy = (b.y - a.y) * .28 * height / 88;
        const px = (point.x - a.x) * .30 * width / 106;
        const py = (point.y - a.y) * .28 * height / 88;
        const along = Math.min(1, Math.max(0, (px * dx + py * dy) / (dx * dx + dy * dy || 1)));
        nearest = Math.min(nearest, Math.hypot(px - along * dx, py - along * dy));
      }
      return nearest;
    };
    for (const [parent, members] of groups) {
      const anchor = this.positions.get(parent);
      const ordered = [...members].sort();
      const ringCount = Math.ceil((Math.sqrt(1 + ordered.length / 1.5) - 1) / 2);
      let offset = 0;
      for (let ring = 1; offset < ordered.length; ring++) {
        const size = Math.min(12 * ring, ordered.length - offset);
        const radius = ring / ringCount;
        for (let index = 0; index < size; index++) {
          const angle = -Math.PI / 2 + (index + (ring - 1) / 2) * 2 * Math.PI / size;
          const candidate = (theta) => ({
            x: anchor.x + Math.cos(theta) * .43 * radius,
            y: anchor.y + Math.sin(theta) * verticalRadius * radius,
          });
          let point = candidate(angle);
          if (clearance(point) < 1) {
            for (const shift of [-.38, .38]) {
              const alternative = candidate(angle + shift * 2 * Math.PI / size);
              if (clearance(alternative) > clearance(point)) point = alternative;
            }
          }
          this.positions.set(ordered[offset + index], point);
        }
        offset += size;
      }
    }
    // Size the canvas against the node labels. A pair only needs clearance
    // along one axis, so a wide screen also has room to breathe vertically.
    let scale = 1;
    for (const client of clients) scale = Math.max(scale, 1 / Math.max(.001, clearance(this.positions.get(client))));
    const points = [...this.positions.values()];
    for (const [index, point] of points.entries()) {
      for (let next = index + 1; next < points.length; next++) {
        const other = points[next];
        const separation = Math.max(
          Math.abs(point.x - other.x) * .30 * width / 122,
          Math.abs(point.y - other.y) * .28 * height / 64,
        );
        if (separation > 0) scale = Math.max(scale, 1 / separation);
      }
    }
    this.stage.style.setProperty("--stage-width", `${clients.size ? Math.ceil(width * scale) : 310}px`);
    this.stage.style.setProperty("--stage-height", `${clients.size ? Math.ceil(height * scale) : 300}px`);
  }

  updateNode(node, band) {
    let button = this.nodes.get(node.id);
    if (!button) {
      if (!node.client) {
        const taken = new Set([...this.positions.values()].map(({ slot }) => slot));
        let slot = node.master && !taken.has(-1) ? -1 : 0;
        while (taken.has(slot)) slot++;
        const angles = [0, 4, 2, 6, 1, 5, 3, 7];
        const angle = angles[slot % 8] * Math.PI / 4;
        const radius = slot < 0 ? 0 : 1 + Math.floor(slot / 8);
        this.positions.set(node.id, {
          x: slot < 0 ? 0 : Math.cos(angle) * radius,
          y: slot < 0 ? 0 : Math.sin(angle) * radius + (slot === 0 ? -.24 : slot === 1 ? .24 : 0),
          slot,
        });
      }
      button = document.createElement("button");
      button.type = "button";
      button.className = "mesh-node";
      button.dataset.node = node.id;
      const icon = node.client ? deviceIcon({ attributes: { hostname: node.name, connection_type: "WLAN" } })
        : node.master ? "mdi:router-wireless" : "mdi:access-point";
      button.innerHTML = `<span class="mesh-device"><ha-icon icon="${icon}"></ha-icon><i></i></span><strong></strong>`;
      this.stage.append(button);
      this.nodes.set(node.id, button);
    }
    button.classList.toggle("master", node.master);
    button.classList.toggle("client", Boolean(node.client));
    const online = node.online ? t("Online") : t("Offline");
    button.classList.toggle("offline", !node.online);
    button.lastElementChild.textContent = node.name;
    button.title = [node.name, online, band].filter(Boolean).join(" · ");
    button.setAttribute("aria-label", button.title);
  }

  updateLinks(links) {
    const keys = new Set(links.map(linkKey));
    for (const [key, line] of this.lines) {
      if (keys.has(key)) continue;
      this.removeWithFade(line);
      this.lines.delete(key);
    }
    for (const link of links) {
      if (!this.positions.has(link.source) || !this.positions.has(link.target)) continue;
      const key = linkKey(link);
      let line = this.lines.get(key);
      if (!line) {
        line = document.createElementNS(SVG, "line");
        this.svg.append(line);
        this.lines.set(key, line);
      }
      line.dataset.quality = quality(link);
      const bands = Object.keys(link.radios ?? {}).filter(Boolean);
      line.style.strokeDasharray = link.medium !== "WLAN" ? ""
        : bands.length > 1 ? mixedRadioPattern : radioPatterns[bands[0]] ?? "";
      line.classList.toggle("backhaul", this.positions.get(link.source).slot !== undefined
        && this.positions.get(link.target).slot !== undefined);
      if (line.classList.contains("backhaul")) this.svg.append(line);
    }
  }

  moveGraph(links) {
    cancelAnimationFrame(this.frame);
    const start = this.drawnPositions ?? new Map();
    const end = new Map([...this.positions].map(([id, point]) => [id, this.coordinates(point)]));
    const edges = links.map((link) => [link, this.lines.get(linkKey(link))]);
    const started = performance.now();
    const draw = (time) => {
      const progress = 1 - (1 - Math.min(1, Math.max(0, (time - started) / 460))) ** 3;
      this.drawnPositions = new Map();
      for (const [id, target] of end) {
        const origin = start.get(id) ?? target;
        const x = origin.x + (target.x - origin.x) * progress;
        const y = origin.y + (target.y - origin.y) * progress;
        this.drawnPositions.set(id, { x, y });
        const button = this.nodes.get(id);
        button.style.left = `${x}%`;
        button.style.top = `${y}%`;
      }
      for (const [link, line] of edges) {
        const source = this.drawnPositions.get(link.source);
        const target = this.drawnPositions.get(link.target);
        if (!line || !source || !target) continue;
        line.setAttribute("x1", `${source.x}%`);
        line.setAttribute("y1", `${source.y}%`);
        line.setAttribute("x2", `${target.x}%`);
        line.setAttribute("y2", `${target.y}%`);
      }
      if (progress < 1 && this.stage.isConnected) this.frame = requestAnimationFrame(draw);
    };
    const moving = [...end].some(([id, point]) =>
      start.has(id) && (start.get(id).x !== point.x || start.get(id).y !== point.y));
    draw(moving && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? started : started + 460);
  }

  removeWithFade(element) {
    element.classList.add("leaving");
    element.setAttribute("aria-hidden", "true");
    if (element instanceof HTMLButtonElement) element.disabled = true;
    window.setTimeout(() => element.remove(), 420);
  }

  markSearchResults() {
    const query = this.search.value.trim().toLowerCase();
    const types = [];
    const levels = [];
    for (const value of this.legendFilters) {
      if (["strong", "fair", "weak", "unknown"].includes(value)) levels.push(value);
      else types.push(value);
    }
    const filtering = Boolean(query || types.length || levels.length);
    const names = new Set((this.topology?.nodes ?? []).filter(node =>
      !query || [node.name, node.id].some(value => String(value ?? "").toLowerCase().includes(query))
    ).map(node => node.id));
    const connected = new Set();
    for (const link of this.topology?.links ?? []) {
      const level = quality(link);
      const matchesType = !types.length || types.some(type =>
        type === level || Object.hasOwn(link.radios ?? {}, type));
      const matchesLevel = !levels.length || (link.medium === "WLAN" && levels.includes(level));
      const match = matchesType && matchesLevel && (names.has(link.source) || names.has(link.target));
      this.lines.get(linkKey(link))?.classList.toggle("filter-miss", filtering && !match);
      if (match) { connected.add(link.source); connected.add(link.target); }
    }
    let count = 0;
    for (const node of this.topology?.nodes ?? []) {
      const match = filtering && names.has(node.id) && (!this.legendFilters.size || connected.has(node.id));
      const button = this.nodes.get(node.id);
      button.classList.toggle("search-hit", match);
      button.classList.toggle("search-miss", filtering && !match);
      if (match) count++;
    }
    this.searchCount.textContent = filtering
      ? `${count} ${panelLocale === "de" ? "Treffer" : count === 1 ? "match" : "matches"}` : "";
  }

  renderSelection() {
    this.markSearchResults();
    const { nodes, links } = this.topology;
    const node = nodes.find(({ id }) => id === this.selected);
    const path = node ? pathToMaster(node.id, nodes, links) : new Set();
    const hasMasterPath = path.size > 0;
    const visible = new Set([this.selected]);
    for (const link of links) {
      if (link.unreported) continue;
      const key = linkKey(link);
      if (link.source === this.selected || link.target === this.selected) path.add(key);
      if (path.has(key)) { visible.add(link.source); visible.add(link.target); }
    }
    this.stage.classList.toggle("has-path", path.size > 0);
    for (const [key, line] of this.lines) line.classList.toggle("on-path", path.has(key));
    for (const [id, button] of this.nodes) {
      button.setAttribute("aria-pressed", id === this.selected);
      button.classList.toggle("outside-selection", Boolean(node) && !visible.has(id));
    }
    const details = this.container.querySelector(".mesh-details");
    if (!node) {
      details.textContent = t("Ein Gerät für Verbindungsdetails auswählen.");
      return;
    }
    const neighbors = links.filter(({ source, target }) => source === node.id || target === node.id);
    details.innerHTML = `
      <div><strong>${esc(node.name)}</strong><small>${node.master ? t("Mesh-Master") : node.online ? t("Online") : t("Offline")}</small></div>
      ${hasMasterPath ? `<small>${t("Weg zum Mesh-Master")}</small>` : ""}
      <ul>${neighbors.length ? neighbors.map((link) => {
        const neighbor = nodes.find(({ id }) => id === (node.id === link.source ? link.target : link.source));
        const signal = Number.isFinite(link.signal) ? ` · ${link.signal} dBm` : "";
        const medium = link.unreported ? t("Uplink nicht gemeldet") : link.medium || t("Verbindungstyp unbekannt");
        const rates = Object.entries(link.radios ?? {}).map(([band, sent]) => {
          const fields = [band];
          for (const [arrow, id] of [["↑", node.id], ["↓", neighbor?.id]]) {
            if (Number.isFinite(sent[id])) fields.push(`${arrow} ${sent[id].toLocaleString(panelLocale)} Mbit/s`);
          }
          return fields.filter(Boolean).join(" · ");
        }).filter(Boolean).join(" / ");
        return `<li><span>${link.unreported ? "" : esc(neighbor?.name)}</span><small>${esc(medium)}${rates ? " · " + esc(rates) : ""}${signal}</small></li>`;
      }).join("") : `<li>${t("Kein aktiver Mesh-Link gemeldet")}</li>`}</ul>`;
  }
}
