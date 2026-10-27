import { useEffect, useState, type FormEvent } from 'react'
import { admin, type Account, type AdminUser } from '../lib/account'

const MIN_PASSWORD = 6

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : 'nunca'
}

/** Administración de cuentas: crear, cambiar contraseña, desactivar y eliminar. */
export function AdminPanel({ me, onClose }: { me: Account; onClose: () => void }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const reload = () =>
    admin
      .list()
      .then(setUsers)
      .catch((err) => setError((err as Error).message))
  useEffect(() => {
    reload()
  }, [])

  async function run(action: () => Promise<unknown>) {
    setError('')
    try {
      await action()
      await reload()
    } catch (err) {
      setError(err instanceof TypeError ? 'No hay conexión con el servidor.' : (err as Error).message)
    }
  }

  function resetPassword(u: AdminUser) {
    const password = prompt(`Nueva contraseña para «${u.username}» (mínimo ${MIN_PASSWORD} caracteres):`)
    if (password === null) return
    if (password.length < MIN_PASSWORD) return setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`)
    run(() => admin.update(u.id, { password }))
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet admin" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Usuarios</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="editor-body">
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          {creating ? (
            <NewUserForm
              onCancel={() => setCreating(false)}
              onCreate={(u) =>
                run(async () => {
                  await admin.create(u)
                  setCreating(false)
                })
              }
            />
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
              + Nuevo usuario
            </button>
          )}

          {!users && !error && <p className="muted">Cargando…</p>}
          <ul className="user-list">
            {users?.map((u) => (
              <li key={u.id} className={`user-item ${u.disabled ? 'user-disabled' : ''}`}>
                <div className="user-info">
                  <strong>{u.displayName || u.username}</strong>
                  <span className="muted small">
                    @{u.username}
                    {u.role === 'admin' && ' · administrador'}
                    {u.disabled && ' · desactivado'}
                  </span>
                  <span className="muted small">
                    Último ingreso: {formatDate(u.lastLoginAt)} · Tablero guardado: {formatDate(u.dataUpdatedAt)}
                  </span>
                </div>
                <div className="user-actions">
                  <button type="button" className="btn btn-small" onClick={() => resetPassword(u)}>
                    Contraseña
                  </button>
                  {u.id !== me.id && (
                    <>
                      <button type="button" className="btn btn-small" onClick={() => run(() => admin.update(u.id, { disabled: !u.disabled }))}>
                        {u.disabled ? 'Activar' : 'Desactivar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        onClick={() => {
                          if (confirm(`¿Eliminar a «${u.username}» y su tablero? No se puede deshacer.`)) run(() => admin.remove(u.id))
                        }}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function NewUserForm({
  onCreate,
  onCancel,
}: {
  onCreate: (u: { username: string; displayName: string; password: string; role: 'admin' | 'user' }) => void
  onCancel: () => void
}) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    onCreate({ username, displayName, password, role: isAdmin ? 'admin' : 'user' })
  }

  return (
    <form className="new-user" onSubmit={submit}>
      <label className="field">
        <span>Nombre</span>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Sofía" />
      </label>
      <label className="field">
        <span>Usuario (para entrar, sin espacios)</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
          pattern="[a-z0-9._\-]{3,32}"
          autoCapitalize="none"
          required
        />
      </label>
      <label className="field">
        <span>Contraseña (mínimo {MIN_PASSWORD})</span>
        <input value={password} onChange={(e) => setPassword(e.target.value)} minLength={MIN_PASSWORD} required autoComplete="new-password" />
      </label>
      <label className="check">
        <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
        Administrador (puede crear y editar usuarios)
      </label>
      <div className="row-buttons">
        <button type="button" className="btn" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Crear
        </button>
      </div>
    </form>
  )
}
