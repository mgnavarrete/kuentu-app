// Administración de usuarios por consola (para crear el primer administrador):
//   npm run user -- create <usuario> [--admin] [--name "Nombre"]
//   npm run user -- password <usuario>
//   npm run user -- list
import { createInterface } from 'node:readline'
import { migrate, pool } from './db.ts'
import { MIN_PASSWORD, hashPassword, normalizeUsername, validUsername } from './auth.ts'

/** Pide la contraseña sin mostrarla en pantalla (o la lee de KUENTU_PASSWORD). */
function askPassword(prompt: string): Promise<string> {
  if (process.env.KUENTU_PASSWORD) return Promise.resolve(process.env.KUENTU_PASSWORD)
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput
    ;(rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s) => {
      write.call(rl, s.startsWith(prompt) ? s : '')
    }
    rl.question(prompt, (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}

async function newPassword(): Promise<string> {
  const pw = await askPassword('Contraseña: ')
  if (pw.length < MIN_PASSWORD) throw new Error(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`)
  if (!process.env.KUENTU_PASSWORD && (await askPassword('Repite la contraseña: ')) !== pw) throw new Error('Las contraseñas no coinciden')
  return pw
}

const [command, rawName, ...rest] = process.argv.slice(2)
const flag = (name: string) => rest.includes(name)
const option = (name: string) => {
  const i = rest.indexOf(name)
  return i >= 0 ? rest[i + 1] : undefined
}

try {
  await migrate()
  const username = normalizeUsername(rawName ?? '')
  if (command === 'create') {
    if (!validUsername(username)) throw new Error('Usuario inválido: 3 a 32 letras, números, puntos o guiones')
    const role = flag('--admin') ? 'admin' : 'user'
    const { rowCount } = await pool.query(
      `INSERT INTO users (username, display_name, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING`,
      [username, option('--name') ?? '', await hashPassword(await newPassword()), role],
    )
    if (!rowCount) throw new Error(`El usuario «${username}» ya existe`)
    console.log(`Usuario «${username}» creado (${role === 'admin' ? 'administrador' : 'usuario'}).`)
  } else if (command === 'password') {
    const { rowCount } = await pool.query('UPDATE users SET password_hash = $2 WHERE username = $1', [username, await hashPassword(await newPassword())])
    if (!rowCount) throw new Error(`No existe el usuario «${username}»`)
    await pool.query('DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE username = $1)', [username])
    console.log(`Contraseña de «${username}» cambiada.`)
  } else if (command === 'list') {
    const { rows } = await pool.query('SELECT username, display_name, role, disabled FROM users ORDER BY username')
    console.table(rows)
  } else {
    console.log('Uso:\n  npm run user -- create <usuario> [--admin] [--name "Nombre"]\n  npm run user -- password <usuario>\n  npm run user -- list')
  }
} catch (err) {
  console.error((err as Error).message)
  process.exitCode = 1
} finally {
  await pool.end()
}
