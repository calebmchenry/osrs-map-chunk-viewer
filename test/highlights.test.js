import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkFromKey, createHighlightStore, decodeHighlights, STORAGE_KEY } from '../src/highlights.js';
import { mapSource } from '../src/map-source.js';

const bounds = mapSource.playableBounds;
const encode = (highlights) => JSON.stringify({ version: 1, highlights });
function memoryStorage(initial = null) {
  let raw = initial;
  return {
    getItem(key) { assert.equal(key, STORAGE_KEY); return raw; },
    setItem(key, value) { assert.equal(key, STORAGE_KEY); raw = value; },
  };
}

test('disconnected chunks recolor and toggle independently, including after reload', () => {
  const storage = memoryStorage();
  const store = createHighlightStore(bounds, () => storage);
  store.toggle('50,50', 'amber');
  store.toggle('25,57', 'mint');
  store.toggle('26,48', 'violet');
  store.toggle('50,50', 'sky');
  assert.deepEqual(Object.fromEntries(store.highlights), { '50,50': 'sky', '25,57': 'mint', '26,48': 'violet' });
  const restored = createHighlightStore(bounds, () => storage);
  assert.deepEqual(restored.highlights, store.highlights);
  restored.toggle('50,50', 'sky');
  assert.deepEqual(Object.fromEntries(restored.highlights), { '25,57': 'mint', '26,48': 'violet' });
  assert.deepEqual(createHighlightStore(bounds, () => storage).highlights, restored.highlights);
  restored.toggle('25,57', 'mint');
  restored.toggle('26,48', 'violet');
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), { version: 1, highlights: {} });
  assert.equal(createHighlightStore(bounds, () => storage).highlights.size, 0);
});

test('coordinate keys must be canonical and inside the calibrated surface bounds', () => {
  for (const key of ['16,33', '61,64', '50,50']) assert.ok(chunkFromKey(key, bounds), key);
  for (const key of ['15,33', '62,33', '16,32', '16,65', '-1,33', '050,50', '50,50.0', '5e1,50', '50, 50', '50,50,1', '__proto__', '99999999999999999999,50', null]) {
    assert.equal(chunkFromKey(key, bounds), null, String(key));
  }
  assert.deepEqual(chunkFromKey('50,50', bounds), {
    key: '50,50', column: 50, row: 50, regionId: 12850,
    west: 3200, east: 3264, south: 3200, north: 3264,
  });
});

test('invalid records are skipped while valid saved highlights survive', () => {
  const raw = '{"version":1,"highlights":{"50,50":"sky","25,57":"mint","62,50":"amber","050,50":"amber","50,51":"#fff","51,51":null,"52,51":{},"__proto__":"coral"}}';
  const result = decodeHighlights(raw, bounds);
  assert.equal(result.status, 'partial');
  assert.deepEqual(Object.fromEntries(result.highlights), { '50,50': 'sky', '25,57': 'mint' });
  const storage = memoryStorage(raw);
  const store = createHighlightStore(bounds, () => storage);
  assert.equal(storage.getItem(STORAGE_KEY), raw, 'loading must not rewrite the save');
  store.toggle('26,48', 'violet');
  assert.equal(store.status, 'ready');
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)).highlights, { '50,50': 'sky', '25,57': 'mint', '26,48': 'violet' });
});

test('missing saves start empty and malformed payloads recover on the first edit', () => {
  assert.equal(decodeHighlights(null, bounds).status, 'ready');
  for (const raw of ['', '{', 'null', '[]', '42', '{}', '{"version":"1"}', '{"version":1}', '{"version":1,"highlights":[]}', '{"version":1,"highlights":null}']) {
    const storage = memoryStorage(raw);
    const store = createHighlightStore(bounds, () => storage);
    assert.equal(store.status, 'invalid', raw);
    assert.equal(store.highlights.size, 0);
    assert.equal(storage.getItem(STORAGE_KEY), raw);
    store.toggle('50,50', 'amber');
    assert.equal(store.status, 'ready');
    assert.equal(createHighlightStore(bounds, () => storage).highlights.get('50,50'), 'amber');
  }
});

test('unrecognized versions allow temporary edits without overwriting the original', () => {
  const raw = JSON.stringify({ version: 2, highlights: { '50,50': 'future-color' } });
  const storage = memoryStorage(raw);
  const store = createHighlightStore(bounds, () => storage);
  assert.equal(store.status, 'unsupported');
  store.toggle('25,57', 'mint');
  assert.equal(store.highlights.get('25,57'), 'mint');
  assert.equal(store.status, 'unsupported');
  assert.equal(storage.getItem(STORAGE_KEY), raw);
});

test('blocked access, including a throwing storage getter, keeps coloring functional', () => {
  for (const getStorage of [
    () => { throw new Error('SecurityError'); },
    () => ({ getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('SecurityError'); } }),
    () => undefined,
  ]) {
    const store = createHighlightStore(bounds, getStorage);
    assert.equal(store.status, 'unavailable');
    store.toggle('50,50', 'amber');
    store.toggle('25,57', 'mint');
    store.toggle('50,50', 'coral');
    store.toggle('25,57', 'mint');
    assert.deepEqual(Object.fromEntries(store.highlights), { '50,50': 'coral' });
    assert.equal(store.status, 'unavailable');
  }
});

test('a failed write preserves the previous save and retries the full state on the next edit', () => {
  const storage = memoryStorage(encode({ '50,50': 'amber' }));
  let fail = true;
  const store = createHighlightStore(bounds, () => ({
    getItem: storage.getItem,
    setItem(key, value) { if (fail) throw new Error('QuotaExceededError'); storage.setItem(key, value); },
  }));
  store.toggle('25,57', 'mint');
  assert.equal(store.status, 'unavailable');
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)).highlights, { '50,50': 'amber' });
  assert.equal(store.highlights.size, 2);
  fail = false;
  store.toggle('50,50', 'coral');
  assert.equal(store.status, 'ready');
  assert.deepEqual(createHighlightStore(bounds, () => storage).highlights, store.highlights);
});

test('invalid edits and mutations of a snapshot cannot change saved state', () => {
  const raw = encode({ '50,50': 'amber' });
  const storage = memoryStorage(raw);
  const store = createHighlightStore(bounds, () => storage);
  assert.equal(store.toggle('50,50', 'unknown'), false);
  assert.equal(store.toggle('62,50', 'amber'), false);
  store.highlights.clear();
  assert.equal(store.highlights.get('50,50'), 'amber');
  assert.equal(storage.getItem(STORAGE_KEY), raw);
});
