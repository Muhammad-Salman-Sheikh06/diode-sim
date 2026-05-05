// 5 mm LED: flat lens base + translucent dome + short wire leads
// yOffset=0.55  nodes: A (anode) at localY=+0.40,  K (cathode) at localY=–0.30
export function LEDMesh({ matRef, opacity, color = '#e03030' }) {
  const t = opacity < 1
  const leadMat = { color: '#b0b0b0', metalness: 0.9, roughness: 0.2, transparent: t, opacity }
  return (
    <>
      {/* Cathode lead: K node (y=–0.30) → lens base (y=–0.10) */}
      <mesh position={[0, -0.20, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.20, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* Lens base — flat black rim */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.10, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} transparent={t} opacity={opacity} />
      </mesh>

      {/* Dome — translucent, carries the emissive glow ref */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={0}
          roughness={0.05}
          metalness={0.0}
          transparent
          opacity={t ? opacity : 0.82}
          depthWrite={false}
        />
      </mesh>

      {/* Anode lead: dome top (y=+0.30) → A node (y=+0.40) */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.10, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>
    </>
  )
}
