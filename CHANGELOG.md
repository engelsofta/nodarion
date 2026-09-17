# Changelog

## 1.24.1 — VIP lane for sleepy devices

> Important devices take the fast lane. The rest of the network keeps cruising.

### Improved

- Moved fast recovery into a dedicated lightweight task that probes only
  monitored and presence devices which are currently offline.
- Kept normal known-device scans, rolling discovery, FRITZ!Box, and AdGuard on
  their regular schedules instead of repeating them every 15 seconds.
- Prevented normal scans and priority recovery probes from overlapping.
- Preserved immediate recovery through ping and the existing two-hit safety
  confirmation for TCP-only detections.
- Cleanly stops the recovery task as soon as every important device is online
  and when the integration unloads.

### Versions

- Integration: `1.24.1`
- Frontend: `1.29.4`

---

## 1.24.0 — Fast scans, calm LANs

> **Scan fast. Stay LAN-back.** Nodarion now spends its effort where it matters:
> important devices return quickly, while background discovery stays polite.

### Added

- Added a priority recovery lane for monitored and presence devices. When one
  of these devices is offline, it is checked every 15 seconds until it returns.
- Added rolling discovery in groups of 32 unknown addresses instead of periodic
  full-subnet bursts.
- Added ARP/neighbor candidate prioritisation and learned probe profiles that
  remember the last successful ping or TCP port for every device.
- Added live scanner status to **Connections active**, including the current
  mode, effective interval, checked addresses, detections, discovery work, and
  important devices.
- Added a WebSocket subscription with revisioned state patches for the panel.
  REST remains available as a compatibility fallback.

### Improved

- Parallelised reverse-DNS lookup with a dedicated concurrency limit and
  separate positive and negative cache lifetimes.
- Reduced default global scanner concurrency from 64 to 32 and kept discovery
  rate-limited even while important offline devices use fast recovery.
- **Scan now** performs an intentional complete discovery rather than merely
  refreshing existing entities.
- Split frontend state transport into its own module and limited rendering to
  the sections affected by an update.
- Removed repeated full-state polling and expensive attribute serialization on
  every Home Assistant state change.
- Moved the four AdGuard DNS statistics into a compact, subtly separated group
  beside the DNS Live controls.
- Completed German and English wording for the new scanner modes and counters.

### Fixed

- Prevented an optional missing mesh view from turning a successful AI report
  into a misleading `null.innerHTML` error.
- Kept fast recovery focused on important devices without multiplying rolling
  discovery or full-VLAN scans.

### Versions

- Integration: `1.24.0`
- Frontend: `1.29.4`

---

## 1.23.2 — No more hide-and-seek

This small visual follow-up makes the remaining controls readable in Home
Assistant's light theme and gives the Nodarion logo somewhere useful to go.

### Improved

- Increased contrast for table-column labels, settings buttons, guest-network
  indicators, and device DNS-rating badges in light mode.
- Added explicit light-theme colours for neutral, elevated, warning, and
  critical rating chips.
- Strengthened hover states without changing the established gold Nodarion
  design language.
- Clicking the header logo now opens the public Nodarion GitHub repository in a
  new tab, with keyboard focus styling and accessible German/English labels.
- Bumped the frontend cache version so Home Assistant loads the corrected
  stylesheet instead of retaining the previous cached module.

### Versions

- Integration: `1.23.2`
- Frontend: `1.28.2`

---

## 1.23.1 — Same network, now with the lights on

This visual maintenance release gives every Nodarion settings page one shared,
modern design language while keeping the major VLAN and native AdGuard changes
from 1.23.0 intact.

### Improved

- Unified cards, spacing, fields, switches, buttons, and status colours across
  all separately opened settings pages.
- Added explicit high-contrast design tokens for light and dark themes.
- Improved readability of AdGuard DNS Live statistics, protection controls,
  VLAN configuration, monitoring settings, notifications, and AI settings.
- Restyled the table-column picker, confirmation dialogs, unsaved-change
  notices, advanced settings, filter chips, and secondary actions.
- Added consistent hover, focus, active, warning, destructive, and disabled
  states without removing their semantic colour distinctions.
- Added regression checks for shared theme tokens and light-theme coverage.

### Fixed

- Fixed several pale labels and values that inherited dark-theme colours on
  light backgrounds.
- Defined the previously missing shared text-colour variables used by multiple
  settings controls.

### Versions

- Integration: `1.23.1`
- Frontend: `1.28.1`

---

## 1.23.0 — More lanes, fewer integrations

> [!IMPORTANT]
> **VLAN support has arrived.** Nodarion can now configure, scan, display,
> filter, colour-code, and monitor multiple IPv4 VLANs and network segments.

> [!TIP]
> **The separate Home Assistant AdGuard Home integration is no longer required
> for Nodarion.** Nodarion now creates its own AdGuard device and provides the
> relevant status, statistics, and protection controls as native Home Assistant
> entities. After verifying the new entities, the separate integration may be
> removed if it is not used by other dashboards or automations.

### Added

- Editable VLAN and network-segment definitions with name, VLAN ID, subnet,
  role, colour, and individual monitoring controls.
- One scalable scanner for all enabled segments, with a shared concurrency
  limit and batched network checks.
- VLAN column, filtering, sorting, and colour markers in the device overview.
- Warnings when a known MAC address moves between segments; moves into isolated
  networks are treated as critical.
- A dedicated **Engelsoft AdGuard** device with native Home Assistant sensors
  and switches for protection state, filtering, Safe Browsing, parental
  control, Safe Search, query logging, request counts, blocking rate, rule
  counts, and processing time.
- Connection validation during setup and reconfiguration, plus Home Assistant
  reauthentication support when credentials stop working.
- Context help dialogs for all major settings sections.

### Changed

- AdGuard live statistics moved from settings to the AdGuard DNS Live area.
- Presence settings moved into the monitoring settings.
- Internal areas such as guest access and the setup range remain colour-coded
  on the left of the table; VLAN colours are shown consistently on the right.
- API read and write operations now require a Home Assistant administrator.
- Frontend data is more compact, scanner concurrency is bounded globally, and
  frequent storage writes are combined.
- Large backend responsibilities were separated into focused modules.
- Native entity and setup translations were completed in German and English.

### Removed

- Filter-list, custom filter-rule, and DNS-rewrite management from the Nodarion
  settings page. These advanced lists remain available in AdGuard Home itself.
- Obsolete release-note files from the repository. GitHub Releases remains the
  authoritative archive for previous versions.

### Fixed

- AdGuard protection switches now send requests in the format expected by
  current AdGuard Home versions, avoiding HTTP 415 errors.
- Authentication failures now guide the user through credential renewal rather
  than leaving the integration silently disconnected.

### Versions

- Integration: `1.23.0`
- Frontend: `1.28.0`

Earlier release notes are available in the
[GitHub Releases archive](https://github.com/engelsofta/nodarion/releases).
