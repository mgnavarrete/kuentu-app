import type { AppData } from './types'
import { ApiError, pullData, pushData, type Account } from './account'
import { accountKey, defaultData, isAppData, kvGet, kvSet, loadLocal, saveData, withDefaults } from './store'

export type SyncStatus = 'saved' | 'saving' | 'pending' | 'offline'

interface Meta {
  /** Versión del servidor en la que se basa la copia local. */
  version: number
  /** Hay cambios locales que todavía no llegan al servidor. */
  dirty: boolean
}

const PUSH_DELAY = 2000
const RETRY_DELAY = 15000

/**
 * Mantiene los datos de una cuenta: primero en el dispositivo (para que la app funcione sin internet)
 * y luego en el servidor, unos segundos después de cada cambio.
 */
export class Sync {
  private key: string
  private metaKey: string
  private meta: Meta = { version: 0, dirty: false }
  private latest: AppData | null = null
  private fromServer: AppData | null = null
  private timer: number | undefined
  private pushing: Promise<void> | null = null
  private onRemote: (data: AppData, conflict: boolean) => void
  private onStatus: (s: SyncStatus) => void

  constructor(account: Account, onRemote: (data: AppData, conflict: boolean) => void, onStatus: (s: SyncStatus) => void) {
    this.key = accountKey(account.id)
    this.metaKey = `${this.key}:meta`
    this.onRemote = onRemote
    this.onStatus = onStatus
    window.addEventListener('online', this.retry)
  }

  dispose() {
    window.clearTimeout(this.timer)
    window.removeEventListener('online', this.retry)
  }

  private retry = () => {
    if (this.meta.dirty) this.schedule(0)
  }

  /** Datos con los que abrir la app: los del servidor si se puede, si no la copia local. */
  async start(): Promise<AppData> {
    const local = await loadLocal(this.key)
    this.meta = (await kvGet<Meta>(this.metaKey)) ?? { version: 0, dirty: false }
    try {
      const remote = await pullData()
      if (this.meta.dirty && local && remote.version === this.meta.version) {
        // Cambios hechos sin internet que nadie más pisó: se suben ahora.
        this.latest = local
        this.schedule(0)
        return local
      }
      if (isAppData(remote.data)) {
        const data = withDefaults(remote.data)
        this.meta = { version: remote.version, dirty: false }
        this.adopt(data)
        await saveData(data, this.key)
        await kvSet(this.metaKey, this.meta)
        this.onStatus('saved')
        return data
      }
      // Cuenta nueva: se parte con lo de este dispositivo (lo que se usó sin cuenta, si hay) y se sube.
      const data = local ?? (await loadLocal()) ?? defaultData()
      this.meta = { version: remote.version, dirty: true }
      this.latest = data
      this.schedule(0)
      return data
    } catch {
      this.onStatus('offline')
      if (local) this.latest = local
      return local ?? defaultData()
    }
  }

  /** Recuerda que estos datos vinieron del servidor, para no volver a subirlos. */
  private adopt(data: AppData) {
    this.fromServer = data
    this.latest = data
  }

  /** La app cambió algo: se guarda en el dispositivo y se programa la subida. */
  async change(data: AppData) {
    this.latest = data
    await saveData(data, this.key)
    if (data === this.fromServer) return
    if (!this.meta.dirty) {
      this.meta = { ...this.meta, dirty: true }
      await kvSet(this.metaKey, this.meta)
    }
    this.schedule(PUSH_DELAY)
  }

  private schedule(delay: number) {
    this.onStatus('pending')
    window.clearTimeout(this.timer)
    this.timer = window.setTimeout(() => void this.push(), delay)
  }

  private async push(): Promise<void> {
    if (this.pushing) {
      await this.pushing
      return this.meta.dirty ? this.push() : undefined
    }
    const data = this.latest
    if (!data || !this.meta.dirty) return
    this.pushing = (async () => {
      this.onStatus('saving')
      try {
        const { version } = await pushData(data, this.meta.version)
        // Si hubo cambios mientras se subía, siguen pendientes.
        this.meta = { version, dirty: this.latest !== data }
        await kvSet(this.metaKey, this.meta)
        if (this.meta.dirty) this.schedule(PUSH_DELAY)
        else this.onStatus('saved')
      } catch (err) {
        if (err instanceof ApiError && err.status === 409 && isAppData(err.body.data)) {
          // Otro dispositivo guardó antes: se toma su versión.
          const remote = withDefaults(err.body.data)
          this.meta = { version: Number(err.body.version), dirty: false }
          this.adopt(remote)
          await saveData(remote, this.key)
          await kvSet(this.metaKey, this.meta)
          this.onRemote(remote, true)
          this.onStatus('saved')
        } else if (err instanceof ApiError && err.status === 401) {
          this.onStatus('offline')
        } else {
          this.onStatus('offline')
          window.clearTimeout(this.timer)
          this.timer = window.setTimeout(() => void this.push(), RETRY_DELAY)
        }
      }
    })()
    try {
      await this.pushing
    } finally {
      this.pushing = null
    }
  }

  /** Sube lo pendiente ya. Devuelve true si todo quedó guardado en el servidor. */
  async flush(): Promise<boolean> {
    window.clearTimeout(this.timer)
    await this.push()
    return !this.meta.dirty
  }

  /** Borra la copia local de esta cuenta (al cerrar sesión). */
  async forget() {
    this.dispose()
    await kvSet(this.key, undefined)
    await kvSet(this.metaKey, undefined)
  }
}
