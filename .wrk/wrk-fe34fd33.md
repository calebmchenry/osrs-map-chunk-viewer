---
id: wrk-fe34fd33
title: Publish the viewer with GitHub Pages
status: in-progress
created_at: 2026-11-21T02:18:53Z
priority: normal
labels: []
---
Set up public GitHub Pages hosting for the existing static Vite viewer.

Acceptance criteria:
- Deploy on pushes to main and allow manual dispatch using GitHub Actions.
- Run the tests and map verifier before publishing the dist build.
- Resolve JavaScript, CSS, favicon, and the map image beneath the repository Pages path.
- Enable Pages, publish the current compact layout, and verify the live URL.
- Document automatic updates, browser-local save behavior, validation, and handoff in README and ledger.md.
