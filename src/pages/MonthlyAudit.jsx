import { useState, useMemo } from 'react'
import { moduleNames, formatINR } from '../data/mock'
import { useData } from '../context/DataContext'
import { usePagination, Pagination } from '../components/Pagination'


const MONTHLY_MODULES = ['M05','M06','M07','M08','M09','M10','M11','M12','M13','M14','M15','M16','M17','M18','M19','M20','M21','M22','M23']
const statusColor = { PASS:'pass', FAIL:'fail', WARN:'warn', SKIP:'skip' }

function EmployeeDrawer({ employeeId, factoryId, monthYear, onClose }) {
  const { data } = useData()
  const employees = data?.employees || []
  const payrollRecords = data?.payrollRecords || []
  const monthlyCheckResults = data?.monthlyCheckResults || []

  const emp = employees.find(e => e.id === employeeId)
  const pr = payrollRecords.find(p => p.employeeId === employeeId && p.monthYear === monthYear)
  const checks = monthlyCheckResults.filter(c => c.employeeId === employeeId && c.monthYear === monthYear)
  if (!emp || !pr) return null

  const workingDays = 26 // Mar 2026 (31 - 5 Sundays)

  const rows = [
    { label: 'Fixed Basic', val: pr.fixedBasic },
    { label: 'Fixed HRA',   val: pr.fixedHra   },
    { label: 'Fixed DA',    val: pr.fixedDa    },
    { label: 'Fixed OA',    val: pr.fixedOa    },
    { label: 'Present Days',    val: pr.presentDays + ' days', mono: false },
    { label: 'LOP Days',    val: pr.lopDays + ' days', mono: false },
    { label: 'OT Hours',    val: pr.otHours + ' hrs', mono: false },
    { label: '— Earnings —', val: '', isHeader: true },
    { label: 'Earned Basic', val: pr.earnedBasic },
    { label: 'Earned HRA',   val: pr.earnedHra  },
    { label: 'Earned DA',    val: pr.earnedDa   },
    { label: 'Earned OA',    val: pr.earnedOa   },
    { label: 'Attendance Bonus', val: pr.attendanceBonus },
    { label: 'Incentive',   val: pr.incentiveAmount },
    { label: 'Worker OT',   val: pr.workerOtAmount },
    { label: 'Staff OT',    val: pr.staffOtAmount  },
    { label: 'Total Earnings', val: pr.totalEarnings, bold: true },
    { label: '— Deductions —', val: '', isHeader: true },
    { label: 'EPF',         val: pr.epfDeducted   },
    { label: 'ESI',         val: pr.esiDeducted   },
    { label: 'Prof. Tax',   val: pr.ptDeducted    },
    { label: 'TDS',         val: pr.tdsDeducted   },
    { label: 'Loan',        val: pr.loanDeducted  },
    { label: 'Advance',     val: pr.advanceDeducted },
    { label: 'LWF',         val: pr.lwfDeducted   },
    { label: 'Late Ded.',   val: pr.lateDeducted  },
    { label: 'Total Deductions', val: pr.totalDeductions, bold: true },
    { label: '— Net —', val: '', isHeader: true },
    { label: 'Net Pay',     val: pr.netPay, bold: true },
  ]

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" style={{ width: 540 }}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">{emp.name}</div>
            <div className="drawer-subtitle">{emp.empNo} · {emp.designation} · {monthYear}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">

          {/* Module check results */}
          <div className="drawer-section">
            <div className="drawer-section-title">Module Checks ({checks.length} checks run)</div>
            {MONTHLY_MODULES.map(code => {
              const c = checks.find(ch => ch.moduleCode === code)
              if (!c) return (
                <div key={code} className="drawer-module-result">
                  <span className="dmr-code">{code}</span>
                  <div style={{ flex:1 }}>
                    <div className="dmr-name">{moduleNames[code]}</div>
                    <div className="dmr-vals">No check run</div>
                  </div>
                  <span className="badge badge-skip dmr-badge">SKIP</span>
                </div>
              )
              return (
                <div key={code} className="drawer-module-result">
                  <span className="dmr-code">{code}</span>
                  <div style={{ flex:1 }}>
                    <div className="dmr-name">{moduleNames[code]}</div>
                    <div className="dmr-vals">
                      Expected: {c.expected} → Actual: {c.actual}
                      {c.variance ? ` · Δ${c.variance > 0 ? '+' : ''}${c.variance}` : ''}
                    </div>
                  </div>
                  <span className={`badge badge-${statusColor[c.status]} dmr-badge`}>{c.status}</span>
                </div>
              )
            })}
          </div>

          {/* Payroll breakdown */}
          <div className="drawer-section">
            <div className="drawer-section-title">Payroll Breakdown — Stage ERP</div>
            {rows.map((r, i) => r.isHeader ? (
              <div key={i} style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text-muted)', padding:'10px 0 4px', borderBottom:'1px solid var(--border)' }}>{r.label}</div>
            ) : (
              <div key={i} className="drawer-row">
                <span className="drawer-key">{r.label}</span>
                <span className="drawer-val" style={r.bold ? { fontWeight:600 } : {}}>
                  {r.mono === false ? r.val : typeof r.val === 'number' ? formatINR(r.val) : r.val}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}

export default function MonthlyAudit() {
  const { data } = useData()
  const employees = data?.employees || []
  const payrollRecords = data?.payrollRecords || []
  const monthlyCheckResults = data?.monthlyCheckResults || []
  const factories = data?.factories || []

  const [selectedFactory, setSelectedFactory] = useState('')
  const [activeModule, setActiveModule] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [sortBy, setSortBy] = useState('employee')

  const workingDays = 26

  const factoryRecords = useMemo(() =>
    payrollRecords
      .filter(p => p.monthYear === '2026-03')
      .filter(p => selectedFactory === '' || p.factoryId === selectedFactory)
  , [payrollRecords, selectedFactory])

  const enriched = useMemo(() => factoryRecords.map(pr => {
    const emp = employees.find(e => e.id === pr.employeeId)
    const empChecks = monthlyCheckResults.filter(c => c.employeeId === pr.employeeId && c.monthYear === pr.monthYear)
    const issues = empChecks.filter(c => c.status === 'FAIL')
    const warns  = empChecks.filter(c => c.status === 'WARN')
    const calcGross = ((pr.fixedBasic + pr.fixedHra + pr.fixedDa + pr.fixedOa) / workingDays) * pr.presentDays
    return { ...pr, emp, issues, warns, calcGross }
  }), [factoryRecords, employees, monthlyCheckResults])

  const sorted = useMemo(() => [...enriched].sort((a, b) => {
    if (sortBy === 'variance') return b.issues.length - a.issues.length
    if (sortBy === 'netpay') return b.netPay - a.netPay
    return (a.emp?.name || '').localeCompare(b.emp?.name || '')
  }), [enriched, sortBy])

  const filtered = useMemo(() => {
    if (!activeModule) return sorted
    const empIds = new Set(
      monthlyCheckResults.filter(c => c.moduleCode === activeModule).map(c => c.employeeId)
    )
    return sorted.filter(r => empIds.has(r.employeeId))
  }, [sorted, activeModule, monthlyCheckResults])

  // Module strip stats
  const moduleStats = useMemo(() => {
    const all = selectedFactory === '' ? monthlyCheckResults : monthlyCheckResults.filter(c => c.factoryId === selectedFactory)
    return MONTHLY_MODULES.map(code => {
      const m = all.filter(c => c.moduleCode === code)
      return { code, pass: m.filter(c => c.status === 'PASS').length, fail: m.filter(c => c.status === 'FAIL').length, warn: m.filter(c => c.status === 'WARN').length }
    })
  }, [selectedFactory, monthlyCheckResults])

  const relevantChecks = useMemo(() =>
    selectedFactory === '' ? monthlyCheckResults : monthlyCheckResults.filter(c => c.factoryId === selectedFactory)
  , [selectedFactory, monthlyCheckResults])
  const totalFails = relevantChecks.filter(c => c.status === 'FAIL').length
  const totalPasses = relevantChecks.filter(c => c.status === 'PASS').length

  const pagination = usePagination(filtered, [selectedFactory, sortBy, activeModule])

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Monthly Audit</div>
          <div className="page-subtitle">M05 – M23 · Full Payroll Verification</div>
        </div>
        <div className="header-spacer" />
        <div className="filter-row">
          <select className="filter-select" value={selectedFactory} onChange={e => setSelectedFactory(e.target.value)}>
            <option value="">All Factories</option>
            {factories.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button className="btn btn-sm">Export CSV</button>
        </div>
      </div>

      <div className="page-content">

        {/* Summary metrics */}
        <div className="metric-row" style={{ marginBottom: 24 }}>
          <div className="metric-card">
            <div className="metric-label">Employees</div>
            <div className="metric-value">{enriched.length}</div>
            <div className="metric-sub">In this factory</div>
          </div>
          <div className="metric-card metric-pass">
            <div className="metric-label">Passed</div>
            <div className="metric-value">{totalPasses}</div>
          </div>
          <div className="metric-card metric-fail">
            <div className="metric-label">Failed</div>
            <div className="metric-value">{totalFails}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Working Days</div>
            <div className="metric-value">{workingDays}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total Net Pay</div>
            <div className="metric-value" style={{ fontSize:17 }}>{formatINR(enriched.reduce((s, r) => s + r.netPay, 0))}</div>
          </div>
        </div>

        {/* Module strip */}
        <div className="section-label">Module Strip — Click to Filter</div>
        <div className="module-strip">
          {moduleStats.map(({ code, pass, fail, warn }) => {
            const status = fail > 0 ? 'fail' : warn > 0 ? 'warn' : 'pass'
            return (
              <div
                key={code}
                className={`module-strip-tile${activeModule === code ? ' active' : ''}`}
                onClick={() => setActiveModule(activeModule === code ? null : code)}
              >
                <div className="mst-code">{code}</div>
                <div className="mst-name">{moduleNames[code]}</div>
                <div className="mst-counts">
                  <span className={`stat-pill stat-${status}`}>
                    {fail > 0 ? `✗ ${fail}` : pass > 0 ? `✓ ${pass}` : '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Employee table */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div className="section-label" style={{ margin:0 }}>Employee Results</div>
          <div style={{ marginLeft:'auto', display:'flex', gap:6, alignItems:'center' }}>
            <span className="filter-label">Sort by:</span>
            <select className="filter-select" style={{ padding:'4px 8px', fontSize:12 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="employee">Name</option>
              <option value="variance">Issues first</option>
              <option value="netpay">Net pay ↓</option>
            </select>
          </div>
        </div>

        <div className="card">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Gross (Exp)</th>
                  <th>Gross (Actual)</th>
                  <th>EPF</th>
                  <th>ESI</th>
                  <th>Prof. Tax</th>
                  <th>Net Pay</th>
                  <th>Issues</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign:'center', padding:32, color:'var(--text-tertiary)' }}>No results for this factory</td></tr>
                ) : pagination.page.map(r => {
                  const expGross = ((r.fixedBasic + r.fixedHra + r.fixedDa + r.fixedOa) / workingDays) * r.presentDays
                  const grossDiff = r.totalEarnings - expGross
                  const hasIssue = r.issues.length > 0
                  return (
                    <tr
                      key={r.id}
                      className={hasIssue ? 'row-high' : 'row-pass'}
                      onClick={() => setSelectedEmployee({ id: r.employeeId, monthYear: r.monthYear })}
                    >
                      <td>
                        <div className="td-primary">{r.emp?.name}</div>
                        <div className="td-sub">{r.emp?.empNo} · {r.emp?.designation}</div>
                      </td>
                      <td className="td-sub">{r.monthYear}</td>
                      <td className="td-mono td-expected">{formatINR(Math.round(expGross))}</td>
                      <td className={`td-mono ${Math.abs(grossDiff) > 1 ? 'td-actual-fail' : 'td-actual-pass'}`}>
                        {formatINR(r.totalEarnings)}
                      </td>
                      <td className="td-mono">{formatINR(r.epfDeducted)}</td>
                      <td className="td-mono">{formatINR(r.esiDeducted)}</td>
                      <td className="td-mono">{formatINR(r.ptDeducted)}</td>
                      <td className="td-mono" style={{ fontWeight:600 }}>{formatINR(r.netPay)}</td>
                      <td>
                        {r.issues.length > 0
                          ? <span className="badge badge-fail">{r.issues.length} fail{r.issues.length > 1 ? 's' : ''}</span>
                          : r.warns.length > 0
                          ? <span className="badge badge-warn">{r.warns.length} warn{r.warns.length > 1 ? 's' : ''}</span>
                          : <span className="badge badge-pass">—</span>
                        }
                      </td>
                      <td>
                        <span className={`badge badge-${r.issues.length > 0 ? 'fail' : r.warns.length > 0 ? 'warn' : 'pass'}`}>
                          {r.issues.length > 0 ? 'FAIL' : r.warns.length > 0 ? 'WARN' : 'PASS'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} />
        </div>

      </div>

      {selectedEmployee && (
        <EmployeeDrawer
          employeeId={selectedEmployee.id}
          factoryId={selectedFactory}
          monthYear={selectedEmployee.monthYear}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </>
  )
}
