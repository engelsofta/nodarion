# Nodarion 1.25.1 — Unpin the Fritz, keep the bits

> A little freedom for Fritz. A little less drama for Hassfest.

- Use `fritzconnection>=1.15.1` so the shared dependency can follow Home Assistant updates, as required by Hassfest.
- Move the mobile device disclosure arrow to the first row, keeping it accessible when the monitoring column is hidden.
- Synchronize integration versions and README badges; refresh the frontend cache version.

Validation: 64 Python tests, JavaScript tests and frontend syntax checks passed. Live Home Assistant rendering was not tested.

Integration: `1.25.1` · Frontend: `1.29.10`.

Restart Home Assistant and refresh the browser after updating.
