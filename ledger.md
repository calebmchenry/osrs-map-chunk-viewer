# Project ledger

Read this file alongside [intent.md](intent.md) before starting work. Keep dated handoff entries here; use WRK tickets for task status and acceptance criteria.

## 2026-11-20 — GitHub Pages publication

- **Live public viewer: https://calebmchenry.github.io/osrs-map-chunk-viewer/**. The user requested GitHub Pages for the existing public GitHub repository. **`wrk-fe34fd33` is done** for setup and first publication.
- Added `.github/workflows/pages.yml`: pushes to `main` and manual runs on `main` install locked dependencies with Node.js 22, run tests and the map hash verifier, build `dist`, and deploy with official GitHub Pages actions pinned to release commit SHAs. Build and deployment permissions are separate; publishing is serialized without canceling an active deployment.
- Pass `actions/configure-pages`'s base path to Vite's `--base` option. Existing `import.meta.env.BASE_URL` map loading already supports this. Ordinary local and private Sites builds keep their existing root path; application code and dependencies are unchanged.
- README now makes GitHub Pages the primary viewer link and documents automatic/manual deployment, local Pages-path preview, and separate browser saves. The existing owner-private Site retains its identity, audience, and earlier published version; GitHub Pages publication does not migrate highlights.
- Local validation passed: **19 tests**, calibrated image SHA-256 verification, Pages-path production build, built HTML asset/path checks (JavaScript, CSS, favicon, map descriptor/file), workflow YAML parsing, `git diff --check`, and `wrk validate`.
- Enabled Pages with `build_type: workflow` and HTTPS enforcement. Pushed implementation commit `c6b36d15d4fdd22e28f36af51a10f53f054861cd`; [deployment run 44855345870](https://github.com/calebmchenry/osrs-map-chunk-viewer/actions/runs/44855345870) completed successfully (build and deployment both passed).
- Live verification: page, JavaScript, CSS, favicon, and map returned HTTP 200; downloaded map SHA-256 matched the calibrated source. Chrome rendered the map and compact vertical palette, loaded the full 6145×4353 image at the repository path, and reported no console warnings/errors. This was a deployment smoke check, not another full interaction or physical-phone test.
- Handoff: push future updates to `main`; Actions tests/builds/publishes automatically. README also documents manual reruns and local preview with the Pages base path. This documentation/ticket closeout is a follow-up commit and will trigger the same workflow. No deployment credentials were added to the repository.
- **`wrk-8a2343fd`** (physical phone/memory) and **`wrk-c5c039d7`** (basemap freshness/detail) remain open. Phone validation can now use the public GitHub Pages URL with the compact layout; no private Sites redeployment is required for that check.

## 2026-11-20 — GitHub remote and main branch

- Added `origin` at https://github.com/calebmchenry/osrs-map-chunk-viewer.git and renamed the local branch from `master` to `main`, as requested.
- `git push -u origin main` succeeded. GitHub accepted the new branch containing application checkpoint `91f202b`, and local `main` now tracks `origin/main`.
- Read the WRK status and checked the initially clean working tree. This follow-up commit records the push handoff; application code is unchanged, so the passing tests/build from the previous entry were not rerun. `wrk validate` and `git diff --check` passed for the ledger update.
- Future repository pushes can use `git push` from `main`. GitHub source synchronization does not update the private hosted viewer; publishing the compact layout and the two existing release checks remain the next steps described below.

## 2026-11-20 — Compact controls and repository checkpoint

### Current state

Applied the user's feedback: removed the chunk inspector, coordinate details, chunk count, and large information panel. The five colors now form a narrow vertical palette directly beneath the +/− zoom buttons. This repository checkpoint also includes the previously uncommitted highlight/persistence implementation and private-hosting setup described below.

**The compact layout is local and has not been published.** The private hosted viewer still serves the earlier panel layout from source commit `defa2cc93f188661626f6c3b4ee0dc926e28eea7`. This handoff records a local Git commit; no remote push or deployment was requested for this checkpoint.

### Decisions and validation

- Keep the map clear during ordinary use. Palette buttons retain their color names for tooltips/screen readers, selected checkmark, `aria-pressed` state, and 44px minimum targets. Usage instructions remain in About and accessible map help; routine save status is screen-reader-only. Storage failures still show a visible warning over the map.
- The gold outline remains as selection feedback. Escape with the map focused dismisses it without altering highlights; Enter still colors/clears the center chunk. The inspector DOM, update handlers, and styling have been removed.
- Short landscape screens use a shorter header and reserve space for the controls. The vertical control column can scroll when the viewport is too short to fit every button. Color IDs, storage schema, gesture guard, artwork, calibration, and dependencies are unchanged.
- `npm test`: **19 tests passed**. `npm run verify:map`: calibrated image hash matched. Production build, `git diff --check`, and `wrk validate` passed.
- Chrome desktop and iPhone 13 emulation passed coloring/recoloring/clearing, independent regions, aligned overlays, reload restoration, keyboard Enter/Escape, navigation without painting, touch drag, and synthetic pinch. Corrupt, unsupported, blocked, and quota-failed saves remain usable with visible warnings and no browser exceptions.
- Layout checks covered 1440×1000, 393×852, 320×568, 852×393, 667×375, and 568×320. The palette stays vertical beneath zoom, every color/zoom control is reachable, targets remain at least 44px, and the page has no horizontal or vertical overflow. Fixed a narrow-landscape overflow found during these checks; inspected desktop, portrait, and landscape screenshots. Temporary browser QA scripts/screenshots are outside the repository.

### Handoff

- **`wrk-83e872b9` is done** for compact controls and this commit handoff. README reflects the simplified interface.
- Next hosted update: follow README's existing Sites workflow, reuse `.openai/hosting.json` and the same owner-private Site, and publish the committed compact layout. Do not reuse the old deployment archive; prepare and build a fresh snapshot. Keep https://osrs-chunk-atlas.feistymesa3.chatgpt.site as the phone-accessible URL.
- **`wrk-8a2343fd` remains open** for physical-phone gestures, portrait/landscape usability, save restoration, and older-phone memory measurements. Its criteria now describe the vertical palette instead of inspector expansion. Publish the compact layout before evaluating it on a phone.
- **`wrk-c5c039d7` remains open** for basemap freshness/detail. Physical-device support and the dated image's roughly 107 MB decoded memory requirement are still unverified release concerns.
- The temporary development server was stopped after validation. Resume with `npm run dev -- --port 5173` to retain the local save origin; local and hosted browser saves remain separate.

## 2026-11-20 — Private hosted viewer for phone access

### Current state

The viewer is published at **https://osrs-chunk-atlas.feistymesa3.chatgpt.site** with owner-only access through Sites. The user is accessing this conversation from the ChatGPT mobile app, so a `127.0.0.1` link is not a usable handoff: it addresses the phone itself, not this development computer. Use the hosted HTTPS URL for phone testing, signing in with the owning ChatGPT account if prompted.

### Decisions and validation

- `.openai/hosting.json` persists Site ID `appgprj_6b00f244eccc8191bd949645ff78f59f` with static output `dist`. Reuse this Site and preserve private access for updates.
- The existing Vite app was packaged unchanged; no account system, application backend, cloud highlight storage, or map/source changes were added. Hosted and local origins have separate browser-local highlights. In-app browsers and Safari/Chrome may also have separate storage.
- `npm run prepare:site` runs `scripts/prepare-site.mjs` to copy selected application inputs into ignored `.cache/sites/chunk-atlas`. This isolated publishing repository retains the Site's Git history while leaving the root repository's working changes uncommitted. README documents opening the remote source, syncing, building, and publishing updates.
- Sites source helper ran all **19 tests**, verified the calibrated map hash, built the production bundle, committed/pushed source SHA `defa2cc93f188661626f6c3b4ee0dc926e28eea7`, and packaged the static output. Credentials were passed only through hidden stdin and were not saved in the project.
- Native private publication succeeded: deployment `appgdep_6b00f29d80e0819193d72ff78f6f0dbf`, saved version `appgprj_6b00f244eccc8191bd949645ff78f59f~appgver_b44c19cb15ac819189924ad592d59892`. The deployment-status response confirmed the HTTPS URL above. `wrk validate` and `git diff --check` passed.

### Handoff

- **`wrk-a391197f` is done**: phone-accessible private publication and repeatable update workflow.
- **`wrk-8a2343fd` remains open** for physical-phone gestures, layout, save restoration, and memory measurements. Hosting success does not substitute for testing on the user's device.
- **`wrk-c5c039d7` remains open** for basemap freshness and detail. Both known source limits are unchanged.
- The source archive is at `.cache/sites/chunk-atlas-deploy.tar.gz`; the publishing checkout is disposable once its pushed source is recovered through Sites. Never register a second Site just because the local cache is missing.

## 2026-11-20 — Palette and persistent highlights

### Current state

The next feature slice is implemented: five palette colors, independent translucent chunk highlights, same-color toggle-to-clear, recoloring, and automatic local-storage restoration. The grid and gold inspection outline remain distinct from saved colors. Sample navigation and dismissing the inspection outline never modify highlights.

The palette has 44px minimum targets, a selected-color checkmark/name, a chunk count, and visible saving feedback. The inspector starts collapsed on small/short screens and includes the inspected chunk's highlight color. Enter colors or clears the map-center chunk; holding Enter does not repeatedly toggle it. The existing navigation gesture guard remains in place.

### Decisions to preserve

- `src/highlights.js` owns palette IDs, coordinate-key validation, saved-data decoding, and persistence. `test/highlights.test.js` covers its state transitions and failure paths. `src/main.js` connects it to Leaflet and the controls.
- Storage key: `osrs-chunk-atlas.highlights`. Schema: `{"version":1,"highlights":{"50,50":"amber"}}`. Stable palette IDs are `amber`, `coral`, `mint`, `sky`, and `violet`; selected palette color starts at Amber each visit.
- Accept only canonical `column,row` keys for complete chunks within the calibrated surface bounds and known palette IDs. Skip invalid records while restoring valid ones. Never rewrite storage merely by loading, inspecting, or navigating.
- Malformed saves are replaced on the first coloring action, with a warning before that action. Unknown versions remain untouched; edits are temporary for that tab. Storage getter/read/write failures keep in-memory coloring functional and show a warning. A subsequent edit retries a failed write with the full current state.
- Highlights use 30% opacity below the grid; the gold inspection rectangle has no fill and sits above both. All these layers ignore pointer events. The source image, calibration, and dependency versions are unchanged.
- Saving is per browser origin. Different local ports have different saves. Cross-tab merging, selected-color persistence, bulk actions, accounts, and export are outside this slice.

### Validation completed

- `npm test`: **19 tests passed**, including eight new tests for independent highlight changes, reload/empty-state restoration, key/bounds validation, partial corruption, malformed payloads, unknown versions, blocked access, failed writes/retry, and snapshot isolation.
- `npm run build`: production build passed. `npm run verify:map`: calibrated image hash matched. `git diff --check` and `wrk validate`: passed.
- Chrome desktop: palette selection, color/recolor/clear, independent highlights in mainland/Zeah/Varlamore, matching highlight/inspection geometry, pan/wheel/grid preservation, reload restoration, keyboard Enter, and dismissal without clearing colors passed.
- Chrome iPhone 13 emulation: tap/recolor/clear, reload, 44px palette targets, inspector expansion, and no horizontal overflow passed. CDP touch dragging actually panned the map and a synthetic two-finger pinch changed zoom; staggered finger release did not paint. Desktop and collapsed/expanded phone screenshots were inspected.
- Browser storage checks covered corrupt JSON, an unsupported version, denied access, and quota errors. Navigation remained functional, failures were visible, and no page exceptions occurred. Browser QA used an isolated temporary Playwright script; no browser-test dependency was added to the project.

### Resume here / WRK handoff

- **`wrk-2e8ee436` is done** for the palette/persistence implementation. The broader release checks in its original body were moved into the two tickets below, not treated as completed.
- **`wrk-8a2343fd` — Validate physical-phone highlighting and map memory use** is the next acceptance task. Test real touch gestures, portrait/landscape, revisit restoration, and memory/loading on an older phone. No physical device was available in this session, so mobile support is not yet fully verified.
- **`wrk-c5c039d7` — Review basemap freshness and detail for release** tracks the source decision. The dated 2025-11-18 image and its roughly 107 MB decoded size remain known limits. Re-calibrate any replacement artwork; preserve game-coordinate save keys.
- Development preview was left running at `http://127.0.0.1:5173/`. If it is no longer running, use `npm run dev -- --port 5173` to retain that local save origin. Changes are uncommitted; no remote push or deployment was performed.

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
