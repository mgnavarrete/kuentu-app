// Predicción de palabras para el teclado: frecuencia base + palabras del vocabulario + palabras aprendidas.

const COMMON = `de la que el en y a los se no un por con una su para es al lo como más pero sus le ya o
fue este ha sí porque esta son entre cuando muy sin sobre también me hasta hay donde quien desde todo nos
durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo otro otras otra
él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros mi mis tú te
ti tu tus ellas nosotras quiero quieres quiere tengo tienes tiene voy vas va vamos estoy estás está estamos
puedo puedes puede hola gracias chao adiós bien mal sí no ayuda ayúdame por favor agua comer tomar baño casa
mamá papá jugar dormir ir ver mirar ahora después hoy mañana ayer aquí allá dónde cuándo cómo qué quién
porqué bueno buena malo mala grande pequeño feliz triste cansado hambre sed sueño dolor duele gusta gustan
necesito necesitas hacer hago dame dar dice decir sé saber nombre llamo amigo amiga colegio escuela profesor
profesora música televisión tablet perro gato comida leche jugo pan helado chocolate parque plaza salir terminé
listo espera otra vez genial te amo te quiero perdón lo siento de nada buenos días buenas tardes noches`

const BASE: string[] = []
const seen = new Set<string>()
for (const w of COMMON.split(/\s+/)) {
  if (w && !seen.has(w)) {
    seen.add(w)
    BASE.push(w)
  }
}

export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function predict(prefix: string, vocabWords: string[], learned: Record<string, number>, limit = 6): string[] {
  const p = normalize(prefix)
  const scores = new Map<string, number>()
  const add = (word: string, score: number) => {
    if (!word || word.includes(' ')) return
    if (p && (!normalize(word).startsWith(p) || normalize(word) === p)) return
    scores.set(word, Math.max(scores.get(word) ?? 0, score))
  }
  BASE.forEach((w, i) => add(w, 100 - i * 0.2))
  vocabWords.forEach((w) => add(w.toLowerCase(), 40))
  for (const [w, n] of Object.entries(learned)) add(w, 120 + n * 10)
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)
    .slice(0, limit)
    .map(([w]) => w)
}
