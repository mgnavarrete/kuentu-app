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
 * App instalada (Android o Windows): trae la app adentro y se conecta al servidor de Kuentu por internet,
 * identificándose con un token. En la web, la app y la API están en el mismo dominio y se usa una cookie.
 */
export const isInstalledApp = Capacitor.isNativePlatform() || location.protocol === 'file:'
const SERVER = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'https://kuentu.minttu.cl'
const API_BASE = isInstalledApp ? `${SERVER}/api/` : './api/'

const TOKEN = 'kuentu:token'
// En la app instalada se puede elegir usarla sin cuenta; se recuerda la elección.
const LOCAL_MODE = 'kuentu:local'

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function storageSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {}
}

/** Usar la app instalada sin cuenta (todo en el dispositivo), o volver a pedir inicio de sesión. */
export function setLocalMode(on: boolean) {
  storageSet(LOCAL_MODE, on ? '1' : null)
}

/**
 * Cómo arranca la app:
 * - local: todo queda en el dispositivo (app instalada sin cuenta, o web publicada sin servidor).
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
  const headers: Record<string, string> = { 'x-kuentu': '1' }
  if (init.body !== undefined) headers['content-type'] = 'application/json'
  const token = isInstalledApp ? storageGet(TOKEN) : null
  if (token) headers.authorization = `Bearer ${token}`
  const res = await fetch(API_BASE + path, {
    method: init.method ?? 'GET',
    credentials: isInstalledApp ? 'omit' : 'same-origin',
    headers,
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
  storageSet(LAST_ACCOUNT, account ? JSON.stringify(account) : null)
}

function lastAccount(): Account | null {
  try {
    return JSON.parse(storageGet(LAST_ACCOUNT) ?? 'null')
  } catch {
    return null
  }
}

export async function checkSession(): Promise<Session> {
  if (isInstalledApp) {
    if (!storageGet(TOKEN)) return storageGet(LOCAL_MODE) ? { kind: 'local' } : { kind: 'login' }
  } else if (!location.protocol.startsWith('http')) {
    return { kind: 'local' }
  }
  try {
    const { user } = await api<{ user: Account }>('me')
    rememberAccount(user)
    return { kind: 'user', account: user, offline: false }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      rememberAccount(null)
      storageSet(TOKEN, null)
      return { kind: 'login' }
    }
    // El servidor no respondió: si ya había alguien con sesión, se sigue con su copia local.
    const account = lastAccount()
    return account ? { kind: 'user', account, offline: true } : { kind: 'local' }
  }
}

export async function login(username: string, password: string): Promise<Account> {
  const { user, token } = await api<{ user: Account; token?: string }>('login', {
    method: 'POST',
    body: isInstalledApp ? { username, password, client: 'app' } : { username, password },
  })
  if (token) storageSet(TOKEN, token)
  setLocalMode(false)
  rememberAccount(user)
  return user
}

export async function logout(): Promise<void> {
  rememberAccount(null)
  await api('logout', { method: 'POST', body: {} }).catch(() => {})
  storageSet(TOKEN, null)
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
