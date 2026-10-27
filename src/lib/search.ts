import type { Board, Cell, GridSize } from './types'
import { normalize } from './predict'

export interface SearchResult {
  cell: Cell
  /** Tableros desde Inicio hasta el que contiene la palabra. */
  path: string[]
}

/** Celdas que se ven en un tablero (en Inicio, solo las que están en la distribución del tamaño actual). */
function reachableCells(board: Board, size: GridSize): Cell[] {
  if (board.layouts) {
    const ids = new Set(board.layouts[size].filter(Boolean))
    return board.cells.filter((c) => ids.has(c.id))
  }
  return board.cells
}

/**
 * Busca palabras recorriendo las carpetas desde Inicio (búsqueda en anchura),
 * así cada resultado viene con el camino más corto para llegar.
 */
export function searchWords(boards: Record<string, Board>, query: string, size: GridSize, limit = 40): SearchResult[] {
  const q = normalize(query.trim())
  if (!q) return []
  const results: SearchResult[] = []
  const seen = new Set<string>()
  const visited = new Set<string>(['home'])
  const queue: string[][] = [['home']]

  const matches = (c: Cell) => {
    const words = normalize(`${c.label} ${c.keywords ?? ''}`).split(/[^a-zñ]+/)
    return normalize(c.label).startsWith(q) || words.some((w) => w.startsWith(q))
  }

  while (queue.length) {
    const path = queue.shift()!
    const board = boards[path[path.length - 1]]
    if (!board) continue
    for (const c of reachableCells(board, size)) {
      if (c.hidden) continue
      if (c.folder) {
        if (!visited.has(c.folder) && boards[c.folder]) {
          visited.add(c.folder)
          queue.push([...path, c.folder])
        }
        continue
      }
      const key = normalize(c.label)
      if (!seen.has(key) && matches(c)) {
        seen.add(key)
        results.push({ cell: c, path })
      }
    }
  }
  // Primero las que empiezan igual que lo buscado, luego las más cortas.
  return results
    .sort((a, b) => {
      const pa = normalize(a.cell.label).startsWith(q) ? 0 : 1
      const pb = normalize(b.cell.label).startsWith(q) ? 0 : 1
      return pa - pb || a.path.length - b.path.length || a.cell.label.length - b.cell.label.length
    })
    .slice(0, limit)
}
