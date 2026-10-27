// Descarga los pictogramas del vocabulario a public/pictos/ para que la app funcione sin internet
// (programa de escritorio, APK). Los que ya están descargados se saltan.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'

const pictos = JSON.parse(await readFile(new URL('../src/data/pictos.json', import.meta.url), 'utf8'))
const overrides = JSON.parse(await readFile(new URL('../src/data/picto-overrides.json', import.meta.url), 'utf8'))
const ids = [...new Set([...Object.values(pictos), ...Object.values(overrides)].filter((v) => typeof v === 'number'))]

const dir = new URL('../public/pictos/', import.meta.url)
await mkdir(dir, { recursive: true })

let downloaded = 0
const failed = []
const CONCURRENCY = 6
for (let i = 0; i < ids.length; i += CONCURRENCY) {
  await Promise.all(
    ids.slice(i, i + CONCURRENCY).map(async (id) => {
      const file = new URL(`${id}.png`, dir)
      try {
        await access(file)
        return
      } catch {}
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(`https://static.arasaac.org/pictograms/${id}/${id}_300.png`)
          if (!res.ok) throw new Error(String(res.status))
          await writeFile(file, Buffer.from(await res.arrayBuffer()))
          downloaded++
          return
        } catch {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
        }
      }
      failed.push(id)
    }),
  )
}

// Lista de los que quedaron incluidos, para que la app sepa cuáles cargar del disco.
const bundled = ids.filter((id) => !failed.includes(id)).sort((a, b) => a - b)
await writeFile(new URL('../src/data/bundled-pictos.json', import.meta.url), JSON.stringify(bundled) + '\n')
console.log(`${downloaded} descargados, ${bundled.length} incluidos en total.`)
if (failed.length) console.log('No se pudieron descargar:', failed.join(', '))
