import { Capacitor } from '@capacitor/core'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import type { Settings } from './types'

/** Voz disponible (del navegador o, en Android, del motor de voz del teléfono). */
export interface VoiceInfo {
  voiceURI: string
  name: string
  lang: string
}

// La vista web de Android no trae síntesis de voz: ahí se usa el motor del teléfono vía Capacitor.
const native = Capacitor.isNativePlatform()

let cachedVoices: VoiceInfo[] = []
let nativeVoices: { voiceURI: string; lang: string; index: number }[] = []

export function speechSupported(): boolean {
  return native || (typeof window !== 'undefined' && 'speechSynthesis' in window)
}

/** Las voces cargan de forma asíncrona; avisa cuando están disponibles o cambian. */
export function onVoicesChanged(cb: (voices: VoiceInfo[]) => void): () => void {
  if (native) {
    TextToSpeech.getSupportedVoices()
      .then(({ voices }) => {
        nativeVoices = voices.map((v, index) => ({ voiceURI: v.voiceURI, lang: v.lang, index }))
        cachedVoices = voices.map((v) => ({ voiceURI: v.voiceURI, name: v.name, lang: v.lang }))
        cb(cachedVoices)
      })
      .catch(() => cb([]))
    return () => {}
  }
  if (!speechSupported()) return () => {}
  const update = () => {
    cachedVoices = speechSynthesis.getVoices()
    cb(cachedVoices)
  }
  update()
  speechSynthesis.addEventListener('voiceschanged', update)
  return () => speechSynthesis.removeEventListener('voiceschanged', update)
}

/** Voces en español primero, prefiriendo las latinoamericanas. */
export function sortVoices<T extends VoiceInfo>(voices: T[]): T[] {
  const rank = (v: VoiceInfo) => {
    const lang = v.lang.toLowerCase().replace('_', '-')
    if (lang === 'es-cl') return 0
    if (lang === 'es-419' || lang === 'es-us' || lang === 'es-mx') return 1
    if (lang.startsWith('es')) return 2
    return 3
  }
  return [...voices].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}

function pickBrowserVoice(settings: Settings): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices()
  return voices.find((v) => v.voiceURI === settings.voiceURI) ?? sortVoices(voices).find((v) => v.lang.toLowerCase().startsWith('es'))
}

export function speak(text: string, settings: Settings): void {
  if (!speechSupported() || !text.trim()) return
  if (native) {
    const chosen = nativeVoices.find((v) => v.voiceURI === settings.voiceURI)
    TextToSpeech.stop()
      .catch(() => {})
      .then(() =>
        TextToSpeech.speak({
          text,
          lang: chosen?.lang ?? 'es-US',
          voice: chosen?.index,
          rate: settings.rate,
          pitch: settings.pitch,
          volume: 1,
          category: 'playback',
        }),
      )
      .catch((err) => console.warn('No se pudo hablar', err))
    return
  }
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voice = pickBrowserVoice(settings)
  if (voice) u.voice = voice
  u.lang = voice?.lang ?? 'es-CL'
  u.rate = settings.rate
  u.pitch = settings.pitch
  speechSynthesis.speak(u)
}

export function stopSpeaking(): void {
  if (native) TextToSpeech.stop().catch(() => {})
  else if (speechSupported()) speechSynthesis.cancel()
}
