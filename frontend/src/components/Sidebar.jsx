import { useRef } from 'react'
import { useCircuitStore } from '../store/circuitStore'
import { COMPONENT_DEFS, PALETTE_ORDER } from '../scenes/componentDefs'

const s = {
  root: {
    width: 210,
    flexShrink: 0,
    background: '#0d0d12',
    borderRight: '1px solid #1a1a28',
    display: 'flex',
    flexDirection: 'column',
    padding: '14px 10px',
    gap: 5,
    fontFamily: "'Courier New', monospace",
    color: '#bbb',
    userSelect: 'none',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  label: {
    fontSize: 10,
    color: '#3a3a55',
    letterSpacing: 2,
    marginBottom: 2,
    marginTop: 6,
  },
  btn: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 9px',
    background: active ? '#0d2e20' : '#13131c',
    border: `1px solid ${active ? '#00c87a' : '#1e1e30'}`,
    borderRadius: 5,
    color: active ? '#00c87a' : '#888',
    cursor: 'pointer',
    fontSize: 11,
    textAlign: 'left',
    width: '100%',
    transition: 'border-color 0.12s, color 0.12s, background 0.12s',
  }),
  swatch: (color) => ({
    width: 9,
    height: 9,
    borderRadius: 2,
    background: color,
    flexShrink: 0,
  }),
  simBtn: (loading, disabled) => ({
    padding: '9px',
    background: loading ? '#111' : disabled ? '#111' : '#0d2e20',
    border: `1px solid ${loading ? '#2a3a2a' : disabled ? '#1e1e30' : '#00c87a'}`,
    borderRadius: 5,
    color: loading ? '#4a6a4a' : disabled ? '#444' : '#00c87a',
    cursor: loading ? 'wait' : disabled ? 'not-allowed' : 'pointer',
    fontSize: 11,
    width: '100%',
    transition: 'all 0.12s',
    letterSpacing: 0.5,
    marginTop: 4,
  }),
  divider: {
    borderTop: '1px solid #1a1a28',
    paddingTop: 8,
    marginTop: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  statusRow: (color) => ({
    fontSize: 11,
    color,
    lineHeight: 1.6,
    whiteSpace: 'pre-line',
  }),
  swToggle: (on) => ({
    flex: 1,
    padding: '4px 0',
    background: on ? '#0d2e20' : '#1a1a1a',
    border: `1px solid ${on ? '#00c87a' : '#333'}`,
    borderRadius: 4,
    color: on ? '#00c87a' : '#666',
    cursor: 'pointer',
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 0.5,
  }),
  hint: {
    fontSize: 10,
    color: '#252535',
    lineHeight: 1.9,
    marginTop: 4,
  },
  counts: {
    fontSize: 10,
    color: '#2a2a40',
    marginTop: 2,
  },
  modeRow: {
    display: 'flex',
    gap: 4,
    marginTop: 2,
  },
  modeBtn: (active) => ({
    flex: 1,
    padding: '5px 0',
    background: active ? '#0d2e20' : '#13131c',
    border: `1px solid ${active ? '#00c87a' : '#1e1e30'}`,
    borderRadius: 4,
    color: active ? '#00c87a' : '#555',
    cursor: 'pointer',
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  }),
  tranParam: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  tranInput: {
    flex: 1,
    background: '#0d1520',
    border: '1px solid #1e3050',
    borderRadius: 3,
    color: '#7ab8ff',
    fontSize: 11,
    padding: '2px 5px',
    fontFamily: "'Courier New', monospace",
    outline: 'none',
    minWidth: 0,
  },
  tranLabel: {
    fontSize: 10,
    color: '#555',
    flexShrink: 0,
    width: 34,
  },
  ioRow: {
    display: 'flex',
    gap: 4,
    marginTop: 2,
  },
  ioBtn: {
    flex: 1,
    padding: '6px 0',
    background: '#0d1520',
    border: '1px solid #1e3050',
    borderRadius: 4,
    color: '#7ab8ff',
    cursor: 'pointer',
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 0.5,
  },
  clearBtn: {
    flex: 1,
    padding: '6px 0',
    background: '#150d0d',
    border: '1px solid #502828',
    borderRadius: 4,
    color: '#ff8888',
    cursor: 'pointer',
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 0.5,
  },
  propPanel: {
    background: '#0a0a10',
    border: '1px solid #1e1e30',
    borderRadius: 5,
    padding: '7px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  propHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  propTitle: {
    fontSize: 11,
    color: '#8af',
    fontWeight: 'normal',
  },
  delBtn: {
    padding: '2px 7px',
    background: '#200a0a',
    border: '1px solid #773333',
    borderRadius: 3,
    color: '#ff6666',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    lineHeight: 1,
    flexShrink: 0,
  },
  propRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  propLabel: {
    fontSize: 10,
    color: '#666',
    flex: 1,
  },
  propInput: (readOnly) => ({
    width: 62,
    background: readOnly ? '#080810' : '#0d1828',
    border: `1px solid ${readOnly ? '#161622' : '#1e3555'}`,
    borderRadius: 3,
    color: readOnly ? '#3a3a55' : '#7ab8ff',
    fontSize: 11,
    padding: '2px 5px',
    fontFamily: "'Courier New', monospace",
    textAlign: 'right',
    outline: 'none',
  }),
  propUnit: {
    fontSize: 10,
    color: '#444',
    width: 18,
    flexShrink: 0,
  },
}

// Numeric input that commits to the store only on blur / Enter,
// so typing mid-value doesn't thrash the store.
// Uncontrolled input: defaultValue sets the initial display, ref reads the
// live DOM value on commit — no stale-closure risk from React's deferred renders.
// PropertiesPanel carries key={comp.id} so it remounts (resetting defaultValue)
// whenever the selected component changes.
function PropField({ label, unit = '', value, readOnly = false, min = -Infinity, integer = false, onCommit }) {
  const inputRef = useRef(null)

  const commit = () => {
    if (readOnly || !inputRef.current) return
    const raw = inputRef.current.value
    const n = parseFloat(raw)
    console.log(`[props] ${label}: raw="${raw}" parsed=${n} min=${min}`)
    if (isNaN(n) || n < min) {
      inputRef.current.value = String(value)   // revert display to store value
      return
    }
    onCommit(integer ? Math.round(n) : n)
  }

  return (
    <div style={s.propRow}>
      <span style={s.propLabel}>{label}</span>
      {readOnly
        ? <span style={{ ...s.propInput(true), display: 'inline-block', lineHeight: '1.8' }}>{value}</span>
        : <input
            ref={inputRef}
            type="text"
            defaultValue={value}
            style={s.propInput(false)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
          />
      }
      <span style={s.propUnit}>{unit}</span>
    </div>
  )
}

function PropertiesPanel({ comp, updateComponentProps, updateComponentState }) {
  const { type, props = {}, state = {} } = comp

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {type === 'resistor' && (
        <PropField
          label="Resistance" unit="Ω"
          value={props.resistance ?? 1000} min={0.001}
          onCommit={(v) => updateComponentProps(comp.id, { resistance: v })}
        />
      )}

      {type === 'capacitor' && (
        <PropField
          label="Capacitance" unit="µF"
          value={props.capacitance ?? 10} min={0.000001}
          onCommit={(v) => updateComponentProps(comp.id, { capacitance: v })}
        />
      )}

      {type === 'led' && (
        <PropField label="Vf (model)" unit="V" value={props.vf ?? 2.0} readOnly />
      )}

      {type === 'voltage_source' && (
        <PropField
          label="Voltage" unit="V"
          value={props.voltage ?? 5}
          onCommit={(v) => updateComponentProps(comp.id, { voltage: v })}
        />
      )}

      {type === 'npn_transistor' && (
        <PropField
          label="hFE (gain)" unit=""
          value={props.hfe ?? 100} min={1} integer
          onCommit={(v) => updateComponentProps(comp.id, { hfe: v })}
        />
      )}

      {type === 'switch' && (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            style={s.swToggle(!(state.closed ?? false))}
            onClick={() => updateComponentState(comp.id, { closed: false })}
          >OPEN</button>
          <button
            style={s.swToggle(state.closed ?? false)}
            onClick={() => updateComponentState(comp.id, { closed: true })}
          >CLOSED</button>
        </div>
      )}

      {type === 'potentiometer' && (
        <>
          <PropField
            label="Total R" unit="Ω"
            value={props.totalResistance ?? 1000} min={1}
            onCommit={(v) => updateComponentProps(comp.id, { totalResistance: v })}
          />
          <div>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>
              Wiper — {Math.round((state.ratio ?? 0.5) * 100)}%
            </div>
            <input
              type="range" min="0" max="100"
              value={Math.round((state.ratio ?? 0.5) * 100)}
              onChange={(e) =>
                updateComponentState(comp.id, { ratio: Number(e.target.value) / 100 })
              }
              style={{ width: '100%', accentColor: '#00c87a', cursor: 'pointer' }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export function Sidebar() {
  const {
    activeType, setActiveType,
    wiringFrom, selectedWireId,
    components, wires,
    simVoltages, simLoading,
    runSimulation,
    updateComponentState,
    updateComponentProps,
    selectedComponentId,
    removeComponent,
    loadCircuit,
    clearCircuit,
    simMode, setSimMode,
    simParams, setSimParams,
  } = useCircuitStore()

  const fileInputRef = useRef(null)

  const handleSave = () => {
    const payload = JSON.stringify({ version: 1, components, wires }, null, 2)
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-circuit.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''   // reset so the same file can be reloaded later
    if (!file) return
    if (
      (components.length > 0 || wires.length > 0) &&
      !window.confirm('Load circuit? The current canvas will be replaced.')
    ) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        if (!Array.isArray(data.components) || !Array.isArray(data.wires))
          throw new Error('Missing components or wires array.')
        loadCircuit(data)
      } catch (err) {
        alert(`Could not load file: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    if (components.length === 0 && wires.length === 0) return
    if (window.confirm('Clear the canvas? This cannot be undone.')) clearCircuit()
  }

  const isPlacing = !!activeType
  const isWiring  = !!wiringFrom
  const hasResults = simVoltages !== null
  const simReady  = components.length > 0

  const wiringSourceComp = wiringFrom
    ? components.find((c) => c.id === wiringFrom.componentId)
    : null

  const selectedComp   = components.find((c) => c.id === selectedComponentId) ?? null
  const switches       = components.filter((c) => c.type === 'switch')
  const potentiometers = components.filter((c) => c.type === 'potentiometer')
  const hasControls    = switches.length > 0 || potentiometers.length > 0

  return (
    <div style={s.root}>
      <div style={s.label}>COMPONENTS</div>

      {PALETTE_ORDER.map((type) => {
        const def = COMPONENT_DEFS[type]
        const active = activeType === type
        return (
          <button key={type} onClick={() => setActiveType(type)} style={s.btn(active)}>
            <span style={s.swatch(def.color)} />
            {def.label}
          </button>
        )
      })}

      {/* ── Sim mode toggle ──────────────────────────────────────────────── */}
      <div style={s.modeRow}>
        <button style={s.modeBtn(simMode === 'dc')}
          onClick={() => setSimMode('dc')}>DC</button>
        <button style={s.modeBtn(simMode === 'transient')}
          onClick={() => setSimMode('transient')}>Transient</button>
      </div>

      {simMode === 'transient' && (
        <>
          <div style={s.tranParam}>
            <span style={s.tranLabel}>Stop</span>
            <input
              type="text"
              value={simParams.tranStop}
              onChange={(e) => setSimParams({ tranStop: e.target.value })}
              style={s.tranInput}
              placeholder="1m"
            />
          </div>
          <div style={s.tranParam}>
            <span style={s.tranLabel}>Step</span>
            <input
              type="text"
              value={simParams.tranStep}
              onChange={(e) => setSimParams({ tranStep: e.target.value })}
              style={s.tranInput}
              placeholder="1u"
            />
          </div>
        </>
      )}

      <button
        onClick={runSimulation}
        disabled={simLoading || !simReady}
        style={s.simBtn(simLoading, !simReady)}
      >
        {simLoading ? 'Simulating…' : hasResults ? 'Re-simulate' : 'Simulate'}
      </button>

      {/* ── Save / Load / Clear ──────────────────────────────────────────── */}
      <div style={s.ioRow}>
        <button style={s.ioBtn} onClick={handleSave}>Save</button>
        <button style={s.ioBtn} onClick={() => fileInputRef.current?.click()}>Load</button>
        <button style={s.clearBtn} onClick={handleClear}>Clear</button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ── Properties Panel ─────────────────────────────────────────────── */}
      {selectedComp && (
        <>
          <div style={s.label}>PROPERTIES</div>
          <div style={s.propPanel}>
            <div style={s.propHeader}>
              <span style={s.propTitle}>
                {COMPONENT_DEFS[selectedComp.type]?.label}
              </span>
              <button style={s.delBtn} onClick={() => removeComponent(selectedComp.id)}>×</button>
            </div>

            <PropertiesPanel
              key={selectedComp.id}
              comp={selectedComp}
              updateComponentProps={updateComponentProps}
              updateComponentState={updateComponentState}
            />
          </div>
        </>
      )}

      {/* ── Circuit Controls ──────────────────────────────────────────────── */}
      {hasControls && (
        <>
          <div style={s.label}>CIRCUIT</div>

          {switches.map((sw, i) => (
            <div key={sw.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#555', fontSize: 10, flexShrink: 0, width: 28 }}>
                SW{i + 1}
              </span>
              <button
                onClick={() =>
                  updateComponentState(sw.id, { closed: !(sw.state?.closed ?? false) })
                }
                style={s.swToggle(sw.state?.closed ?? false)}
              >
                {sw.state?.closed ? 'CLOSED' : 'OPEN'}
              </button>
            </div>
          ))}

          {potentiometers.map((pot, i) => {
            const pct = Math.round((pot.state?.ratio ?? 0.5) * 100)
            return (
              <div key={pot.id}>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>
                  POT{i + 1} — {pct}%
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pct}
                  onChange={(e) =>
                    updateComponentState(pot.id, { ratio: Number(e.target.value) / 100 })
                  }
                  style={{ width: '100%', accentColor: '#00c87a', cursor: 'pointer' }}
                />
              </div>
            )
          })}
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* ── Status ────────────────────────────────────────────────────────── */}
      <div style={s.divider}>
        {isPlacing && (
          <div style={s.statusRow('#00c87a')}>
            {`Placing ${COMPONENT_DEFS[activeType].label}\nESC to cancel`}
          </div>
        )}
        {isWiring && (
          <div style={s.statusRow('#ffaa00')}>
            {`Wiring from ${COMPONENT_DEFS[wiringSourceComp?.type]?.label ?? '…'}\nClick a node or ESC`}
          </div>
        )}
        {selectedWireId && !isWiring && (
          <div style={s.statusRow('#ff7777')}>
            {'Wire selected\nDEL to remove\nRight-click to remove'}
          </div>
        )}
        {selectedComp && !isPlacing && !isWiring && !selectedWireId && (
          <div style={s.statusRow('#3a6aaa')}>
            {'Component selected\nDEL to delete\nESC to deselect'}
          </div>
        )}
        {hasResults && !isPlacing && !isWiring && !selectedWireId && !selectedComp && (
          <div style={s.statusRow('#00c87a')}>Simulation complete</div>
        )}
        {!isPlacing && !isWiring && !selectedWireId && !hasResults && !selectedComp && (
          <div style={s.statusRow('#3a3a55')}>
            {'Select a component\nor click a node to wire'}
          </div>
        )}
      </div>

      <div style={s.hint}>
        Drag: orbit{'\n'}Right drag: pan{'\n'}Scroll: zoom
      </div>

      <div style={s.counts}>
        {components.length} component{components.length !== 1 ? 's' : ''}{'\n'}
        {wires.length} wire{wires.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
