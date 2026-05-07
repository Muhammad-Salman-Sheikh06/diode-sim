import { memo, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Color, LineCurve3, MathUtils, Quaternion, Vector3 } from 'three'
import { useCircuitStore } from '../store/circuitStore'
import { COMPONENT_DEFS, getNodeWorldPos } from './componentDefs'

// ── Colour palette ─────────────────────────────────────────────────────────────
const C_DEFAULT  = new Color('#e8a020')
const C_GROUND   = new Color('#1c2a1c')
const C_POSITIVE = new Color('#00e85a')
const C_NEGATIVE = new Color('#cc2200')
const C_SELECTED = new Color('#ff4444')
const _tmp       = new Color()   // scratch — voltageToColor writes here

function voltageToColor(v) {
  if (v === undefined || v === null) return C_DEFAULT
  if (Math.abs(v) < 0.05) return C_GROUND
  if (v > 0) return _tmp.lerpColors(C_GROUND, C_POSITIVE, Math.min(v / 5, 1))
  return _tmp.lerpColors(C_GROUND, C_NEGATIVE, Math.min(-v / 5, 1))
}

const elerp = (a, b, delta, speed = 4) =>
  MathUtils.lerp(a, b, 1 - Math.exp(-delta * speed))

// ── Arrow constants ────────────────────────────────────────────────────────────
const N_ARROWS       = 3
const ARROW_RADIUS   = 0.06
const ARROW_HEIGHT   = 0.15
const MIN_CURRENT_MA = 0.1
const _UP            = new Vector3(0, 1, 0)   // module-level, never mutated

export const WireComponent = memo(function WireComponent({ wire }) {
  const [hovered, setHovered] = useState(false)
  const matRef = useRef()

  const {
    components, selectedWireId, selectWire, removeWire,
    simCurrents, simVoltages,
  } = useCircuitStore()

  const fromComp = components.find((c) => c.id === wire.fromComponentId)
  const toComp   = components.find((c) => c.id === wire.toComponentId)

  const from = fromComp ? getNodeWorldPos(fromComp, wire.fromNode) : [0, 0, 0]
  const to   = toComp   ? getNodeWorldPos(toComp,   wire.toNode)   : [0, 0.001, 0]

  const curve = useMemo(
    () => new LineCurve3(new Vector3(...from), new Vector3(...to)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [from[0], from[1], from[2], to[0], to[1], to[2]]
  )

  const mid = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + 0.15,
    (from[2] + to[2]) / 2,
  ]

  // ── Current / arrow parameters ─────────────────────────────────────────────
  // Magnitude: prefer fromComponent's branch current, fall back to toComponent's
  const rawAmps =
    simCurrents?.[wire.fromComponentId] ??
    simCurrents?.[wire.toComponentId]   ??
    null

  const currentMa  = rawAmps !== null ? Math.abs(rawAmps) * 1000 : null
  const showArrows  = currentMa !== null && currentMa >= MIN_CURRENT_MA

  // Direction: if endpoint voltages differ clearly, use that; otherwise draw forward
  const fromV  = simVoltages?.[`${wire.fromComponentId}:${wire.fromNode}`]
  const toV    = simVoltages?.[`${wire.toComponentId}:${wire.toNode}`]
  const forward =
    fromV === undefined || toV === undefined || Math.abs(fromV - toV) < 0.01
      ? true
      : fromV >= toV

  // Speed: sqrt-scaled so even 1 mA is visible; capped at 2 cycles/s
  const arrowSpeed = showArrows ? Math.min(Math.sqrt(currentMa) / 4, 2) : 0

  // Quaternion: rotate cone (default tip = +Y) to point along the wire direction
  const arrowQuat = useMemo(() => {
    const dir = new Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2])
    if (dir.lengthSq() < 1e-8) return new Quaternion()
    dir.normalize()
    if (!forward) dir.negate()
    return new Quaternion().setFromUnitVectors(_UP, dir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], from[2], to[0], to[1], to[2], forward])

  // Imperative refs for useFrame updates
  const arrowMeshRefs = useRef([])
  const arrowMatRefs  = useRef([])
  const arrowOffset   = useRef(0)
  // Keep latest world positions available inside useFrame without stale closures
  const fromVecRef    = useRef(new Vector3())
  const toVecRef      = useRef(new Vector3())
  fromVecRef.current.set(from[0], from[1], from[2])
  toVecRef.current.set(to[0], to[1], to[2])

  useFrame((_, delta) => {
    // ── Wire tube: lerp toward voltage-coded colour ──────────────────────────
    if (matRef.current) {
      const { simVoltages: sv, selectedWireId: selId } = useCircuitStore.getState()
      const isSelected  = selId === wire.id
      const targetColor = isSelected
        ? C_SELECTED
        : voltageToColor(sv?.[`${wire.fromComponentId}:${wire.fromNode}`])

      matRef.current.color.lerp(targetColor, elerp(0, 1, delta))
      matRef.current.emissive.lerp(targetColor, elerp(0, 1, delta))
      matRef.current.emissiveIntensity = elerp(
        matRef.current.emissiveIntensity,
        isSelected ? 0.7 : 0.18,
        delta,
      )
    }

    // ── Current arrows: advance offset and update positions + colour ─────────
    if (!showArrows) return

    arrowOffset.current = (arrowOffset.current + arrowSpeed * delta) % 1

    for (let i = 0; i < N_ARROWS; i++) {
      const mesh = arrowMeshRefs.current[i]
      if (!mesh) continue

      const t = (arrowOffset.current + i / N_ARROWS) % 1
      mesh.position.lerpVectors(fromVecRef.current, toVecRef.current, t)

      // Match arrow colour to the wire tube's current colour
      const mat = arrowMatRefs.current[i]
      if (mat && matRef.current) {
        mat.color.copy(matRef.current.color)
        mat.emissive.copy(matRef.current.color)
      }
    }
  })

  // ── Current tooltip (shown on hover) ──────────────────────────────────────
  function CurrentTooltip() {
    const { simCurrents: sc, components: comps } = useCircuitStore.getState()

    let mA = null
    if (sc) {
      const raw = sc[wire.fromComponentId] ?? sc[wire.toComponentId] ?? null
      if (raw !== null) mA = Math.abs(raw) * 1000
    }

    // Fallback: Ohm's law across a resistor endpoint
    if (mA === null) {
      const { simVoltages: sv } = useCircuitStore.getState()
      if (sv) {
        const tryResistor = (cid, comp) => {
          if (comp?.type !== 'resistor') return null
          const va = sv[`${cid}:A`], vb = sv[`${cid}:B`]
          return va !== undefined && vb !== undefined ? Math.abs(va - vb) : null
        }
        const fc = comps.find((c) => c.id === wire.fromComponentId)
        const tc = comps.find((c) => c.id === wire.toComponentId)
        mA = tryResistor(wire.fromComponentId, fc) ?? tryResistor(wire.toComponentId, tc)
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
      {/* Wire tube */}
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

      {/* Current-flow arrows — only after simulation with sufficient current */}
      {showArrows && Array.from({ length: N_ARROWS }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { arrowMeshRefs.current[i] = el }}
          quaternion={arrowQuat}
        >
          <coneGeometry args={[ARROW_RADIUS, ARROW_HEIGHT, 6]} />
          <meshStandardMaterial
            ref={(el) => { arrowMatRefs.current[i] = el }}
            color={C_POSITIVE}
            emissive={C_POSITIVE}
            emissiveIntensity={1.5}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      ))}

      {hovered && <CurrentTooltip />}
    </group>
  )
})
