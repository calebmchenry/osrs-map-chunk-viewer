// This descriptor is tied to the exact image hash. See docs/map-source.md.
export const mapSource = Object.freeze({
  id: 'jagex-world-map-2025-11-18',
  image: 'maps/osrs-world-map-2025-11-18.jpg',
  title: 'Jagex official world map',
  revision: '2025-11-18',
  pageUrl: 'https://oldschool.runescape.com/world-map',
  imageUrl: 'https://cdn.runescape.com/assets/img/external/oldschool/world-map/2025-11-18/osrs_world_map.jpg',
  sha256: '27411367c4ba6123ab7139c9b85df46c3a02abc9a366158e1c997a4f248d0637',
  width: 6145,
  height: 4353,
  pixelsPerTile: 2,
  west: 960,
  // The exported JPEG has a one-pixel vertical offset, independently checked
  // against coordinate-addressed map squares in all three sample areas.
  north: 4224.5,
  // Exclude the image's decorative outer ocean border from inspection.
  playableBounds: { west: 1024, east: 3968, south: 2112, north: 4160 },
});

export const referenceSource = 'https://github.com/runelite/runelite/blob/0fa3b8489e929a47410c7214ffcb710e67c7bb46/runelite-client/src/main/java/net/runelite/client/plugins/worldmap/TeleportLocationData.java';

export const landmarks = Object.freeze([
  { id: 'lumbridge', label: 'Lumbridge', area: 'Mainland', x: 3222, y: 3218, description: 'Castle courtyard · Lumbridge teleport', regionId: 12850 },
  { id: 'kourend', label: 'Kourend Castle', area: 'Zeah', x: 1643, y: 3672, description: 'Castle entrance · Kourend teleport', regionId: 6457 },
  { id: 'fortis', label: 'Civitas illa Fortis', area: 'Varlamore', x: 1681, y: 3133, description: 'City square · Civitas illa Fortis teleport', regionId: 6704 },
]);
