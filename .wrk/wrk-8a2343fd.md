---
id: wrk-8a2343fd
title: Validate physical-phone highlighting and map memory use
status: todo
created_at: 2026-11-21T01:17:11Z
related:
  - wrk-2e8ee436
priority: normal
labels: []
---
Follow-up extracted from wrk-2e8ee436 so the completed highlight implementation is distinct from device validation. Compact controls were subsequently implemented in wrk-83e872b9; publish that local layout to the existing private Site before checking it on a phone.

Acceptance criteria:
- On a physical phone, verify touch dragging, actual two-finger pinch, staggered finger release, and the next tap; navigation must never paint a chunk.
- Verify all palette colors, recoloring, same-color clearing, disconnected chunks, and restoration after reload/revisit.
- Check portrait and landscape layouts, smaller screens, and browser chrome resizing. Colors now form a vertical column beneath zoom, and the controls scroll on very short screens. Verify every color and zoom button remains reachable without painting. Record device, OS, browser, and any remaining usability issues.
- Measure loading and navigation behavior on an older/lower-memory phone. The current 6145×4353 JPEG decodes to roughly 107 MB before browser overhead; decide whether a tile pyramid is necessary and implement or track it based on measured evidence.

Already checked: Chrome desktop and iPhone 13 emulation, including CDP touch-drag and two-touch pinch sequences, 44px palette targets, reload, and storage failures. Emulation is not physical-device acceptance.
