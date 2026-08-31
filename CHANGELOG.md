# Changelog

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
