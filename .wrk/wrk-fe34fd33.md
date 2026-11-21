---
id: wrk-fe34fd33
title: Publish the viewer with GitHub Pages
status: done
created_at: 2026-11-21T02:18:53Z
priority: normal
labels: []
---
Published the existing compact Vite viewer with GitHub Pages.

Completed:
- Official Pages workflow deploys pushes to main and supports manual dispatch on main.
- Node.js 22, npm ci, all 19 tests, and calibrated image verification precede the build and deployment.
- Vite receives the Pages base path; built and live JavaScript, CSS, favicon, and map paths are valid beneath /osrs-map-chunk-viewer/.
- Pages enabled with workflow publishing and enforced HTTPS.
- Implementation commit c6b36d15d4fdd22e28f36af51a10f53f054861cd deployed successfully in run 44855345870.
- Live page and assets returned HTTP 200; live map hash matched the source. Chrome rendered the compact viewer and full image without console warnings/errors.
- README and ledger document automatic/manual updates, separate browser-local saves, validation, and handoff.

Live: https://calebmchenry.github.io/osrs-map-chunk-viewer/
Run: https://github.com/calebmchenry/osrs-map-chunk-viewer/actions/runs/44855345870

Physical-phone/memory and basemap freshness release checks remain tracked separately in wrk-8a2343fd and wrk-c5c039d7.
