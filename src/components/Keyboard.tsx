interface Props {
  draft: string
  predictions: string[]
  onKey: (ch: string) => void
  onBackspace: () => void
  onSpace: () => void
  onPredict: (word: string) => void
  onPhrase: (text: string) => void
}

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
  ['á', 'é', 'í', 'ó', 'ú', '¿', '?', '¡', '!'],
]

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'])
const QUICK = ['uups, eso no', 'espera', 'lo voy a deletrear', 'algo va mal']

export function Keyboard({ draft, predictions, onKey, onBackspace, onSpace, onPredict, onPhrase }: Props) {
  return (
    <div className="keyboard">
      <div className="predictions">
        {predictions.map((w) => (
          <button key={w} type="button" className="prediction" onClick={() => onPredict(w)}>
            {w}
          </button>
        ))}
        {predictions.length === 0 && <span className="prediction-empty">{draft ? 'Sin sugerencias' : ''}</span>}
      </div>
      {ROWS.map((row, i) => (
        <div key={i} className="key-row">
          {row.map((k) => (
            <button
              key={k}
              type="button"
              className={`key ${VOWELS.has(k) ? 'key-vowel' : ''} ${/\d/.test(k) ? 'key-number' : ''}`}
              onClick={() => onKey(k)}
            >
              {k}
            </button>
          ))}
          {i === 3 && (
            <button type="button" className="key key-wide" onClick={onBackspace} aria-label="Borrar">
              ⌫
            </button>
          )}
        </div>
      ))}
      <div className="key-row">
        <button type="button" className="key key-space" onClick={onSpace}>
          espacio
        </button>
      </div>
      <div className="key-row quick-row">
        {QUICK.map((q) => (
          <button key={q} type="button" className="key key-quick" onClick={() => onPhrase(q)}>
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
