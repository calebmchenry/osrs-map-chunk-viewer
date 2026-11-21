export const CHUNK_SIZE = 64;

/** Game coordinates increase east/north. Image pixels increase right/down. */
export function gameToPixel({ x, y }, source) {
  return {
    x: (x - source.west) * source.pixelsPerTile,
    y: (source.north - y) * source.pixelsPerTile,
  };
}

export function pixelToGame({ x, y }, source) {
  return {
    x: source.west + x / source.pixelsPerTile,
    y: source.north - y / source.pixelsPerTile,
  };
}

export function imageBounds(source) {
  return {
    west: source.west,
    east: source.west + source.width / source.pixelsPerTile,
    south: source.north - source.height / source.pixelsPerTile,
    north: source.north,
  };
}

/** Half-open tile intervals: a boundary belongs to the chunk east/north of it. */
export function chunkAt(x, y) {
  const column = Math.floor(x / CHUNK_SIZE);
  const row = Math.floor(y / CHUNK_SIZE);
  return {
    key: `${column},${row}`,
    column,
    row,
    regionId: column * 256 + row,
    west: column * CHUNK_SIZE,
    east: (column + 1) * CHUNK_SIZE,
    south: row * CHUNK_SIZE,
    north: (row + 1) * CHUNK_SIZE,
  };
}

export function containsPoint(bounds, x, y) {
  return x >= bounds.west && x < bounds.east && y >= bounds.south && y < bounds.north;
}

// Leaflet CRS.Simple expects [northing, easting], not [x, y].
export function leafletBounds({ west, east, south, north }) {
  return [[south, west], [north, east]];
}

export function gridLines(bounds) {
  const lines = [];
  for (let x = Math.ceil(bounds.west / CHUNK_SIZE) * CHUNK_SIZE; x <= bounds.east; x += CHUNK_SIZE) {
    lines.push([[bounds.south, x], [bounds.north, x]]);
  }
  for (let y = Math.ceil(bounds.south / CHUNK_SIZE) * CHUNK_SIZE; y <= bounds.north; y += CHUNK_SIZE) {
    lines.push([[y, bounds.west], [y, bounds.east]]);
  }
  return lines;
}
