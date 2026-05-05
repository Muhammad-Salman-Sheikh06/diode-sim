import { create } from 'zustand'
import { COMPONENT_DEFS } from '../scenes/componentDefs'

let _seq = 0
const uid = () => `c${++_seq}`

export const useCircuitStore = create((set, get) => ({
  components: [],
  activeType: null,
  wires: [],
  wiringFrom: null,
  selectedWireId: null,
  selectedComponentId: null,

  // Simulation state
  simMode: 'dc',                          // 'dc' | 'transient'
  simParams: { tranStop: '1m', tranStep: '1u' },
  simVoltages: null,   // { 'compId:nodeId': volts }  — DC
  simCurrents: null,   // { compId: amps }             — DC
  simTransient: null,  // { time, nets, nodes }         — transient
  simLoading: false,
  simError: null,

  // ── Placement ─────────────────────────────────────────────────────────────
  setActiveType: (type) =>
    set((s) => ({ activeType: s.activeType === type ? null : type, selectedComponentId: null })),

  clearActiveType: () => set({ activeType: null }),

  placeComponent: (type, position) =>
    set((s) => ({
      components: [
        ...s.components,
        {
          id: uid(),
          type,
          position,
          state: { ...(COMPONENT_DEFS[type]?.defaultState ?? {}) },
          props: { ...(COMPONENT_DEFS[type]?.defaultProps ?? {}) },
        },
      ],
      simVoltages: null,
      simCurrents: null,
      selectedComponentId: null,
    })),

  removeComponent: (id) =>
    set((s) => ({
      components: s.components.filter((c) => c.id !== id),
      wires: s.wires.filter(
        (w) => w.fromComponentId !== id && w.toComponentId !== id
      ),
      simVoltages: null,
      simCurrents: null,
      selectedComponentId: s.selectedComponentId === id ? null : s.selectedComponentId,
    })),

  selectComponent: (id) => set({ selectedComponentId: id }),
  deselectComponent: () => set({ selectedComponentId: null }),

  updateComponentState: (id, patch) =>
    set((s) => ({
      components: s.components.map((c) =>
        c.id === id ? { ...c, state: { ...c.state, ...patch } } : c
      ),
      simVoltages: null,
      simCurrents: null,
    })),

  updateComponentProps: (id, patch) =>
    set((s) => ({
      components: s.components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, ...patch } } : c
      ),
      simVoltages: null,
      simCurrents: null,
    })),

  // ── Wiring ────────────────────────────────────────────────────────────────
  startWiring: (componentId, nodeId) =>
    set({ wiringFrom: { componentId, nodeId }, selectedWireId: null, selectedComponentId: null }),

  completeWiring: (toComponentId, toNodeId) =>
    set((s) => {
      const from = s.wiringFrom
      if (!from) return {}
      if (from.componentId === toComponentId) return { wiringFrom: null }

      const isDuplicate = s.wires.some(
        (w) =>
          (w.fromComponentId === from.componentId && w.fromNode === from.nodeId &&
           w.toComponentId === toComponentId && w.toNode === toNodeId) ||
          (w.fromComponentId === toComponentId && w.fromNode === toNodeId &&
           w.toComponentId === from.componentId && w.toNode === from.nodeId)
      )
      if (isDuplicate) return { wiringFrom: null }

      return {
        wires: [
          ...s.wires,
          {
            id: uid(),
            fromComponentId: from.componentId,
            fromNode: from.nodeId,
            toComponentId,
            toNode: toNodeId,
          },
        ],
        wiringFrom: null,
        simVoltages: null,
        simCurrents: null,
      }
    }),

  cancelWiring: () => set({ wiringFrom: null }),

  selectWire: (id) => set({ selectedWireId: id }),

  removeWire: (id) =>
    set((s) => ({
      wires: s.wires.filter((w) => w.id !== id),
      selectedWireId: s.selectedWireId === id ? null : s.selectedWireId,
      simVoltages: null,
      simCurrents: null,
    })),

  setSimMode: (mode) => set({ simMode: mode, simTransient: null }),
  setSimParams: (patch) => set((s) => ({ simParams: { ...s.simParams, ...patch } })),

  // ── Simulation ────────────────────────────────────────────────────────────
  runSimulation: async () => {
    set({ simLoading: true, simError: null })
    const { components, wires, simMode, simParams } = get()
    try {
      const res = await fetch('/api/simulate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          components,
          wires,
          params: {
            mode: simMode,
            tran_stop: simParams.tranStop,
            tran_step: simParams.tranStep,
          },
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.success) {
        if (simMode === 'transient') {
          set({
            simTransient: {
              time:  data.transientTime  ?? [],
              nets:  data.transientNets  ?? {},
              nodes: data.transientNodes ?? {},
            },
            simVoltages: null,
            simCurrents: null,
            simLoading: false,
          })
        } else {
          set({
            simVoltages:  data.nodeVoltages   ?? null,
            simCurrents:  data.branchCurrents ?? null,
            simTransient: null,
            simLoading:   false,
          })
        }
      } else {
        set({ simError: data.error || 'Simulation failed', simLoading: false })
      }
    } catch (err) {
      set({ simError: err.message || 'Network error', simLoading: false })
    }
  },

  clearSimError: () => set({ simError: null }),

  // ── Persist ───────────────────────────────────────────────────────────────
  clearCircuit: () => {
    _seq = 0
    set({
      components: [], wires: [],
      simVoltages: null, simCurrents: null, simError: null, simLoading: false,
      activeType: null, wiringFrom: null, selectedWireId: null, selectedComponentId: null,
    })
  },

  loadCircuit: (data) => {
    // Advance _seq past the highest numeric ID in the file so new placements
    // never collide with loaded component IDs.
    const maxId = (data.components ?? []).reduce((max, c) => {
      const n = parseInt(String(c.id).replace(/\D/g, ''), 10)
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)
    _seq = maxId
    set({
      components: data.components ?? [],
      wires: data.wires ?? [],
      simVoltages: null, simCurrents: null, simError: null, simLoading: false,
      activeType: null, wiringFrom: null, selectedWireId: null, selectedComponentId: null,
    })
  },
}))
