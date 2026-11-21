import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { mapSource } from '../src/map-source.js';

const path = new URL(`../public/${mapSource.image}`, import.meta.url);
const hash = createHash('sha256').update(await readFile(path)).digest('hex');
if (hash !== mapSource.sha256) {
  throw new Error('Map image differs from the calibrated revision. Re-check its source, bounds, and alignment before updating the descriptor.');
}
console.log(`Verified ${mapSource.id}: SHA-256 matches the calibrated image.`);
