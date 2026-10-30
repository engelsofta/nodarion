# Changelog

## 1.27.17 — Less nagging. More caching. 💤

> Your devices get a daily check-up, not a clingy roommate.

Web-interface discovery now runs independently of the GUI, remembers its results and gives known devices a quieter once-a-day routine.

## Daily checks, instant discoveries

- Recheck known HTTP/HTTPS endpoints once every 24 hours, including devices where no web server was found.
- Check new devices and changed IP/MAC identities without waiting for the daily interval.
- Persist results across Home Assistant restarts, integration reloads and temporary offline periods.
- Hide links while devices are offline; reuse a still-valid saved result when the same device returns.
- Keep **Scan now** as an explicit override that clears saved results and starts fresh checks.

## Background means background

- Process bounded discovery batches independently of browser windows and regular network scans.
- Wait five seconds between batches, while cached results prevent repeat HTTP requests during the daily interval.
- Publish each completed device immediately instead of waiting for the entire batch.
- Notify entities and subscribed frontends without resetting the normal network-scan timer.
- Cancel running checks cleanly during explicit rescans and integration unload; retain persisted results on unload.

## Validation

- 110 Python tests and 9 JavaScript test entries passed.
- Regression coverage includes GUI-independent batches, per-device publication, daily positive/negative caching, persisted results, offline/reconnect behaviour, identity changes and invalid stored URLs.
- Python/JavaScript syntax, version consistency and HACS archive structure checked.

**Trade-off:** if a device stays online but its web server is switched off, its link can remain visible until the next daily check. Use **Scan now** to recheck sooner.

Integration: **1.27.17** · Frontend: **1.29.29**.

Update through HACS, restart Home Assistant to load the backend changes, then reload the Nodarion page.

## 1.27.15 — Champagne, not highlighter. 🥂

> Your dashboard hired an interior designer. The neon yellow did not survive probation.

Nodarion now shares the warm room backdrop and glass styling of the other Engelsoft integrations, with more room for devices and clearer light-mode details.

## A room with a view

- Bundle the dark room-interior and light background images directly with Nodarion.
- Match warm glass panels, rounded outlines and table surfaces to Nodarion Pager.
- Expand large-screen content to 92% of the available panel width, leaving 4% visible background on each side. Tablet and phone spacing stays compact.

## Softer gold, clearer controls

- Replace bright yellow/orange accents on save actions, checkboxes, selected controls and decorative elements with softer champagne gold.
- Remove yellow dropdown fills and thick side stripes; selected filters use a fine bottom accent with visible keyboard focus.
- Neutralise olive tones in glass surfaces, table headers and muted text while retaining semantic device-state colours.

## Glass without the ghost stripes

- Use a continuous overview-card surface instead of stacked glow layers.
- Remove the participant-table shadow extending towards the overview and decouple overview cards from live backdrop blur to reduce hover-related rendering artefacts.
- A six-row local hover check kept overview screenshots unchanged. The originally reported browser-specific band was not reproduced locally, so confirmation in the affected browser remains open.

## Light mode, with the lights actually on

- Darker version text, header labels and icons; clearer light surfaces behind GitHub links.
- Higher-contrast device icons with distinct router, mesh, VPN and guest colours.
- Keep offline icons readable rather than fading the entire row; improve monitoring-action contrast.

## Validation and update

- 104 Python tests and 9 JavaScript test entries passed.
- Desktop dark/light and mobile previews checked with example data, including a 2538px-wide layout and a 390px phone viewport.
- HACS ZIP structure, bundled backgrounds and version consistency verified.

Integration: **1.27.15** · Frontend: **1.29.27**.

Update through HACS, restart Home Assistant, then reload Nodarion. If previous styles remain cached, perform a hard browser refresh.

## 1.27.7 — Less bulk. More control. ✂️

> Your dashboard went on a diet. Your network hired a bouncer.

This release gives Nodarion a lighter overview and adds direct controls for supported FRITZ!Box devices and guest Wi-Fi, plus verified links to device web interfaces.

## A lighter dashboard

- Slimmer overview cards with fine outlines, quieter lighting and lighter typography.
- Gold underlines for selected filters instead of filled boxes.
- Frameless settings icons, shorter separators and a simple guest-network status line.
- Coordinated dark, light and mobile layouts with visible keyboard focus and reduced-motion support.

## Internet access: you are on the list… or you are not

- Block or release internet access directly from the participant table for supported FRITZ!Box LAN clients.
- Manual blocks survive learning mode and restarts, and follow a known MAC address across IP changes. With no known MAC, the block initially applies to the IP address.
- Local network communication remains available.
- Router/mesh infrastructure, guest devices and VPN connections remain exempt from individual HostFilter controls. Missing controls now come with a reason.
- Compact block actions sit beside the access status; manual blocks and enforcement errors appear in the live log.

## Guest Wi-Fi, minus the router-tab expedition

- Administrators can switch guest Wi-Fi on or off directly from the guest dialog.
- Nodarion checks that the target is a guest WLAN before writing, reads back the resulting state, and shows errors inline.
- Controls stay disabled while a change is pending; the guest QR code is removed when Wi-Fi is disabled.

## One click to the device

- Show web-interface links only after an actual HTTP/HTTPS response, including login-protected interfaces.
- Check HTTP on ports 80/8080 and HTTPS on 443/8443 for online devices in configured monitored networks.
- Allow up to ten seconds for slower servers, including FRITZ!Box responses, while running checks in the background.
- Cache positive results for five minutes and negative results for two minutes; explicit scans reset the web checks.
- Hide links for offline devices, changed identities and expired results. Discovery sends no credentials and follows no redirects.
- Links open in a new tab; the browser still needs access to the device network. Local self-signed certificates are accepted for detection and validated by the browser when opened.

## Validation

- 104 Python tests and 9 JavaScript test entries passed.
- Desktop dark/light and mobile layouts checked in a browser with example data.
- Corrected HTTP discovery tested against a local FRITZ!Box. Physical guest-WLAN and WAN write operations were tested with simulated router responses, not live device writes.
- HACS archive structure and Python/JavaScript syntax checked.

Integration: **1.27.7** · Frontend: **1.29.19**.

Update through HACS, restart Home Assistant to load the backend changes, then reload the Nodarion page. If old styling remains, perform a hard browser refresh.

## 1.27.0 — Less spaghetti. More confetti. 🍝🎉

> Five tidy setup sections. Zero pasta-related incidents.

This release replaces the long Home Assistant configuration form with five focused sections: Networks & scanning, FRITZ!Box & Mesh, AdGuard Home, AI analysis, and Advanced settings.

- Stage edits and apply them together with **Save & finish**. Closing the dialog discards pending edits.
- Preserve existing credentials, defaults, and unrelated options when editing a section.
- Test enabled local service connections before saving; return connection and input errors to the relevant section.
- Use the same section dialogs for initial setup, reconfiguration, and authentication recovery.
- Share AI scheduling and privacy settings with the existing Nodarion panel storage.
- Keep additional network/VLAN management and existing monitoring behavior in the panel.
- Include updated English/German instructions, the community demo, and visible Ko-fi support links.

Integration: `1.27.0` · Frontend: `1.29.12` (unchanged).

Validation: 83 Python regression tests passed. Installed Home Assistant dialog rendering and real-device behavior remain unverified.

**Updating:** Update to `1.27.0` in HACS and restart Home Assistant. Existing configuration is preserved. This stable release includes the configuration changes from `1.27.0-beta.1`.

---

## 1.27.0-beta.1 — Setup without the spaghetti 🍝

> Your network can be spaghetti. Your setup shouldn't be.

This prerelease replaces the long Home Assistant configuration form with five focused sections: Networks & scanning, FRITZ!Box & Mesh, AdGuard Home, AI analysis, and Advanced settings.

- Stage edits and apply them together with **Save & finish**. Closing the dialog discards pending edits.
- Preserve existing credentials, defaults, and unrelated options when editing a section.
- Test enabled local service connections before saving; return connection and input errors to the relevant section.
- Use the same section dialogs for initial setup, reconfiguration, and authentication recovery.
- Share AI scheduling and privacy settings with the existing Nodarion panel storage.
- Keep additional network/VLAN management and existing monitoring behavior in the panel.
- Include updated English/German instructions, the community demo, and visible Ko-fi support links.

Integration: `1.27.0-beta.1` · Frontend: `1.29.12` (unchanged).

Validation: 83 Python regression tests passed. Installed Home Assistant dialog rendering and real-device behavior remain unverified.

**Testing:** Enable prerelease versions in HACS, select `1.27.0-beta.1`, and restart Home Assistant after updating. Check each configuration section and save once. To return to the current stable version, select `1.26.1` in HACS and restart Home Assistant.

---

## 1.26.1 — Screenshots back in view

- Embed the device overview and AdGuard DNS screenshots using the same direct Markdown image syntax as the AI analysis screenshot.
- Include the corrected English and German READMEs in this release so HACS can display the updated documentation for the installed version.

Integration: `1.26.1` · Frontend: `1.29.12` (unchanged).

Validation: README image syntax and release version consistency checked. Live HACS rendering remains unverified.

---

## 1.26.0 — 👓 Now you see me

> Less squinting. More networking.

- Improve light-theme alert action contrast: Details, Monitor, and Approve buttons now use dark blue text on a light blue surface, with clear hover and keyboard-focus states.
- Fix light-theme device-link hover colours so labels remain readable.
- Increase presence status labels from 9 to 11 px and timeline labels from 8 to 11 px, with improved line spacing.
- Strengthen presence status and timeline text contrast in both light and dark themes.
- Refresh the frontend cache version so browsers load the updated styling.

Validation: 71 Python tests, JavaScript tests, and frontend syntax checks passed. Alert action text contrast is 7.53:1 normally and 9.68:1 on hover. Live Home Assistant rendering remains unverified.

Integration: `1.26.0` · Frontend: `1.29.12`.

Restart Home Assistant and refresh the browser after updating.

---

## 1.25.3 — 🕵️ Same MAC, different caps

> Caps Lock is not a new device.

- Fix false “different MAC address” alerts after updating: identity warnings now compare normalized addresses instead of raw text. Lowercase and uppercase readings of the same MAC no longer trigger a device-change warning.
- Ignore separator and surrounding-whitespace differences, missing addresses, and all-zero placeholders in identity warnings.
- Preserve detection of real changes between valid MAC addresses and the existing internet-approval protection.
- Include the anonymized light/dark design comparison in the German and English documentation.

Existing log entries are retained; this fix prevents new formatting-related false alerts.

Validation: 71 Python tests passed, including MAC case, separator, whitespace, placeholder, and real-change checks. JavaScript tests and frontend syntax checks passed. Live Home Assistant and physical-device validation remain unverified.

Integration: `1.25.3` · Frontend: `1.29.11` (unchanged).

Restart Home Assistant after updating.

---

## 1.25.2 — Zero MAC, zero panic

> Your MAC can play hide-and-seek. Your save button shouldn't.

- Treat zero MAC addresses as unknown instead of revoking an existing internet approval when the real address first appears.
- Preserve the last valid MAC through repeated missing or zero readings. Confirmed changes between real MAC addresses still require renewed approval; unapproved devices stay blocked.
- Save settings without waiting for network discovery. Reconfigure scanners only when the saved network segments actually change, and run the required scan in the background.
- Add a matching desktop “Report an issue on GitHub” button beside the star invitation, with German and English labels.
- Synchronize integration version and frontend cache versions.

Validation: 69 Python tests passed, including repeated zero-MAC observations and a pending background scan; JavaScript tests and syntax checks passed. Live Home Assistant and physical-device validation remain unverified.

Integration: `1.25.2` · Frontend: `1.29.11`.

Restart Home Assistant and refresh the browser after updating.

---

## 1.25.1 — Unpin the Fritz, keep the bits

> A little freedom for Fritz. A little less drama for Hassfest.

- Use `fritzconnection>=1.15.1` so the shared dependency can follow Home Assistant updates, as required by Hassfest.
- Move the mobile device disclosure arrow to the first row, keeping it accessible when the monitoring column is hidden.
- Synchronize integration versions and README badges; refresh the frontend cache version.

Validation: 64 Python tests, JavaScript tests and frontend syntax checks passed. Live Home Assistant rendering was not tested.

Integration: `1.25.1` · Frontend: `1.29.10`.

Restart Home Assistant and refresh the browser after updating.

---

## 1.25.0 — Less scrolling, more stars

> Your thumb gets a holiday. Your network stays on duty.

## What's new

- A compact mobile overview with a small chevron inside the network devices tile.
- Unified device search across names, addresses, vendors, VLANs, mesh points and monitoring functions.
- Collapsible mobile filters, active filter counts, removable chips and a reset action.
- Smaller mobile device cards with secondary details behind the existing disclosure button.
- Matching 44 px search, filter and settings controls with consistent colours.
- A subtle desktop GitHub star invitation, translated according to Home Assistant's language and linked directly to the repository.

## Improvements

- Tile settings open the selected section immediately.
- Warm settings input backgrounds, including numeric fields and units.
- Monitoring typography adapts to tile width; settings headers and VLAN fields wrap in narrow cards.
- The overview chevron's accessibility label is available in German and English.
- Integration version, manifest, README version badges and frontend cache versions are synchronized.

## Validation

- 63 Python tests passed.
- JavaScript search and internet-status tests passed; frontend syntax checked.
- A focused privacy scan found no credentials or personal data in the release changes; address matches are examples and synthetic test fixtures.
- Live Home Assistant rendering and physical devices were not tested for this release.

## Versions

- Integration: `1.25.0`
- Frontend: `1.29.9`

After updating, restart Home Assistant and refresh the browser to load the updated panel.

---

## 1.24.5 — One version, everywhere

> What you install is now exactly what Nodarion shows.

### Fixed

- Updated the integration version exposed to the Nodarion panel, which had
  remained pinned to `1.24.1` while the manifest advanced.
- Added a regression check that keeps the displayed version synchronized with
  the integration manifest.
- Refreshed the release badges in both README files.

### Versions

- Integration: `1.24.5`
- Frontend: `1.29.4`

---

## 1.24.4 — Right API, right entry

> The modern lookup now has the full address: identifier plus config entry.

### Fixed

- Passed the required config-entry ID to Home Assistant's
  `async_get_device_by_identifier` registry method.
- Prevented coordinator listener updates from failing with a missing-argument
  `TypeError` after the 1.24.3 registry migration.

### Versions

- Integration: `1.24.4`
- Frontend: `1.29.4`

---

## 1.24.3 — Future-proof, warning-proof

> Same devices, cleaner startup: Nodarion speaks Home Assistant's current
> registry language.

### Fixed

- Replaced the deprecated multi-config-entry device lookup with Home
  Assistant's identifier-specific registry API.
- Removed the deprecation warning scheduled to become an error in Home
  Assistant 2027.8.

### Versions

- Integration: `1.24.3`
- Frontend: `1.29.4`

---

## 1.24.2 — Starts fast. Stays vigilant.

> Nodarion ist sofort da. Seine Langstreckenläufer halten Home Assistant nicht
> länger an der Startlinie fest.

### Improved

- Restored the persisted participant inventory immediately instead of waiting
  for the first active network scan to finish.
- Moved the initial network refresh behind entity, service, and panel setup so
  Nodarion becomes available promptly with a consistent cached state.
- Registered the initial scan and long-running priority recovery loop as true
  Home Assistant background tasks.
- Kept explicit task cancellation when the integration unloads.

### Fixed

- Prevented the intentionally persistent `Nodarion priority recovery` loop
  from being counted as pending bootstrap work and delaying Home Assistant
  startup until its timeout.

### Versions

- Integration: `1.24.2`
- Frontend: `1.29.4`

---

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
