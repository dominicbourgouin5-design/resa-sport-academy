// ════════════════════════════════════════════════════════════
// Service Worker — RESA Sport Academy
// ════════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Réception d'un push ────────────────────────────────────
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'RESA Sport Academy',
    body: 'Nouvelle notification',
    url: '/admin/notifications'
  };

  try {
    if (event.data) {
      const raw = event.data.text();
      try {
        const parsed = JSON.parse(raw);
        data = { ...data, ...parsed };
      } catch {
        data.body = raw;
      }
    }
  } catch (err) {
    console.error('[SW] Erreur lecture push data:', err);
  }

  // 👇 NOUVEAU : Envoie immédiatement un message aux onglets ouverts pour rafraîchir la cloche et la liste
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'PUSH_RECEIVED',
        payload: data
      });
    });
  });

  const options = {
    body: data.body || 'Cliquez pour voir',
    icon: '/favicon-96x96.png',
    badge: '/favicon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'resa-notif-' + Date.now(),
    data: { url: data.url || '/admin/notifications' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ─── Clic sur la notification ───────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});