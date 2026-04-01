import { useState, useCallback } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

const IconHome = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeLinejoin="round"/>
    <path d="M7 18v-6h6v6" strokeLinejoin="round"/>
  </svg>
)
const IconCalendar = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="16" height="14" rx="2" strokeLinejoin="round"/>
    <path d="M14 2v4M6 2v4M2 9h16" strokeLinecap="round"/>
  </svg>
)
const IconChart = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 15l4-5 4 3 4-6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 17h14" strokeLinecap="round"/>
  </svg>
)
const IconRotate = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3.5 10a6.5 6.5 0 1110.7-5" strokeLinecap="round"/>
    <path d="M14 2v3.5H10.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconBell = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 2.5a6 6 0 016 6v2.5l1.5 2H2.5L4 11V8.5a6 6 0 016-6z" strokeLinejoin="round"/>
    <path d="M8 16a2 2 0 004 0" strokeLinecap="round"/>
  </svg>
)
const IconGear = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="10" cy="10" r="2.5"/>
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" strokeLinecap="round"/>
  </svg>
)

const IconRefresh = ({ spinning }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      width: 14, height: 14, flexShrink: 0,
      animation: spinning ? 'spin 0.9s linear infinite' : 'none',
    }}
  >
    <path d="M3.5 10a6.5 6.5 0 1110.7-5"/>
    <path d="M14 2v3.5H10.5"/>
  </svg>
)

function buildNavItems(base, newAlerts) {
  const b = base.replace(/\/$/, '')
  return [
    { to: b + '/',        label: 'Overview',       icon: IconHome,     exact: true },
    { to: b + '/daily',   label: 'Daily Checks',   icon: IconCalendar, badge: null },
    { to: b + '/monthly', label: 'Monthly Audit',  icon: IconChart,    badge: null },
    { to: b + '/annual',  label: 'Annual Checks',  icon: IconRotate,   badge: null },
    { to: b + '/alerts',  label: 'Alerts',         icon: IconBell,     badge: newAlerts },
  ]
}

function formatIST(date) {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}


export default function Layout({ basePath = '' }) {
  const { data, isLoading, error, refreshData } = useData()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const configTo = basePath.replace(/\/$/, '') + '/config'
  const location = useLocation()
  const [isRefreshing, setIsRefreshing]   = useState(false)
  const [refreshStatus, setRefreshStatus] = useState('idle')   // 'idle' | 'success' | 'error'
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const newAlerts = data?.alerts?.filter(a => a.status === 'NEW').length || 0
  const navItems = buildNavItems(basePath, newAlerts)

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setRefreshStatus('idle')
    try {
      await refreshData()
      setRefreshStatus('success')
      setLastRefreshed(new Date())
    } catch {
      setRefreshStatus('error')
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshData])

  if (isLoading && !data) {
    return (
      <div className="app-shell">
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="loading-spinner" />
            <div className="loading-title">Loading Dashboards</div>
            <div className="loading-sub">Connecting to database…</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="logo-diamond">M</div>
            <span className="logo-name">Magnum PVA</span>
          </div>
          <div className="logo-sub">Payroll Verification Automation</div>
        </div>

        {/* Factory picker */}
        <div className="factory-select-wrap">
          <select className="factory-select" defaultValue="all">
            <option value="all">All Factories</option>
            {data?.factories?.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <div className="sidebar-section-label">Navigation</div>
        <nav className="nav">
          {navItems.map(({ to, label, icon: Icon, exact, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon />
              <span className="nav-label">{label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}

          <div className="nav-divider" />

          <NavLink
            to={configTo}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <IconGear />
            <span className="nav-label">Configuration</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Refresh button */}
          <div className="refresh-wrap">
            <button
              className={`refresh-btn${isRefreshing ? ' refreshing' : ''}`}
              onClick={triggerRefresh}
              disabled={isRefreshing}
            >
              <IconRefresh spinning={isRefreshing} />
              <span>{isRefreshing ? 'Refreshing…' : 'Refresh Data'}</span>
              {!isRefreshing && refreshStatus === 'success' && (
                <span className="refresh-dot refresh-dot-ok" title="Last refresh succeeded" />
              )}
              {!isRefreshing && refreshStatus === 'error' && (
                <span className="refresh-dot refresh-dot-err" title="Last refresh failed" />
              )}
            </button>

            {!isRefreshing && refreshStatus === 'success' && lastRefreshed && (
              <div className="refresh-ts">
                {formatIST(lastRefreshed)} IST
              </div>
            )}
            {!isRefreshing && refreshStatus === 'error' && (
              <div className="refresh-err-msg">
                ⚠ Refresh failed — check connection
              </div>
            )}
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">{user?.email?.[0]?.toUpperCase() ?? '?'}</div>
            <div className="user-info">
              <div className="user-name user-email-truncate">{user?.email ?? ''}</div>
            </div>
            <button
              className="logout-btn"
              title="Sign out"
              onClick={async () => { await signOut(); navigate('/login', { replace: true }) }}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3"/>
                <path d="M13 14l3-4-3-4"/>
                <path d="M16 10H7"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(220, 38, 38, 0.18)',
              background: 'rgba(254, 242, 242, 0.95)',
              color: '#991b1b',
              fontSize: 14,
              lineHeight: 1.45,
            }}
          >
            Database fetch failed: {error}
          </div>
        )}
        <Outlet />
      </main>

      {/* Loading overlay */}
      {isRefreshing && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="loading-spinner" />
            <div className="loading-title">Fetching latest data</div>
            <div className="loading-sub">Connecting to database…</div>
          </div>
        </div>
      )}
    </div>
  )
}
