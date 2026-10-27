import { useEffect, useState } from 'react'

interface Props {
  initialQuery: string
  onPick: (id: number) => void
}

interface Result {
  _id: number
  keywords: { keyword: string }[]
}

/** Busca pictogramas en la API pública de ARASAAC. */
export function PictoSearch({ initialQuery, onPick }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Result[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'empty'>('idle')

  async function search(q: string) {
    const term = q.trim()
    if (!term) return
    setStatus('loading')
    try {
      const res = await fetch(`https://api.arasaac.org/v1/pictograms/es/search/${encodeURIComponent(term)}`)
      if (res.status === 404) {
        setResults([])
        setStatus('empty')
        return
      }
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as Result[]
      setResults(data.slice(0, 40))
      setStatus(data.length ? 'idle' : 'empty')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    // Solo la búsqueda inicial; luego busca el usuario.
    if (initialQuery) search(initialQuery)
  }, [])

  return (
    <div className="picto-search">
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          search(query)
        }}
      >
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar pictograma…" />
        <button type="submit" className="btn">
          Buscar
        </button>
      </form>
      {status === 'loading' && <p className="muted">Buscando…</p>}
      {status === 'error' && <p className="muted">No se pudo buscar. ¿Hay conexión a internet?</p>}
      {status === 'empty' && <p className="muted">Sin resultados.</p>}
      <div className="picto-results">
        {results.map((r) => (
          <button key={r._id} type="button" className="picto-result" onClick={() => onPick(r._id)} title={r.keywords[0]?.keyword}>
            <img src={`https://static.arasaac.org/pictograms/${r._id}/${r._id}_300.png`} alt={r.keywords[0]?.keyword ?? ''} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}
