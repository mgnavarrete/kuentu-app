import { useState } from 'react'
import type { Board, Cell, WordClass } from '../lib/types'
import { imageUrl } from '../lib/store'
import { PictoSearch } from './PictoSearch'

export const WORD_CLASSES: { value: WordClass; label: string }[] = [
  { value: 'pron', label: 'Persona / pronombre' },
  { value: 'verb', label: 'Acción (verbo)' },
  { value: 'adj', label: 'Descripción (adjetivo)' },
  { value: 'adv', label: 'Cuándo, dónde, cómo (adverbio)' },
  { value: 'noun', label: 'Cosa (sustantivo)' },
  { value: 'det', label: 'Artículo (el, un…)' },
  { value: 'prep', label: 'Preposición (a, de, con…)' },
  { value: 'conj', label: 'Unir ideas (y, pero…)' },
  { value: 'quest', label: 'Pregunta' },
  { value: 'social', label: 'Social / frase' },
  { value: 'neg', label: 'Negación' },
  { value: 'misc', label: 'Otra' },
]

interface Props {
  cell: Cell
  isNew: boolean
  boards: Record<string, Board>
  currentBoardId: string
  onSave: (cell: Cell, newFolderName?: string) => void
  onDelete: () => void
  /** Mover antes/después (no se ofrece si es undefined). */
  onMove?: (delta: number) => void
  onClose: () => void
}

/** Achica una foto a 300 px para que no ocupe demasiado espacio. */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const max = 300
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(img.src)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const NEW_FOLDER = '__new__'

export function CellEditor({ cell, isNew, boards, currentBoardId, onSave, onDelete, onMove, onClose }: Props) {
  const [draft, setDraft] = useState<Cell>(cell)
  const [searching, setSearching] = useState(false)
  const [folderTarget, setFolderTarget] = useState<string>(cell.folder ?? '')
  const isFolder = folderTarget !== ''
  const src = imageUrl(draft.image)

  const set = (patch: Partial<Cell>) => setDraft((d) => ({ ...d, ...patch }))

  function save() {
    if (!draft.label.trim()) return
    const result: Cell = { ...draft, label: draft.label.trim(), speak: draft.speak?.trim() || undefined }
    if (isFolder && folderTarget !== NEW_FOLDER) result.folder = folderTarget
    else if (!isFolder) delete result.folder
    onSave(result, folderTarget === NEW_FOLDER ? result.label : undefined)
  }

  const otherBoards = Object.values(boards).filter((b) => b.id !== currentBoardId && b.id !== 'home')

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet editor" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>{isNew ? 'Nuevo botón' : 'Editar botón'}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="editor-body">
          <div className="editor-preview">
            <div className={`cell ${isFolder ? 'cell-folder' : `wc-${draft.wordClass}`}`} style={draft.color ? { background: draft.color } : undefined}>
              {src && <img src={src} alt="" />}
              <span className="cell-label">{draft.label || '…'}</span>
            </div>
            <div className="editor-image-actions">
              <button type="button" className="btn" onClick={() => setSearching((s) => !s)}>
                {searching ? 'Cerrar búsqueda' : 'Buscar pictograma'}
              </button>
              <label className="btn">
                Foto o imagen
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) set({ image: await resizeImage(file) })
                    e.target.value = ''
                  }}
                />
              </label>
              {draft.image && (
                <button type="button" className="btn btn-ghost" onClick={() => set({ image: undefined })}>
                  Quitar imagen
                </button>
              )}
            </div>
          </div>

          {searching && (
            <PictoSearch
              initialQuery={draft.label}
              onPick={(id) => {
                set({ image: `arasaac:${id}` })
                setSearching(false)
              }}
            />
          )}

          <label className="field">
            <span>Texto del botón</span>
            <input value={draft.label} onChange={(e) => set({ label: e.target.value })} autoFocus={isNew} />
          </label>

          <label className="field">
            <span>Texto que se dice (opcional)</span>
            <input value={draft.speak ?? ''} onChange={(e) => set({ speak: e.target.value })} placeholder={draft.label} />
          </label>

          <label className="field">
            <span>Tipo</span>
            <select value={isFolder ? 'folder' : 'word'} onChange={(e) => setFolderTarget(e.target.value === 'folder' ? cell.folder ?? NEW_FOLDER : '')}>
              <option value="word">Palabra o frase</option>
              <option value="folder">Carpeta (abre otro tablero)</option>
            </select>
          </label>

          {isFolder ? (
            <label className="field">
              <span>Abre el tablero</span>
              <select value={folderTarget} onChange={(e) => setFolderTarget(e.target.value)}>
                <option value={NEW_FOLDER}>➕ Crear carpeta nueva</option>
                {otherBoards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="field">
              <span>Categoría (color y gramática)</span>
              <select value={draft.wordClass} onChange={(e) => set({ wordClass: e.target.value as WordClass })}>
                {WORD_CLASSES.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="field">
            <span>Color propio</span>
            <div className="row">
              <input type="color" value={draft.color ?? '#ffffff'} onChange={(e) => set({ color: e.target.value })} />
              {draft.color && (
                <button type="button" className="btn btn-ghost" onClick={() => set({ color: undefined })}>
                  Usar color de la categoría
                </button>
              )}
            </div>
          </div>

          <label className="check">
            <input type="checkbox" checked={!!draft.hidden} onChange={(e) => set({ hidden: e.target.checked })} />
            Ocultar este botón (sigue visible al editar)
          </label>

          {!isFolder && draft.wordClass === 'noun' && (
            <label className="field">
              <span>Género (para el artículo: el / la)</span>
              <select value={draft.gender ?? ''} onChange={(e) => set({ gender: (e.target.value || undefined) as Cell['gender'] })}>
                <option value="">Automático</option>
                <option value="m">Masculino (el, un)</option>
                <option value="f">Femenino (la, una)</option>
              </select>
            </label>
          )}

          <label className="field">
            <span>Otras palabras para el buscador (opcional)</span>
            <input value={draft.keywords ?? ''} onChange={(e) => set({ keywords: e.target.value || undefined })} placeholder="ej. aguacate" />
          </label>

          {!isNew && onMove && (
            <div className="field">
              <span>Posición</span>
              <div className="row">
                <button type="button" className="btn" onClick={() => onMove(-1)}>
                  ← Antes
                </button>
                <button type="button" className="btn" onClick={() => onMove(1)}>
                  Después →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sheet-footer">
          {!isNew && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (confirm(`¿Eliminar el botón «${cell.label}»?`)) onDelete()
              }}
            >
              Eliminar
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={!draft.label.trim()}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
