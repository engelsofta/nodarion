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
