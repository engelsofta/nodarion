export const panelStyles = `
:host {
  --ns-bg: #111315;
  --ns-panel: rgba(29, 32, 35, .80);
  --ns-line: rgba(255, 246, 229, .10);
  --ns-text: #fffaf1;
  --ns-muted: #a9b6b1;
  --ns-subtle: #87958f;
  --ns-surface: rgba(255,255,255,.035);
  --ns-surface-raised: rgba(255,255,255,.055);
  --ns-field: rgba(16,15,14,.46);
  --ns-green: #ccb57b;
  --ns-cyan: #f5d7a3;
  --ns-red: #ff786f;
  display: block;
  min-height: 100%;
  color-scheme: dark;
  color: var(--ns-text);
  background:
    radial-gradient(ellipse at 12% 0%, rgba(210, 157, 68, .10), transparent 42rem),
    radial-gradient(ellipse at 95% 28%, rgba(77, 136, 151, .06), transparent 38rem),
    linear-gradient(135deg, rgba(255,255,255,.025), transparent 48%),
    var(--ns-bg);
  font-family: "Manrope", "Avenir Next", "Segoe UI Variable", "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
.shell { width:100%; max-width:none; margin:0; padding:28px clamp(14px,2vw,30px) 52px; position:relative; isolation:isolate; }
.ha-menu { display:none; place-items:center; flex:0 0 44px; width:44px; height:44px; padding:0; border:1px solid var(--ns-line); border-radius:13px; color:var(--ns-text); background:var(--ns-surface); cursor:pointer; }
.ha-menu ha-icon { --mdc-icon-size:24px; }
.shell::before {
  content:""; position:fixed; z-index:-1; inset:0; pointer-events:none; opacity:.28;
  background-image:radial-gradient(rgba(255,255,255,.16) .45px, transparent .45px);
  background-size:4px 4px; mix-blend-mode:soft-light;
}
header { display:flex; align-items:center; justify-content:space-between; gap:24px; margin-bottom:28px; }
.brand { display:flex; align-items:center; gap:16px; }

.header-actions { display:flex; align-items:center; justify-content:flex-end; gap:10px; }
.header-action { min-height:43px; display:flex; align-items:center; gap:8px; padding:10px 14px; border:1px solid var(--ns-line); border-radius:13px; color:#cce5dc; background:rgba(255,255,255,.04); font:inherit; font-size:11px; font-weight:750; white-space:nowrap; cursor:pointer; transition:.18s ease; }
.header-action:hover, .header-action.active { color:#fff7e9; border-color:rgba(204,181,123,.38); background:rgba(204,181,123,.1); }
.header-action ha-icon { --mdc-icon-size:18px; }
.connection-status { color:#bcecff; }
.connection-status ha-icon { color:var(--ns-cyan); }
.connection-status ha-icon:last-child { --mdc-icon-size:16px; transition:transform .18s ease; }
.connection-status.open ha-icon:last-child { transform:rotate(180deg); }
.logo {
  width:58px; height:58px; flex:none; display:block; border-radius:18px;
}
.logo img { display:block; width:100%; height:100%; }
h1 { margin:0; font-size:clamp(26px,3vw,38px); letter-spacing:-1.5px; font-weight:720; }
.eyebrow { color:var(--ns-cyan); font-size:10px; letter-spacing:2.8px; font-weight:750; text-transform:uppercase; margin-bottom:5px; }
@keyframes spin { to { transform:rotate(360deg); } }
.metrics { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(0,.8fr) minmax(0,.95fr) minmax(0,1fr) minmax(0,1.25fr); gap:14px; margin-bottom:18px; } .table-panel, .log-panel, .watch-panel {
  background:var(--ns-panel); border:1px solid var(--ns-line);
  backdrop-filter:blur(22px) saturate(110%); box-shadow:0 22px 55px rgba(10,8,5,.22), inset 0 1px rgba(255,255,255,.035);
}
.metric-status-value { display:flex; align-items:center; gap:8px; margin-top:12px; color:#effff8; font-size:20px; font-weight:780; }
.metric-status-value ha-icon { color:var(--ns-cyan); --mdc-icon-size:23px; }
.metric-alert-badge { display:inline-flex; align-items:center; justify-content:center; min-width:21px; height:21px; padding:0 6px; border-radius:999px; color:#2c160f; background:#ff8c72; font-size:10px; font-weight:850; }

.metric-label-row { position:relative; z-index:4; display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:25px; }
.metric-label { color:#9bb8af; font-size:13px; text-transform:uppercase; letter-spacing:1.2px; font-weight:700; }
.metric-settings { display:grid; place-items:center; flex:0 0 auto; width:26px; height:26px; padding:0; border:1px solid rgba(255,255,255,.1); border-radius:8px; color:#8eaea4; background:rgba(255,255,255,.035); cursor:pointer; transition:.18s ease; }
.metric-settings:hover { color:#fff7e9; border-color:rgba(204,181,123,.42); background:rgba(204,181,123,.14); transform:rotate(20deg); }
.metric-settings ha-icon { --mdc-icon-size:15px; }
.metric-value { font-size:31px; font-weight:780; margin-top:7px; letter-spacing:-1px; }
.device-counts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:7px; }
.device-count { appearance:none; min-width:0; border:0; outline:0; padding:5px 7px; color:inherit; background:transparent; text-align:left; font:inherit; cursor:pointer; border-radius:8px; transition:color .18s ease, background .18s ease, transform .18s ease; }
.device-count:hover, .function-count:hover { color:#fffaf1; background:rgba(204,181,123,.13); transform:translateY(-1px); }
.device-count.active, .function-count.active { background:rgba(204,181,123,.18); box-shadow:inset 0 0 0 1px rgba(204,181,123,.28); }
.device-count:focus, .device-count:focus-visible { border:0; outline:0; box-shadow:none; }
.device-count + .device-count { padding-left:12px; border-left:1px solid var(--ns-line); }
.device-count strong { display:block; font-size:31px; line-height:1; letter-spacing:-1px; }
.device-count.online strong { color:var(--ns-green); }
.device-count.offline strong { color:#91a29c; }
.device-count.new strong { color:var(--ns-cyan); }
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
.metric.ai-metric .metric-value { color:#b68cff; }
.metric-note { display:block; margin-top:5px; color:#8eaea4; font-size:10px; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.metric-entity-link { max-width:100%; padding:0; border:0; background:transparent; font-family:inherit; text-align:left; cursor:pointer; }
.metric-entity-link:hover { color:var(--ns-cyan); text-decoration:underline; text-underline-offset:2px; }
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
.cleanup-summary { margin:5px 0 9px; color:#9dbbb1; font-size:11px; line-height:1.45; }
.cleanup-actions { display:grid; gap:7px; width:100%; }
.cleanup.preserve { color:#bcecff; background:rgba(80,215,255,.07); border-color:rgba(80,215,255,.22); }
.tab-view[data-view="participants"] { position:relative; }
.column-config-head { width:48px; min-width:48px; padding:6px !important; text-align:center; }
.column-picker-button { width:35px; height:35px; display:grid; place-items:center; padding:0; border-radius:9px; color:#dff7ed; background:rgba(80,215,255,.08); border:1px solid rgba(80,215,255,.25); font:inherit; cursor:pointer; }
.column-picker-button:hover { color:#fff5e4; background:rgba(204,181,123,.14); border-color:rgba(204,181,123,.38); }
.column-picker-button ha-icon { --mdc-icon-size:19px; }
.column-picker { position:absolute; z-index:20; right:8px; top:48px; display:grid; grid-template-columns:repeat(2,minmax(150px,1fr)); gap:7px; width:min(390px,calc(100vw - 36px)); padding:12px; border-radius:13px; background:#0b211b; border:1px solid rgba(80,215,255,.25); box-shadow:0 18px 45px rgba(0,0,0,.42); }
.column-picker[hidden] { display:none; }
.column-picker label { display:flex; align-items:center; gap:9px; padding:7px 8px; border-radius:8px; color:var(--ns-text); font-size:13px; font-weight:600; cursor:pointer; }
.column-picker label:hover { color:#fff7e9; background:rgba(204,181,123,.11); }
.column-picker input { width:17px; height:17px; padding:0; accent-color:var(--ns-green); }
.column-picker-head {
  grid-column:1/-1; display:flex; align-items:center;
  justify-content:space-between; gap:12px; padding:2px 4px 8px;
  color:var(--ns-text); font-size:12px; font-weight:800;
  border-bottom:1px solid var(--ns-line);
}
.column-picker-close {
  width:30px; height:30px; display:grid; place-items:center; padding:0;
  border-radius:8px; color:#d8d0c5; background:rgba(255,255,255,.05);
  border:1px solid var(--ns-line); cursor:pointer;
}
.column-picker-close:hover { color:#fff; background:rgba(204,181,123,.14); }
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
  color:#fff5e5; background-color:rgba(204,181,123,.14);
  border-color:rgba(204,181,123,.62);
  box-shadow:inset 3px 0 #ccb57b, 0 0 0 1px rgba(204,181,123,.08);
}
.column-filter.has-value::placeholder { color:#d6b985; }
select.column-filter {
  min-width:125px; color-scheme:dark; cursor:pointer;
  background-color:#35322f;
}
select.column-filter:hover { border-color:rgba(204,181,123,.38); }
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
  border-color:rgba(204,181,123,.62);
  box-shadow:0 0 0 3px rgba(204,181,123,.10);
}
.custom-column-filter[open] summary::after {
  transform:rotate(225deg) translate(-2px,-1px);
}
.custom-column-filter.has-value summary {
  color:#fff5e5; background:rgba(204,181,123,.14);
  border-color:rgba(204,181,123,.62);
  box-shadow:inset 3px 0 #ccb57b, 0 0 0 1px rgba(204,181,123,.08);
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
.custom-filter-option:hover { color:#fffaf1; background:rgba(204,181,123,.11); }
.custom-filter-option.active { color:#fff6e8; background:rgba(204,181,123,.18); }
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
.onboarding-state.onboarding { color:#bcecff; background:rgba(80,215,255,.10); border:1px solid rgba(80,215,255,.28); }
.onboarding-state.assigned { color:#d9f5e7; background:rgba(86,190,130,.18); border:1px solid rgba(86,190,130,.32); }
.onboarding-state.unknown { color:#c5beb4; background:rgba(255,255,255,.06); }
td { padding:15px 16px; border-bottom:1px solid var(--ns-line); color:#d4ebe3; font-size:14px; line-height:1.4; vertical-align:middle; }
tbody tr { --state:var(--ns-green); transition:background .15s ease; }
tbody tr.off { --state:#82968f; opacity:.76; }
tbody tr.off.important-offline { --state:var(--ns-red); }
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
tbody tr.guest-row {
  background:linear-gradient(90deg,rgba(88,185,214,.11),rgba(88,185,214,.025) 34%,transparent 70%);
}
tbody tr.guest-row td:first-child {
  box-shadow:inset 4px 0 #58b9d6;
}
tbody tr.vlan-device-row td:last-child {
  box-shadow:inset -4px 0 var(--vlan-color,#58b9d6);
}
tbody tr.guest-row:hover {
  background:linear-gradient(90deg,rgba(88,185,214,.18),rgba(88,185,214,.055) 42%,rgba(88,185,214,.025));
}
tbody tr.onboarding-row:hover {
  background:linear-gradient(90deg,rgba(240,185,79,.19),rgba(240,185,79,.055) 42%,rgba(204,181,123,.025));
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
.device-icon.vpn { color:#c8a7ff; background:rgba(182,140,255,.1); border-color:rgba(182,140,255,.28); }
.device-icon.guest { color:#ffe08a; background:rgba(255,215,102,.09); border-color:rgba(255,215,102,.27); }
.device-icon.router { color:#aaffd0; background:rgba(85,242,162,.09); border-color:rgba(85,242,162,.25); }
.device-icon.mesh { color:#8eb7ff; background:rgba(70,125,255,.1); border-color:rgba(95,145,255,.3); }
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
.pihole-domain-form{display:flex;flex-wrap:wrap;align-items:end;gap:10px}.pihole-domain-form label{display:grid;gap:6px;flex:1 1 130px}.pihole-domain-form input,.pihole-domain-form select{min-width:0;width:100%;min-height:42px;border:1px solid var(--ns-line);border-radius:10px;background:var(--ns-surface);color:var(--ns-text);padding:8px;font:inherit}.pihole-domain-settings p{font-size:12px;line-height:1.6;color:var(--ns-muted)}.pihole-domain-list{max-height:260px;overflow:auto;margin-top:10px}.pihole-domain-list>div{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--ns-line)}.pihole-domain-list span{overflow-wrap:anywhere}
@media(max-width:800px){.settings-view .settings-context-title{flex-basis:auto}}
.log-table { width:100%; min-width:1020px; border-collapse:collapse; }
.log-table thead { position:sticky; top:0; z-index:3; background:#292823; }
:host([data-theme="light"]) .log-table thead { background:#f5f3ef; }
.log-table th { position:relative; padding:13px 16px; font-size:11px; }
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
.log-entry.offline { --log-color:#82968f; }
.log-entry.online { --log-color:var(--ns-green); }
.log-entry.discovered { --log-color:var(--ns-cyan); }
.log-entry.renamed { --log-color:var(--ns-cyan); }
.log-entry.internet_approval_revoked { --log-color:var(--ns-red); }
.log-entry.internet_approval_granted { --log-color:var(--ns-green); }
.log-entry.inventory_pruned { --log-color:#8ea6bd; }
.log-entry.device_forgotten { --log-color:var(--ns-red); }
.log-entry.internet_blocked { --log-color:var(--ns-red); }
.log-entry.internet_enforcement_failed { --log-color:#ffd766; }
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
.dns-head { display:flex; align-items:center; justify-content:space-between; gap:18px; margin-bottom:16px; }
.dns-head h2 { display:flex; align-items:center; gap:9px; margin:0 0 5px; font-size:20px; }
.dns-head h2 ha-icon { color:var(--ns-cyan); --mdc-icon-size:23px; }
.dns-head p { margin:0; color:#78998f; font-size:12px; }
.dns-actions { display:flex; align-items:center; gap:8px; }
.dns-head-tools { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:10px; }
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
.card-actions { display:flex; gap:7px; }
.watch { width:34px; height:34px; border-radius:10px; display:grid; place-items:center; cursor:pointer; color:#68867d; background:rgba(2,10,8,.35); border:1px solid var(--ns-line); }
.watch ha-icon { --mdc-icon-size:19px; }
.watch.active { color:#ffd766; border-color:rgba(255,215,102,.35); background:rgba(255,215,102,.09); }
.watch.notify.active { color:var(--ns-cyan); border-color:rgba(80,215,255,.35); background:rgba(80,215,255,.09); }
.watch.presence.active { color:#8fffc2; border-color:rgba(143,255,194,.38); background:rgba(143,255,194,.10); }
.internet-state { display:grid; grid-template-columns:max-content max-content; align-items:center; justify-content:start; gap:7px 9px; min-width:125px; }
.internet-state > .internet-hint { grid-column:1 / -1; grid-row:2; }
.internet-state > button { grid-column:2; grid-row:1; justify-self:start; width:auto; min-width:0; }
.internet-label { width:max-content; padding:4px 8px; border-radius:999px; color:#9bb8af; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); font-size:11px; font-weight:750; }
.internet-label.trusted,
.internet-label.allowed { color:#aaffd0; background:rgba(85,242,162,.08); border-color:rgba(85,242,162,.25); }
.internet-label.learning { color:#bcecff; background:rgba(80,215,255,.09); border-color:rgba(80,215,255,.27); }
.internet-label.unchecked,
.internet-label.unmanaged,
.internet-label.infrastructure { color:#9bb0a9; background:rgba(255,255,255,.04); border-color:rgba(255,255,255,.08); }
.internet-label.pending { color:#ffe08a; background:rgba(255,215,102,.09); border-color:rgba(255,215,102,.28); }
.internet-label.denied { color:var(--ns-red); background:rgba(255,107,120,.08); border-color:rgba(255,107,120,.24); }
.internet-label.error { color:#ffd766; }
.internet-hint { max-width:210px; color:#819d94; font-size:9px; line-height:1.3; }
.approve-internet { padding:7px 9px; border-radius:8px; color:#092018; background:var(--ns-green); border:0; font:inherit; font-size:11px; font-weight:800; cursor:pointer; }
.block-internet { display:inline-flex; align-items:center; gap:5px; padding:5px 9px; border-radius:8px; color:var(--ns-muted); background:var(--ns-surface); border:1px solid var(--ns-line); font:inherit; font-size:11px; line-height:1.4; font-weight:700; cursor:pointer; }
.block-internet ha-icon { --mdc-icon-size:13px; }
.block-internet:hover { color:var(--ns-red); border-color:var(--ns-red); background:rgba(255,107,120,.06); }
.block-internet:focus-visible { outline:2px solid var(--ns-cyan); outline-offset:3px; }
.block-internet:disabled, .approve-internet:disabled { opacity:.55; cursor:wait; }
.status { display:flex; align-items:center; gap:8px; color:var(--state); font-size:12px; text-transform:uppercase; letter-spacing:1px; font-weight:800; white-space:nowrap; }
.status-cell { display:grid; gap:4px; }
.status-time { color:#78998f; font-size:10px; line-height:1.45; white-space:pre-line; }
.private-mac { display:flex; align-items:center; gap:5px; margin-top:4px; color:#b68cff; font:700 10px Inter,Roboto,sans-serif; white-space:nowrap; }
.private-mac ha-icon { --mdc-icon-size:13px; }
.mac-vendor { display:flex; align-items:center; gap:5px; max-width:240px; margin-top:5px; color:var(--ns-cyan); font:700 10px Inter,Roboto,sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:help; }
.mac-vendor ha-icon { flex:0 0 auto; --mdc-icon-size:13px; }
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
.device-web-link { display:inline-flex; align-items:center; gap:4px; color:var(--ns-cyan); font-family:inherit; font-size:11px; text-decoration:none; width:fit-content; }
.device-web-link:hover { text-decoration:underline; }
.device-web-link ha-icon { --mdc-icon-size:14px; }
.guest-control { display:flex; align-items:center; justify-content:space-between; gap:16px; margin:18px 0; font-weight:700; }
.guest-toggle { display:flex; align-items:center; gap:10px; background:transparent; color:inherit; border:0; font:inherit; cursor:pointer; padding:8px; }
.guest-toggle-track { display:block; width:44px; height:26px; border-radius:20px; background:#66756e; padding:3px; box-sizing:border-box; }
.guest-toggle-track > span { display:block; width:20px; height:20px; border-radius:50%; background:#fff; transition:transform .15s; }
.guest-toggle[aria-checked="true"] .guest-toggle-track { background:var(--ns-green); }
.guest-toggle[aria-checked="true"] .guest-toggle-track > span { transform:translateX(18px); }
.guest-toggle:disabled { opacity:.5; cursor:wait; }
.guest-toggle-error { color:var(--ns-red); }
.guest-actions { display:flex; justify-content:flex-end; margin-top:18px; }
.guest-show { display:flex; align-items:center; gap:7px; padding:10px 13px; border-radius:10px; color:#07130f; background:var(--ns-cyan); border:0; font:inherit; font-size:12px; font-weight:800; cursor:pointer; }
.dot { width:7px; height:7px; border-radius:50%; background:var(--state); box-shadow:0 0 11px var(--state); }
.empty { text-align:center; padding:80px 20px; color:#66857c; }
.empty ha-icon { --mdc-icon-size:54px; color:#34564b; margin-bottom:14px; }
.empty strong { display:block; color:#a9c9be; font-size:18px; margin-bottom:7px; }
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
.settings-context-title { display:flex; align-items:center; gap:11px; }
.settings-back { display:grid; place-items:center; flex:0 0 auto; width:36px; height:36px; padding:0; border:1px solid var(--ns-line); border-radius:10px; color:#cce5dc; background:rgba(255,255,255,.04); cursor:pointer; }
.settings-back:hover { color:#fff7e9; border-color:rgba(204,181,123,.4); background:rgba(204,181,123,.12); }
.settings-back ha-icon { --mdc-icon-size:19px; }
.adguard-feature-list { display:grid; gap:8px; }
.adguard-feature { display:flex; align-items:center; justify-content:space-between; gap:14px; width:100%; padding:12px 13px; border:1px solid var(--ns-line); border-radius:11px; color:#b9d8cd; background:rgba(255,255,255,.025); font:inherit; text-align:left; cursor:pointer; }
.adguard-feature:hover { border-color:rgba(204,181,123,.32); background:rgba(204,181,123,.07); }
.adguard-feature strong, .adguard-feature small { display:block; }
.adguard-feature small { margin-top:3px; color:#78998f; font-size:10px; }
.adguard-feature-state { min-width:42px; padding:5px 8px; border-radius:999px; color:#9aa8a3; background:rgba(255,255,255,.06); font-size:10px; font-weight:800; text-align:center; }
.adguard-feature.active .adguard-feature-state { color:#092018; background:var(--ns-green); }
.query-log-warning { display:flex; align-items:flex-start; gap:8px; margin-top:11px; padding:10px; border-radius:9px; color:#dbc58f; background:rgba(255,215,102,.07); font-size:10px; line-height:1.45; }
.query-log-warning ha-icon { flex:0 0 auto; --mdc-icon-size:16px; }
.adguard-stat-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
.adguard-stat { padding:12px; border:1px solid var(--ns-line); border-radius:10px; color:#91b0a6; background:rgba(255,255,255,.025); font:inherit; text-align:left; cursor:pointer; }
.adguard-stat span, .adguard-stat strong { display:block; }
.adguard-stat span { font-size:10px; }
.adguard-stat strong { margin-top:6px; color:#effff8; font-size:18px; }
.dns-live-stats { margin:0 0 16px; padding:12px; border:1px solid var(--ns-line); border-radius:13px; background:rgba(255,255,255,.018); }
.dns-live-stats h3 { margin:0 0 9px; color:#78998f; font-size:10px; text-transform:uppercase; letter-spacing:1px; }
.dns-live-stats .adguard-stat-grid { grid-template-columns:repeat(4,minmax(0,1fr)); }
.dns-head .dns-live-stats { margin:0 2px 0 0; padding:0 12px 0 0; border:0; border-right:1px solid var(--ns-line); border-radius:0; background:transparent; }
.dns-head .dns-live-stats h3 { margin:0 0 4px; font-size:8px; line-height:1; }
.dns-head .dns-live-stats .adguard-stat-grid { display:flex; gap:5px; }
.dns-head .dns-live-stats .adguard-stat { min-width:82px; padding:5px 8px; border-radius:8px; background:rgba(255,255,255,.018); }
.dns-head .dns-live-stats .adguard-stat span { font-size:8px; white-space:nowrap; }
.dns-head .dns-live-stats .adguard-stat strong { margin-top:2px; font-size:12px; line-height:1.15; white-space:nowrap; }
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
.learning-card { display:grid; gap:9px; padding:12px; border-radius:12px; background:rgba(80,215,255,.055); border:1px solid rgba(80,215,255,.16); }
.learning-card strong { color:#eafff6; font-size:13px; }
.learning-card p { margin:0; color:#91afa6; font-size:10px; line-height:1.45; }
.learning-card .learning-actions { justify-content:flex-start; }
.learning-action { padding:7px 9px; border-radius:8px; color:#bcecff; background:rgba(80,215,255,.07); border:1px solid rgba(80,215,255,.22); font:inherit; font-size:10px; font-weight:750; cursor:pointer; }
.security-metrics {
  display:grid; grid-template-columns:repeat(4,minmax(0,1fr));
  margin:0 0 14px; border:1px solid var(--ns-line); border-radius:16px;
  background:var(--ns-room-glass); box-shadow:var(--ns-room-shadow);
  backdrop-filter:blur(16px);
}
.security-metrics > div {
  position:relative; display:flex; flex-direction:column; gap:9px;
  min-width:0; padding:14px clamp(12px,1.6vw,24px);
}
.security-metrics > div + div::before {
  content:""; position:absolute; inset-block:10px; inset-inline-start:0; width:1px;
  background:linear-gradient(transparent,color-mix(in srgb,var(--ns-cyan) 55%,transparent),transparent);
}
.security-metrics dt {
  color:var(--ns-muted); font-size:10px; line-height:1.35;
  letter-spacing:.035em; text-transform:uppercase;
}
.security-metrics dd {
  margin:0; color:var(--ns-text); font-size:clamp(20px,1.5vw,26px); line-height:1.1; font-weight:400;
  font-variant-numeric:tabular-nums;
}
@media (max-width:800px) {
  .security-metrics { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .security-metrics > div:nth-child(3)::before { display:none; }
  .security-metrics > div:nth-child(n+3) { border-block-start:1px solid var(--ns-line); }
}
.presence-overview { margin-bottom:18px; }
.presence-summary { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:11px; color:#cce5dc; background:rgba(143,255,194,.055); border:1px solid rgba(143,255,194,.14); font-size:11px; }
.presence-summary ha-icon { color:#8fffc2; --mdc-icon-size:19px; }
.presence-summary strong { color:#f4fff9; }
.presence-sensor-link { display:flex; align-items:center; gap:8px; padding:8px 11px; border-radius:10px; color:#9eaaa6; background:rgba(255,255,255,.035); border:1px solid var(--ns-line); font:inherit; font-size:11px; font-weight:780; cursor:pointer; white-space:nowrap; }
.presence-sensor-link.on { color:#bff8d8; background:rgba(143,255,194,.08); border-color:rgba(143,255,194,.25); }
.presence-sensor-link.off { color:#c7c1b8; }
.presence-sensor-link:hover { border-color:rgba(204,181,123,.42); box-shadow:0 0 0 3px rgba(204,181,123,.08); }
.presence-sensor-link ha-icon { --mdc-icon-size:18px; }
.presence-list { display:grid; gap:10px; margin-top:14px; }
.presence-row { display:grid; grid-template-columns:minmax(150px,230px) minmax(240px,1fr); align-items:center; gap:16px; }
.presence-person { display:grid; grid-template-columns:10px minmax(0,1fr); column-gap:9px; align-items:center; }
.presence-dot { width:8px; height:8px; border-radius:50%; background:#74817d; }
.presence-row.home .presence-dot { background:#8fffc2; box-shadow:0 0 10px rgba(143,255,194,.7); }
.presence-name { overflow:hidden; color:#effff8; font-size:12px; font-weight:760; text-overflow:ellipsis; white-space:nowrap; }
.watch-entity-link { padding:0; color:inherit; background:transparent; border:0; font:inherit; font-weight:inherit; text-align:left; cursor:pointer; }
.watch-entity-link:hover { color:#bcecff; text-decoration:underline; text-underline-offset:3px; }
.presence-state { grid-column:2; margin-top:3px; color:#a7bfb6; font-size:11px; line-height:1.4; }
.presence-row.home .presence-state { color:#8fd8b1; }
.presence-timeline { position:relative; height:24px; overflow:hidden; border-radius:8px; background:rgba(2,10,8,.42); border:1px solid var(--ns-line); }
.presence-timeline::before { content:""; position:absolute; inset:0; background:repeating-linear-gradient(90deg,transparent 0,transparent calc(25% - 1px),rgba(255,255,255,.055) 25%); }
.presence-segment { position:absolute; top:4px; bottom:4px; min-width:2px; border-radius:5px; background:linear-gradient(90deg,rgba(86,199,139,.55),#8fffc2); box-shadow:0 0 8px rgba(143,255,194,.2); }
.presence-axis { display:flex; justify-content:space-between; margin:6px 1px 0; color:#a7bfb6; font-size:11px; line-height:1.4; }
.alerts-panel { display:flex; flex-direction:column; max-height:calc(100dvh - 64px); }
.alerts-panel .alert-list { min-height:0; overflow-y:auto; overscroll-behavior:contain; padding-right:5px; scrollbar-width:thin; scrollbar-color:rgba(204,181,123,.42) transparent; }
.alerts-panel .alert-list::-webkit-scrollbar { width:7px; }
.alerts-panel .alert-list::-webkit-scrollbar-track { background:transparent; }
.alerts-panel .alert-list::-webkit-scrollbar-thumb { border-radius:999px; background:rgba(204,181,123,.32); }
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
.alert-actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; }
.alert-action { padding:7px 9px; border-radius:8px; color:#bcecff; background:rgba(80,215,255,.06); border:1px solid rgba(80,215,255,.2); font:inherit; font-size:9px; font-weight:750; cursor:pointer; }
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
.settings-view .rule { grid-template-columns:minmax(0,1fr) 180px; gap:12px; padding:9px 3px; }
.settings-view .rule label { font-size:13px; }
.settings-view .rule small { margin-top:3px; font-size:10px; line-height:1.3; }
.settings-view .rule input { min-height:36px; padding:7px 10px; font-size:13px; }
.settings-view .rule input[type="checkbox"] { width:22px; height:22px; min-height:22px; }
.dependent-settings[hidden] { display:none; }
.unit-input { display:grid; grid-template-columns:minmax(70px,1fr) auto; align-items:center; overflow:hidden; border-radius:10px; border:1px solid var(--ns-line); background:rgba(2,10,8,.35); }
.unit-input input { border:0 !important; border-radius:0; background:transparent; box-shadow:none !important; }
.unit-input span { padding:0 12px; color:#c5d9d2; font-size:11px; font-weight:700; white-space:nowrap; }
.mobile-details { display:none; }
.filter-chips { display:flex; align-items:center; flex-wrap:wrap; gap:7px; padding:10px 54px 8px 12px; background:rgba(2,10,8,.25); border-bottom:1px solid var(--ns-line); }
.filter-chips:empty { display:none; }
.filter-chip { display:inline-flex; align-items:center; gap:5px; padding:6px 8px; border-radius:999px; color:#cce5dc; background:rgba(80,215,255,.07); border:1px solid rgba(80,215,255,.2); font:inherit; font-size:10px; cursor:pointer; }
.filter-reset { margin-left:auto; padding:6px 8px; color:#ffe08a; background:transparent; border:0; font:inherit; font-size:10px; font-weight:750; cursor:pointer; }
.settings-dirty { display:flex; align-items:center; flex-wrap:wrap; gap:8px; padding:9px 11px; border-radius:11px; color:#ffe5a5; background:rgba(255,215,102,.08); border:1px solid rgba(255,215,102,.24); font-size:10px; }
.settings-save-area { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:8px; }
.settings-dirty[hidden] { display:none; }
.settings-dirty-actions { display:flex; gap:6px; margin-left:auto; }
.discard-settings { padding:7px 9px; border-radius:8px; color:#c9d8d3; background:rgba(255,255,255,.04); border:1px solid var(--ns-line); font:inherit; font-size:10px; cursor:pointer; }
.advanced-settings { grid-column:1 / -1; padding:8px; border-radius:11px; border:1px dashed rgba(182,140,255,.24); }
.advanced-settings > summary { padding:6px; color:#d4b9ff; font-size:11px; font-weight:800; cursor:pointer; }
.advanced-settings > *:not(summary) { margin-top:8px; }
.confirm-backdrop { position:fixed; z-index:1200; inset:0; display:grid; place-items:center; padding:18px; background:rgba(0,8,7,.78); backdrop-filter:blur(8px); }
.confirm-dialog { width:min(460px,100%); padding:23px; border-radius:18px; color:#eafff6; background:#13231f; border:1px solid rgba(80,215,255,.26); box-shadow:0 28px 80px rgba(0,0,0,.58); }
.confirm-dialog h2 { margin:12px 0 8px; font-size:19px; }
.confirm-dialog p { margin:0; color:#9dbbb1; font-size:12px; line-height:1.55; white-space:pre-line; }
.confirm-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:11px; color:#bcecff; background:rgba(80,215,255,.09); }
.confirm-icon.danger { color:#ff9ca7; background:rgba(255,107,120,.1); }
.confirm-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
.confirm-actions button { padding:9px 12px; border-radius:9px; font:inherit; font-size:11px; font-weight:800; cursor:pointer; }
.confirm-cancel { color:#c9d8d3; background:rgba(255,255,255,.04); border:1px solid var(--ns-line); }
.confirm-accept { color:#082018; background:var(--ns-green); border:0; }
.confirm-accept.danger { color:#fff; background:#b8404d; }
button:focus-visible, summary:focus-visible, input:focus-visible { outline:2px solid var(--ns-cyan); outline-offset:2px; }
.settings-view .danger-zone { margin-top:14px; padding:12px 14px; }
.settings-view .cleanup-settings { margin:0 0 10px; padding:5px 10px; }
.settings-view .cleanup-settings .cleanup { min-height:36px; padding:7px 11px; justify-self:end; font-size:12px; }
.settings-view .cleanup-settings .cleanup-result { margin:7px 3px 4px; }
.rule-group { padding:7px 12px; border:1px solid var(--ns-line); border-radius:13px; }
.rule-group h3 { margin:3px 0 4px; color:#c7b99f; font-size:10px; text-transform:uppercase; letter-spacing:1.1px; }
.rule-group h3 { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.settings-help-button { display:grid; place-items:center; flex:0 0 auto; width:24px; height:24px; padding:0; border-radius:50%; color:#d8c9b2; background:rgba(255,255,255,.045); border:1px solid rgba(255,246,229,.14); font:800 12px/1 Inter,Roboto,sans-serif; cursor:pointer; }
.settings-help-button:hover { color:#fff7e9; background:rgba(204,181,123,.15); border-color:rgba(204,181,123,.42); }
.settings-help-backdrop { position:fixed; z-index:90; inset:0; display:grid; place-items:center; padding:20px; background:rgba(7,6,5,.72); backdrop-filter:blur(7px); }
.settings-help-backdrop[hidden] { display:none; }
.settings-help-dialog { width:min(620px,calc(100vw - 32px)); max-height:min(720px,calc(100dvh - 40px)); overflow:auto; padding:24px; border-radius:18px; color:#eee7dd; background:#393531; border:1px solid rgba(204,181,123,.28); box-shadow:0 26px 80px rgba(0,0,0,.58); }
.settings-help-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:16px; }
.settings-help-head h2 { margin:0; color:#fff8ed; font-size:20px; }
.settings-help-close { display:grid; place-items:center; width:34px; height:34px; padding:0; border-radius:10px; color:#d8d0c6; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.11); cursor:pointer; }
.settings-help-close ha-icon { --mdc-icon-size:20px; }
.settings-help-copy { display:grid; gap:12px; }
.settings-help-copy p { margin:0; color:#c9c1b7; font-size:13px; line-height:1.6; }
.settings-help-copy strong { color:#f4dfbd; }
.rule-group.basics { background:rgba(204,181,123,.045); border-color:rgba(204,181,123,.15); }
.rule-group.vlan-settings { background:rgba(80,215,255,.035); border-color:rgba(80,215,255,.14); }
.vlan-settings-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; }
.vlan-settings-head h3 { margin:0; }
.settings-heading-actions { display:flex; align-items:center; gap:8px; }
.vlan-add, .vlan-remove { display:inline-grid; place-items:center; border:1px solid rgba(80,215,255,.24); color:#bcecff; background:rgba(80,215,255,.07); cursor:pointer; }
.vlan-add { grid-template-columns:auto auto; gap:6px; padding:7px 10px; border-radius:9px; font:inherit; font-size:11px; font-weight:750; }
.vlan-add ha-icon, .vlan-remove ha-icon { --mdc-icon-size:17px; }
.vlan-list { display:grid; gap:9px; }
.vlan-row { display:grid; grid-template-columns:minmax(130px,1.2fr) 90px minmax(150px,1.25fr) minmax(130px,1fr) 58px 100px 34px; align-items:end; gap:8px; padding:10px; border:1px solid var(--ns-line); border-left:4px solid var(--vlan-color,#58b9d6); border-radius:11px; background:rgba(2,10,8,.27); }
.vlan-field { display:grid; gap:4px; min-width:0; color:#78998f; font-size:9px; font-weight:750; letter-spacing:.45px; text-transform:uppercase; }
.vlan-field input, .vlan-field select { width:100%; min-width:0; min-height:36px; box-sizing:border-box; padding:7px 8px; border:1px solid var(--ns-line); border-radius:8px; color:var(--ns-text); background:rgba(2,10,8,.4); font:inherit; font-size:12px; text-align:left; }
.vlan-field input[type="color"] { min-width:48px; padding:3px; cursor:pointer; }
.vlan-field.monitoring { justify-items:center; }
.vlan-field.monitoring input { width:22px; min-height:22px; accent-color:var(--ns-green); }
.vlan-remove { width:34px; height:34px; padding:0; border-radius:9px; color:#ffaaa0; border-color:rgba(255,107,95,.24); background:rgba(255,107,95,.06); }
.vlan-empty-note { margin:8px 2px 0; color:var(--ns-muted); font-size:10px; line-height:1.45; }
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
.notify-target-action:hover { color:#fff7e9; border-color:rgba(204,181,123,.38); background:rgba(204,181,123,.12); }
.notify-target-list { display:grid; gap:5px; max-height:210px; overflow:auto; padding-right:3px; scrollbar-gutter:stable; }
.notify-target { display:grid; grid-template-columns:28px minmax(0,1fr) 24px; align-items:center; gap:9px; min-height:42px; padding:7px 9px; border:1px solid var(--ns-line); border-radius:10px; background:rgba(255,255,255,.018); cursor:pointer; transition:.18s ease; }
.notify-target[hidden] { display:none; }
.notify-target:hover { border-color:rgba(204,181,123,.28); background:rgba(204,181,123,.07); }
.notify-target:has(input:checked) { border-color:rgba(204,181,123,.46); background:rgba(204,181,123,.11); box-shadow:inset 3px 0 #e5ad50; }
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
.save-rules:disabled { cursor:not-allowed; }
.save-rules.busy:disabled { cursor:wait; }
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
.metric-note, .entity, .entity-id-link, .status-time,
.log-date, .alert-time { color:#aaa49a; }
/* Graphite glass with restrained gold and semantic status accents. */
.metrics {
  gap:14px; padding:0; border-radius:20px;
  background:transparent; border:0; box-shadow:none;
  backdrop-filter:none;
}


.metric-label { font-weight:750; }
.metric-note { line-height:1.5; }
.device-count strong, .metric-value, .function-count strong { font-variant-numeric:tabular-nums; }
.metric .device-count.online strong { color:#83ddba; }
.metric .device-count.offline strong { color:#a4adb8; }
.metric .device-count.new strong { color:#efca86; }
.device-count + .device-count, .function-count + .function-count { border-color:rgba(255,255,255,.075); }
.metric.dns-metric .metric-status-value, .metric.dns-metric .metric-status-value ha-icon { color:#8ddfbd; }
.metric .metric-settings { background:rgba(255,255,255,.025); border-color:rgba(255,255,255,.07); }
.metric:focus-visible, .device-count:focus-visible, .function-count:focus-visible { outline:2px solid var(--ns-cyan); outline-offset:3px; }

.metric-label { color:#c1bbb1; font-size:10px; letter-spacing:.8px; }
.metric-value, .device-count strong { color:#fffaf1; font-weight:650; }
.device-count.online strong { color:var(--ns-cyan); }
.connection-panel {
  background:rgba(67,63,59,.48); border-color:var(--ns-line);
  backdrop-filter:none; box-shadow:none;
} .filter.active {
  color:#fff9ee; background:linear-gradient(135deg,rgba(239,166,67,.86),rgba(194,105,29,.92));
  box-shadow:0 8px 22px rgba(224,139,40,.18), inset 0 1px rgba(255,255,255,.25);
}
input, select {
  color:#fffaf1; background:rgba(33,31,29,.38);
  border-color:rgba(255,246,229,.1); border-radius:10px;
}
select {
  color-scheme:dark;
  cursor:pointer;
  background-color:#35322f;
  border-color:rgba(204,181,123,.20);
  box-shadow:inset 0 1px rgba(255,255,255,.035);
}
select:hover { border-color:rgba(204,181,123,.40); background-color:#3b3733; }
select option, select optgroup {
  color:#f8f2e8;
  background:#35322f;
  font-family:"Manrope","Avenir Next","Segoe UI Variable","Segoe UI",sans-serif;
}
select option:checked {
  color:#fffaf1;
  background:#9a5d24;
}
input:focus, select:focus { border-color:rgba(204,181,123,.58); box-shadow:0 0 0 3px rgba(204,181,123,.10); }
.search ha-icon { color:#b0a99e; }
.filter { color:#bdb7ad; } .table-panel, .log-panel, .dns-panel, .watch-panel, .ai-panel {
  border-radius:16px; background:linear-gradient(145deg,rgba(31,34,37,.94),rgba(22,25,28,.96));
  border-color:rgba(255,246,229,.10);
  box-shadow:0 24px 58px rgba(8,6,4,.26), inset 0 1px rgba(255,255,255,.035);
  backdrop-filter:blur(22px);
}
th { color:#aeb4bc; background:#202427; border-bottom-color:rgba(231,185,101,.17); }
.column-filters th { background:#191d20; }
td { color:#e5e7eb; border-bottom-color:rgba(255,255,255,.055); }
tbody tr:nth-child(even) { background:rgba(255,255,255,.012); }
tbody tr:hover { background:rgba(231,185,101,.055); } .entity-link, .detail-stack strong, .connection-name, .log-device, .alert-name, .rule label { color:#fffaf1; }
.device-icon, .log-icon {
  color:var(--ns-cyan); background:rgba(204,181,123,.10);
  border-color:rgba(204,181,123,.18);
}
.device-icon.vpn { color:#d4b9ff; background:rgba(182,140,255,.12); border-color:rgba(182,140,255,.3); }
.device-icon.guest { color:#ffe08a; background:rgba(255,215,102,.1); border-color:rgba(255,215,102,.3); }
.device-icon.router { color:#aaffd0; background:rgba(85,242,162,.1); border-color:rgba(85,242,162,.28); }
.device-icon.mesh { color:#8eb7ff; background:rgba(70,125,255,.12); border-color:rgba(95,145,255,.34); }
.column-picker-button {
  color:#f4dfbd; background:rgba(204,181,123,.08); border-color:rgba(204,181,123,.25);
}
.column-picker {
  background:#393531; border-color:rgba(204,181,123,.28);
}
.column-picker { box-shadow:0 24px 60px rgba(10,8,5,.45); } .ai-copy article, .connection-card {
  background:rgba(35,32,29,.30); border-color:rgba(255,246,229,.09);
}
.save-rules, .approve-internet {
  color:#2c2115; background:linear-gradient(135deg,#f0d39a,#cfa45d);
  box-shadow:0 8px 22px rgba(224,139,40,.20);
}
.internet {
  color:#f6d8a6; background:rgba(204,181,123,.09); border-color:rgba(204,181,123,.25);
}
::selection { color:#2b2115; background:#ccb57b; }

/* Shared settings design: one visual language across every section. */
.settings-view .watch-panel { background:var(--ns-panel); border-color:var(--ns-line); box-shadow:0 16px 42px rgba(10,8,5,.18),inset 0 1px rgba(255,255,255,.04); }
.settings-view .rule-group,
.settings-view .rule-group.basics,
.settings-view .rule-group.vlan-settings,
.settings-view .rule-group.presence-settings,
.settings-view .rule-group.device-settings,
.settings-view .rule-group.onboarding-settings,
.settings-view .rule-group.detection-settings,
.settings-view .rule-group.alert-rule-settings,
.settings-view .rule-group.notification-settings,
.settings-view .rule-group.notification-target-settings,
.settings-view .rule-group.ai-config-settings { background:var(--ns-surface); border:1px solid var(--ns-line); border-radius:13px; }
.settings-view .rule-group h3 { color:var(--ns-subtle); }
.settings-view .rule label, .settings-view .adguard-feature strong { color:var(--ns-text); }
.settings-view .rule small, .settings-view .watch-heading p, .settings-view .adguard-feature small,
.settings-view .notification-target-description, .settings-view .vlan-empty-note { color:var(--ns-muted); }
.settings-view .adguard-feature, .settings-view .vlan-row, .settings-view .notify-target,
.settings-view .learning-card { color:var(--ns-text); background:var(--ns-surface-raised); border-color:var(--ns-line); }
.settings-view input:not([type="checkbox"]):not([type="color"]), .settings-view select,
.settings-view .unit-input { color:var(--ns-text); background:var(--ns-field); border-color:var(--ns-line); }
.settings-view .unit-input span { color:var(--ns-muted); }
.settings-view .adguard-feature-state { color:var(--ns-muted); background:var(--ns-surface-raised); }
.settings-view .adguard-feature.active .adguard-feature-state, .settings-view .save-rules { color:#2d1b09; background:#ccb57b; }
.settings-view .query-log-warning { color:#f2d798; background:rgba(230,162,63,.09); border:1px solid rgba(230,162,63,.2); }

/* Light theme follows Home Assistant's active light/dark setting. */
:host([data-theme="light"]) {
  --ns-bg:#f6f3ee;
  --ns-panel:rgba(255,255,255,.78);
  --ns-line:rgba(91,72,48,.14);
  --ns-text:#2d2925;
  --ns-muted:#655f58;
  --ns-subtle:#746c62;
  --ns-surface:#fffdfa;
  --ns-surface-raised:#ffffff;
  --ns-field:#ffffff;
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
:host([data-theme="light"]) header { border-bottom-color:rgba(91,72,48,.10); } :host([data-theme="light"]) h1, :host([data-theme="light"]) .metric-value, :host([data-theme="light"]) .device-count strong, :host([data-theme="light"]) .entity-link, :host([data-theme="light"]) .detail-stack strong, :host([data-theme="light"]) .connection-name, :host([data-theme="light"]) .log-device, :host([data-theme="light"]) .log-device-filter, :host([data-theme="light"]) .dns-host-link, :host([data-theme="light"]) .alert-name, :host([data-theme="light"]) .rule label { color:#29241f; }
:host([data-theme="light"]) .metric-note,
:host([data-theme="light"]) .entity,
:host([data-theme="light"]) .entity-id-link,
:host([data-theme="light"]) .status-time,
:host([data-theme="light"]) .log-date,
:host([data-theme="light"]) .alert-time,
:host([data-theme="light"]) .ai-empty { color:#756d63; }
:host([data-theme="light"]) .metric-label,
:host([data-theme="light"]) .metrics {
  background:rgba(229,221,210,.62); border-color:rgba(91,72,48,.12);
  box-shadow:inset 0 1px rgba(255,255,255,.72);
}
:host([data-theme="light"]) select:hover { background-color:#fff8ec; }
:host([data-theme="light"]) select option,
:host([data-theme="light"]) select optgroup { color:#302a24; background:#fffdf9; }
:host([data-theme="light"]) select option:checked { color:#fff; background:#a85b17; }
:host([data-theme="light"]) .search ha-icon { color:#766d62; } :host([data-theme="light"]) .table-panel, :host([data-theme="light"]) .log-panel, :host([data-theme="light"]) .dns-panel, :host([data-theme="light"]) .watch-panel, :host([data-theme="light"]) .ai-panel {
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
:host([data-theme="light"]) .dns-policy-modal,
:host([data-theme="light"]) .guest-modal,
:host([data-theme="light"]) .settings-help-dialog {
  color:#302a24; background:#fffaf3; border-color:rgba(168,91,23,.24);
  box-shadow:0 24px 60px rgba(82,61,36,.20);
}
:host([data-theme="light"]) .column-picker-head { color:#302b26; border-bottom-color:#ded7ce; }
:host([data-theme="light"]) .column-picker label { color:#38332e; font-weight:700; }
:host([data-theme="light"]) .column-picker label:hover { color:#653b12; background:#fff3df; }
:host([data-theme="light"]) .column-picker input { accent-color:#a85b17; }
:host([data-theme="light"]) .column-picker-close {
  color:#625b53; background:#f4f0ea; border-color:#d7cfc5;
}
:host([data-theme="light"]) .column-picker-close:hover {
  color:#633a13; background:#fff2df; border-color:#d49a53;
}
:host([data-theme="light"]) .dns-policy-modal-backdrop,
:host([data-theme="light"]) .guest-modal-backdrop,
:host([data-theme="light"]) .settings-help-backdrop { background:rgba(72,60,47,.38); } :host([data-theme="light"]) .ai-copy article, :host([data-theme="light"]) .connection-card, :host([data-theme="light"]) .guest-status-card {
  background:rgba(255,255,255,.64); border-color:rgba(91,72,48,.13);
}
:host([data-theme="light"]) .guest-qr { background:rgba(255,255,255,.64); border-color:rgba(91,72,48,.13); }
:host([data-theme="light"]) .guest-qr-copy h3 { color:#302a24; }
:host([data-theme="light"]) .guest-qr-copy p,
:host([data-theme="light"]) .guest-qr-unavailable { color:#665e54; } :host([data-theme="light"]) .log-route span, :host([data-theme="light"]) .dns-chip, :host([data-theme="light"]) .internet-label { color:#625a51; background:rgba(91,72,48,.06); border-color:rgba(91,72,48,.11); }
:host([data-theme="light"]) .internet-label.trusted,
:host([data-theme="light"]) .internet-label.allowed { color:#237448; background:#e8f5ec; border-color:#b9dcc5; }
:host([data-theme="light"]) .internet-label.learning { color:#246c86; background:#e5f4f9; border-color:#b8dce8; }
:host([data-theme="light"]) .internet-label.pending { color:#805b12; background:#fff4d5; border-color:#ead49a; }
:host([data-theme="light"]) .internet-label.denied { color:#b42318; background:#fdecea; border-color:#efc1bc; }
:host([data-theme="light"]) .internet-label.error { color:#8a5b08; background:#fff4d5; border-color:#ead49a; }
:host([data-theme="light"]) .dns-chart,
:host([data-theme="light"]) .ai-prompt,
:host([data-theme="light"]) .presence-timeline { background:rgba(109,85,54,.055); }
:host([data-theme="light"]) .ai-copy p,
:host([data-theme="light"]) .presence-summary,
:host([data-theme="light"]) .dns-action { color:#514a43; }
:host([data-theme="light"]) .settings-help-button,
:host([data-theme="light"]) .settings-help-close { color:#625a51; background:rgba(91,72,48,.06); }
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
:host([data-theme="light"]) .log-entry.renamed { --log-color:#28748d; }
:host([data-theme="light"]) .log-entry.internet_approval_revoked { --log-color:#b42318; }
:host([data-theme="light"]) .log-entry.internet_approval_granted { --log-color:#18794e; }
:host([data-theme="light"]) .log-entry.inventory_pruned { --log-color:#536b7d; }
:host([data-theme="light"]) .log-entry.device_forgotten { --log-color:#b42318; }
:host([data-theme="light"]) .log-entry.internet_blocked { --log-color:#b42318; }
:host([data-theme="light"]) .log-entry.internet_enforcement_failed { --log-color:#9b6a11; }
:host([data-theme="light"]) .log-entry.mesh_changed { --log-color:#7650ce; }
:host([data-theme="light"]) .log-message { color:#5c554e; }
:host([data-theme="light"]) .log-device-filter ha-icon { color:#397e98; opacity:1; }
:host([data-theme="light"]) .log-route { color:#655e56; } :host([data-theme="light"]) .dns-action, :host([data-theme="light"]) .ai-prompt-toggle {
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
:host([data-theme="light"]) .dns-policy-scope { color:#403932; background:#fff; border-color:rgba(91,72,48,.16); } :host([data-theme="light"]) .dns-policy-modal p, :host([data-theme="light"]) .guest-modal-head p, :host([data-theme="light"]) .guest-status-card span, :host([data-theme="light"]) .guest-client small { color:#6f675e; }
:host([data-theme="light"]) .guest-close { color:#514a43; }
:host([data-theme="light"]) .guest-client { background:#f3f8f7; border-color:#d5e6e2; }
:host([data-theme="light"]) .empty { color:#70685f; }
:host([data-theme="light"]) .empty strong { color:#403932; }
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
:host([data-theme="light"]) .alert-action { color:#24536b; background:#edf5f8; border-color:#9dbbc9; }
:host([data-theme="light"]) .alert-action:hover { color:#173b50; background:#dcebf2; border-color:#668fa3; }
:host([data-theme="light"]) .alert-actions button:focus-visible { outline:2px solid #24536b; outline-offset:3px; }
:host([data-theme="light"]) .watch-entity-link:hover { color:#24536b; }
:host([data-theme="light"]) .rule-group { background:#fffdfa; border-color:rgba(91,72,48,.13); }
:host([data-theme="light"]) .rule-group.basics { background:#fff9ef; border-color:#ead8bc; }
:host([data-theme="light"]) .rule-group.vlan-settings { background:#f5fafb; border-color:#d7e7eb; }
:host([data-theme="light"]) .vlan-row { background:#fff; }
:host([data-theme="light"]) .vlan-field input,
:host([data-theme="light"]) .vlan-field select { color:#39332d; background:#fff; border-color:#d7d0c7; }
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
:host([data-theme="light"]) tbody tr.off { --state:#7b817e; opacity:.88; }
:host([data-theme="light"]) tbody tr.off.important-offline { --state:#b33e3e; }
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
:host([data-theme="light"]) .presence-axis,
:host([data-theme="light"]) .presence-state { color:#514b44; font-weight:600; }
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
:host([data-theme="light"]) .header-action { color:#575048; background:#f7f4ef; border-color:#d8d1c8; }
:host([data-theme="light"]) .header-action:hover,
:host([data-theme="light"]) .header-action.active { color:#643b16; background:#fff7ea; border-color:#d99a4c; }
:host([data-theme="light"]) .metric-settings,
:host([data-theme="light"]) .settings-back { color:#6d665e; background:rgba(255,255,255,.55); border-color:#d7d0c7; }
:host([data-theme="light"]) .metric-status-value,
:host([data-theme="light"]) .adguard-stat strong,
:host([data-theme="light"]) .learning-card strong { color:#29251f; }
:host([data-theme="light"]) .adguard-stat,
:host([data-theme="light"]) .dns-live-stats { color:#625c54; background:#fff; border-color:#d9d2c9; }
:host([data-theme="light"]) .adguard-stat span,
:host([data-theme="light"]) .dns-live-stats h3 { color:#625c54; }
:host([data-theme="light"]) .settings-view .watch-panel {
  color:var(--ns-text); background:#fbfaf7; border-color:#d8d1c8;
  box-shadow:0 14px 34px rgba(74,57,37,.08),inset 0 1px rgba(255,255,255,.9);
}
:host([data-theme="light"]) .settings-view .rule-group,
:host([data-theme="light"]) .settings-view .rule-group.basics,
:host([data-theme="light"]) .settings-view .rule-group.vlan-settings,
:host([data-theme="light"]) .settings-view .rule-group.presence-settings,
:host([data-theme="light"]) .settings-view .rule-group.device-settings,
:host([data-theme="light"]) .settings-view .rule-group.onboarding-settings,
:host([data-theme="light"]) .settings-view .rule-group.detection-settings,
:host([data-theme="light"]) .settings-view .rule-group.alert-rule-settings,
:host([data-theme="light"]) .settings-view .rule-group.notification-settings,
:host([data-theme="light"]) .settings-view .rule-group.notification-target-settings,
:host([data-theme="light"]) .settings-view .rule-group.ai-config-settings { background:#fff; border-color:#ded8cf; }
:host([data-theme="light"]) .settings-view .rule-group h3,
:host([data-theme="light"]) .settings-view .vlan-field { color:#6d6255; }
:host([data-theme="light"]) .settings-view .rule label,
:host([data-theme="light"]) .settings-view .adguard-feature strong { color:#302b26; }
:host([data-theme="light"]) .settings-view .rule small,
:host([data-theme="light"]) .settings-view .watch-heading p,
:host([data-theme="light"]) .settings-view .adguard-feature small,
:host([data-theme="light"]) .settings-view .notification-target-description,
:host([data-theme="light"]) .settings-view .vlan-empty-note { color:#655f58; }
:host([data-theme="light"]) .settings-view .adguard-feature,
:host([data-theme="light"]) .settings-view .vlan-row,
:host([data-theme="light"]) .settings-view .notify-target,
:host([data-theme="light"]) .settings-view .learning-card,
:host([data-theme="light"]) .settings-view .adguard-feature:hover,
:host([data-theme="light"]) .settings-view .notify-target:hover { background:#fff7e9; border-color:#d49a53; }
:host([data-theme="light"]) .settings-view input:not([type="checkbox"]):not([type="color"]),
:host([data-theme="light"]) .settings-view select,
:host([data-theme="light"]) .settings-view .unit-input { color:#302b26; background:#fff; border-color:#cec6bc; }
:host([data-theme="light"]) .settings-view .unit-input span { color:#5f5952; background:#f0ece6; }
:host([data-theme="light"]) .settings-view .adguard-feature-state { color:#5f5952; background:#ece8e2; }
:host([data-theme="light"]) .settings-view .adguard-feature.active .adguard-feature-state,
:host([data-theme="light"]) .settings-view .save-rules { color:#2e1c09; background:#ccb57b; box-shadow:0 5px 14px rgba(166,101,25,.18); }
:host([data-theme="light"]) .settings-view .query-log-warning { color:#73500d; background:#fff7df; border-color:#e7d49e; }
:host([data-theme="light"]) .settings-view .learning-card p { color:#625c54; }
:host([data-theme="light"]) .settings-view .learning-action { color:#65400f; background:#fff5e3; border-color:#ddbd8d; }
:host([data-theme="light"]) .column-picker-button {
  color:#55300c; background:#fff0d5; border-color:#c98a3c;
  box-shadow:0 5px 14px rgba(116,72,23,.14);
}
:host([data-theme="light"]) .column-picker-button:hover {
  color:#48280b; background:#ffedcf; border-color:#c98535;
}
:host([data-theme="light"]) .confirm-backdrop { background:rgba(72,60,47,.38); }
:host([data-theme="light"]) .confirm-dialog {
  color:#302b26; background:#fffaf3; border-color:#d9bd91;
  box-shadow:0 28px 72px rgba(82,61,36,.22);
}
:host([data-theme="light"]) .confirm-dialog p { color:#625a52; }
:host([data-theme="light"]) .confirm-icon { color:#74501d; background:#fff1d9; }
:host([data-theme="light"]) .confirm-cancel,
:host([data-theme="light"]) .discard-settings {
  color:#514b44; background:#f4f0ea; border-color:#d5cdc3;
}
:host([data-theme="light"]) .confirm-cancel:hover,
:host([data-theme="light"]) .discard-settings:hover { color:#302b26; background:#eae4dc; }
:host([data-theme="light"]) .settings-dirty {
  color:#704b0c; background:#fff4d8; border-color:#e3cb91;
}
:host([data-theme="light"]) .advanced-settings {
  background:#faf8f4; border-color:#cfc3b5;
}
:host([data-theme="light"]) .advanced-settings > summary { color:#65429b; }
:host([data-theme="light"]) .vlan-add,
:host([data-theme="light"]) .notify-target-action {
  color:#65400f; background:#fff6e7; border-color:#ddbc8a;
}
:host([data-theme="light"]) .vlan-add:hover,
:host([data-theme="light"]) .notify-target-action:hover {
  color:#432608; background:#ffebca; border-color:#cc8b3e;
}
:host([data-theme="light"]) .notify-target-count { color:#704b16; }
:host([data-theme="light"]) .filter-chip,
:host([data-theme="light"]) .cleanup-result {
  color:#315d6b; background:#edf7fa; border-color:#bfdde5;
}
:host([data-theme="light"]) .cleanup-summary { color:#625b53; }
:host([data-theme="light"]) .filter-reset { color:#75500d; }
:host([data-theme="light"]) .log-clear,
:host([data-theme="light"]) .dns-client-filter button {
  color:#4f4942; background:#e9e5df; border:1px solid #d4cdc4;
}
:host([data-theme="light"]) .log-clear:hover,
:host([data-theme="light"]) .dns-client-filter button:hover {
  color:#2f2a25; background:#ddd7cf;
}
:host([data-theme="light"]) .vlan-remove {
  color:#a93630; background:#fff0ee; border-color:#e7bbb6;
}
:host([data-theme="light"]) .rating.warn {
  --rating-color:#8a6200; background:#fff5d2; border-color:#dfc568;
}
:host([data-theme="light"]) .rating.bad {
  --rating-color:#a52e2e; background:#fdebea; border-color:#e5aaa7;
}
:host([data-theme="light"]) .rating.good,
:host([data-theme="light"]) .rating.okay {
  color:#514b44; background:#efede9; border-color:#c9c4bd;
}
:host([data-theme="light"]) .metric-settings {
  color:#5f574e; background:#f7f3ed; border-color:#cec6bc;
}
:host([data-theme="light"]) .metric-settings:hover {
  color:#57310c; background:#fff0d7; border-color:#cc9149;
}
:host([data-theme="light"]) ::selection { color:#fff; background:#a85b17; }

@media (max-width:1100px) {
  .settings-tab-panel.notifications-panel { grid-template-columns:1fr; }
  .settings-tab-panel.devices-panel { grid-template-columns:1fr; }
  .ai-settings .rule-list { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width:1200px) { .metrics { grid-template-columns:repeat(3,1fr); } }
@media (max-width:800px) {
  .shell { padding-top:20px; } header { align-items:flex-start; flex-wrap:wrap; }
  .ha-menu { display:grid; }
  .header-actions { margin-left:auto; }
  .metrics { grid-template-columns:1fr 1fr; }
  .connection-panel { grid-template-columns:1fr; }
  .search { flex-basis:100%; } .filters { flex:1; } .filter { flex:1; }
  .cleanup { flex:1; justify-content:center; }
  select { min-width:120px; }
  .watch-layout { grid-template-columns:1fr; }
  .presence-row { grid-template-columns:1fr; gap:7px; }
  .settings-tab-panel, .settings-tab-panel.ai-maintenance-panel { grid-template-columns:1fr; }
  .dns-live-stats .adguard-stat-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .vlan-row { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .vlan-field.name, .vlan-field.network { grid-column:span 2; }
  .rule-group.ai-config-settings .rule { grid-template-columns:1fr; }
  .rule-group.ai-config-settings .settings-select { width:100%; }
  .ai-settings .rule-list { grid-template-columns:1fr; }
  .danger-zone { align-items:stretch; }
  .danger-zone .cleanup { width:100%; justify-content:center; }
  .ai-view { grid-template-columns:1fr; } .ai-head { flex-direction:column; } .ai-report { grid-template-columns:1fr; } .ai-copy { grid-template-columns:1fr; } .ai-copy article.summary { grid-column:auto; }
  .log-panel, .dns-panel { padding:16px; } .log-title, .dns-head { align-items:flex-start; }
  .dns-head { flex-direction:column; } .dns-head-tools { width:100%; justify-content:flex-start; } .dns-head .dns-live-stats { width:100%; padding:0 0 10px; border-right:0; border-bottom:1px solid var(--ns-line); } .dns-head .dns-live-stats .adguard-stat-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); } .dns-toolbar { grid-template-columns:1fr; }
}
@media (max-width:620px) {
  .shell { padding:14px 10px 34px; }
  header { gap:12px; margin-bottom:18px; }
  .header-actions { width:100%; }
  .header-action { justify-content:center; min-width:0; max-width:100%; }
  .connection-status span { overflow:hidden; text-overflow:ellipsis; }
  .brand { min-width:0; gap:11px; }
  .logo { width:46px; height:46px; border-radius:14px; }
  h1 { font-size:27px; }
  .metrics { grid-template-columns:1fr 1fr; }
  .metric.devices, .metric.watch-metric { grid-column:1 / -1; }
  .guest-qr { grid-template-columns:1fr; justify-items:center; text-align:center; }
  .table-column-picker { top:6px; right:8px; }
  .table-panel, .log-list, .dns-list { max-height:none; overflow:visible; }
  .device-list, .log-list { border:0; background:transparent; box-shadow:none; }
  .device-list table, .device-list tbody,
  .log-table, .log-table tbody,
  .dns-table, .dns-table tbody { display:block; width:100%; min-width:0; }
  .device-list thead, .log-table thead { display:block; width:100%; }
  .log-table thead { position:static; background:none !important; }
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
  .device-list .column-filters th[data-column="vlan"],
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
  .device-list .mobile-details { display:grid; flex-shrink:0; margin-left:auto; }
  .device-list .device-label { flex:1; }
  .device-list tbody tr:not(.mobile-expanded) td[data-column="onboarding"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="mac"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="connection"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="mesh"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="rate"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="address"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="dns"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="source"] { display:none; }
  .device-list tbody tr.mobile-expanded { border-color:rgba(80,215,255,.35); }
  .device-list .internet-state { min-width:0; }
  .alert-item { grid-template-columns:36px minmax(0,1fr); }
  .alert-actions { grid-column:1 / -1; justify-content:flex-start; } .log-panel, .dns-panel, .watch-panel, .ai-panel { padding:13px; border-radius:14px; }
  .log-table tbody td:first-child { grid-template-columns:1fr; }
  .log-table tbody td:first-child::before { display:none; }
  .dns-head .dns-actions { width:100%; display:grid; grid-template-columns:1fr 1fr; }
  .dns-action { justify-content:center; min-height:42px; }
  .dns-chart { padding:12px 8px; }
  .dns-chart-label { font-size:7px; }
  .dns-table .dns-answer { max-width:100%; }
  .settings-view .watch-heading { flex-direction:column; align-items:stretch; }
  .settings-view .watch-heading > div { min-width:0; }
  .settings-view .watch-heading .save-rules {
    width:100%; min-width:0; max-width:100%; white-space:normal;
  }
  .rule-group.onboarding-settings .rule,
  .rule-group.ai-config-settings .rule,
  .settings-view .rule { grid-template-columns:1fr; }
  .rule-group.onboarding-settings input[type="text"] { width:100%; }
  .vlan-row { grid-template-columns:1fr 1fr; }
  .settings-view .rule input[type="checkbox"] { justify-self:end; }
  .settings-help-backdrop { padding:8px; }
  .settings-help-dialog { width:calc(100vw - 16px); max-height:calc(100dvh - 16px); padding:18px; }
}
:host([narrow]) .ha-menu { display:grid; }
@media (max-width:460px) {
  .metrics { gap:9px; }
  .metric-value { font-size:27px; }
  .function-count strong { gap:4px; font-size:21px; }
  .function-count { padding-inline:5px; }
}
.metric-overview { display:contents; }
.mobile-overview-toggle, .mobile-overview-actions, .mobile-device-controls { display:none; }
@media (max-width:620px) {
  .metrics { display:flex; flex-direction:column; gap:7px; padding:0; border:0; background:transparent; box-shadow:none; margin-bottom:12px; }
  .metrics .metric.devices { min-height:0; padding:8px 11px; }
  .metrics .devices .metric-label-row { margin-bottom:3px; }
  .metrics .devices { position:relative; }
  .mobile-overview-actions { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .mobile-alert-summary { display:flex; align-items:center; gap:6px; min-height:36px; border:1px solid var(--ns-line); border-radius:9px; background:rgba(255,255,255,.04); color:var(--ns-text,#eee5d5); padding:5px 9px; font:inherit; font-size:12px; cursor:pointer; }
  .mobile-overview-toggle ha-icon, .mobile-alert-summary ha-icon { --mdc-icon-size:18px; }
  .mobile-alert-summary { color:var(--ns-yellow,#d9c58e); }
  .overview-expanded .mobile-overview-toggle ha-icon { transform:rotate(180deg); }
  .metric-overview { display:none; }
  .overview-expanded .metric-overview { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .metric-overview .metric { min-height:0; padding:10px; }
  .mobile-device-controls { display:block; margin-bottom:8px; }
  .mobile-search-row { display:flex; gap:7px; padding-right:51px; }
  .mobile-device-search { box-sizing:border-box; height:44px; display:flex; align-items:center; flex:1; min-width:0; gap:7px; padding:0 10px; border:1px solid var(--ns-line); border-radius:10px; background:var(--light-card-bg,rgba(38,35,32,.92)); }
  .mobile-device-search ha-icon { --mdc-icon-size:20px; color:var(--ns-cyan); }
  .mobile-device-search input { width:100%; min-width:0; height:100%; padding:0; box-sizing:border-box; border:0; outline:0; background:transparent; color:inherit; font:inherit; font-size:13px; }
  .mobile-device-search:focus-within { border-color:var(--ns-cyan); }
  .mobile-filter-toggle { display:flex; align-items:center; justify-content:center; gap:3px; box-sizing:border-box; min-width:44px; height:44px; padding:0 6px; border:1px solid var(--ns-line); border-radius:10px; background:var(--light-card-bg,rgba(38,35,32,.92)); color:inherit; cursor:pointer; }
  .mobile-filter-toggle ha-icon { --mdc-icon-size:21px; }
  .mobile-filter-toggle.active { color:var(--ns-yellow,#d9c58e); }
  .mobile-filter-toggle span { font-size:11px; font-weight:700; }
  .mobile-device-filters { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:10px 0; }
  .mobile-device-filters[hidden] { display:none; }
  .mobile-filter-field { min-width:0; display:grid; gap:4px; }
  .mobile-filter-field > span { font-size:10px; color:var(--ns-muted,#bcb5a8); }
  .mobile-device-filters .custom-column-filter { width:100%; min-width:0 !important; }
  .device-list .column-filters { display:none; }
  .device-list .filter-chips { margin-bottom:8px; gap:5px; }
  .device-list .filter-chip, .device-list .filter-reset { font-size:11px; padding:5px 7px; }
  .table-column-picker, :host([data-theme="light"]) .table-column-picker { top:0; right:0; box-sizing:border-box; width:44px; height:44px; border-radius:10px; border:1px solid var(--ns-line); background:var(--light-card-bg,rgba(38,35,32,.92)); color:inherit; }
  .table-column-picker ha-icon { --mdc-icon-size:21px; }
  .device-list tbody tr { display:flex; flex-direction:column; }
  .device-list tbody td { padding:7px 11px; }
  .device-list td[data-column="name"] { order:-3; padding-top:10px; }
  .device-list td[data-column="state"] { order:-2; }
  .device-list td[data-column="ip"] { order:-1; }
  .device-list tbody tr:not(.mobile-expanded) td[data-column="vlan"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="internet"] { display:none; }
  .device-list .status-cell { display:flex; flex-wrap:nowrap; }
  .device-list .status-cell .status-time { font-size:9px; text-align:right; }
  .device-list .status-cell .status-time br { display:none; }
}

.settings-view { min-width:0; }
.settings-view .watch-heading { flex-wrap:wrap; }
.settings-context-title { min-width:0; flex:1 1 290px; }
.settings-context-title > div { min-width:0; }
.settings-context-title p { overflow-wrap:anywhere; }
.settings-save-area { min-width:0; max-width:100%; }
.settings-view .rule-group, .settings-view .learning-card { min-width:0; }
.settings-tab-panel.general-panel { grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr)); }
.vlan-settings { container-type:inline-size; container-name:nodarion-vlan; }
.vlan-settings-head { flex-wrap:wrap; }
.vlan-settings-head h3 { min-width:0; overflow-wrap:anywhere; }
.settings-view .rule input:not([type="checkbox"]):not([type="color"]) { min-width:0; width:100%; box-sizing:border-box; }
.settings-view .unit-input { min-width:0; }
@container nodarion-vlan (max-width:760px) {
  .vlan-row { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .vlan-field.name, .vlan-field.network { grid-column:auto; }
}
@container nodarion-vlan (max-width:460px) {
  .vlan-row { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .vlan-field.name, .vlan-field.network { grid-column:1 / -1; }
}
:host([data-theme="dark"]) .settings-view { --ns-field:rgba(255,238,209,.075); }
:host([data-theme="dark"]) .settings-view input:not([type="checkbox"]):not([type="color"]),
:host([data-theme="dark"]) .settings-view select,
:host([data-theme="dark"]) .settings-view .settings-select summary,
:host([data-theme="dark"]) .settings-view .unit-input {
  background:var(--ns-field); border-color:rgba(239,220,186,.17);
}
:host([data-theme="dark"]) .settings-view .unit-input input:not([type="checkbox"]):not([type="color"]) { background:transparent; }
:host([data-theme="dark"]) .settings-view .unit-input span { background:rgba(255,238,209,.035); }
:host(:not([data-theme="light"])) .column-filter { background:#252a2e; color:#e7e9ec; border-color:rgba(255,255,255,.09); }
:host(:not([data-theme="light"])) .column-filter::placeholder { color:#929ba5; }
:host(:not([data-theme="light"])) .column-filter.has-value { background:rgba(231,185,101,.10); border-color:rgba(231,185,101,.5); }
:host(:not([data-theme="light"])) .device-list tr.on { --state:#83ddba; }
:host(:not([data-theme="light"])) .entity-id-link { color:#929aa5; font-size:10px; }
:host(:not([data-theme="light"])) .status-time { color:#929aa5; }
:host(:not([data-theme="light"])) .device-icon { box-shadow:inset 0 1px rgba(255,255,255,.06); }
.device-list .entity-link { font-weight:750; letter-spacing:-.15px; }
.device-list .internet-label { padding:5px 9px; border-radius:8px; }
.device-list .internet-hint { max-width:235px; line-height:1.5; }
.device-list .device-web-link { margin-top:3px; padding:4px 7px; border:1px solid color-mix(in srgb,var(--ns-cyan) 20%,transparent); border-radius:6px; background:color-mix(in srgb,var(--ns-cyan) 5%,transparent); }
.device-list .device-web-link:hover { background:color-mix(in srgb,var(--ns-cyan) 12%,transparent); text-decoration:none; }
:host([data-theme="light"]) .metrics { background:transparent; border:0; box-shadow:none; }

:host([data-theme="light"]) .metric .device-count.online strong { color:#237453; }
:host([data-theme="light"]) .metric .device-count.offline strong { color:#6c7380; }
:host([data-theme="light"]) .metric .device-count.new strong { color:#91601a; }
:host([data-theme="light"]) .metric.dns-metric .metric-status-value,
:host([data-theme="light"]) .metric.dns-metric .metric-status-value ha-icon { color:#237453; }
@media (min-width:1201px) {
  .metrics .device-count strong { font-size:36px; font-weight:750; letter-spacing:-1.5px; }
  .metrics .metric-value { font-size:34px; font-weight:750; }
  .metrics .metric-label { font-size:10px; letter-spacing:1.2px; }
}
@media (prefers-reduced-motion:reduce) { .device-count, .function-count, .device-list tr { transition:none; }
}
/* Fine overview: quiet surfaces, lighter type and line-only selections. */
:host { --ns-overview-edge:rgba(232,229,219,.085); }
:host([data-theme="light"]) { --ns-overview-edge:rgba(88,71,49,.13); }
:host .metrics { gap:12px; }


:host .metrics .metric-label { font-size:11px; font-weight:550; text-transform:none; letter-spacing:.2px; }
:host .metrics .metric-label-row { min-height:22px; }
:host .metrics .metric-note { font-size:10px; font-weight:400; opacity:.9; }
:host .metrics .device-count, :host .metrics .function-count {
  position:relative; border:0; border-radius:0; padding:4px 8px 7px;
  background:transparent; box-shadow:none; transform:none;
}
:host .metrics .device-count.active, :host .metrics .function-count.active,
:host .metrics .device-count:hover, :host .metrics .function-count:hover { background:transparent; box-shadow:none; transform:none; }
:host .metrics .device-count::after, :host .metrics .function-count::after {
  content:""; position:absolute; left:8px; right:8px; bottom:0; height:1px;
  border-radius:1px; background:var(--ns-cyan); opacity:0; pointer-events:none;
}
:host .metrics .device-count.active::after, :host .metrics .function-count.active::after { opacity:.85; }
:host .metrics .device-count:not(.active):hover::after, :host .metrics .function-count:not(.active):hover::after { opacity:.3; }
:host .metrics .device-count + .device-count::before,
:host .metrics .function-count + .function-count::before {
  content:""; position:absolute; left:0; top:25%; bottom:30%; width:1px;
  background:var(--ns-overview-edge); pointer-events:none;
}
:host .metrics .device-count strong { font-weight:550; letter-spacing:-.8px; }
:host .metrics .function-count strong { font-weight:550; letter-spacing:-.5px; }
:host .metrics .device-count span, :host .metrics .function-count span { font-weight:500; text-transform:none; letter-spacing:.2px; margin-top:4px; }
:host .metrics .function-count ha-icon { --mdc-icon-size:15px; }
:host .metrics .metric-settings {
  width:24px; height:24px; padding:4px; border:0; border-radius:7px;
  background:transparent; box-shadow:none; color:var(--ns-muted); opacity:.65;
}
:host .metrics .metric-settings:hover, :host .metrics .metric-settings:focus-visible {
  opacity:1; color:var(--ns-cyan); background:var(--ns-surface-raised); transform:none;
}
:host .metrics .metric-settings:focus-visible { outline:2px solid var(--ns-cyan); outline-offset:2px; }
@media (min-width:801px) {
  :host .metrics { align-items:stretch; }
}
@media (max-width:800px) {
  :host .metrics .device-count, :host .metrics .function-count { padding-bottom:6px; }
  :host .metrics .metric-settings { opacity:.85; }
}
/* Shared Engelsoft/Pager room backdrop and warm glass material. */
:host {
  --ns-room-glass:linear-gradient(135deg,rgba(66,62,58,.68),rgba(34,32,30,.76) 55%,rgba(65,51,39,.68));
  --ns-room-shadow:0 18px 46px rgba(0,0,0,.32),0 2px 9px rgba(0,0,0,.16),inset 0 1px rgba(255,255,255,.20),inset 0 -1px rgba(0,0,0,.20);
  --ns-room-head:rgba(43,40,37,.94);
  --ns-line:rgba(235,209,160,.27); --ns-overview-edge:var(--ns-line);
  --ns-muted:#b8beb8; --ns-cyan:#d9bd8b; --ns-text:#f4f2ed;
  --ns-panel:var(--ns-room-glass);
  background:linear-gradient(90deg,rgba(7,8,8,.24),rgba(9,9,8,.42) 48%,rgba(8,7,6,.20)),url("/engelsoft_nodarion/room-interior.png") center / cover fixed,#171512;
}
:host([data-theme="light"]) {
  --ns-room-glass:linear-gradient(130deg,rgba(251,249,246,.82),rgba(242,237,231,.76));
  --ns-room-shadow:0 15px 38px rgba(42,55,71,.15),0 2px 6px rgba(42,55,71,.07),inset 0 1px rgba(255,255,255,.90),inset 0 -1px rgba(70,86,104,.13);
  --ns-room-head:rgba(247,243,237,.94);
  --ns-line:rgba(132,110,73,.24); --ns-overview-edge:var(--ns-line);
  --ns-muted:#62716b; --ns-cyan:#886735; --ns-text:#303b38;
  background:linear-gradient(115deg,rgba(224,232,229,.65),rgba(237,231,216,.62)),url("/engelsoft_nodarion/room-background.png") center / cover fixed,#e5e5dd;
}
.shell { max-width:none; margin-inline:auto; isolation:auto; }
@media (min-width:1201px) {
  .shell { width:92%; padding-inline:0; }
}
:host(:not([data-theme="light"])) :is(.table-panel,.log-panel,.dns-panel,.watch-panel,.ai-panel,.connection-panel,.guest-modal),
:host([data-theme="light"]) :is(.table-panel,.log-panel,.dns-panel,.watch-panel,.ai-panel,.connection-panel,.guest-modal) {
  background:var(--ns-room-glass); border:1px solid var(--ns-line);
  box-shadow:var(--ns-room-shadow); border-radius:25px;
  backdrop-filter:blur(22px) saturate(120%);
  -webkit-backdrop-filter:blur(22px) saturate(120%);
}

:host .device-list th, :host .device-list .column-filters th {
  background:var(--ns-room-head); border-bottom-color:var(--ns-line);
  backdrop-filter:blur(22px) saturate(120%);
  -webkit-backdrop-filter:blur(22px) saturate(120%);
}
:host .device-list td { border-bottom-color:color-mix(in srgb,var(--ns-line) 65%,transparent); }
:host .device-list tr:nth-child(even) { background:rgba(198,163,104,.025); }
:host .device-list tr:hover { background:rgba(198,163,104,.07); }
:host .device-list .entity-link { color:var(--ns-cyan); }
:host .device-list .column-filter {
  background:rgba(99,100,90,.12); border-color:var(--ns-line); color:var(--ns-text); border-radius:12px;
}
:host .device-list .column-filter.has-value { background:rgba(198,163,104,.14); border-color:var(--ns-cyan); }
:host .device-list .column-filter::placeholder { color:var(--ns-muted); }
:host .metrics .metric-settings { color:var(--ns-muted); }
:host .device-list .card-actions button, :host .column-picker-button {
  border-radius:11px; border-color:var(--ns-line); background:rgba(198,163,104,.045);
}
@media (max-width:800px) {
  :host(:not([data-theme="light"])) .table-panel.device-list,
  :host([data-theme="light"]) .table-panel.device-list { background:transparent; border:0; box-shadow:none; backdrop-filter:none; -webkit-backdrop-filter:none; }
  :host(:not([data-theme="light"])) .device-list tbody tr,
  :host([data-theme="light"]) .device-list tbody tr {
    border:1px solid var(--ns-line); border-radius:20px;
    background:var(--ns-room-glass); box-shadow:var(--ns-room-shadow);
    backdrop-filter:blur(22px) saturate(120%); -webkit-backdrop-filter:blur(22px) saturate(120%);
  }
}
/* One champagne-gold accent, shared with the scan action. */
:host { --ns-action-gold:linear-gradient(135deg,#f0d39a,#cfa45d); --ns-action-ink:#241c10; --ns-yellow:#d9c58e; }
:host([data-theme="light"]) { --ns-green:#9a7b3d; --ns-yellow:#886735; }
:host .settings-view .save-rules:not(.saved):not(.failed),
:host .approve-internet, :host .confirm-primary:not(.danger) {
  background:var(--ns-action-gold); color:var(--ns-action-ink);
  box-shadow:0 5px 18px rgba(185,157,96,.13),inset 0 1px rgba(255,255,255,.28);
}
:host .settings-view .save-rules.saved { background:#76d89d; color:#10271d; }
:host .settings-view .save-rules.failed { background:#a94242; color:#fff3f1; }
:host .rule input[type="checkbox"], :host .column-picker input,
:host .vlan-field.monitoring input { accent-color:#ccb57b; }
:host .settings-view .adguard-feature.active .adguard-feature-state { color:#342a16; background:#ccb57b; }
:host .watch.active { color:#d9c58e; border-color:rgba(204,181,123,.35); background:rgba(204,181,123,.09); }
:host([data-theme="light"]) .watch.active { color:#886735; } :host .filter.active { background:var(--ns-action-gold); color:var(--ns-action-ink); box-shadow:0 5px 16px rgba(185,157,96,.12); }
/* Neutral smoked glass and restrained filter states, without olive/yellow fills. */
:host { --ns-muted:#bcb7b0; --ns-subtle:#a8a099; --ns-filter-surface:rgba(97,89,80,.14); --ns-filter-edge:rgba(215,199,174,.23); }
:host([data-theme="light"]) { --ns-muted:#68615a; --ns-subtle:#797169; --ns-filter-surface:rgba(255,252,248,.82); --ns-filter-edge:rgba(122,105,83,.26); }
:host(:is([data-theme="dark"],[data-theme="light"])) :is(.column-filter,select.column-filter,.custom-column-filter summary) {
  background:var(--ns-filter-surface); color:var(--ns-text); border-color:var(--ns-filter-edge); box-shadow:none;
}
:host(:is([data-theme="dark"],[data-theme="light"])) :is(.column-filter.has-value,select.column-filter.has-value,.custom-column-filter.has-value summary) {
  background:var(--ns-filter-surface); color:var(--ns-text); border-color:var(--ns-filter-edge);
  box-shadow:inset 0 -1px color-mix(in srgb,var(--ns-cyan) 35%,transparent);
}
:host(:is([data-theme="dark"],[data-theme="light"])) :is(.column-filter:focus-visible,.custom-column-filter summary:focus-visible) {
  outline:2px solid color-mix(in srgb,var(--ns-cyan) 60%,transparent); outline-offset:2px;
}
:host(:is([data-theme="dark"],[data-theme="light"])) .custom-filter-option.active {
  background:var(--ns-surface-raised); color:var(--ns-text); box-shadow:none;
}
:host .metrics { position:relative; isolation:isolate; }
:host(:not([data-theme="light"])) .table-panel.device-list,
:host([data-theme="light"]) .table-panel.device-list {
  box-shadow:inset 0 1px rgba(255,255,255,.14),inset 0 -1px rgba(0,0,0,.12);
}
/* Light-mode header text must remain readable over the room backdrop. */
:host([data-theme="light"]) header { border-bottom-color:rgba(89,72,49,.18); }
:host([data-theme="light"]) .eyebrow { color:#725526; }
:host([data-theme="light"]) .header-action { color:#453c30; background:rgba(255,253,248,.94); border-color:rgba(113,91,60,.24); }
:host([data-theme="light"]) .connection-status span { color:#453c30; }
:host([data-theme="light"]) .connection-status ha-icon { color:#80612d; }
/* Dark icon strokes on light surfaces, including offline rows. */
:host([data-theme="light"]) .device-list .device-icon {
  color:#715523; background:#eee7da; border-color:#bba681;
  box-shadow:inset 0 1px rgba(255,255,255,.85);
}
:host([data-theme="light"]) .device-list .device-icon.router { color:#28633f; background:#e1eee3; border-color:#8eb69a; }
:host([data-theme="light"]) .device-list .device-icon.mesh { color:#365aa0; background:#e3e9f5; border-color:#9aafd0; }
:host([data-theme="light"]) .device-list .device-icon.vpn { color:#704395; background:#ede4f4; border-color:#b49ac9; }
:host([data-theme="light"]) .device-list .device-icon.guest { color:#785615; background:#f3ead5; border-color:#c3aa72; }
:host([data-theme="light"]) .device-list .device-icon ha-icon { --mdc-icon-size:21px; }
:host([data-theme="light"]) .device-list tr.off { opacity:1; }
:host([data-theme="light"]) .device-list tr.off .entity-link { color:#6c5a38; }
:host([data-theme="light"]) .device-list .card-actions button { color:#635d53; border-color:#bdb3a2; }
:host([data-theme="light"]) .device-list .watch.active { color:#805e1c; border-color:#bda46f; background:#f2e7cd; }
:host([data-theme="light"]) .device-list .watch.notify.active { color:#245e7b; border-color:#92b2c1; background:#e1eef4; }
:host([data-theme="light"]) .device-list .watch.presence.active { color:#28633f; border-color:#8eb69a; background:#e1eee3; }
.device-ip-line { display:flex; align-items:center; gap:8px; white-space:nowrap; min-height:28px; }
.device-list .device-ip-line .device-web-link {
  display:inline-flex; flex:0 0 auto; align-items:center; gap:4px; margin:0;
  height:26px; padding:4px 7px; font-family:inherit; font-size:11px; font-weight:600; line-height:1.2; cursor:pointer;
  white-space:nowrap; text-decoration:none; box-sizing:border-box;
}
.device-gui-menu {
  position:fixed; inset:auto; margin:0; width:190px; padding:6px;
  border:1px solid var(--ns-line); border-radius:12px;
  background:#2c2823; color:var(--ns-text); box-shadow:0 12px 32px rgba(0,0,0,.3);
}
.device-gui-menu a { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:10px; border-radius:7px; font-family:inherit; font-size:12px; font-weight:600; line-height:1.3; color:var(--ns-text); text-decoration:none; }
.device-gui-menu a:hover, .device-gui-menu a:focus-visible { background:var(--ns-surface-raised); }
.device-gui-menu ha-icon { --mdc-icon-size:15px; }
:host([data-theme="light"]) .device-gui-menu { background:#fffaf2; }

.metric {
  position:relative; overflow:hidden; min-width:0;
  padding:12px 17px; min-height:126px; border-radius:22px;
  background:var(--ns-metric-surface); border:1px solid var(--ns-line);
  box-shadow:var(--ns-room-shadow);
}
:host { --ns-metric-surface:rgba(43,38,34,.94); }
:host([data-theme="light"]) { --ns-metric-surface:rgba(250,247,241,.96); }
.shell { display:grid; grid-template-columns:auto minmax(0,1fr); gap:clamp(8px,1.4vw,22px); align-items:start; }
.panel-content { min-width:0; }
.panel-navigation {
  position:sticky; top:14px; display:flex; flex-direction:column; gap:4px; padding:5px;
  border:1px solid var(--ns-line); border-radius:999px;
  background:var(--ns-room-glass); box-shadow:var(--ns-room-shadow);
  backdrop-filter:blur(18px);
}
.panel-navigation button {
  display:grid; place-items:center; width:40px; height:40px;
  padding:0; border:0; border-radius:50%;
  background:transparent; color:var(--ns-text); cursor:pointer;
}
.panel-navigation button:hover { background:var(--ns-surface-raised); }
.panel-navigation button.active { background:var(--ns-action-gold); color:var(--ns-action-ink); }
.panel-navigation button:focus-visible { outline:2px solid var(--ns-cyan); outline-offset:-2px; }
.panel-navigation ha-icon { --mdc-icon-size:20px; }

/* Overview cards share the same value row and supporting text. */
.metric { container-type:inline-size; }
.metric-header-actions { display:flex; align-items:center; gap:3px; }
:host .metrics :is(.device-counts,.function-counts,.metric-reading) { margin-top:8px; }
:host .metrics :is(.device-counts,.function-counts) {
  grid-template-columns:none; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr); gap:0;
}
:host .metrics :is(.device-count,.function-count,.metric-reading) { padding:0 6px 5px; }
:host .metrics .metric-reading { min-width:0; }
:host .metrics :is(.device-count,.function-count) { display:flex; flex-direction:column; align-items:flex-start; }
:host .metrics :is(.device-count strong,.function-count strong,.metric-value,.metric-status-value) {
  display:flex; align-items:center; gap:4px; min-height:28px; margin:0;
  font-size:clamp(15px,1.5vw,24px); line-height:1.1; font-weight:400;
  letter-spacing:-.025em; font-variant-numeric:tabular-nums;
}
:host .metrics .metric-status-value {
  display:block; line-height:28px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
}
:host .metrics :is(.device-count span,.function-count span,.metric-note) {
  display:block; margin-top:4px; font-size:10px; line-height:1.25; font-weight:500;
  letter-spacing:0; color:var(--ns-muted);
}
:host .metrics .device-count span { white-space:normal; }
:host .metrics .metric-entity-link { padding:0; }
:host .metrics .guest-inline strong { color:var(--ns-cyan); }
:host .metrics :is(.guest-inline,.mobile-overview-toggle):focus-visible {
  outline:2px solid var(--ns-cyan); outline-offset:2px;
}
@container (max-width:280px) {
  :host .metrics :is(.device-count,.function-count,.metric-reading) { padding-inline:4px; }
  :host .metrics .function-count ha-icon { --mdc-icon-size:12px; }
}
@media (max-width:620px) {
  .mobile-overview-toggle {
    display:grid; place-items:center; width:30px; height:30px; padding:0; border:0;
    border-radius:7px; background:transparent; color:var(--ns-text); cursor:pointer;
  }
  .overview-expanded .watch-metric { grid-column:1 / -1; }
}

.mobile-device-status { display:none; }
@media (max-width:800px) {
  .panel-navigation { gap:2px; padding:3px; }
  .panel-navigation button { width:36px; height:40px; }
  .metric { min-height:0; border-radius:18px; }
  .device-list tbody tr { margin-bottom:7px; }
  .device-list td[data-column="name"] { padding:5px 9px; border-bottom:0; }
  .device-list td[data-column="state"] .status { display:none; }
  .device-list tbody tr:not(.mobile-expanded) td[data-column="state"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="ip"],
  .device-list tbody tr:not(.mobile-expanded) td[data-column="watch"],
  .device-list tbody tr:not(.mobile-expanded) .entity-id-link { display:none; }
  .device-name-line { display:flex; align-items:center; gap:8px; min-width:0; }
  .device-name-line .entity-link { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .device-list .mobile-device-status { display:inline-flex; gap:4px; flex:none; font-size:10px; }
  .device-list .mobile-details { width:44px; height:44px; margin:0; }
  .device-list .mobile-expanded .mobile-details ha-icon { transform:rotate(180deg); }
}
`;
