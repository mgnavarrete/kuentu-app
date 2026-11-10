// Símbolos de palabras gramaticales, dibujados a mano en SVG (letras, +, −, ✓, ✗, ?, cajas con flechas).
// Escribe pictos-src/svg/<concepto>.svg y public/pictos/kuentu/<concepto>.webp.
// Uso: node scripts/pictos/simbolos.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = fileURLToPath(new URL('../../', import.meta.url))
const SVG_DIR = `${root}pictos-src/svg`
mkdirSync(SVG_DIR, { recursive: true })

const K = '#000', ORANGE = '#F29F1D', RED = '#E52521', GREEN = '#6FAE2E', BLUE = '#5B8DD6', SKIN = '#F6D2B5'
const S = 10 // grosor del contorno

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" stroke="${K}" stroke-width="${S}" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`
const box = (x, y, w = 70, h = 70, fill = ORANGE) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}"/>`
/** Flecha negra gruesa de (x1,y1) a (x2,y2). */
function arrow(x1, y1, x2, y2, head = 26) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const bx = x2 - head * Math.cos(a), by = y2 - head * Math.sin(a)
  const p = (ang) => `${bx + head * 0.75 * Math.cos(ang)},${by + head * 0.75 * Math.sin(ang)}`
  return `<path d="M${x1} ${y1} L${bx} ${by}" stroke-width="14" fill="none"/><path d="M${x2} ${y2} L${p(a + Math.PI / 2)} L${p(a - Math.PI / 2)} Z" fill="${K}" stroke-width="6"/>`
}
const letter = (t) => `<text x="128" y="196" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="230" fill="${K}" stroke="none">${t}</text>`
/** Trazo de color con borde negro (✓, ✗). */
const outlined = (d, color, w = 30) => `<path d="${d}" fill="none" stroke-width="${w + 16}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`
const check = (d = 'M52 132 L106 186 L206 70') => outlined(d, GREEN, 34)
const cross = (x = 128, y = 128, r = 76, w = 34) => outlined(`M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}`, RED, w)
const question = (cx, cy, r) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${RED}"/><text x="${cx}" y="${cy + r * 0.45}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="${r * 1.35}" fill="#fff" stroke="none">?</text>`
const dot = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`
/** Mano con el pulgar arriba (girada 180° para abajo). */
const thumb = (down) =>
  `<g transform="${down ? 'rotate(180 128 128)' : ''}"><path d="M70 120 H118 L126 50 C128 34 156 34 156 56 L150 112 H190 C206 112 210 132 196 138 C208 144 206 162 192 164 C204 170 200 188 186 190 C196 196 192 214 176 214 H70 Z" fill="${SKIN}"/><rect x="40" y="114" width="34" height="106" rx="6" fill="${BLUE}"/></g>`

const SYMBOLS = {
  a: letter('a'),
  y: letter('y'),
  o: letter('o'),
  mas: `<path d="M104 36 H152 V104 H220 V152 H152 V220 H104 V152 H36 V104 H104 Z" fill="${K}"/>`,
  menos: `<rect x="36" y="104" width="184" height="48" fill="${K}"/>`,
  'si-2': check(),
  no: cross(),
  ni: `${dot(70, 128, 40, BLUE)}${dot(186, 128, 40, RED)}${cross(70, 128, 44, 16)}${cross(186, 128, 44, 16)}`,
  bien: thumb(false),
  mal: thumb(true),
  mismo: `${dot(56, 128, 36, RED)}${dot(200, 128, 36, RED)}<rect x="104" y="104" width="48" height="14" fill="${K}"/><rect x="104" y="138" width="48" height="14" fill="${K}"/>`,
  diferente: `${dot(56, 128, 36, RED)}<rect x="164" y="92" width="72" height="72" fill="${BLUE}"/><rect x="104" y="104" width="48" height="14" fill="${K}"/><rect x="104" y="138" width="48" height="14" fill="${K}"/><path d="M146 88 L110 168" stroke-width="12"/>`,
  'que-2': question(128, 128, 100),
  'por-que': `${question(150, 128, 82)}<path d="M64 70 C20 110 20 150 60 186" fill="none" stroke-width="14"/><path d="M40 178 L66 196 L72 166 Z" fill="${K}" stroke-width="6"/>`,
  'para-que': `${question(80, 128, 66)}${arrow(152, 128, 200, 128)}${dot(226, 128, 22, BLUE)}`,
  cual: `${question(128, 80, 58)}${dot(54, 200, 28, BLUE)}${dot(128, 200, 28, RED)}${dot(202, 200, 28, BLUE)}`,
  cuanto: `${question(128, 78, 56)}${dot(70, 196, 22, BLUE)}${dot(116, 196, 22, BLUE)}${dot(162, 196, 22, BLUE)}${dot(93, 156, 22, BLUE)}${dot(139, 156, 22, BLUE)}${dot(208, 196, 22, BLUE)}`,
  // Preposiciones: cajas naranjas con flechas.
  de: `${box(140, 92)}${arrow(140, 128, 30, 128)}`,
  en: `${box(78, 120, 100, 100)}${arrow(128, 20, 128, 150)}`,
  con: `${box(22, 92)}${box(164, 92)}<path d="M92 128 H164" stroke-width="16"/>`,
  para: `${box(16, 92)}${arrow(96, 128, 158, 128)}${box(170, 92)}`,
  por: `${box(92, 82, 72, 92)}${arrow(16, 128, 236, 128)}`,
  sin: `${box(78, 78, 100, 100)}${cross(128, 128, 70, 22)}`,
  desde: `<path d="M40 60 V196" stroke-width="18"/>${arrow(58, 128, 220, 128)}`,
  hacia: `${arrow(20, 128, 130, 128)}${box(160, 92)}`,
  hasta: `${arrow(20, 128, 196, 128)}<path d="M214 56 V200" stroke-width="18"/>`,
  contra: `${arrow(16, 128, 136, 128)}${box(150, 82, 84, 92)}<path d="M150 64 L138 44 M150 192 L138 212" stroke-width="8"/>`,
  entre: `<path d="M36 60 V196 M220 60 V196" stroke-width="18"/>${box(93, 93)}`,
}
SYMBOLS['por-que-2'] = SYMBOLS['por-que']

for (const [slug, body] of Object.entries(SYMBOLS)) {
  const doc = svg(body)
  writeFileSync(`${SVG_DIR}/${slug}.svg`, doc)
  const png = new Resvg(doc, { fitTo: { mode: 'width', value: 768 }, font: { loadSystemFonts: true } }).render().asPng()
  writeFileSync(`${SVG_DIR}/${slug}.png`, png)
  spawnSync('python3', [`${root}scripts/pictos/process.py`, `${SVG_DIR}/${slug}.png`], { stdio: 'ignore' })
}
console.log(`${Object.keys(SYMBOLS).length} símbolos generados.`)
