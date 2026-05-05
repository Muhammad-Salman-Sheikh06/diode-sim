// AA-style battery: white label body, brass top cap, + nub, silver bottom cap
// yOffset=0.95  nodes: + at localY=+0.65,  – at localY=–0.55
export function BatteryMesh({ matRef, opacity }) {
  const t = opacity < 1
  return (
    <>
      {/* White label band — main body (spans y=–0.50 → +0.50) */}
      <mesh>
        <cylinderGeometry args={[0.30, 0.30, 1.00, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color="#e8e8ec"
          emissive="#e8e8ec"
          emissiveIntensity={0}
          roughness={0.85}
          metalness={0.05}
          transparent={t}
          opacity={opacity}
        />
      </mesh>

      {/* Thin blue label stripe */}
      <mesh position={[0, 0.10, 0]}>
        <cylinderGeometry args={[0.305, 0.305, 0.22, 16]} />
        <meshStandardMaterial color="#2244aa" roughness={0.8} transparent={t} opacity={opacity} />
      </mesh>

      {/* Brass top cap (y=0.50 → 0.58) */}
      <mesh position={[0, 0.54, 0]}>
        <cylinderGeometry args={[0.30, 0.30, 0.08, 16]} />
        <meshStandardMaterial color="#b8920c" metalness={0.85} roughness={0.3} transparent={t} opacity={opacity} />
      </mesh>

      {/* + nub (y=0.58 → 0.68, node at +0.65) */}
      <mesh position={[0, 0.63, 0]}>
        <cylinderGeometry args={[0.10, 0.10, 0.10, 12]} />
        <meshStandardMaterial color="#c8a010" metalness={0.9} roughness={0.2} transparent={t} opacity={opacity} />
      </mesh>

      {/* Silver bottom cap (y=–0.50 → –0.58, node at –0.55) */}
      <mesh position={[0, -0.54, 0]}>
        <cylinderGeometry args={[0.30, 0.30, 0.08, 16]} />
        <meshStandardMaterial color="#909098" metalness={0.7} roughness={0.3} transparent={t} opacity={opacity} />
      </mesh>
    </>
  )
}
