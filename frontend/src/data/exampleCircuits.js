// All positions are on the integer grid [x, 0, z].
// Node IDs match COMPONENT_DEFS exactly.
// suggestedStop / suggestedStep only present for transient examples.

export const EXAMPLE_CIRCUITS = [
  // ── 1. LED + Resistor ──────────────────────────────────────────────────────
  {
    name: 'LED + Resistor',
    description: 'Basic 5 V LED circuit with a 220 Ω current-limiting resistor.',
    suggestedMode: 'dc',
    components: [
      { id: 'e1', type: 'voltage_source', position: [0, 0,  0], rotation: 0, state: {}, props: { voltage: 5 } },
      { id: 'e2', type: 'resistor',       position: [3, 0,  0], rotation: 0, state: {}, props: { resistance: 220 } },
      { id: 'e3', type: 'led',            position: [6, 0,  0], rotation: 0, state: {}, props: { vf: 2.0 } },
      { id: 'e4', type: 'ground',         position: [0, 0, -3], rotation: 0, state: {}, props: {} },
      { id: 'e5', type: 'ground',         position: [6, 0, -3], rotation: 0, state: {}, props: {} },
    ],
    wires: [
      { id: 'w1', fromComponentId: 'e1', fromNode: '+',   toComponentId: 'e2', toNode: 'A' },
      { id: 'w2', fromComponentId: 'e2', fromNode: 'B',   toComponentId: 'e3', toNode: 'A' },
      { id: 'w3', fromComponentId: 'e1', fromNode: '-',   toComponentId: 'e4', toNode: 'GND' },
      { id: 'w4', fromComponentId: 'e3', fromNode: 'K',   toComponentId: 'e5', toNode: 'GND' },
      { id: 'w5', fromComponentId: 'e4', fromNode: 'GND', toComponentId: 'e5', toNode: 'GND' },
    ],
  },

  // ── 2. Voltage Divider ─────────────────────────────────────────────────────
  {
    name: 'Voltage Divider',
    description: 'Two 1 kΩ resistors dividing 5 V to 2.5 V. The junction marks the output tap.',
    suggestedMode: 'dc',
    components: [
      { id: 'e1', type: 'voltage_source', position: [-2, 0,  0], rotation: 0, state: {}, props: { voltage: 5 } },
      { id: 'e2', type: 'resistor',       position: [ 1, 0,  0], rotation: 0, state: {}, props: { resistance: 1000 } },
      { id: 'e3', type: 'junction',       position: [ 3, 0,  0], rotation: 0, state: {}, props: {} },
      { id: 'e4', type: 'resistor',       position: [ 5, 0,  0], rotation: 0, state: {}, props: { resistance: 1000 } },
      { id: 'e5', type: 'ground',         position: [-2, 0, -3], rotation: 0, state: {}, props: {} },
      { id: 'e6', type: 'ground',         position: [ 5, 0, -3], rotation: 0, state: {}, props: {} },
    ],
    wires: [
      { id: 'w1', fromComponentId: 'e1', fromNode: '+',   toComponentId: 'e2', toNode: 'A' },
      { id: 'w2', fromComponentId: 'e2', fromNode: 'B',   toComponentId: 'e3', toNode: 'J' },
      { id: 'w3', fromComponentId: 'e3', fromNode: 'J',   toComponentId: 'e4', toNode: 'A' },
      { id: 'w4', fromComponentId: 'e4', fromNode: 'B',   toComponentId: 'e6', toNode: 'GND' },
      { id: 'w5', fromComponentId: 'e1', fromNode: '-',   toComponentId: 'e5', toNode: 'GND' },
      { id: 'w6', fromComponentId: 'e5', fromNode: 'GND', toComponentId: 'e6', toNode: 'GND' },
    ],
  },

  // ── 3. RC Low-Pass Filter ──────────────────────────────────────────────────
  {
    name: 'RC Low-Pass Filter',
    description: '1 kΩ / 10 µF RC filter (τ ≈ 10 ms). Load in Transient mode to see the charging curve.',
    suggestedMode: 'transient',
    suggestedStop: '50m',
    suggestedStep: '100u',
    components: [
      { id: 'e1', type: 'voltage_source', position: [0, 0,  0], rotation: 0, state: {}, props: { voltage: 5 } },
      { id: 'e2', type: 'resistor',       position: [3, 0,  0], rotation: 0, state: {}, props: { resistance: 1000 } },
      { id: 'e3', type: 'capacitor',      position: [6, 0,  0], rotation: 0, state: {}, props: { capacitance: 10 } },
      { id: 'e4', type: 'ground',         position: [0, 0, -3], rotation: 0, state: {}, props: {} },
      { id: 'e5', type: 'ground',         position: [6, 0, -3], rotation: 0, state: {}, props: {} },
    ],
    wires: [
      { id: 'w1', fromComponentId: 'e1', fromNode: '+',   toComponentId: 'e2', toNode: 'A' },
      { id: 'w2', fromComponentId: 'e2', fromNode: 'B',   toComponentId: 'e3', toNode: '+' },
      { id: 'w3', fromComponentId: 'e3', fromNode: '-',   toComponentId: 'e5', toNode: 'GND' },
      { id: 'w4', fromComponentId: 'e1', fromNode: '-',   toComponentId: 'e4', toNode: 'GND' },
      { id: 'w5', fromComponentId: 'e4', fromNode: 'GND', toComponentId: 'e5', toNode: 'GND' },
    ],
  },

  // ── 4. Transistor Switch ───────────────────────────────────────────────────
  {
    name: 'Transistor Switch',
    description: 'NPN transistor switching an LED on via 10 kΩ base and 470 Ω collector resistors.',
    suggestedMode: 'dc',
    components: [
      { id: 'e1', type: 'voltage_source', position: [-3, 0,  0], rotation: 0, state: {}, props: { voltage: 5 } },
      { id: 'e2', type: 'resistor',       position: [ 0, 0,  2], rotation: 0, state: {}, props: { resistance: 10000 } },
      { id: 'e3', type: 'resistor',       position: [ 0, 0, -2], rotation: 0, state: {}, props: { resistance: 470 } },
      { id: 'e4', type: 'led',            position: [ 3, 0, -2], rotation: 0, state: {}, props: { vf: 2.0 } },
      { id: 'e5', type: 'npn_transistor', position: [ 3, 0,  1], rotation: 0, state: {}, props: { hfe: 100 } },
      { id: 'e6', type: 'ground',         position: [-3, 0, -4], rotation: 0, state: {}, props: {} },
      { id: 'e7', type: 'ground',         position: [ 3, 0, -4], rotation: 0, state: {}, props: {} },
    ],
    wires: [
      { id: 'w1', fromComponentId: 'e1', fromNode: '+',   toComponentId: 'e2', toNode: 'A' },
      { id: 'w2', fromComponentId: 'e1', fromNode: '+',   toComponentId: 'e3', toNode: 'A' },
      { id: 'w3', fromComponentId: 'e2', fromNode: 'B',   toComponentId: 'e5', toNode: 'B' },
      { id: 'w4', fromComponentId: 'e3', fromNode: 'B',   toComponentId: 'e4', toNode: 'A' },
      { id: 'w5', fromComponentId: 'e4', fromNode: 'K',   toComponentId: 'e5', toNode: 'C' },
      { id: 'w6', fromComponentId: 'e5', fromNode: 'E',   toComponentId: 'e7', toNode: 'GND' },
      { id: 'w7', fromComponentId: 'e1', fromNode: '-',   toComponentId: 'e6', toNode: 'GND' },
      { id: 'w8', fromComponentId: 'e6', fromNode: 'GND', toComponentId: 'e7', toNode: 'GND' },
    ],
  },

  // ── 5. Op-Amp Buffer ───────────────────────────────────────────────────────
  {
    name: 'Op-Amp Buffer',
    description: 'Unity-gain voltage follower: OUT = IN+ with high input impedance and low output impedance.',
    suggestedMode: 'dc',
    components: [
      { id: 'e1', type: 'voltage_source', position: [-5, 0,  0], rotation: 0, state: {}, props: { voltage: 3 } },
      { id: 'e2', type: 'voltage_source', position: [ 2, 0,  4], rotation: 0, state: {}, props: { voltage: 12 } },
      { id: 'e3', type: 'op_amp',         position: [ 2, 0,  0], rotation: 0, state: {}, props: { gain: 100000 } },
      { id: 'e4', type: 'resistor',       position: [ 6, 0,  0], rotation: 0, state: {}, props: { resistance: 10000 } },
      { id: 'e5', type: 'ground',         position: [-5, 0, -3], rotation: 0, state: {}, props: {} },
      { id: 'e6', type: 'ground',         position: [ 6, 0, -3], rotation: 0, state: {}, props: {} },
    ],
    wires: [
      // Input signal
      { id: 'w1', fromComponentId: 'e1', fromNode: '+',   toComponentId: 'e3', toNode: 'IN+' },
      { id: 'w2', fromComponentId: 'e1', fromNode: '-',   toComponentId: 'e5', toNode: 'GND' },
      // Op-amp supply
      { id: 'w3', fromComponentId: 'e2', fromNode: '+',   toComponentId: 'e3', toNode: 'V+' },
      { id: 'w4', fromComponentId: 'e2', fromNode: '-',   toComponentId: 'e6', toNode: 'GND' },
      { id: 'w5', fromComponentId: 'e3', fromNode: 'V-',  toComponentId: 'e6', toNode: 'GND' },
      // Unity-gain feedback: OUT → IN-
      { id: 'w6', fromComponentId: 'e3', fromNode: 'OUT', toComponentId: 'e3', toNode: 'IN-' },
      // Output load
      { id: 'w7', fromComponentId: 'e3', fromNode: 'OUT', toComponentId: 'e4', toNode: 'A' },
      { id: 'w8', fromComponentId: 'e4', fromNode: 'B',   toComponentId: 'e6', toNode: 'GND' },
      { id: 'w9', fromComponentId: 'e5', fromNode: 'GND', toComponentId: 'e6', toNode: 'GND' },
    ],
  },
]
