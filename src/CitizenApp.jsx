import { lazy, Suspense, useEffect, useState } from 'react'
import { useApp } from './context/AppContext.jsx'
import Toast from './components/shared/Toast.jsx'
import CitizenLogin from './pages/CitizenLogin.jsx'

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
      <Suspense fallback={<div className="citizen-loading">Loading portal…</div>}>
        <CitizenPortal />
      </Suspense>
      <Toast />
    </div>
  )
}
