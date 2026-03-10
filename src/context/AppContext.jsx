import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3200);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const navigate = useCallback((page) => {
    setActivePage(page);
    setMobileSidebarOpen(false);
  }, []);

  const signIn = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setActivePage('dashboard');
  }, []);

  return (
    <AppContext.Provider value={{
      darkMode, toggleDarkMode,
      activePage, navigate,
      toast, showToast,
      sidebarCollapsed, setSidebarCollapsed,
      mobileSidebarOpen, setMobileSidebarOpen,
      notifPanelOpen, setNotifPanelOpen,
      isAuthenticated, user, signIn, signOut,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
