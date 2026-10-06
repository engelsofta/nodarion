## 1.26.0 — 👓 Now you see me

> Less squinting. More networking.

- Improve light-theme alert action contrast: Details, Monitor, and Approve buttons now use dark blue text on a light blue surface, with clear hover and keyboard-focus states.
- Fix light-theme device-link hover colours so labels remain readable.
- Increase presence status labels from 9 to 11 px and timeline labels from 8 to 11 px, with improved line spacing.
- Strengthen presence status and timeline text contrast in both light and dark themes.
- Refresh the frontend cache version so browsers load the updated styling.

Validation: 71 Python tests, JavaScript tests, and frontend syntax checks passed. Alert action text contrast is 7.53:1 normally and 9.68:1 on hover. Live Home Assistant rendering remains unverified.

Integration: `1.26.0` · Frontend: `1.29.12`.

Restart Home Assistant and refresh the browser after updating.
