import assert from "node:assert/strict";
import { internetStatusFor } from "../custom_components/nodarion/frontend/internet-status.mjs";

const learning = internetStatusFor({
  approvalRequired: false,
  wanAccess: null,
  learningActive: true,
  knownHost: true,
  guestNetwork: false,
});
assert.equal(learning.label, "Lernphase · automatisch freigegeben");
assert.equal(learning.cssClass, "learning");

const trusted = internetStatusFor({
  approvalRequired: false,
  wanAccess: null,
  learningActive: false,
  knownHost: true,
  guestNetwork: false,
});
assert.equal(trusted.label, "Vertrauenswürdig");
assert.equal(trusted.cssClass, "trusted");

const unchecked = internetStatusFor({
  approvalRequired: false,
  wanAccess: null,
  learningActive: false,
  knownHost: false,
  guestNetwork: false,
});
assert.equal(unchecked.label, "Noch nicht geprüft");
assert.equal(unchecked.cssClass, "unchecked");

const denied = internetStatusFor({
  approvalRequired: true,
  wanAccess: "denied",
  learningActive: false,
  knownHost: false,
  guestNetwork: false,
});
assert.equal(denied.label, "Gesperrt · Freigabe ausstehend");
assert.equal(denied.cssClass, "denied");

const vpn = internetStatusFor({
  approvalRequired: true,
  wanAccess: "error",
  learningActive: false,
  knownHost: false,
  guestNetwork: false,
  vpnConnection: true,
});
assert.equal(vpn.label, "VPN · Nicht verwaltet");
assert.equal(vpn.cssClass, "unmanaged");

const infrastructure = internetStatusFor({
  approvalRequired: true,
  wanAccess: "granted",
  learningActive: false,
  knownHost: true,
  guestNetwork: false,
  networkInfrastructure: true,
});
assert.equal(infrastructure.label, "Netzwerkinfrastruktur");
assert.equal(infrastructure.cssClass, "infrastructure");
