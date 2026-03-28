import { useState } from 'react'
import { annualChecks, formatINR } from '../data/mock'

const statusColor = { PASS:'pass', FAIL:'fail', WARN:'warn' }

function SectionHeader({ code, name, sub, status }) {
  return (
    <div className="annual-section-header">
      <div className="annual-code">{code}</div>
      <div>
        <div className="annual-name">{name}</div>
        {sub && <div className="annual-sub">{sub}</div>}
      </div>
      <div style={{ marginLeft:'auto' }}>
        <span className={`badge badge-${statusColor[status]}`}>{status}</span>
      </div>
    </div>
  )
}

export default function AnnualChecks() {
  const [uploadedECR, setUploadedECR] = useState(false)
  const [uploadedESIC, setUploadedESIC] = useState(false)
  const [uploadedBank, setUploadedBank] = useState(false)
  const [selectedFactory, setSelectedFactory] = useState('f1')

  const a27 = annualChecks.a27
  const a27Status = a27.esiVariance !== 0 || a27.bankVariance !== 0 ? 'FAIL' : 'PASS'

  const a24Status = annualChecks.a24.some(r => r.status === 'FAIL') ? 'FAIL' : 'PASS'
  const a25Status = annualChecks.a25.some(r => r.status === 'FAIL') ? 'FAIL' : 'PASS'
  const a26Status = annualChecks.a26.some(r => r.status === 'FAIL') ? 'FAIL' : 'PASS'

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
            <option value="f1">TKM V</option>
            <option value="f2">TKM II</option>
            <option value="f3">Kandigai</option>
            <option value="f4">Cheyyar</option>
          </select>
          <span className="filter-label">FY 2025–26</span>
        </div>
      </div>

      <div className="page-content">

        {/* A24 — Labour Welfare Fund */}
        <div className="annual-section">
          <SectionHeader code="A24" name="Labour Welfare Fund" sub="December only · Employee ₹20 · Employer ₹60" status={a24Status} />
          <div className="card">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Category</th>
                    <th>LWF Expected</th>
                    <th>LWF Deducted</th>
                    <th>Employer Contribution</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {annualChecks.a24.map(r => (
                    <tr key={r.employeeId} className={r.status === 'FAIL' ? 'row-high' : 'row-pass'}>
                      <td><div className="td-primary">{r.name}</div></td>
                      <td className="td-sub" style={{ textTransform:'capitalize' }}>Worker</td>
                      <td className="td-mono td-expected">₹20</td>
                      <td className={`td-mono ${r.lwfDeducted !== r.expected ? 'td-actual-fail' : 'td-actual-pass'}`}>₹{r.lwfDeducted}</td>
                      <td className="td-mono">₹60</td>
                      <td><span className={`badge badge-${statusColor[r.status]}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ fontSize:12, color:'var(--text-tertiary)', marginTop:8 }}>
            ⚠ LWF is deducted in December payroll only. Employer contributes ₹60 per employee — verify in payroll ledger.
          </div>
        </div>

        {/* A25 — Performance Bonus */}
        <div className="annual-section">
          <SectionHeader code="A25" name="Performance Bonus Audit" sub="Oct – Sep cycle · Dual rate (Oct–Mar / Apr–Sep)" status={a25Status} />
          <div className="card">
            <div className="card-header" style={{ background:'#FAFAF8' }}>
              <div style={{ fontSize:12.5, color:'var(--text-secondary)' }}>
                Formula: <code style={{ fontFamily:'var(--font-mono)', fontSize:12, background:'#F0EDE7', padding:'1px 6px', borderRadius:4 }}>Employee Wage ÷ Working Days × Days Present × 8.33%</code>
              </div>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Oct monthly accruals →</th>
                    <th>Total Accrued</th>
                    <th>Paid Bonus</th>
                    <th>Variance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {annualChecks.a25.map(r => {
                    const variance = r.totalAccrued - r.paidBonus
                    return (
                      <tr key={r.employeeId} className={r.status === 'FAIL' ? 'row-high' : 'row-pass'}>
                        <td><div className="td-primary">{r.name}</div></td>
                        <td>
                          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                            {r.monthlyAccruals.map((a, i) => (
                              <span key={i} style={{ fontSize:11, fontFamily:'var(--font-mono)', background:'#F3F2EE', border:'1px solid var(--border)', borderRadius:3, padding:'1px 5px', color:'var(--text-secondary)' }}>
                                {formatINR(a)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="td-mono">{formatINR(r.totalAccrued)}</td>
                        <td className={`td-mono ${variance !== 0 ? 'td-actual-fail' : 'td-actual-pass'}`}>{formatINR(r.paidBonus)}</td>
                        <td className={variance !== 0 ? 'td-variance-neg' : 'td-variance-pos'}>{variance !== 0 ? `−${formatINR(Math.abs(variance))}` : '—'}</td>
                        <td><span className={`badge badge-${statusColor[r.status]}`}>{r.status}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* A26 — Earned Leave */}
        <div className="annual-section">
          <SectionHeader code="A26" name="Earned Leave Encashment" sub="Staff only · 1 EL day per 20 working days · Encashment in January" status={a26Status} />
          <div className="card">
            <div className="card-header" style={{ background:'#FAFAF8' }}>
              <div style={{ fontSize:12.5, color:'var(--text-secondary)' }}>
                Formula: <code style={{ fontFamily:'var(--font-mono)', fontSize:12, background:'#F0EDE7', padding:'1px 6px', borderRadius:4 }}>50% of Gross ÷ Working Days × EL Balance Days</code>
              </div>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Category</th>
                    <th>EL Balance</th>
                    <th>Encashment (Calc)</th>
                    <th>Encashment (Paid)</th>
                    <th>Variance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {annualChecks.a26.map(r => {
                    const variance = r.encashmentCalc - r.encashmentPaid
                    return (
                      <tr key={r.employeeId} className={r.status === 'FAIL' ? 'row-high' : r.status === 'WARN' ? 'row-warn' : 'row-pass'}>
                        <td><div className="td-primary">{r.name}</div></td>
                        <td>
                          <span className={`badge ${r.category === 'worker' ? 'badge-warn' : 'badge-skip'}`} style={{ textTransform:'capitalize' }}>
                            {r.category}
                          </span>
                        </td>
                        <td className="td-mono">{r.elBalance} days</td>
                        <td className="td-mono td-expected">{r.encashmentCalc > 0 ? formatINR(r.encashmentCalc) : '—'}</td>
                        <td className={`td-mono ${variance !== 0 ? 'td-actual-fail' : 'td-actual-pass'}`}>{r.encashmentPaid > 0 ? formatINR(r.encashmentPaid) : '—'}</td>
                        <td className={variance !== 0 ? 'td-variance-neg' : 'td-variance-pos'}>{variance !== 0 ? `−${formatINR(Math.abs(variance))}` : '—'}</td>
                        <td>
                          <span className={`badge badge-${statusColor[r.status]}`}>{r.status}</span>
                          {r.message && <div style={{ fontSize:11, color:'var(--warn-text)', marginTop:3 }}>{r.message}</div>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ fontSize:12, color:'var(--text-tertiary)', marginTop:8 }}>
            ⚠ Workers are not eligible for EL. Any worker EL records are flagged as WARN for HR to review and correct.
          </div>
        </div>

        {/* A27 — EPF/ESI Reconciliation */}
        <div className="annual-section">
          <SectionHeader code="A27" name="EPF / ESI Reconciliation" sub="Cross-verify against EPFO ECR, ESIC Challan, and bank statement" status={a27Status} />

          {/* Upload zones */}
          <div className="grid-3" style={{ marginBottom: 20 }}>
            {[
              { key: 'ecr', label: 'EPFO ECR File', format: '.xlsx / .csv', uploaded: uploadedECR, onUpload: () => setUploadedECR(true) },
              { key: 'esic', label: 'ESIC Challan', format: '.pdf / .xlsx', uploaded: uploadedESIC, onUpload: () => setUploadedESIC(true) },
              { key: 'bank', label: 'Bank Statement', format: '.pdf / .xlsx', uploaded: uploadedBank, onUpload: () => setUploadedBank(true) },
            ].map(item => (
              <div
                key={item.key}
                className={`upload-zone${item.uploaded ? '' : ''}`}
                style={item.uploaded ? { borderColor:'var(--pass)', background:'var(--pass-bg)' } : {}}
                onClick={item.onUpload}
              >
                <div style={{ fontSize: 24 }}>{item.uploaded ? '✓' : '📁'}</div>
                <div className="upload-title" style={item.uploaded ? { color:'var(--pass)' } : {}}>{item.uploaded ? 'Uploaded' : item.label}</div>
                <div className="upload-sub">{item.uploaded ? 'Click to replace' : item.format + ' · Click or drag to upload'}</div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Reconciliation Summary — February 2026</span>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>System Calculated</th>
                    <th>Document Total</th>
                    <th>Variance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="row-pass">
                    <td><div className="td-primary">EPF (EPFO ECR)</div><div className="td-sub">12% of Basic+DA+OA for all employees</div></td>
                    <td className="td-mono">{formatINR(a27.epfSystemTotal)}</td>
                    <td className="td-mono td-expected">{formatINR(a27.epfEcrTotal)}</td>
                    <td className="td-variance-pos">₹0</td>
                    <td><span className="badge badge-pass">PASS</span></td>
                  </tr>
                  <tr className="row-crit">
                    <td><div className="td-primary">ESI (ESIC Challan)</div><div className="td-sub">0.75% employee + 3.25% employer</div></td>
                    <td className="td-mono">{formatINR(a27.esiSystemTotal)}</td>
                    <td className="td-mono td-expected">{formatINR(a27.esiChallanTotal)}</td>
                    <td className="td-variance-neg">−{formatINR(a27.esiVariance)}</td>
                    <td><span className="badge badge-crit">FAIL</span></td>
                  </tr>
                  <tr className="row-high">
                    <td><div className="td-primary">Bank Bulk Payment</div><div className="td-sub">Consolidated factory salary disbursement</div></td>
                    <td className="td-mono">{formatINR(a27.netPaySum)}</td>
                    <td className="td-mono td-expected">{formatINR(a27.bankBulkPayment)}</td>
                    <td className="td-variance-neg">−{formatINR(a27.bankVariance)}</td>
                    <td><span className="badge badge-high">FAIL</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {a27Status === 'FAIL' && (
            <div className="banner banner-fail" style={{ marginTop:14 }}>
              <div className="banner-dot banner-dot-fail" />
              <div>
                <div className="banner-title">CRITICAL: ESI challan variance of ₹360 detected</div>
                <div className="banner-body">
                  System total (₹21,840) exceeds ESIC Challan (₹21,480) by ₹360. This may indicate an ESI deduction that was not remitted, or an ESI eligible employee incorrectly enrolled. Cross-check with payroll register and ESI ECR before next remittance.
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  )
}
