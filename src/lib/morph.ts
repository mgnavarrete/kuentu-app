// Morfología del español para CAA: conjugación, mandatos con pronombres, género y número.
// Personas: 0 yo, 1 tú, 2 él/ella/usted, 3 nosotros, 4 ellos/ustedes (sin vosotros).

import type { Gender, Token, WordClass } from './types'

type Forms = [string, string, string, string, string]
const PERSONS = [0, 1, 2, 3, 4] as const

export const PERSON_LABELS = ['yo', 'tú', 'él / ella', 'nosotros', 'ellos']
const REFLEXIVE = ['me', 'te', 'se', 'nos', 'se']
const IO_PRONOUN = ['me', 'te', 'le', 'nos', 'les']

const PRONOUN_PERSON: Record<string, number> = {
  yo: 0, 'tú': 1, tu: 1, vos: 1, 'él': 2, ella: 2, usted: 2, eso: 2, esto: 2, aquello: 2,
  nosotros: 3, nosotras: 3, ellos: 4, ellas: 4, ustedes: 4,
}

// ---------------------------------------------------------------------------
// Tablas de verbos irregulares (solo lo que no sale por regla)

const PRESENT: Record<string, Forms> = {
  ser: ['soy', 'eres', 'es', 'somos', 'son'],
  estar: ['estoy', 'estás', 'está', 'estamos', 'están'],
  ir: ['voy', 'vas', 'va', 'vamos', 'van'],
  haber: ['he', 'has', 'ha', 'hemos', 'han'],
  tener: ['tengo', 'tienes', 'tiene', 'tenemos', 'tienen'],
  venir: ['vengo', 'vienes', 'viene', 'venimos', 'vienen'],
  decir: ['digo', 'dices', 'dice', 'decimos', 'dicen'],
  hacer: ['hago', 'haces', 'hace', 'hacemos', 'hacen'],
  poner: ['pongo', 'pones', 'pone', 'ponemos', 'ponen'],
  salir: ['salgo', 'sales', 'sale', 'salimos', 'salen'],
  traer: ['traigo', 'traes', 'trae', 'traemos', 'traen'],
  caer: ['caigo', 'caes', 'cae', 'caemos', 'caen'],
  'oír': ['oigo', 'oyes', 'oye', 'oímos', 'oyen'],
  ver: ['veo', 'ves', 've', 'vemos', 'ven'],
  dar: ['doy', 'das', 'da', 'damos', 'dan'],
  saber: ['sé', 'sabes', 'sabe', 'sabemos', 'saben'],
  'reír': ['río', 'ríes', 'ríe', 'reímos', 'ríen'],
  'sonreír': ['sonrío', 'sonríes', 'sonríe', 'sonreímos', 'sonríen'],
  'freír': ['frío', 'fríes', 'fríe', 'freímos', 'fríen'],
  oler: ['huelo', 'hueles', 'huele', 'olemos', 'huelen'],
}

const PAST: Record<string, Forms> = {
  ser: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'],
  ir: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'],
  estar: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvieron'],
  tener: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvieron'],
  andar: ['anduve', 'anduviste', 'anduvo', 'anduvimos', 'anduvieron'],
  haber: ['hube', 'hubiste', 'hubo', 'hubimos', 'hubieron'],
  querer: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisieron'],
  poder: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudieron'],
  poner: ['puse', 'pusiste', 'puso', 'pusimos', 'pusieron'],
  saber: ['supe', 'supiste', 'supo', 'supimos', 'supieron'],
  hacer: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicieron'],
  venir: ['vine', 'viniste', 'vino', 'vinimos', 'vinieron'],
  decir: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijeron'],
  traer: ['traje', 'trajiste', 'trajo', 'trajimos', 'trajeron'],
  conducir: ['conduje', 'condujiste', 'condujo', 'condujimos', 'condujeron'],
  dar: ['di', 'diste', 'dio', 'dimos', 'dieron'],
  ver: ['vi', 'viste', 'vio', 'vimos', 'vieron'],
  'reír': ['reí', 'reíste', 'rio', 'reímos', 'rieron'],
  'sonreír': ['sonreí', 'sonreíste', 'sonrió', 'sonreímos', 'sonrieron'],
  'freír': ['freí', 'freíste', 'frio', 'freímos', 'frieron'],
}

const IMPERFECT: Record<string, Forms> = {
  ser: ['era', 'eras', 'era', 'éramos', 'eran'],
  ir: ['iba', 'ibas', 'iba', 'íbamos', 'iban'],
  ver: ['veía', 'veías', 'veía', 'veíamos', 'veían'],
}

const SUBJUNCTIVE: Record<string, Forms> = {
  ser: ['sea', 'seas', 'sea', 'seamos', 'sean'],
  ir: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayan'],
  estar: ['esté', 'estés', 'esté', 'estemos', 'estén'],
  dar: ['dé', 'des', 'dé', 'demos', 'den'],
  saber: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepan'],
  haber: ['haya', 'hayas', 'haya', 'hayamos', 'hayan'],
}

const FUTURE_STEM: Record<string, string> = {
  tener: 'tendr', querer: 'querr', poder: 'podr', hacer: 'har', venir: 'vendr', decir: 'dir',
  saber: 'sabr', poner: 'pondr', salir: 'saldr', haber: 'habr', valer: 'valdr',
}

const IMPERATIVE_TU: Record<string, string> = {
  ser: 'sé', ir: 've', tener: 'ten', hacer: 'haz', poner: 'pon', venir: 'ven', decir: 'di', salir: 'sal',
}

const PARTICIPLE: Record<string, string> = {
  hacer: 'hecho', decir: 'dicho', ver: 'visto', poner: 'puesto', escribir: 'escrito', abrir: 'abierto',
  romper: 'roto', volver: 'vuelto', devolver: 'devuelto', morir: 'muerto', cubrir: 'cubierto',
  resolver: 'resuelto', 'freír': 'frito', imprimir: 'impreso',
}

const GERUND: Record<string, string> = { ir: 'yendo', poder: 'pudiendo', decir: 'diciendo', venir: 'viniendo' }

/** Verbos con cambio de raíz: e→ie, o→ue, e→i, u→ue. */
const STEM_CHANGE: Record<string, 'ie' | 'ue' | 'i'> = {}
const addStem = (kind: 'ie' | 'ue' | 'i', list: string) => list.split(' ').forEach((v) => (STEM_CHANGE[v] = kind))
addStem('ie', 'querer pensar cerrar empezar comenzar despertar sentar sentir entender perder encender calentar ' +
  'preferir mentir divertir regar fregar tener venir nevar merendar')
addStem('ue', 'poder dormir morir volver devolver encontrar contar recordar acordar acostar probar mover llover ' +
  'costar doler morder soñar volar mostrar sonar almorzar colgar jugar')
addStem('i', 'pedir vestir repetir servir seguir elegir despedir medir')

/** Verbos -iar / -uar que llevan tilde: vacío, envío, continúo. */
const ACCENT_STEM = new Set(['vaciar', 'enviar', 'confiar', 'enfriar', 'continuar', 'actuar', 'resfriar'])

/** Verbos "como gustar": me gusta, te duele, nos encanta. */
const GUSTAR_LIKE = new Set(['gustar', 'encantar', 'doler', 'molestar', 'importar', 'interesar', 'faltar', 'picar'])

/** Verbos a los que se les ofrecen mandatos con pronombres (dame, dámelo, ayúdame). */
const CLITIC_ME = new Set(
  ('dar decir ayudar mostrar traer pasar prestar poner sacar llevar buscar esperar mirar escuchar abrazar explicar ' +
    'enseñar contar leer comprar abrir cerrar hacer tomar agarrar devolver cuidar despertar llamar dejar soltar ' +
    'tocar cambiar limpiar servir avisar acompañar empujar subir bajar').split(' '),
)
const CLITIC_MELO = new Set('dar decir traer pasar prestar mostrar explicar contar devolver comprar'.split(' '))

const REGULAR_PRESENT: Record<string, Forms> = {
  ar: ['o', 'as', 'a', 'amos', 'an'],
  er: ['o', 'es', 'e', 'emos', 'en'],
  ir: ['o', 'es', 'e', 'imos', 'en'],
}
const REGULAR_PAST: Record<string, Forms> = {
  ar: ['é', 'aste', 'ó', 'amos', 'aron'],
  er: ['í', 'iste', 'ió', 'imos', 'ieron'],
  ir: ['í', 'iste', 'ió', 'imos', 'ieron'],
}
const FUTURE_ENDINGS: Forms = ['é', 'ás', 'á', 'emos', 'án']

// ---------------------------------------------------------------------------
// Utilidades

const ACCENTED: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' }
const UNACCENTED: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }

function split(verb: string): [string, 'ar' | 'er' | 'ir'] | null {
  const m = verb.match(/^(.*)(ar|er|ir|ír)$/)
  if (!m) return null
  return [m[1], m[2] === 'ír' ? 'ir' : (m[2] as 'ar' | 'er' | 'ir')]
}

/** Cambia la última vocal e/o/u de la raíz: quer → quier, dorm → duerm, ped → pid. */
function changeStem(stem: string, kind: 'ie' | 'ue' | 'i' | 'shift'): string {
  if (stem === 'jug') return 'jueg'
  for (let i = stem.length - 1; i >= 0; i--) {
    const c = stem[i]
    if (kind === 'ie' && c === 'e') return stem.slice(0, i) + 'ie' + stem.slice(i + 1)
    if (kind === 'ue' && c === 'o') return stem.slice(0, i) + 'ue' + stem.slice(i + 1)
    if (kind === 'i' && c === 'e') return stem.slice(0, i) + 'i' + stem.slice(i + 1)
    if (kind === 'shift' && (c === 'e' || c === 'o')) return stem.slice(0, i) + (c === 'e' ? 'i' : 'u') + stem.slice(i + 1)
  }
  return stem
}

function accentLastVowel(stem: string): string {
  for (let i = stem.length - 1; i >= 0; i--) {
    if (stem[i] === 'i' || stem[i] === 'u') return stem.slice(0, i) + ACCENTED[stem[i]] + stem.slice(i + 1)
  }
  return stem
}

/** Ortografía antes de e: busc → busqu, jug → jugu, empez → empec. */
function orthoBeforeE(stem: string): string {
  if (stem.endsWith('c')) return stem.slice(0, -1) + 'qu'
  if (stem.endsWith('g')) return stem + 'u'
  if (stem.endsWith('z')) return stem.slice(0, -1) + 'c'
  return stem
}

// --- Acentuación para pegar pronombres (dame, dámelo, ayúdame) ---

function isVowelAt(w: string, i: number): boolean {
  const c = w[i]
  if (!'aeiouáéíóúü'.includes(c)) return false
  // La u de "que", "qui", "gue", "gui" no suena.
  if (c === 'u' && i > 0 && (w[i - 1] === 'q' || w[i - 1] === 'g') && 'eiéí'.includes(w[i + 1] ?? '')) return false
  return true
}

/** Índices de la vocal principal de cada sílaba. */
function nuclei(w: string): number[] {
  const out: number[] = []
  let i = 0
  while (i < w.length) {
    if (!isVowelAt(w, i)) {
      i++
      continue
    }
    let j = i
    while (j + 1 < w.length && isVowelAt(w, j + 1)) j++
    // Dentro del grupo de vocales: dos vocales fuertes (o una con tilde) forman sílabas distintas.
    let start = i
    for (let k = i; k <= j; k++) {
      const strongOrAccent = (ch: string) => 'aeoáéóíú'.includes(ch)
      if (k + 1 <= j && strongOrAccent(w[k]) && strongOrAccent(w[k + 1])) {
        out.push(pickNucleus(w, start, k))
        start = k + 1
      }
    }
    out.push(pickNucleus(w, start, j))
    i = j + 1
  }
  return out
}

function pickNucleus(w: string, a: number, b: number): number {
  for (let k = a; k <= b; k++) if ('áéíóú'.includes(w[k])) return k
  for (let k = a; k <= b; k++) if ('aeo'.includes(w[k])) return k
  return b
}

function stressedIndex(w: string): number {
  const accented = [...w].findIndex((c) => 'áéíóú'.includes(c))
  if (accented >= 0) return accented
  const n = nuclei(w)
  if (n.length === 0) return -1
  if (n.length === 1) return n[0]
  return /[aeiouns]$/.test(w) ? n[n.length - 2] : n[n.length - 1]
}

/** Pega pronombres al final y pone tilde si hace falta: ayuda + me → ayúdame. */
export function attachClitics(form: string, clitics: string): string {
  const stress = stressedIndex(form)
  const plain = [...form].map((c) => UNACCENTED[c] ?? c).join('')
  const joined = plain + clitics
  const natural = stressedIndex(joined)
  if (stress < 0 || natural === stress) return joined
  return joined.slice(0, stress) + (ACCENTED[joined[stress]] ?? joined[stress]) + joined.slice(stress + 1)
}

// ---------------------------------------------------------------------------
// Conjugación

export function isVerb(word: string): boolean {
  return /^[a-záéíóúñü]*(ar|er|ir|ír)$/.test(word)
}

export interface ParsedVerb {
  verb: string
  reflexive: boolean
  /** Resto de la expresión: "ir al baño" → "al baño". */
  tail: string
}

/** "bañar(se)" → bañar reflexivo; "cepillar(se) los dientes" → cepillar + "los dientes". */
export function parseVerb(label: string): ParsedVerb | null {
  const [first, ...rest] = label.trim().toLowerCase().split(/\s+/)
  const m = first.match(/^(.*?(?:ar|er|ir|ír))(\(se\)|se)?$/)
  if (!m || !isVerb(m[1])) return null
  return { verb: m[1], reflexive: !!m[2], tail: rest.join(' ') }
}

export function present(verb: string): Forms | null {
  if (PRESENT[verb]) return PRESENT[verb]
  const parts = split(verb)
  if (!parts) return null
  const [stem, type] = parts
  const endings = REGULAR_PRESENT[type]
  const sc = STEM_CHANGE[verb]
  let changed = sc ? changeStem(stem, sc) : stem
  if (ACCENT_STEM.has(verb)) changed = accentLastVowel(stem)
  const forms = endings.map((e, i) => (i === 3 ? stem : changed) + e) as Forms

  if (/uir$/.test(verb) && !/guir$/.test(verb)) {
    // construir → construyo, construyes…
    return endings.map((e, i) => (i === 3 ? stem + e : stem + 'y' + e)) as Forms
  }
  if (/[aeiou]cer$|ucir$/.test(verb)) forms[0] = stem.slice(0, -1) + 'zco'
  else if (/(ger|gir)$/.test(verb)) forms[0] = changed.slice(0, -1) + 'jo'
  else if (/guir$/.test(verb)) forms[0] = changed.slice(0, -2) + 'go'
  return forms
}

export function past(verb: string): Forms | null {
  if (PAST[verb]) return PAST[verb]
  const parts = split(verb)
  if (!parts) return null
  const [stem, type] = parts
  const forms = REGULAR_PAST[type].map((e) => stem + e) as Forms
  if (type === 'ar') {
    forms[0] = orthoBeforeE(stem) + 'é'
    return forms
  }
  if (/uir$/.test(verb) && !/guir$/.test(verb)) return ['í', 'iste', 'yó', 'imos', 'yeron'].map((e) => stem + e) as Forms
  if (/[aeo]$/.test(stem)) return ['í', 'íste', 'yó', 'ímos', 'yeron'].map((e) => stem + e) as Forms // leer → leyó
  if (/ducir$/.test(verb)) return ['je', 'jiste', 'jo', 'jimos', 'jeron'].map((e) => stem.slice(0, -1) + e) as Forms
  if (type === 'ir' && STEM_CHANGE[verb]) {
    const shifted = changeStem(stem, 'shift')
    forms[2] = shifted + 'ió'
    forms[4] = shifted + 'ieron'
  }
  return forms
}

export function imperfect(verb: string): Forms | null {
  if (IMPERFECT[verb]) return IMPERFECT[verb]
  const parts = split(verb)
  if (!parts) return null
  const [stem, type] = parts
  const endings = type === 'ar' ? ['aba', 'abas', 'aba', 'ábamos', 'aban'] : ['ía', 'ías', 'ía', 'íamos', 'ían']
  return endings.map((e) => stem + e) as Forms
}

export function future(verb: string): Forms | null {
  if (!split(verb)) return null
  const stem = FUTURE_STEM[verb] ?? verb.replace(/ír$/, 'ir')
  return FUTURE_ENDINGS.map((e) => stem + e) as Forms
}

export function subjunctive(verb: string): Forms | null {
  if (SUBJUNCTIVE[verb]) return SUBJUNCTIVE[verb]
  const parts = split(verb)
  const pres = present(verb)
  if (!parts || !pres) return null
  const [stem, type] = parts
  const yoStem = pres[0].replace(/o$/, '')
  const endings: Forms = type === 'ar' ? ['e', 'es', 'e', 'emos', 'en'] : ['a', 'as', 'a', 'amos', 'an']
  const base = type === 'ar' ? orthoBeforeE(yoStem) : yoStem
  const forms = endings.map((e) => base + e) as Forms
  if (STEM_CHANGE[verb] && !PRESENT[verb]) {
    const nosStem = type === 'ir' ? changeStem(stem, 'shift') : stem
    forms[3] = (type === 'ar' ? orthoBeforeE(nosStem) : nosStem) + endings[3]
  }
  return forms
}

export function gerund(verb: string): string | null {
  if (GERUND[verb]) return GERUND[verb]
  const parts = split(verb)
  if (!parts) return null
  const [stem, type] = parts
  if (type === 'ar') return stem + 'ando'
  if (verb.endsWith('eír')) return stem.slice(0, -1) + 'iendo' // riendo
  if (/[aeiou]$/.test(stem) || (/uir$/.test(verb) && !/guir$/.test(verb))) return stem + 'yendo' // leyendo, construyendo
  if (type === 'ir' && STEM_CHANGE[verb]) return changeStem(stem, 'shift') + 'iendo'
  return stem + 'iendo'
}

export function participle(verb: string): string | null {
  if (PARTICIPLE[verb]) return PARTICIPLE[verb]
  const parts = split(verb)
  if (!parts) return null
  const [stem, type] = parts
  if (type === 'ar') return stem + 'ado'
  return stem + (/[aeo]$/.test(stem) ? 'ído' : 'ido')
}

export function imperativeTu(verb: string): string | null {
  if (IMPERATIVE_TU[verb]) return IMPERATIVE_TU[verb]
  return present(verb)?.[2] ?? null
}

// ---------------------------------------------------------------------------
// Sustantivos y adjetivos

const FEMININE = new Set(
  ('mano foto moto radio flor luz nariz sal piel leche nieve carne noche tarde gente fiebre sangre tos nube miel ' +
    'llave calle clase muerte suerte fuente frente parte vez voz cruz paz raíz coliflor imagen sed hambre red pared ' +
    'sartén cárcel lombriz torre ave agua águila hacha aula alma área').split(' '),
)
const MASCULINE = new Set(
  ('día mapa sofá problema idioma planeta tema programa papá pijama clima sistema tranvía dentista poeta ' +
    'cometa guardia policía dólar sillón pie tata').split(' '),
)
/** Femeninos que llevan "el" en singular: el agua, el águila. */
const EL_FEMININE = new Set(['agua', 'águila', 'hacha', 'aula', 'alma', 'área', 'hambre', 'ave'])

export function nounGender(label: string, override?: Gender): Gender {
  if (override) return override
  const w = label.toLowerCase().split(' ')[0]
  if (FEMININE.has(w)) return 'f'
  if (MASCULINE.has(w)) return 'm'
  if (/(ción|sión|dad|tad|tud|umbre|itis|sis)$/.test(w)) return 'f'
  if (/as?$/.test(w)) return 'f'
  return 'm'
}

export function pluralize(word: string): string {
  const [first, ...rest] = word.split(' ')
  const tail = rest.length ? ' ' + rest.join(' ') : ''
  const w = first
  if (/[sx]$/.test(w)) return word // lunes, tijeras: ya es plural o invariable
  if (/[aeiouáéó]$/.test(w)) return w + 's' + tail
  if (/[íú]$/.test(w)) return w + 's' + tail
  if (w.endsWith('z')) return w.slice(0, -1) + 'ces' + tail
  // Agudas terminadas en n/s/l pierden la tilde: ratón → ratones. Graves en -en la ganan: imagen → imágenes.
  const unaccented = w.replace(/([áéíóú])([nsl])$/, (_, v: string, c: string) => UNACCENTED[v] + c)
  if (unaccented === w && /en$/.test(w) && nuclei(w).length >= 2) return attachClitics(w, 'es') + tail
  return unaccented + 'es' + tail
}

export function articleFor(gender: Gender, plural: boolean, definite: boolean, noun?: string): string {
  if (definite) {
    if (!plural && gender === 'f' && noun && EL_FEMININE.has(noun.toLowerCase())) return 'el'
    return plural ? (gender === 'f' ? 'las' : 'los') : gender === 'f' ? 'la' : 'el'
  }
  if (!plural && gender === 'f' && noun && EL_FEMININE.has(noun.toLowerCase())) return 'un'
  return plural ? (gender === 'f' ? 'unas' : 'unos') : gender === 'f' ? 'una' : 'un'
}

const INVARIABLE = new Set([
  'más', 'menos', 'aquí', 'acá', 'allá', 'allí', 'ahí', 'ahora', 'hoy', 'mañana', 'ayer', 'después', 'antes',
  'temprano', 'tarde', 'bien', 'mal', 'también', 'tampoco', 'muy', 'nunca', 'siempre', 'ya', 'nada', 'algo',
  'arriba', 'abajo', 'adentro', 'afuera', 'cerca', 'lejos', 'luego', 'así', 'casi', 'solo', 'bastante', 'demasiado',
])

const NO_FEMININE = new Set(['mejor', 'peor', 'mayor', 'menor', 'marrón', 'interior', 'exterior', 'anterior', 'superior', 'inferior', 'afín'])

const SHORT_FORM: Record<string, string> = { bueno: 'buen', malo: 'mal', grande: 'gran', primero: 'primer', tercero: 'tercer', alguno: 'algún', ninguno: 'ningún' }
const COMPARATIVE: Record<string, string[]> = {
  bueno: ['mejor', 'mejores'], malo: ['peor', 'peores'], grande: ['más grande', 'mayor'], chico: ['más chico', 'menor'],
  'pequeño': ['más pequeño', 'menor'],
}

/** [masc. sing., fem. sing., masc. pl., fem. pl.] (o [sing., pl.] si no cambia de género). */
export function adjectiveForms(word: string): string[] {
  if (INVARIABLE.has(word) || word.includes(' ')) return [word]
  if (word.endsWith('o')) {
    const base = word.slice(0, -1)
    return [word, base + 'a', word + 's', base + 'as']
  }
  if (/(or|ón|án|ín)$/.test(word) && !NO_FEMININE.has(word)) {
    const fem = word.replace(/([óáí])n$/, (_, v: string) => UNACCENTED[v] + 'n') + 'a'
    return [word, fem, pluralize(word), fem + 's']
  }
  return [word, pluralize(word)]
}

/** Forma del adjetivo según género y número. */
export function inflectAdjective(word: string, gender: Gender, plural: boolean): string {
  const f = adjectiveForms(word.toLowerCase())
  if (f.length === 4) return f[(gender === 'f' ? 1 : 0) + (plural ? 2 : 0)]
  if (f.length === 2) return plural ? f[1] : f[0]
  return word
}

// ---------------------------------------------------------------------------
// Pronombres, artículos, preposiciones

const PRONOUN_FORMS: Record<string, { personal: string[]; possessive?: string[] }> = {
  yo: { personal: ['yo', 'me', 'mí', 'conmigo'], possessive: ['mi', 'mis', 'mío', 'mía', 'míos', 'mías'] },
  'tú': { personal: ['tú', 'te', 'ti', 'contigo'], possessive: ['tu', 'tus', 'tuyo', 'tuya', 'tuyos', 'tuyas'] },
  'él': { personal: ['él', 'lo', 'le', 'se'], possessive: ['su', 'sus', 'suyo', 'suya'] },
  ella: { personal: ['ella', 'la', 'le', 'se'], possessive: ['su', 'sus', 'suya', 'suyo'] },
  usted: { personal: ['usted', 'lo', 'la', 'le', 'se'], possessive: ['su', 'sus', 'suyo', 'suya'] },
  nosotros: { personal: ['nosotros', 'nosotras', 'nos'], possessive: ['nuestro', 'nuestra', 'nuestros', 'nuestras'] },
  ustedes: { personal: ['ustedes', 'los', 'las', 'les', 'se'], possessive: ['su', 'sus', 'suyo', 'suya'] },
  ellos: { personal: ['ellos', 'ellas', 'los', 'las', 'les', 'se'], possessive: ['su', 'sus', 'suyo', 'suya'] },
  eso: { personal: ['eso', 'ese', 'esa', 'esos', 'esas'] },
  esto: { personal: ['esto', 'este', 'esta', 'estos', 'estas'] },
  aquello: { personal: ['aquello', 'aquel', 'aquella', 'aquellos', 'aquellas'] },
}
const ALL_PERSONS = ['yo', 'tú', 'él', 'ella', 'usted', 'nosotros', 'nosotras', 'ustedes', 'ellos', 'ellas']

const SMALL_WORD_FORMS: Record<string, { title: string; forms: string[] }> = {
  el: { title: 'Artículos', forms: ['el', 'la', 'los', 'las', 'lo'] },
  la: { title: 'Artículos', forms: ['el', 'la', 'los', 'las', 'lo'] },
  un: { title: 'Artículos', forms: ['un', 'una', 'unos', 'unas'] },
  una: { title: 'Artículos', forms: ['un', 'una', 'unos', 'unas'] },
  a: { title: 'Formas', forms: ['a', 'al'] },
  de: { title: 'Formas', forms: ['de', 'del'] },
  con: { title: 'Formas', forms: ['con', 'conmigo', 'contigo'] },
  'cuánto': { title: 'Formas', forms: ['cuánto', 'cuánta', 'cuántos', 'cuántas'] },
  'cuál': { title: 'Formas', forms: ['cuál', 'cuáles'] },
  'quién': { title: 'Formas', forms: ['quién', 'quiénes'] },
  hay: { title: 'Formas', forms: ['hay', 'había', 'hubo', 'habrá', 'va a haber', 'no hay'] },
}

// ---------------------------------------------------------------------------
// Ventana de formas

export interface FormItem {
  text: string
  hint?: string
}
export interface FormGroup {
  title: string
  forms: FormItem[]
}
export interface FormOptions {
  negative?: boolean
  /** Persona del sujeto si la última palabra del mensaje es un pronombre. */
  subject?: number | null
}

function personal(verb: ParsedVerb, forms: Forms | null, p: number, negative: boolean): string {
  if (!forms) return ''
  const parts: string[] = []
  if (negative) parts.push('no')
  if (verb.reflexive) parts.push(REFLEXIVE[p])
  parts.push(forms[p])
  if (verb.tail) parts.push(verb.tail)
  return parts.join(' ')
}

function gustarForms(v: ParsedVerb, negative: boolean): FormGroup[] {
  const no = negative ? 'no ' : ''
  const tail = v.tail ? ' ' + v.tail : ''
  const pres = present(v.verb)!
  const pas = past(v.verb)!
  const imp = imperfect(v.verb)!
  return [
    { title: 'Una cosa', forms: IO_PRONOUN.map((p, i) => ({ text: `${no}${p} ${pres[2]}${tail}`, hint: PERSON_LABELS[i] })) },
    { title: 'Varias cosas', forms: IO_PRONOUN.map((p, i) => ({ text: `${no}${p} ${pres[4]}${tail}`, hint: PERSON_LABELS[i] })) },
    { title: 'Pasado', forms: IO_PRONOUN.map((p, i) => ({ text: `${no}${p} ${pas[2]}${tail}`, hint: PERSON_LABELS[i] })) },
    { title: 'Antes', forms: IO_PRONOUN.map((p, i) => ({ text: `${no}${p} ${imp[2]}${tail}`, hint: PERSON_LABELS[i] })) },
  ]
}

function imperativeForms(v: ParsedVerb, negative: boolean): FormItem[] {
  const subj = subjunctive(v.verb)
  const tu = imperativeTu(v.verb)
  if (!subj || !tu) return []
  const tail = v.tail ? ' ' + v.tail : ''
  const items: FormItem[] = []
  if (negative) {
    const refl = (p: number) => (v.reflexive ? REFLEXIVE[p] + ' ' : '')
    items.push({ text: `no ${refl(1)}${subj[1]}${tail}`, hint: 'tú' })
    items.push({ text: `no ${refl(2)}${subj[2]}${tail}`, hint: 'usted' })
    items.push({ text: `no ${refl(3)}${subj[3]}${tail}`, hint: 'nosotros' })
    items.push({ text: `no ${refl(4)}${subj[4]}${tail}`, hint: 'ustedes' })
    if (!v.reflexive && CLITIC_ME.has(v.verb)) {
      items.push({ text: `no me ${subj[1]}${tail}`, hint: 'a mí' })
      items.push({ text: `no lo ${subj[1]}${tail}`, hint: 'eso' })
    }
    return items
  }
  if (v.reflexive) {
    items.push({ text: attachClitics(tu, 'te') + tail, hint: 'tú' })
    items.push({ text: attachClitics(subj[2], 'se') + tail, hint: 'usted' })
    items.push({ text: (v.verb === 'ir' ? 'vámonos' : attachClitics(subj[3].replace(/s$/, ''), 'nos')) + tail, hint: 'nosotros' })
    items.push({ text: attachClitics(subj[4], 'se') + tail, hint: 'ustedes' })
    return items
  }
  items.push({ text: tu + tail, hint: 'tú' })
  items.push({ text: subj[2] + tail, hint: 'usted' })
  items.push({ text: (v.verb === 'ir' ? 'vamos' : subj[3]) + tail, hint: 'nosotros' })
  items.push({ text: subj[4] + tail, hint: 'ustedes' })
  if (CLITIC_ME.has(v.verb)) {
    items.push({ text: attachClitics(tu, 'me') + tail, hint: 'a mí' })
    items.push({ text: attachClitics(tu, 'lo') + tail, hint: 'eso' })
    items.push({ text: attachClitics(tu, 'nos') + tail, hint: 'a nosotros' })
    if (CLITIC_MELO.has(v.verb)) items.push({ text: attachClitics(tu, 'melo') + tail, hint: 'eso a mí' })
  }
  return items
}

function verbGroups(label: string, opts: FormOptions): FormGroup[] {
  const v = parseVerb(label)
  if (!v) return []
  const negative = !!opts.negative
  if (GUSTAR_LIKE.has(v.verb) && !v.reflexive) return gustarForms(v, negative)

  const tenses: [string, Forms | null][] = [
    ['Presente', present(v.verb)],
    ['Pasado', past(v.verb)],
    ['Antes (copretérito)', imperfect(v.verb)],
    ['Futuro', future(v.verb)],
  ]
  const groups: FormGroup[] = []
  if (opts.subject != null) {
    const p = opts.subject
    const ger = gerund(v.verb)
    groups.push({
      title: `Para «${PERSON_LABELS[p]}»`,
      forms: [
        ...tenses.map(([title, forms]) => ({ text: personal(v, forms, p, negative), hint: title.split(' ')[0].toLowerCase() })),
        { text: [negative ? 'no' : '', present('ir')![p], 'a', infinitiveWith(v, p)].filter(Boolean).join(' '), hint: 'voy a…' },
        ...(ger ? [{ text: [negative ? 'no' : '', v.reflexive ? REFLEXIVE[p] : '', present('estar')![p], ger, v.tail].filter(Boolean).join(' '), hint: 'ahora mismo' }] : []),
      ],
    })
  }
  for (const [title, forms] of tenses) {
    groups.push({ title, forms: PERSONS.map((p) => ({ text: personal(v, forms, p, negative), hint: PERSON_LABELS[p] })) })
  }
  groups.push({ title: 'Mandatos', forms: imperativeForms(v, negative) })
  const ger = gerund(v.verb)
  const par = participle(v.verb)
  const tail = v.tail ? ' ' + v.tail : ''
  groups.push({
    title: 'Otras',
    forms: [
      { text: (negative ? 'no ' : '') + v.verb + (v.reflexive ? 'se' : '') + tail, hint: 'infinitivo' },
      ...(ger ? [{ text: (negative ? 'no ' : '') + (v.reflexive ? attachClitics(ger, 'se') : ger) + tail, hint: 'gerundio' }] : []),
      ...(par ? [{ text: par + tail, hint: 'participio' }] : []),
    ],
  })
  return groups
}

function infinitiveWith(v: ParsedVerb, p: number): string {
  return v.verb + (v.reflexive ? REFLEXIVE[p] : '') + (v.tail ? ' ' + v.tail : '')
}

/** Variantes que se ofrecen al mantener presionado un botón. */
export function formGroups(label: string, wordClass: WordClass, opts: FormOptions = {}): FormGroup[] {
  const w = label.toLowerCase().trim()
  if (wordClass === 'verb') return verbGroups(w, opts)

  if (wordClass === 'pron' && PRONOUN_FORMS[w]) {
    const p = PRONOUN_FORMS[w]
    const groups: FormGroup[] = [{ title: 'Formas', forms: p.personal.map((text) => ({ text })) }]
    if (p.possessive) groups.push({ title: 'Mío / tuyo', forms: p.possessive.map((text) => ({ text })) })
    if (PRONOUN_PERSON[w] !== undefined && !['eso', 'esto', 'aquello'].includes(w)) {
      groups.push({ title: 'Otras personas', forms: ALL_PERSONS.map((text) => ({ text })) })
    }
    return groups
  }

  if (SMALL_WORD_FORMS[w]) {
    const s = SMALL_WORD_FORMS[w]
    return [{ title: s.title, forms: s.forms.map((text) => ({ text })) }]
  }

  if (wordClass === 'noun') {
    const plural = pluralize(w)
    const g = nounGender(w)
    const forms: FormItem[] = []
    forms.push({ text: label, hint: 'uno' })
    if (plural !== w) forms.push({ text: plural, hint: 'varios' })
    forms.push({ text: `${articleFor(g, false, true, w)} ${label}` })
    if (plural !== w) forms.push({ text: `${articleFor(g, true, true)} ${plural}` })
    forms.push({ text: `${articleFor(g, false, false, w)} ${label}` })
    if (plural !== w) forms.push({ text: `${articleFor(g, true, false)} ${plural}` })
    return [{ title: 'Formas', forms }]
  }

  if (wordClass === 'adj') {
    const forms = adjectiveForms(w)
    const items: FormItem[] = []
    const hints = forms.length === 4 ? ['masculino', 'femenino', 'masc. plural', 'fem. plural'] : ['uno', 'varios']
    if (forms.length > 1) forms.forEach((text, i) => items.push({ text, hint: hints[i] }))
    if (SHORT_FORM[w]) items.push({ text: SHORT_FORM[w], hint: 'corta' })
    for (const c of COMPARATIVE[w] ?? []) items.push({ text: c, hint: 'comparar' })
    return items.length ? [{ title: 'Formas', forms: items }] : []
  }
  return []
}

export function hasForms(label: string, wordClass: WordClass): boolean {
  return formGroups(label, wordClass).some((g) => g.forms.length > 1)
}

export function personOf(word: string): number | null {
  const p = PRONOUN_PERSON[word.toLowerCase()]
  return p === undefined ? null : p
}

/** Persona del sujeto si la última palabra del mensaje (saltando "no", "también"…) es un pronombre. */
export function subjectOf(tokens: Token[]): number | null {
  const i = findSubjectIndex(tokens)
  return i >= 0 ? personOf(tokens[i].text) : null
}

// ---------------------------------------------------------------------------
// Gramática inteligente

// Palabras que pueden ir entre el pronombre y el verbo ("yo no quiero").
const BETWEEN = new Set(['no', 'también', 'tampoco', 'nunca', 'ya', 'siempre', 'todavía'])
const ARTICLES = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'])
const COPULAS = new Set([
  'estoy', 'estás', 'está', 'estamos', 'están', 'soy', 'eres', 'es', 'somos', 'son', 'estaba', 'estaban', 'estuve',
  'era', 'fui', 'siento', 'sientes', 'siente', 'sentimos', 'sienten', 'quedé', 'quedó',
])
const FIRST_PERSON_COPULAS = new Set(['estoy', 'soy', 'estaba', 'estuve', 'era', 'fui', 'quedé'])
const PLURAL_COPULAS = new Set(['estamos', 'están', 'somos', 'son', 'estaban', 'sentimos', 'sienten'])

function findSubjectIndex(tokens: Token[]): number {
  let i = tokens.length - 1
  while (i >= 0 && i >= tokens.length - 3 && BETWEEN.has(tokens[i].text.toLowerCase())) i--
  if (i < 0 || i < tokens.length - 3) return -1
  return personOf(tokens[i].text) !== null ? i : -1
}

export interface SmartContext {
  wordClass: WordClass
  gender?: Gender
  userGender: Gender
}

/**
 * Ajusta la palabra nueva según lo que ya está en el mensaje:
 * - "yo" + "querer" → "yo quiero"; "yo no" + "gustar" → "no me gusta"; "yo" + "bañar(se)" → "yo me baño"
 * - "yo quiero" + "bañar(se)" → "yo quiero bañarme"
 * - "el" + "manzana" → "la manzana"; "las" + "manzana" → "las manzanas"; "a" + "el" → "al"
 * - "estoy" + "cansado" → "estoy cansada" (si el usuario es niña); "ella está" + "cansado" → "cansada"
 */
export function applySmartGrammar(tokens: Token[], next: Token, ctx: SmartContext): Token[] {
  const word = next.text.toLowerCase()
  const last = tokens[tokens.length - 1]?.text.toLowerCase()

  if (ctx.wordClass === 'verb') {
    const v = parseVerb(word)
    if (!v) return [...tokens, next]
    const si = findSubjectIndex(tokens)
    if (si >= 0) {
      const person = personOf(tokens[si].text)!
      if (GUSTAR_LIKE.has(v.verb) && !v.reflexive) {
        const pres = present(v.verb)!
        const rest = [...tokens.slice(0, si), ...tokens.slice(si + 1)]
        return [...rest, { text: IO_PRONOUN[person], image: tokens[si].image }, { ...next, text: pres[2] + (v.tail ? ' ' + v.tail : '') }]
      }
      return [...tokens, { ...next, text: personal(v, present(v.verb), person, false) }]
    }
    // "yo quiero" + "bañar(se)" → "bañarme"
    if (v.reflexive) {
      for (let i = tokens.length - 2; i >= Math.max(0, tokens.length - 4); i--) {
        const p = personOf(tokens[i].text)
        if (p !== null) return [...tokens, { ...next, text: infinitiveWith(v, p) }]
      }
      return [...tokens, { ...next, text: v.verb + 'se' + (v.tail ? ' ' + v.tail : '') }]
    }
    return [...tokens, { ...next, text: v.verb + (v.tail ? ' ' + v.tail : '') }]
  }

  if (ctx.wordClass === 'det' && (word === 'el') && (last === 'a' || last === 'de')) {
    return [...tokens.slice(0, -1), { text: last === 'a' ? 'al' : 'del', image: tokens[tokens.length - 1].image }]
  }

  if (ctx.wordClass === 'noun' && last && ARTICLES.has(last)) {
    const definite = ['el', 'la', 'los', 'las'].includes(last)
    const plural = ['los', 'las', 'unos', 'unas'].includes(last)
    const g = nounGender(word, ctx.gender)
    const noun = plural ? pluralize(next.text) : next.text
    const article = articleFor(g, plural, definite, word)
    return [...tokens.slice(0, -1), { ...tokens[tokens.length - 1], text: article }, { ...next, text: noun }]
  }

  if (ctx.wordClass === 'adj' && adjectiveForms(word).length > 1) {
    const recent = tokens.slice(-4).map((t) => t.text.toLowerCase())
    if (!recent.some((t) => COPULAS.has(t))) return [...tokens, next]
    let gender: Gender = 'm'
    let plural = recent.some((t) => PLURAL_COPULAS.has(t))
    const pronoun = [...recent].reverse().find((t) => personOf(t) !== null)
    if (pronoun === 'yo' || (!pronoun && recent.some((t) => FIRST_PERSON_COPULAS.has(t)))) gender = ctx.userGender
    else if (pronoun === 'ella' || pronoun === 'ellas' || pronoun === 'nosotras') gender = 'f'
    if (pronoun && ['nosotros', 'nosotras', 'ellos', 'ellas', 'ustedes'].includes(pronoun)) plural = true
    return [...tokens, { ...next, text: inflectAdjective(word, gender, plural) }]
  }

  return [...tokens, next]
}
