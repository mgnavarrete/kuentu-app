// Busca en ARASAAC un pictograma para cada palabra de src/data/vocabulario.ts
// y guarda { "etiqueta": idPictograma } en src/data/pictos.json.
// Las búsquedas ya hechas se guardan en scripts/.picto-cache.json para no repetirlas.
import { readFile, writeFile } from 'node:fs/promises'
import { FOLDERS, HOME_WORDS, parseList } from '../src/data/vocabulario.ts'

const outUrl = new URL('../src/data/pictos.json', import.meta.url)
const cacheUrl = new URL('./.picto-cache.json', import.meta.url)

let cache = {}
try {
  cache = JSON.parse(await readFile(cacheUrl, 'utf8'))
} catch {}

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
const clean = (s) => s.replace(/[¿?¡!…]/g, '').replace(/\(se\)/g, '').trim()
const STOP = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'a', 'al', 'en', 'con', 'mi', 'tu', 'me', 'te', 'se', 'lo', 'que', 'y', 'es', 'por', 'para', 'muy', 'no'])

/** Etiqueta → lista de búsquedas en orden de preferencia. */
const entries = new Map()
function add(label, alt) {
  const key = label.toLowerCase()
  if (entries.has(key)) return
  const queries = []
  if (alt) queries.push(clean(alt))
  queries.push(clean(label))
  // Para frases: probar las palabras importantes, de la más larga a la más corta.
  const words = clean(label).split(/\s+/).filter((w) => !STOP.has(w.toLowerCase()) && w.length > 2)
  if (words.length > 1) queries.push(...[...words].sort((a, b) => b.length - a.length))
  entries.set(key, [...new Set(queries.map((q) => q.toLowerCase()).filter(Boolean))])
}

for (const list of Object.values(HOME_WORDS)) for (const e of parseList(list)) add(e.label, e.alt)
for (const f of FOLDERS) {
  add(f.name, f.icon)
  if (f.starters) for (const e of parseList(f.starters)) add(e.label, e.alt)
  for (const g of f.groups) {
    add(g.name, g.icon)
    for (const e of parseList(g.words)) add(e.label, e.alt)
  }
}
add('más carpetas', 'carpeta')

async function search(q) {
  if (q in cache) return cache[q]
  let id = null
  try {
    const res = await fetch(`https://api.arasaac.org/v1/pictograms/es/search/${encodeURIComponent(q)}`)
    // 404 = no hay resultados; cualquier otro error (ej. demasiadas consultas) se reintenta otra vez.
    if (!res.ok && res.status !== 404) return null
    if (res.ok) {
      const results = await res.json()
      if (Array.isArray(results) && results.length) {
        // Preferir los que tienen la palabra exacta; luego el primero. Algunos ya no tienen imagen.
        const exact = results.filter((r) => r.keywords?.some((k) => norm(k.keyword) === norm(q)))
        const others = results.filter((r) => !exact.includes(r))
        for (const r of [...exact, ...others].slice(0, 4)) {
          const img = await fetch(`https://static.arasaac.org/pictograms/${r._id}/${r._id}_300.png`, { method: 'HEAD' })
          if (img.ok) {
            id = r._id
            break
          }
        }
      }
    }
  } catch {
    return null // error de red: no se guarda en caché para reintentar
  }
  cache[q] = id
  return id
}

const out = {}
const missing = []
const keys = [...entries.keys()]
const CONCURRENCY = 4
let done = 0
for (let i = 0; i < keys.length; i += CONCURRENCY) {
  await Promise.all(
    keys.slice(i, i + CONCURRENCY).map(async (key) => {
      for (const q of entries.get(key)) {
        const id = await search(q)
        if (id != null) {
          out[key] = id
          return
        }
      }
      missing.push(key)
    }),
  )
  done += Math.min(CONCURRENCY, keys.length - i)
  if (i % 200 === 0) {
    console.log(`${done}/${keys.length}`)
    await writeFile(cacheUrl, JSON.stringify(cache))
  }
}

await writeFile(cacheUrl, JSON.stringify(cache))
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b, 'es')))
await writeFile(outUrl, JSON.stringify(sorted, null, 1) + '\n')
console.log(`${Object.keys(sorted).length} de ${keys.length} con pictograma.`)
if (missing.length) console.log('Sin pictograma:', missing.join(', '))
