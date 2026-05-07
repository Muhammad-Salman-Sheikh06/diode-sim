import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, OrbitControls, Line } from '@react-three/drei'
import { useCircuitStore } from '../store/circuitStore'
import { getNodeWorldPos, COMPONENT_DEFS } from './componentDefs'
import { ComponentMesh } from './ComponentMesh'
import { ComponentNodes } from './ComponentNodes'
import { SwitchMesh } from './SwitchMesh'
import { WireComponent } from './WireComponent'

const SNAP_RADIUS = 1.5

function gridSnap(v, size = 1) {
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

function WirePreview({ wiringFrom, mouseWorldPos, components, snapTarget }) {
  const fromComp = components.find((c) => c.id === wiringFrom.componentId)
  if (!fromComp) return null
  const fromPos = getNodeWorldPos(fromComp, wiringFrom.nodeId)

  let toPos = mouseWorldPos
  if (snapTarget) {
    const snapComp = components.find((c) => c.id === snapTarget.componentId)
    if (snapComp) toPos = getNodeWorldPos(snapComp, snapTarget.nodeId)
  }
  if (!toPos) return null

  return (
    <Line
      points={[fromPos, toPos]}
      color={snapTarget ? '#00ff88' : '#ffcc00'}
      lineWidth={1.5}
      dashed
      dashSize={0.22}
      gapSize={0.14}
    />
  )
}

// Returns the closest {componentId, nodeId} within SNAP_RADIUS (x-z plane),
// excluding the wiring source component.
function findSnapTarget(mx, mz, components, sourceId) {
  let best = null, bestDist = SNAP_RADIUS
  for (const comp of components) {
    if (comp.id === sourceId) continue
    const def = COMPONENT_DEFS[comp.type]
    if (!def?.nodes) continue
    for (const nd of def.nodes) {
      const np = getNodeWorldPos(comp, nd.id)
      const d = Math.sqrt((mx - np[0]) ** 2 + (mz - np[2]) ** 2)
      if (d < bestDist) { bestDist = d; best = { componentId: comp.id, nodeId: nd.id } }
    }
  }
  return best
}

const SCENE_THEME = {
  dark:  { pcb: '#061510', cell: '#1a4d30', section: '#267a4a' },
  light: { pcb: '#e8e8f0', cell: '#8888aa', section: '#5566aa' },
}

function Scene() {
  const {
    components, wires,
    activeType, wiringFrom,
    ghostRotation,
    placeComponent, cancelWiring, completeWiring, deselectComponent,
    theme,
  } = useCircuitStore()
  const sc = SCENE_THEME[theme] ?? SCENE_THEME.dark

  const [ghostPos, setGhostPos]         = useState(null)
  const [mouseWorldPos, setMouseWorldPos] = useState(null)
  const [snapTarget, setSnapTarget]       = useState(null)

  const groupRefs   = useRef({})
  const ghostGrpRef = useRef()

  // Sync placed-component rotations directly onto their Three.js groups.
  useEffect(() => {
    components.forEach((c) => {
      const grp = groupRefs.current[c.id]
      if (grp) grp.rotation.y = -((c.rotation ?? 0) * Math.PI / 180)
    })
  }, [components])

  useEffect(() => {
    if (ghostGrpRef.current) {
      ghostGrpRef.current.rotation.y = -(ghostRotation * Math.PI / 180)
    }
  }, [ghostRotation])

  // Clear snap state when wiring ends.
  useEffect(() => {
    if (!wiringFrom) { setSnapTarget(null); setMouseWorldPos(null) }
  }, [wiringFrom])

  const isPlacing = !!activeType
  const isWiring  = !!wiringFrom

  const handlePointerMove = useCallback((e) => {
    e.stopPropagation()
    if (isPlacing) {
      setGhostPos([gridSnap(e.point.x), 0, gridSnap(e.point.z)])
      return
    }
    if (!isWiring) return

    const mx = e.point.x, mz = e.point.z
    setMouseWorldPos([mx, e.point.y, mz])
    setSnapTarget(findSnapTarget(mx, mz, components, wiringFrom.componentId))
  }, [isPlacing, isWiring, components, wiringFrom])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (isPlacing && ghostPos) {
      placeComponent(activeType, ghostPos)
    } else if (isWiring) {
      if (snapTarget) {
        completeWiring(snapTarget.componentId, snapTarget.nodeId)
      } else {
        cancelWiring()
      }
      setSnapTarget(null)
    }
  }, [isPlacing, isWiring, activeType, ghostPos, placeComponent, cancelWiring, completeWiring, snapTarget])

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
        <meshStandardMaterial color={sc.pcb} roughness={0.9} />
      </mesh>

      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor={sc.cell}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={sc.section}
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

      {/* Placed components */}
      {components.map((c) => (
        <group key={c.id}>
          <group
            position={[c.position[0], 0, c.position[2]]}
            ref={(el) => { groupRefs.current[c.id] = el }}
          >
            {c.type === 'switch'
              ? <SwitchMesh component={c} />
              : <ComponentMesh type={c.type} id={c.id} />}
          </group>
          {/* Nodes stay outside the rotating group */}
          <ComponentNodes component={c} snapTarget={snapTarget} />
        </group>
      ))}

      {/* Placement ghost */}
      {isPlacing && ghostPos && (
        <group ref={ghostGrpRef} position={[ghostPos[0], 0, ghostPos[2]]}>
          <ComponentMesh type={activeType} opacity={0.38} />
        </group>
      )}

      {/* Wire preview — snaps to target node when within range */}
      {isWiring && (
        <WirePreview
          wiringFrom={wiringFrom}
          mouseWorldPos={mouseWorldPos}
          components={components}
          snapTarget={snapTarget}
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

const CANVAS_BG = { dark: '#040d08', light: '#dce4ee' }

export function CircuitEditor() {
  const { activeType, wiringFrom, theme } = useCircuitStore()
  const cursor = activeType ? 'crosshair' : wiringFrom ? 'cell' : 'default'
  const canvasBg = CANVAS_BG[theme] ?? CANVAS_BG.dark

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
      if (e.key === 'r' || e.key === 'R') {
        const { activeType, selectedComponentId, rotateGhost, rotateComponent } =
          useCircuitStore.getState()
        if (activeType) { e.preventDefault(); rotateGhost() }
        else if (selectedComponentId) { e.preventDefault(); rotateComponent(selectedComponentId) }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        useCircuitStore.getState().undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        useCircuitStore.getState().redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Canvas
      shadows
      camera={{ position: [8, 10, 8], fov: 55 }}
      style={{ width: '100%', height: '100%', background: canvasBg, cursor }}
    >
      <Scene />
    </Canvas>
  )
}
