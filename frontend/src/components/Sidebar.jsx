import { useRef, useState } from 'react'
import { useCircuitStore } from '../store/circuitStore'
import { COMPONENT_DEFS, LED_COLORS } from '../scenes/componentDefs'
import { EXAMPLE_CIRCUITS } from '../data/exampleCircuits'

// ── Design tokens — CSS custom properties; theme values live in theme.css ─────
const BG       = 'var(--bg)'
const SURF     = 'var(--surf)'
const SURF_HI  = 'var(--surf-hi)'
const SURF_HV  = 'var(--surf-hov)'    // hover bg for palette / IO buttons
const BORDER   = 'var(--border)'
const ACCENT   = 'var(--accent)'
const ACCENT_B = 'var(--accent-dim)'
const T1       = 'var(--t1)'
const T2       = 'var(--t2)'
const MUTED    = 'var(--muted)'
const ERR      = 'var(--err)'
const ERR_BG   = 'var(--err-bg)'
const ERR_BD   = 'var(--err-bd)'
const IA_HBG   = 'var(--ia-hov-bg)'  // interactive link/example button hover bg
const IA_HBD   = 'var(--ia-hov-bd)'  // interactive link/example button hover border
const TR       = 'all 180ms ease'

// ── Palette groups ─────────────────────────────────────────────────────────────
const PALETTE_GROUPS = [
  { label: 'Passive', types: ['resistor', 'capacitor', 'inductor', 'potentiometer'] },
  { label: 'Active',  types: ['led', 'npn_transistor', 'nmos_transistor', 'op_amp'] },
  { label: 'Power',   types: ['voltage_source', 'ground'] },
  { label: 'Misc',    types: ['switch', 'junction'] },
]

// ── Style helpers ──────────────────────────────────────────────────────────────
const s = {
  root: {
    width: 220,
    flexShrink: 0,
    background: SURF,
    borderRight: `1px solid ${BORDER}`,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    fontFamily: "'Courier New', monospace",
    color: T1,
    userSelect: 'none',
  },

  sec: { padding: '0 10px' },

  // Section header row (label + optional toggle)
  secRow: (first) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: first ? '11px 0 5px' : '12px 0 5px',
    borderTop: first ? 'none' : `1px solid ${BORDER}`,
  }),

  secLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: T2,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  toggleBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${BORDER}`,
    color: T1,
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
    padding: '2px 6px',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    minHeight: 22,
    transition: TR,
  },

  // Small category label inside palette — row with its own toggle
  catRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 0 2px',
    cursor: 'pointer',
  },
  catLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: MUTED,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  catToggle: {
    background: 'none',
    border: 'none',
    color: T1,
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
    padding: '1px 4px',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    minHeight: 20,
    opacity: 0.7,
    transition: TR,
  },

  // Compact palette button — 32 px fixed height
  palBtn: (active, hovered) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 32,
    padding: '0 7px',
    background: active ? ACCENT_B : hovered ? SURF_HV : 'transparent',
    border: `1px solid ${active ? ACCENT : hovered ? BORDER : 'transparent'}`,
    borderLeft: `2px solid ${active ? ACCENT : hovered ? '#44445a' : 'transparent'}`,
    borderRadius: 4,
    color: active ? ACCENT : T1,
    cursor: 'pointer',
    fontSize: 11,
    textAlign: 'left',
    transition: TR,
    boxSizing: 'border-box',
  }),

  swatch: (color) => ({
    width: 10,
    height: 10,
    borderRadius: 2,
    background: color,
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: `0 0 5px ${color}55`,
  }),

  // Segmented control
  segWrap: {
    display: 'flex',
    background: BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  segBtn: (active) => ({
    flex: 1,
    minHeight: 30,
    padding: '5px 0',
    background: active ? ACCENT_B : 'transparent',
    border: `1px solid ${active ? ACCENT : 'transparent'}`,
    borderRadius: 4,
    color: active ? ACCENT : T2,
    cursor: 'pointer',
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    fontWeight: active ? 600 : 400,
    letterSpacing: 1,
    transition: TR,
  }),

  // Transient params
  paramRow: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 },
  paramLabel: { fontSize: 9, color: T2, width: 26, flexShrink: 0 },
  paramInput: {
    flex: 1,
    background: BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    color: T1,
    fontSize: 10,
    padding: '4px 6px',
    fontFamily: "'Courier New', monospace",
    outline: 'none',
    minWidth: 0,
    transition: TR,
  },
  paramUnit: { fontSize: 9, color: MUTED, width: 14, flexShrink: 0 },

  // Simulate button
  simBtn: (loading, disabled) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    minHeight: 40,
    padding: '10px',
    marginTop: 6,
    background: disabled || loading ? 'transparent' : ACCENT_B,
    border: `1px solid ${disabled ? BORDER : loading ? 'var(--sim-load-bd)' : ACCENT}`,
    borderRadius: 6,
    color: disabled ? MUTED : loading ? 'var(--sim-load-c)' : ACCENT,
    cursor: disabled ? 'not-allowed' : loading ? 'wait' : 'pointer',
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    fontWeight: 600,
    letterSpacing: 1,
    transition: TR,
    boxSizing: 'border-box',
  }),

  // Undo / redo row — compact
  undoRow: { display: 'flex', gap: 4, marginBottom: 5 },
  undoBtn: (disabled) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 26,
    background: 'transparent',
    border: `1px solid ${disabled ? MUTED : BORDER}`,
    borderRadius: 5,
    color: disabled ? MUTED : T2,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    transition: TR,
    opacity: disabled ? 0.35 : 1,
  }),

  // Examples button
  exBtn: (hov) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    height: 28,
    padding: '0 8px',
    marginBottom: 5,
    background: hov ? IA_HBG : 'transparent',
    border: `1px solid ${hov ? IA_HBD : BORDER}`,
    borderRadius: 5,
    color: hov ? T1 : T2,
    cursor: 'pointer',
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 0.4,
    transition: TR,
    textAlign: 'left',
    boxSizing: 'border-box',
  }),

  // IO toolbar — icon-only buttons
  ioRow: { display: 'flex', gap: 4 },
  ioBtn: (danger, hov) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    background: danger ? (hov ? ERR_BG : 'transparent') : hov ? SURF_HV : 'transparent',
    border: `1px solid ${danger ? (hov ? ERR : ERR_BD) : hov ? IA_HBD : BORDER}`,
    borderRadius: 5,
    color: danger ? ERR : hov ? T1 : T2,
    cursor: 'pointer',
    fontSize: 15,
    lineHeight: 1,
    transition: TR,
  }),

  // Properties card
  propCard: {
    background: SURF_HI,
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  propCardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  propCardTitle: { fontSize: 11, color: T1, fontWeight: 600, letterSpacing: 0.2 },
  delBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    flexShrink: 0,
    background: ERR_BG,
    border: `1px solid ${ERR_BD}`,
    borderRadius: 4,
    color: ERR,
    cursor: 'pointer',
    fontSize: 13,
    lineHeight: 1,
    transition: TR,
  },
  propRow: { display: 'flex', alignItems: 'center', gap: 6 },
  propLabel: { fontSize: 10, color: T2, flex: 1 },
  propInput: (readOnly) => ({
    width: 60,
    background: readOnly ? 'transparent' : BG,
    border: `1px solid ${readOnly ? 'transparent' : BORDER}`,
    borderRadius: 4,
    color: readOnly ? MUTED : T1,
    fontSize: 10,
    padding: '3px 6px',
    fontFamily: "'Courier New', monospace",
    textAlign: 'right',
    outline: 'none',
    transition: TR,
  }),
  propUnit: { fontSize: 9, color: MUTED, width: 18, flexShrink: 0 },
  colorSelect: {
    width: 88,
    background: BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    color: T1,
    fontSize: 10,
    padding: '3px 5px',
    fontFamily: "'Courier New', monospace",
    outline: 'none',
    cursor: 'pointer',
  },

  // Switch toggle
  swToggle: (on) => ({
    flex: 1,
    minHeight: 30,
    padding: '5px 0',
    background: on ? ACCENT_B : 'transparent',
    border: `1px solid ${on ? ACCENT : BORDER}`,
    borderRadius: 4,
    color: on ? ACCENT : T2,
    cursor: 'pointer',
    fontSize: 9,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 0.5,
    transition: TR,
  }),

  // Compact footer
  footer: {
    padding: '8px 10px 10px',
    marginTop: 'auto',
    borderTop: `1px solid ${BORDER}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    minHeight: 52,
  },
  statusLine: (color) => ({
    fontSize: 9,
    color,
    lineHeight: 1.5,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  }),
  footerMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
  },
  counts: { fontSize: 9, color: MUTED },
  hint:   { fontSize: 9, color: MUTED },

  // Modal overlay
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(0,0,0,0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: SURF,
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: '18px 16px 14px',
    width: 370,
    maxWidth: 'calc(100vw - 48px)',
    maxHeight: 'calc(100vh - 80px)',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
  },
  modalHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 12, fontWeight: 600, color: T1, letterSpacing: 0.3 },
  modalClose: {
    background: 'none', border: 'none', color: T2, cursor: 'pointer',
    fontSize: 17, lineHeight: 1, padding: '0 2px',
  },
  exCard: (hov) => ({
    width: '100%',
    textAlign: 'left',
    background: hov ? SURF_HI : 'transparent',
    border: `1px solid ${hov ? IA_HBD : BORDER}`,
    borderRadius: 7,
    padding: '9px 11px',
    cursor: 'pointer',
    transition: TR,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }),
  exCardName: { fontSize: 11, fontWeight: 600, color: T1 },
  exCardDesc: { fontSize: 9, color: T2, lineHeight: 1.5 },
  exCardBadge: (mode) => ({
    display: 'inline-block',
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    padding: '2px 5px',
    borderRadius: 3,
    background: mode === 'transient' ? 'var(--badge-tran-bg)' : ACCENT_B,
    color: mode === 'transient' ? 'var(--badge-tran-c)' : ACCENT,
    border: `1px solid ${mode === 'transient' ? 'var(--badge-tran-bd)' : 'var(--badge-dc-bd)'}`,
    alignSelf: 'flex-start',
    marginTop: 1,
  }),
}

// ── PropField ──────────────────────────────────────────────────────────────────
function PropField({ label, unit = '', value, readOnly = false, min = -Infinity, integer = false, onCommit }) {
  const ref = useRef(null)
  const commit = () => {
    if (readOnly || !ref.current) return
    const n = parseFloat(ref.current.value)
    if (isNaN(n) || n < min) { ref.current.value = String(value); return }
    onCommit(integer ? Math.round(n) : n)
  }
  return (
    <div style={s.propRow}>
      <span style={s.propLabel}>{label}</span>
      {readOnly
        ? <span style={{ ...s.propInput(true), display: 'inline-block', lineHeight: '1.8' }}>{value}</span>
        : <input ref={ref} type="text" defaultValue={value} className="sid-input"
            style={s.propInput(false)} onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }} />
      }
      <span style={s.propUnit}>{unit}</span>
    </div>
  )
}

// ── PropertiesPanel ────────────────────────────────────────────────────────────
function PropertiesPanel({ comp, updateComponentProps, updateComponentState }) {
  const { type, props = {}, state = {} } = comp
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <PropField label="Rotation" unit="°" value={comp.rotation ?? 0} readOnly />
      {type === 'resistor' && (
        <PropField label="Resistance" unit="Ω" value={props.resistance ?? 1000} min={0.001}
          onCommit={(v) => updateComponentProps(comp.id, { resistance: v })} />
      )}
      {type === 'capacitor' && (
        <PropField label="Capacitance" unit="µF" value={props.capacitance ?? 10} min={1e-6}
          onCommit={(v) => updateComponentProps(comp.id, { capacitance: v })} />
      )}
      {type === 'led' && (
        <div style={s.propRow}>
          <span style={s.propLabel}>Color</span>
          <select
            value={props.color ?? 'red'}
            onChange={(e) => updateComponentProps(comp.id, { color: e.target.value })}
            style={s.colorSelect}
          >
            {Object.entries(LED_COLORS).map(([key, { label, hex }]) => (
              <option key={key} value={key} style={{ color: key === 'white' ? '#888' : hex }}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
      {type === 'voltage_source' && (
        <PropField label="Voltage" unit="V" value={props.voltage ?? 5}
          onCommit={(v) => updateComponentProps(comp.id, { voltage: v })} />
      )}
      {type === 'npn_transistor' && (
        <PropField label="hFE (gain)" unit="" value={props.hfe ?? 100} min={1} integer
          onCommit={(v) => updateComponentProps(comp.id, { hfe: v })} />
      )}
      {type === 'op_amp' && (
        <PropField label="Open-loop gain" unit="" value={props.gain ?? 100000} min={1}
          onCommit={(v) => updateComponentProps(comp.id, { gain: v })} />
      )}
      {type === 'nmos_transistor' && (
        <PropField label="Vth" unit="V" value={props.vth ?? 2.0} min={0.1}
          onCommit={(v) => updateComponentProps(comp.id, { vth: v })} />
      )}
      {type === 'inductor' && (
        <PropField label="Inductance" unit="mH" value={props.inductance ?? 10} min={0.001}
          onCommit={(v) => updateComponentProps(comp.id, { inductance: v })} />
      )}
      {type === 'switch' && (
        <div style={{ display: 'flex', gap: 5 }}>
          <button style={s.swToggle(!(state.closed ?? false))}
            onClick={() => updateComponentState(comp.id, { closed: false })}>OPEN</button>
          <button style={s.swToggle(state.closed ?? false)}
            onClick={() => updateComponentState(comp.id, { closed: true })}>CLOSED</button>
        </div>
      )}
      {type === 'potentiometer' && (
        <>
          <PropField label="Total R" unit="Ω" value={props.totalResistance ?? 1000} min={1}
            onCommit={(v) => updateComponentProps(comp.id, { totalResistance: v })} />
          <div>
            <div style={{ fontSize: 9, color: T2, marginBottom: 3 }}>
              Wiper — {Math.round((state.ratio ?? 0.5) * 100)}%
            </div>
            <input type="range" min="0" max="100"
              value={Math.round((state.ratio ?? 0.5) * 100)}
              onChange={(e) => updateComponentState(comp.id, { ratio: Number(e.target.value) / 100 })}
              style={{ width: '100%', accentColor: ACCENT, cursor: 'pointer' }} />
          </div>
        </>
      )}
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
export function Sidebar() {
  const {
    activeType, setActiveType,
    wiringFrom, selectedWireId,
    components, wires,
    simVoltages, simLoading,
    runSimulation,
    updateComponentState, updateComponentProps,
    selectedComponentId, removeComponent,
    loadCircuit, clearCircuit,
    simMode, setSimMode,
    simParams, setSimParams,
    history, future, undo, redo,
    theme, setTheme,
  } = useCircuitStore()

  const fileInputRef = useRef(null)
  const [hovPalette, setHovPalette]     = useState(null)
  const [hovIO, setHovIO]               = useState(null)
  const [paletteOpen, setPaletteOpen]   = useState(true)
  const [groupOpen, setGroupOpen]       = useState({ Passive: true, Active: true, Power: true, Misc: true })
  const [showExamples, setShowExamples] = useState(false)
  const [hovExample, setHovExample]     = useState(null)

  const toggleGroup = (label) =>
    setGroupOpen((prev) => ({ ...prev, [label]: !prev[label] }))

  const isPlacing   = !!activeType
  const isWiring    = !!wiringFrom
  const hasResults  = simVoltages !== null
  const simReady    = components.length > 0

  const wiringSourceComp = wiringFrom
    ? components.find((c) => c.id === wiringFrom.componentId) : null
  const selectedComp = components.find((c) => c.id === selectedComponentId) ?? null
  const switches     = components.filter((c) => c.type === 'switch')
  const pots         = components.filter((c) => c.type === 'potentiometer')
  const hasControls  = switches.length > 0 || pots.length > 0

  // ── File handlers ──────────────────────────────────────────────────────────
  const handleSave = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, components, wires }, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href: url, download: 'my-circuit.json' }).click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if ((components.length || wires.length) &&
        !window.confirm('Load circuit? The current canvas will be replaced.')) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        if (!Array.isArray(data.components) || !Array.isArray(data.wires))
          throw new Error('Missing arrays.')
        loadCircuit(data)
      } catch (err) { alert(`Could not load: ${err.message}`) }
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    if (!components.length && !wires.length) return
    if (window.confirm('Clear the canvas? This cannot be undone.')) clearCircuit()
  }

  const handleLoadExample = (ex) => {
    setShowExamples(false)
    if ((components.length || wires.length) &&
        !window.confirm(`Load "${ex.name}"? The current canvas will be replaced.`)) return
    loadCircuit(ex)
    setSimMode(ex.suggestedMode ?? 'dc')
    if (ex.suggestedStop || ex.suggestedStep) {
      setSimParams({
        ...(ex.suggestedStop ? { tranStop: ex.suggestedStop } : {}),
        ...(ex.suggestedStep ? { tranStep: ex.suggestedStep } : {}),
      })
    }
  }

  // ── Status (first line only for compact bar) ───────────────────────────────
  let statusMsg, statusColor
  if (isPlacing) {
    statusMsg  = `Placing ${COMPONENT_DEFS[activeType]?.label} · R rotate · ESC cancel`
    statusColor = ACCENT
  } else if (isWiring) {
    statusMsg  = `Wiring from ${COMPONENT_DEFS[wiringSourceComp?.type]?.label ?? '…'} · ESC cancel`
    statusColor = '#ffaa44'
  } else if (selectedWireId) {
    statusMsg  = 'Wire selected · DEL to remove'
    statusColor = '#ff7777'
  } else if (selectedComp) {
    statusMsg  = `${COMPONENT_DEFS[selectedComp.type]?.label} · R rotate · DEL delete`
    statusColor = '#6699ff'
  } else if (hasResults) {
    statusMsg  = 'Simulation complete'
    statusColor = ACCENT
  } else {
    statusMsg  = 'Click palette to place · click node to wire'
    statusColor = MUTED
  }

  return (
    <div style={s.root}>

      {/* ── COMPONENTS ────────────────────────────────────────────────── */}
      <div style={s.sec}>
        <div style={s.secRow(true)}>
          <span style={s.secLabel}>Components</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              style={{ ...s.toggleBtn, fontSize: 13 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
            <button
              style={s.toggleBtn}
              onClick={() => setPaletteOpen((p) => !p)}
              title={paletteOpen ? 'Collapse' : 'Expand'}
            >
              {paletteOpen ? '▴' : '▾'}
            </button>
          </div>
        </div>

        {paletteOpen && PALETTE_GROUPS.map((group) => {
          const open = groupOpen[group.label]
          return (
            <div key={group.label}>
              <div style={s.catRow} onClick={() => toggleGroup(group.label)}>
                <span style={s.catLabel}>{group.label}</span>
                <button style={s.catToggle} tabIndex={-1}>{open ? '▴' : '▾'}</button>
              </div>
              {open && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {group.types.map((type) => {
                    const def     = COMPONENT_DEFS[type]
                    const active  = activeType === type
                    const hovered = hovPalette === type && !active
                    return (
                      <button
                        key={type}
                        style={s.palBtn(active, hovered)}
                        onMouseEnter={() => setHovPalette(type)}
                        onMouseLeave={() => setHovPalette(null)}
                        onClick={() => setActiveType(type)}
                      >
                        <span style={s.swatch(def.color)} />
                        <span style={{ flex: 1 }}>{def.label}</span>
                        {active && <span style={{ fontSize: 7, color: ACCENT }}>●</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── SIMULATION ────────────────────────────────────────────────── */}
      <div style={s.sec}>
        <div style={s.secRow(false)}>
          <span style={s.secLabel}>Simulation</span>
        </div>

        <div style={s.segWrap}>
          <button style={s.segBtn(simMode === 'dc')}
            onClick={() => setSimMode('dc')}>DC</button>
          <button style={s.segBtn(simMode === 'transient')}
            onClick={() => setSimMode('transient')}>Transient</button>
        </div>

        {simMode === 'transient' && (
          <div style={{ marginTop: 2 }}>
            <div style={s.paramRow}>
              <span style={s.paramLabel}>Stop</span>
              <input type="text" value={simParams.tranStop} className="sid-input"
                style={s.paramInput} placeholder="1m"
                onChange={(e) => setSimParams({ tranStop: e.target.value })} />
              <span style={s.paramUnit}>s</span>
            </div>
            <div style={s.paramRow}>
              <span style={s.paramLabel}>Step</span>
              <input type="text" value={simParams.tranStep} className="sid-input"
                style={s.paramInput} placeholder="1u"
                onChange={(e) => setSimParams({ tranStep: e.target.value })} />
              <span style={s.paramUnit}>s</span>
            </div>
          </div>
        )}

        <button onClick={runSimulation} disabled={simLoading || !simReady}
          style={s.simBtn(simLoading, !simReady)}>
          {simLoading ? '◌  Simulating…' : hasResults ? '↺  Re-simulate' : '▶  Simulate'}
        </button>
      </div>

      {/* ── FILES ─────────────────────────────────────────────────────── */}
      <div style={s.sec}>
        <div style={s.secRow(false)}>
          <span style={s.secLabel}>Files</span>
        </div>

        {/* Undo / Redo */}
        <div style={s.undoRow}>
          <button style={s.undoBtn(history.length === 0)} disabled={history.length === 0}
            onClick={undo} title="Undo (Ctrl+Z)">← Undo</button>
          <button style={s.undoBtn(future.length === 0)} disabled={future.length === 0}
            onClick={redo} title="Redo (Ctrl+Y)">Redo →</button>
        </div>

        {/* Examples */}
        <button
          style={s.exBtn(hovIO === 'examples')}
          onMouseEnter={() => setHovIO('examples')}
          onMouseLeave={() => setHovIO(null)}
          onClick={() => setShowExamples(true)}
        >
          <span>⚡</span>
          <span>Load example…</span>
        </button>

        {/* Save / Load / Clear — icon only */}
        <div style={s.ioRow}>
          {[
            { id: 'save',  icon: '💾', label: 'Save',  danger: false, action: handleSave },
            { id: 'load',  icon: '📂', label: 'Load',  danger: false, action: () => fileInputRef.current?.click() },
            { id: 'clear', icon: '🗑', label: 'Clear', danger: true,  action: handleClear },
          ].map(({ id, icon, label, danger, action }) => (
            <button key={id} style={s.ioBtn(danger, hovIO === id)}
              title={label}
              onMouseEnter={() => setHovIO(id)}
              onMouseLeave={() => setHovIO(null)}
              onClick={action}>
              {icon}
            </button>
          ))}
        </div>
        <input ref={fileInputRef} type="file" accept=".json"
          style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* ── PROPERTIES ────────────────────────────────────────────────── */}
      {selectedComp && (
        <div style={s.sec}>
          <div style={s.secRow(false)}>
            <span style={s.secLabel}>Properties</span>
          </div>
          <div style={s.propCard}>
            <div style={s.propCardHead}>
              <span style={s.propCardTitle}>{COMPONENT_DEFS[selectedComp.type]?.label}</span>
              <button style={s.delBtn} onClick={() => removeComponent(selectedComp.id)}
                title="Delete component">×</button>
            </div>
            <PropertiesPanel
              key={selectedComp.id}
              comp={selectedComp}
              updateComponentProps={updateComponentProps}
              updateComponentState={updateComponentState}
            />
          </div>
        </div>
      )}

      {/* ── CIRCUIT CONTROLS ──────────────────────────────────────────── */}
      {hasControls && (
        <div style={s.sec}>
          <div style={s.secRow(false)}>
            <span style={s.secLabel}>Circuit</span>
          </div>
          {switches.map((sw, i) => (
            <div key={sw.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: MUTED, width: 28, flexShrink: 0 }}>SW{i + 1}</span>
              <button style={s.swToggle(sw.state?.closed ?? false)}
                onClick={() => updateComponentState(sw.id, { closed: !(sw.state?.closed ?? false) })}>
                {sw.state?.closed ? 'CLOSED' : 'OPEN'}
              </button>
            </div>
          ))}
          {pots.map((pot, i) => {
            const pct = Math.round((pot.state?.ratio ?? 0.5) * 100)
            return (
              <div key={pot.id} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: T2, marginBottom: 3 }}>POT{i + 1} — {pct}%</div>
                <input type="range" min="0" max="100" value={pct}
                  onChange={(e) => updateComponentState(pot.id, { ratio: Number(e.target.value) / 100 })}
                  style={{ width: '100%', accentColor: ACCENT, cursor: 'pointer' }} />
              </div>
            )
          })}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* ── FOOTER — compact single-line status ───────────────────────── */}
      <div style={s.footer}>
        <div style={s.statusLine(statusColor)}>{statusMsg}</div>
        <div style={s.footerMeta}>
          <span style={s.hint}>Orbit · Zoom · Pan</span>
          <span style={s.counts}>
            {components.length}c · {wires.length}w
          </span>
        </div>
      </div>

      {/* ── EXAMPLES MODAL ────────────────────────────────────────────── */}
      {showExamples && (
        <div style={s.overlay} onClick={() => setShowExamples(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHead}>
              <span style={s.modalTitle}>Example Circuits</span>
              <button style={s.modalClose} onClick={() => setShowExamples(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {EXAMPLE_CIRCUITS.map((ex) => (
                <button
                  key={ex.name}
                  style={s.exCard(hovExample === ex.name)}
                  onMouseEnter={() => setHovExample(ex.name)}
                  onMouseLeave={() => setHovExample(null)}
                  onClick={() => handleLoadExample(ex)}
                >
                  <span style={s.exCardName}>{ex.name}</span>
                  <span style={s.exCardDesc}>{ex.description}</span>
                  <span style={s.exCardBadge(ex.suggestedMode)}>
                    {ex.suggestedMode === 'transient' ? 'Transient' : 'DC'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
