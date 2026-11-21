# Map source and alignment assessment

## Candidate selected for the first milestone

The [official Jagex world-map page](https://oldschool.runescape.com/world-map) linked the following image when inspected on **2026-11-20 (America/New_York)**:

- [Dated source image](https://cdn.runescape.com/assets/img/external/oldschool/world-map/2025-11-18/osrs_world_map.jpg)
- Revision label in URL: **2025-11-18**. This is an asset date, **not a verified game-cache revision**.
- Local file: `public/maps/osrs-world-map-2025-11-18.jpg`, unchanged JPEG bytes.
- Dimensions: **6145 × 4353 pixels**, approximately 2.8 MB compressed.
- SHA-256: `27411367c4ba6123ab7139c9b85df46c3a02abc9a366158e1c997a4f248d0637`.
- Rights: artwork © Jagex Ltd.; the official page does not provide an open-source artwork license.

Visual inspection confirmed the game's cartographic artwork, city/area labels, and activity symbols. The image includes Kourend/Zeah and Varlamore, including Civitas illa Fortis and the surrounding western areas. Their sample views are available in the prototype. This establishes coverage at the snapshot date, not completeness against the November 2026 game.

The image is sufficient to build the first map/grid prototype. It is not an unconditional production-source decision: labels and icons are baked in, detail is limited to **2 pixels per game tile**, and the snapshot is a year old. Newer or higher-resolution artwork can replace this descriptor after re-calibration.

## Coordinate calibration

The calibrated transform, from game tile boundaries to raster pixels, is:

```text
pixelX = 2 × (gameX − 960)
pixelY = 2 × (4224.5 − gameY)
```

The half-tile value in `4224.5` accounts for a **one-pixel vertical offset** in the export. Treating the image as a rounded 6144×4352 rectangle introduces drift; the complete raster instead spans x `[960,4032.5]`, y `[2048,4224.5]`. Image bounds and inspection bounds are separate so the decorative outer ocean border is not selectable.

This is an **empirical calibration**, not bounds supplied by Jagex. We checked it against independently coordinate-addressed surface map squares from [mejrs/layers_osrs at commit `8c2cef5`](https://github.com/mejrs/layers_osrs/tree/8c2cef52348cb2f4f46ade39ed85a8ebf21c1422), dated 2026-11-05. Those reference tiles use 4 pixels per tile at zoom 2 and cover exactly 64×64 game tiles. The source viewer’s [tile indexing](https://github.com/mejrs/mejrs.github.io/blob/master/js/layers.js) uses `CRS.Simple` and flips the tile Y index with `-(1 + y)`.

Each 256×256 reference square was reduced to 128×128 pixels. Its light, neutral wall outlines were matched against a ±6-pixel search around the proposed position in the official image. All four independent areas gave the same best correction: **x +0, y +1 pixel**. Lumbridge’s castle walls and river/bridge geometry were also inspected visually. Scores measure wall agreement, not a probability or subpixel accuracy claim.

| Reference region | World northwest corner | Official pixel origin | Best wall score |
| --- | --- | --- | --- |
| Lumbridge `50,50` | `3200,3264` | `4480,1921` | 0.51286 |
| Kourend `25,57` | `1600,3712` | `1280,1025` | 0.53101 |
| Civitas illa Fortis `26,48` | `1664,3136` | `1408,2177` | 0.53626 |
| Falador `46,52` | `2944,3392` | `3968,1665` | 0.53811 |

The check establishes alignment to the available raster resolution in these samples. JPEG compression, stylized icons, and map changes between source dates prevent treating individual icon centers as exact tile markers. Recheck calibration if the image changes.

## Reproduce the independent check

This optional research script is separate from the browser app and normal Node tests. It downloads four reference PNGs from the pinned commit into ignored `.cache/`, checks the official image hash, and verifies each best match. Python packages are isolated in a virtual environment:

```sh
python3 -m venv .cache/calibration-venv
.cache/calibration-venv/bin/pip install -r scripts/requirements-calibration.txt
.cache/calibration-venv/bin/python scripts/calibrate-map.py
```

The script writes a comparison sheet to `.cache/calibration/comparison.jpg` for visual inspection. The routine Node tests preserve the independently obtained pixel origins as regression fixtures; they do not replace this image/source check.

## Known-coordinate references in the UI

Reference teleport tiles come from [RuneLite’s `TeleportLocationData.java`, pinned to `0fa3b848`](https://github.com/runelite/runelite/blob/0fa3b8489e929a47410c7214ffcb710e67c7bb46/runelite-client/src/main/java/net/runelite/client/plugins/worldmap/TeleportLocationData.java):

| Location | Tile x,y | Chunk column,row | Region ID |
| --- | --- | --- | --- |
| Lumbridge | `3222,3218` | `50,50` | `12850` |
| Kourend | `1643,3672` | `25,57` | `6457` |
| Civitas illa Fortis | `1681,3133` | `26,48` | `6704` |

Chunk indices are `floor(x/64), floor(y/64)`. Region IDs are `column*256 + row`. Bounds are half-open internally; the inspector reports the inclusive tile range. A marker is placed at the tile’s center (`x+0.5,y+0.5`). Leaflet expects `[y,x]`; `CRS.Simple` handles the north-up display, and every layer uses that same coordinate system.

## Other candidates considered

- [OSRS Wiki Maps](https://github.com/osrs-wiki/osrs-wiki-maps) downloads a cache and generates imagery and icon metadata. Its README explicitly describes initial imagery without labels/map icons. It is useful pipeline research, but would require more work to reproduce the complete in-game presentation.
- [RuneLite cache indexes](https://github.com/runelite/runelite/blob/0fa3b8489e929a47410c7214ffcb710e67c7bb46/cache/src/main/java/net/runelite/cache/IndexType.java) include `WORLDMAP_GEOGRAPHY`, `WORLDMAP`, and `WORLDMAP_GROUND`. They remain the likely starting point if a fresh authentic renderer is needed.
- [Explv’s map tiles](https://github.com/Explv/osrs_map_tiles) and mejrs’ surface tiles offer coordinate-addressed imagery. The inspected mejrs reference square supplies ground geometry without the official image’s complete labels and activity icons, so it serves as a calibration reference rather than the displayed basemap.
