/** Derive one unambiguous internet/trust presentation for a participant. */
export const internetStatusFor = ({
  approvalRequired,
  wanAccess,
  learningActive,
  knownHost,
  guestNetwork,
  vpnConnection = false,
  networkInfrastructure = false,
}) => {
  if (networkInfrastructure) {
    return { label: "Netzwerkinfrastruktur", cssClass: "infrastructure" };
  }
  if (vpnConnection) {
    return { label: "VPN · Nicht verwaltet", cssClass: "unmanaged" };
  }
  if (approvalRequired) {
    if (wanAccess === "denied") {
      return { label: "Gesperrt · Freigabe ausstehend", cssClass: "denied" };
    }
    if (wanAccess === "error") {
      return { label: "Freigabe fehlgeschlagen", cssClass: "error" };
    }
    return { label: "Freigabe ausstehend", cssClass: "pending" };
  }
  if (learningActive && knownHost) {
    return { label: "Lernphase · automatisch freigegeben", cssClass: "learning" };
  }
  if (knownHost) {
    return {
      label: wanAccess === "granted" ? "Freigegeben" : "Vertrauenswürdig",
      cssClass: wanAccess === "granted" ? "allowed" : "trusted",
    };
  }
  if (wanAccess === "granted") {
    return { label: "Freigegeben", cssClass: "allowed" };
  }
  return {
    label: guestNetwork ? "Nicht verwaltet" : "Noch nicht geprüft",
    cssClass: guestNetwork ? "unmanaged" : "unchecked",
  };
};
