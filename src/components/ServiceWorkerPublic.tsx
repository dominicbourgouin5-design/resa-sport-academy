'use client';

import { useEffect } from 'react';

export default function ServiceWorkerPublic() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Enregistrement silencieux (pas de console.log en prod)
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        // Silent fail — la PWA n'est pas critique
      });
  }, []);

  return null;
}