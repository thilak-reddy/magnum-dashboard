import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { alerts } from '../data/mock'

const newAlerts = alerts.filter(a => a.status === 'NEW').length

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

const navItems = [
  { to: '/',        label: 'Overview',       icon: IconHome,     exact: true },
  { to: '/daily',   label: 'Daily Checks',   icon: IconCalendar, badge: null },
  { to: '/monthly', label: 'Monthly Audit',  icon: IconChart,    badge: null },
  { to: '/annual',  label: 'Annual Checks',  icon: IconRotate,   badge: null },
  { to: '/alerts',  label: 'Alerts',         icon: IconBell,     badge: newAlerts },
]

export default function Layout() {
  const location = useLocation()

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
            <option value="all">All 7 Factories</option>
            <option value="f1">TKM V</option>
            <option value="f2">TKM II</option>
            <option value="f3">Kandigai</option>
            <option value="f4">Cheyyar</option>
            <option value="f5">Kancheepuram</option>
            <option value="f6">Vellore</option>
            <option value="f7">Tiruppur</option>
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
            to="/config"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <IconGear />
            <span className="nav-label">Configuration</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">D</div>
            <div className="user-info">
              <div className="user-name">Divya Menon</div>
              <div className="user-role">Central HR</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
