'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToHash() {
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const targetId = decodeURIComponent(hash.replace(/^#/, ''));
    if (!targetId) return;

    let attempts = 0;
    const maxAttempts = 30; // 30 * 50ms = 1.5s max

    const tryScroll = () => {
      const element = document.getElementById(targetId);

      if (element) {
        // scrollIntoView respecte nativement `scroll-mt-*` de Tailwind
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else if (attempts < maxAttempts) {
        attempts++;
        timerRef.current = setTimeout(tryScroll, 50);
      }
    };

    // Petit délai initial pour laisser React monter le DOM
    timerRef.current = setTimeout(tryScroll, 60);

    const onHashChange = () => tryScroll();
    window.addEventListener('hashchange', onHashChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [pathname]);

  return null;
}