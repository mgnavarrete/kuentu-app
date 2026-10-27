// Genera todos los íconos e imágenes de marca de Kuentu a partir de los SVG de logo/:
// - kuentu-small (.svg / -black): favicon y logo dentro de la app
// - kuentu-long (-black): logo con nombre (carga, Acerca de, pantalla de inicio de Android)
// - kuentu-app: ícono de la app (PWA, Windows, Android)
// Las versiones «black» son para fondo azul #1C375B; las normales para fondo blanco.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const NAVY = '#1C375B'
const logo = (name) => readFileSync(new URL(`../logo/${name}`, import.meta.url), 'utf8')

const SMALL = logo('kuentu-small.svg')
const SMALL_BLACK = logo('kuento-small-black.svg')
const APP = logo('kuentu-app.svg')
const LONG_BLACK = logo('kuentu-long-black.svg')
const LONG = logo('kuentu-long.svg')

const viewBox = (svg) => svg.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number)
const inner = (svg) => svg.replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '')

/**
 * Dibuja `svg` centrado en un lienzo de width×height, ocupando como máximo `scale` del lado menor,
 * con fondo opcional (color) y esquinas redondeadas o círculo.
 */
function render(svg, width, height = width, { scale = 1, bg, shape = 'square' } = {}) {
  const [, , vw, vh] = viewBox(svg)
  const fit = Math.min((width * scale) / vw, (height * scale) / vh)
  const w = vw * fit, h = vh * fit
  const clip =
    shape === 'circle' ? `<clipPath id="c"><circle cx="${width / 2}" cy="${height / 2}" r="${width / 2}"/></clipPath>`
    : shape === 'rounded' ? `<clipPath id="c"><rect width="${width}" height="${height}" rx="${width * 0.18}"/></clipPath>`
    : ''
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>${clip}</defs>
    <g ${clip ? 'clip-path="url(#c)"' : ''}>
      ${bg ? `<rect width="${width}" height="${height}" fill="${bg}"/>` : ''}
      <svg x="${(width - w) / 2}" y="${(height - h) / 2}" width="${w}" height="${h}">${inner(svg)}</svg>
    </g>
  </svg>`
  return new Resvg(doc, { fitTo: { mode: 'original' } }).render().asPng()
}

const out = (path, data) => writeFileSync(new URL(`../${path}`, import.meta.url), data)

// Web / PWA
mkdirSync(new URL('../public/brand/', import.meta.url), { recursive: true })
out('public/brand/kuentu-small.svg', SMALL)
out('public/brand/kuentu-long.svg', LONG)
out('public/brand/kuentu-long-black.svg', LONG_BLACK)
out('public/favicon.svg', SMALL)
out('public/icon-192.png', render(APP, 192))
out('public/icon-512.png', render(APP, 512))
// Ícono «maskable»: el sistema lo recorta en círculo u otras formas, el logo va dentro de la zona segura.
out('public/icon-maskable-512.png', render(SMALL_BLACK, 512, 512, { scale: 0.62, bg: NAVY }))
out('public/apple-touch-icon.png', render(SMALL_BLACK, 180, 180, { scale: 0.7, bg: NAVY }))

// Escritorio (Windows / Mac / Linux)
out('build/icon.png', render(APP, 512))

// Android
const res = new URL('../android/app/src/main/res/', import.meta.url)
if (existsSync(res)) {
  const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 }
  for (const [d, k] of Object.entries(DENSITIES)) {
    const dir = new URL(`mipmap-${d}/`, res)
    writeFileSync(new URL('ic_launcher.png', dir), render(APP, 48 * k))
    writeFileSync(new URL('ic_launcher_round.png', dir), render(SMALL_BLACK, 48 * k, 48 * k, { scale: 0.66, bg: NAVY, shape: 'circle' }))
    // Ícono adaptable: logo en la zona segura (66 de 108) sobre el fondo azul.
    writeFileSync(new URL('ic_launcher_foreground.png', dir), render(SMALL_BLACK, 108 * k, 108 * k, { scale: 0.5 }))
  }
  writeFileSync(
    new URL('values/ic_launcher_background.xml', res),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${NAVY}</color>\n</resources>\n`,
  )
  // Pantallas de inicio: fondo azul con el logo largo, mismo tamaño que tiene cada una.
  for (const dir of readdirSync(res).filter((d) => d.startsWith('drawable'))) {
    const file = new URL(`${dir}/splash.png`, res)
    if (existsSync(file)) {
      const png = readFileSync(file)
      const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)]
      writeFileSync(file, render(LONG_BLACK, w, h, { scale: 0.5, bg: NAVY }))
    }
  }
  console.log('Íconos de Android generados.')
}
console.log('Íconos generados.')
