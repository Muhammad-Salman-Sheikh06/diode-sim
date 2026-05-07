import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { COMPONENT_DEFS, LED_COLORS, getNodeWorldPos } from './componentDefs'
import { useCircuitStore } from '../store/circuitStore'
import { ResistorMesh }    from './meshes/ResistorMesh'
import { CapacitorMesh }   from './meshes/CapacitorMesh'
import { LEDMesh }         from './meshes/LEDMesh'
import { BatteryMesh }     from './meshes/BatteryMesh'
import { GroundMesh }      from './meshes/GroundMesh'
import { TransistorMesh }  from './meshes/TransistorMesh'
import { PotMesh }         from './meshes/PotMesh'
import { JunctionMesh }    from './meshes/JunctionMesh'
import { OpAmpMesh }       from './meshes/OpAmpMesh'
import { MOSFETMesh }      from './meshes/MOSFETMesh'
import { InductorMesh }    from './meshes/InductorMesh'

const elerp = (a, b, delta, speed = 4) =>
  MathUtils.lerp(a, b, 1 - Math.exp(-delta * speed))

// Ghost preview for switch (open state, no interaction)
function SwitchBodyMesh({ matRef, opacity }) {
  const t = opacity < 1
  return (
    <>
      <mesh position={[-0.22, 0, 0]}>
        <boxGeometry args={[0.28, 0.14, 0.20]} />
        <meshStandardMaterial ref={matRef} color="#8a7a2a" emissive="#8a7a2a" emissiveIntensity={0} metalness={0.6} roughness={0.3} transparent={t} opacity={opacity} />
      </mesh>
      <mesh position={[0.22, 0, 0]}>
        <boxGeometry args={[0.28, 0.14, 0.20]} />
        <meshStandardMaterial color="#8a7a2a" metalness={0.6} roughness={0.3} transparent={t} opacity={opacity} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.26, 0.06, 0.18]} />
        <meshStandardMaterial color="#0a0f0a" transparent={t} opacity={opacity} />
      </mesh>
    </>
  )
}

const MESH_MAP = {
  resistor:        ResistorMesh,
  capacitor:       CapacitorMesh,
  led:             LEDMesh,
  voltage_source:  BatteryMesh,
  ground:          GroundMesh,
  npn_transistor:  TransistorMesh,
  potentiometer:   PotMesh,
  junction:        JunctionMesh,
  switch:          SwitchBodyMesh,
  op_amp:          OpAmpMesh,
  nmos_transistor: MOSFETMesh,
  inductor:        InductorMesh,
}

// Rotation is handled entirely by the parent <group> in CircuitEditor — this
// component only positions itself at the correct yOffset above the grid.
export const ComponentMesh = memo(function ComponentMesh({ type, opacity = 1, id }) {
  const def = COMPONENT_DEFS[type]
  const matRef = useRef()

  const ledColorKey = useCircuitStore((s) =>
    type === 'led' && id
      ? (s.components.find(c => c.id === id)?.props?.color ?? 'red')
      : 'red'
  )
  const ledHex = LED_COLORS[ledColorKey]?.hex ?? LED_COLORS.red.hex

  useFrame((_, delta) => {
    if (!matRef.current) return
    const { simVoltages, selectedComponentId } = useCircuitStore.getState()
    const isSelected = !!id && selectedComponentId === id
    let targetIntensity = 0

    if (simVoltages && id && def?.nodes) {
      if (type === 'led') {
        const va = simVoltages[`${id}:A`] ?? null
        const vk = simVoltages[`${id}:K`] ?? null
        if (va !== null && vk !== null) {
          const vf = va - vk
          targetIntensity = vf > 1.5 ? Math.min(vf / 2.0, 1) * 2.4 : 0
        }
      } else {
        const hasVoltage = def.nodes.some((n) => {
          const v = simVoltages[`${id}:${n.id}`]
          return v !== undefined && Math.abs(v) > 0.05
        })
        targetIntensity = hasVoltage ? 0.10 : 0
      }
    }

    if (isSelected) targetIntensity = Math.max(targetIntensity, 0.38)

    matRef.current.emissiveIntensity = elerp(
      matRef.current.emissiveIntensity,
      targetIntensity,
      delta,
    )
  })

  if (!def) return null
  const MeshComponent = MESH_MAP[type]
  if (!MeshComponent) return null

  const handleClick = (e) => {
    e.stopPropagation()
    if (!id) return
    const { activeType, wiringFrom, completeWiring, selectComponent } =
      useCircuitStore.getState()
    if (activeType) return  // placement mode — do nothing

    if (!wiringFrom) {
      // Nothing active — select for properties
      selectComponent(id)
      return
    }

    // Wiring mode — snap-complete to the nearest node on this component
    if (wiringFrom.componentId === id) return  // don't wire to self
    const component = useCircuitStore.getState().components.find((c) => c.id === id)
    if (!component || !def?.nodes?.length) return

    let nearestId = null, nearestDist = Infinity
    for (const nd of def.nodes) {
      const np = getNodeWorldPos(component, nd.id)
      const d = Math.sqrt((e.point.x - np[0]) ** 2 + (e.point.y - np[1]) ** 2 + (e.point.z - np[2]) ** 2)
      if (d < nearestDist) { nearestDist = d; nearestId = nd.id }
    }
    if (nearestId) completeWiring(id, nearestId)
  }

  return (
    <group position={[0, def.yOffset, 0]} onClick={handleClick}>
      <MeshComponent matRef={matRef} opacity={opacity} color={type === 'led' ? ledHex : undefined} />
    </group>
  )
})
