'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToHash() {
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const targetId = decodeURIComponent(hash.replace(/^#/, ''));
    if (!targetId) return;

    let attempts = 0;
    const maxAttempts = 30; // 1.5s max

    const tryScroll = () => {
      const element = document.getElementById(targetId);

      if (element) {
        // behavior "instant" : le scroll se fait AVANT que l'utilisateur voie la page
        element.scrollIntoView({
          behavior: 'instant' as ScrollBehavior,
          block: 'start'
        });
      } else if (attempts < maxAttempts) {
        attempts++;
        timerRef.current = setTimeout(tryScroll, 30);
      }
    };

    // Tentative immédiate (dans le même tick que le render)
    tryScroll();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return null;
}