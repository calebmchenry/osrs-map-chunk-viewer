# OSRS Map Chunk Viewer — Intent

## Purpose

Build a browser-based viewer of the Old School RuneScape world map that helps the user understand the geography and flow of the world: how close cities are, how areas connect, and where activities are concentrated.

The user will assess activity density visually and use colored chunks to organize their understanding. The application does not need to calculate activity density or assign meaning to colors.

The reference is the world map opened inside the game. Reproducing its appearance and feel as closely as practical is a core requirement.

## First-version scope

### Map coverage and appearance

- Display the main surface world map, including Zeah and Varlamore.
- Preserve the in-game map's artwork, colors, place labels, and activity icons as closely as practical.
- Support zoom levels suitable for both comparing distant areas and examining local details.
- Keep the map as the primary interface, with compact controls that work on desktop and mobile.
- Floors, dungeons, interiors, and separate underground maps are outside the first version.

### Navigation

- Allow manual panning and zooming across the map.
- Support dragging to pan and mouse-wheel or trackpad zooming on desktop.
- Support touch dragging to pan and pinch gestures to zoom on mobile.
- Distinguish navigation gestures from selection so dragging or pinching does not accidentally highlight chunks.
- Location search is not required.

### Chunk grid

- A chunk in this project is a 64×64-tile square.
- Draw visible grid lines at the correct chunk boundaries in the game's coordinate system.
- Keep the grid aligned with the map throughout panning and zooming.
- Make boundaries clear without overwhelming map labels, icons, or other details.

### Highlighting

- Provide a small, simple color palette.
- Clicking or tapping a chunk applies the selected color as a subtle translucent overlay over that whole chunk.
- Applying the same color to an already highlighted chunk clears its highlight.
- Applying a different color replaces the chunk's existing color.
- Allow multiple chunks to be highlighted independently, including disconnected chunks.
- Keep map details readable through highlights.
- Colors are informal visual groupings; named categories, labels, and ordered routes are not required.
- Individual clicks and taps are sufficient. Drag painting and rectangular selection are outside the first version.

### Persistence

- Automatically save chunk highlights and their colors in browser local storage.
- Restore saved highlights when the page is reloaded or revisited in the same browser.
- Identify saved chunks by stable map coordinates rather than screen positions, so navigation does not affect saved selections.
- Accounts, cloud synchronization, sharing, and file import/export are outside the first version.

### Mobile support

Mobile support is part of the first usable version. Map navigation, palette selection, highlighting, and persistence must work on a phone, with controls sized and positioned for touch use.

## Map data and technical approach

Finding a suitable source for the authentic in-game world map is the main technical uncertainty. Prefer a source or rendering pipeline that preserves the game's cartographic presentation, labels, icons, and coordinate alignment.

The OSRS cache is a promising starting point. [RuneLite's cache definitions](https://github.com/runelite/runelite/blob/master/cache/src/main/java/net/runelite/cache/IndexType.java) identify dedicated world-map geography, world-map, and world-map ground indexes. Existing tooling such as [OSRS Wiki Maps](https://github.com/osrs-wiki/osrs-wiki-maps) may provide useful references for obtaining and processing cache data.

No map source, renderer, frontend framework, or hosting service has been selected. Existing community map tiles must be checked for visual fidelity, coverage, and coordinate alignment before adoption. The source's revision should be recorded so coverage and freshness can be assessed; an automatic game-update pipeline is not a first-version requirement.

### First technical milestone

Display an authentic surface-map sample and demonstrate that the 64×64 grid aligns correctly with known game coordinates. Confirm that the candidate data source covers Zeah and Varlamore and preserves the labels and icons needed for visual exploration before building the full viewer around it.

## Explicit non-goals

- Rendering the playable 3D terrain or building a game client.
- Automatic activity counts, density scoring, or heatmaps.
- Route finding, progression recommendations, or account tracking.
- Expanding the first version to additional floors, dungeons, or separate map areas.

## First-version acceptance criteria

1. The user can explore the main surface map, including Zeah and Varlamore, with an appearance close to the in-game world map.
2. Known map coordinates confirm that grid boundaries and selected overlays cover the correct 64×64-tile chunks.
3. Panning and zooming keep imagery, grid lines, and highlights aligned.
4. The user can select a palette color, highlight chunks, recolor them, and clear them with clicks or taps while underlying map details remain readable.
5. Reloading the page restores the same highlighted chunks and colors.
6. The complete exploration and highlighting workflow works on desktop and a phone, without navigation gestures causing accidental selections.

## Project workflow

Use the WRK CLI tool for project work, as specified in `AGENTS.md`.
