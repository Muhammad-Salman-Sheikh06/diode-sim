import { useEffect } from 'react'
import { useCircuitStore } from '../store/circuitStore'

const base = {
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  borderRadius: 8,
  padding: '11px 18px',
  fontSize: 12,
  fontFamily: "'Courier New', monospace",
  maxWidth: 480,
  zIndex: 200,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
}

export function Toast() {
  const simError    = useCircuitStore((s) => s.simError)
  const clearSimError = useCircuitStore((s) => s.clearSimError)
  const toastMsg    = useCircuitStore((s) => s.toastMsg)
  const clearToast  = useCircuitStore((s) => s.clearToast)

  useEffect(() => {
    if (!simError) return
    const t = setTimeout(clearSimError, 7000)
    return () => clearTimeout(t)
  }, [simError, clearSimError])

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(clearToast, 1800)
    return () => clearTimeout(t)
  }, [toastMsg, clearToast])

  if (simError) {
    return (
      <div style={{ ...base, bottom: 24, background: '#1a0808', border: '1px solid #cc3333', color: '#ff8888' }}>
        <span style={{ flex: 1, lineHeight: 1.5 }}>{simError}</span>
        <button
          onClick={clearSimError}
          style={{ background: 'none', border: 'none', color: '#ff8888', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}
        >×</button>
      </div>
    )
  }

  if (toastMsg) {
    return (
      <div style={{ ...base, bottom: 24, background: '#0a1a10', border: '1px solid #00aa55', color: '#00ff88' }}>
        <span style={{ lineHeight: 1.5 }}>{toastMsg}</span>
      </div>
    )
  }

  return null
}
