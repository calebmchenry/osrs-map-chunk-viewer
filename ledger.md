# Project ledger

Read this file alongside [intent.md](intent.md) before starting work. Keep dated handoff entries here; use WRK tickets for task status and acceptance criteria.

## 2026-11-20 — Initial map prototype

### Current state

The first technical milestone is implemented: a local browser viewer with authentic surface-map artwork and a calibrated 64×64-game-tile grid. It includes pan/zoom, mainland/Zeah/Varlamore sample buttons, known-coordinate markers, a chunk inspector, a grid toggle, a world overview, keyboard controls, and a responsive layout. Dragging and multi-pointer gestures are guarded against accidental selection.

The gold outline inspects one chunk. Palette colors, multiple highlights, and local-storage persistence are **not implemented yet**. This is a source/alignment prototype, not the complete first version.

### Decisions to preserve

- Use plain JavaScript, Vite, and Leaflet 1.9.4 with `CRS.Simple`. No backend, account, deployment, or hosting configuration exists.
- The local JPEG is the unchanged official Jagex map dated **2025-11-18**. It preserves labels and activity icons and covers mainland, Zeah, and Varlamore. The date is an asset revision, not a verified cache revision or a claim of current coverage.
- Calibration is `pixelX = 2 × (gameX − 960)` and `pixelY = 2 × (4224.5 − gameY)`. The half-tile north origin compensates for an independently verified one-pixel vertical offset. Keep the complete 6145×4353 raster dimensions; do not round them down.
- Game Y increases north; Leaflet takes `[y, x]`. Chunk identity is `floor(x/64),floor(y/64)`, with half-open bounds internally and inclusive tile ranges in the inspector. Future saved highlights should use these stable chunk coordinates.
- Four coordinate-addressed reference regions—Lumbridge, Kourend, Fortis, and Falador—agree on the calibration. [docs/map-source.md](docs/map-source.md) records pinned reference sources, image hash, method, results, and source alternatives. Re-calibrate if the artwork changes.

### Code map

| File | Responsibility |
| --- | --- |
| `src/map-source.js` | Source revision, hash, raster bounds, and landmark coordinates |
| `src/coordinates.js` | Projection, chunk identity/bounds, and grid geometry |
| `src/gesture.js` | Tap versus navigation gesture guard |
| `src/main.js` | Leaflet layers, navigation, inspector, and controls |
| `src/style.css`, `index.html` | Responsive UI and source information dialog |
| `scripts/verify-map.mjs` | Verify the exact calibrated image hash |
| `scripts/calibrate-map.py` | Optional independent image alignment check |
| `test/` | Coordinate and gesture regression tests |

### Validation completed

- `npm test`: all **11 tests passed**, covering known regions, boundary cases, independent raster fixtures, projection, and gesture guards.
- `npm run verify:map`: source SHA-256 matched.
- `npm run build`: production build passed after the final UI fixes.
- Independent Python calibration: all four regions matched at x +0 / y +1 pixel; comparison sheet inspected visually.
- Chrome desktop and 393×852 phone emulation: sample navigation, zoom, pan, click/tap inspection, drag suppression, grid toggle, overview, and source dialog checked. Fixed the favicon request and a scale-bar clipping error; console was clear afterward.
- `wrk validate`: passed. No additional application tests are needed for the subsequent ledger/AGENTS documentation edit.

### Resume here

1. Run `npm ci` if dependencies are missing, then `npm run dev`. The previous preview server was stopped after verification. [README.md](README.md) has all run/check commands.
2. Pick up **`wrk-2e8ee436` — Add palette and persistent coordinate-keyed chunk highlights**. Add translucent independent highlights, same-color toggle-to-clear, recoloring, and versioned/validated localStorage with graceful storage failure handling.
3. Preserve navigation-versus-selection behavior and verify restoration after reload. Test a physical phone and real two-finger pinch gestures before marking mobile support complete.
4. Revisit source freshness and detail before a full release. The current image is a year-old snapshot with baked-in labels/icons at 2 pixels per tile. It decodes to roughly 107 MB; assess older-phone memory use and consider a tile pyramid. A newer export or cache renderer remains an option.

### WRK handoff

- `wrk-80a9174d`: completed map-source and chunk-alignment milestone.
- `wrk-2e8ee436`: next milestone, ready to start.
- `wrk-0ac1a415`: ledger/AGENTS handoff and initial repository commit.

The initial commit includes the prototype, original intent and project instructions, source assessment, tests, local map asset, dependency lockfile, and WRK records. Generated builds, dependency folders, calibration caches, and the WRK runtime lock stay ignored. No remote push is part of this handoff.
