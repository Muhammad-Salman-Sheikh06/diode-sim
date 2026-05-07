import { useCircuitStore } from '../store/circuitStore'
import { COMPONENT_DEFS } from './componentDefs'

const C_HOUSING  = '#1e2018'
const C_CONTACT  = '#9a8a30'
const C_BRIDGE   = '#ffe060'
const C_RECESS   = '#080c08'

export function SwitchMesh({ component }) {
  const activeType          = useCircuitStore((s) => s.activeType)
  const wiringFrom          = useCircuitStore((s) => s.wiringFrom)
  const updateComponentState = useCircuitStore((s) => s.updateComponentState)
  const selectComponent     = useCircuitStore((s) => s.selectComponent)
  const isSelected          = useCircuitStore((s) => s.selectedComponentId === component.id)

  const closed = component.state?.closed ?? false
  const { yOffset } = COMPONENT_DEFS.switch

  const handleClick = (e) => {
    e.stopPropagation()
    if (activeType || wiringFrom) return
    selectComponent(component.id)
    updateComponentState(component.id, { closed: !closed })
  }

  return (
    <group position={[0, yOffset, 0]} onClick={handleClick}>
      {/* Housing base spanning full width */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.88, 0.06, 0.26]} />
        <meshStandardMaterial
          color={C_HOUSING}
          emissive={C_CONTACT}
          emissiveIntensity={isSelected ? 0.38 : 0}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Left contact pad */}
      <mesh position={[-0.24, 0, 0]}>
        <boxGeometry args={[0.26, 0.14, 0.22]} />
        <meshStandardMaterial color={C_CONTACT} metalness={0.65} roughness={0.28} />
      </mesh>

      {/* Right contact pad */}
      <mesh position={[0.24, 0, 0]}>
        <boxGeometry args={[0.26, 0.14, 0.22]} />
        <meshStandardMaterial color={C_CONTACT} metalness={0.65} roughness={0.28} />
      </mesh>

      {/* Bridge (closed) or recess (open) */}
      {closed ? (
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.30, 0.14, 0.22]} />
          <meshStandardMaterial
            color={C_BRIDGE}
            emissive={C_BRIDGE}
            emissiveIntensity={0.40}
            metalness={0.55}
            roughness={0.25}
          />
        </mesh>
      ) : (
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.28, 0.04, 0.20]} />
          <meshStandardMaterial color={C_RECESS} roughness={1.0} />
        </mesh>
      )}
    </group>
  )
}
