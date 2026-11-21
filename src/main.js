import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { mapSource, landmarks, referenceSource } from './map-source.js';
import { chunkAt, containsPoint, imageBounds, leafletBounds, gridLines } from './coordinates.js';
import { TapGuard } from './gesture.js';

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

map.createPane('grid');
map.getPane('grid').style.pointerEvents = 'none';
map.getPane('grid').style.zIndex = '410';
const grid = L.polyline(gridLines(bounds), {
  pane: 'grid', color: '#fff4d6', opacity: 0.36, weight: 1,
  interactive: false, smoothFactor: 0,
}).addTo(map);

let selected = null;
const selection = L.rectangle([[0, 0], [0, 0]], {
  color: '#ffdb88', weight: 2, fillColor: '#ffdb88', fillOpacity: 0.1, interactive: false,
});
const referenceMarker = L.marker([0, 0], {
  icon: L.divIcon({ className: 'reference-marker', html: '<span></span>', iconSize: [20, 20], iconAnchor: [10, 10] }),
  keyboard: false,
  interactive: false,
});

function inspect(x, y, landmark) {
  if (!containsPoint(bounds, x, y)) return;
  selected = chunkAt(x, y);
  selection.setBounds(leafletBounds(selected)).addTo(map);
  $('inspection-title').textContent = landmark?.label ?? `Chunk ${selected.column}, ${selected.row}`;
  $('inspection-description').textContent = landmark?.description ?? `Selected tile: ${Math.floor(x)}, ${Math.floor(y)}`;
  $('chunk-key').textContent = selected.key;
  $('region-id').textContent = selected.regionId;
  $('x-range').textContent = `${selected.west}–${selected.east - 1}`;
  $('y-range').textContent = `${selected.south}–${selected.north - 1}`;
  $('inspection-note').textContent = landmark ? `Reference tile: ${landmark.x}, ${landmark.y} · 64 × 64 tiles` : '64 × 64 tiles · Coordinate ranges are inclusive';
  $('chunk-details').hidden = false;
  $('clear-button').hidden = false;
}

function openLandmark(id) {
  const landmark = landmarks.find((item) => item.id === id);
  map.setView([landmark.y, landmark.x], 1.5, { animate: false });
  referenceMarker.setLatLng([landmark.y + 0.5, landmark.x + 0.5]).addTo(map);
  inspect(landmark.x, landmark.y, landmark);
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
  if (guard.canSelect) inspect(event.latlng.lng, event.latlng.lat);
});
mapElement.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target === mapElement) {
    event.preventDefault();
    const center = map.getCenter();
    inspect(center.lng, center.lat);
  }
});

$('clear-button').addEventListener('click', () => {
  selected = null;
  selection.remove();
  $('inspection-title').textContent = 'Explore the surface';
  $('inspection-description').textContent = 'Click or tap a chunk to see its game coordinates.';
  $('inspection-note').textContent = '64 × 64 game tiles per chunk';
  $('chunk-details').hidden = true;
  $('clear-button').hidden = true;
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
