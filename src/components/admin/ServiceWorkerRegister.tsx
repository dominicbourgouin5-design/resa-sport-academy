'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Enregistre le Service Worker une seule fois au chargement de l'admin
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(() => console.log('[SW] Enregistré'))
      .catch((err) => console.error('[SW] Erreur:', err));
  }, []);

  return null;
}