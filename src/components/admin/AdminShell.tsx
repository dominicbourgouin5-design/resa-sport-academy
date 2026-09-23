'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const SidebarContext = createContext<{
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}>({
  mobileOpen: false,
  setMobileOpen: () => {}
});

export function useAdminSidebar() {
  return useContext(SidebarContext);
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Verrouille le scroll quand le drawer mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}