import { useState, useRef, useLayoutEffect } from 'react'
import { useCircuitStore } from '../store/circuitStore'
import { COMPONENT_DEFS, getNodeWorldPos } from './componentDefs'
import { NodeVoltageLabel } from './NodeVoltageLabel'

const NODE_R = 0.065
const NODE_SEGS = 8

function NodeSphere({ worldPos, isSource, isConnected, isSnapped, onNodeClick }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()

  // R3F's prop reconciler doesn't reliably update position on already-mounted
  // meshes — set it imperatively after every render.
  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(worldPos[0], worldPos[1], worldPos[2])
    }
  })

  const color = isSource   ? '#ffaa00'
    : isSnapped            ? '#00ff88'
    : hovered              ? '#00ff88'
    : isConnected          ? '#4499ff'
    :                        '#777777'

  const emissiveIntensity = isSource  ? 0.9
    : isSnapped                       ? 0.85
    : hovered                         ? 0.6
    : isConnected                     ? 0.25
    :                                   0.08

  const scale = isSnapped            ? 2.2
    : isSource || hovered            ? 1.5
    :                                  1

  return (
    <mesh
      ref={meshRef}
      position={worldPos}
      scale={scale}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onNodeClick() }}
    >
      <sphereGeometry args={[NODE_R, NODE_SEGS, NODE_SEGS]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  )
}

export function ComponentNodes({ component, snapTarget }) {
  const { wires, wiringFrom, activeType, startWiring, completeWiring, simVoltages } =
    useCircuitStore()
  const def = COMPONENT_DEFS[component.type]
  if (!def?.nodes) return null

  const isWiring = !!wiringFrom

  const connectedNodeIds = new Set(
    wires.flatMap((w) => {
      const hits = []
      if (w.fromComponentId === component.id) hits.push(w.fromNode)
      if (w.toComponentId === component.id) hits.push(w.toNode)
      return hits
    })
  )

  return (
    <>
      {def.nodes.map((nodeDef) => {
        const isSource =
          wiringFrom?.componentId === component.id && wiringFrom?.nodeId === nodeDef.id
        const isSnapped =
          snapTarget?.componentId === component.id && snapTarget?.nodeId === nodeDef.id
        const worldPos = getNodeWorldPos(component, nodeDef.id)
        const voltage  = simVoltages?.[`${component.id}:${nodeDef.id}`]

        const handleClick = () => {
          if (activeType) return
          if (!isWiring) {
            startWiring(component.id, nodeDef.id)
          } else if (wiringFrom.componentId !== component.id) {
            completeWiring(component.id, nodeDef.id)
          }
        }

        return (
          <group key={nodeDef.id}>
            <NodeSphere
              worldPos={worldPos}
              isSource={isSource}
              isConnected={connectedNodeIds.has(nodeDef.id)}
              isSnapped={isSnapped}
              onNodeClick={handleClick}
            />
            {voltage !== undefined && (
              <NodeVoltageLabel worldPos={worldPos} voltage={voltage} />
            )}
          </group>
        )
      })}
    </>
  )
}
