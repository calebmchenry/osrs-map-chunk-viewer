---
id: wrk-2e8ee436
title: Add palette and persistent coordinate-keyed chunk highlights
status: todo
created_at: 2026-11-21T00:58:01Z
depends_on:
  - wrk-80a9174d
priority: normal
labels: []
---
Build the next vertical slice on the calibrated map prototype.

- Small color palette, translucent whole-chunk overlays, same-color toggle to clear, and recolor behavior.
- Persist versioned data in localStorage keyed by chunk column,row. Validate loaded records and handle unavailable/corrupt storage without breaking navigation.
- Preserve tap/drag/pinch distinction and test reload restoration.
- Validate real two-finger gestures on a phone and assess the single-image memory cost.
- Revisit the official 2025-11-18 image's freshness/resolution before treating it as the final basemap; source assessment is in docs/map-source.md.
