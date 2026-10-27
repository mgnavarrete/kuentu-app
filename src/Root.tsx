import { useEffect, useState } from 'react'
import App from './App'
import { LoginScreen } from './components/LoginScreen'
import { checkSession, type Session } from './lib/account'

/** Decide si mostrar el inicio de sesión o la app (con cuenta o solo en este dispositivo). */
export default function Root() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    checkSession().then(setSession)
  }, [])

  if (!session) return <Splash />
  if (session.kind === 'login') return <LoginScreen onLogin={(account) => setSession({ kind: 'user', account, offline: false })} />
  const account = session.kind === 'user' ? session.account : null
  // `key`: al cambiar de cuenta la app parte de cero, sin restos del usuario anterior.
  return <App key={account?.id ?? 'local'} account={account} onLogout={() => setSession({ kind: 'login' })} />
}

export function Splash() {
  return (
    <div className="splash">
      <img src="./brand/kuentu-long-black.svg" alt="Kuentu" />
    </div>
  )
}
