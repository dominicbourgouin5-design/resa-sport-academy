// ════════════════════════════════════════════════════════════
// Service Worker — RESA Sport Academy
// Reçoit les notifications push et les affiche au système
// ════════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(self.clients.claim());
});

// ─── Réception d'une notification push ──────────────────────
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'RESA Sport Academy',
    body: 'Nouvelle notification',
    url: '/admin'
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (err) {
    console.error('[SW] Failed to parse push data:', err);
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon-96x96.png',
    badge: '/favicon-96x96.png',
    vibrate: [200, 100, 200],
    tag: data.url || 'resa-notif',
    data: { url: data.url },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ─── Clic sur la notification ───────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Si un onglet est déjà ouvert sur le site → focus
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Sinon → ouvre un nouvel onglet
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});