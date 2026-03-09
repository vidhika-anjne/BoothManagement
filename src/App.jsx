import { useEffect, lazy, Suspense } from 'react'
import { useApp } from './context/AppContext.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'
import Toast from './components/shared/Toast.jsx'

const Dashboard    = lazy(() => import('./pages/Dashboard.jsx'))
const BoothMap     = lazy(() => import('./pages/BoothMap.jsx'))
const Voters       = lazy(() => import('./pages/Voters.jsx'))
const KnowledgeGraph = lazy(() => import('./pages/KnowledgeGraph.jsx'))
const Issues       = lazy(() => import('./pages/Issues.jsx'))
const Campaigns    = lazy(() => import('./pages/Campaigns.jsx'))
const AIInsights   = lazy(() => import('./pages/AIInsights.jsx'))
const Communication = lazy(() => import('./pages/Communication.jsx'))
const CitizenPortal = lazy(() => import('./pages/CitizenPortal.jsx'))
const Settings      = lazy(() => import('./pages/Settings.jsx'))

const PAGE_MAP = {
  dashboard: Dashboard,
  boothmap: BoothMap,
  voters: Voters,
  graph: KnowledgeGraph,
  issues: Issues,
  campaigns: Campaigns,
  aiinsights: AIInsights,
  communication: Communication,
  citizenportal: CitizenPortal,
  settings: Settings,
}

function App() {
  const { darkMode, activePage, mobileSidebarOpen } = useApp()

  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark' : ''
  }, [darkMode])

  const PageComponent = PAGE_MAP[activePage] || Dashboard

  return (
    <div className="app-shell">
      <Sidebar />
      {mobileSidebarOpen && <div className="sidebar-overlay" onClick={() => {}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:99}} />}
      <div className="main-wrapper">
        <Topbar />
        <main className="content-area">
          <Suspense fallback={<div style={{padding:'2rem',color:'var(--text-muted)',textAlign:'center'}}>Loading…</div>}>
            <div className="page-enter">
              <PageComponent />
            </div>
          </Suspense>
        </main>
      </div>
      <Toast />
    </div>
  )
}

export default App
