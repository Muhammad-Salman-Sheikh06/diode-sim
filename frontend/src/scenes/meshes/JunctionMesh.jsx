// Solder junction: small gold metallic sphere
// yOffset=0.15  node J at localY=+0.08
export function JunctionMesh({ matRef, opacity }) {
  return (
    <mesh position={[0, 0.04, 0]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        ref={matRef}
        color="#c8a820"
        emissive="#c8a820"
        emissiveIntensity={0}
        metalness={0.82}
        roughness={0.18}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  )
}
