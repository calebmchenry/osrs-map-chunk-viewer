"""Independently check the official raster against pinned coordinate map tiles."""

from hashlib import sha256
from pathlib import Path
from urllib.request import urlopen
import json

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache' / 'calibration'
IMAGE = ROOT / 'public/maps/osrs-world-map-2025-11-18.jpg'
EXPECTED_HASH = '27411367c4ba6123ab7139c9b85df46c3a02abc9a366158e1c997a4f248d0637'
REFERENCE_COMMIT = '8c2cef52348cb2f4f46ade39ed85a8ebf21c1422'
REGIONS = [('Lumbridge', 50, 50), ('Kourend', 25, 57), ('Fortis', 26, 48), ('Falador', 46, 52)]


def main():
    if sha256(IMAGE.read_bytes()).hexdigest() != EXPECTED_HASH:
        raise SystemExit('Official image has changed; its calibration must be reassessed.')
    CACHE.mkdir(parents=True, exist_ok=True)
    official_image = Image.open(IMAGE).convert('RGB')
    official = np.asarray(official_image).astype(float)
    sheet = Image.new('RGB', (1024, 562), '#1b2423')
    draw = ImageDraw.Draw(sheet)
    report = []
    for index, (name, rx, ry) in enumerate(REGIONS):
        path = CACHE / f'0_{rx}_{ry}.png'
        url = f'https://raw.githubusercontent.com/mejrs/layers_osrs/{REFERENCE_COMMIT}/mapsquares/-1/2/0_{rx}_{ry}.png'
        if not path.exists():
            with urlopen(url, timeout=30) as response:
                path.write_bytes(response.read())
        reference_image = Image.open(path).convert('RGB').resize((128, 128), Image.Resampling.BOX)
        reference = np.asarray(reference_image).astype(float)
        # Isolate light neutral outlines instead of comparing different ground colors.
        walls = (reference.min(2) > 125) & ((reference.max(2) - reference.min(2)) < 30)
        left, top = (rx * 64 - 960) * 2, (4224 - (ry + 1) * 64) * 2
        candidates = []
        for dy in range(-6, 7):
            for dx in range(-6, 7):
                crop = official[top + dy:top + dy + 128, left + dx:left + dx + 128]
                neutral_lightness = (crop.min(2) / 255) * (1 - (crop.max(2) - crop.min(2)) / 255)
                candidates.append((float(neutral_lightness[walls].mean()), dx, dy))
        score, dx, dy = max(candidates)
        report.append({'area': name, 'region': [rx, ry], 'pixelOrigin': [left + dx, top + dy], 'offset': [dx, dy], 'score': round(score, 5)})
        draw.text((index * 256 + 8, 8), f'{name} ({rx},{ry}) - reference', fill='#e5c68b')
        sheet.paste(reference_image.resize((256, 256)), (index * 256, 24))
        draw.text((index * 256 + 8, 288), 'Official artwork, aligned', fill='#e5c68b')
        crop = official_image.crop((left + dx, top + dy, left + dx + 128, top + dy + 128))
        sheet.paste(crop.resize((256, 256)), (index * 256, 306))
    sheet.save(CACHE / 'comparison.jpg')
    (CACHE / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    if any(item['offset'] != [0, 1] for item in report):
        raise SystemExit('Alignment differs from the recorded calibration. Inspect the comparison sheet.')
    print('All four samples confirm x +0, y +1 pixel. See .cache/calibration/comparison.jpg.')


if __name__ == '__main__':
    main()
