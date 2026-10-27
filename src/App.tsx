import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppData, Board, Cell, Recent, Settings, Token } from './lib/types'
import { defaultBoards, loadData, resolveGridSize, saveData, uid } from './lib/store'
import { speak, stopSpeaking } from './lib/speech'
import { applySmartGrammar, subjectOf } from './lib/morph'
import { normalize, predict } from './lib/predict'
import { computeLayout, pageOf } from './lib/grid'
import type { SearchResult } from './lib/search'
import { MessageBar } from './components/MessageBar'
import { BoardGrid } from './components/BoardGrid'
import { PopupBoard } from './components/PopupBoard'
import { FormsPopup } from './components/FormsPopup'
import { Keyboard } from './components/Keyboard'
import { CellEditor } from './components/CellEditor'
import { SettingsPanel } from './components/SettingsPanel'
import { SearchPanel } from './components/SearchPanel'
import { RecentsPanel } from './components/RecentsPanel'
import { BottomNav } from './components/BottomNav'
import { AdminPanel } from './components/AdminPanel'
import { changePassword, logout, type Account } from './lib/account'
import { Sync, type SyncStatus } from './lib/sync'
import { App as NativeApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

type Mode = 'grid' | 'keyboard'
type Panel = 'settings' | 'search' | 'recents' | 'admin' | null

interface EditorState {
  cell: Cell
  isNew: boolean
  boardId: string
  /** Casilla de Inicio donde va un botón nuevo. */
  slotIndex?: number
}

interface Guide {
  path: string[]
  targetId: string
  label: string
}

interface AppProps {
  /** Cuenta con sesión iniciada, o null si la app funciona solo en este dispositivo. */
  account: Account | null
  onLogout: () => void
  /** Pasar de usar la app sin cuenta a iniciar sesión (app instalada). */
  onLogin: () => void
}

export default function App({ account, onLogout, onLogin }: AppProps) {
  const [data, setData] = useState<AppData | null>(null)
  const [stack, setStack] = useState<string[]>(['home'])
  const [popup, setPopup] = useState<string | null>(null)
  const [pages, setPages] = useState<Record<string, number>>({})
  const [tokens, setTokens] = useState<Token[]>([])
  const [draft, setDraft] = useState('')
  const [spoken, setSpoken] = useState(false)
  const [mode, setMode] = useState<Mode>('grid')
  const [editing, setEditing] = useState(false)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [formsCell, setFormsCell] = useState<Cell | null>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [toast, setToast] = useState('')
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight })
  const saveTimer = useRef<number | undefined>(undefined)
  const backRef = useRef<() => void>(() => {})
  const syncRef = useRef<Sync | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved')

  // Botón "atrás" de Android: cierra ventanas y vuelve de carpeta antes de salir de la app.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const listener = NativeApp.addListener('backButton', () => backRef.current())
    return () => {
      listener.then((l) => l.remove())
    }
  }, [])

  useEffect(() => {
    if (!account) {
      loadData().then(setData)
      return
    }
    const sync = new Sync(
      account,
      (remote, conflict) => {
        setData(remote)
        if (conflict) setToast('Se actualizó con los cambios de otro dispositivo')
      },
      setSyncStatus,
    )
    syncRef.current = sync
    sync.start().then(setData)
    return () => sync.dispose()
  }, [account])

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!data) return
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => (syncRef.current ? syncRef.current.change(data) : saveData(data)), 300)
  }, [data])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

  // Palabras del vocabulario con su imagen, para la predicción y para poner pictograma a lo escrito.
  const vocabIndex = useMemo(() => {
    const map = new Map<string, string | undefined>()
    if (!data) return map
    for (const b of Object.values(data.boards))
      for (const c of b.cells) if (!c.folder && !map.has(normalize(c.label))) map.set(normalize(c.label), c.image)
    return map
  }, [data])
  const vocabWords = useMemo(() => [...vocabIndex.keys()], [vocabIndex])

  if (!data) return <div className="loading">Cargando…</div>

  const settings = data.settings
  const size = resolveGridSize(settings.gridSize, viewport.w, viewport.h)
  const home = data.boards.home
  const boardId = data.boards[stack[stack.length - 1]] ? stack[stack.length - 1] : 'home'
  const board: Board = data.boards[boardId]
  const popupBoard = popup ? data.boards[popup] : undefined
  const page = pages[boardId] ?? 0
  const layout = computeLayout(board, home, size, page, editing)
  // Si el mensaje ya se dijo y está activo el borrado automático, el siguiente botón empieza uno nuevo.
  const baseTokens = spoken && settings.clearAfterSpeak ? [] : tokens

  // --- Ruta guiada: qué botón hay que tocar en la pantalla actual ---
  let guideTarget: string | undefined
  let popupGuideTarget: string | undefined
  if (guide && !editing) {
    const last = guide.path[guide.path.length - 1]
    if (popup && popup === last) popupGuideTarget = guide.targetId
    else if (boardId === last && !data.boards[last].popup) {
      const onPage = boardId === 'home' || pageOf(board, size, guide.targetId) === Math.min(page, layout.pages - 1)
      guideTarget = onPage ? guide.targetId : 'more'
    } else {
      const i = guide.path.indexOf(boardId)
      const next = i >= 0 ? guide.path[i + 1] : undefined
      const folderCell = next ? board.cells.find((c) => c.folder === next) : undefined
      if (folderCell) {
        const onScreen = layout.slots.some((s) => s.kind === 'cell' && s.cell.id === folderCell.id)
        guideTarget = onScreen ? folderCell.id : 'more'
      }
    }
  }

  const updateBoard = (id: string, fn: (b: Board) => Board) =>
    setData((d) => (d ? { ...d, boards: { ...d.boards, [id]: fn(d.boards[id]) } } : d))
  const updateSettings = (patch: Partial<Settings>) => setData((d) => (d ? { ...d, settings: { ...d.settings, ...patch } } : d))

  function addToken(token: Token, cell?: Cell) {
    const base = baseTokens
    const next =
      settings.smartGrammar && cell
        ? applySmartGrammar(base, token, { wordClass: cell.wordClass, gender: cell.gender, userGender: settings.userGender })
        : [...base, token]
    setTokens(next)
    setSpoken(false)
    if (settings.speakOnTap) {
      // Si la gramática cambió palabras anteriores ("me gusta"), se dicen desde ahí.
      let first = 0
      while (first < base.length && next[first] === base[first]) first++
      speak(next.slice(first).map((t) => t.text).join(' '), settings)
    }
  }

  function commitDraft(word = draft): Token[] {
    const w = word.trim()
    if (!w) return tokens
    const next = [...baseTokens, { text: w, image: vocabIndex.get(normalize(w)) }]
    setTokens(next)
    setDraft('')
    setSpoken(false)
    const key = w.toLowerCase()
    setData((d) => (d ? { ...d, learned: { ...d.learned, [key]: (d.learned[key] ?? 0) + 1 } } : d))
    return next
  }

  function speakMessage() {
    const all = draft.trim() ? commitDraft() : tokens
    const text = all.map((t) => t.text).join(' ')
    if (!text) return
    speak(text, settings)
    setSpoken(true)
    setData((d) => {
      if (!d) return d
      const recents = [{ text, tokens: all, at: Date.now() }, ...d.recents.filter((r) => r.text !== text)].slice(0, 50)
      return { ...d, recents }
    })
  }

  function backspace() {
    setSpoken(false)
    if (draft) setDraft(draft.slice(0, -1))
    else setTokens(tokens.slice(0, -1))
  }

  function clearMessage() {
    stopSpeaking()
    setTokens([])
    setDraft('')
    setSpoken(false)
  }

  function openBoard(id: string) {
    const target = data!.boards[id]
    if (!target) return
    if (target.popup) {
      setPopup(id)
      return
    }
    setStack([...stack, id])
    // Con la ruta guiada, abrir directo en la página donde está la palabra.
    const startPage = guide && guide.path[guide.path.length - 1] === id ? pageOf(target, size, guide.targetId) : 0
    setPages((p) => ({ ...p, [id]: startPage }))
  }

  function goHome() {
    setStack(['home'])
    setPopup(null)
  }

  /** Botón «Inicio» de la barra inferior: también sale del teclado. */
  function goHomeScreen() {
    goHome()
    setMode('grid')
  }

  function goBack() {
    if (popup) setPopup(null)
    else if (mode === 'keyboard') setMode('grid')
    else if (stack.length > 1) setStack(stack.slice(0, -1))
  }

  function onCellTap(cell: Cell, template: boolean) {
    if (editing) {
      if (template) {
        setToast('Es una palabra núcleo: se edita en Inicio')
        return
      }
      setEditor({ cell, isNew: false, boardId: popup ?? boardId })
      return
    }
    if (cell.folder) {
      openBoard(cell.folder)
      return
    }
    addToken({ text: cell.speak || cell.label, image: cell.image }, cell)
    if (guide && cell.id === guide.targetId) setGuide(null)
    if (popup) setPopup(null)
    else if (settings.returnHome && boardId !== 'home' && !template) setStack(['home'])
  }

  function onCellLongPress(cell: Cell) {
    if (!cell.folder) setFormsCell(cell)
  }

  function startGuide(r: SearchResult) {
    setPanel(null)
    setMode('grid')
    setEditing(false)
    setPopup(null)
    setStack(['home'])
    setPages({})
    setGuide({ path: r.path, targetId: r.cell.id, label: r.cell.label })
  }

  // --- Edición ---

  function saveCell(state: EditorState, cell: Cell, newFolderName?: string) {
    let result = cell
    if (newFolderName) {
      const id = `b-${uid()}`
      setData((d) => (d ? { ...d, boards: { ...d.boards, [id]: { id, name: newFolderName, cells: [] } } } : d))
      result = { ...cell, folder: id }
    }
    updateBoard(state.boardId, (b) => {
      const exists = b.cells.some((c) => c.id === result.id)
      const cells = exists ? b.cells.map((c) => (c.id === result.id ? result : c)) : [...b.cells, result]
      if (exists || !b.layouts || state.slotIndex === undefined) return { ...b, cells }
      const layouts = { ...b.layouts, [size]: b.layouts[size].map((id, i) => (i === state.slotIndex ? result.id : id)) }
      return { ...b, cells, layouts }
    })
    setEditor(null)
  }

  function deleteCell(state: EditorState) {
    const id = state.cell.id
    updateBoard(state.boardId, (b) => {
      const cells = b.cells.filter((c) => c.id !== id)
      if (!b.layouts) return { ...b, cells }
      const layouts = Object.fromEntries(
        Object.entries(b.layouts).map(([s, ids]) => [s, ids.map((x) => (x === id ? null : x))]),
      ) as Board['layouts']
      return { ...b, cells, layouts }
    })
    setEditor(null)
  }

  function moveCell(state: EditorState, delta: number) {
    updateBoard(state.boardId, (b) => {
      if (b.layouts) {
        const ids = [...b.layouts[size]]
        const i = ids.indexOf(state.cell.id)
        const j = i + delta
        if (i < 0 || j < 0 || j >= ids.length) return b
        ;[ids[i], ids[j]] = [ids[j], ids[i]]
        return { ...b, layouts: { ...b.layouts, [size]: ids } }
      }
      const cells = [...b.cells]
      const i = cells.findIndex((c) => c.id === state.cell.id)
      const j = i + delta
      if (i < 0 || j < 0 || j >= cells.length) return b
      ;[cells[i], cells[j]] = [cells[j], cells[i]]
      return { ...b, cells }
    })
  }

  function newCell(targetBoard: string, slotIndex?: number) {
    const b = data!.boards[targetBoard]
    const section = b.popup ? b.cells[b.cells.length - 1]?.section : undefined
    setEditor({ cell: { id: uid(), label: '', wordClass: 'noun', section }, isNew: true, boardId: targetBoard, slotIndex })
  }

  function saveRecentAsButton(r: Recent) {
    const cell: Cell = { id: uid(), label: r.text, wordClass: 'social', image: r.tokens.find((t) => t.image)?.image }
    if (boardId === 'home') {
      const free = home.layouts?.[size].findIndex((id) => id === null) ?? -1
      if (free < 0) {
        setToast('No hay casillas libres en Inicio')
        return
      }
      updateBoard('home', (b) => ({
        ...b,
        cells: [...b.cells, cell],
        layouts: { ...b.layouts!, [size]: b.layouts![size].map((id, i) => (i === free ? cell.id : id)) },
      }))
    } else {
      updateBoard(boardId, (b) => ({ ...b, cells: [...b.cells, cell] }))
    }
    setToast(`Guardado en «${board.name}»`)
    setPanel(null)
  }

  function toggleEditing() {
    if (settings.lockEditing && !editing) {
      setToast('Mantén presionado «Editar» para editar')
      return
    }
    setEditing(!editing)
  }

  async function doLogout() {
    const sync = syncRef.current
    if (!sync || !data) return onLogout()
    window.clearTimeout(saveTimer.current)
    await sync.change(data)
    const saved = await sync.flush()
    if (!saved && !confirm('Hay cambios que todavía no llegan al servidor (no hay conexión). Si cierras sesión ahora se perderán. ¿Cerrar sesión igual?'))
      return
    await sync.forget()
    syncRef.current = null
    await logout()
    onLogout()
  }

  async function doChangePassword() {
    const current = prompt('Contraseña actual:')
    if (current === null) return
    const password = prompt('Nueva contraseña (mínimo 6 caracteres):')
    if (password === null) return
    try {
      await changePassword(current, password)
      setToast('Contraseña cambiada')
    } catch (err) {
      alert(err instanceof TypeError ? 'No hay conexión con el servidor.' : (err as Error).message)
    }
  }

  backRef.current = () => {
    if (formsCell) setFormsCell(null)
    else if (editor) setEditor(null)
    else if (panel) setPanel(null)
    else if (popup) setPopup(null)
    else if (guide) setGuide(null)
    else if (mode === 'keyboard') setMode('grid')
    else if (stack.length > 1) setStack(stack.slice(0, -1))
    else NativeApp.minimizeApp()
  }

  const predictions = mode === 'keyboard' ? predict(draft, vocabWords, data.learned) : []
  const subject = subjectOf(baseTokens)

  return (
    <div className="app">
      <MessageBar tokens={tokens} draft={draft} faded={spoken && settings.clearAfterSpeak} onSpeak={speakMessage} onBackspace={backspace} onClear={clearMessage} />

      <header className="toolbar">
        <img className="tool-spacer brand-mark" src="./brand/kuentu-small.svg" alt="" aria-hidden="true" />
        {editing && boardId !== 'home' ? (
          <input
            className="board-title-input"
            value={board.name}
            onChange={(e) => updateBoard(boardId, (b) => ({ ...b, name: e.target.value }))}
            aria-label="Nombre del tablero"
          />
        ) : (
          <h1 className="board-title">{mode === 'keyboard' ? 'Teclado' : board.name}</h1>
        )}
        <button type="button" className="tool" onClick={() => setPanel('recents')} aria-label="Recientes" title="Recientes">
          <svg viewBox="0 0 24 24" className="tool-svg" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7v5l3.5 2" />
          </svg>
        </button>
      </header>

      {editing && (
        <div className="banner banner-edit">
          Modo edición: toca un botón para cambiarlo, o un «+» para agregar.
          <button type="button" className="btn btn-small" onClick={() => setEditing(false)}>
            Listo
          </button>
        </div>
      )}
      {guide && !editing && (
        <div className="banner banner-guide">
          Toca el botón resaltado para llegar a «{guide.label}».
          <button type="button" className="btn btn-small" onClick={() => setGuide(null)}>
            Cancelar
          </button>
        </div>
      )}

      <main className="main">
        {mode === 'grid' ? (
          <BoardGrid
            layout={layout}
            showLabels={settings.showLabels}
            editing={editing}
            guideTarget={guideTarget}
            onTap={onCellTap}
            onLongPress={onCellLongPress}
            onMore={() => setPages((p) => ({ ...p, [boardId]: (Math.min(page, layout.pages - 1) + 1) % layout.pages }))}
            onAdd={(slotIndex) => newCell(boardId, boardId === 'home' ? slotIndex : undefined)}
          />
        ) : (
          <Keyboard
            draft={draft}
            predictions={predictions}
            onKey={(k) => {
              if (spoken && settings.clearAfterSpeak) {
                setTokens([])
                setSpoken(false)
              }
              setDraft(draft + k)
            }}
            onBackspace={backspace}
            onSpace={() => commitDraft()}
            onPredict={(w) => {
              commitDraft(w)
              speak(w, settings)
            }}
            onPhrase={(text) => {
              addToken({ text })
            }}
          />
        )}
      </main>

      {popupBoard && (
        <PopupBoard
          board={popupBoard}
          showLabels={settings.showLabels}
          editing={editing}
          guideTarget={popupGuideTarget}
          onTap={onCellTap}
          onLongPress={onCellLongPress}
          onAdd={() => newCell(popupBoard.id)}
          onClose={() => setPopup(null)}
        />
      )}

      {formsCell && (
        <FormsPopup
          cell={formsCell}
          subject={formsCell.wordClass === 'verb' ? subject : null}
          onClose={() => setFormsCell(null)}
          onPick={(text) => {
            setTokens([...baseTokens, { text, image: formsCell.image }])
            setSpoken(false)
            if (settings.speakOnTap) speak(text, settings)
            setFormsCell(null)
            if (popup) setPopup(null)
          }}
        />
      )}

      {editor && (
        <CellEditor
          key={editor.cell.id}
          cell={editor.cell}
          isNew={editor.isNew}
          boards={data.boards}
          currentBoardId={editor.boardId}
          onSave={(cell, folderName) => saveCell(editor, cell, folderName)}
          onDelete={() => deleteCell(editor)}
          onMove={(delta) => moveCell(editor, delta)}
          onClose={() => setEditor(null)}
        />
      )}

      {panel === 'settings' && (
        <SettingsPanel
          data={data}
          account={account}
          syncStatus={syncStatus}
          onLogout={doLogout}
          onChangePassword={doChangePassword}
          onOpenAdmin={() => setPanel('admin')}
          onLogin={onLogin}
          onChange={updateSettings}
          onReplaceData={(d) => {
            setData(d)
            goHome()
            setPanel(null)
          }}
          onReset={() => {
            setData({ ...data, boards: defaultBoards() })
            goHome()
            setPanel(null)
          }}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === 'admin' && account && <AdminPanel me={account} onClose={() => setPanel('settings')} />}

      {panel === 'search' && <SearchPanel boards={data.boards} size={size} onPick={startGuide} onClose={() => setPanel(null)} />}

      {panel === 'recents' && (
        <RecentsPanel
          recents={data.recents}
          onPick={(r) => {
            setTokens(r.tokens)
            setDraft('')
            speak(r.text, settings)
            setSpoken(true)
            setPanel(null)
          }}
          onSaveAsButton={saveRecentAsButton}
          onClear={() => setData({ ...data, recents: [] })}
          onClose={() => setPanel(null)}
        />
      )}

      <BottomNav
        atHome={stack.length === 1 && !popup}
        keyboard={mode === 'keyboard'}
        editing={editing}
        lockEditing={settings.lockEditing}
        onHome={goHomeScreen}
        onBack={goBack}
        onKeyboard={() => setMode(mode === 'grid' ? 'keyboard' : 'grid')}
        onEdit={toggleEditing}
        onUnlockEdit={() => setEditing(true)}
        onSearch={() => setPanel('search')}
        onSettings={() => setPanel('settings')}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
