# OSRS Map Chunk Viewer

A local browser prototype for the **first technical milestone** in [intent.md](intent.md): authentic surface-map artwork with a calibrated 64×64-tile grid.

## Run

Requires Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To serve the production build:

```sh
npm run build
npm run preview
```

The map image is included locally, so the app does not depend on a community tile server. Optional Google Fonts fall back to system fonts when unavailable. No API keys, account, backend, or hosting configuration are needed.

## Try it

- Switch between **Mainland**, **Zeah**, and **Varlamore** to inspect reference chunks around known teleport coordinates.
- Drag to pan; use the wheel, trackpad, pinch gesture, or zoom buttons to zoom. Keyboard users can focus the map, pan with arrow keys, zoom with `+`/`−`, and press Enter to inspect the center.
- Click or tap a chunk to inspect its stable chunk coordinates, region ID, and inclusive tile ranges. The single gold outline is an inspection aid, not a saved highlight.
- Toggle the grid or select **Whole world** to compare distant areas.
- Open **About this map** for source, revision, and resolution limits.

## Checks

```sh
npm test
npm run verify:map
npm run build
wrk validate
```

Tests cover known region IDs, independent raster calibration fixtures, chunk boundaries, north-up projection, and drag/pinch/cancel selection guards. The image verifier checks the SHA-256 of the exact calibrated source. Browser checks covered Chrome desktop and its 393×852 phone emulation: sample navigation, selection, drag suppression, zoom, and responsive controls. A physical phone and a real two-finger gesture still need testing before calling mobile support complete.

## Source decision and next step

The prototype uses Jagex’s official **2025-11-18** world-map JPEG. It includes mainland, Zeah, and Varlamore artwork, place labels, and activity icons. It is a dated snapshot, not the current live game. See [the source assessment and reproducible alignment check](docs/map-source.md).

The next milestone is the palette and persistent chunk highlights, keyed by `column,row`. Before a full release, decide whether this image’s 2-pixels-per-tile resolution and date are sufficient; otherwise investigate a newer, higher-resolution world-map export or cache rendering pipeline. The pure coordinate module and source descriptor keep that decision separate from the UI.

Plain JavaScript + Leaflet (`CRS.Simple`) handle navigation; Vite provides development and production builds. The app uses a single 27-megapixel image (roughly 107 MB decoded), a deliberate prototype tradeoff. A tile pyramid would reduce memory requirements for older phones.

Project work is tracked with the WRK CLI under `.wrk/`.

Map artwork © Jagex Ltd. RuneScape and Old School RuneScape are Jagex trademarks. This is an unofficial fan project. Third-party artwork is not covered by a project code license.
