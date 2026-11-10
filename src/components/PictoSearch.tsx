import { useMemo, useState } from 'react'
import { ownPictos } from '../lib/store'

interface Props {
  initialQuery: string
  /** Recibe la referencia de imagen ("kuentu:<concepto>"). */
  onPick: (image: string) => void
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!…]/g, '')
    .trim()

/** Busca en la biblioteca de pictogramas incluida en la app (funciona sin internet). */
export function PictoSearch({ initialQuery, onPick }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const index = useMemo(() => ownPictos.map((p) => ({ ...p, n: norm(p.words) })), [])

  const results = useMemo(() => {
    const q = norm(query)
    if (!q) return []
    const words = q.split(/\s+/)
    // Primero las coincidencias exactas de palabra, luego las que empiezan igual, luego las que la contienen.
    const score = (n: string) => {
      const tokens = n.split(/\s+/)
      let s = 0
      for (const w of words) {
        if (tokens.includes(w)) s += 3
        else if (tokens.some((t) => t.startsWith(w))) s += 2
        else if (n.includes(w)) s += 1
        else return 0
      }
      return s
    }
    return index
      .map((p) => ({ p, s: score(p.n) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 48)
      .map((r) => r.p)
  }, [query, index])

  return (
    <div className="picto-search">
      <div className="row">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar pictograma…" autoFocus />
      </div>
      {query.trim() && results.length === 0 && <p className="muted">Sin resultados. Puedes usar una foto propia.</p>}
      <div className="picto-results">
        {results.map((r) => (
          <button key={r.slug} type="button" className="picto-result" onClick={() => onPick(`kuentu:${r.slug}`)} title={r.words}>
            <img src={`pictos/kuentu/${r.slug}.webp`} alt={r.words.split(' ')[0]} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}
