# Investigación: Proloquo2Go, alternativas y lo que le falta a Habla

Fecha: 26-10-2026. Fuentes: centro de ayuda oficial de AssistiveWare (ES/EN), manual de Proloquo2Go 4, ficha del App Store (v8.9.2), tableros oficiales en español de AssistiveWare, archivos abiertos de AsTeRICS Grid / Cboard / Jellow, y estudios de vocabulario núcleo en español. Las URL están al final.

> Nota legal: estudiamos *cómo funciona* Proloquo2Go para reimplementar comportamientos. No copiamos su vocabulario Crescendo, sus símbolos (SymbolStix) ni su distribución exacta: el diccionario de Habla (`docs/diccionario.md`) es propio y está basado en estudios públicos.

---

## 1. Cómo está organizado Proloquo2Go

### 1.1 Niveles de vocabulario (Crescendo)
| Nivel | Para quién | Organización |
|---|---|---|
| Comunicación básica | Pedir cosas, necesidades básicas | Carpetas por tema, poca gramática |
| Esencial Intermedio (recomendado) | Construir frases | Inicio = palabras núcleo por clase gramatical; carpetas temáticas en la fila de abajo |
| Esencial Avanzado | Usuarios con más lenguaje | Igual que Intermedio pero con más subcarpetas |

- 4.750 palabras visibles + 7.250 "en almacenamiento" (listas para activar).
- **23 tamaños de cuadrícula** (de 3×3 a 12×12; el recomendado históricamente es 7×11, pero ~80 % usa uno menor). Cada carpeta puede tener su propio tamaño.
- **Plantillas**: cada carpeta temática repite las palabras núcleo **en la misma posición** que en Inicio (planificación motora): se puede decir "yo quiero manzana" sin volver a Inicio.
- **Tres niveles por carpeta (VocaPriority)**: primario, secundario (botón "Más… 2") y almacenamiento.
- **Lenguaje por pasos**: se revelan palabras en orden de desarrollo sin moverlas (las ocultas dejan hueco). Paso 1: *yo, tú, querer, hacer, ir, qué, no, más, ya terminé* + carpetas. Botón "Explorar" para ver lo oculto temporalmente.

### 1.2 Pantalla de Inicio en español (lo que contiene)
Columnas agrupadas por clase gramatical:
- **Pronombres**: yo, tú, él, ella, nosotros, ustedes, ellos, eso, esto, aquello.
- **Verbos**: estar, ser, querer, hacer, tener, poder, gustar, necesitar, dar, parar, ir, venir, tomar, hay, ayudar, escuchar, poner, ver, mirar, pensar, saber, decir, comer, jugar.
- **Artículos en Inicio**: *el* y *un* (las demás formas salen al mantener presionado o en "Palabritas").
- **Preposiciones**: a, con, para, de, en, delante, detrás.
- **Conjunciones**: o, y, pero, porque.
- **Preguntas**: qué, dónde, quién.
- **Otras**: no, más, ya, luego, ya terminé, ahí, aquí, bien, mal, diferente, todo, algo, nada.
- **Carpetas (fila inferior)**: Personas, Cosas, Comida, Lugares, Acciones, Describir, Plática, Ayuda, Preguntas, Actividades, **Palabritas**, + Estados, Diversión, Tiempo.
- "Palabritas" y "Preguntas" se abren como **ventana emergente** (popup) sobre la pantalla actual, no como página nueva.

### 1.3 Gramática (lo más importante para el español)
- **Un toque** pone la palabra base; **mantener presionado** abre la ventana de formas. Los botones con formas tienen la **esquina superior derecha coloreada**.
- **Verbos**: pestañas **Pasado / Presente / Futuro / Imperativo**. En cada una: yo, tú, él/usted, nosotros, (vosotros), ellos/ustedes + infinitivo y gerundio. Imperativo con pronombres pegados (*dame, dale, danos*). Botón **"No"** que niega las formas (*no me des*).
- **Sujeto automático**: si la última palabra del mensaje es un pronombre ("yo"), la ventana salta directo a las formas de "yo".
- **Adjetivos**: *malo, mala, malos, malas, mal, peor* (género × número + forma corta + comparativo).
- **Pronombres**: pestaña personal (*yo, me, mí, conmigo*) y pestaña posesiva (*mi, mis, mío, mía…*).
- **Sustantivos**: plural.
- **Vista previa**: oír la forma antes de agregarla.
- La concordancia **no es automática** según el sustantivo: el usuario elige la forma.
- Motor gramatical que conjuga **cualquier** palabra, incluso las que agrega el usuario.

### 1.4 Buscar palabras
- Se escribe una palabra → aparecen los botones (visibles y ocultos) → al elegir uno muestra **la ruta** (Inicio → Comida → Frutas → manzana) y **guía paso a paso** iluminando el botón que hay que tocar en cada pantalla. Sirve para aprender dónde está cada palabra.

### 1.5 Mensaje, teclado y frases
- Tocar la barra de mensaje la dice. X: un toque borra la última palabra, doble toque todo.
- **Auto-borrar**: el mensaje se borra *al tocar el siguiente botón* después de hablar (no inmediatamente), para poder repetir.
- **Recientes**: historial de frases dichas; se pueden repetir o convertir en botón.
- **Compartir/Copiar** el mensaje; **crear botón** desde el mensaje.
- **Teclado** con predicción (4 sugerencias), "hablar al escribir" por palabra/frase, y panel de letras con vocales en rosado, ñ, números y frases rápidas ("uups, eso no", "algo anda mal", "espera por favor"…).
- Volumen rápido: Suave / Alto / Grita.

### 1.6 Edición y personalización
- Propiedades de botón: texto hablado ≠ etiqueta, imagen (símbolo sugerido automático, foto, cámara), colores de fondo y borde, visibilidad (normal / oculto / atenuado), **tipo de palabra** (define color y gramática), voz propia, grabar audio.
- **Acciones de botón**: agregar al mensaje, decir de inmediato, hablar mensaje, borrar, abrir carpeta (o en popup), ir a Inicio, volver.
- **Volver automáticamente a Inicio** tras elegir una palabra en una carpeta (por usuario, carpeta o botón).
- Mover arrastrando, copiar/pegar, ordenar alfabéticamente, mover a "Más" o a almacenamiento.
- Bloqueo con PIN, ocultar botones de edición/teclado.

### 1.7 Voz, idiomas y acceso
- Más de 100 voces; voz primaria (mensaje) y secundaria (vista previa). Diccionario de pronunciación.
- Modo bilingüe (español + inglés en la misma frase).
- Acceso motor: duración de pulsación (hasta 5 s), activar al soltar, ignorar repeticiones, espaciado, **barrido** con 1 o 2 pulsadores (lineal, fila/columna) con pistas habladas.
- **Varios usuarios**, cada uno con su vocabulario y ajustes; respaldos automáticos.

### 1.8 Código de colores (borde de color + fondo pastel)
| Clase | Color en Proloquo2Go |
|---|---|
| Pronombres, artículos, conjunciones, sí/no | Naranjo |
| Verbos | Rosado/magenta |
| Preposiciones y adverbios de lugar | Verde |
| Adjetivos, adverbios, cantidad | Azul |
| Sustantivos | Amarillo |
| Preguntas | Blanco con borde oscuro |
| Carpetas | Forma de carpeta (pestaña); pestaña negra = abre en popup |

---

## 2. Ideas de las alternativas

| App | Idea destacada |
|---|---|
| **TD Snap Core First** | Auto-inflexión estadística: el verbo cambia solo según lo anterior. Página "Formas de palabras" para cambiar la última palabra. Buscador con ruta. |
| **LAMP WFL / UNIDAD** | Plan motor único: cada palabra en un solo lugar, siempre igual (y el mismo en español e inglés). Cualquier palabra en ≤4 toques. |
| **WordPower (TouchChat)** | Núcleo incrustado dentro de las categorías; teclas "inteligentes" de tiempo verbal. |
| **Grid 3 / Symbol Talker** | Páginas para pedir opiniones; mensajes guardados ("Mis noticias"). |
| **AsTeRICS Grid (ARASAAC)** | **Barra núcleo global** fija en todas las carpetas; carpeta **"Partículas"** (el, la, los, las, un, una, a, de, con, por, para, y, o, pero, porque, que, sin…); botones **PASADO / PRESENTE / FUTURO**; página **Ayuda** con urgencias; **Sobre mí**. |
| **PODD** | Inicio por **intención comunicativa**: "Quiero algo", "Te quiero decir algo", "Algo va mal", "Tengo una pregunta", "Te cuento algo que pasó", "Me equivoqué", "No está aquí", "Lo deletreo". |
| **Cboard** | Cada categoría empieza con frases de arranque: "yo quiero", "no me gusta", "dónde está", "me duele". |
| **Jellow** | Botones fijos a los lados: me gusta / no me gusta / sí / no / más / menos, combinables con cualquier imagen. |
| **PictoDroid** | Modo guiado sujeto → verbo → complemento (para aprender a armar frases). |
| **Proloquo (nueva)** | "Modo foco": resaltar palabras objetivo para modelar, sin ocultar las demás. |

---

## 3. Qué tiene Habla hoy vs. qué falta

| Función | Habla hoy | Falta |
|---|---|---|
| Inicio con núcleo + carpetas | ✅ 48 núcleo + 16 carpetas | Rediseñar con el diccionario nuevo (~100 núcleo por clase gramatical) |
| Palabras pequeñas (a, con, la, los…) | ❌ | Artículos y preposiciones en Inicio + carpeta emergente **Palabritas** |
| Conjugación al mantener presionado | ✅ presente/pasado/futuro | **Imperativo** (dame, ven, espera), **copretérito** (jugaba), **negación**, **clíticos** (dámelo), pestañas, sujeto automático |
| Gramática inteligente | ✅ pronombre + verbo | Que funcione con más casos (eso + gustar, nombres propios) y verbos pronominales (*me baño*) |
| Género y número | ✅ adjetivos y plurales | Artículo que concuerde con el sustantivo (el/la), **ajuste "soy niño/niña"** para que *cansado/cansada* salga solo |
| Pronombres con formas | ❌ | yo → me, mí, conmigo, mi, mío… |
| Buscador con ruta guiada | ❌ | **Alta prioridad** |
| Núcleo fijo dentro de las carpetas (plan motor) | ❌ | Barra núcleo o plantillas |
| Carpetas emergentes (popup) | ❌ | Para Palabritas y Preguntas |
| Volver a Inicio tras elegir | ❌ | Ajuste por usuario/carpeta |
| Recientes / frases guardadas | ❌ | Historial + frases favoritas |
| Lenguaje por pasos | ❌ (solo ocultar) | Revelar por etapas sin mover; "Explorar" |
| Nivel "Más…" / almacenamiento | ❌ | Vocabulario de reserva por carpeta |
| Tamaños de cuadrícula | ✅ columnas | Filas × columnas fijas con paginación, como Proloquo |
| Teclado con predicción | ✅ | Números, frases rápidas, hablar al escribir |
| Edición | ✅ básica | Arrastrar para mover, copiar/pegar, vista previa de colores, acciones de botón |
| Voz | ✅ voz del sistema | Voz secundaria para vista previa, pronunciación personalizada |
| Varios usuarios | ❌ | Perfiles |
| Barrido / acceso motor | ❌ | Duración de pulsación, activar al soltar, barrido |
| Bilingüe | ❌ | Futuro |

---

## 4. Propuesta de organización para Habla (para conversar)

1. **Inicio núcleo fijo** (~100 botones en 8×12 o similar) ordenado en columnas por clase gramatical, de izquierda a derecha en el orden natural de la frase en español: *quién → acción → palabras pequeñas → qué/cómo → preguntas/social*. Fila inferior con carpetas.
2. **Tamaños pequeños** (para niños o motricidad): mismo orden, pero mostrando solo las palabras más importantes (las marcadas ★★★ en el diccionario), igual que Lenguaje por pasos.
3. **Palabritas** como ventana emergente con todas las palabras pequeñas agrupadas (artículos, preposiciones, conjunciones, pronombres, posesivos, demostrativos, cantidades).
4. **Carpetas temáticas** que empiezan con 3–6 **frases de arranque** ("yo quiero", "me duele", "dónde está") y luego el vocabulario, con subcarpetas cuando pasan de ~40 palabras.
5. **Ventana gramatical completa** al mantener presionado (verbos, adjetivos, sustantivos, pronombres, artículos).
6. **Buscador con ruta guiada**.
7. **Página Ayuda/Urgencias** y **Plática** con arranques tipo PODD.

Ver `docs/diccionario.md` para el contenido completo.

---

## Fuentes principales
- AssistiveWare, centro de ayuda (ES): https://www.assistiveware.com/es/ayuda/proloquo2go
- Niveles de vocabulario: https://www.assistiveware.com/es/ayuda/proloquo2go/vocabulario-gramatica/niveles-vocabulario
- Flexiones (ventana gramatical): https://www.assistiveware.com/es/ayuda/proloquo2go/basicos/busca-las-flexiones-de-una-palabra
- Buscar: https://www.assistiveware.com/es/ayuda/proloquo2go/basicos/busca
- Lenguaje por pasos: https://www.assistiveware.com/es/ayuda/proloquo2go/vocabulario-gramatica/introduce-palabras-esenciales
- Tablero de palabras esenciales (ES): https://download.assistiveware.com/aac/tablero-de-palabras-esenciales.pdf
- Manual Proloquo2Go 4: https://www.orin.com/access/docs/Proloquo2Go-4-Manual.pdf
- Crescendo: https://www.assistiveware.com/crescendo · https://acecentre.org.uk/language-library/crescendo
- TD Snap auto-inflexión: https://ca.tobiidynavox.com/blogs/support-articles/why-does-auto-inflection-auto-morphology-seem-inconsistent-at-times-in-td-snap
- AsTeRICS Grid Boards (ES): https://github.com/asterics/AsTeRICS-Grid-Boards
- Cboard: https://github.com/cboard-org/cboard
- Jellow: https://github.com/jellow-aac/jellow-communicator-android
- Soto & Cooper (2021), vocabulario temprano en español para CAA: https://edrl.berkeley.edu/wp-content/uploads/2021/03/Soto_Cooper_2021_pubilshed-Brittney-Cooper.pdf
- Vocabulario CACE-UTAC (ARASAAC): https://aulaabierta.arasaac.org/vocabulario-utac-cace
- RAE CREA, 1000 formas más frecuentes: http://corpus.rae.es/frec/1000_formas.TXT
- Frecuencias de subtítulos (habla cotidiana): https://github.com/hermitdave/FrequencyWords
- Verbos más frecuentes en habla infantil/adulta (UAM): https://www.lllf.uam.es/ESP/cilc09.pdf
