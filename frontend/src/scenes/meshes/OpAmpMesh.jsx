// Ideal op-amp: triangular wedge body with +/− pin markers and wire leads.
// CylinderGeometry(r=0.62, h=0.38, n=3) rotated [π/2,0,0] → axis along Z,
// cross-section in XY plane, apex at +X, base at −X.
// yOffset=0.75  IN+ (−0.55,+0.20)  IN− (−0.55,−0.20)  OUT (+0.75,0)
//               V+ (0.10,+0.52)   V− (0.10,−0.52)
export function OpAmpMesh({ matRef, opacity }) {
  const t = opacity < 1
  const leadMat = { color: '#b0b0b0', metalness: 0.9, roughness: 0.2, transparent: t, opacity }
  return (
    <>
      {/* Triangular prism body — apex points right (+X) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.38, 3]} />
        <meshStandardMaterial
          ref={matRef}
          color="#3a2070"
          emissive="#3a2070"
          emissiveIntensity={0}
          roughness={0.55}
          metalness={0.25}
          transparent={t}
          opacity={opacity}
        />
      </mesh>

      {/* IN+ marker — "+" cross on front face */}
      <mesh position={[-0.24, 0.20, 0.21]}>
        <boxGeometry args={[0.09, 0.022, 0.008]} />
        <meshStandardMaterial color="#44ff88" transparent={t} opacity={opacity} />
      </mesh>
      <mesh position={[-0.24, 0.20, 0.21]}>
        <boxGeometry args={[0.022, 0.09, 0.008]} />
        <meshStandardMaterial color="#44ff88" transparent={t} opacity={opacity} />
      </mesh>

      {/* IN− marker — "−" dash on front face */}
      <mesh position={[-0.24, -0.20, 0.21]}>
        <boxGeometry args={[0.09, 0.022, 0.008]} />
        <meshStandardMaterial color="#ff6666" transparent={t} opacity={opacity} />
      </mesh>

      {/* IN+ lead — left body edge (x≈−0.31) to node (x=−0.55) */}
      <mesh position={[-0.43, 0.20, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.24, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* IN− lead */}
      <mesh position={[-0.43, -0.20, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.24, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* OUT lead — apex (x=0.62) to node (x=0.75) */}
      <mesh position={[0.695, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.13, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* V+ lead — vertical, top of body (y≈0.30 at x=0.10) to V+ node (y=0.52) */}
      <mesh position={[0.10, 0.41, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* V− lead — vertical, bottom of body to V− node */}
      <mesh position={[0.10, -0.41, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>
    </>
  )
}
