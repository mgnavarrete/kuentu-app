import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { pool, type UserRow } from './db.ts'

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

/** Contraseña → "scrypt$<sal>$<hash>" (scrypt viene en Node, sin dependencias nativas). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scryptAsync(password, salt, 32, SCRYPT)
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, salt, hash] = stored.split('$')
  if (algo !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const actual = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length, SCRYPT)
  return timingSafeEqual(actual, expected)
}

export const MIN_PASSWORD = 6

export function normalizeUsername(name: string): string {
  return name.trim().toLowerCase()
}

export function validUsername(name: string): boolean {
  return /^[a-z0-9._-]{3,32}$/.test(name)
}

// --- Sesiones ---

export const SESSION_COOKIE = 'kuentu_session'
// Una app de comunicación no debería cerrar la sesión seguido: 90 días, renovados con el uso.
export const SESSION_DAYS = 90

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

export async function createSession(userId: number, userAgent: string): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  await pool.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at, user_agent) VALUES ($1, $2, now() + make_interval(days => $3), $4)`,
    [sha256(token), userId, SESSION_DAYS, userAgent.slice(0, 300)],
  )
  return token
}

/** Usuario dueño del token, o null si no existe, venció o el usuario está desactivado. */
export async function userFromSession(token: string | undefined): Promise<UserRow | null> {
  if (!token) return null
  const { rows } = await pool.query<UserRow & { expires_at: Date }>(
    `SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND NOT u.disabled`,
    [sha256(token)],
  )
  const user = rows[0]
  if (!user) return null
  // Renueva la sesión cuando le queda menos de la mitad.
  if (user.expires_at.getTime() - Date.now() < (SESSION_DAYS / 2) * 86400_000) {
    await pool.query(`UPDATE sessions SET expires_at = now() + make_interval(days => $2) WHERE token_hash = $1`, [sha256(token), SESSION_DAYS])
  }
  return user
}

export async function deleteSession(token: string | undefined): Promise<void> {
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)])
}

// --- Límite de intentos de inicio de sesión (en memoria; basta para un solo servidor) ---

const failures = new Map<string, { count: number; until: number }>()
const MAX_FAILURES = 5
const LOCK_MS = 5 * 60_000

export function isLocked(key: string): boolean {
  const f = failures.get(key)
  return !!f && f.count >= MAX_FAILURES && f.until > Date.now()
}

export function recordFailure(key: string): void {
  const f = failures.get(key)
  const count = f && f.until > Date.now() ? f.count + 1 : 1
  failures.set(key, { count, until: Date.now() + LOCK_MS })
}

export function clearFailures(key: string): void {
  failures.delete(key)
}
