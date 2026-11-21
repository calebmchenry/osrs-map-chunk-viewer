import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkAt, gameToPixel, pixelToGame, imageBounds, leafletBounds, gridLines, containsPoint } from '../src/coordinates.js';
import { mapSource, landmarks } from '../src/map-source.js';

test('known reference locations land in their expected OSRS regions', () => {
  for (const landmark of landmarks) {
    assert.equal(chunkAt(landmark.x, landmark.y).regionId, landmark.regionId, landmark.label);
  }
  assert.deepEqual(chunkAt(3222, 3218), {
    key: '50,50', column: 50, row: 50, regionId: 12850,
    west: 3200, east: 3264, south: 3200, north: 3264,
  });
});

test('exact boundaries belong to the east/north chunk, including negative coordinates', () => {
  assert.equal(chunkAt(3199.999, 3199.999).key, '49,49');
  assert.equal(chunkAt(3200, 3200).key, '50,50');
  assert.equal(chunkAt(3263.999, 3263.999).key, '50,50');
  assert.equal(chunkAt(3264, 3264).key, '51,51');
  assert.equal(chunkAt(-0.001, -0.001).key, '-1,-1');
});

test('independently calibrated map-square corners preserve the one-pixel Y offset', () => {
  // Pixel origins checked against pinned mejrs/layers_osrs reference tiles.
  const corners = [
    [{ x: 3200, y: 3264 }, { x: 4480, y: 1921 }],
    [{ x: 1600, y: 3712 }, { x: 1280, y: 1025 }],
    [{ x: 1664, y: 3136 }, { x: 1408, y: 2177 }],
    [{ x: 2944, y: 3392 }, { x: 3968, y: 1665 }],
  ];
  for (const [game, pixel] of corners) {
    assert.deepEqual(gameToPixel(game, mapSource), pixel);
    assert.deepEqual(pixelToGame(pixel, mapSource), game);
  }
});

test('a 64-tile chunk occupies exactly 128 image pixels with north at the top', () => {
  const nw = gameToPixel({ x: 3200, y: 3264 }, mapSource);
  const se = gameToPixel({ x: 3264, y: 3200 }, mapSource);
  assert.equal(se.x - nw.x, 128);
  assert.equal(se.y - nw.y, 128);
  assert.deepEqual(leafletBounds(chunkAt(3222, 3218)), [[3200, 3200], [3264, 3264]]);
});

test('the complete raster keeps its aspect ratio without stretching its final pixel', () => {
  const bounds = imageBounds(mapSource);
  assert.deepEqual(bounds, { west: 960, east: 4032.5, south: 2048, north: 4224.5 });
  assert.equal((bounds.east - bounds.west) / (bounds.north - bounds.south), mapSource.width / mapSource.height);
});

test('grid lines fall on multiples of 64 and stop at the supplied bounds', () => {
  assert.deepEqual(gridLines({ west: 3190, east: 3270, south: 3190, north: 3270 }), [
    [[3190, 3200], [3270, 3200]], [[3190, 3264], [3270, 3264]],
    [[3200, 3190], [3200, 3270]], [[3264, 3190], [3264, 3270]],
  ]);
});

test('image border and out-of-bounds clicks are excluded', () => {
  const bounds = mapSource.playableBounds;
  assert.equal(containsPoint(bounds, 960, 4224), false);
  assert.equal(containsPoint(bounds, 3222, 3218), true);
  assert.equal(containsPoint(bounds, bounds.east, 3218), false);
});
