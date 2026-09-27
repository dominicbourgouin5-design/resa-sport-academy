'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // Force la relance de l'animation à chaque changement de route
  // (ceinture-bretelles Safari : parfois le remount seul ne suffit pas)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('resa-page-enter');
    void el.offsetWidth; // force reflow → l'animation repart de zéro
    el.classList.add('resa-page-enter');
  }, [pathname]);

  return (
    <div ref={ref} className="resa-page-enter">
      {children}
    </div>
  );
}