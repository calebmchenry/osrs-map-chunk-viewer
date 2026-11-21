---
id: wrk-c5c039d7
title: Review basemap freshness and detail for release
status: todo
created_at: 2026-11-21T01:17:11Z
related:
  - wrk-2e8ee436
priority: normal
labels: []
---
Follow-up extracted from wrk-2e8ee436. The existing calibrated map remains unchanged by the highlight milestone.

Acceptance criteria:
- Revisit the official 2025-11-18 world-map image's freshness and 2-pixels-per-tile resolution before treating it as the release basemap.
- Check current official exports or an appropriate cache-rendered source against the in-game artwork, labels, icons, mainland, Zeah, and Varlamore coverage.
- Record the keep/replace decision and evidence in docs/map-source.md and ledger.md.
- If replacing the asset, pin its revision/hash and re-run independent calibration before changing the source descriptor. Preserve game-coordinate chunk identity so version-1 highlights retain their meaning.

See docs/map-source.md for the existing pinned references, hash, calibration method, and alternatives. No source refresh was attempted as part of the palette/persistence implementation.
