// ════════════════════════════════════════════════════════════
// Service Worker — RESA Sport Academy
// ════════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(self.clients.claim());
});

// ─── Réception d'un push ────────────────────────────────────
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'RESA Sport Academy',
    body: 'Nouvelle notification',
    url: '/admin'
  };

  // ⚠️ Parsing robuste : JSON si possible, sinon texte brut
  try {
    if (event.data) {
      const raw = event.data.text();
      console.log('[SW] Raw data:', raw);

      // Essaie de parser en JSON
      try {
        const parsed = JSON.parse(raw);
        data = { ...data, ...parsed };
        console.log('[SW] Parsed as JSON');
      } catch {
        // Pas du JSON → utilise le texte brut comme body
        data.body = raw;
        console.log('[SW] Parsed as plain text');
      }
    }
  } catch (err) {
    console.error('[SW] Failed to read push data:', err);
  }

  const options = {
    body: data.body || 'Cliquez pour voir',
    icon: '/favicon-96x96.png',
    badge: '/favicon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'resa-notif-' + Date.now(),
    data: { url: data.url || '/admin' },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  console.log('[SW] Showing notification:', data.title);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => console.log('[SW] ✅ Notification displayed'))
      .catch((err) => console.error('[SW] ❌ Display failed:', err))
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