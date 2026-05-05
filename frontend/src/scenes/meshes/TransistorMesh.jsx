// TO-92 NPN transistor: black cylinder body + flat-face indicator + 3 wire leads
// yOffset=0.5  nodes: B at (–0.38,0), C at (+0.38,+0.28), E at (+0.38,–0.28)
//
// Lead rotation maths (align cylinder +Y with direction Δ in XY plane):
//   rotZ = –atan2(Δx, Δy)
//   B lead: Δ=(–0.16, 0)    → rotZ = π/2
//   C lead: Δ=(+0.16,+0.06) → rotZ ≈ –1.21 rad
//   E lead: Δ=(+0.16,–0.06) → rotZ ≈ –1.93 rad

export function TransistorMesh({ matRef, opacity }) {
  const t = opacity < 1
  const leadMat = { color: '#b0b0b0', metalness: 0.9, roughness: 0.2, transparent: t, opacity }
  return (
    <>
      {/* Black TO-92 body (spans y=–0.275 → +0.275) */}
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 0.55, 20]} />
        <meshStandardMaterial
          ref={matRef}
          color="#1c1c1c"
          emissive="#1c1c1c"
          emissiveIntensity={0}
          roughness={0.88}
          metalness={0.0}
          transparent={t}
          opacity={opacity}
        />
      </mesh>

      {/* Flat face (TO-92 D-shape) — thin slab on front face */}
      <mesh position={[0, 0, 0.215]}>
        <boxGeometry args={[0.42, 0.55, 0.02]} />
        <meshStandardMaterial color="#262626" roughness={0.9} transparent={t} opacity={opacity} />
      </mesh>

      {/* Marking dot on flat face */}
      <mesh position={[0, 0.18, 0.228]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.030, 0.030, 0.01, 8]} />
        <meshStandardMaterial color="#555555" transparent={t} opacity={opacity} />
      </mesh>

      {/* B lead — horizontal left (–0.22,0) → (–0.38,0) */}
      <mesh position={[-0.30, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.16, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* C lead — upper right (0.22,+0.22) → (0.38,+0.28), length≈0.171 */}
      <mesh position={[0.30, 0.25, 0]} rotation={[0, 0, -1.21]}>
        <cylinderGeometry args={[0.025, 0.025, 0.171, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* E lead — lower right (0.22,–0.22) → (0.38,–0.28), length≈0.171 */}
      <mesh position={[0.30, -0.25, 0]} rotation={[0, 0, -1.93]}>
        <cylinderGeometry args={[0.025, 0.025, 0.171, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>
    </>
  )
}
