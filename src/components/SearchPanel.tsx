import { useMemo, useState } from 'react'
import type { Board, GridSize } from '../lib/types'
import { searchWords, type SearchResult } from '../lib/search'
import { imageUrl } from '../lib/store'

interface Props {
  boards: Record<string, Board>
  size: GridSize
  onPick: (result: SearchResult) => void
  onClose: () => void
}

/** Buscar una palabra y ver por qué carpetas se llega a ella. */
export function SearchPanel({ boards, size, onPick, onClose }: Props) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchWords(boards, query, size), [boards, query, size])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet search-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <input
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar palabra…"
            autoFocus
          />
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="search-results">
          {query && results.length === 0 && <p className="muted">No encontré «{query}».</p>}
          {!query && <p className="muted">Escribe una palabra y te muestro dónde está y cómo llegar.</p>}
          {results.map((r) => {
            const src = imageUrl(r.cell.image)
            return (
              <button key={r.cell.id} type="button" className="search-result" onClick={() => onPick(r)}>
                <span className={`search-thumb wc-${r.cell.wordClass}`}>{src && <img src={src} alt="" />}</span>
                <span className="search-text">
                  <strong>{r.cell.label}</strong>
                  <span className="muted small">{r.path.map((id) => boards[id]?.name ?? id).join(' › ')}</span>
                </span>
                <span className="search-go">Ir ➜</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
