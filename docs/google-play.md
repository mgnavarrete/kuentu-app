# Publicar Kuentu en Google Play

Archivo a subir: `release/Kuentu-1.0.0.aab` (se genera con `npm run android:aab`, JDK 21).

## 1. Cuenta y app
1. Crear cuenta en https://play.google.com/console (US$25, una vez). Cuenta **personal**: exige prueba cerrada
   con al menos 12 testers durante 14 días antes de producción.
2. Crear app: nombre **Kuentu**, idioma **Español (Latinoamérica)**, tipo **App**, **Gratis**.
3. Activar **Firma de apps de Google Play** y subir el AAB. La clave `android/habla-release.jks` queda como clave de subida.

## 2. Ficha de la tienda
- **Nombre:** Kuentu — Comunicador por pictogramas
- **Descripción breve (80):** Comunicación aumentativa con pictogramas y voz, en español de Chile.
- **Descripción completa:**

> Kuentu es un comunicador por pictogramas (CAA) para niños y personas que necesitan apoyo para comunicarse.
> Toca los pictogramas para armar frases y Kuentu las dice en voz alta.
>
> • Más de 1.700 palabras y frases en español de Chile, con pictogramas propios y claros.
> • Palabras principales siempre en el mismo lugar, en 3 tamaños de cuadrícula.
> • Gramática automática: «yo + querer» → «yo quiero», «yo + gustar» → «me gusta», género y plural.
> • Mantén presionado un botón para ver conjugaciones, plurales y otras formas.
> • Buscador con ruta guiada, frases recientes y teclado con predicción.
> • Modo edición: agrega botones, fotos propias y carpetas.
> • Funciona sin internet. Cuenta opcional para sincronizar el tablero entre dispositivos.
> • Sin publicidad y sin compras.

- **Categoría:** Educación (o Comunicación). **Correo de contacto:** mnavarrete@minttu.cl.
- **Política de privacidad:** https://kuentu.minttu.cl/privacidad.html
- **Gráficos:** ícono 512×512 (`public/icon-512.png`), gráfico destacado 1024×500, mínimo 2 capturas de teléfono
  y, para tablets, 2 capturas de 7" y 10" (se toman desde la app instalada).

## 3. Contenido de la app (formularios)
- **Anuncios:** No contiene anuncios.
- **Acceso a la app:** todo funciona sin cuenta («Usar sin cuenta»). Si se pide, dar un usuario de prueba del servidor.
- **Público objetivo:** incluye menores de 13 → se aplica la **Política de Familias**: sin anuncios, sin SDK de terceros
  de analítica (Kuentu no tiene ninguno). Declarar que la app está diseñada también para niños.
- **Clasificación de contenido:** cuestionario IARC → sin violencia, sin contenido sexual, sin interacción entre usuarios,
  sin compras. (Vocabulario del cuerpo con fines de salud: no es contenido sexual.)
- **Seguridad de los datos:**
  - ¿Recopila datos? **Sí, solo si el usuario inicia sesión** (opcional).
  - Tipos: **Información personal → Nombre** (nombre de usuario/visible); **Fotos** (si agrega fotos a botones);
    **Otro contenido generado por el usuario** (tablero, frases recientes).
  - Finalidad: **Funcionalidad de la app** y **Administración de la cuenta**. No se comparten con terceros.
  - Cifrado en tránsito: **Sí** (HTTPS). Eliminación: **Sí**, a pedido (correo) o por el administrador de la cuenta.
- **Permisos:** solo `INTERNET`.

## 4. Lanzamiento
1. **Prueba interna** (opcional, inmediata) para instalar desde Play en tus dispositivos.
2. **Prueba cerrada** con 12+ testers (correos de Gmail) durante 14 días.
3. Pedir acceso a **Producción** y enviar a revisión (suele tardar de 1 a 7 días).

Para cada actualización: subir `versionCode` y `versionName` en `android/app/build.gradle` y `version` en `package.json`.
