// Aluminium electrolytic can: silver body, dark negative sleeve on lower half, + marks on top cap
// yOffset=0.55  nodes: + at localY=+0.40,  – at localY=–0.30
export function CapacitorMesh({ matRef, opacity }) {
  const t = opacity < 1
  return (
    <>
      {/* Main aluminium body  (spans y=–0.25 → +0.35) */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.20, 0.20, 0.60, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color="#c8c8d4"
          emissive="#c8c8d4"
          emissiveIntensity={0}
          metalness={0.75}
          roughness={0.25}
          transparent={t}
          opacity={opacity}
        />
      </mesh>

      {/* Negative sleeve — dark band on lower half */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.205, 0.205, 0.26, 16]} />
        <meshStandardMaterial color="#1e1e2a" roughness={0.85} transparent={t} opacity={opacity} />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 0.355, 0]}>
        <cylinderGeometry args={[0.20, 0.20, 0.04, 16]} />
        <meshStandardMaterial color="#a8a8b8" metalness={0.8} roughness={0.2} transparent={t} opacity={opacity} />
      </mesh>

      {/* + mark on top cap — two thin bars forming a cross */}
      <mesh position={[0, 0.382, 0]}>
        <boxGeometry args={[0.18, 0.018, 0.04]} />
        <meshStandardMaterial color="#787888" transparent={t} opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.382, 0]}>
        <boxGeometry args={[0.04, 0.018, 0.18]} />
        <meshStandardMaterial color="#787888" transparent={t} opacity={opacity} />
      </mesh>
    </>
  )
}
