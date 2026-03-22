// Vite/SockJS/Stompjs shim
if (typeof window !== 'undefined' && !window.global) {
    window.global = window;
}

import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { AppProvider } from './context/AppContext.jsx'
import App from './App.jsx'
import CitizenApp from './CitizenApp.jsx'
import SuperAdminApp from './SuperAdminApp.jsx'

function Root() {
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/citizen')) return 'citizen';
    if (hash.startsWith('#/superadmin')) return 'superadmin';
    return 'admin';
  });

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/citizen')) setRoute('citizen');
      else if (hash.startsWith('#/superadmin')) setRoute('superadmin');
      else setRoute('admin');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === 'citizen') return <CitizenApp />;
  if (route === 'superadmin') return <SuperAdminApp />;
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <Root />
    </AppProvider>
  </StrictMode>,
)
