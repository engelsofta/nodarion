# Nodarion 1.25.0 — Less scrolling, more stars

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
