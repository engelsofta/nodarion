# 1.27.17 — Less nagging. More caching. 💤

> Your devices get a daily check-up, not a clingy roommate.

Web-interface discovery now runs independently of the GUI, remembers its results and gives known devices a quieter once-a-day routine.

## Daily checks, instant discoveries

- Recheck known HTTP/HTTPS endpoints once every 24 hours, including devices where no web server was found.
- Check new devices and changed IP/MAC identities without waiting for the daily interval.
- Persist results across Home Assistant restarts, integration reloads and temporary offline periods.
- Hide links while devices are offline; reuse a still-valid saved result when the same device returns.
- Keep **Scan now** as an explicit override that clears saved results and starts fresh checks.

## Background means background

- Process bounded discovery batches independently of browser windows and regular network scans.
- Wait five seconds between batches, while cached results prevent repeat HTTP requests during the daily interval.
- Publish each completed device immediately instead of waiting for the entire batch.
- Notify entities and subscribed frontends without resetting the normal network-scan timer.
- Cancel running checks cleanly during explicit rescans and integration unload; retain persisted results on unload.

## Validation

- 110 Python tests and 9 JavaScript test entries passed.
- Regression coverage includes GUI-independent batches, per-device publication, daily positive/negative caching, persisted results, offline/reconnect behaviour, identity changes and invalid stored URLs.
- Python/JavaScript syntax, version consistency and HACS archive structure checked.

**Trade-off:** if a device stays online but its web server is switched off, its link can remain visible until the next daily check. Use **Scan now** to recheck sooner.

Integration: **1.27.17** · Frontend: **1.29.29**.

Update through HACS, restart Home Assistant to load the backend changes, then reload the Nodarion page.
