import type { Cell } from '../lib/types'
import type { Layout } from '../lib/grid'
import { CellButton } from './CellButton'

interface Props {
  layout: Layout
  showLabels: boolean
  editing: boolean
  /** Id del botón a resaltar en la ruta guiada ("more" = el botón Más…). */
  guideTarget?: string
  onTap: (cell: Cell, template: boolean) => void
  onLongPress: (cell: Cell) => void
  onMore: () => void
  onAdd: (slotIndex: number) => void
}

export function BoardGrid({ layout, showLabels, editing, guideTarget, onTap, onLongPress, onMore, onAdd }: Props) {
  const guiding = guideTarget !== undefined
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
      }}
    >
      {layout.slots.map((slot) => {
        switch (slot.kind) {
          case 'cell':
            return (
              <CellButton
                key={slot.cell.id + slot.index}
                cell={slot.cell}
                showLabels={showLabels}
                editing={editing}
                template={slot.template}
                highlight={guiding && guideTarget === slot.cell.id}
                dimmed={guiding && guideTarget !== slot.cell.id}
                onTap={onTap}
                onLongPress={onLongPress}
              />
            )
          case 'more':
            return (
              <button
                key={'more' + slot.index}
                type="button"
                className={`cell cell-more ${guiding ? (guideTarget === 'more' ? 'cell-highlight' : 'cell-dimmed') : ''}`}
                onClick={onMore}
              >
                <span className="cell-more-arrow">➜</span>
                <span className="cell-label">
                  Más… {slot.page + 1}/{slot.pages}
                </span>
              </button>
            )
          case 'add':
            return (
              <button key={'add' + slot.index} type="button" className="cell cell-add" onClick={() => onAdd(slot.index)}>
                <span className="cell-add-plus">+</span>
              </button>
            )
          default:
            return <div key={'empty' + slot.index} className="cell-empty" />
        }
      })}
    </div>
  )
}
