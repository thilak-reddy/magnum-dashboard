import { useState } from 'react'
import { useEffect } from 'react'
import { formatINR, fmtDate, fmtDateTime } from '../data/mock'
import { useData } from '../context/DataContext'

const TABS = ['Minimum Wages', 'Holiday Calendar', 'Attendance Bonus', 'Incentive Slabs', 'Audit Log']

function MinWageTab() {
  const { data } = useData()
  const minimumWages = data?.minimumWages || []
  const [editing, setEditing] = useState(null)
  const [rows, setRows] = useState(minimumWages)
  const [showAdd, setShowAdd] = useState(false)
  const [newRow, setNewRow] = useState({ zone:'C', category:'', grade:'I', basic:'', da:'', basicDa:'', effectiveFrom:'2026-04-01' })

  useEffect(() => { setRows(minimumWages) }, [minimumWages])

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600 }}>Minimum Wages Table</div>
          <div style={{ fontSize:12.5, color:'var(--text-tertiary)', marginTop:2 }}>Zone + Category + Grade → Basic+DA floor. M06 checks compliance against this table.</div>
        </div>
        <button className="btn btn-sm btn-accent" onClick={() => setShowAdd(v => !v)}>+ Add Entry</button>
      </div>

      {showAdd && (
        <div className="card" style={{ padding:'16px 18px', marginBottom:16, borderLeft:'2px solid var(--accent)' }}>
          <div className="drawer-section-title" style={{ marginBottom:12 }}>New Minimum Wage Entry</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
            {[
              { label:'Zone', key:'zone', type:'select', opts:['B','C'] },
              { label:'Category', key:'category', type:'text', placeholder:'e.g. Tailor' },
              { label:'Grade', key:'grade', type:'select', opts:['I','II'] },
              { label:'Basic', key:'basic', type:'number', placeholder:'e.g. 6200' },
              { label:'DA', key:'da', type:'number', placeholder:'e.g. 4300' },
              { label:'Basic+DA Total', key:'basicDa', type:'number', placeholder:'e.g. 10500' },
              { label:'Effective From', key:'effectiveFrom', type:'date' },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize:11, color:'var(--text-tertiary)', marginBottom:4, fontWeight:500 }}>{f.label}</div>
                {f.type === 'select' ? (
                  <select className="filter-select" style={{ width:'100%' }} value={newRow[f.key]} onChange={e => setNewRow(p => ({ ...p, [f.key]: e.target.value }))}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} className="filter-input" style={{ width:'100%' }} placeholder={f.placeholder} value={newRow[f.key]} onChange={e => setNewRow(p => ({ ...p, [f.key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button className="btn btn-sm btn-accent" onClick={() => { setRows(p => [...p, { id:`mw${Date.now()}`, ...newRow, basic:+newRow.basic, da:+newRow.da, basicDa:+newRow.basicDa }]); setShowAdd(false) }}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Category</th>
                <th>Grade</th>
                <th>Basic</th>
                <th>DA</th>
                <th>Basic + DA</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><span className="td-code">{r.zone} Zone</span></td>
                  <td className="td-primary">{r.category}</td>
                  <td><span className="badge badge-skip">Gr. {r.grade}</span></td>
                  <td className="td-mono">{r.basic ? formatINR(r.basic) : '—'}</td>
                  <td className="td-mono">{r.da ? formatINR(r.da) : '—'}</td>
                  <td className="td-mono" style={{ fontWeight:600 }}>{formatINR(r.basicDa)}</td>
                  <td style={{ fontSize:12.5 }}>{fmtDate(r.effectiveFrom)}</td>
                  <td style={{ fontSize:12.5, color:'var(--text-tertiary)' }}>{r.effectiveTo ? fmtDate(r.effectiveTo) : <span style={{ color:'var(--pass)', fontWeight:500 }}>Active</span>}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditing(r.id)}>Edit</button>
                      <button className="btn btn-sm btn-danger btn-ghost" style={{ fontSize:12 }}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function HolidayTab() {
  const { data } = useData()
  const holidayCalendar = data?.holidayCalendar || []
  const factories = data?.factories || []
  const [rows, setRows] = useState(holidayCalendar)
  const [showAdd, setShowAdd] = useState(false)
  const [newRow, setNewRow] = useState({ date:'', name:'', isNational: false, factoryId: null })

  useEffect(() => { setRows(holidayCalendar) }, [holidayCalendar])

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600 }}>Holiday Calendar 2026</div>
          <div style={{ fontSize:12.5, color:'var(--text-tertiary)', marginTop:2 }}>Factory-specific or all-factory. D03 marks employees Present on these dates.</div>
        </div>
        <button className="btn btn-sm btn-accent" onClick={() => setShowAdd(v => !v)}>+ Add Holiday</button>
      </div>

      {showAdd && (
        <div className="card" style={{ padding:'16px 18px', marginBottom:16, borderLeft:'2px solid var(--accent)' }}>
          <div className="drawer-section-title" style={{ marginBottom:12 }}>New Holiday</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            <div>
              <div style={{ fontSize:11, color:'var(--text-tertiary)', marginBottom:4 }}>Date</div>
              <input type="date" className="filter-input" style={{ width:'100%' }} value={newRow.date} onChange={e => setNewRow(p=>({...p,date:e.target.value}))} />
            </div>
            <div>
              <div style={{ fontSize:11, color:'var(--text-tertiary)', marginBottom:4 }}>Holiday Name</div>
              <input type="text" className="filter-input" style={{ width:'100%' }} placeholder="e.g. Pongal" value={newRow.name} onChange={e => setNewRow(p=>({...p,name:e.target.value}))} />
            </div>
            <div>
              <div style={{ fontSize:11, color:'var(--text-tertiary)', marginBottom:4 }}>Factory</div>
              <select className="filter-select" style={{ width:'100%' }} onChange={e => setNewRow(p=>({...p,factoryId:e.target.value||null}))}>
                <option value="">All Factories</option>
                {factories.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:12 }}>
            <label style={{ display:'flex', gap:6, alignItems:'center', fontSize:13, color:'var(--text-secondary)', cursor:'pointer' }}>
              <input type="checkbox" checked={newRow.isNational} onChange={e => setNewRow(p=>({...p,isNational:e.target.checked}))} />
              National Holiday
            </label>
            <button className="btn btn-sm btn-accent" style={{ marginLeft:12 }} onClick={() => { setRows(p=>[...p,{id:`h${Date.now()}`,factoryId:newRow.factoryId,date:newRow.date,holiday_name:newRow.name,isNational:newRow.isNational}]); setShowAdd(false) }}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Holiday</th><th>Type</th><th>Scope</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(h => (
                <tr key={h.id}>
                  <td className="td-mono" style={{ fontWeight:500 }}>{fmtDate(h.date)}</td>
                  <td className="td-primary">{h.holiday_name || h.name}</td>
                  <td>
                    <span className={`badge ${h.isNational ? 'badge-crit' : 'badge-skip'}`}>
                      {h.isNational ? 'National' : 'State/Factory'}
                    </span>
                  </td>
                  <td>
                    {h.factoryId
                      ? <span className="td-code">{factories.find(f=>f.id===h.factoryId)?.name || h.factoryId}</span>
                      : <span style={{ fontSize:12, color:'var(--pass)', fontWeight:500 }}>All Factories</span>
                    }
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm btn-ghost">Edit</button>
                      <button className="btn btn-sm btn-danger btn-ghost" style={{ fontSize:12 }}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AttendanceBonusTab() {
  const { data } = useData()
  const attendanceBonusConfig = data?.attendanceBonusConfig || []
  const [rows, setRows] = useState(attendanceBonusConfig)

  useEffect(() => { setRows(attendanceBonusConfig) }, [attendanceBonusConfig])

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:600 }}>Attendance Bonus Configuration</div>
        <div style={{ fontSize:12.5, color:'var(--text-tertiary)', marginTop:2 }}>Per designation per factory. M07 checks actual bonus matches this config. Workers only.</div>
      </div>
      <div className="banner banner-info" style={{ marginBottom:16 }}>
        <div className="banner-dot banner-dot-info" />
        <div>
          <div className="banner-title" style={{ color:'#1D4ED8' }}>Eligibility rule</div>
          <div className="banner-body" style={{ color:'#1E40AF' }}>Worker must have: absent days ≤ 1, late count ≤ 1, and max single late ≤ 2 hours. If eligible: expected bonus = amount from this table.</div>
        </div>
      </div>
      <div className="card">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Factory</th><th>Designation</th><th>Bonus Amount</th><th>Effective From</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><span className="td-code">{r.factory}</span></td>
                  <td className="td-primary">{r.designation}</td>
                  <td className="td-mono" style={{ fontWeight:600, color:'var(--pass)' }}>{formatINR(r.bonusAmount)}</td>
                  <td style={{ fontSize:12.5 }}>{fmtDate(r.effectiveFrom)}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm btn-ghost">Edit</button>
                      <button className="btn btn-sm btn-danger btn-ghost" style={{ fontSize:12 }}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function IncentiveSlabTab() {
  const { data } = useData()
  const incentiveSlabs = data?.incentiveSlabs || []
  const [rows, setRows] = useState(incentiveSlabs)

  useEffect(() => { setRows(incentiveSlabs) }, [incentiveSlabs])

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:600 }}>Incentive Efficiency Slabs</div>
        <div style={{ fontSize:12.5, color:'var(--text-tertiary)', marginTop:2 }}>M08 does a range lookup on efficiency % → incentive %. 11 bands from 67% to 104%+.</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Slab Table</span></div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Efficiency From</th><th>Efficiency To</th><th>Incentive %</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((s, i) => (
                  <tr key={s.id}>
                    <td className="td-sub">{i+1}</td>
                    <td className="td-mono">{s.effFrom}%</td>
                    <td className="td-mono">{s.effTo}%</td>
                    <td className="td-mono" style={{ fontWeight:700, color:'var(--accent)', fontSize:14 }}>{s.incentivePct}%</td>
                    <td>
                      <button className="btn btn-sm btn-ghost">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Visual Reference</span></div>
          <div style={{ padding:'12px 18px' }}>
            {rows.map((s, i) => {
              const width = (s.incentivePct / 30) * 100
              return (
                <div key={s.id} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11.5, marginBottom:3 }}>
                    <span style={{ color:'var(--text-secondary)' }}>{s.effFrom}% – {s.effTo}%</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontWeight:600, color:'var(--accent)' }}>{s.incentivePct}%</span>
                  </div>
                  <div style={{ height:6, background:'var(--border-light)', borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${width}%`, background:`hsl(${20 + i*12},80%,50%)`, borderRadius:3, transition:'width 0.4s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function AuditLogTab() {
  const { data } = useData()
  const configAuditLog = data?.configAuditLog || []

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:600 }}>Configuration Audit Log</div>
        <div style={{ fontSize:12.5, color:'var(--text-tertiary)', marginTop:2 }}>Immutable trail of every change to any config or master data table. Populated by DB triggers — not editable.</div>
      </div>
      <div className="card">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Table</th><th>Operation</th><th>What Changed</th><th>Changed By</th><th>When</th></tr>
            </thead>
            <tbody>
              {configAuditLog.map(row => (
                <tr key={row.id}>
                  <td><span className="td-code">{row.tableName}</span></td>
                  <td>
                    <span className={`badge ${row.operation === 'INSERT' ? 'badge-pass' : row.operation === 'UPDATE' ? 'badge-warn' : 'badge-fail'}`}>
                      {row.operation}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize:12.5, color:'var(--text-secondary)' }}>
                      {row.oldValues && (
                        <span style={{ color:'var(--fail-text)' }}>
                          Old: {JSON.stringify(row.oldValues)}
                        </span>
                      )}
                      {row.oldValues && row.newValues && ' → '}
                      {row.newValues && (
                        <span style={{ color:'var(--pass)', marginLeft: row.oldValues ? 0 : 0 }}>
                          {row.oldValues ? '' : 'New: '}{JSON.stringify(row.newValues)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="td-primary">{row.changedBy}</td>
                  <td style={{ fontSize:12, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)' }}>{fmtDateTime(row.changedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function Configuration() {
  const [activeTab, setActiveTab] = useState(0)

  const tabContent = [
    <MinWageTab key="mw" />,
    <HolidayTab key="hol" />,
    <AttendanceBonusTab key="atb" />,
    <IncentiveSlabTab key="inc" />,
    <AuditLogTab key="log" />,
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Configuration</div>
          <div className="page-subtitle">Manage wages, holidays, bonuses, and slabs · Changes take effect on next workflow run</div>
        </div>
        <div className="header-spacer" />
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--pass)' }} />
          <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Live — n8n reads on next run</span>
        </div>
      </div>

      <div className="page-content">
        <div className="config-tabs">
          {TABS.map((tab, i) => (
            <div
              key={tab}
              className={`config-tab${activeTab === i ? ' active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </div>
          ))}
        </div>

        {tabContent[activeTab]}
      </div>
    </>
  )
}
