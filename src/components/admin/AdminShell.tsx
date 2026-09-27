'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';

type SidebarCtx = {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarCtx>({
  mobileOpen: false,
  setMobileOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {}
});

export function useAdminSidebar() {
  return useContext(SidebarContext);
}

const STORAGE_KEY = 'resa_admin_sidebar_collapsed';

export default function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState(false);

  // Restaure la préférence au montage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === '1') setCollapsedState(true);
  }, []);

  // Persiste à chaque changement
  const setCollapsed = (v: boolean) => {
    setCollapsedState(v);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    }
  };

  const toggleCollapsed = () => setCollapsed(!collapsed);

  // Verrouille le scroll quand le drawer mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Expose la largeur de la sidebar à tout le document (via CSS var)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(
      '--admin-sidebar-w',
      collapsed ? '4rem' : '15rem'
    );
  }, [collapsed]);

  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed, toggleCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
}