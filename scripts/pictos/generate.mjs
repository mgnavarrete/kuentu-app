// Genera pictogramas con Codex (image_gen) en hojas de 4×3 y los corta en public/pictos/kuentu/.
// Toma los conceptos de pictos-src/conceptos.json que todavía no tienen imagen, en orden.
//
// Uso: node scripts/pictos/generate.mjs [hojas=1] [--solo slug1,slug2,...]
//   --solo   regenera esos conceptos aunque ya tengan imagen (para corregir los que no gustaron)
// Cada hoja queda en pictos-src/hojas/ y una hoja de revisión con nombres en pictos-src/revision/.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, copyFileSync, appendFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const P = (...p) => join(root, ...p)
const OUT = P('public/pictos/kuentu')
const SHEETS = P('pictos-src/hojas')
const REVIEW = P('pictos-src/revision')
const REF = P('pictos-src/referencia/estilo-12.png')
const LOG = P('pictos-src/generacion.log')
for (const d of [OUT, SHEETS, REVIEW]) mkdirSync(d, { recursive: true })

const args = process.argv.slice(2)
const soloIdx = args.indexOf('--solo')
const solo = soloIdx >= 0 ? new Set(args[soloIdx + 1].split(',')) : null
const sheets = Number(args.find((a) => /^\d+$/.test(a)) ?? 1)

const CLS = {
  pron: 'pronombre', verb: 'verbo (acción)', adj: 'adjetivo', adv: 'adverbio', noun: 'sustantivo', det: 'artículo',
  prep: 'preposición', conj: 'conjunción', quest: 'palabra de pregunta', social: 'frase social', neg: 'negación',
  misc: 'palabra', carpeta: 'categoría/carpeta',
}

const STYLE = `STYLE — copy EXACTLY the style of the attached reference sheet (same line weight, same stick figure, same colors):
classic AAC pictogram look, extremely simple and concrete. VERY THICK pure black (#000000) uniform outlines on every shape, about 3% of the cell width.
The generic PERSON is a minimal stick figure: plain WHITE circular head with a very thick black outline, NO hair, NO ears, NO nose, small solid black dot eyes and a simple black line mouth; short black neck stub; body, arms and legs are single very thick solid BLACK rounded lines (never a filled torso); small white round hands with black outline. No clothing, no skin color, no gender cues for the generic person.
Only when the word names a specific kind of person (mamá, papá, abuela, niña, doctor, etc.) draw a simple full-color person with light peach skin, simple hair and plain clothes, like the reference.
Close-ups of eating/drinking/mouth actions: a big white round head in side profile. Emotions: only a big white circle face.
Objects use flat saturated colors (red #E52521, yellow #F2E28A, blue #5B8DD6, light blue #CDE9F2, orange #F29F1D, green #6FAE2E, brown #A0522D) with the same thick black outline.
No gradients, no shadows, no texture, no background scenery. Only the elements needed to understand the concept.
Abstract words (prepositions, conjunctions, adverbs, pronouns, time words): use classic AAC conventions — stick figures pointing, simple objects with solid black arrows, a ball inside/on/under a box, etc. Question words may use a solid black question mark. NEVER draw written words or letters.`

function prompt(batch) {
  const cells = batch
    .map((c, i) => {
      const extra = [c.alt && c.alt !== c.word ? `= «${c.alt}» en español de España` : '', c.hint].filter(Boolean).join('; ')
      return `${i + 1}. «${c.word}» — ${CLS[c.cls] ?? c.cls}, ${c.context}${extra ? ` (${extra})` : ''}`
    })
    .join('\n')
  const empty = batch.length < 12 ? `\nCells ${batch.length + 1} to 12 must be left completely empty (white).` : ''
  return `Use your built-in image generation tool (image_gen) to create ONE landscape image, size 1536x1024. Attached is the style reference sheet. After it is generated, copy the resulting image file into the current working directory as \`hoja.png\` (overwrite if it exists). Do not write code or any other file. Reply only with "ok".

IMAGE DESCRIPTION:
A sheet of 12 separate AAC communication pictograms for Chilean Spanish words, in a grid of 4 columns x 3 rows on a pure plain white background. Each pictogram sits alone in its own equal cell, centered, with generous white space around it (at least 8% of the cell on every side) and fully inside its cell; NO grid lines, NO borders, NO text, NO letters, NO numbers.

${STYLE}

For each cell, draw the most concrete, instantly recognizable depiction of the word for a child who uses AAC. Cells, left to right, top to bottom:
${cells}${empty}`
}

function newestCodexImage(since, output = '') {
  // Debe aparecer en la respuesta de esta ejecución (Codex informa la ruta de la imagen que generó).
  const mentioned = (p) => output.includes(p.split('/').pop())
  const dir = join(homedir(), '.codex/generated_images')
  if (!existsSync(dir)) return null
  const files = []
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f)
      const s = statSync(p)
      if (s.isDirectory()) walk(p)
      else if (/\.(png|jpe?g|webp)$/i.test(f) && s.mtimeMs > since) files.push([s.mtimeMs, p])
    }
  }
  walk(dir)
  return files.sort((a, b) => b[0] - a[0]).map((f) => f[1]).find(mentioned) ?? null
}

const log = (m) => {
  const line = `${new Date().toISOString()} ${m}`
  console.log(line)
  appendFileSync(LOG, line + '\n')
}

const concepts = JSON.parse(readFileSync(P('pictos-src/conceptos.json'), 'utf8')).filter((c) => !c.svg && !c.manual)
const pending = concepts.filter((c) => (solo ? solo.has(c.slug) : !existsSync(join(OUT, c.slug + '.webp'))))
log(`pendientes: ${pending.length}; hojas a generar: ${Math.min(sheets, Math.ceil(pending.length / 12))}`)

let failures = 0
for (let s = 0; s < sheets && pending.length; s++) {
  const batch = pending.splice(0, 12)
  const n = readdirSync(SHEETS).filter((f) => f.endsWith('.png')).length + 1
  const name = `hoja-${String(n).padStart(3, '0')}`
  const genDir = P('pictos-src/gen')
  mkdirSync(genDir, { recursive: true })
  const target = join(genDir, 'hoja.png')
  const start = Date.now()
  log(`${name}: ${batch.map((c) => c.slug).join(', ')}`)
  const r = spawnSync(
    'codex',
    ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', genDir, '-i', REF, '--', prompt(batch)],
    { encoding: 'utf8', timeout: 15 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 },
  )
  // Solo se acepta la imagen que Codex copió aquí, o una nueva en generated_images si Codex terminó bien
  // (si falló, ahí puede haber imágenes de otras sesiones de Codex).
  let img = existsSync(target) && statSync(target).mtimeMs > start ? target : r.status === 0 ? newestCodexImage(start, r.stdout) : null
  if (!img) {
    failures++
    log(`${name}: ERROR sin imagen (código ${r.status}) ${(r.stderr || r.stdout || '').slice(-400).replace(/\s+/g, ' ')}`)
    pending.unshift(...batch)
    if (failures >= 2) {
      log('Dos errores seguidos (¿cuota agotada?): se detiene.')
      break
    }
    continue
  }
  failures = 0
  const sheet = join(SHEETS, `${name}.png`)
  copyFileSync(img, sheet)
  const names = batch.map((c) => c.slug).join(',')
  const py = spawnSync('python3', [P('scripts/pictos/process.py'), '--grid', '4x3', sheet, names, OUT], { encoding: 'utf8' })
  if (py.status !== 0) log(`${name}: ERROR al cortar ${py.stderr.slice(-300)}`)
  spawnSync('python3', [P('scripts/pictos/review.py'), name, ...batch.map((c) => `${c.slug}=${c.word}`)], { encoding: 'utf8' })
  appendFileSync(join(SHEETS, 'indice.tsv'), `${name}\t${names}\n`)
  log(`${name}: listo en ${Math.round((Date.now() - start) / 1000)} s`)
}
spawnSync('node', [P('scripts/pictos/index.mjs')], { stdio: 'inherit' })
log('fin')
