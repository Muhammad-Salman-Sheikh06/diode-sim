// TO-220 N-channel MOSFET: flat rectangular body, metal heat-sink tab, 3 leads.
// Same node layout as NPN transistor: G at (−0.38,0), D at (+0.38,+0.28), S at (+0.38,−0.28)
// yOffset=0.5
export function MOSFETMesh({ matRef, opacity }) {
  const t = opacity < 1
  const leadMat = { color: '#b0b0b0', metalness: 0.9, roughness: 0.2, transparent: t, opacity }
  return (
    <>
      {/* Dark plastic body */}
      <mesh>
        <boxGeometry args={[0.58, 0.62, 0.26]} />
        <meshStandardMaterial
          ref={matRef}
          color="#1a1a24"
          emissive="#1a1a24"
          emissiveIntensity={0}
          roughness={0.85}
          metalness={0.05}
          transparent={t}
          opacity={opacity}
        />
      </mesh>

      {/* Metal heat-sink tab — extends behind and above the body */}
      <mesh position={[0, 0.39, -0.165]}>
        <boxGeometry args={[0.50, 0.16, 0.04]} />
        <meshStandardMaterial color="#5a6268" metalness={0.88} roughness={0.15} transparent={t} opacity={opacity} />
      </mesh>

      {/* Mounting-hole indicator — flat square box, no curves */}
      <mesh position={[0, 0.38, -0.188]}>
        <boxGeometry args={[0.09, 0.09, 0.006]} />
        <meshStandardMaterial color="#40454a" roughness={0.6} transparent={t} opacity={opacity} />
      </mesh>

      {/* Part-number label stripe */}
      <mesh position={[0, 0.06, 0.135]}>
        <boxGeometry args={[0.40, 0.20, 0.002]} />
        <meshStandardMaterial color="#26263a" roughness={0.8} transparent={t} opacity={opacity} />
      </mesh>

      {/* G lead — horizontal left (matches NPN B lead) */}
      <mesh position={[-0.30, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.16, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* D lead — upper right (matches NPN C lead) */}
      <mesh position={[0.30, 0.25, 0]} rotation={[0, 0, -1.21]}>
        <cylinderGeometry args={[0.025, 0.025, 0.171, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* S lead — lower right (matches NPN E lead) */}
      <mesh position={[0.30, -0.25, 0]} rotation={[0, 0, -1.93]}>
        <cylinderGeometry args={[0.025, 0.025, 0.171, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>
    </>
  )
}
