// Índice de la biblioteca propia: qué conceptos ya tienen imagen en public/pictos/kuentu/.
// Escribe src/data/kuentu-pictos.json con:
//   labels: { "etiqueta": "slug" }   → para los tableros nuevos
//   ids:    { "idArasaac": "slug" }  → los tableros ya guardados ("arasaac:<id>") se ven con la imagen nueva
//   all:    [ { slug, words } ]      → para el buscador del modo edición
// Uso: node scripts/pictos/index.mjs (lo ejecuta también generate.mjs)
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const concepts = JSON.parse(readFileSync(new URL('pictos-src/conceptos.json', root), 'utf8'))
const has = (slug) => existsSync(new URL(`public/pictos/kuentu/${slug}.webp`, root))

const labels = {}
const ids = {}
const all = []
for (const c of concepts) {
  if (!has(c.slug)) continue
  for (const l of c.labels) labels[l.toLowerCase()] = c.slug
  if (c.arasaac) ids[c.arasaac] = c.slug
  all.push({ slug: c.slug, words: [...new Set([...c.labels, c.alt].filter(Boolean).map((w) => w.toLowerCase()))].join(' ') })
}
writeFileSync(new URL('src/data/kuentu-pictos.json', root), JSON.stringify({ labels, ids, all }) + '\n')
console.log(`Índice: ${all.length} de ${concepts.length} conceptos con imagen propia.`)
