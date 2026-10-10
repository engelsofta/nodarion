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
