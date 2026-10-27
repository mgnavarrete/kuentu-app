import type { ReactNode } from 'react'
import { usePress } from '../lib/usePress'

interface Props {
  atHome: boolean
  keyboard: boolean
  editing: boolean
  lockEditing: boolean
  onHome: () => void
  onBack: () => void
  onKeyboard: () => void
  onEdit: () => void
  onUnlockEdit: () => void
  onSearch: () => void
  onSettings: () => void
}

const ICONS = {
  home: (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M6 9.5V20h4.5v-5.5h3V20H18V9.5" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  keyboard: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <path d="M6 10h1M9.5 10h1M13 10h1M16.5 10h1M6 13.5h1M17 13.5h1M9 14.5h6" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20l1-4.5L15.5 5a2 2 0 0 1 3 0l.5.5a2 2 0 0 1 0 3L8.5 19 4 20z" />
      <path d="M13.5 7l3.5 3.5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
      <circle cx="12" cy="12" r="6.5" />
    </>
  ),
}

/** Barra fija inferior con las funciones principales, siempre a mano. */
export function BottomNav(p: Props) {
  const editPress = usePress(p.onEdit, p.lockEditing && !p.editing ? p.onUnlockEdit : undefined, 1500)
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <NavItem icon={ICONS.back} label="Atrás" onClick={p.onBack} disabled={p.atHome && !p.keyboard} />
      <NavItem
        icon={p.keyboard ? ICONS.grid : ICONS.keyboard}
        label={p.keyboard ? 'Pictos' : 'Teclado'}
        onClick={p.onKeyboard}
        active={p.keyboard}
      />
      <NavItem icon={ICONS.home} label="Inicio" onClick={p.onHome} disabled={p.atHome && !p.keyboard} />
      <NavItem icon={ICONS.search} label="Buscar" onClick={p.onSearch} />
      <button
        type="button"
        className={`nav-item ${p.editing ? 'nav-active' : ''}`}
        aria-pressed={p.editing}
        title={p.lockEditing && !p.editing ? 'Mantén presionado para editar' : undefined}
        {...editPress}
      >
        <NavIcon>{ICONS.edit}</NavIcon>
        <span>{p.editing ? 'Listo' : 'Editar'}</span>
      </button>
      <NavItem icon={ICONS.settings} label="Ajustes" onClick={p.onSettings} />
    </nav>
  )
}

function NavItem({ icon, label, onClick, disabled, active }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button type="button" className={`nav-item ${active ? 'nav-active' : ''}`} onClick={onClick} disabled={disabled} aria-pressed={active}>
      <NavIcon>{icon}</NavIcon>
      <span>{label}</span>
    </button>
  )
}

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="nav-svg" aria-hidden="true">
      {children}
    </svg>
  )
}
