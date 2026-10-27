import type { Recent } from '../lib/types'

interface Props {
  recents: Recent[]
  onPick: (recent: Recent) => void
  onSaveAsButton: (recent: Recent) => void
  onClear: () => void
  onClose: () => void
}

function when(at: number): string {
  const d = new Date(at)
  const today = new Date()
  const time = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  return d.toDateString() === today.toDateString() ? time : `${d.toLocaleDateString('es-CL')} ${time}`
}

/** Frases que se dijeron, para repetirlas o guardarlas como botón. */
export function RecentsPanel({ recents, onPick, onSaveAsButton, onClear, onClose }: Props) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Recientes</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="search-results">
          {recents.length === 0 && <p className="muted">Aquí aparecen las frases que digas tocando el mensaje.</p>}
          {recents.map((r) => (
            <div key={r.at} className="recent-row">
              <button type="button" className="recent-text" onClick={() => onPick(r)}>
                <strong>{r.text}</strong>
                <span className="muted small">{when(r.at)}</span>
              </button>
              <button type="button" className="btn btn-small" onClick={() => onSaveAsButton(r)} title="Guardar como botón en esta carpeta">
                + botón
              </button>
            </div>
          ))}
        </div>
        {recents.length > 0 && (
          <div className="sheet-footer">
            <span className="spacer" />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (confirm('¿Borrar el historial de frases?')) onClear()
              }}
            >
              Borrar historial
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
