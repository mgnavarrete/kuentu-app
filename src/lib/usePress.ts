import { useRef } from 'react'

/**
 * Distingue un toque corto de una pulsación larga. Si el dedo se mueve (scroll), se cancela.
 */
export function usePress(onTap: () => void, onLongPress?: () => void, delay = 550) {
  const timer = useRef<number | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const longFired = useRef(false)

  const clear = () => {
    window.clearTimeout(timer.current)
    timer.current = undefined
  }

  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return
      start.current = { x: e.clientX, y: e.clientY }
      longFired.current = false
      if (onLongPress) {
        timer.current = window.setTimeout(() => {
          longFired.current = true
          navigator.vibrate?.(30)
          onLongPress()
        }, delay)
      }
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!start.current) return
      if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 12) {
        clear()
        start.current = null
      }
    },
    onPointerUp: () => {
      clear()
      if (start.current && !longFired.current) onTap()
      start.current = null
    },
    onPointerCancel: () => {
      clear()
      start.current = null
    },
    onPointerLeave: () => {
      clear()
      start.current = null
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }
}
