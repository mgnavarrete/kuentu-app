# Organización de Habla en pantalla

Decisiones (26-10-2026):
- **Inicio por niveles**: el orden es siempre el mismo; en pantallas chicas se muestran solo las palabras más importantes.
- **Plantilla como Proloquo2Go**: dentro de cada carpeta, las palabras núcleo de la plantilla aparecen **en la misma posición que en Inicio**. Así se puede decir "yo quiero manzana" sin volver.
- **Colores como Proloquo2Go**: el color va en el **borde** y en un fondo suave; los botones con formas tienen la **esquina** del mismo color.

El contenido viene de `docs/diccionario.md`.

---

## 1. Colores

| Clase | Color | Ejemplos |
|---|---|---|
| Pronombres, demostrativos, artículos, conjunciones | Naranjo | yo, tú, eso, el, un, y, pero, porque |
| Verbos | Rosado | querer, ir, comer |
| Preposiciones y lugar | Verde | a, de, en, con, aquí, arriba |
| Describir, cantidad, tiempo, negación | Azul | más, bueno, grande, ya, no, ahora |
| Sustantivos | Amarillo | manzana, mamá, colegio |
| Preguntas | Blanco con borde oscuro | qué, dónde, quién |
| Social y frases | Celeste | hola, gracias, ya terminé |
| Carpetas | Blanco con pestaña; pestaña negra = abre como ventana (popup) | Palabritas, Preguntas |

---

## 2. Tamaños de Inicio

Tres tamaños con distribución diseñada a mano (como los tamaños "verdes" de Proloquo2Go). La app elige uno según la pantalla y se puede cambiar en Ajustes.

| Tamaño | Cuadrícula | Botones | Pensado para |
|---|---|---|---|
| Grande | 10 filas × 12 columnas | 120 | Tablet / computador |
| Mediano | 6 × 8 | 48 | Tablet chica, celular horizontal |
| Chico | 7 × 5 | 35 | Celular vertical |

El orden sigue la frase en español, de izquierda a derecha: **quién → acción → palabras pequeñas → cómo/cuándo → preguntas**.

### 2.1 Grande (10 × 12)

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1** | yo | querer | necesitar | comer | doler | el | y | aquí | ahora | más | no | qué |
| **2** | tú | ir | ayudar | tomar | salir | un | o | ahí | después | otro | sí | dónde |
| **3** | él | ser | dar | jugar | volver | a | pero | allá | ya | todo | diferente | quién |
| **4** | ella | estar | venir | parar | abrir | de | porque | arriba | hoy | mucho | mismo | cuándo |
| **5** | nosotros | tener | ver | terminar | sentir | en | que | abajo | mañana | poco | algo | cómo |
| **6** | ellos | hacer | mirar | poner | escuchar | con | si | adentro | ayer | bueno | nada | por qué |
| **7** | eso | poder | decir | pensar | esperar | para | sin | afuera | otra vez | malo | bien | hola |
| **8** | esto | gustar | saber | hay | buscar | por | también | muy | menos | grande | mal | chao |
| **9** | por favor | gracias | ya terminé | ayuda | no sé | espera | 📁 Palabritas | 📁 Preguntas | 📁 Personas | 📁 Acciones | 📁 Describir | 📁 Sentimientos |
| **10** | 📁 Cuerpo y salud | 📁 Comida | 📁 Cosas | 📁 Ropa | 📁 Lugares | 📁 Animales | 📁 Tiempo | 📁 Números | 📁 Escuela | 📁 Diversión | 📁 Plática | 📁 Ayuda |

Columnas: 1 personas · 2–5 verbos (de más a menos frecuente) · 6 artículos y preposiciones · 7 conjunciones · 8 lugar · 9 tiempo · 10–11 describir y cantidad · 12 preguntas y saludo.

### 2.2 Mediano (6 × 8)

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| **1** | yo | querer | gustar | comer | el | y | más | qué |
| **2** | tú | ir | necesitar | jugar | a | porque | no | dónde |
| **3** | él / ella | ser | ayudar | parar | en | aquí | sí | quién |
| **4** | eso | estar | ver | terminar | con | ahora | bueno | ya terminé |
| **5** | 📁 Palabritas | tener | hacer | poder | para | otro | bien | por favor |
| **6** | 📁 Personas | 📁 Acciones | 📁 Describir | 📁 Comida | 📁 Lugares | 📁 Plática | 📁 Ayuda | 📁 Más… |

"él / ella" es un solo botón: al mantener presionado ofrece él, ella, nosotros, ellos, ustedes. "📁 Más…" abre una página 2 con el resto de las carpetas.

### 2.3 Chico (7 × 5, celular vertical)

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **1** | yo | querer | más | no | qué |
| **2** | tú | ir | otro | sí | dónde |
| **3** | eso | gustar | el | ya terminé | ayuda |
| **4** | 📁 Palabritas | hacer | a | bien | por favor |
| **5** | 📁 Personas | tener | en | ahora | 📁 Preguntas |
| **6** | 📁 Acciones | 📁 Describir | 📁 Comida | 📁 Lugares | 📁 Sentimientos |
| **7** | 📁 Plática | 📁 Ayuda | 📁 Cosas | 📁 Diversión | 📁 Más… |

Las demás palabras núcleo (ser, estar, poder, dar, de, con, y, porque…) se alcanzan por **Palabritas**, **Acciones**, **Describir** y al mantener presionado (yo → me, mi; querer → quiero, quieres…).

---

## 3. Plantilla dentro de las carpetas

Cada carpeta usa la misma cuadrícula que Inicio. Las celdas de la plantilla (en negrita abajo) muestran **siempre** la misma palabra núcleo en el mismo lugar; el resto se llena con el vocabulario de la carpeta, en orden. Si no cabe todo, el último botón es "Más… 2" (página siguiente).

| Tamaño | Celdas de plantilla | Libres para la carpeta |
|---|---|---|
| Grande | Columna 1 (yo…esto), columna 2 (querer…gustar), columna 11 (no…mal) y fila 9 (por favor…espera) = 30 | 90 |
| Mediano | Columna 1 filas 1–4, columna 2 filas 1–4, columna 7 filas 1–4 = 12 | 36 (fila 6 = volver / Más… / carpetas hermanas) |
| Chico | Fila 1 (yo, querer, más, no, qué) = 5 | 30 |

Ejemplo Chico, carpeta Comida: fila 1 = **yo · querer · más · no · qué**, filas 2–7 = frases de arranque (tengo hambre, me gusta, no me gusta) + pan, manzana, plátano… → "yo" "quiero" "manzana" sin salir de la carpeta.

En modo edición, los botones de plantilla se ven atenuados con una marca y no se pueden mover (como la "T" de Proloquo2Go); sí se pueden ocultar por carpeta.

---

## 4. Estructura de carpetas

```
Inicio
├─ Palabritas (popup): artículos · preposiciones · conjunciones · pronombres · posesivos · demostrativos · cantidad · sí/no/tal vez
├─ Preguntas (popup): palabras + frases de pregunta
├─ Personas: familia · gente · escuela y terapia · salud y comunidad
├─ Acciones: necesidades · movimiento · manos y cosas · comunicar · sentir · casa/escuela/ocio · A–Z
├─ Describir: opinión · tamaño · tacto y estado · sabor · comparar · personas · Colores · Formas
├─ Sentimientos: emociones · estados físicos · frases
├─ Cuerpo y salud: cuerpo · salud · higiene
├─ Comida: comidas del día · desayuno y once · frutas · verduras · platos · snacks y dulces · condimentos · Bebidas
├─ Cosas: casa y muebles · cocina · tecnología · objetos personales
├─ Ropa
├─ Lugares: casa · comunidad · afuera · Transporte
├─ Animales: mascotas · granja · salvajes · mar · insectos · aves · Naturaleza y clima
├─ Tiempo: cuándo · partes del día · días · meses y estaciones · hora
├─ Números
├─ Escuela
├─ Diversión: juguetes · juegos · deportes · pantallas y música · Fiestas
├─ Plática: saludos · cortesía · intenciones · respuestas · reacciones · opiniones · Mis noticias · Sobre mí
└─ Ayuda (urgencias)
```

Cada carpeta empieza con sus **frases de arranque** (ej. Cuerpo: "me duele", "me pica", "mira mi").

---

## 5. Ventana de formas (mantener presionado)

| Tipo | Lo que muestra |
|---|---|
| Verbo | Pestañas **Presente · Pasado · Copretérito · Futuro · Mandato (imperativo)** con yo, tú, él/ella, nosotros, ellos/ustedes · infinitivo, gerundio, participio · botón **No** (no quiero, no me des) · mandatos con pronombres (dame, dámelo, ayúdame). Si la última palabra del mensaje es un pronombre, abre directo en su forma. |
| Adjetivo | masculino · femenino · plural · forma corta (buen, gran) · comparativo (mejor, peor). Con el ajuste "soy niño/niña" la forma correcta se elige sola después de *estoy/soy*. |
| Sustantivo | singular · plural · con artículo (la manzana, las manzanas) |
| Pronombre | Pestaña personal (yo, me, mí, conmigo) · pestaña posesiva (mi, mis, mío, mía…) |
| Artículo | el, la, los, las, lo / un, una, unos, unas |
| Preposición | a → al; de → del; con → conmigo, contigo |

---

## 6. Plan de implementación (por fases)

1. **Diccionario como datos**: convertir `diccionario.md` a archivos JSON (palabra, clase, género, prioridad, pictograma) y buscar los ~2.000 pictogramas en ARASAAC.
2. **Cuadrícula fija** con los 3 tamaños, paginación "Más…", plantilla en carpetas y nuevos colores con esquina indicadora.
3. **Palabritas y Preguntas como popup** + carpetas con frases de arranque.
4. **Motor gramatical completo**: imperativo con pronombres, copretérito, participio, negación, pronombres y artículos con formas, concordancia por género del usuario.
5. **Buscador con ruta guiada**.
6. **Recientes**, volver a Inicio tras elegir, auto-borrar al tocar el siguiente botón.
7. Después: lenguaje por pasos, varios usuarios, barrido/acceso motor, voz secundaria.
