import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Keep the working repository and its uncommitted work separate from the Site's
// Git history. Only these application inputs are synchronized for publication.
const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, '.cache/sites/chunk-atlas');
const manifestPath = '.openai/hosting.json';
const manifest = JSON.parse(readFileSync(path.join(root, manifestPath), 'utf8'));
if (!manifest.project_id || manifest.static?.directory !== 'dist') {
  throw new Error('Register the static Site in .openai/hosting.json first.');
}
const stagedManifest = path.join(destination, manifestPath);
if (existsSync(stagedManifest)
  && JSON.parse(readFileSync(stagedManifest, 'utf8')).project_id !== manifest.project_id) {
  throw new Error('The publishing checkout belongs to a different Site.');
}
mkdirSync(destination, { recursive: true });
for (const input of ['index.html', 'package.json', 'package-lock.json', '.gitignore', 'src', 'public', 'test', 'scripts', 'docs', 'README.md', 'intent.md', manifestPath]) {
  const target = path.join(destination, input);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(path.join(root, input), target, { recursive: true });
}
console.log(`Prepared Site source at ${destination}`);
