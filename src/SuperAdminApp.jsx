import { useState, lazy, Suspense } from 'react';
import {
  LayoutDashboard, Map, Users, Award, BrainCircuit, UsersRound, Settings, LogOut, ShieldAlert
} from 'lucide-react';
import SuperAdminSignIn from './pages/admin/SuperAdminSignIn';

const SuperAdminDashboard = lazy(() => import('./pages/admin/SuperAdminDashboard.jsx'));
const SuperAdminBooths    = lazy(() => import('./pages/admin/SuperAdminBooths.jsx'));
const SuperAdminSections  = lazy(() => import('./pages/admin/SuperAdminSections.jsx'));
const SuperAdminVoters    = lazy(() => import('./pages/admin/SuperAdminVoters.jsx'));
const SuperAdminSchemes   = lazy(() => import('./pages/admin/SuperAdminSchemes.jsx'));
const SuperAdminAnalytics = lazy(() => import('./pages/admin/SuperAdminAnalytics.jsx'));

const PAGE_MAP = {
  'dashboard': SuperAdminDashboard,
  'booths':    SuperAdminBooths,
  'sections':  SuperAdminSections,
  'voters':    SuperAdminVoters,
  'schemes':   SuperAdminSchemes,
  'analytics': SuperAdminAnalytics,
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview',  icon: LayoutDashboard },
  { id: 'booths',    label: 'All Booths',icon: Map },
  { id: 'sections',  label: 'Sections',  icon: Map },
  { id: 'voters',    label: 'Voters DB', icon: UsersRound },
  { id: 'schemes',   label: 'Schemes',   icon: Award },
  { id: 'analytics', label: 'Analytics', icon: BrainCircuit },
];

export default function SuperAdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  
  if (!isAuthenticated) {
    return <SuperAdminSignIn onSignIn={() => setIsAuthenticated(true)} />;
  }

  const PageComponent = PAGE_MAP[activePage] || SuperAdminDashboard;

  return (
    <div className="app-shell super-admin-theme" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Super Admin Sidebar */}
      <aside style={{ width: '250px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <ShieldAlert size={24} style={{ color: 'var(--primary)' }} />
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Super Admin</div>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                  borderRadius: '8px', border: 'none', background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text)', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.2s'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
              borderRadius: '8px', border: 'none', background: 'transparent', width: '100%',
              color: 'var(--error)', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
          <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            <a href="#/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Back to BootH Officer</a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: 'var(--bg)' }}>
        <Suspense fallback={<div>Loading Super Admin Page...</div>}>
          <PageComponent />
        </Suspense>
      </main>
    </div>
  );
}
