import { Capacitor } from '@capacitor/core'
import type { AppData } from './types'

/** Cuenta de usuario del servidor de Kuentu. */
export interface Account {
  id: number
  username: string
  displayName: string
  role: 'admin' | 'user'
}

export interface AdminUser extends Account {
  disabled: boolean
  createdAt: string
  lastLoginAt: string | null
  dataUpdatedAt: string | null
}

/**
 * Cómo arranca la app:
 * - local: sin servidor (Windows, Android, o web publicada sin backend). Todo queda en el dispositivo.
 * - login: hay servidor y no hay sesión.
 * - user: sesión iniciada. `offline` si el servidor no respondió y se usa la última cuenta guardada.
 */
export type Session = { kind: 'local' } | { kind: 'login' } | { kind: 'user'; account: Account; offline: boolean }

export class ApiError extends Error {
  status: number
  body: Record<string, unknown>
  constructor(status: number, body: Record<string, unknown>) {
    super(typeof body.error === 'string' ? body.error : `Error ${status}`)
    this.status = status
    this.body = body
  }
}

async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`./api/${path}`, {
    method: init.method ?? 'GET',
    credentials: 'same-origin',
    headers: init.body !== undefined ? { 'content-type': 'application/json', 'x-kuentu': '1' } : { 'x-kuentu': '1' },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  // Sin servidor de Kuentu (p. ej. web estática) /api devuelve HTML o 404: se trata como "no hay servidor".
  if (!isJson) throw new TypeError('Sin servidor')
  const body = await res.json()
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

// La última cuenta usada, para poder abrir la app sin internet.
const LAST_ACCOUNT = 'kuentu:account'

function rememberAccount(account: Account | null) {
  try {
    if (account) localStorage.setItem(LAST_ACCOUNT, JSON.stringify(account))
    else localStorage.removeItem(LAST_ACCOUNT)
  } catch {}
}

function lastAccount(): Account | null {
  try {
    return JSON.parse(localStorage.getItem(LAST_ACCOUNT) ?? 'null')
  } catch {
    return null
  }
}

export async function checkSession(): Promise<Session> {
  if (Capacitor.isNativePlatform() || !location.protocol.startsWith('http')) return { kind: 'local' }
  try {
    const { user } = await api<{ user: Account }>('me')
    rememberAccount(user)
    return { kind: 'user', account: user, offline: false }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      rememberAccount(null)
      return { kind: 'login' }
    }
    // El servidor no respondió: si ya había alguien con sesión, se sigue con su copia local.
    const account = lastAccount()
    return account ? { kind: 'user', account, offline: true } : { kind: 'local' }
  }
}

export async function login(username: string, password: string): Promise<Account> {
  const { user } = await api<{ user: Account }>('login', { method: 'POST', body: { username, password } })
  rememberAccount(user)
  return user
}

export async function logout(): Promise<void> {
  rememberAccount(null)
  await api('logout', { method: 'POST', body: {} }).catch(() => {})
}

export function changePassword(current: string, password: string) {
  return api('me/password', { method: 'POST', body: { current, password } })
}

// --- Datos ---

export interface Remote {
  data: AppData | null
  version: number
}

export function pullData(): Promise<Remote> {
  return api<Remote>('data')
}

/** Guarda en el servidor. Si otro dispositivo guardó antes, lanza ApiError 409 con { data, version } actuales. */
export function pushData(data: AppData, baseVersion: number): Promise<{ version: number }> {
  return api('data', { method: 'PUT', body: { data, baseVersion } })
}

// --- Administración ---

export const admin = {
  list: () => api<{ users: AdminUser[] }>('admin/users').then((r) => r.users),
  create: (u: { username: string; displayName: string; password: string; role: 'admin' | 'user' }) =>
    api<{ user: AdminUser }>('admin/users', { method: 'POST', body: u }),
  update: (id: number, patch: Partial<{ displayName: string; password: string; role: 'admin' | 'user'; disabled: boolean }>) =>
    api<{ user: AdminUser }>(`admin/users/${id}`, { method: 'PATCH', body: patch }),
  remove: (id: number) => api(`admin/users/${id}`, { method: 'DELETE' }),
}
