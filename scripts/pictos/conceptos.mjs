// Arma pictos-src/conceptos.json: un concepto por pictograma (las palabras que hoy comparten
// pictograma de ARASAAC comparten concepto), en orden de prioridad (Inicio primero).
// Uso: node scripts/pictos/conceptos.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { FOLDERS, HOME_WORDS, parseList } from '../../src/data/vocabulario.ts'

const root = new URL('../../', import.meta.url)
const read = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'))
const ids = { ...read('src/data/pictos.json'), ...read('src/data/picto-overrides.json') }
const outUrl = new URL('pictos-src/conceptos.json', root)

const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Se dibujan en SVG (no se generan con IA). */
const SVG = new Set(
  'cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte treinta cuarenta cincuenta cien mil'.split(' '),
)

/** No se pueden generar con IA (la moderación las bloquea): se dibujan a mano. */
const MANUAL = new Set(['pene', 'vulva'])

const rows = []
const add = (label, alt, cls, context, picto) => rows.push({ label, alt, cls, context, picto })
for (const [cls, list] of Object.entries(HOME_WORDS)) for (const e of parseList(list)) add(e.label, e.alt, e.cls ?? cls, 'palabra núcleo')
for (const f of FOLDERS) add(f.name, f.icon, 'carpeta', `carpeta «${f.name}»`)
add('más carpetas', 'carpeta', 'carpeta', 'botón para ver más carpetas')
for (const f of FOLDERS) {
  if (f.starters) for (const e of parseList(f.starters)) add(e.label, e.alt, 'social', f.name)
  for (const g of f.groups) {
    if (f.groups.length > 1 && !f.popup) add(g.name, g.icon, 'carpeta', `subcarpeta de ${f.name}`)
    for (const e of parseList(g.words)) add(e.label, e.alt, e.cls ?? g.cls, `${f.name} › ${g.name}`, e.picto)
  }
}

// Conserva los datos ya escritos a mano (pistas, estado) si el archivo existe.
const previous = existsSync(outUrl) ? Object.fromEntries(read('pictos-src/conceptos.json').map((c) => [c.slug, c])) : {}

const concepts = new Map()
const used = new Set()
for (const r of rows) {
  const id = ids[r.label.toLowerCase()]
  const key = r.picto ? `p${r.picto}` : typeof id === 'number' ? `a${id}` : `l${r.label.toLowerCase()}`
  let c = concepts.get(key)
  if (!c) {
    let s = r.picto ?? (slug(r.label) || 'x')
    while (used.has(s)) s += '-2'
    used.add(s)
    c = { slug: s, word: r.label, alt: r.alt, cls: r.cls, context: r.context, arasaac: typeof id === 'number' && !r.picto ? id : null, labels: [] }
    if (SVG.has(r.label.toLowerCase()) && !r.picto) c.svg = true
    if (MANUAL.has(r.label.toLowerCase())) c.manual = true
    if (previous[s]?.hint) c.hint = previous[s].hint
    concepts.set(key, c)
  }
  if (!c.labels.includes(r.label)) c.labels.push(r.label)
}
const list = [...concepts.values()]
writeFileSync(outUrl, JSON.stringify(list, null, 1) + '\n')
console.log(`${list.length} conceptos (${list.filter((c) => c.svg).length} en SVG) → pictos-src/conceptos.json`)
