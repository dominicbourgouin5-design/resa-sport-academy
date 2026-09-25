// ════════════════════════════════════════════════════════════
// Service Worker — RESA Sport Academy
// Push notifications + Cache PWA
// ════════════════════════════════════════════════════════════

const CACHE_NAME = 'resa-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/fr',
  '/en',
  '/favicon-96x96.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png'
];

// ─── Install : précache + skip waiting ──────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
  self.skipWaiting();
});

// ─── Activate : nettoie les anciens caches ──────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch : cache-first pour les assets statiques ──────────
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Ignore non-GET et les requêtes cross-origin
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Ignore les routes API, admin et Next.js internals
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/_next/')
  ) {
    return;
  }

  // Cache-first pour les images et assets publics
  const isAsset =
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?|ttf)$/i.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        });
      })
    );
  }
});

// ════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS (ton code existant — inchangé)
// ════════════════════════════════════════════════════════════

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