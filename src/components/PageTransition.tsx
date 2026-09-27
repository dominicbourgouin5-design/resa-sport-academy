'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // ⚠️ Si un hash est présent → pas d'animation (arrivée directe par ancre)
    const hasHash = typeof window !== 'undefined' && window.location.hash.length > 1;
    setAnimate(!hasHash);
    setKey(pathname);
  }, [pathname]);

  return (
    <div key={key} className={animate ? 'page-fade-in' : undefined}>
      {children}
    </div>
  );
}