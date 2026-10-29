# 1.27.7 — Less bulk. More control. ✂️

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
