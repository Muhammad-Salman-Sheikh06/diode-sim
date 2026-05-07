import { useMemo, useEffect } from 'react'
import * as THREE from 'three'

// Air-core inductor: 5 copper coil loops along X axis + wire leads.
// yOffset=0.20  nodes: A at (−0.58,0), B at (+0.58,0)
//
// Performance: one TorusGeometry instance (6×8 = 96 tris) shared across all
// 5 meshes via useMemo. Without sharing, React/R3F would allocate 5 separate
// geometry objects (each 10×22 = 440 tris) on every mount.
const LOOP_X = [-0.24, -0.12, 0, 0.12, 0.24]
const LOOP_ROT = [0, 0, Math.PI / 2]  // torus axis = X

export function InductorMesh({ matRef, opacity }) {
  const t = opacity < 1

  // Single geometry shared by all loop meshes — 6 radial × 8 tubular = 96 triangles.
  const coilGeo = useMemo(() => new THREE.TorusGeometry(0.10, 0.026, 6, 8), [])
  // Dispose when the component unmounts (R3F won't auto-dispose prop-passed geometry).
  useEffect(() => () => coilGeo.dispose(), [coilGeo])

  return (
    <>
      {LOOP_X.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={LOOP_ROT} geometry={coilGeo}>
          <meshStandardMaterial
            ref={i === 0 ? matRef : undefined}
            color="#c07818"
            emissive="#c07818"
            emissiveIntensity={0}
            metalness={0.85}
            roughness={0.22}
            transparent={t}
            opacity={opacity}
          />
        </mesh>
      ))}

      {/* Left lead — coil edge (x≈−0.34) to node A (x=−0.58) */}
      <mesh position={[-0.46, 0, 0]} rotation={LOOP_ROT}>
        <cylinderGeometry args={[0.022, 0.022, 0.24, 6]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.2} transparent={t} opacity={opacity} />
      </mesh>

      {/* Right lead — coil edge (x≈+0.34) to node B (x=+0.58) */}
      <mesh position={[0.46, 0, 0]} rotation={LOOP_ROT}>
        <cylinderGeometry args={[0.022, 0.022, 0.24, 6]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.2} transparent={t} opacity={opacity} />
      </mesh>
    </>
  )
}
