// Classic 3-bar ground symbol extruded in 3D.
// yOffset=0.35  node GND at localY=+0.30 (connection point at top of post).
// Bars hang downward from the post bottom.
export function GroundMesh({ matRef, opacity }) {
  const t = opacity < 1
  const bar = { color: '#545454', metalness: 0.25, roughness: 0.75, transparent: t, opacity }
  return (
    <>
      {/* Vertical post: GND node (y=+0.30) down to bar level (y=0) */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.05, 0.30, 0.05]} />
        <meshStandardMaterial ref={matRef} emissive="#545454" emissiveIntensity={0} {...bar} />
      </mesh>

      {/* Bar 1 — widest */}
      <mesh position={[0, 0.00, 0]}>
        <boxGeometry args={[0.52, 0.055, 0.07]} />
        <meshStandardMaterial {...bar} />
      </mesh>

      {/* Bar 2 */}
      <mesh position={[0, -0.13, 0]}>
        <boxGeometry args={[0.36, 0.055, 0.07]} />
        <meshStandardMaterial {...bar} />
      </mesh>

      {/* Bar 3 — narrowest */}
      <mesh position={[0, -0.26, 0]}>
        <boxGeometry args={[0.20, 0.055, 0.07]} />
        <meshStandardMaterial {...bar} />
      </mesh>
    </>
  )
}
