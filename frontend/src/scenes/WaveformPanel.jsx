import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useCircuitStore } from '../store/circuitStore'

const CHART_THEME = {
  dark:  { grid: '#1a1a2a', axis: '#2a2a3a', tick: '#55556a', tooltip: '#12121a', tooltipBd: '#2a2a3a', tooltipLabel: '#6666aa' },
  light: { grid: '#e0e0ec', axis: '#c0c0d0', tick: '#9090a8', tooltip: '#ffffff', tooltipBd: '#d0d0e0', tooltipLabel: '#8888aa' },
}

const COLORS = [
  '#00ff88', '#7ab8ff', '#ffaa44', '#ff6b6b',
  '#cc88ff', '#00f5d4', '#ffd166', '#ff8fab',
]

function timeScale(maxT) {
  if (maxT >= 1)    return { unit: 's',  scale: 1 }
  if (maxT >= 1e-3) return { unit: 'ms', scale: 1e3 }
  if (maxT >= 1e-6) return { unit: 'µs', scale: 1e6 }
  return              { unit: 'ns', scale: 1e9 }
}

function fmtV(v) {
  if (v === undefined || v === null) return '—'
  return `${Number(v).toFixed(3)} V`
}

const CustomTooltip = ({ active, payload, label, unit, ct }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: ct.tooltip,
      border: `1px solid ${ct.tooltipBd}`,
      borderRadius: 6,
      padding: '7px 11px',
      fontSize: 11,
      fontFamily: "'Courier New', monospace",
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    }}>
      <div style={{ color: ct.tooltipLabel, marginBottom: 5, fontSize: 10 }}>
        {label} {unit}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.stroke, lineHeight: 1.7 }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8,
            borderRadius: '50%', background: p.stroke, marginRight: 7, verticalAlign: 'middle',
          }} />
          {p.name}: {fmtV(p.value)}
        </div>
      ))}
    </div>
  )
}

export function WaveformPanel() {
  // ── All hooks unconditionally at top ──────────────────────────────────────
  const simTransient = useCircuitStore((s) => s.simTransient)
  const theme        = useCircuitStore((s) => s.theme)
  const ct           = CHART_THEME[theme] ?? CHART_THEME.dark
  const [collapsed, setCollapsed] = useState(false)
  const [hidden, setHidden]       = useState(() => new Set())

  const time    = simTransient?.time ?? []
  const nets    = simTransient?.nets ?? {}
  const netKeys = useMemo(
    () => Object.keys(nets).filter(k => nets[k]?.length > 0),
    [simTransient],
  )
  const maxT            = time.length ? time[time.length - 1] : 0
  const { unit, scale } = timeScale(maxT)

  const chartData = useMemo(() => {
    if (!time.length || !netKeys.length) return []
    return time.map((t, i) => {
      const row = { t: parseFloat((t * scale).toPrecision(5)) }
      netKeys.forEach(k => { row[k] = nets[k][i] ?? null })
      return row
    })
  }, [simTransient])

  // ── Early return after all hooks ──────────────────────────────────────────
  if (!simTransient || !time.length || !netKeys.length) return null

  const toggle = (k) => setHidden(prev => {
    const next = new Set(prev)
    next.has(k) ? next.delete(k) : next.add(k)
    return next
  })

  return (
    <div style={{
      flexShrink: 0,
      background: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Courier New', monospace",
    }}>

      {/* ── Header ── */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 16px',
          cursor: 'pointer',
          background: 'var(--surf)',
          borderBottom: collapsed ? 'none' : '1px solid var(--border)',
          userSelect: 'none',
          minHeight: 40,
        }}
      >
        <span style={{
          fontSize: 9, fontWeight: 700, color: 'var(--t2)',
          letterSpacing: 2.5, textTransform: 'uppercase',
        }}>
          Waveforms
        </span>

        {/* Legend pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {netKeys.map((k, i) => {
            const color = COLORS[i % COLORS.length]
            const isHidden = hidden.has(k)
            return (
              <button
                key={k}
                onClick={(e) => { e.stopPropagation(); toggle(k) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 9px 3px 6px',
                  background: isHidden ? 'transparent' : `${color}18`,
                  border: `1px solid ${isHidden ? 'var(--border)' : color}`,
                  borderRadius: 20,
                  color: isHidden ? 'var(--muted)' : 'var(--t1)',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontFamily: "'Courier New', monospace",
                  transition: 'all 200ms ease',
                  opacity: isHidden ? 0.5 : 1,
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: isHidden ? '#2a2a3a' : color,
                  flexShrink: 0,
                  transition: 'background 200ms ease',
                }} />
                {k}
              </button>
            )
          })}

          {/* Collapse arrow */}
          <span style={{
            fontSize: 10, color: 'var(--muted)', marginLeft: 4,
            transform: collapsed ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms ease',
            display: 'inline-block',
          }}>▼</span>
        </div>
      </div>

      {/* ── Chart ── */}
      {!collapsed && (
        <div style={{ height: 210, padding: '10px 8px 10px 0', background: 'var(--bg)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 20, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={ct.grid} />
              <XAxis
                dataKey="t"
                tick={{ fill: ct.tick, fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: ct.axis }}
                tickFormatter={(v) => `${v} ${unit}`}
              />
              <YAxis
                tick={{ fill: ct.tick, fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: ct.axis }}
                width={46}
                tickFormatter={(v) => `${v}V`}
              />
              <Tooltip content={<CustomTooltip unit={unit} ct={ct} />} />
              {netKeys.map((k, i) =>
                hidden.has(k) ? null : (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    name={k}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={1.8}
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
