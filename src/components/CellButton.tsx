import { memo } from 'react'
import type { Cell } from '../lib/types'
import { imageUrl } from '../lib/store'
import { hasForms } from '../lib/morph'
import { usePress } from '../lib/usePress'

interface Props {
  cell: Cell
  showLabels: boolean
  editing: boolean
  /** Botón de la plantilla núcleo dentro de una carpeta. */
  template?: boolean
  /** Ruta guiada: este es el botón que hay que tocar. */
  highlight?: boolean
  /** Ruta guiada: los demás botones se atenúan. */
  dimmed?: boolean
  onTap: (cell: Cell, template: boolean) => void
  onLongPress?: (cell: Cell) => void
}

const formsCache = new Map<string, boolean>()
function cellHasForms(cell: Cell): boolean {
  const key = `${cell.wordClass}:${cell.label}`
  if (!formsCache.has(key)) formsCache.set(key, !cell.folder && hasForms(cell.label, cell.wordClass))
  return formsCache.get(key)!
}

export const CellButton = memo(function CellButton({ cell, showLabels, editing, template = false, highlight, dimmed, onTap, onLongPress }: Props) {
  const withForms = cellHasForms(cell)
  const press = usePress(
    () => onTap(cell, template),
    onLongPress && !editing && withForms ? () => onLongPress(cell) : undefined,
  )
  const src = imageUrl(cell.image)
  const classes = ['cell', cell.folder ? 'cell-folder' : `wc-${cell.wordClass}`]
  if (cell.hidden) classes.push('cell-hidden')
  if (editing && !template) classes.push('cell-editing')
  if (editing && template) classes.push('cell-template')
  if (withForms) classes.push('cell-forms')
  if (highlight) classes.push('cell-highlight')
  if (dimmed) classes.push('cell-dimmed')

  return (
    <button
      type="button"
      className={classes.join(' ')}
      style={cell.color ? { background: cell.color } : undefined}
      aria-label={cell.folder ? `Carpeta ${cell.label}` : cell.label}
      {...press}
    >
      {src && <img src={src} alt="" draggable={false} loading="lazy" />}
      {(showLabels || !src) && <span className="cell-label">{cell.label}</span>}
      {editing && !template && <span className="edit-badge">✎</span>}
      {editing && template && <span className="edit-badge template-badge">N</span>}
    </button>
  )
})
