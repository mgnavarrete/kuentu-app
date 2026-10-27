import { GRID, TEMPLATE_SLOTS } from '../data/layouts'
import type { Board, Cell, GridSize } from './types'

export type Slot =
  | { kind: 'cell'; cell: Cell; template: boolean; index: number }
  | { kind: 'empty'; index: number }
  | { kind: 'more'; page: number; pages: number; index: number }
  | { kind: 'add'; index: number }

export interface Layout {
  rows: number
  cols: number
  slots: Slot[]
  pages: number
}

function homeCellAt(home: Board, size: GridSize, index: number): Cell | undefined {
  const id = home.layouts?.[size]?.[index]
  return id ? home.cells.find((c) => c.id === id) : undefined
}

/**
 * Qué va en cada casilla:
 * - Inicio: la distribución fija del tamaño elegido.
 * - Carpetas: las casillas de plantilla muestran la palabra núcleo de Inicio en el mismo lugar,
 *   y el resto se llena en orden con el contenido; si no cabe, el último botón es "Más…".
 */
export function computeLayout(board: Board, home: Board, size: GridSize, page: number, editing: boolean): Layout {
  const { rows, cols } = GRID[size]
  const total = rows * cols

  if (board.id === home.id) {
    const slots: Slot[] = Array.from({ length: total }, (_, index) => {
      const cell = homeCellAt(home, size, index)
      if (cell && (editing || !cell.hidden)) return { kind: 'cell', cell, template: false, index }
      return editing ? { kind: 'add', index } : { kind: 'empty', index }
    })
    return { rows, cols, slots, pages: 1 }
  }

  const templateSet = new Set(TEMPLATE_SLOTS[size])
  const free = Array.from({ length: total }, (_, i) => i).filter((i) => !templateSet.has(i))
  const content = board.cells.filter((c) => editing || !c.hidden)
  const items: (Cell | 'add')[] = editing ? [...content, 'add'] : content

  let pages = 1
  let pageSize = free.length
  if (items.length > free.length) {
    pageSize = free.length - 1
    pages = Math.ceil(items.length / pageSize)
  }
  const p = Math.min(page, pages - 1)
  const pageItems = items.slice(p * pageSize, (p + 1) * pageSize)

  const slots: Slot[] = new Array(total)
  for (const index of templateSet) {
    const cell = homeCellAt(home, size, index)
    slots[index] = cell && !cell.hidden ? { kind: 'cell', cell, template: true, index } : { kind: 'empty', index }
  }
  free.forEach((index, i) => {
    if (pages > 1 && i === free.length - 1) {
      slots[index] = { kind: 'more', page: p, pages, index }
      return
    }
    const item = pageItems[i]
    if (item === undefined) slots[index] = { kind: 'empty', index }
    else if (item === 'add') slots[index] = { kind: 'add', index }
    else slots[index] = { kind: 'cell', cell: item, template: false, index }
  })
  return { rows, cols, slots, pages }
}

/** Página de una carpeta donde aparece una celda (para la ruta guiada). */
export function pageOf(board: Board, size: GridSize, cellId: string): number {
  const total = GRID[size].rows * GRID[size].cols
  const free = total - TEMPLATE_SLOTS[size].length
  const content = board.cells.filter((c) => !c.hidden)
  const i = content.findIndex((c) => c.id === cellId)
  if (i < 0 || content.length <= free) return 0
  return Math.floor(i / (free - 1))
}
