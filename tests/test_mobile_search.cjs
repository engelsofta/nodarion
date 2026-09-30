const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const file = process.argv[2] || path.join(__dirname, '../custom_components/nodarion/frontend/nodarion-panel.js');
let Panel;
const context = { HTMLElement: class {}, customElements: { get: () => false, define: (_name, value) => { Panel = value; } } };
vm.runInNewContext(fs.readFileSync(file, 'utf8').replace(/^import .*;\r?\n/gm, ''), context);
const panel = Object.create(Panel.prototype);
panel._monitor = { monitored:['lamp'], notifications:['lamp'], presence_devices:['lamp'] };
const entity = { entity_id:'binary_sensor.lamp', state:'on', attributes:{ nodarion_key:'lamp', friendly_name:'Wohnzimmer-Lampe', hostname:'Hue-Light', ip_address:'192.168.1.20', mac_address:'AA:BB:CC:00:00:01', mac_vendor:'Philips', segment_name:'Zuhause', segment_id:'home', vlan_id:20, access_point:'Flur', detection_sources:['fritzbox'], connection_type:'WLAN' } };
test('Search covers hidden device fields and monitoring functions', () => {
  for (const query of ['Wohnzimmer', 'hue', '192.168.1.20', 'aa:bb:cc', 'PHILIPS', 'Zuhause', 'VLAN 20', 'Flur', 'WLAN', 'Favoriten', 'Glocke', 'Anwesenheit', 'FRITZ!Box']) {
    assert.equal(panel._matchesDeviceSearch(entity, query), true, query);
  }
});
test('Search combines terms, handles blanks and rejects unrelated devices', () => {
  assert.equal(panel._matchesDeviceSearch(entity, '  philips   flur  '), true);
  assert.equal(panel._matchesDeviceSearch(entity, ''), true);
  assert.equal(panel._matchesDeviceSearch(entity, 'Philips Garage'), false);
  assert.equal(panel._matchesDeviceSearch(entity, '<script>'), false);
  assert.equal(panel._matchesDeviceSearch({entity_id:'binary_sensor.empty',state:'off',attributes:{}}, 'offline'), true);
});
