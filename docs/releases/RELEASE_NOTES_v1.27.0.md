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
