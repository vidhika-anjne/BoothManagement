import { lazy, Suspense, useEffect, useState } from 'react'
import { useApp } from './context/AppContext.jsx'
import Toast from './components/shared/Toast.jsx'
import CitizenLogin from './pages/CitizenLogin.jsx'
import { Landmark, Phone, ArrowLeft, ExternalLink } from 'lucide-react'

const CitizenPortal = lazy(() => import('./pages/CitizenPortal.jsx'))

export default function CitizenApp() {
  const { darkMode } = useApp()
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('citizen_user')) } catch { return null }
  })

  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark' : ''
  }, [darkMode])

  const handleLogin = (u) => {
    sessionStorage.setItem('citizen_user', JSON.stringify(u))
    setUser(u)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('citizen_user')
    setUser(null)
  }

  if (!user) return (
    <>
      <CitizenLogin onLogin={handleLogin} />
      <Toast />
    </>
  )

  return (
    <div className="citizen-shell">
      <header className="citizen-header">
        <div className="citizen-header-inner">
          <div className="citizen-brand">
            <div className="citizen-brand-icon">
              <Landmark size={18} />
            </div>
            <div>
              <div className="citizen-brand-name">Ward 8 Citizen Service Portal</div>
              <div className="citizen-brand-sub">Government of Maharashtra &nbsp;·&nbsp; Electoral Services &amp; Grievance Redressal</div>
            </div>
          </div>

          <div className="citizen-header-right">
            <div className="citizen-helpline">
              <Phone size={13} />
              <span>Helpline: 1950</span>
            </div>
            <div className="citizen-user-pill">
              <span className="citizen-user-avatar">{user.mobile.slice(-4)}</span>
              <span className="citizen-user-num">+91-{user.mobile.slice(0,5)}XXXXX</span>
            </div>
            <button className="citizen-logout-btn" onClick={handleLogout} title="Sign out">
              Sign out
            </button>
            <a href="#/" className="citizen-admin-link" title="Go to Admin Dashboard">
              <ArrowLeft size={13} />
              <span>Admin</span>
              <ExternalLink size={11} style={{ opacity: .6 }} />
            </a>
          </div>
        </div>
      </header>

      <main className="citizen-main">
        <Suspense fallback={<div className="citizen-loading">Loading portal…</div>}>
          <CitizenPortal />
        </Suspense>
      </main>

      <footer className="citizen-footer">
        <div className="citizen-footer-inner">
          <span>Government of Maharashtra &nbsp;·&nbsp; Ward 8 &nbsp;·&nbsp; Booth 141–146</span>
          <span>Helpline: 1950 &nbsp;·&nbsp; ward8.maharashtra.gov.in &nbsp;·&nbsp; © 2026</span>
        </div>
      </footer>

      <Toast />
    </div>
  )
}
