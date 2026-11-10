import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  // En desarrollo, /api va al servidor de Kuentu (carpeta server/).
  server: { host: true, proxy: { '/api': 'http://127.0.0.1:3000' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:3000' } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'brand/*.svg'],
      manifest: {
        name: 'Kuentu — Comunicación Aumentativa',
        short_name: 'Kuentu',
        description: 'Comunicador por pictogramas (CAA) que funciona en el navegador.',
        lang: 'es',
        display: 'standalone',
        orientation: 'any',
        background_color: '#1C375B',
        theme_color: '#1C375B',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//, /privacidad\.html$/],
        globPatterns: ['**/*.{js,css,html,svg}', 'icon-*.png'],
        runtimeCaching: [
          {
            // Pictogramas incluidos: se guardan al verlos por primera vez (son demasiados para precargar).
            urlPattern: ({ url }) => url.pathname.includes('/pictos/'),
            handler: 'CacheFirst',
            options: { cacheName: 'pictos-locales', expiration: { maxEntries: 3000 } },
          },
        ],
      },
    }),
  ],
})
