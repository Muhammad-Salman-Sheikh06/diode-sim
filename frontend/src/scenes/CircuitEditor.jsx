import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, OrbitControls, Line } from '@react-three/drei'
import { useCircuitStore } from '../store/circuitStore'
import { getNodeWorldPos } from './componentDefs'
import { ComponentMesh } from './ComponentMesh'
import { ComponentNodes } from './ComponentNodes'
import { SwitchMesh } from './SwitchMesh'
import { WireComponent } from './WireComponent'

function snap(v, size = 1) {
  return Math.round(v / size) * size
}

function InteractionPlane({ onPointerMove, onClick }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.001, 0]}
      onPointerMove={onPointerMove}
      onClick={onClick}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

function WirePreview({ wiringFrom, mouseWorldPos, components }) {
  const fromComp = components.find((c) => c.id === wiringFrom.componentId)
  if (!fromComp || !mouseWorldPos) return null
  const fromPos = getNodeWorldPos(fromComp, wiringFrom.nodeId)
  return (
    <Line
      points={[fromPos, mouseWorldPos]}
      color="#ffcc00"
      lineWidth={1.5}
      dashed
      dashSize={0.22}
      gapSize={0.14}
    />
  )
}

function Scene() {
  const {
    components, wires,
    activeType, wiringFrom,
    placeComponent, cancelWiring, deselectComponent,
  } = useCircuitStore()

  const [ghostPos, setGhostPos] = useState(null)
  const [mouseWorldPos, setMouseWorldPos] = useState(null)

  const isPlacing = !!activeType
  const isWiring  = !!wiringFrom

  const handlePointerMove = useCallback((e) => {
    e.stopPropagation()
    if (isPlacing) setGhostPos([snap(e.point.x), 0, snap(e.point.z)])
    if (isWiring)  setMouseWorldPos([e.point.x, e.point.y, e.point.z])
  }, [isPlacing, isWiring])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (isPlacing && ghostPos) {
      placeComponent(activeType, ghostPos)
    } else if (isWiring) {
      cancelWiring() // clicked empty grid → cancel wiring
    }
  }, [isPlacing, isWiring, activeType, ghostPos, placeComponent, cancelWiring])

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[8, 14, 8]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 8, -6]} intensity={0.3} />

      {/* PCB base — clicking empty board deselects */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.003, 0]}
        onClick={(e) => { e.stopPropagation(); deselectComponent() }}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#061510" roughness={0.9} />
      </mesh>

      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a4d30"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#267a4a"
        fadeDistance={40}
        fadeStrength={1.2}
        followCamera={false}
      />

      {/* Interaction plane — active during placement or wiring */}
      {(isPlacing || isWiring) && (
        <InteractionPlane onPointerMove={handlePointerMove} onClick={handleClick} />
      )}

      {/* Placed wires */}
      {wires.map((w) => (
        <WireComponent key={w.id} wire={w} />
      ))}

      {/* Placed components with their terminal nodes */}
      {components.map((c) => (
        <group key={c.id}>
          {c.type === 'switch'
            ? <SwitchMesh component={c} />
            : <ComponentMesh type={c.type} position={c.position} id={c.id} />}
          <ComponentNodes component={c} />
        </group>
      ))}

      {/* Placement ghost */}
      {isPlacing && ghostPos && (
        <ComponentMesh type={activeType} position={ghostPos} opacity={0.38} />
      )}

      {/* Wire drag preview */}
      {isWiring && (
        <WirePreview
          wiringFrom={wiringFrom}
          mouseWorldPos={mouseWorldPos}
          components={components}
        />
      )}

      <OrbitControls
        makeDefault
        enableRotate={!isPlacing}
        minDistance={3}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  )
}

export function CircuitEditor() {
  const { activeType, wiringFrom } = useCircuitStore()
  const cursor = activeType ? 'crosshair' : wiringFrom ? 'cell' : 'default'

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedComponentId: id, removeComponent: rm } = useCircuitStore.getState()
        if (id) { e.preventDefault(); rm(id) }
      }
      if (e.key === 'Escape') {
        const { wiringFrom, activeType, cancelWiring, clearActiveType, deselectComponent } =
          useCircuitStore.getState()
        if (wiringFrom) cancelWiring()
        else if (activeType) clearActiveType()
        else deselectComponent()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Canvas
      shadows
      camera={{ position: [8, 10, 8], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#040d08', cursor }}
    >
      <Scene />
    </Canvas>
  )
}
