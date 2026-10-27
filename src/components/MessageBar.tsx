import { useEffect, useRef } from 'react'
import type { Token } from '../lib/types'
import { imageUrl } from '../lib/store'

interface Props {
  tokens: Token[]
  draft: string
  /** El mensaje ya se dijo: el siguiente botón empieza uno nuevo. */
  faded?: boolean
  onSpeak: () => void
  onBackspace: () => void
  onClear: () => void
}

export function MessageBar({ tokens, draft, faded, onSpeak, onBackspace, onClear }: Props) {
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ left: scroller.current.scrollWidth, behavior: 'smooth' })
  }, [tokens, draft])

  const empty = tokens.length === 0 && !draft

  return (
    <div className="message-bar">
      <div className={`message ${faded ? 'message-faded' : ''}`} ref={scroller} onClick={onSpeak} role="button" aria-label="Decir mensaje">
        {empty && <span className="message-placeholder">Toca los botones para armar tu mensaje</span>}
        {tokens.map((t, i) => {
          const src = imageUrl(t.image)
          return (
            <span key={i} className="token">
              {src ? <img src={src} alt="" draggable={false} /> : <span className="token-noimg" />}
              <span>{t.text}</span>
            </span>
          )
        })}
        {draft && (
          <span className="token token-draft">
            <span className="token-noimg" />
            <span>
              {draft}
              <span className="caret" />
            </span>
          </span>
        )}
      </div>
      <div className="message-actions">
        <button type="button" className="btn-icon" onClick={onBackspace} aria-label="Borrar última palabra">
          ⌫
        </button>
        <button type="button" className="btn-icon" onClick={onClear} aria-label="Borrar todo">
          ✕
        </button>
      </div>
    </div>
  )
}
