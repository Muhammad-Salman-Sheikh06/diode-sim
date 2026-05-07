// Node localPos is relative to the mesh centre at [x, yOffset, z] in world space.
// World Y of a node = yOffset + localPos[1].
// Rule: all nodes must have world Y >= 0.15 so spheres clear the grid surface.

export const LED_COLORS = {
  red:    { hex: '#ff2200', label: 'Red' },
  green:  { hex: '#00ff44', label: 'Green' },
  yellow: { hex: '#ffee00', label: 'Yellow' },
  blue:   { hex: '#4488ff', label: 'Blue' },
  white:  { hex: '#ffffff', label: 'White' },
}

export const COMPONENT_DEFS = {

  // ── Passives ───────────────────────────────────────────────────────────────
  resistor: {
    label: 'Resistor',
    color: '#d4b483',
    geometry: 'box',
    args: [0.8, 0.4, 0.4],
    yOffset: 0.2,
    defaultProps: { resistance: 1000 },
    nodes: [
      { id: 'A', label: 'Terminal A', localPos: [-0.48, 0, 0] },
      { id: 'B', label: 'Terminal B', localPos: [0.48, 0, 0] },
    ],
  },

  capacitor: {
    label: 'Capacitor',
    color: '#c0c0cc',
    geometry: 'cylinder',
    args: [0.2, 0.2, 0.6, 16],
    yOffset: 0.55,
    defaultProps: { capacitance: 10 },
    nodes: [
      { id: '+', label: 'Positive', localPos: [0, 0.40, 0] },
      { id: '-', label: 'Negative', localPos: [0, -0.30, 0] }, // world y = 0.25
    ],
  },

  potentiometer: {
    label: 'Potentiometer',
    color: '#3a5a7a',
    geometry: 'box',
    args: [1.0, 0.35, 0.35],
    yOffset: 0.25,
    defaultProps: { totalResistance: 1000 },
    defaultState: { ratio: 0.5 },
    nodes: [
      { id: 'A', label: 'Terminal A', localPos: [-0.58, 0, 0] },  // world y = 0.25
      { id: 'W', label: 'Wiper',      localPos: [0, 0.22, 0] },   // world y = 0.47 (above top)
      { id: 'B', label: 'Terminal B', localPos: [0.58, 0, 0] },   // world y = 0.25
    ],
  },

  // ── Semiconductors ────────────────────────────────────────────────────────
  led: {
    label: 'LED',
    color: '#ff2200',
    geometry: 'sphere',
    args: [0.3, 16, 16],
    yOffset: 0.55,
    emissive: true,
    defaultProps: { color: 'red' },
    nodes: [
      { id: 'A', label: 'Anode',   localPos: [0,  0.40, 0] }, // world y = 0.95
      { id: 'K', label: 'Cathode', localPos: [0, -0.30, 0] }, // world y = 0.25
    ],
  },

  npn_transistor: {
    label: 'NPN Transistor',
    color: '#444450',
    geometry: 'box',
    args: [0.6, 0.8, 0.4],
    yOffset: 0.5,
    defaultProps: { hfe: 100 },
    nodes: [
      { id: 'B', label: 'Base',      localPos: [-0.38, 0,     0] }, // world y = 0.50
      { id: 'C', label: 'Collector', localPos: [0.38,  0.28,  0] }, // world y = 0.78
      { id: 'E', label: 'Emitter',   localPos: [0.38, -0.28,  0] }, // world y = 0.22
    ],
  },

  // ── Sources ───────────────────────────────────────────────────────────────
  voltage_source: {
    label: 'Voltage Source',
    color: '#c8a010',
    geometry: 'cylinder',
    args: [0.35, 0.35, 1.1, 16],
    yOffset: 0.95,
    defaultProps: { voltage: 5 },
    nodes: [
      { id: '+', label: 'Positive', localPos: [0,  0.65, 0] }, // world y = 1.60
      { id: '-', label: 'Negative', localPos: [0, -0.65, 0] }, // world y = 0.30 — below cap so node sphere is unobstructed
    ],
  },

  // ── Utilities ─────────────────────────────────────────────────────────────
  ground: {
    label: 'Ground',
    color: '#545454',
    geometry: 'cone',
    args: [0.4, 0.5, 8],
    yOffset: 0.30,   // lowered so bottom bar rests on the grid surface
    nodes: [
      { id: 'GND', label: 'Ground', localPos: [0, 0.30, 0] }, // world y = 0.60
    ],
  },

  switch: {
    label: 'Switch',
    color: '#8a7a2a',
    geometry: 'box',
    args: [0.8, 0.14, 0.20],
    yOffset: 0.20,
    defaultState: { closed: false },
    nodes: [
      { id: 'A', label: 'Terminal A', localPos: [-0.48, 0, 0] },
      { id: 'B', label: 'Terminal B', localPos: [0.48,  0, 0] },
    ],
  },

  junction: {
    label: 'Junction',
    color: '#c8a820',
    geometry: 'cylinder',
    args: [0.12, 0.12, 0.05, 8],
    yOffset: 0.15,
    nodes: [
      { id: 'J', label: 'Junction', localPos: [0, 0.08, 0] }, // world y = 0.23
    ],
  },

  // ── New Stage 6d components ────────────────────────────────────────────────
  op_amp: {
    label: 'Op-Amp',
    color: '#7a4aaa',
    geometry: 'box',
    args: [1.4, 1.2, 0.4],
    yOffset: 0.75,
    defaultProps: { gain: 100000 },
    nodes: [
      { id: 'IN+', label: 'Non-Inverting', localPos: [-0.55,  0.20, 0] }, // world y = 0.95
      { id: 'IN-', label: 'Inverting',     localPos: [-0.55, -0.20, 0] }, // world y = 0.55
      { id: 'OUT', label: 'Output',        localPos: [ 0.75,  0,    0] }, // world y = 0.75
      { id: 'V+',  label: 'V+ Supply',     localPos: [ 0.10,  0.52, 0] }, // world y = 1.27
      { id: 'V-',  label: 'V− Supply',     localPos: [ 0.10, -0.52, 0] }, // world y = 0.23
    ],
  },

  nmos_transistor: {
    label: 'N-MOSFET',
    color: '#2a5a3a',
    geometry: 'box',
    args: [0.6, 0.8, 0.3],
    yOffset: 0.5,
    defaultProps: { vth: 2.0 },
    nodes: [
      { id: 'G', label: 'Gate',   localPos: [-0.38,  0,    0] }, // world y = 0.50
      { id: 'D', label: 'Drain',  localPos: [ 0.38,  0.28, 0] }, // world y = 0.78
      { id: 'S', label: 'Source', localPos: [ 0.38, -0.28, 0] }, // world y = 0.22
    ],
  },

  inductor: {
    label: 'Inductor',
    color: '#c87820',
    geometry: 'box',
    args: [1.0, 0.28, 0.28],
    yOffset: 0.20,
    defaultProps: { inductance: 10 }, // mH
    nodes: [
      { id: 'A', label: 'Terminal A', localPos: [-0.58, 0, 0] }, // world y = 0.20
      { id: 'B', label: 'Terminal B', localPos: [ 0.58, 0, 0] }, // world y = 0.20
    ],
  },
}

export const PALETTE_ORDER = [
  'resistor', 'capacitor', 'potentiometer', 'inductor',
  'led', 'npn_transistor', 'nmos_transistor', 'op_amp',
  'voltage_source', 'ground',
  'switch', 'junction',
]

export function getNodeWorldPos(component, nodeId) {
  const def = COMPONENT_DEFS[component.type]
  const nodeDef = def?.nodes.find((n) => n.id === nodeId)
  if (!nodeDef) return [0, 0, 0]
  const [cx, , cz] = component.position
  const [lx, ly, lz] = nodeDef.localPos
  const r = component.rotation ?? 0
  let rotLx = lx, rotLz = lz
  if (r !== 0) {
    const angle = r * Math.PI / 180
    rotLx = lx * Math.cos(angle) - lz * Math.sin(angle)
    rotLz = lx * Math.sin(angle) + lz * Math.cos(angle)
  }
  return [cx + rotLx, def.yOffset + ly, cz + rotLz]
}
