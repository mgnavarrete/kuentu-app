/** Categoría gramatical: define el color del botón y las formas al mantener presionado. */
export type WordClass =
  | 'pron'
  | 'verb'
  | 'adj'
  | 'adv'
  | 'noun'
  | 'det'
  | 'prep'
  | 'conj'
  | 'quest'
  | 'social'
  | 'neg'
  | 'misc'

export type Gender = 'm' | 'f'

export type GridSize = 'grande' | 'mediano' | 'chico'

export interface Cell {
  id: string
  label: string
  /** Texto que se pronuncia si es distinto de la etiqueta. */
  speak?: string
  wordClass: WordClass
  /** "arasaac:<id>" o una imagen propia como data URL. */
  image?: string
  /** Si existe, el botón es una carpeta que abre este tablero. */
  folder?: string
  /** Color de fondo personalizado; si no, se usa el de la categoría. */
  color?: string
  hidden?: boolean
  /** Género del sustantivo (si no está, se deduce). */
  gender?: Gender
  /** Otras palabras para encontrarlo con el buscador (ej. "aguacate" para "palta"). */
  keywords?: string
  /** Sección dentro de un tablero emergente (Palabritas, Preguntas). */
  section?: string
}

export interface Board {
  id: string
  name: string
  cells: Cell[]
  /** Se abre como ventana emergente sobre la pantalla actual. */
  popup?: boolean
  /** Solo Inicio: qué celda va en cada casilla, por tamaño (null = casilla vacía). */
  layouts?: Record<GridSize, (string | null)[]>
}

export interface Token {
  text: string
  image?: string
}

export interface Recent {
  text: string
  tokens: Token[]
  at: number
}

export interface Settings {
  voiceURI: string
  rate: number
  pitch: number
  /** 'auto' elige según el tamaño de la pantalla. */
  gridSize: GridSize | 'auto'
  showLabels: boolean
  speakOnTap: boolean
  smartGrammar: boolean
  /** Borra el mensaje al tocar el siguiente botón después de decirlo. */
  clearAfterSpeak: boolean
  /** Vuelve a Inicio después de elegir una palabra dentro de una carpeta. */
  returnHome: boolean
  lockEditing: boolean
  /** Para elegir solo la forma correcta del adjetivo: "estoy cansado/cansada". */
  userGender: Gender
}

export interface AppData {
  version: 2
  boards: Record<string, Board>
  settings: Settings
  /** Palabras escritas con el teclado y cuántas veces se usaron (para la predicción). */
  learned: Record<string, number>
  recents: Recent[]
}
