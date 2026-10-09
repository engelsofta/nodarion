# Nodarion update: multiple network segments and native AdGuard entities, available directly in HACS

Hi! I'm the developer of **Nodarion**, a local Home Assistant integration available directly in HACS. I shared an earlier version here; this update adds **multiple network segments** and **native AdGuard Home entities**.

You can now configure monitored subnets with names, roles and colours, filter devices by segment, and receive MAC-backed warnings when a known device moves between segments. Home Assistant needs network access to each monitored subnet; Nodarion does not configure VLANs on your router or switches.

The AdGuard connection now exposes its own HA device, statistics sensors and protection switches. Before removing another AdGuard integration, check whether your automations still use its entities.

It brings three practical things into one panel:

- **New-device alerts:** discover devices across configured IPv4 networks and spot unknown arrivals.
- **Important-device monitoring:** receive offline alerts and review online/offline changes and FRITZ!Box Mesh handovers.
- **DNS visibility:** connect AdGuard Home to inspect queries, blocked domains and filter reasons per device.

There are native connectivity binary sensors, multiple network segments, automation events, and dark/light designs. Basic ping/TCP discovery works without FRITZ!Box or AdGuard; each optional connection adds more information. Your HA host needs access to the monitored networks.

AI is optional: monitoring and local rules work without it. Daily AI reports use your configured HA AI Task provider.

**Install:** search **Nodarion** in HACS → download → restart HA → add **Engelsoft Nodarion** in Devices & services.

[Code, screenshots and documentation](https://github.com/engelsofta/nodarion)

The screenshot tour uses anonymized examples from an earlier version and introduces the core workflow; it does not show the new segment controls.

I'm looking for feedback from other setups. What would be most useful to you next: device troubleshooting, Pi-hole, UniFi, or presence automations? What router and DNS server do you use?
