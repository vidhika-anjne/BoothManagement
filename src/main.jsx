import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { AppProvider } from './context/AppContext.jsx'
import App from './App.jsx'
import CitizenApp from './CitizenApp.jsx'

function Root() {
  const [citizen, setCitizen] = useState(() => window.location.hash.startsWith('#/citizen'))
  useEffect(() => {
    const onHash = () => setCitizen(window.location.hash.startsWith('#/citizen'))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return citizen ? <CitizenApp /> : <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <Root />
    </AppProvider>
  </StrictMode>,
)
