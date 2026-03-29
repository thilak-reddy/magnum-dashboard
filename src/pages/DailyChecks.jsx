import { useState, useMemo } from 'react'
import { dailyCheckResults, mispunches, longAbsentees, employees, factories, moduleNames } from '../data/mock'

const modules = ['All', 'D01', 'D02', 'D03', 'D04']

const statusColor = { PASS: 'pass', FAIL: 'fail', WARN: 'warn', SKIP: 'skip' }
const severityBadge = { CRITICAL: 'crit', HIGH: 'high', MEDIUM: 'med', LOW: 'low' }
const rowClass = { CRITICAL: 'row-crit', HIGH: 'row-high', MEDIUM: 'row-warn', LOW: 'row-pass', PASS: 'row-pass' }

function ModuleCard({ code, results, active, onClick }) {
  const pass = results.filter(r => r.status === 'PASS').length
  const fail = results.filter(r => r.status === 'FAIL').length
  const warn = results.filter(r => r.status === 'WARN').length
  const overall = fail > 0 ? 'FAIL' : warn > 0 ? 'WARN' : 'PASS'
  return (
    <div className={`module-tile${active ? ' active' : ''}`} onClick={onClick}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div className="module-tile-code">{code}</div>
          <div className="module-tile-name">{moduleNames[code]}</div>
        </div>
        <span className={`badge badge-${statusColor[overall]}`}>{overall}</span>
      </div>
      <div className="module-tile-stats">
        {pass > 0 && <span className="stat-pill stat-pass">✓ {pass}</span>}
        {fail > 0 && <span className="stat-pill stat-fail">✗ {fail}</span>}
        {warn > 0 && <span className="stat-pill stat-warn">⚠ {warn}</span>}
      </div>
    </div>
  )
}

function DetailDrawer({ result, onClose }) {
  if (!result) return null
  const emp = employees.find(e => e.id === result.employeeId)
  const factory = factories.find(f => f.id === result.factoryId)
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <div>
            <div className="drawer-title">{result.checkName}</div>
            <div className="drawer-subtitle">{result.moduleCode} · {factory?.name} · {result.period}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          <div className="drawer-section">
            <div className="drawer-section-title">Employee</div>
            {emp ? (
              <>
                <div className="drawer-row"><span className="drawer-key">Name</span><span className="drawer-val" style={{ fontFamily:'var(--font-sans)', fontWeight:500 }}>{emp.name}</span></div>
                <div className="drawer-row"><span className="drawer-key">Emp No</span><span className="drawer-val">{emp.empNo}</span></div>
                <div className="drawer-row"><span className="drawer-key">Designation</span><span className="drawer-val" style={{ fontFamily:'var(--font-sans)' }}>{emp.designation}</span></div>
                <div className="drawer-row"><span className="drawer-key">Category</span><span className="drawer-val" style={{ fontFamily:'var(--font-sans)', textTransform:'capitalize' }}>{emp.category}</span></div>
              </>
            ) : <div style={{ fontSize:13, color:'var(--text-tertiary)' }}>Pipeline-level check (no specific employee)</div>}
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">Check Result</div>
            <div className="drawer-row"><span className="drawer-key">Status</span><span className={`badge badge-${statusColor[result.status]}`}>{result.status}</span></div>
            <div className="drawer-row"><span className="drawer-key">Severity</span><span className={`badge badge-${severityBadge[result.severity]}`}>{result.severity}</span></div>
            <div className="drawer-row"><span className="drawer-key">Expected</span><span className="drawer-val">{result.expected}</span></div>
            <div className="drawer-row"><span className="drawer-key">Actual</span><span className="drawer-val" style={{ color: result.status === 'FAIL' ? 'var(--fail)' : result.status === 'WARN' ? 'var(--warn)' : 'var(--pass)' }}>{result.actual}</span></div>
            {result.variance != null && (
              <div className="drawer-row"><span className="drawer-key">Variance</span><span className="drawer-val">{result.variance}</span></div>
            )}
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">Explanation</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, background:'#FAFAF8', borderRadius:'var(--radius)', padding:'12px 14px', border:'1px solid var(--border-light)' }}>
              {result.message}
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">Rule Reference</div>
            <div style={{ fontSize:12.5, color:'var(--text-tertiary)', lineHeight:1.6 }}>
              {result.moduleCode === 'D01' && 'D01 checks that Savior attendance data arrives before 11 AM, record counts match, employee IDs are in the master, and sync timestamps are valid.'}
              {result.moduleCode === 'D02' && 'D02 validates punch sequences: first punch = IN, last = OUT. Missing IN or OUT is flagged as mispunch. Early punch detection if time_in is >2hrs before shift start.'}
              {result.moduleCode === 'D03' && 'D03 applies attendance rules: holiday = Present, staff EL balance checked before LOP, worker absent without leave = LOP, layoff flag = half-day.'}
              {result.moduleCode === 'D04' && 'D04 detects late/early for staff: 9:00–9:10 is grace, 9:11–9:30 = half-day, >9:30 = full-day. Workers have no grace — late hours reduce paid hours.'}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function DailyChecks() {
  const [selectedDate, setSelectedDate] = useState('2026-03-26')
  const [selectedFactory, setSelectedFactory] = useState('f1')
  const [activeModule, setActiveModule] = useState('All')
  const [selectedResult, setSelectedResult] = useState(null)

  const allResults = dailyCheckResults.filter(r => r.factoryId === selectedFactory)

  const byModule = useMemo(() => {
    const m = {}
    modules.slice(1).forEach(code => {
      m[code] = allResults.filter(r => r.moduleCode === code)
    })
    return m
  }, [allResults])

  const filtered = activeModule === 'All'
    ? allResults
    : allResults.filter(r => r.moduleCode === activeModule)

  const thisMispunches = mispunches.filter(m => m.factoryId === selectedFactory)
  const thisAbsentees = longAbsentees.filter(a => a.factoryId === selectedFactory)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Daily Checks</div>
          <div className="page-subtitle">D01 – D04 · Attendance &amp; Punch Validation</div>
        </div>
        <div className="header-spacer" />
        <div className="filter-row">
          <input type="date" className="filter-select" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          <select className="filter-select" value={selectedFactory} onChange={e => setSelectedFactory(e.target.value)}>
            <option value="f1">TKM V</option>
            <option value="f2">TKM II</option>
            <option value="f3">Kandigai</option>
            <option value="f4">Cheyyar</option>
            <option value="f5">Kancheepuram</option>
          </select>
        </div>
      </div>

      <div className="page-content">

        {/* Module cards */}
        <div className="section-label">Module Results</div>
        <div className="grid-4" style={{ marginBottom: 20 }}>
          {modules.slice(1).map(code => (
            <ModuleCard
              key={code}
              code={code}
              results={byModule[code] || []}
              active={activeModule === code}
              onClick={() => setActiveModule(activeModule === code ? 'All' : code)}
            />
          ))}
        </div>

        {/* Mispunch banner */}
        {thisMispunches.length > 0 && (
          <div className="banner banner-warn">
            <div className="banner-dot banner-dot-warn" />
            <div>
              <div className="banner-title">{thisMispunches.length} mispunch{thisMispunches.length > 1 ? 'es' : ''} require HR action</div>
              {thisMispunches.map(m => (
                <div key={m.employeeId} className="banner-body">
                  {m.employeeName} ({m.empNo}) — {m.type === 'MISSING_OUT' ? 'Missing OUT punch' : 'Missing IN punch'} on {m.date}. {m.note}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Long absenteeism */}
        {thisAbsentees.length > 0 && (
          <div className="banner banner-fail">
            <div className="banner-dot banner-dot-fail" />
            <div>
              <div className="banner-title">Long Absenteeism Alert — {thisAbsentees.length} employee{thisAbsentees.length > 1 ? 's' : ''}</div>
              {thisAbsentees.map(a => (
                <div key={a.employeeId} className="banner-body">
                  {a.employeeName} · {a.factoryName} · Absent since {a.absentSince} · <strong>{a.consecutiveDays} consecutive days</strong> · {a.lastReasonRecorded ? a.lastReasonRecorded : 'No reason recorded'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter strip */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <div className="section-label" style={{ margin:0 }}>
            Employee Results
            {activeModule !== 'All' && <span style={{ marginLeft:8, color:'var(--accent)', fontWeight:600 }}> — {activeModule}</span>}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
            {modules.map(m => (
              <button
                key={m}
                className={`btn btn-sm btn-ghost${activeModule === m ? ' btn-accent' : ''}`}
                onClick={() => setActiveModule(m)}
              >{m}</button>
            ))}
          </div>
        </div>

        {/* Results table */}
        <div className="card">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Employee</th>
                  <th>Check</th>
                  <th>Expected</th>
                  <th>Actual</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--text-tertiary)' }}>No results for this filter</td></tr>
                ) : filtered.map(r => {
                  const emp = employees.find(e => e.id === r.employeeId)
                  return (
                    <tr
                      key={r.id}
                      className={rowClass[r.severity] || (r.status === 'PASS' ? 'row-pass' : '')}
                      onClick={() => setSelectedResult(r)}
                    >
                      <td><span className="td-code">{r.moduleCode}</span></td>
                      <td>
                        {emp ? (
                          <>
                            <div className="td-primary">{emp.name}</div>
                            <div className="td-sub">{emp.empNo} · {emp.category}</div>
                          </>
                        ) : <span className="td-sub">Pipeline check</span>}
                      </td>
                      <td style={{ maxWidth:200 }}>
                        <div className="td-primary" style={{ fontSize:12.5 }}>{r.checkName}</div>
                      </td>
                      <td className="td-expected">{r.expected}</td>
                      <td className={r.status === 'FAIL' ? 'td-actual-fail' : r.status === 'WARN' ? 'td-actual-warn' : 'td-actual-pass'}>
                        {r.actual}
                      </td>
                      <td><span className={`badge badge-${severityBadge[r.severity]}`}>{r.severity}</span></td>
                      <td><span className={`badge badge-${statusColor[r.status]}`}>{r.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary row */}
        <div className="metric-row" style={{ marginTop: 20 }}>
          <div className="metric-card metric-pass">
            <div className="metric-label">Passed</div>
            <div className="metric-value">{allResults.filter(r => r.status === 'PASS').length}</div>
          </div>
          <div className="metric-card metric-fail">
            <div className="metric-label">Failed</div>
            <div className="metric-value">{allResults.filter(r => r.status === 'FAIL').length}</div>
          </div>
          <div className="metric-card metric-warn">
            <div className="metric-label">Warnings</div>
            <div className="metric-value">{allResults.filter(r => r.status === 'WARN').length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Mispunches</div>
            <div className="metric-value">{thisMispunches.length}</div>
            <div className="metric-sub">Needs override</div>
          </div>
          <div className="metric-card metric-fail">
            <div className="metric-label">Long Absent</div>
            <div className="metric-value">{thisAbsentees.length}</div>
            <div className="metric-sub">&gt;10 consecutive days</div>
          </div>
        </div>

      </div>

      <DetailDrawer result={selectedResult} onClose={() => setSelectedResult(null)} />
    </>
  )
}
