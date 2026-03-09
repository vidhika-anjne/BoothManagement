import { Search, Bell, Sun, Moon, Menu, RefreshCw } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const PAGE_LABELS = {
  dashboard:     'Dashboard',
  boothmap:      'Booth Map',
  voters:        'Voter Management',
  issues:        'Issues Tracker',
  campaigns:     'Campaigns',
  aiinsights:    'AI Insights',
  communication: 'Communication',
  notifications: 'Notifications',
  settings:      'Settings',
}

export default function Topbar() {
  const { darkMode, toggleDarkMode, activePage, setMobileSidebarOpen, mobileSidebarOpen, showToast, setNotifPanelOpen } = useApp()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn icon-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          style={{ border: 'none' }}
        >
          <Menu size={20} />
        </button>
        <span className="breadcrumb">{PAGE_LABELS[activePage] || 'Dashboard'}</span>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search voters, booths, issues…" />
        </div>

        <button
          className="icon-btn"
          title="Refresh data"
          onClick={() => showToast('Data refreshed successfully')}
        >
          <RefreshCw size={15} />
        </button>

        <button
          className="icon-btn"
          title="Notifications"
          onClick={() => setNotifPanelOpen(true)}
        >
          <Bell size={15} />
          <span className="notif-dot" />
        </button>

        <button className="theme-toggle" onClick={toggleDarkMode} title="Toggle theme">
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {darkMode ? 'Light' : 'Dark'}
        </button>

        <div className="topbar-avatar" title="Profile">VK</div>
      </div>
    </header>
  )
}
