# 1.27.19 — Tiny button. Big GUI energy. ↗️

> Your device links stopped doing squats. The table can finally sit still.

Device web interfaces now use one compact **GUI ↗** action beside the IP address, keeping participant rows tidy without reserving empty space underneath.

## One button, fewer gymnastics

- Show **GUI ↗** inline next to the IP address only when a reachable web interface has been detected.
- Open a single detected endpoint directly in a new tab.
- When several endpoints are available, show a compact selection of HTTP/HTTPS addresses and optional ports in a popover.
- Keep the selection above the table instead of expanding the row or clipping it inside the scroll area.
- Close the menu with Escape, an outside click or table scrolling.
- Remove the previously reserved link area. Background discovery can add the GUI action without changing the tested row/table heights.

## Validation

- 110 Python tests and 10 JavaScript test entries passed.
- Browser checks verified unchanged row/table heights when four endpoints appeared, a four-link popover, and closing by Escape and outside click.
- Dark/light and 390px mobile previews checked with example data.
- Version consistency, syntax and HACS archive structure verified.

Integration: **1.27.19** · Frontend: **1.29.31**.

Update through HACS, restart Home Assistant, then reload Nodarion. Use a hard browser refresh if the previous interface is still cached.
