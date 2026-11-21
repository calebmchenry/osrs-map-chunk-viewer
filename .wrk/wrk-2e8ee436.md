---
id: wrk-2e8ee436
title: Add palette and persistent coordinate-keyed chunk highlights
status: done
created_at: 2026-11-21T00:58:01Z
depends_on:
  - wrk-80a9174d
priority: normal
labels: []
---
Implemented the next vertical slice on the calibrated map prototype.

Completed acceptance criteria:
- Five-color palette with translucent whole-chunk overlays. Same-color click/tap clears; different-color click/tap recolors. Disconnected highlights remain independent.
- Version-1 localStorage data keyed by canonical chunk column,row. Validate palette IDs and complete chunks within surface bounds. Salvage valid records from partially corrupt saves, recover malformed data on the first edit, preserve unsupported versions, and keep navigation/coloring usable when storage access or writes fail.
- Preserve tap/drag/pinch distinction and restore highlights after reload. Sample navigation and inspector dismissal do not alter highlights. Keyboard Enter colors the map-center chunk without repeating on held keys.
- Touch-sized palette controls, collapsed inspector on small screens, saved count, live coloring announcements, and visible storage-failure feedback.

Validation:
- All 19 Node tests passed, including eight new highlight/storage tests.
- Chrome desktop and iPhone 13 emulation passed palette/toggle/recolor, disconnected regions, overlay alignment, reload, keyboard, and navigation guard checks. CDP touch dragging moved the map; two-finger pinch changed zoom; neither changed saved highlights.
- Browser checks passed corrupt, unsupported-version, blocked-access, and quota-failure storage cases without page exceptions. Desktop and phone screenshots inspected.
- Production build and calibrated image verification passed; see ledger.md for the final handoff.

Release checks from the original ticket have been split into explicit follow-ups:
- wrk-8a2343fd: physical-phone gestures/workflow and older-phone memory assessment. Synthetic input is not physical-device validation.
- wrk-c5c039d7: official 2025-11-18 basemap freshness/resolution decision before release. The calibrated image remains unchanged.
