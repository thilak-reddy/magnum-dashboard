import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'

const ANNUAL_MODULES = ['A24', 'A25', 'A26', 'A27']
const MODULE_META = {
  A24: { name: 'Labour Welfare Fund',      sub: 'December only · Employee ₹20 · Employer ₹60' },
  A25: { name: 'Performance Bonus Audit',  sub: 'Oct – Sep cycle · Dual rate (Oct–Mar / Apr–Sep)' },
  A26: { name: 'Earned Leave Encashment',  sub: 'Staff only · 1 EL day per 20 working days · Encashment in January' },
  A27: { name: 'EPF / ESI Reconciliation', sub: 'Cross-verify against EPFO ECR, ESIC Challan, and bank statement' },
}

const statusColor   = { PASS: 'pass', FAIL: 'fail', WARN: 'warn', SKIP: 'skip' }
const severityBadge = { CRITICAL: 'crit', HIGH: 'high', MEDIUM: 'med', LOW: 'low' }
const rowClass      = { CRITICAL: 'row-crit', HIGH: 'row-high', MEDIUM: 'row-warn', LOW: 'row-pass' }

function SectionHeader({ code, name, sub, results }) {
  const fail = results.filter(r => r.status === 'FAIL').length
  const warn = results.filter(r => r.status === 'WARN').length
  const overall = fail > 0 ? 'FAIL' : warn > 0 ? 'WARN' : results.length === 0 ? 'SKIP' : 'PASS'
  return (
    <div className="annual-section-header">
      <div className="annual-code">{code}</div>
      <div>
        <div className="annual-name">{name}</div>
        {sub && <div className="annual-sub">{sub}</div>}
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <span className={`badge badge-${statusColor[overall]}`}>{overall}</span>
      </div>
    </div>
  )
}

export default function AnnualChecks() {
  const { data } = useData()
  const annualCheckResults = data?.annualCheckResults || []
  const employees = data?.employees || []
  const factories = data?.factories || []

  const [selectedFactory, setSelectedFactory] = useState('')
  const [selectedResult, setSelectedResult] = useState(null)

  useEffect(() => {
    if (factories.length > 0 && !selectedFactory) {
      setSelectedFactory(factories[0].id)
    }
  }, [factories])

  const filtered = annualCheckResults.filter(r => r.factoryId === selectedFactory)

  const byModule = module => filtered.filter(r => r.moduleCode === module)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Annual Checks</div>
          <div className="page-subtitle">A24 – A27 · Yearly Compliance Audit</div>
        </div>
        <div className="header-spacer" />
        <div className="filter-row">
          <select className="filter-select" value={selectedFactory} onChange={e => setSelectedFactory(e.target.value)}>
            {factories.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      </div>

      <div className="page-content">
        {ANNUAL_MODULES.map(code => {
          const results = byModule(code)
          return (
            <div key={code} className="annual-section">
              <SectionHeader
                code={code}
                name={MODULE_META[code].name}
                sub={MODULE_META[code].sub}
                results={results}
              />
              <div className="card">
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Check</th>
                        <th>Expected</th>
                        <th>Actual</th>
                        <th>Variance</th>
                        <th>Severity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                            No results for this factory
                          </td>
                        </tr>
                      ) : results.map(r => {
                        const emp = employees.find(e => e.id === r.employeeId)
                        return (
                          <tr
                            key={r.id}
                            className={r.status === 'FAIL' || r.status === 'WARN' ? (rowClass[r.severity] || 'row-warn') : 'row-pass'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedResult(selectedResult?.id === r.id ? null : r)}
                          >
                            <td>
                              {emp ? (
                                <>
                                  <div className="td-primary">{emp.name}</div>
                                  <div className="td-sub">{emp.empNo} · {emp.category}</div>
                                </>
                              ) : <span className="td-sub">Factory-level check</span>}
                            </td>
                            <td style={{ maxWidth: 200 }}>
                              <div className="td-primary" style={{ fontSize: 12.5 }}>{r.checkName}</div>
                            </td>
                            <td className="td-expected">{r.expected}</td>
                            <td className={r.status === 'FAIL' ? 'td-actual-fail' : r.status === 'WARN' ? 'td-actual-warn' : 'td-actual-pass'}>
                              {r.actual}
                            </td>
                            <td className="td-mono">
                              {r.variance != null ? (r.variance > 0 ? `+${r.variance}` : r.variance) : '—'}
                            </td>
                            <td><span className={`badge badge-${severityBadge[r.severity]}`}>{r.severity}</span></td>
                            <td><span className={`badge badge-${statusColor[r.status]}`}>{r.status}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {selectedResult?.moduleCode === code && (
                  <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-light)', background: '#FAFAF8', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Message:</strong> {selectedResult.message}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
