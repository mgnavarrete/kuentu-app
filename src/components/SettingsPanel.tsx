import { useEffect, useState } from 'react'
import type { AppData, Settings } from '../lib/types'
import { onVoicesChanged, sortVoices, speak, speechSupported, type VoiceInfo } from '../lib/speech'
import { exportBackup, importBackup } from '../lib/store'
import type { Account } from '../lib/account'
import type { SyncStatus } from '../lib/sync'

interface Props {
  data: AppData
  onChange: (patch: Partial<Settings>) => void
  onReplaceData: (data: AppData) => void
  onReset: () => void
  onClose: () => void
  account: Account | null
  syncStatus: SyncStatus
  onLogout: () => void
  onChangePassword: () => void
  onOpenAdmin: () => void
}

const SYNC_TEXT: Record<SyncStatus, string> = {
  saved: '✓ Todo guardado en el servidor',
  pending: 'Cambios por guardar…',
  saving: 'Guardando…',
  offline: 'Sin conexión: los cambios quedan en este dispositivo y se suben al volver internet',
}

export function SettingsPanel(props: Props) {
  const { data, onChange, onReplaceData, onReset, onClose, account } = props
  const s = data.settings
  const [voices, setVoices] = useState<VoiceInfo[]>([])
  useEffect(() => onVoicesChanged((v) => setVoices(sortVoices(v))), [])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet settings" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Ajustes</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="editor-body">
          {account && (
            <>
              <h3>Cuenta</h3>
              <p className="account-line">
                <strong>{account.displayName || account.username}</strong> <span className="muted">@{account.username}</span>
              </p>
              <p className={`muted small sync-${props.syncStatus}`}>{SYNC_TEXT[props.syncStatus]}</p>
              <div className="row-buttons">
                {account.role === 'admin' && (
                  <button type="button" className="btn btn-primary" onClick={props.onOpenAdmin}>
                    Administrar usuarios
                  </button>
                )}
                <button type="button" className="btn" onClick={props.onChangePassword}>
                  Cambiar contraseña
                </button>
                <button type="button" className="btn" onClick={props.onLogout}>
                  Cerrar sesión
                </button>
              </div>
            </>
          )}

          <h3>Voz</h3>
          {!speechSupported() && <p className="muted">Este navegador no tiene síntesis de voz.</p>}
          <label className="field">
            <span>Voz</span>
            <select value={s.voiceURI} onChange={(e) => onChange({ voiceURI: e.target.value })}>
              <option value="">Automática (español)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Velocidad: {s.rate.toFixed(1)}</span>
            <input type="range" min={0.5} max={1.6} step={0.1} value={s.rate} onChange={(e) => onChange({ rate: Number(e.target.value) })} />
          </label>
          <label className="field">
            <span>Tono: {s.pitch.toFixed(1)}</span>
            <input type="range" min={0.5} max={1.8} step={0.1} value={s.pitch} onChange={(e) => onChange({ pitch: Number(e.target.value) })} />
          </label>
          <button type="button" className="btn" onClick={() => speak('Hola, esta es mi voz.', s)}>
            ▶ Probar voz
          </button>

          <h3>Botones</h3>
          <label className="field">
            <span>Tamaño de la cuadrícula</span>
            <select value={s.gridSize} onChange={(e) => onChange({ gridSize: e.target.value as Settings['gridSize'] })}>
              <option value="auto">Automático según la pantalla</option>
              <option value="grande">Grande: 120 botones (tablet / computador)</option>
              <option value="mediano">Mediano: 48 botones</option>
              <option value="chico">Chico: 35 botones (celular)</option>
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={s.showLabels} onChange={(e) => onChange({ showLabels: e.target.checked })} />
            Mostrar texto en los botones
          </label>

          <h3>Mensaje</h3>
          <label className="check">
            <input type="checkbox" checked={s.speakOnTap} onChange={(e) => onChange({ speakOnTap: e.target.checked })} />
            Decir cada palabra al tocarla
          </label>
          <label className="check">
            <input type="checkbox" checked={s.smartGrammar} onChange={(e) => onChange({ smartGrammar: e.target.checked })} />
            Gramática inteligente (yo + querer → «yo quiero», el + manzana → «la manzana»)
          </label>
          <label className="field">
            <span>Quien usa la app es (para «estoy cansado / cansada»)</span>
            <select value={s.userGender} onChange={(e) => onChange({ userGender: e.target.value as Settings['userGender'] })}>
              <option value="m">Niño / hombre</option>
              <option value="f">Niña / mujer</option>
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={s.clearAfterSpeak} onChange={(e) => onChange({ clearAfterSpeak: e.target.checked })} />
            Empezar un mensaje nuevo al tocar un botón después de decirlo
          </label>
          <label className="check">
            <input type="checkbox" checked={s.returnHome} onChange={(e) => onChange({ returnHome: e.target.checked })} />
            Volver a Inicio después de elegir una palabra en una carpeta
          </label>

          <h3>Edición</h3>
          <label className="check">
            <input type="checkbox" checked={s.lockEditing} onChange={(e) => onChange({ lockEditing: e.target.checked })} />
            Bloquear edición (hay que mantener presionado «Editar» para editar)
          </label>

          <h3>Respaldo</h3>
          <div className="row wrap">
            <button type="button" className="btn" onClick={() => exportBackup(data)}>
              Descargar respaldo
            </button>
            <label className="btn">
              Restaurar respaldo
              <input
                type="file"
                accept="application/json,.json"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  try {
                    const restored = await importBackup(file)
                    if (confirm('Esto reemplazará todo tu vocabulario actual. ¿Continuar?')) onReplaceData(restored)
                  } catch (err) {
                    alert((err as Error).message)
                  }
                }}
              />
            </label>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (confirm('¿Volver al vocabulario original? Se perderán tus cambios.')) onReset()
              }}
            >
              Restablecer vocabulario
            </button>
          </div>

          <h3>Acerca de</h3>
          <img className="about-logo" src="./brand/kuentu-long.svg" alt="Kuentu" />
          <p className="about-app">
            Versión {__APP_VERSION__}
            <br />
            Creado por <strong>Menta</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
