## 1.25.3 — 🕵️ Same MAC, different caps

> Caps Lock is not a new device.

- Fix false “different MAC address” alerts after updating: identity warnings now compare normalized addresses instead of raw text. Lowercase and uppercase readings of the same MAC no longer trigger a device-change warning.
- Ignore separator and surrounding-whitespace differences, missing addresses, and all-zero placeholders in identity warnings.
- Preserve detection of real changes between valid MAC addresses and the existing internet-approval protection.
- Include the anonymized light/dark design comparison in the German and English documentation.

Existing log entries are retained; this fix prevents new formatting-related false alerts.

Validation: 71 Python tests passed, including MAC case, separator, whitespace, placeholder, and real-change checks. JavaScript tests and frontend syntax checks passed. Live Home Assistant and physical-device validation remain unverified.

Integration: `1.25.3` · Frontend: `1.29.11` (unchanged).

Restart Home Assistant after updating.
