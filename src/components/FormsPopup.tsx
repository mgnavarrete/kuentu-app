import { useState } from 'react'
import type { Cell } from '../lib/types'
import { formGroups, PERSON_LABELS } from '../lib/morph'
import { imageUrl } from '../lib/store'

interface Props {
  cell: Cell
  /** Persona del sujeto si la última palabra del mensaje es un pronombre. */
  subject: number | null
  onPick: (text: string) => void
  onClose: () => void
}

/** Variantes de una palabra (conjugaciones, plural, género) al mantener presionado. */
export function FormsPopup({ cell, subject, onPick, onClose }: Props) {
  const isVerb = cell.wordClass === 'verb'
  const [negative, setNegative] = useState(false)
  const [tab, setTab] = useState(0)
  const groups = formGroups(cell.label, cell.wordClass, { negative, subject })
  const useTabs = groups.length > 2
  const shown = useTabs ? [groups[Math.min(tab, groups.length - 1)]] : groups
  const src = imageUrl(cell.image)

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet forms-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          {src && <img src={src} alt="" className="forms-img" />}
          <h2>{cell.label}</h2>
          {isVerb && (
            <button
              type="button"
              className={`btn ${negative ? 'btn-toggle-on' : ''}`}
              onClick={() => setNegative(!negative)}
              aria-pressed={negative}
            >
              No
            </button>
          )}
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        {useTabs && (
          <div className="tabs" role="tablist">
            {groups.map((g, i) => (
              <button
                key={g.title}
                type="button"
                role="tab"
                aria-selected={i === tab}
                className={`tab ${i === tab ? 'tab-active' : ''}`}
                onClick={() => setTab(i)}
              >
                {g.title}
              </button>
            ))}
          </div>
        )}
        <div className="forms-groups">
          {subject !== null && isVerb && tab === 0 && (
            <p className="muted small">Formas para «{PERSON_LABELS[subject]}», que está en el mensaje.</p>
          )}
          {shown.map((g) => (
            <section key={g.title}>
              {!useTabs && <h3>{g.title}</h3>}
              <div className="forms-list">
                {g.forms.map((f, i) => (
                  <button key={i} type="button" className={`form-btn wc-${cell.wordClass}`} onClick={() => onPick(f.text)}>
                    <span className="form-text">{f.text}</span>
                    {f.hint && <span className="form-hint">{f.hint}</span>}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
