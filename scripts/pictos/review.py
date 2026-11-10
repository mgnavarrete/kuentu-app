"""Hoja de revisión: los pictogramas de una hoja sobre fondo de botón, con su nombre.

Uso: python3 scripts/pictos/review.py <nombre-hoja> slug=palabra ...
Escribe pictos-src/revision/<nombre-hoja>.png
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except OSError:
    FONT = None

root = Path(__file__).resolve().parents[2]
name, items = sys.argv[1], [a.split('=', 1) for a in sys.argv[2:]]
cell = 200
sheet = Image.new('RGB', (cell * 6, (cell + 30) * ((len(items) + 5) // 6)), '#fff6d6')
draw = ImageDraw.Draw(sheet)
for i, (slug, word) in enumerate(items):
    x, y = (i % 6) * cell, (i // 6) * (cell + 30)
    f = root / 'public/pictos/kuentu' / f'{slug}.webp'
    if f.exists():
        im = Image.open(f).resize((cell - 20, cell - 20))
        sheet.paste(im, (x + 10, y + 10), im)
    draw.text((x + 10, y + cell + 5), f'{word}  [{slug}]', fill='black', font=FONT)
out = root / 'pictos-src/revision' / f'{name}.png'
out.parent.mkdir(parents=True, exist_ok=True)
sheet.save(out)
