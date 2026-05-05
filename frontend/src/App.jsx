import { useEffect } from 'react'
import { CircuitEditor } from './scenes/CircuitEditor'
import { Sidebar } from './components/Sidebar'
import { Toast } from './components/Toast'
import { WaveformPanel } from './scenes/WaveformPanel'
import { useCircuitStore } from './store/circuitStore'

export default function App() {
  const clearActiveType = useCircuitStore((s) => s.clearActiveType)
  const cancelWiring    = useCircuitStore((s) => s.cancelWiring)
  const removeWire      = useCircuitStore((s) => s.removeWire)
  const selectedWireId  = useCircuitStore((s) => s.selectedWireId)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        clearActiveType()
        cancelWiring()
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWireId) {
        removeWire(selectedWireId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearActiveType, cancelWiring, removeWire, selectedWireId])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#040d08',
    }}>
      {/* Main row: sidebar + canvas */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, position: 'relative' }}>
          <CircuitEditor />
        </div>
      </div>

      {/* Waveform panel sits below — only mounts when transient data exists */}
      <WaveformPanel />

      <Toast />
    </div>
  )
}
