'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 80; // 80 × 50ms = 4s max

    const tryScroll = () => {
      if (cancelled) return;

      // ⚠️ On ne retourne PAS early si le hash est vide : on attend qu'il apparaisse
      const hash = window.location.hash;

      if (!hash) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryScroll, 50);
        }
        return;
      }

      const targetId = decodeURIComponent(hash.replace(/^#/, ''));
      if (!targetId) return;

      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({
          behavior: 'instant' as ScrollBehavior,
          block: 'start'
        });
        return;
      }

      // L'élément n'est pas encore rendu (streaming SSR) → on réessaie
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryScroll, 50);
      }
    };

    // On laisse passer un tick (rAF) pour que Next.js ait fini d'écrire l'URL
    const raf = requestAnimationFrame(() => tryScroll());

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}