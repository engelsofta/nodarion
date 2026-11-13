export const settingsStyles = `
/* Shared settings center: every section uses the same rows and controls. */
.settings-view .watch-settings-panel { padding:18px clamp(14px,2vw,28px); }
.settings-view .settings-toolbar { gap:16px; padding:0 0 14px; border:0; border-bottom:1px solid var(--ns-line); border-radius:0; background:none; }
.settings-view .settings-menu { grid-template-columns:repeat(5,minmax(0,1fr)); }
.settings-view .settings-menu button { display:flex; align-items:center; justify-content:center; gap:8px; min-height:42px; font-size:12px; font-weight:500; }
.settings-view .settings-menu ha-icon { --mdc-icon-size:18px; color:var(--ns-cyan); }
.settings-view .settings-save-area { gap:12px; }
.settings-save-status { max-width:155px; font-size:11px; line-height:1.4; color:var(--ns-muted); }
.settings-view .settings-tab-panel { grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px 32px; }
.settings-view .watch-settings-panel .rule-group { border:0; border-radius:0; background:none; box-shadow:none; padding:0; }
.settings-view .rule-group h3 { min-height:30px; margin:0 0 6px; color:var(--ns-cyan); font-size:13px; font-weight:500; text-transform:none; letter-spacing:.02em; }
.settings-view .rule-group .rule { grid-template-columns:minmax(0,1fr) auto; gap:16px; padding:12px 0; border-bottom:1px solid var(--ns-line); }
.settings-view .rule label, .settings-view .rule > label, .settings-view .rule strong { font-size:13px; font-weight:500; }
.settings-view .rule small { font-size:11px; line-height:1.5; color:var(--ns-muted); max-width:58ch; }
.settings-view .rule input:not([type="checkbox"]):not([type="hidden"]), .settings-view .rule select { width:140px; max-width:100%; box-sizing:border-box; font-weight:400; }
.settings-view .rule .unit-input { grid-template-columns:58px auto; width:auto; }
.settings-view .unit-input input { width:58px !important; min-width:0; text-align:right; }
.settings-view .unit-input span { padding:0 10px 0 4px; font-weight:400; }
.settings-view input[type="checkbox"][data-rule], .settings-view input[type="checkbox"][data-segment-field] { appearance:none; position:relative; flex:none; width:40px; height:24px; min-height:24px; padding:0; border:1px solid var(--ns-line); border-radius:99px; background:rgba(255,255,255,.12); cursor:pointer; transition:background .15s; }
.settings-view input[type="checkbox"][data-rule]::after, .settings-view input[type="checkbox"][data-segment-field]::after { content:""; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#e8e3d8; transition:transform .15s; }
.settings-view input[type="checkbox"][data-rule]:checked, .settings-view input[type="checkbox"][data-segment-field]:checked { background:var(--ns-cyan); }
.settings-view input[type="checkbox"][data-rule]:checked::after, .settings-view input[type="checkbox"][data-segment-field]:checked::after { transform:translateX(16px); background:#29261f; }
.settings-view .learning-card { grid-template-columns:1fr auto; align-items:center; gap:8px 14px; padding:12px 0 0; border:0; border-radius:0; background:none; }
.settings-view .learning-card strong { font-size:13px; font-weight:500; }
.settings-view .learning-card p { grid-column:1/-1; color:var(--ns-muted); font-size:11px; }
.settings-view .learning-card .learning-actions { grid-column:1/-1; grid-row:4; }
.settings-view .learning-card .rule { grid-column:1/-1; margin:0; padding:8px 0; }
.settings-view .learning-action { font-weight:500; background:transparent; color:var(--ns-cyan); border-color:var(--ns-line); }
.settings-view .general-panel .vlan-settings { order:3; }
.settings-view .general-panel .cleanup-settings { display:block; grid-column:1/-1; order:4; padding-top:12px; border-top:1px solid var(--ns-line); }

.settings-view .rule-group.cleanup-settings .rule { grid-template-columns:1fr auto; }
.settings-view .cleanup-summary { grid-column:1; max-width:80ch; font-size:11px; color:var(--ns-muted); }
.settings-view .cleanup-actions { grid-column:2; grid-row:1/3; display:flex; flex-wrap:wrap; gap:8px; }
.settings-view .cleanup-settings .cleanup { width:auto; margin:0; background:transparent; border-color:var(--ns-line); font-weight:500; }
.settings-view .cleanup[data-forget="true"] { color:#d4a6a0; }
.settings-view .settings-help-button { border:0; background:none; color:var(--ns-muted); font-weight:400; }
.settings-view .adguard-feature { padding:12px 0; border:0; border-bottom:1px solid var(--ns-line); border-radius:0; background:none; color:var(--ns-text); }
.settings-view .adguard-feature strong { font-size:13px; font-weight:500; }
.settings-view .adguard-feature small { font-size:11px; color:var(--ns-muted); }
.settings-view .advanced-settings { border:0; padding:0; }
.settings-view .settings-dirty { background:none; border:0; padding:0; justify-content:flex-end; }
.settings-view .settings-dirty > span { display:none; }
.settings-view .vlan-row { grid-template-columns:repeat(3,minmax(0,1fr)); background:rgba(255,255,255,.025); }
@media(max-width:1100px) {
  .settings-view .settings-toolbar { flex-direction:column; align-items:stretch; }
  .settings-view .settings-save-area { justify-content:flex-end; border:0; }
}
@media(max-width:700px) {
  .settings-view .settings-menu { display:flex; overflow-x:auto; scrollbar-width:thin; padding-bottom:5px; }
  .settings-view .settings-menu button { flex:0 0 auto; padding:0 14px; white-space:nowrap; border:0; border-radius:8px; }
  .settings-view .settings-menu button + button::before { display:block; }
  .settings-view .settings-tab-panel { grid-template-columns:minmax(0,1fr); gap:22px; }
  .settings-view .settings-save-area { justify-content:space-between; }
  .settings-view .settings-save-status { max-width:none; }
  .settings-view .rule-group .rule { gap:10px; }
  .settings-view .rule input:not([type="checkbox"]):not([type="hidden"]) { width:110px; }
  .settings-view .cleanup-settings .rule { grid-template-columns:1fr; }
  .settings-view .cleanup-actions { grid-column:1; grid-row:auto; }
  .settings-view .vlan-row { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .settings-view .settings-select { width:140px; max-width:140px; }
  .settings-view .rule-group .settings-select summary { white-space:normal; overflow-wrap:anywhere; }
}
@media(prefers-reduced-motion:reduce) {
  .settings-view input[type="checkbox"], .settings-view input[type="checkbox"]::after { transition:none; }
}
`;
