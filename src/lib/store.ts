import { FOLDERS, HOME_WORDS, MORE_FOLDERS, parseList, type ParsedEntry } from '../data/vocabulario'
import { HOME_LAYOUT } from '../data/layouts'
import pictos from '../data/pictos.json'
import overrides from '../data/picto-overrides.json'
import bundled from '../data/bundled-pictos.json'
import type { AppData, Board, Cell, GridSize, Settings, WordClass } from './types'

/** Pictogramas incluidos en la app (public/pictos): funcionan sin internet. */
const bundledIds = new Set(bundled as number[])
const pictoIds = { ...(pictos as Record<string, number>), ...(overrides as Record<string, number | null | string>) }

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function defaultSettings(): Settings {
  return {
    voiceURI: '',
    rate: 1,
    pitch: 1,
    gridSize: 'auto',
    showLabels: true,
    speakOnTap: true,
    smartGrammar: true,
    clearAfterSpeak: true,
    returnHome: false,
    lockEditing: false,
    userGender: 'm',
  }
}

/** Tamaño de cuadrícula según la pantalla, si el ajuste está en "auto". */
export function resolveGridSize(setting: Settings['gridSize'], width: number, height: number): GridSize {
  if (setting !== 'auto') return setting
  if (width < 600 && height > width) return 'chico'
  if (width < 1000 || height < 600) return 'mediano'
  return 'grande'
}

function picto(label: string): string | undefined {
  const id = pictoIds[label.toLowerCase()]
  return typeof id === 'number' ? `arasaac:${id}` : undefined
}

function wordCell(e: ParsedEntry, cls: WordClass, idPrefix: string, section?: string): Cell {
  const isPhrase = e.label.includes(' ') && cls !== 'verb' && cls !== 'noun'
  return {
    id: `${idPrefix}-${slug(e.label)}-${uid().slice(0, 4)}`,
    label: e.label,
    speak: /…/.test(e.label) ? e.label.replace(/…/g, '').trim() : undefined,
    wordClass: e.cls ?? (isPhrase && cls === 'adj' ? 'social' : cls),
    image: picto(e.label),
    keywords: e.alt,
    section,
  }
}

function folderCell(id: string, name: string, boardId: string): Cell {
  return { id, label: name, wordClass: 'misc', folder: boardId, image: picto(name) }
}

export function defaultBoards(): Record<string, Board> {
  const boards: Record<string, Board> = {}

  // Inicio: palabras núcleo + una carpeta por cada tema; las posiciones vienen de layouts.ts.
  const homeCells: Cell[] = []
  const byLabel = new Map<string, string>()
  for (const [cls, list] of Object.entries(HOME_WORDS) as [WordClass, string][]) {
    for (const e of parseList(list)) {
      const cell = wordCell(e, cls, 'h')
      homeCells.push(cell)
      byLabel.set(e.label, cell.id)
    }
  }
  for (const f of FOLDERS) {
    const cell = folderCell(`hf-${f.id}`, f.name, f.id)
    homeCells.push(cell)
    byLabel.set(`📁${f.id}`, cell.id)
  }
  const more = folderCell('hf-mas', 'Más…', 'mas')
  more.image = picto('más carpetas')
  homeCells.push(more)
  byLabel.set('📁mas', more.id)

  const layouts = {} as Record<GridSize, (string | null)[]>
  for (const [size, labels] of Object.entries(HOME_LAYOUT) as [GridSize, string[]][]) {
    layouts[size] = labels.map((l) => (l ? byLabel.get(l) ?? null : null))
  }
  boards.home = { id: 'home', name: 'Inicio', cells: homeCells, layouts }

  // Carpetas temáticas. Si tienen varios grupos, cada grupo es una subcarpeta (salvo las emergentes).
  for (const f of FOLDERS) {
    const starters = f.starters ? parseList(f.starters).map((e) => wordCell(e, 'social', f.id)) : []
    if (f.popup) {
      const cells = f.groups.flatMap((g) => parseList(g.words).map((e) => wordCell(e, g.cls, f.id, g.name)))
      boards[f.id] = { id: f.id, name: f.name, cells, popup: true }
    } else if (f.groups.length === 1) {
      const g = f.groups[0]
      boards[f.id] = { id: f.id, name: f.name, cells: [...starters, ...parseList(g.words).map((e) => wordCell(e, g.cls, f.id))] }
    } else {
      const subfolders: Cell[] = []
      for (const g of f.groups) {
        const id = `${f.id}/${slug(g.name)}`
        boards[id] = { id, name: g.name, cells: parseList(g.words).map((e) => wordCell(e, g.cls, id)) }
        const cell = folderCell(`sf-${slug(id)}`, g.name, id)
        cell.image = picto(g.name)
        subfolders.push(cell)
      }
      boards[f.id] = { id: f.id, name: f.name, cells: [...starters, ...subfolders] }
    }
  }

  boards.mas = {
    id: 'mas',
    name: 'Más carpetas',
    cells: MORE_FOLDERS.map((id) => folderCell(`mf-${id}`, FOLDERS.find((f) => f.id === id)!.name, id)),
  }
  return boards
}

export function defaultData(): AppData {
  return { version: 2, boards: defaultBoards(), settings: defaultSettings(), learned: {}, recents: [] }
}

export function imageUrl(image: string | undefined): string | undefined {
  if (!image) return undefined
  if (image.startsWith('arasaac:')) {
    const id = image.slice('arasaac:'.length)
    if (bundledIds.has(Number(id))) return `pictos/${id}.png`
    return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`
  }
  return image
}

// --- Persistencia en IndexedDB (las fotos propias pueden ser grandes para localStorage) ---

// Se mantiene el nombre original de la base para no perder los datos ya guardados.
const DB_NAME = 'habla'
const STORE = 'kv'
// Sin cuenta se usa 'data'; con cuenta, una copia local por usuario ('user:<id>').
const LOCAL_KEY = 'data'
export const accountKey = (id: number) => `user:${id}`

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** ¿Es un AppData que la app sabe abrir? (respaldo, servidor o copia local) */
export function isAppData(data: unknown): data is AppData {
  const d = data as AppData | null
  return d?.version === 2 && Array.isArray(d.boards?.home?.cells)
}

export function withDefaults(data: AppData): AppData {
  return { ...data, settings: { ...defaultSettings(), ...data.settings }, learned: data.learned ?? {}, recents: data.recents ?? [] }
}

/** Copia guardada en este dispositivo, o null si no hay. */
export async function loadLocal(key = LOCAL_KEY): Promise<AppData | null> {
  try {
    const db = await openDb()
    const data = await new Promise<AppData | undefined>((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result as AppData | undefined)
      req.onerror = () => reject(req.error)
    })
    // Los datos de la versión 1 tenían otro vocabulario: se parte con el nuevo.
    if (isAppData(data)) return withDefaults(data)
  } catch (err) {
    console.warn('No se pudo leer el almacenamiento local', err)
  }
  return null
}

export async function loadData(key = LOCAL_KEY): Promise<AppData> {
  return (await loadLocal(key)) ?? defaultData()
}

export async function saveData(data: AppData, key = LOCAL_KEY): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(data, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('No se pudo guardar', err)
  }
}

/** Valor suelto en el almacenamiento local (p. ej. el estado de sincronización). */
export async function kvGet<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openDb()
    return await new Promise<T | undefined>((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result as T | undefined)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return undefined
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      if (value === undefined) tx.objectStore(STORE).delete(key)
      else tx.objectStore(STORE).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('No se pudo guardar', err)
  }
}

export function exportBackup(data: AppData): void {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `kuentu-respaldo-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

export async function importBackup(file: File): Promise<AppData> {
  const data = JSON.parse(await file.text()) as AppData
  if (!isAppData(data)) throw new Error('El archivo no es un respaldo válido de Kuentu.')
  return withDefaults(data)
}
