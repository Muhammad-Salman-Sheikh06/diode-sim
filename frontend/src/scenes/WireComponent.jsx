import { memo, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Color, LineCurve3, MathUtils, Vector3 } from 'three'
import { useCircuitStore } from '../store/circuitStore'
import { COMPONENT_DEFS, getNodeWorldPos } from './componentDefs'

// Colour palette for voltage-coded wires
const C_DEFAULT  = new Color('#e8a020')   // no simulation — amber
const C_GROUND   = new Color('#1c2a1c')   // 0 V — very dark green
const C_POSITIVE = new Color('#00e85a')   // high positive — bright green
const C_NEGATIVE = new Color('#cc2200')   // negative — red
const _tmp       = new Color()            // reused scratch colour

function voltageToColor(v) {
  if (v === undefined || v === null) return C_DEFAULT
  if (Math.abs(v) < 0.05) return C_GROUND
  if (v > 0) {
    const t = Math.min(v / 5, 1)
    return _tmp.lerpColors(C_GROUND, C_POSITIVE, t)
  }
  return _tmp.lerpColors(C_GROUND, C_NEGATIVE, Math.min(-v / 5, 1))
}

// Exponential lerp
const elerp = (a, b, delta, speed = 4) =>
  MathUtils.lerp(a, b, 1 - Math.exp(-delta * speed))

export const WireComponent = memo(function WireComponent({ wire }) {
  const [hovered, setHovered] = useState(false)
  const matRef = useRef()

  // Derive geometry positions from current component list
  const { components, selectedWireId, selectWire, removeWire } =
    useCircuitStore()

  const fromComp = components.find((c) => c.id === wire.fromComponentId)
  const toComp   = components.find((c) => c.id === wire.toComponentId)

  const from = fromComp ? getNodeWorldPos(fromComp, wire.fromNode) : [0, 0, 0]
  const to   = toComp   ? getNodeWorldPos(toComp,   wire.toNode)   : [0, 0.001, 0]

  const curve = useMemo(
    () => new LineCurve3(new Vector3(...from), new Vector3(...to)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [from[0], from[1], from[2], to[0], to[1], to[2]]
  )

  // Mid-point for the hover tooltip
  const mid = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + 0.15,
    (from[2] + to[2]) / 2,
  ]

  // ── Animation: lerp colour toward voltage-coded target ─────────────────────
  useFrame((_, delta) => {
    if (!matRef.current) return
    const { simVoltages, selectedWireId: selId } = useCircuitStore.getState()

    const isSelected = selId === wire.id
    let targetColor

    if (isSelected) {
      targetColor = new Color('#ff4444')
    } else {
      const voltage = simVoltages?.[`${wire.fromComponentId}:${wire.fromNode}`]
      targetColor = voltageToColor(voltage)
    }

    matRef.current.color.lerp(targetColor, elerp(0, 1, delta))
    matRef.current.emissive.lerp(targetColor, elerp(0, 1, delta))
    matRef.current.emissiveIntensity = elerp(
      matRef.current.emissiveIntensity,
      isSelected ? 0.7 : 0.18,
      delta,
    )
  })

  // ── Current tooltip label ──────────────────────────────────────────────────
  function CurrentTooltip() {
    const { simCurrents, components: comps } = useCircuitStore.getState()

    // Prefer backend-reported current; fall back to V/R for resistors
    let mA = null
    if (simCurrents) {
      const fromCurrent = simCurrents[wire.fromComponentId]
      const toCurrent   = simCurrents[wire.toComponentId]
      const raw = fromCurrent ?? toCurrent ?? null
      if (raw !== null) mA = Math.abs(raw) * 1000
    }

    if (mA === null) {
      // Fallback: Ohm's law for a resistor endpoint
      const { simVoltages } = useCircuitStore.getState()
      if (simVoltages) {
        const tryComp = (cid, n1, n2, type) => {
          if (type !== 'resistor') return null
          const va = simVoltages[`${cid}:A`]
          const vb = simVoltages[`${cid}:B`]
          if (va !== undefined && vb !== undefined) {
            return Math.abs(va - vb) // ΔV across 1 kΩ → mA directly
          }
          return null
        }
        const fc = comps.find((c) => c.id === wire.fromComponentId)
        const tc = comps.find((c) => c.id === wire.toComponentId)
        mA = tryComp(wire.fromComponentId, 'A', 'B', fc?.type)
          ?? tryComp(wire.toComponentId,   'A', 'B', tc?.type)
      }
    }

    if (mA === null) return null

    return (
      <Html position={mid} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(0,8,4,0.92)',
          border: '1px solid #ffaa00',
          borderRadius: 3,
          padding: '2px 6px',
          color: '#ffaa00',
          fontSize: 9,
          fontFamily: "'Courier New', monospace",
          whiteSpace: 'nowrap',
        }}>
          {mA.toFixed(2)} mA
        </div>
      </Html>
    )
  }

  if (!fromComp || !toComp) return null

  const isSelected = selectedWireId === wire.id

  return (
    <group>
      <mesh
        onClick={(e) => { e.stopPropagation(); selectWire(wire.id) }}
        onContextMenu={(e) => { e.stopPropagation(); removeWire(wire.id) }}
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerLeave={() => setHovered(false)}
      >
        <tubeGeometry args={[curve, 1, isSelected ? 0.04 : 0.03, 6, false]} />
        <meshStandardMaterial
          ref={matRef}
          color={C_DEFAULT}
          emissive={C_DEFAULT}
          emissiveIntensity={0.18}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>

      {hovered && <CurrentTooltip />}
    </group>
  )
})
