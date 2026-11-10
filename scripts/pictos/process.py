"""Convierte pictogramas generados (PNG con fondo blanco) en recursos de la app.

- Quita el fondo blanco que toca los bordes (relleno desde las orillas), así el
  blanco de adentro del dibujo (ojos, inodoro) se conserva.
- Recorta, centra en un cuadrado con margen y guarda WebP de 384 px.

Uso: python3 scripts/pictos/process.py <entrada.png|carpeta> [<salida_dir>]
     python3 scripts/pictos/process.py --grid 4x3 <hoja.png> <nombre1,nombre2,...> [<salida_dir>]
Por defecto escribe en public/pictos/kuentu/<nombre>.webp
"""
import sys
from collections import deque
from pathlib import Path

from PIL import Image

SIZE = 384
MARGIN = 0.06  # margen alrededor del dibujo
WHITE = 236  # umbral: más claro que esto cuenta como fondo


def remove_background(img: Image.Image) -> Image.Image:
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if min(r, g, b) < WHITE:
            continue
        px[x, y] = (255, 255, 255, 0)
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    return img


def drop_edge_fragments(img: Image.Image) -> Image.Image:
    """Borra trocitos que tocan el borde de la celda (restos del dibujo vecino al cortar la hoja)."""
    w, h = img.size
    alpha = img.getchannel('A')
    a = alpha.load()
    seen = bytearray(w * h)
    comps = []
    for sy in range(h):
        for sx in range(w):
            if seen[sy * w + sx] or a[sx, sy] <= 8:
                continue
            pix, edge, q = [], False, deque([(sx, sy)])
            seen[sy * w + sx] = 1
            while q:
                x, y = q.popleft()
                pix.append((x, y))
                if x == 0 or y == 0 or x == w - 1 or y == h - 1:
                    edge = True
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and a[nx, ny] > 8:
                        seen[ny * w + nx] = 1
                        q.append((nx, ny))
            comps.append((pix, edge))
    total = sum(len(p) for p, _ in comps) or 1
    px = img.load()
    for pix, edge in comps:
        # Fragmento en el borde y chico respecto del dibujo: viene de la celda vecina.
        if edge and len(pix) < total * 0.08:
            for x, y in pix:
                px[x, y] = (255, 255, 255, 0)
    return img


def process(src, out_dir: Path, name: str | None = None, from_grid: bool = False) -> Path:
    img = remove_background(src if isinstance(src, Image.Image) else Image.open(src))
    if from_grid:
        img = drop_edge_fragments(img)
    box = img.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if box:
        img = img.crop(box)
    side = int(max(img.size) * (1 + 2 * MARGIN))
    canvas = Image.new('RGBA', (side, side), (255, 255, 255, 0))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    canvas = canvas.resize((SIZE, SIZE), Image.LANCZOS)
    out_dir.mkdir(parents=True, exist_ok=True)
    dst = out_dir / ((name or src.stem) + '.webp')
    canvas.save(dst, 'WEBP', quality=82, method=6)
    return dst


def grid(sheet: Path, spec: str, names: list[str], out_dir: Path) -> None:
    cols, rows = map(int, spec.split('x'))
    img = Image.open(sheet).convert('RGB')
    w, h = img.size
    for i, name in enumerate(names):
        if not name:
            continue
        c, r = i % cols, i // cols
        cell = img.crop((c * w // cols, r * h // rows, (c + 1) * w // cols, (r + 1) * h // rows))
        d = process(cell, out_dir, name, from_grid=True)
        print(f'{name} -> {d.name} ({d.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    default_out = Path(__file__).resolve().parents[2] / 'public/pictos/kuentu'
    if sys.argv[1] == '--grid':
        grid(Path(sys.argv[3]), sys.argv[2], sys.argv[4].split(','), Path(sys.argv[5]) if len(sys.argv) > 5 else default_out)
        sys.exit()
    src = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else default_out
    files = sorted(src.glob('*.png')) + sorted(src.glob('*.jpg')) if src.is_dir() else [src]
    for f in files:
        d = process(f, out)
        print(f'{f.name} -> {d} ({d.stat().st_size // 1024} KB)')
