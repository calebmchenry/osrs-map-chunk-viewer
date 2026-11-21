# OSRS Map Chunk Viewer

A browser viewer with authentic surface-map artwork, a calibrated 64×64-tile grid, and saved color highlights. See [intent.md](intent.md) for the first-version scope and [ledger.md](ledger.md) for the current handoff.

## Open on a phone

Open **https://calebmchenry.github.io/osrs-map-chunk-viewer/** on a phone or desktop. The GitHub Pages viewer is public and needs no sign-in. The `127.0.0.1` development URL below only works on the development computer; it is not a phone-accessible preview.

Highlights save in the browser where you open the viewer. GitHub Pages, the existing [private Sites viewer](https://osrs-chunk-atlas.feistymesa3.chatgpt.site), and local development have separate browser origins and separate saves. An in-app browser and Safari/Chrome can also have separate storage. Existing private-viewer highlights do not automatically transfer to GitHub Pages; keep using the same browser and URL to retain your highlights. Public hosting does not upload or share your saved highlights.

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

The map image is included locally, so the app does not depend on a community tile server. Optional Google Fonts fall back to system fonts when unavailable. No API keys, account, or backend are needed to run the app.

## Try it

- Drag to pan; use the wheel, trackpad, pinch gesture, or zoom buttons to zoom. Keyboard users can focus the map, pan with arrow keys, zoom with `+`/`−`, and press Enter to color or clear the center chunk.
- Choose one of five palette colors, then click or tap chunks to highlight them. The same color clears a chunk; a different color replaces it. Disconnected chunks keep their own colors.
- Select the **Clear highlight** eraser beneath the colors, then tap any chunk to clear it regardless of color. With the map focused, Enter erases the center chunk. Clearing is saved automatically, and tapping an empty chunk leaves it empty.
- Highlights save automatically and restore on reload in the same browser and origin. Changing the development server port creates a separate save location. Clearing site data removes that browser's save.
- The color palette sits vertically beneath the zoom buttons, with a checkmark on the active color. Highlights use a 60% fill for visibility while keeping map details readable. The map has no chunk information panel. The gold outline marks the last selected chunk; press Escape with the map focused to dismiss it without changing highlights.
- Toggle the grid or select **Whole world** to compare distant areas.
- Open **About this map** for source, revision, and resolution limits.

## Checks

```sh
npm test
npm run verify:map
npm run build
wrk validate
```

Tests cover known region IDs, independent raster calibration fixtures, chunk boundaries, north-up projection, drag/pinch/cancel selection guards, highlight transitions, reload restoration, and malformed/unavailable storage. The image verifier checks the SHA-256 of the exact calibrated source. Browser checks covered Chrome desktop and iPhone 13 emulation: palette use, tap/click/keyboard coloring, reload, navigation guards (including synthetic two-finger input), and storage failures. A physical phone and a real two-finger gesture still need testing before calling mobile support complete.

## Saved format

Local storage key: `osrs-chunk-atlas.highlights`. Version 1 stores palette IDs against stable `column,row` coordinates:

```json
{"version":1,"highlights":{"50,50":"amber","25,57":"mint"}}
```

Only canonical, in-bounds chunks and known palette IDs load. Invalid records are skipped, with a visible status message. Malformed saves are replaced only after coloring or clearing a chunk. Unrecognized versions are preserved and allow temporary edits without saving. Blocked storage or failed writes keep the map usable and display a warning; a later edit retries saving. The selected palette color starts at Amber each visit. Saves have no account, cloud sync, or cross-tab merging.

## Source decision and remaining checks

The prototype uses Jagex’s official **2025-11-18** world-map JPEG. It includes mainland, Zeah, and Varlamore artwork, place labels, and activity icons. It is a dated snapshot, not the current live game. See [the source assessment and reproducible alignment check](docs/map-source.md).

Before a full release, validate the workflow on physical phones and decide whether this image’s 2-pixels-per-tile resolution and date are sufficient; otherwise investigate a newer, higher-resolution world-map export or cache rendering pipeline. The pure coordinate module and source descriptor keep that decision separate from saved highlights.

Plain JavaScript + Leaflet (`CRS.Simple`) handle navigation; Vite provides development and production builds. The app uses a single 27-megapixel image (roughly 107 MB decoded), a deliberate prototype tradeoff. A tile pyramid would reduce memory requirements for older phones.

Project work is tracked with the WRK CLI under `.wrk/`.

## Update GitHub Pages

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds and deploys on every push to `main`. It installs locked dependencies with Node.js 22, runs the tests and map hash verifier, builds `dist`, and publishes it with GitHub's Pages actions. Only the deploy job has Pages write permission, and deployments are serialized.

The workflow takes the site's base path from GitHub Pages and passes it to Vite, so bundled assets, the favicon, and the map image work under `/osrs-map-chunk-viewer/`. This follows [Vite's GitHub Pages guidance](https://vite.dev/guide/static-deploy.html#github-pages); ordinary local and private Sites builds retain the root path.

Push committed changes to `main` with `git push`, then check [the deployment workflow](https://github.com/calebmchenry/osrs-map-chunk-viewer/actions/workflows/pages.yml). To redeploy without a new commit, choose **Run workflow** with the `main` branch. Repository **Settings → Pages → Source** must be **GitHub Actions**; no personal access token or custom repository secret is required for deployment.

To reproduce the Pages build locally:

```sh
npm run build -- --base /osrs-map-chunk-viewer/
npm run preview -- --base /osrs-map-chunk-viewer/
```

Open `http://127.0.0.1:4173/osrs-map-chunk-viewer/` (or the port printed by Vite).

## Update the private Sites viewer

`.openai/hosting.json` records the existing private Site identity and `dist` output directory. Keep that ID and owner-only access when publishing updates with the Sites skill.

1. Use the Sites source helper to open/refresh the hosted source in `.cache/sites/chunk-atlas` with a current source credential. For a fresh initial checkout, prepare the local source first; for an existing Site whose cache is missing, open its remote source into the empty checkout first.
2. From this repository root, run `npm run prepare:site`. It copies only application source, tests, scripts, documentation, and the hosting manifest into that ignored publishing checkout, preserving its Git history and dependencies. The root repository remains the working source of truth.
3. Install dependencies there if needed, then use the Sites source helper to check/build, commit/push the isolated snapshot, and package `dist` with the manifest. Pass credentials only through the helper's hidden stdin input.
4. Save and deploy that exact commit/archive with the private Sites operation and verify its returned deployment result. Record the published version and URL in `ledger.md`.

Map artwork © Jagex Ltd. RuneScape and Old School RuneScape are Jagex trademarks. This is an unofficial fan project. Third-party artwork is not covered by a project code license.
