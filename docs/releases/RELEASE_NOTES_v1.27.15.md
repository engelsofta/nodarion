# 1.27.15 — Champagne, not highlighter. 🥂

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
