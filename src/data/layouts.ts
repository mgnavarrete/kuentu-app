// Distribución de Inicio para cada tamaño (ver docs/organizacion.md).
// "📁id" es una carpeta; "" es una casilla vacía.

import type { GridSize } from '../lib/types'

export const GRID: Record<GridSize, { rows: number; cols: number }> = {
  grande: { rows: 10, cols: 12 },
  mediano: { rows: 6, cols: 8 },
  chico: { rows: 7, cols: 5 },
}

const GRANDE = `
yo        | querer | necesitar | comer    | doler    | el   | y       | aquí    | ahora    | más    | no        | qué
tú        | ir     | ayudar    | tomar    | salir    | un   | o       | ahí     | después  | otro   | sí        | dónde
él        | ser    | dar       | jugar    | volver   | a    | pero    | allá    | ya       | todo   | diferente | quién
ella      | estar  | venir     | parar    | abrir    | de   | porque  | arriba  | hoy      | mucho  | mismo     | cuándo
nosotros  | tener  | ver       | terminar | sentir   | en   | que     | abajo   | mañana   | poco   | algo      | cómo
ellos     | hacer  | mirar     | poner    | escuchar | con  | si      | adentro | ayer     | bueno  | nada      | por qué
eso       | poder  | decir     | pensar   | esperar  | para | sin     | afuera  | otra vez | malo   | bien      | hola
esto      | gustar | saber     | hay      | buscar   | por  | también | muy     | menos    | grande | mal       | chao
por favor | gracias | ya terminé | ayuda  | no sé    | espera | 📁palabritas | 📁preguntas | 📁personas | 📁acciones | 📁describir | 📁sentimientos
📁cuerpo  | 📁comida | 📁cosas  | 📁ropa   | 📁lugares | 📁animales | 📁tiempo | 📁numeros | 📁escuela | 📁diversion | 📁platica | 📁ayuda
`

const MEDIANO = `
yo           | querer     | gustar      | comer     | el   | y       | más    | qué
tú           | ir         | necesitar   | jugar     | a    | porque  | no     | dónde
él           | ser        | ayudar      | parar     | en   | aquí    | sí     | quién
eso          | estar      | ver         | terminar  | con  | ahora   | bueno  | ya terminé
📁palabritas | tener      | hacer       | poder     | para | otro    | bien   | por favor
📁personas   | 📁acciones | 📁describir | 📁comida  | 📁lugares | 📁platica | 📁ayuda | 📁mas
`

const CHICO = `
yo           | querer     | más         | no          | qué
tú           | ir         | otro        | sí          | dónde
eso          | gustar     | el          | ya terminé  | ayuda
📁palabritas | hacer      | a           | bien        | por favor
📁personas   | tener      | en          | ahora       | 📁preguntas
📁acciones   | 📁describir | 📁comida   | 📁lugares   | 📁sentimientos
📁platica    | 📁ayuda    | 📁cosas     | 📁diversion | 📁mas
`

function parse(src: string): string[] {
  return src
    .trim()
    .split('\n')
    .flatMap((row) => row.split('|').map((c) => c.trim()))
}

export const HOME_LAYOUT: Record<GridSize, string[]> = {
  grande: parse(GRANDE),
  mediano: parse(MEDIANO),
  chico: parse(CHICO),
}

const slot = (size: GridSize, row: number, col: number) => (row - 1) * GRID[size].cols + (col - 1)
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

/** Casillas de Inicio que se repiten en todas las carpetas (plantilla núcleo). */
export const TEMPLATE_SLOTS: Record<GridSize, number[]> = {
  grande: [
    ...range(1, 8).flatMap((r) => [slot('grande', r, 1), slot('grande', r, 2), slot('grande', r, 11)]),
    ...range(1, 6).map((c) => slot('grande', 9, c)),
  ],
  mediano: range(1, 4).flatMap((r) => [slot('mediano', r, 1), slot('mediano', r, 2), slot('mediano', r, 7)]),
  chico: range(1, 5).map((c) => slot('chico', 1, c)),
}
