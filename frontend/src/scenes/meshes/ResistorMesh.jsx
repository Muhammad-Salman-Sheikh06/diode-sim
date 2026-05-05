// 1kΩ resistor: horizontal cylinder body + 4 colour bands (brown-black-red-gold) + wire leads
const BANDS = [
  { x: -0.14, color: '#7a3a10' }, // brown  – 1
  { x: -0.06, color: '#111111' }, // black  – 0
  { x:  0.03, color: '#cc2222' }, // red    – ×100
  { x:  0.14, color: '#ccaa00' }, // gold   – ±5 %
]

export function ResistorMesh({ matRef, opacity }) {
  const t = opacity < 1
  const leadMat = { color: '#b0b0b0', metalness: 0.9, roughness: 0.2, transparent: t, opacity }
  return (
    <>
      {/* Body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.52, 12]} />
        <meshStandardMaterial
          ref={matRef}
          color="#d4b483"
          emissive="#d4b483"
          emissiveIntensity={0}
          roughness={0.75}
          metalness={0.05}
          transparent={t}
          opacity={opacity}
        />
      </mesh>

      {/* Colour bands */}
      {BANDS.map(({ x, color }) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.125, 0.125, 0.044, 12]} />
          <meshStandardMaterial color={color} roughness={0.6} transparent={t} opacity={opacity} />
        </mesh>
      ))}

      {/* Left lead  (body end → node A at x = -0.48) */}
      <mesh position={[-0.37, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>

      {/* Right lead (body end → node B at x = +0.48) */}
      <mesh position={[0.37, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 6]} />
        <meshStandardMaterial {...leadMat} />
      </mesh>
    </>
  )
}
