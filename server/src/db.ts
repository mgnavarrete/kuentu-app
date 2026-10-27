import { readFile } from 'node:fs/promises'
import pg from 'pg'

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://kuentu:kuentu@localhost:5432/kuentu',
})

/** Crea las tablas si no existen. */
export async function migrate(): Promise<void> {
  const sql = await readFile(new URL('../sql/001_init.sql', import.meta.url), 'utf8')
  await pool.query(sql)
}

export interface UserRow {
  id: number
  username: string
  display_name: string
  password_hash: string
  role: 'admin' | 'user'
  disabled: boolean
  created_at: Date
  last_login_at: Date | null
}

/** Lo que se le muestra al cliente de un usuario (nunca el hash). */
export function publicUser(u: UserRow) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    role: u.role,
    disabled: u.disabled,
    createdAt: u.created_at,
    lastLoginAt: u.last_login_at,
  }
}
