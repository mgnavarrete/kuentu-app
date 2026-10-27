# Kuentu

Comunicador por pictogramas (CAA) para el navegador, inspirado en el funcionamiento de Proloquo2Go.
Funciona en celular, tablet y computador, y se puede instalar como app (PWA) para usarlo sin conexión.

## Funciones

- **~1.700 palabras y frases** en español de Chile (ver `docs/diccionario.md`), con 96 % de pictogramas ARASAAC.
- **Inicio por niveles**: 3 tamaños (grande 10×12, mediano 6×8, chico 7×5) con el mismo orden; se elige solo según la pantalla o en Ajustes.
- **Plantilla núcleo**: las palabras principales (yo, querer, más, no, qué…) quedan en el mismo lugar dentro de todas las carpetas.
- **Colores como Proloquo2Go** (borde de color) y **esquina coloreada** en los botones que tienen más formas.
- **Mantener presionado** = ventana de formas: presente, pasado, copretérito, futuro, **mandatos con pronombres** (dame, dámelo, ayúdame), botón **No**, formas para el sujeto del mensaje; plurales con artículo; género de adjetivos; pronombres (yo → me, mí, mi, mío…); artículos (el → la, los, las).
- **Gramática inteligente**: «yo» + «querer» → «yo quiero»; «yo» + «gustar» → «me gusta»; «yo» + «bañar(se)» → «yo me baño»; «el» + «manzana» → «la manzana»; «a» + «el» → «al»; «estoy» + «cansado» → «cansada» si el usuario es niña.
- **Palabritas** y **Preguntas** como ventanas emergentes con todas las palabras pequeñas.
- **Buscador con ruta guiada**: busca una palabra (también por sinónimo: «aguacate» → palta) y resalta paso a paso qué botones tocar.
- **Recientes**: historial de frases dichas, para repetirlas o guardarlas como botón.
- Empezar mensaje nuevo al tocar después de decirlo, volver a Inicio tras elegir (opcional).
- **Teclado** con números, frases rápidas y predicción que aprende.
- **Modo edición**: agregar, editar, ocultar, mover y eliminar botones; pictogramas de ARASAAC o fotos; carpetas nuevas; género del sustantivo.
- Respaldo y restauración en un archivo JSON. Funciona sin conexión (PWA).

## Desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo (también accesible desde la red local)
npm run build      # genera dist/ para publicar
npm run preview    # sirve dist/
npm run seed       # busca en ARASAAC los pictogramas de src/data/vocabulario.ts
```

El vocabulario está en `src/data/vocabulario.ts` y la posición de cada palabra de Inicio en `src/data/layouts.ts`.
Después de cambiar el vocabulario, ejecuta `npm run seed` para buscar los pictogramas nuevos (`src/data/pictos.json`).
Los pictogramas mal elegidos se corrigen a mano en `src/data/picto-overrides.json`.

Para instalarla en un celular como app y usarla sin conexión, hay que publicarla con HTTPS (Netlify, Vercel, GitHub Pages, Cloudflare Pages…): basta con subir la carpeta `dist/`.

## Servidor y cuentas (versión web)

La versión web puede usarse con cuentas: cada usuario entra con su usuario y contraseña y su tablero
se guarda en PostgreSQL (también queda una copia en el dispositivo para usarla sin internet).
Sin servidor, la app funciona igual que antes, guardando todo en el dispositivo. Las apps de Windows y Android se conectan a `https://kuentu.minttu.cl` (o se usan sin cuenta, a elección).

Probar en local (necesita Docker para la base de datos):

```bash
npm run db:up                                   # PostgreSQL en Docker (puerto 5432)
cp server/.env.example server/.env              # solo la primera vez
npm --prefix server install                     # solo la primera vez
npm run user -- create admin --admin --name "Administrador"   # primer administrador (pide contraseña)
npm run server                                  # API en http://localhost:3000
npm run dev                                     # en otra terminal: la app en http://localhost:5173
```

Otros comandos: `npm run user -- list`, `npm run user -- password <usuario>`.
Los demás usuarios se crean desde la app: **Ajustes → Cuenta → Administrar usuarios**.
Detalles de diseño en `docs/arquitectura-servidor.md`.

## Actualizar el servidor (kuentu.minttu.cl)

Kuentu está instalado en `/var/www/kuentu-app` (servicio `kuentu-api`, puerto interno 3100, base PostgreSQL `kuentu`).
Guía de instalación completa en `docs/despliegue.md`.

**1. En tu PC**, sube los cambios:

```bash
cd /mnt/d/Proyectos/Proloquo
git add -A && git commit -m "Describe el cambio" && git push
```

**2. En el servidor**, baja los cambios, compila y reinicia:

```bash
cd /var/www/kuentu-app && bash deploy/actualizar.sh
```

El script hace: `git pull`, instala dependencias (sin Electron), `npm run build`, instala las del servidor y
reinicia `kuentu-api`. Los usuarios ven la versión nueva al recargar la página (o al volver a abrir la app instalada).
Los tableros guardados no se tocan: viven en la base de datos.

Comandos útiles en el servidor:

```bash
sudo systemctl status kuentu-api        # ¿está corriendo?
journalctl -u kuentu-api -n 50          # últimos registros (errores)
curl http://127.0.0.1:3100/api/health   # → {"ok":true}
cd /var/www/kuentu-app/server && node --env-file=.env src/cli.ts list                 # usuarios
cd /var/www/kuentu-app/server && node --env-file=.env src/cli.ts password <usuario>   # cambiar contraseña
```

## Programa de escritorio (Windows, Mac, Linux)

La app de escritorio usa Electron e incluye los pictogramas (`public/pictos/`), así funciona sin internet.

```bash
npm run desktop           # abrir la app de escritorio para probar
npm run dist:win          # Windows: release/Kuentu-<versión>-windows.zip (descomprimir y abrir Kuentu.exe)
npm run dist:win-installer # Windows con instalador (ejecutar en Windows, o en Linux con Wine)
npm run dist:mac          # Mac: .dmg (solo se puede armar en un Mac)
npm run dist:linux        # Linux: .AppImage
npm run pictos            # volver a descargar los pictogramas incluidos (tras cambiar el vocabulario)
```

## Android (APK)

La app de Android usa Capacitor (carpeta `android/`), incluye los pictogramas y usa la voz del teléfono.
Requiere Java 17 y el Android SDK (en esta máquina están en `~/android-tools`):

```bash
export JAVA_HOME=~/android-tools/jdk17 ANDROID_HOME=~/android-tools/sdk
npm run android:apk   # → android/app/build/outputs/apk/release/app-release.apk
npm run android:aab   # → .aab firmado para subir a Google Play
```

**Firma**: la clave está en `android/habla-release.jks` y su contraseña en `android/keystore.properties`.
No se suben a git. **Respáldalas**: sin ellas no se pueden publicar actualizaciones de la app ya instalada.
Para cada versión nueva, sube `versionCode` y `versionName` en `android/app/build.gradle`.

## Créditos y licencia de pictogramas

Pictogramas: Sergio Palao. Origen: [ARASAAC](https://arasaac.org), Gobierno de Aragón. Licencia **CC BY-NC-SA 4.0** (uso no comercial, citando la fuente).
Si algún día quieres vender la app, tendrás que cambiar a símbolos con otra licencia (por ejemplo Mulberry Symbols, CC BY-SA, u OpenMoji) o licenciar unos comerciales.
