import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { Capacitor } from '@capacitor/core'
import { KeepAwake } from '@capacitor-community/keep-awake'
import Root from './Root'
import './styles.css'

if (Capacitor.isNativePlatform()) {
  // En el teléfono, que la pantalla no se apague mientras se usa para hablar.
  KeepAwake.keepAwake().catch(() => {})
} else if (location.protocol.startsWith('http')) {
  // En el programa de escritorio (file://) y en Android no hay service worker; ahí ya funciona sin internet.
  registerSW({ immediate: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
