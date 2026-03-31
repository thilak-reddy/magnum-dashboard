import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fmtDateTime, moduleNames, formatINR } from '../data/mock'
import { useData } from '../context/DataContext'

function ScoreRing({ score }) {
  const r = 17
  const circ = 2 * Math.PI * r
  const color = score >= 85 ? '#16A34A' : score >= 70 ? '#D97706' : '#DC2626'
  const dash = (score / 100) * circ
  return (
    <div className="score-ring-wrap">
      <svg viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="21" cy="21" r={r} fill="none" stroke="#F0EDE7" strokeWidth="3.5" />
        <circle
          cx="21" cy="21" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="score-ring-num" style={{ color }}>{score}%</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card" style={{ padding: '10px 14px', minWidth: 120, fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span style={{ fontWeight: 500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Overview() {
  const navigate = useNavigate()
  const { data } = useData()

  const factories = data?.factories || []
  const alerts = data?.alerts || []
  const checkRuns = data?.checkRuns || []
  const trendData = data?.trendData || []
  const payrollRecords = data?.payrollRecords || []
  const monthlyCheckResults = data?.monthlyCheckResults || []
  const dailyCheckResults = data?.dailyCheckResults || []
  const annualCheckResults = data?.annualCheckResults || []

  // Derive current month from most recent payroll record
  const currentMonth = payrollRecords.reduce((latest, p) => p.monthYear > latest ? p.monthYear : latest, '')

  const allResults = [...dailyCheckResults, ...monthlyCheckResults, ...annualCheckResults]
  const thisMonthResults = allResults.filter(c => c.monthYear === currentMonth)
  const totalChecks = thisMonthResults.length
  const totalPassed = thisMonthResults.filter(c => c.status === 'PASS').length
  const totalFailed = thisMonthResults.filter(c => c.status === 'FAIL').length
  const totalWarns = thisMonthResults.filter(c => c.status === 'WARN').length
  const passRate = totalChecks > 0 ? (totalPassed / totalChecks * 100).toFixed(1) : '0.0'
  const failRate = totalChecks > 0 ? (totalFailed / totalChecks * 100).toFixed(1) : '0.0'
  const employeesAudited = new Set(payrollRecords.filter(p => p.monthYear === currentMonth).map(p => p.employeeId)).size

  const [ackd, setAckd] = useState(new Set())
  const newAlerts = alerts.filter(a => a.status === 'NEW' && !ackd.has(a.id)).slice(0, 6)
  const totalIssues = alerts.filter(a => a.status === 'NEW').length

  const lastRuns = checkRuns.filter(r => r.runType === 'DAILY').slice(0, 5)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-subtitle">March 2026 · All Factories</div>
        </div>
        <div className="header-spacer" />
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, color:'var(--text-tertiary)' }}>Last daily run:</span>
          <span style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'var(--font-mono)' }}>Today 06:03 AM</span>
        </div>
      </div>

      <div className="page-content">

        {/* Factory health */}
        <div className="section-label">Factory Health — Monthly Check Score</div>
        <div className="grid-7" style={{ marginBottom: 28 }}>
          {factories.map(f => (
            <div key={f.id} className="factory-card" onClick={() => navigate('/monthly')}>
              <div className="factory-card-top">
                <div>
                  <div className="factory-name">{f.name}</div>
                  <div className="factory-zone">{f.zone} Zone</div>
                </div>
                <ScoreRing score={f.score} />
              </div>
              <div className="factory-meta" style={{ marginTop: 8 }}>{f.location}</div>
              {f.alertCount > 0 && (
                <div className="factory-alert-tag">
                  ● {f.alertCount} alert{f.alertCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Two-col: Alerts + Chart + Run log */}
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 340px', gap:18 }}>

          {/* Alert inbox */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Alert Inbox — {totalIssues} unacknowledged</span>
              <span className="card-action" onClick={() => navigate('/alerts')}>View all →</span>
            </div>
            {newAlerts.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 28 }}>✓</div>
                <div className="empty-title">No open alerts</div>
                <div className="empty-sub">All alerts have been acknowledged</div>
              </div>
            ) : newAlerts.map(a => (
              <div key={a.id} className="alert-row-detail" onClick={() => navigate('/alerts')}>
                <div className="alert-top">
                  <div style={{ flex: 1 }}>
                    <div className="alert-msg">{a.title}</div>
                    <div className="alert-meta">{a.module} · {a.factory} · {fmtDateTime(a.createdAt)}</div>
                  </div>
                  <button
                    className="btn btn-sm"
                    onClick={e => { e.stopPropagation(); setAckd(s => new Set([...s, a.id])) }}
                    style={{ flexShrink: 0 }}
                  >
                    Ack
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {/* Pass/fail trend */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Pass / Fail Trend — 6 Months</span>
              </div>
              <div style={{ padding: '12px 12px 8px' }}>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={trendData} barSize={12} barGap={2} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE7" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9B9588', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9B9588', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="pass" name="Pass" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="warn" name="Warn" stackId="a" fill="#D97706" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="fail" name="Fail" stackId="a" fill="#DC2626" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="trend-legend">
                {[['#16A34A','Pass'],['#D97706','Warn'],['#DC2626','Fail']].map(([c,l]) => (
                  <div key={l} className="legend-item">
                    <div className="legend-dot" style={{ background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Last run status */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Last Run Status</span>
              </div>
              {lastRuns.map(run => {
                const factory = factories.find(f => f.id === run.factoryId)
                const pct = run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0
                const color = pct >= 85 ? 'var(--pass)' : pct >= 70 ? 'var(--warn)' : 'var(--fail)'
                return (
                  <div key={run.id} style={{ display:'flex', alignItems:'center', padding:'9px 18px', borderBottom:'1px solid var(--border-light)', gap:10 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0 }} />
                    <div style={{ flex:1, fontSize:13, fontWeight:500, color:'var(--text-primary)' }}>{factory?.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-tertiary)' }}>
                      {run.runType} · {run.failed > 0 ? <span style={{ color:'var(--fail)' }}>{run.failed} failed</span> : <span style={{ color:'var(--pass)' }}>All passed</span>}
                    </div>
                    <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-tertiary)' }}>
                      {fmtDateTime(run.completedAt)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Summary metric row */}
        <div className="section-spacer" />
        <div className="section-label">This Month — All Factories</div>
        <div className="metric-row">
          <div className="metric-card">
            <div className="metric-label">Total Checks Run</div>
            <div className="metric-value">{totalChecks.toLocaleString()}</div>
            <div className="metric-sub">{factories.length} factories · {currentMonth}</div>
          </div>
          <div className="metric-card metric-pass">
            <div className="metric-label">Passed</div>
            <div className="metric-value">{totalPassed.toLocaleString()}</div>
            <div className="metric-sub">{passRate}% pass rate</div>
          </div>
          <div className="metric-card metric-fail">
            <div className="metric-label">Failed</div>
            <div className="metric-value">{totalFailed.toLocaleString()}</div>
            <div className="metric-sub">{failRate}% of all checks</div>
          </div>
          <div className="metric-card metric-warn">
            <div className="metric-label">Warnings</div>
            <div className="metric-value">{totalWarns.toLocaleString()}</div>
            <div className="metric-sub">Needs HR review</div>
          </div>
          <div className="metric-card metric-fail">
            <div className="metric-label">Open Alerts</div>
            <div className="metric-value">{totalIssues}</div>
            <div className="metric-sub">Unacknowledged</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Employees Audited</div>
            <div className="metric-value">{employeesAudited.toLocaleString()}</div>
            <div className="metric-sub">All active employees</div>
          </div>
        </div>

      </div>
    </>
  )
}
