import { Html } from '@react-three/drei'

function voltageColor(v) {
  if (v >  0.05) return '#00d47a'
  if (v < -0.05) return '#ff5555'
  return '#888888'
}

export function NodeVoltageLabel({ worldPos, voltage }) {
  const sign  = voltage > 0 ? '+' : ''
  const color = voltageColor(voltage)

  return (
    <Html
      position={[worldPos[0], worldPos[1] + 0.26, worldPos[2]]}
      center
      distanceFactor={6}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        background: 'var(--label-bg)',
        border: `1px solid ${color}`,
        borderRadius: 3,
        padding: '1px 5px',
        color,
        fontSize: 9,
        fontFamily: "'Courier New', monospace",
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
        userSelect: 'none',
        transition: 'color 0.4s, border-color 0.4s',
      }}>
        {sign}{voltage.toFixed(3)}V
      </div>
    </Html>
  )
}
