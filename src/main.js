import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { mapSource, landmarks, referenceSource } from './map-source.js';
import { chunkAt, containsPoint, imageBounds, leafletBounds, gridLines } from './coordinates.js';
import { TapGuard } from './gesture.js';
import { palette, chunkFromKey, createHighlightStore } from './highlights.js';

const $ = (id) => document.getElementById(id);
const mapElement = $('map');
const bounds = mapSource.playableBounds;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const map = L.map(mapElement, {
  crs: L.CRS.Simple,
  minZoom: -3.5,
  maxZoom: 3,
  zoomSnap: 0.25,
  zoomDelta: 0.5,
  zoomControl: false,
  attributionControl: true,
  maxBounds: leafletBounds(imageBounds(mapSource)),
  maxBoundsViscosity: 1,
  doubleClickZoom: false,
  boxZoom: false,
  touchZoom: true,
  bounceAtZoomLimits: false,
  zoomAnimation: !reduceMotion,
}).setView([landmarks[0].y, landmarks[0].x], 1.5);

map.attributionControl.setPrefix(false);
const artwork = L.imageOverlay(
  `${import.meta.env.BASE_URL}${mapSource.image}`,
  leafletBounds(imageBounds(mapSource)),
  { alt: 'Official Old School RuneScape world map', attribution: `<a href="${mapSource.pageUrl}" target="_blank" rel="noreferrer">Map © Jagex</a> · ${mapSource.revision}` },
);
artwork.on('load', () => { $('loading').hidden = true; });
artwork.on('error', () => {
  $('loading').hidden = false;
  $('loading').textContent = 'The map image could not load. Reload the page to try again.';
});
artwork.addTo(map);

map.createPane('highlights');
map.getPane('highlights').style.pointerEvents = 'none';
map.getPane('highlights').style.zIndex = '405';
const highlightStore = createHighlightStore(bounds);
const highlightLayers = new Map();
let activeColor = palette[0].id;

function renderHighlight(key) {
  const color = highlightStore.colorAt(key);
  const existing = highlightLayers.get(key);
  if (!color) {
    existing?.remove();
    highlightLayers.delete(key);
    return;
  }
  const style = { fillColor: palette.find(({ id }) => id === color).color };
  if (existing) existing.setStyle(style);
  else highlightLayers.set(key, L.rectangle(leafletBounds(chunkFromKey(key, bounds)), {
    ...style, pane: 'highlights', stroke: false, fillOpacity: 0.3, interactive: false,
  }).addTo(map));
}

function updateHighlightStatus() {
  const messages = {
    ready: 'Saved in this browser',
    invalid: 'Saved highlights could not be read. Coloring a chunk starts a new save.',
    partial: 'Some saved highlights were invalid and skipped.',
    unsupported: 'This save uses a different version. Changes stay in this tab only.',
    unavailable: 'Browser saving is unavailable. Changes stay in this tab only.',
  };
  $('save-status').textContent = messages[highlightStore.status];
  $('save-status').classList.toggle('save-warning', highlightStore.status !== 'ready');
  $('save-status').classList.toggle('sr-only', highlightStore.status === 'ready');
}

for (const color of palette) {
  const button = document.createElement('button');
  button.className = 'color-swatch';
  button.dataset.color = color.id;
  button.style.setProperty('--swatch', color.color);
  button.setAttribute('aria-label', color.label);
  button.setAttribute('aria-pressed', String(color.id === activeColor));
  button.title = color.label;
  const swatch = document.createElement('span');
  swatch.setAttribute('aria-hidden', 'true');
  button.append(swatch);
  button.addEventListener('click', () => {
    activeColor = color.id;
    for (const sibling of $('color-palette').children) {
      sibling.setAttribute('aria-pressed', String(sibling === button));
    }
  });
  $('color-palette').append(button);
}
for (const key of highlightStore.highlights.keys()) renderHighlight(key);
updateHighlightStatus();

map.createPane('grid');
map.getPane('grid').style.pointerEvents = 'none';
map.getPane('grid').style.zIndex = '410';
const grid = L.polyline(gridLines(bounds), {
  pane: 'grid', color: '#fff4d6', opacity: 0.36, weight: 1,
  interactive: false, smoothFactor: 0,
}).addTo(map);

map.createPane('selection');
map.getPane('selection').style.pointerEvents = 'none';
map.getPane('selection').style.zIndex = '420';
const selection = L.rectangle([[0, 0], [0, 0]], {
  pane: 'selection', color: '#ffdb88', weight: 2, fill: false, interactive: false,
});
const referenceMarker = L.marker([0, 0], {
  icon: L.divIcon({ className: 'reference-marker', html: '<span></span>', iconSize: [20, 20], iconAnchor: [10, 10] }),
  keyboard: false,
  interactive: false,
});

function outlineChunk(x, y) {
  if (!containsPoint(bounds, x, y)) return;
  selection.setBounds(leafletBounds(chunkAt(x, y))).addTo(map);
}

function colorChunk(x, y) {
  if (!containsPoint(bounds, x, y)) return;
  const chunk = chunkAt(x, y);
  highlightStore.toggle(chunk.key, activeColor);
  renderHighlight(chunk.key);
  updateHighlightStatus();
  outlineChunk(x, y);
  const color = highlightStore.colorAt(chunk.key);
  $('highlight-announcement').textContent = color
    ? `Chunk ${chunk.key} colored ${palette.find(({ id }) => id === color).label}.`
    : `Chunk ${chunk.key} cleared.`;
}

function openLandmark(id) {
  const landmark = landmarks.find((item) => item.id === id);
  map.setView([landmark.y, landmark.x], 1.5, { animate: false });
  referenceMarker.setLatLng([landmark.y + 0.5, landmark.x + 0.5]).addTo(map);
  outlineChunk(landmark.x, landmark.y);
  document.querySelectorAll('[data-landmark]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.landmark === id));
  });
}

document.querySelectorAll('[data-landmark]').forEach((button) => {
  button.addEventListener('click', () => openLandmark(button.dataset.landmark));
});

const guard = new TapGuard();
mapElement.addEventListener('pointerdown', (event) => guard.down(event.pointerId, event.clientX, event.clientY));
window.addEventListener('pointermove', (event) => guard.move(event.pointerId, event.clientX, event.clientY));
window.addEventListener('pointerup', (event) => {
  guard.move(event.pointerId, event.clientX, event.clientY);
  guard.up(event.pointerId);
});
window.addEventListener('pointercancel', (event) => guard.cancel(event.pointerId));
window.addEventListener('blur', () => {
  for (const id of guard.pointers.keys()) guard.cancel(id);
});
map.on('dragstart zoomstart', () => { guard.navigated = true; });
map.on('click', (event) => {
  if (guard.canSelect) colorChunk(event.latlng.lng, event.latlng.lat);
});
mapElement.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && event.target === mapElement) selection.remove();
  if (event.key === 'Enter' && event.target === mapElement) {
    event.preventDefault();
    const center = map.getCenter();
    if (!event.repeat) colorChunk(center.lng, center.lat);
  }
});

$('grid-button').addEventListener('click', () => {
  const visible = map.hasLayer(grid);
  if (visible) grid.remove(); else grid.addTo(map);
  $('grid-button').setAttribute('aria-pressed', String(!visible));
});
$('world-button').addEventListener('click', () => {
  map.fitBounds(leafletBounds(bounds), { padding: [20, 70], animate: false });
  document.querySelectorAll('[data-landmark]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
});
$('zoom-in').addEventListener('click', () => map.zoomIn());
$('zoom-out').addEventListener('click', () => map.zoomOut());

function updateScale() {
  // Choose a power-of-two length that fits without CSS shortening the ruler.
  const tiles = 2 ** Math.floor(Math.log2(100 / 2 ** map.getZoom()));
  $('scale-bar').style.width = `${tiles * 2 ** map.getZoom()}px`;
  $('scale-bar').textContent = `${tiles} tiles`;
  $('zoom-in').disabled = map.getZoom() >= map.getMaxZoom();
  $('zoom-out').disabled = map.getZoom() <= map.getMinZoom();
}
map.on('zoomend', updateScale);
updateScale();
new ResizeObserver(() => map.invalidateSize({ pan: false })).observe(mapElement);

$('source-link').href = mapSource.pageUrl;
$('source-revision').textContent = mapSource.revision;
$('reference-link').href = referenceSource;
$('about-button').addEventListener('click', () => $('about-dialog').showModal());
$('close-about').addEventListener('click', () => $('about-dialog').close());
$('about-dialog').addEventListener('click', (event) => {
  if (event.target === $('about-dialog')) {
    const rect = event.target.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
  }
});
openLandmark('lumbridge');
