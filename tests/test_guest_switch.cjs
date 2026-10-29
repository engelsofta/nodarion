const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
let Panel;
vm.runInNewContext(fs.readFileSync("custom_components/nodarion/frontend/nodarion-panel.js", "utf8").replace(/^import .*;\r?\n/gm, ""), {
  HTMLElement:class {}, customElements:{get:()=>false, define:(_name,value)=>{Panel=value;}}
});
function panel(enabled=false) {
  const p=Object.create(Panel.prototype);
  p._monitor={guest_access:{available:true,enabled,ap_type:"guest"},guest_since:{}};
  p._guestModalOpen=true;
  p._entities=()=>[];
  p.host={innerHTML:""};
  p.shadowRoot={querySelector:()=>p.host};
  return p;
}
test("switch renders confirmed state and disables during writes",()=>{
  const p=panel();p._renderGuest();
  assert.match(p.host.innerHTML,/role="switch".*aria-checked="false"/);
  p._guestToggleBusy=true;p._renderGuest();
  assert.match(p.host.innerHTML,/role="switch"[^>]*disabled/);
  assert.ok(!p.host.innerHTML.includes("Nur lesende Anzeige"));
});
test("normal WLAN is not switchable",()=>{
  const p=panel();p._monitor.guest_access.ap_type="normal";p._renderGuest();
  assert.match(p.host.innerHTML,/role="switch"[^>]*disabled/);
});
test("toggle sends explicit boolean, then uses returned state",async()=>{
  const p=panel();let sent;
  p._stateClient={mutate:async payload=>{sent=payload;p._monitor.guest_access.enabled=true;}};
  await p._toggleGuest();
  assert.equal(sent.action,"set_guest_enabled");assert.equal(sent.enabled,true);
  assert.match(p.host.innerHTML,/aria-checked="true"/);
  assert.equal(p._guestToggleBusy,false);
});
test("write error retains confirmed state and shows escaped error",async()=>{
  const p=panel();p._stateClient={mutate:async()=>{throw Error("<denied>");}};
  await p._toggleGuest();
  assert.match(p.host.innerHTML,/aria-checked="false"/);
  assert.match(p.host.innerHTML,/role="alert">.*&lt;denied&gt;/);
  assert.equal(p._guestToggleBusy,false);
});
