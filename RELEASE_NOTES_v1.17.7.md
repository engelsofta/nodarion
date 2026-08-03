# Engelsoft Nodarion 1.17.7

Dieser Patch behebt die Installationsstruktur des mit `v1.17.6` eingeführten HACS-Release-Assets.

## Behoben

- `nodarion.zip` enthält die Integrationsdateien jetzt direkt im Archivstamm, wie von HACS erwartet.
- HACS entpackt `manifest.json`, `__init__.py`, Frontend, Übersetzungen und Daten wieder unmittelbar nach `custom_components/nodarion`.
- Eine zusätzliche Workflow-Prüfung entpackt jedes erzeugte Asset testweise und verhindert künftig versehentlich verschachtelte Verzeichnisse.
- Installationen, bei denen Home Assistant nach dem Update `Integration 'nodarion' not found` meldete, werden mit diesem Patch wiederhergestellt.

## Light Mode

Alle Neuerungen aus `v1.17.6`, einschließlich des automatischen Light-/Dark-Mode-Wechsels und der Kontrastverbesserungen, sind unverändert enthalten.

## Versionen

- Integration: `1.17.7`
- Frontend: `1.23.2`
