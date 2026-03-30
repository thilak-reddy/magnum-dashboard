import { useState, useMemo } from 'react'
import { useEffect } from 'react'
import { moduleNames, fmtDateTime } from '../data/mock'
import { useData } from '../context/DataContext'


const statusColor = { PASS:'pass', FAIL:'fail', WARN:'warn', SKIP:'skip' }
const sevClass    = { CRITICAL:'crit', HIGH:'high', MEDIUM:'med', LOW:'low' }
const alertStatus = { NEW:'new', ACKNOWLEDGED:'ack', RESOLVED:'res', DISMISSED:'skip' }
const rowClass    = { CRITICAL:'row-crit', HIGH:'row-high', MEDIUM:'row-warn', LOW:'row-pass' }

function CommentDrawer({ alert, onClose, onAck, onResolve }) {
  const { data } = useData()
  const factories = data?.factories || []
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(alert.comments || [])

  if (!alert) return null

  const factory = factories.find(f => f.id === alert.factoryId)

  const addComment = () => {
    if (!comment.trim()) return
    setComments(prev => [...prev, { author: 'Divya (Central HR)', time: new Date().toISOString(), body: comment.trim() }])
    setComment('')
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" style={{ width: 480 }}>
        <div className="drawer-header">
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
              <span className={`badge badge-${sevClass[alert.severity]}`}>{alert.severity}</span>
              <span className={`badge badge-${alertStatus[alert.status]}`}>{alert.status}</span>
              <span className="td-code">{alert.module}</span>
            </div>
            <div className="drawer-title">{alert.title}</div>
            <div className="drawer-subtitle">{factory?.name} · {fmtDateTime(alert.createdAt)}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          {/* Details */}
          <div className="drawer-section">
            <div className="drawer-section-title">Alert Details</div>
            <div style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.6, background:'#FAFAF8', border:'1px solid var(--border-light)', borderRadius:'var(--radius)', padding:'12px 14px' }}>
              {alert.body}
            </div>
          </div>

          {/* Timeline */}
          <div className="drawer-section">
            <div className="drawer-section-title">Timeline</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--fail)', marginTop:5, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:12.5, fontWeight:500, color:'var(--text-primary)' }}>Alert raised</div>
                  <div style={{ fontSize:11.5, color:'var(--text-tertiary)', marginTop:1 }}>{fmtDateTime(alert.createdAt)}</div>
                </div>
              </div>
              {alert.acknowledgedBy && (
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--warn)', marginTop:5, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:12.5, fontWeight:500, color:'var(--text-primary)' }}>Acknowledged by {alert.acknowledgedBy}</div>
                    <div style={{ fontSize:11.5, color:'var(--text-tertiary)', marginTop:1 }}>{fmtDateTime(alert.acknowledgedAt)}</div>
                  </div>
                </div>
              )}
              {alert.resolvedAt && (
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--pass)', marginTop:5, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:12.5, fontWeight:500, color:'var(--text-primary)' }}>Resolved</div>
                    <div style={{ fontSize:11.5, color:'var(--text-tertiary)', marginTop:1 }}>{fmtDateTime(alert.resolvedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="drawer-section">
            <div className="drawer-section-title">HR Notes ({comments.length})</div>
            {comments.length === 0 && (
              <div style={{ fontSize:12.5, color:'var(--text-tertiary)', padding:'8px 0' }}>No comments yet.</div>
            )}
            {comments.map((c, i) => (
              <div key={i} className="comment-entry">
                <div className="comment-meta">{c.author} · {fmtDateTime(c.time)}</div>
                <div className="comment-body">{c.body}</div>
              </div>
            ))}
            <div style={{ marginTop:12 }}>
              <textarea
                className="comment-input"
                placeholder="Add a note — e.g. 'Confirmed with factory HR, will be corrected next month'"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button className="btn btn-sm btn-accent" onClick={addComment}>Add Note</button>
              </div>
            </div>
          </div>

          {/* Actions */}
          {alert.status === 'NEW' && (
            <div className="drawer-section">
              <div className="drawer-section-title">Actions</div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-sm" onClick={onAck}>Acknowledge</button>
                <button className="btn btn-sm btn-accent" onClick={onResolve}>Mark Resolved</button>
                <button className="btn btn-sm btn-danger" style={{ marginLeft:'auto' }}>Dismiss</button>
              </div>
            </div>
          )}
          {alert.status === 'ACKNOWLEDGED' && (
            <div className="drawer-section">
              <div className="drawer-section-title">Actions</div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-sm btn-accent" onClick={onResolve}>Mark Resolved</button>
                <button className="btn btn-sm btn-danger" style={{ marginLeft:'auto' }}>Dismiss</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function AlertsPage() {
  const { data } = useData()
  const alerts = data?.alerts || []
  const factories = data?.factories || []

  const [filterSev,    setFilterSev]    = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterModule, setFilterModule] = useState('All')
  const [filterFactory,setFilterFactory]= useState('All')
  const [selected,     setSelected]     = useState(null)
  const [localAlerts,  setLocalAlerts]  = useState(alerts)
  const [selected2,    setSelected2]    = useState(new Set())

  useEffect(() => {
    setLocalAlerts(alerts)
  }, [alerts])

  const modules = ['All', ...new Set(localAlerts.map(a => a.module))]
  const factoryList = ['All', ...new Set(localAlerts.map(a => a.factory))]

  const filtered = useMemo(() => localAlerts.filter(a => {
    if (filterSev    !== 'All' && a.severity !== filterSev)    return false
    if (filterStatus !== 'All' && a.status   !== filterStatus) return false
    if (filterModule !== 'All' && a.module   !== filterModule) return false
    if (filterFactory!== 'All' && a.factory  !== filterFactory)return false
    return true
  }), [localAlerts, filterSev, filterStatus, filterModule, filterFactory])

  const counts = {
    new:  localAlerts.filter(a => a.status === 'NEW').length,
    ack:  localAlerts.filter(a => a.status === 'ACKNOWLEDGED').length,
    res:  localAlerts.filter(a => a.status === 'RESOLVED').length,
    crit: localAlerts.filter(a => a.severity === 'CRITICAL').length,
  }

  const ack = (id) => setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, status:'ACKNOWLEDGED', acknowledgedBy:'Divya (Central HR)', acknowledgedAt: new Date().toISOString() } : a))
  const resolve = (id) => setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, status:'RESOLVED', resolvedAt: new Date().toISOString() } : a))

  const bulkAck = () => {
    const ids = filtered.filter(a => a.status === 'NEW').map(a => a.id)
    setLocalAlerts(prev => prev.map(a => ids.includes(a.id) ? { ...a, status:'ACKNOWLEDGED', acknowledgedBy:'Divya (Central HR)', acknowledgedAt: new Date().toISOString() } : a))
  }

  const selectedAlert = localAlerts.find(a => a.id === selected)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Alerts</div>
          <div className="page-subtitle">Full alert history · All factories</div>
        </div>
        <div className="header-spacer" />
        <div className="filter-row">
          <button className="btn btn-sm" onClick={bulkAck}>Acknowledge All Visible</button>
        </div>
      </div>

      <div className="page-content">

        {/* Metric row */}
        <div className="metric-row" style={{ marginBottom: 24 }}>
          <div className="metric-card metric-fail">
            <div className="metric-label">Open (New)</div>
            <div className="metric-value">{counts.new}</div>
            <div className="metric-sub">Needs attention</div>
          </div>
          <div className="metric-card metric-warn">
            <div className="metric-label">Acknowledged</div>
            <div className="metric-value">{counts.ack}</div>
            <div className="metric-sub">Under review</div>
          </div>
          <div className="metric-card metric-pass">
            <div className="metric-label">Resolved</div>
            <div className="metric-value">{counts.res}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Critical</div>
            <div className="metric-value" style={{ color:'var(--crit-text)' }}>{counts.crit}</div>
            <div className="metric-sub">Highest severity</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-row" style={{ marginBottom: 16 }}>
          <span className="filter-label">Severity:</span>
          {['All','CRITICAL','HIGH','MEDIUM','LOW'].map(s => (
            <button
              key={s}
              className={`btn btn-sm btn-ghost${filterSev === s ? ' btn-accent' : ''}`}
              onClick={() => setFilterSev(s)}
            >{s === 'All' ? 'All' : s}</button>
          ))}
          <div style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />
          <span className="filter-label">Status:</span>
          {['All','NEW','ACKNOWLEDGED','RESOLVED'].map(s => (
            <button
              key={s}
              className={`btn btn-sm btn-ghost${filterStatus === s ? ' btn-accent' : ''}`}
              onClick={() => setFilterStatus(s)}
            >{s === 'All' ? 'All' : s[0] + s.slice(1).toLowerCase()}</button>
          ))}
          <div style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />
          <select className="filter-select" value={filterFactory} onChange={e => setFilterFactory(e.target.value)}>
            {factoryList.map(f => <option key={f}>{f}</option>)}
          </select>
          <select className="filter-select" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
            {modules.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {/* Alert list */}
        <div className="card" style={{ marginBottom: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize:32 }}>✓</div>
              <div className="empty-title">No alerts match this filter</div>
              <div className="empty-sub">Try changing the severity or status filter</div>
            </div>
          ) : filtered.map(a => {
            const factory = factories.find(f => f.id === a.factoryId)
            return (
              <div
                key={a.id}
                className={`alert-row-detail ${rowClass[a.severity] || ''}`}
                style={{ borderLeft: `3px solid ${a.severity === 'CRITICAL' ? 'var(--fail)' : a.severity === 'HIGH' ? 'var(--accent)' : a.severity === 'MEDIUM' ? 'var(--warn)' : 'transparent'}` }}
                onClick={() => setSelected(a.id)}
              >
                <div className="alert-top">
                  <div className="alert-sev" style={{ display:'flex', flexDirection:'column', gap:4, width:70 }}>
                    <span className={`badge badge-${sevClass[a.severity]}`}>{a.severity === 'CRITICAL' ? 'CRIT' : a.severity}</span>
                    <span className={`badge badge-${alertStatus[a.status]}`} style={{ fontSize:10 }}>{a.status === 'ACKNOWLEDGED' ? 'ACK\'D' : a.status}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div className="alert-msg">{a.title}</div>
                    <div className="alert-meta">
                      <span className="td-code">{a.module}</span>
                      {' '} · {a.factory} · {fmtDateTime(a.createdAt)}
                      {a.acknowledgedBy && <span style={{ color:'var(--warn-text)' }}> · Ack'd by {a.acknowledgedBy}</span>}
                      {a.resolvedAt && <span style={{ color:'var(--pass)' }}> · Resolved {fmtDateTime(a.resolvedAt)}</span>}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-tertiary)', marginTop:4, lineHeight:1.5 }}>{a.body}</div>
                    {a.comments?.length > 0 && (
                      <div style={{ fontSize:11.5, color:'var(--accent)', marginTop:4 }}>
                        💬 {a.comments.length} comment{a.comments.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div className="alert-actions" onClick={e => e.stopPropagation()}>
                    {a.status === 'NEW' && (
                      <button className="btn btn-sm" onClick={() => ack(a.id)}>Acknowledge</button>
                    )}
                    {(a.status === 'NEW' || a.status === 'ACKNOWLEDGED') && (
                      <button className="btn btn-sm btn-accent" onClick={() => resolve(a.id)}>Resolve</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ fontSize:12, color:'var(--text-tertiary)', marginTop:12, textAlign:'right' }}>
          Showing {filtered.length} of {localAlerts.length} alerts
        </div>

      </div>

      {selectedAlert && (
        <CommentDrawer
          alert={selectedAlert}
          onClose={() => setSelected(null)}
          onAck={() => { ack(selected); setSelected(null) }}
          onResolve={() => { resolve(selected); setSelected(null) }}
        />
      )}
    </>
  )
}
