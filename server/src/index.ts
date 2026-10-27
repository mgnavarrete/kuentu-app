import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import cookie from '@fastify/cookie'
import { migrate, pool, publicUser, type UserRow } from './db.ts'
import {
  MIN_PASSWORD,
  SESSION_COOKIE,
  SESSION_DAYS,
  clearFailures,
  createSession,
  deleteSession,
  hashPassword,
  isLocked,
  normalizeUsername,
  recordFailure,
  userFromSession,
  validUsername,
  verifyPassword,
} from './auth.ts'

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
  // Detrás de Nginx: la IP real llega en X-Forwarded-For.
  trustProxy: true,
})
await app.register(cookie)

const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true'

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserRow
  }
}

// Protección CSRF: toda petición que modifica algo debe traer este encabezado, que un formulario
// de otro sitio no puede enviar sin permiso (junto con la cookie SameSite=Lax).
app.addHook('onRequest', async (req, reply) => {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.headers['x-kuentu'] !== '1') {
    return reply.code(403).send({ error: 'Petición no permitida' })
  }
})

async function requireUser(req: FastifyRequest, reply: FastifyReply) {
  const user = await userFromSession(req.cookies[SESSION_COOKIE])
  if (!user) return reply.code(401).send({ error: 'Inicia sesión' })
  req.user = user
}

async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await requireUser(req, reply)
  if (reply.sent) return
  if (req.user!.role !== 'admin') return reply.code(403).send({ error: 'Solo para administradores' })
}

app.get('/api/health', async () => ({ ok: true }))

// --- Sesión ---

app.post<{ Body: { username: string; password: string } }>(
  '/api/login',
  {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: { username: { type: 'string', maxLength: 64 }, password: { type: 'string', maxLength: 200 } },
      },
    },
  },
  async (req, reply) => {
    const username = normalizeUsername(req.body.username)
    const key = `${req.ip}|${username}`
    if (isLocked(key)) return reply.code(429).send({ error: 'Demasiados intentos. Espera 5 minutos.' })

    const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE username = $1', [username])
    const user = rows[0]
    const ok = user && !user.disabled && (await verifyPassword(req.body.password, user.password_hash))
    if (!ok) {
      recordFailure(key)
      return reply.code(401).send({ error: 'Usuario o contraseña incorrectos' })
    }
    clearFailures(key)
    const token = await createSession(user.id, req.headers['user-agent'] ?? '')
    await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id])
    reply.setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DAYS * 86400,
    })
    return { user: publicUser(user) }
  },
)

app.post('/api/logout', async (req, reply) => {
  await deleteSession(req.cookies[SESSION_COOKIE])
  reply.clearCookie(SESSION_COOKIE, { path: '/' })
  return { ok: true }
})

app.get('/api/me', { preHandler: requireUser }, async (req) => ({ user: publicUser(req.user!) }))

app.post<{ Body: { current: string; password: string } }>(
  '/api/me/password',
  {
    preHandler: requireUser,
    schema: {
      body: {
        type: 'object',
        required: ['current', 'password'],
        properties: { current: { type: 'string' }, password: { type: 'string', minLength: MIN_PASSWORD, maxLength: 200 } },
      },
    },
  },
  async (req, reply) => {
    if (!(await verifyPassword(req.body.current, req.user!.password_hash)))
      return reply.code(400).send({ error: 'La contraseña actual no es correcta' })
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [await hashPassword(req.body.password), req.user!.id])
    return { ok: true }
  },
)

// --- Datos del usuario (tableros, ajustes, recientes) ---

app.get('/api/data', { preHandler: requireUser }, async (req) => {
  const { rows } = await pool.query('SELECT data, version FROM boards WHERE user_id = $1', [req.user!.id])
  return rows[0] ?? { data: null, version: 0 }
})

app.put<{ Body: { data: { version: number; boards: object }; baseVersion: number } }>(
  '/api/data',
  {
    preHandler: requireUser,
    // Los tableros pueden traer fotos propias.
    bodyLimit: 30 * 1024 * 1024,
    schema: {
      body: {
        type: 'object',
        required: ['data', 'baseVersion'],
        properties: {
          baseVersion: { type: 'integer', minimum: 0 },
          data: { type: 'object', required: ['version', 'boards'] },
        },
      },
    },
  },
  async (req, reply) => {
    const { data, baseVersion } = req.body
    const userId = req.user!.id
    // Solo se guarda si nadie más guardó desde la versión que tenía este dispositivo.
    const updated =
      baseVersion === 0
        ? await pool.query(
            `INSERT INTO boards (user_id, data, version) VALUES ($1, $2, 1) ON CONFLICT (user_id) DO NOTHING RETURNING version`,
            [userId, data],
          )
        : await pool.query(
            `UPDATE boards SET data = $2, version = version + 1, updated_at = now()
             WHERE user_id = $1 AND version = $3 RETURNING version`,
            [userId, data, baseVersion],
          )
    if (updated.rows[0]) return { version: updated.rows[0].version }
    const { rows } = await pool.query('SELECT data, version FROM boards WHERE user_id = $1', [userId])
    return reply.code(409).send({ error: 'Se guardó desde otro dispositivo', ...rows[0] })
  },
)

// --- Administración de usuarios ---

app.get('/api/admin/users', { preHandler: requireAdmin }, async () => {
  const { rows } = await pool.query<UserRow & { updated_at: Date | null }>(
    `SELECT u.*, b.updated_at FROM users u LEFT JOIN boards b ON b.user_id = u.id ORDER BY u.username`,
  )
  return { users: rows.map((u) => ({ ...publicUser(u), dataUpdatedAt: u.updated_at })) }
})

const userFields = {
  displayName: { type: 'string', maxLength: 100 },
  password: { type: 'string', minLength: MIN_PASSWORD, maxLength: 200 },
  role: { type: 'string', enum: ['admin', 'user'] },
  disabled: { type: 'boolean' },
}

app.post<{ Body: { username: string; displayName?: string; password: string; role?: 'admin' | 'user' } }>(
  '/api/admin/users',
  {
    preHandler: requireAdmin,
    schema: {
      body: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, ...userFields } },
    },
  },
  async (req, reply) => {
    const username = normalizeUsername(req.body.username)
    if (!validUsername(username))
      return reply.code(400).send({ error: 'El usuario debe tener de 3 a 32 letras, números, puntos o guiones, sin espacios' })
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (username, display_name, password_hash, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING RETURNING *`,
      [username, req.body.displayName ?? '', await hashPassword(req.body.password), req.body.role ?? 'user'],
    )
    if (!rows[0]) return reply.code(409).send({ error: 'Ese nombre de usuario ya existe' })
    return { user: publicUser(rows[0]) }
  },
)

app.patch<{ Params: { id: string }; Body: { displayName?: string; password?: string; role?: 'admin' | 'user'; disabled?: boolean } }>(
  '/api/admin/users/:id',
  { preHandler: requireAdmin, schema: { body: { type: 'object', properties: userFields } } },
  async (req, reply) => {
    const id = Number(req.params.id)
    const { displayName, password, role, disabled } = req.body
    if (id === req.user!.id && (disabled || role === 'user'))
      return reply.code(400).send({ error: 'No puedes desactivarte ni quitarte el rol de administrador a ti mismo' })
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET
         display_name = COALESCE($2, display_name),
         password_hash = COALESCE($3, password_hash),
         role = COALESCE($4, role),
         disabled = COALESCE($5, disabled)
       WHERE id = $1 RETURNING *`,
      [id, displayName ?? null, password ? await hashPassword(password) : null, role ?? null, disabled ?? null],
    )
    if (!rows[0]) return reply.code(404).send({ error: 'Usuario no encontrado' })
    // Al cambiar la contraseña o desactivar, se cierran sus sesiones abiertas.
    if (password || disabled) await pool.query('DELETE FROM sessions WHERE user_id = $1', [id])
    return { user: publicUser(rows[0]) }
  },
)

app.delete<{ Params: { id: string } }>('/api/admin/users/:id', { preHandler: requireAdmin }, async (req, reply) => {
  const id = Number(req.params.id)
  if (id === req.user!.id) return reply.code(400).send({ error: 'No puedes eliminar tu propia cuenta' })
  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id])
  if (!rowCount) return reply.code(404).send({ error: 'Usuario no encontrado' })
  return { ok: true }
})

// Limpieza diaria de sesiones vencidas.
setInterval(() => pool.query('DELETE FROM sessions WHERE expires_at < now()').catch(() => {}), 86400_000).unref()

await migrate()
await app.listen({ port: Number(process.env.PORT ?? 3000), host: process.env.HOST ?? '127.0.0.1' })
