import type { Board, Cell } from '../lib/types'
import { CellButton } from './CellButton'

interface Props {
  board: Board
  showLabels: boolean
  editing: boolean
  guideTarget?: string
  onTap: (cell: Cell, template: boolean) => void
  onLongPress: (cell: Cell) => void
  onAdd: () => void
  onClose: () => void
}

/** Carpeta que se abre como ventana sobre la pantalla actual (Palabritas, Preguntas). */
export function PopupBoard({ board, showLabels, editing, guideTarget, onTap, onLongPress, onAdd, onClose }: Props) {
  const sections: { name: string; cells: Cell[] }[] = []
  for (const c of board.cells) {
    if (c.hidden && !editing) continue
    const name = c.section ?? ''
    let s = sections.find((x) => x.name === name)
    if (!s) sections.push((s = { name, cells: [] }))
    s.cells.push(c)
  }
  const guiding = guideTarget !== undefined

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet popup-board" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>{board.name}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="popup-sections">
          {sections.map((s) => (
            <section key={s.name}>
              {s.name && <h3>{s.name}</h3>}
              <div className="popup-grid">
                {s.cells.map((c) => (
                  <CellButton
                    key={c.id}
                    cell={c}
                    showLabels={showLabels}
                    editing={editing}
                    highlight={guiding && guideTarget === c.id}
                    dimmed={guiding && guideTarget !== c.id}
                    onTap={onTap}
                    onLongPress={onLongPress}
                  />
                ))}
              </div>
            </section>
          ))}
          {editing && (
            <button type="button" className="btn" onClick={onAdd}>
              + Agregar palabra
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
