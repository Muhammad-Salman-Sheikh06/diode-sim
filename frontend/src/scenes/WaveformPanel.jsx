import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useCircuitStore } from '../store/circuitStore'

const COLORS = [
  '#00c87a', '#7ab8ff', '#ffaa00', '#ff6b6b',
  '#c77dff', '#00f5d4', '#ffd166', '#ef476f',
]

function timeScale(maxT) {
  if (maxT >= 1)    return { unit: 's',  scale: 1 }
  if (maxT >= 1e-3) return { unit: 'ms', scale: 1e3 }
  if (maxT >= 1e-6) return { unit: 'µs', scale: 1e6 }
  return              { unit: 'ns', scale: 1e9 }
}

function fmtV(v) {
  if (v === undefined || v === null) return '—'
  return `${v.toFixed(3)} V`
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d0d12', border: '1px solid #1e1e30',
      padding: '6px 10px', borderRadius: 4, fontSize: 11,
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{ color: '#555', marginBottom: 4 }}>{label} {unit}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.stroke }}>
          {p.name}: {fmtV(p.value)}
        </div>
      ))}
    </div>
  )
}

export function WaveformPanel() {
  // ── All hooks unconditionally at the top ──────────────────────────────────
  const simTransient = useCircuitStore((s) => s.simTransient)
  const [collapsed, setCollapsed] = useState(false)
  const [hidden, setHidden] = useState(() => new Set())

  // Derive everything from simTransient safely — empty defaults when null
  const time    = simTransient?.time ?? []
  const nets    = simTransient?.nets ?? {}
  const netKeys = useMemo(
    () => Object.keys(nets).filter(k => nets[k]?.length > 0),
    [simTransient],
  )
  const maxT           = time.length ? time[time.length - 1] : 0
  const { unit, scale } = timeScale(maxT)

  const chartData = useMemo(() => {
    if (!time.length || !netKeys.length) return []
    return time.map((t, i) => {
      const row = { t: parseFloat((t * scale).toPrecision(5)) }
      netKeys.forEach(k => { row[k] = nets[k][i] ?? null })
      return row
    })
  }, [simTransient])

  // ── Early return AFTER all hooks ──────────────────────────────────────────
  if (!simTransient || !time.length || !netKeys.length) return null

  const toggle = (k) => setHidden(prev => {
    const next = new Set(prev)
    next.has(k) ? next.delete(k) : next.add(k)
    return next
  })

  return (
    <div style={{
      flexShrink: 0,
      background: '#080d08',
      borderTop: '1px solid #1a2a1a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Courier New', monospace",
    }}>
      {/* ── Header / collapse toggle ── */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 14px', cursor: 'pointer',
          background: '#0a100a', borderBottom: collapsed ? 'none' : '1px solid #1a2a1a',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 10, color: '#3a3a55', letterSpacing: 2 }}>
          WAVEFORMS
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {netKeys.map((k, i) => (
            <button
              key={k}
              onClick={(e) => { e.stopPropagation(); toggle(k) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 4,
                opacity: hidden.has(k) ? 0.3 : 1,
              }}
            >
              <span style={{
                display: 'inline-block', width: 20, height: 2,
                background: COLORS[i % COLORS.length], borderRadius: 1,
              }} />
              <span style={{ fontSize: 10, color: '#888' }}>{k}</span>
            </button>
          ))}
          <span style={{ fontSize: 11, color: '#3a5a3a' }}>
            {collapsed ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* ── Chart ── */}
      {!collapsed && (
        <div style={{ height: 200, padding: '8px 4px 8px 0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f1f0f" />
              <XAxis
                dataKey="t"
                tick={{ fill: '#444', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#1a2a1a' }}
                tickFormatter={(v) => `${v} ${unit}`}
              />
              <YAxis
                tick={{ fill: '#444', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#1a2a1a' }}
                width={42}
                label={{ value: 'V', angle: -90, position: 'insideLeft', offset: 12, fill: '#3a5a3a', fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              {netKeys.map((k, i) =>
                hidden.has(k) ? null : (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    name={k}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
