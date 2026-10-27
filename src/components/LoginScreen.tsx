import { useState, type FormEvent } from 'react'
import { isInstalledApp, login, type Account } from '../lib/account'

export function LoginScreen({ onLogin, onUseLocal }: { onLogin: (account: Account) => void; onUseLocal: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onLogin(await login(username, password))
    } catch (err) {
      setError(err instanceof TypeError ? 'No hay conexión con el servidor.' : (err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <img className="login-logo" src="./brand/kuentu-long.svg" alt="Kuentu" />
        <label className="field">
          <span>Usuario</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            autoFocus
          />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary login-submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="muted small login-help">¿No tienes cuenta? Pídela a quien administra Kuentu.</p>
        {isInstalledApp && (
          <button type="button" className="btn btn-ghost login-local" onClick={onUseLocal}>
            Usar sin cuenta (solo en este dispositivo)
          </button>
        )}
      </form>
    </div>
  )
}
