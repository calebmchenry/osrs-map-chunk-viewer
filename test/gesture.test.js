import test from 'node:test';
import assert from 'node:assert/strict';
import { TapGuard } from '../src/gesture.js';

test('a tap tolerates slight hand movement', () => {
  const guard = new TapGuard();
  guard.down(1, 100, 100);
  guard.move(1, 103, 102);
  guard.up(1);
  assert.equal(guard.canSelect, true);
});

test('a drag that returns to its origin still cannot select', () => {
  const guard = new TapGuard();
  guard.down(1, 100, 100);
  guard.move(1, 140, 100);
  guard.move(1, 100, 100);
  guard.up(1);
  assert.equal(guard.canSelect, false);
  guard.down(2, 100, 100);
  guard.up(2);
  assert.equal(guard.canSelect, true);
});

test('lifting one finger after a pinch never turns the remaining finger into a tap', () => {
  const guard = new TapGuard();
  guard.down(1, 100, 100);
  guard.down(2, 200, 100);
  guard.up(2);
  assert.equal(guard.canSelect, false);
  guard.up(1);
  assert.equal(guard.canSelect, false);
});

test('canceled touch cannot select and the next independent tap recovers', () => {
  const guard = new TapGuard();
  guard.down(1, 0, 0);
  guard.cancel(1);
  assert.equal(guard.canSelect, false);
  guard.down(2, 0, 0);
  guard.up(2);
  assert.equal(guard.canSelect, true);
});
