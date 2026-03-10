import { useApp } from '../../context/AppContext.jsx'
import {
  LayoutDashboard, Map, Users, AlertTriangle, Megaphone,
  BrainCircuit, MessageSquare, Bell, Settings, ChevronLeft,
  ChevronRight, MoreVertical, Zap, Globe, Award
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard, badge: null },
  { id: 'boothmap',      label: 'Booth Map',      icon: Map,             badge: null },
  { id: 'voters',        label: 'Voters',         icon: Users,           badge: null },
  { id: 'issues',        label: 'Issues',         icon: AlertTriangle,   badge: '5', badgeClass: 'alert' },
  { id: 'campaigns',     label: 'Campaigns',      icon: Megaphone,       badge: null },
  { id: 'aiinsights',    label: 'AI Insights',    icon: BrainCircuit,    badge: '3', badgeClass: 'new' },
  { id: 'beneficiaries', label: 'Beneficiaries',  icon: Award,           badge: null },
  { id: 'communication', label: 'Communication',  icon: MessageSquare,   badge: null },
  { id: 'notifications', label: 'Notifications',  icon: Bell,            badge: '2', badgeClass: 'alert' },
  { id: 'settings',      label: 'Settings',       icon: Settings,        badge: null },
]

export default function Sidebar() {
  const { activePage, navigate, sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, signOut, user } = useApp()

  const collapsed = sidebarCollapsed
  const mobileClass = mobileSidebarOpen ? ' mobile-open' : ''

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      signOut()
    }
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileClass}`}>
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon"><Zap size={18} /></div>
          <div className="brand-text">
            <span className="brand-name">BoothAI</span>
            <span className="brand-tagline">Management System</span>
          </div>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => { setSidebarCollapsed(!collapsed); setMobileSidebarOpen(false) }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-label">MAIN MENU</div>}
        {NAV_ITEMS.slice(0, 8).map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} navigate={navigate} collapsed={collapsed} />
        ))}
        {!collapsed && <div className="nav-section-label">SYSTEM</div>}
        {NAV_ITEMS.slice(8).map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} navigate={navigate} collapsed={collapsed} />
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <a href="#/citizen" className="citizen-portal-link" title="Open Citizen Portal in same tab">
            <Globe size={13} /> Citizen Portal ↗
          </a>
        )}
        <div className="user-card">
          <div className="user-avatar">{user?.name?.split(' ').map(n => n[0]).join('') || 'A'}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="user-role">{user?.boothId || 'Officer'}</span>
          </div>
          <button
            className="user-menu-btn"
            onClick={handleSignOut}
            title="Sign Out"
            style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <MoreVertical size={15}/>
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ item, active, navigate, collapsed }) {
  const Icon = item.icon
  return (
    <button
      className={`nav-item${active ? ' active' : ''}`}
      onClick={() => navigate(item.id)}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={17} style={{ flexShrink: 0 }} />
      <span className="nav-label">{item.label}</span>
      {item.badge && (
        <span className={`nav-badge${item.badgeClass ? ' ' + item.badgeClass : ''}`}>{item.badge}</span>
      )}
    </button>
  )
}
