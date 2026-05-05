// Potentiometer: blue-gray box body + rotary knob on top + 3 leads
// yOffset=0.25  nodes: A at (–0.58,0), W at (0,+0.22), B at (+0.58,0)
export function PotMesh({ matRef, opacity }) {
  const t = opacity < 1
  const leadMat = { color: '#b0b0b0', metalness: 0.9, roughness: 0.2, transparent: t, opacity }
  return (
    <>
      {/* Box body (spans x=±0.425, y=–0.14 → +0.14) */}
      <mesh>
        <boxGeometry args={[0.85, 0.28, 0.36]} />
        <meshStandardMaterial
          ref={matRef}
          color="#3a5a7a"
          emissive="#3a5a7a"
          emissiveIntensity={0}
          roughness={0.75}
          metalness={0.1}
          transparent={t}
          opacity={opacity}
        />
      </mesh>

      {/* Knob (y=+0.14 → +0.36, W node at y=+0.22) */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.22, 14]} />
        <meshStandardMaterial color="#252525" roughness={0.5} metalness={0.2} transparent={t} opacity={opacity} />
      </mesh>

      {/* Knob indicator line */}
      <mesh position={[0, 0.358, 0.065]}>
        <boxGeometry args={[0.022, 0.022, 0.09]} />
        <meshStandardMaterial color="#888888" transparent={t} opacity={opacity} />
      </mesh>

      {/* A terminal lead: body left edge (x=–0.425) → A node (x=–0.58) */}
      <mesh position={[-0.505, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.155, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* B terminal lead: body right edge (x=+0.425) → B node (x=+0.58) */}
      <mesh position={[0.505, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.155, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>
    </>
  )
}
