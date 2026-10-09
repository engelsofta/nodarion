# Nodarion: network monitoring with FRITZ!Box Mesh and AdGuard Home in one HA panel

Hi everyone! I'm the developer of **Nodarion**, a local network-monitoring integration for Home Assistant, available directly in HACS.

I built it to bring device reachability, FRITZ!Box Mesh information and AdGuard Home DNS activity into one view. Here are three things you can use it for today:

- **Notice new devices:** discover devices across configured IPv4 subnets and receive alerts for unknown devices. With compatible FRITZ!Box internet-control support, you can optionally withhold internet access from newly discovered devices until approved.
- **Keep an eye on important devices:** select devices to monitor, get offline alerts and review online/offline transitions and Mesh handovers in the event log.
- **Understand DNS activity:** with AdGuard Home connected, inspect queries per device, blocked domains and filter reasons, and manage allow/block actions from the panel.

You can configure multiple network segments, filter the device table, and use the native connectivity binary sensors and `nodarion_alert` events in your own automations. The panel supports dark and light designs and a responsive layout.

![Nodarion device overview with anonymized example data](https://raw.githubusercontent.com/engelsofta/nodarion/main/docs/images/teilnehmeruebersicht.png)

*The screenshot and accompanying demo use anonymized examples from an earlier version; some controls differ from the current release.*

**What you need:** Home Assistant must be able to reach the monitored subnets. Basic ping/TCP scanning works without FRITZ!Box or AdGuard; those connections add router/Mesh and DNS information respectively. This monitors reachable networks; it does not configure VLANs on your switches or router.

Network monitoring and local rules do not require AI. Optional daily AI reports use a configured Home Assistant AI Task entity; data handling depends on the selected provider.

**Install:** search for **Nodarion** in HACS, download **Engelsoft Nodarion**, restart Home Assistant, then add the integration under Settings → Devices & services. Start with your local IPv4 subnet.

[Repository, documentation and installation](https://github.com/engelsofta/nodarion)

I'd love feedback from different networks: which router/DNS setup do you use, and what would help you most next—device troubleshooting, Pi-hole support, UniFi support, or easier presence automations?

[Report a problem or request a feature](https://github.com/engelsofta/nodarion/issues/new/choose) · [GitHub Discussions](https://github.com/engelsofta/nodarion/discussions)
