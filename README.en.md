<div align="center">
  <img src="https://raw.githubusercontent.com/engelsofta/nodarion/main/custom_components/nodarion/brand/logo.png" alt="Engelsoft Nodarion" width="600">
</div>

<p align="center">
  <a href="README.md">Deutsch</a> · <strong>English</strong>
</p>

<h1 align="center">Engelsoft Nodarion for Home Assistant</h1>

<p align="center">
  <a href="https://github.com/engelsofta/nodarion/releases/latest"><img src="https://img.shields.io/github/v/release/engelsofta/nodarion?label=Version&color=d4a33f" alt="Latest version"></a>
  <a href="https://github.com/engelsofta/nodarion/releases"><img src="https://img.shields.io/github/downloads/engelsofta/nodarion/total?label=Downloads&color=d4a33f" alt="Total release downloads"></a>
  <a href="https://www.home-assistant.io/"><img src="https://img.shields.io/badge/Home%20Assistant-Custom-41BDF5?logo=homeassistant&logoColor=white" alt="Home Assistant custom integration"></a>
  <a href="https://hacs.xyz/"><img src="https://img.shields.io/badge/HACS-Custom-ED7D31" alt="HACS custom repository"></a>
  <a href="https://github.com/engelsofta/nodarion/actions/workflows/hacs.yml"><img src="https://github.com/engelsofta/nodarion/actions/workflows/hacs.yml/badge.svg" alt="HACS validation"></a>
  <a href="https://github.com/engelsofta/nodarion/actions/workflows/hassfest.yml"><img src="https://github.com/engelsofta/nodarion/actions/workflows/hassfest.yml/badge.svg" alt="Hassfest"></a>
</p>

> **One network, one complete picture:** Nodarion combines active ping/TCP scans,
> FRITZ!Box and Mesh data, and DNS activity from AdGuard Home for each device.
> Instead of three separate data sources, you get one clear view of devices,
> connections, and anomalies — including local rules and optional AI analysis.

Nodarion is a local Home Assistant custom integration. It scans a configurable
IPv4 network and creates a connectivity binary sensor for every discovered
device. Beyond simple reachability, it helps explain where a device is
connected, how it communicates, and whether its behaviour looks unusual.

## What is new in the current build

- The complete Nodarion panel now follows the language selected in Home
  Assistant. German is fully supported; every other language falls back to
  English.
- Dates, times, numbers, and both manual and daily AI network reports are
  generated in the appropriate German or English locale.
- Active anomalies are grouped into one continuously updated Home Assistant
  notification, keeping the notification centre tidy even on busy networks.
- Approving a new device reliably enables its internet access and resolves all
  related warnings. Devices whose access is already enabled can safely be
  approved again.
- Refined rating indicators and a scrollable warning view improve readability
  on smaller screens.

## Insights

### Device overview

The central table combines reachability, device state, Mesh access point,
AdGuard DNS activity, internet access, and personal monitoring controls.

![Device overview in Engelsoft Nodarion](https://raw.githubusercontent.com/engelsofta/nodarion/main/docs/images/teilnehmeruebersicht.png)

### AdGuard DNS Live

Review DNS queries live with history, client mapping, response type, processing
time, and direct block or allow actions.

![AdGuard DNS Live in Engelsoft Nodarion](https://raw.githubusercontent.com/engelsofta/nodarion/main/docs/images/dns-live.png)

### AI network analysis

Optional AI analysis summarizes network health, anomalies, changes, and
recommendations in a clear daily assessment.

![AI network analysis in Engelsoft Nodarion](https://raw.githubusercontent.com/engelsofta/nodarion/main/docs/images/ki-netzwerkanalyse.png)

## Installation

### HACS

<a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=engelsofta&repository=nodarion&category=integration">
  <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Add Nodarion as a custom HACS repository">
</a>

Use the button above, or add the repository manually:

1. Open **Integrations** in HACS.
2. Select **Custom repositories** from the menu.
3. Add `https://github.com/engelsofta/nodarion` as an **Integration** repository.
4. Install **Engelsoft Nodarion** and restart Home Assistant.

### Manual installation

1. Copy `custom_components/nodarion` into the directory with the same name in
   your Home Assistant configuration.
2. Restart Home Assistant.
3. Go to **Settings → Devices & services → Add integration** and search for
   **Engelsoft Nodarion**.
4. Enter the local network in CIDR notation, for example
   `192.168.178.0/24`.

## Main features

- Automatically registered **Engelsoft Nodarion** page in the Home Assistant
  sidebar
- Active ping/TCP discovery with optional direct FRITZ!Box detection over TR-064
- One Home Assistant device and `binary_sensor` for every network device
- Persistent inventory with stable entity IDs based on IP address
- Presence tracking for selected devices with a configurable offline timeout
- Search, status filters, sorting, metrics, configurable columns, and a
  responsive device table
- Favorites, current Mesh access point, and a log of Mesh handovers
- LAN, Wi-Fi, or powerline connection details, Wi-Fi band, RX/TX rate, and
  signal strength when supplied by the FRITZ!Box
- DHCP/static assignment and remaining DHCP lease time
- FRITZ!Box model and installed FRITZ!OS version
- Automatic internet blocking for newly discovered devices until they are
  explicitly approved
- Local MAC vendor database with more than 58,000 prefixes; randomized or
  locally administered addresses are intentionally not assigned to a vendor
- Persistent live log for new devices, online/offline transitions, name
  changes, guest activity, and Mesh handovers
- Configurable setup range for identifying new devices, optionally imported
  from the FRITZ!Box DHCP range
- Optional AdGuard Home analysis per device, including queries, blocking rate,
  domains, filter reasons, DNS log, and possible DNS bypass detection
- Administrator-only AdGuard management for filters, allow/block actions, and
  DNS rewrites
- Local monitoring rules for unknown devices, quiet-hour activity, frequent
  state changes, identity changes, important offline devices, and guest access
- Multiple Home Assistant notification targets for warnings and critical alerts
- A `nodarion_alert` event for custom Home Assistant automations
- Optional daily AI analysis using the preferred Home Assistant AI Task entity
- Manual scans and AI reports directly from the Nodarion panel

## FRITZ!Box guest access

Nodarion reads guest access locally and in read-only mode over TR-064. It shows
the state, Wi-Fi name, reported security settings, and connected guests. Guest
devices can be labelled and filtered in the device table. Connections and
disconnections appear in the live log, with optional warnings for new guests,
quiet-hour activity, or unusually long sessions.

The **Show and monitor guest network** setting can hide the feature completely.
Connection start times and warning history are persisted, so restarting Home
Assistant does not reset an ongoing guest session.

## Notifications and automations

Under **Settings → Notifications and checks**, you can select any `notify.*`
entity configured in Home Assistant. Nodarion sends new alerts through
`notify.send_message`, so credentials for Telegram and other services remain in
Home Assistant.

The Home Assistant notification centre receives one summary that is updated as
active anomalies change. Resolved warnings leave the summary but remain in the
Nodarion history.

Every new warning also fires the `nodarion_alert` event. Event data includes
`type`, `severity`, `device_name`, `ip_address`, `mac_address`, `access_point`,
and `message`, allowing custom automations to respond independently of the
notification targets selected in Nodarion.

## Important notes

The Home Assistant host must be able to reach the target network directly.
Container installations may require `network_mode: host`. Without FRITZ!Box
support, devices that respond to neither ping nor a configured TCP port cannot
be discovered. With FRITZ!Box support enabled, a device reported as active by
the router is considered online even without a ping response.

TR-064 application access must be enabled on the FRITZ!Box. A dedicated
FRITZ!Box user for Nodarion is recommended. Internet protection uses the
`X_AVM-DE_HostFilter` service: local network communication remains possible,
while internet access is granted explicitly from the device table.

To reduce network and system load, only ping/TCP discovery runs at the selected
scan interval. FRITZ!Box and Mesh data is refreshed at most once per minute,
AdGuard data every ten minutes, and FRITZ!Box device information once per hour.

AdGuard Home analysis requires direct access to its web interface and an
administrator account. The query log must be enabled. Devices using a VPN,
Private DNS, or an external DNS server may not appear. Write operations are
restricted to Home Assistant administrators and input is validated before it is
sent to AdGuard Home.

AI analysis is disabled by default. With anonymized DNS privacy, only counters
and stable, non-reversible domain identifiers are passed to the configured AI.
Full domain names are included only when explicitly selected. When a cloud AI
is used, the summarized network data leaves the local system.

## License

Engelsoft Nodarion is released under the [MIT License](LICENSE).
