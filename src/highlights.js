import { CHUNK_SIZE, chunkAt } from './coordinates.js';

// IDs are part of the saved format; keep them stable when changing swatch colors.
export const palette = Object.freeze([
  { id: 'amber', label: 'Amber', color: '#f3bf59' },
  { id: 'coral', label: 'Coral', color: '#f47c78' },
  { id: 'mint', label: 'Mint', color: '#76d6a5' },
  { id: 'sky', label: 'Sky', color: '#71bdfa' },
  { id: 'violet', label: 'Violet', color: '#c29afa' },
].map(Object.freeze));

export const STORAGE_KEY = 'osrs-chunk-atlas.highlights';
const VERSION = 1;
const colorIds = new Set(palette.map(({ id }) => id));

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Only canonical coordinate keys for complete chunks in the surface bounds. */
export function chunkFromKey(key, bounds) {
  if (typeof key !== 'string' || !/^-?\d+,-?\d+$/.test(key)) return null;
  const [column, row] = key.split(',').map(Number);
  if (!Number.isSafeInteger(column) || !Number.isSafeInteger(row)) return null;
  const chunk = chunkAt(column * CHUNK_SIZE, row * CHUNK_SIZE);
  if (chunk.key !== key || chunk.west < bounds.west || chunk.east > bounds.east
    || chunk.south < bounds.south || chunk.north > bounds.north) return null;
  return chunk;
}

export function decodeHighlights(raw, bounds) {
  const highlights = new Map();
  if (raw === null) return { highlights, status: 'ready' };
  let data;
  try { data = JSON.parse(raw); } catch { return { highlights, status: 'invalid' }; }
  if (!isRecord(data) || !Number.isInteger(data.version)) return { highlights, status: 'invalid' };
  // Never overwrite data written by a version this app cannot understand.
  if (data.version !== VERSION) return { highlights, status: 'unsupported' };
  if (!isRecord(data.highlights)) return { highlights, status: 'invalid' };
  let status = 'ready';
  for (const [key, color] of Object.entries(data.highlights)) {
    if (chunkFromKey(key, bounds) && colorIds.has(color)) highlights.set(key, color);
    else status = 'partial';
  }
  return { highlights, status };
}

/** Storage access is deferred so even a throwing localStorage getter is safe. */
export function createHighlightStore(bounds, getStorage = () => globalThis.localStorage) {
  let loaded;
  try { loaded = decodeHighlights(getStorage().getItem(STORAGE_KEY), bounds); }
  catch { loaded = { highlights: new Map(), status: 'unavailable' }; }
  const { highlights } = loaded;
  const canSave = loaded.status !== 'unsupported';
  let status = loaded.status;

  function save() {
    if (!canSave) return;
    try {
      getStorage().setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, highlights: Object.fromEntries(highlights) }));
      status = 'ready';
    } catch { status = 'unavailable'; }
  }

  return {
    // Return copies so consumers cannot bypass validation or persistence.
    get highlights() { return new Map(highlights); },
    get size() { return highlights.size; },
    colorAt(key) { return highlights.get(key); },
    get status() { return status; },
    toggle(key, color) {
      if (!chunkFromKey(key, bounds) || !colorIds.has(color)) return false;
      if (highlights.get(key) === color) highlights.delete(key);
      else highlights.set(key, color);
      save();
      return true;
    },
    clear(key) {
      if (!chunkFromKey(key, bounds)) return false;
      highlights.delete(key);
      save();
      return true;
    },
  };
}
