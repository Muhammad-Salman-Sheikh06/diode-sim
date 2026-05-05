import { useEffect } from 'react'
import { useCircuitStore } from '../store/circuitStore'

export function Toast() {
  const simError    = useCircuitStore((s) => s.simError)
  const clearSimError = useCircuitStore((s) => s.clearSimError)

  useEffect(() => {
    if (!simError) return
    const t = setTimeout(clearSimError, 7000)
    return () => clearTimeout(t)
  }, [simError, clearSimError])

  if (!simError) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a0808',
        border: '1px solid #cc3333',
        borderRadius: 8,
        padding: '11px 18px',
        color: '#ff8888',
        fontSize: 12,
        fontFamily: "'Courier New', monospace",
        maxWidth: 480,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      }}
    >
      <span style={{ flex: 1, lineHeight: 1.5 }}>{simError}</span>
      <button
        onClick={clearSimError}
        style={{
          background: 'none',
          border: 'none',
          color: '#ff8888',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}
