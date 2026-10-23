/**
 * VAPUR PWA SERVICE WORKER — ZERO-STALE NETWORK-FIRST ENGINE (v8)
 *
 * KULLANICI KURALI:
 * 1. Harici (cross-origin) harita karoları (Esri World Imagery, CartoDB, OpenStreetMap)
 *    ve harici görseller ASLA Service Worker tarafından yakalanmaz; tarayıcının doğal
 *    <img> yükleyicisiyle doğrudan çekilir (CSP connect-src çakışmasını ve siyah harita
 *    hatasını %100 önler).
 * 2. Yalnızca aynı origin (self.location.origin) üzerindeki GET istekleri Network-First
 *    olarak işlenir.
 */

const CACHE_NAME = 'vapur-cache-v8-network-first';

const STATIC_FALLBACK_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/images/pasabahce-hero.jpg',
  '/images/adalar-aerial.jpg',
  '/logos/operator-dentur.png',
  '/logos/operator-ido.png',
  '/logos/operator-mavimarmara.png',
  '/logos/operator-prenstur.png',
  '/logos/operator-sehirhatlari.png',
  '/logos/operator-turyol.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FALLBACK_ASSETS);
    }).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  // KRİTİK DÜZELTME: Harici domain isteklerini (Esri uydu karoları, CartoDB, OpenStreetMap, vb.)
  // Service Worker içinde fetch() ile yakalama! SW içindeki fetch() CSP connect-src'ye
  // takılıp haritayı simsiyah bırakıyordu. Doğrudan tarayıcıya bırak.
  try {
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) {
      return;
    }
  } catch {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return networkResponse;
      })
      .catch(async () => {
        const isNavigate = req.mode === 'navigate';
        const cached = await caches.match(req, { ignoreVary: isNavigate });
        if (cached) return cached;

        if (isNavigate) {
          const rootFallback =
            (await caches.match('/', { ignoreVary: true })) ||
            (await caches.match(new URL('/', req.url).href, { ignoreVary: true }));
          if (rootFallback) return rootFallback;

          return new Response(
            '<!doctype html><html lang="tr"><head><meta charset="utf-8">' +
              '<meta name="viewport" content="width=device-width, initial-scale=1">' +
              '<title>Çevrimdışı — Vapur Seferleri</title></head>' +
              '<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' +
              'background:#070e1e;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center">' +
              '<main style="padding:24px;max-width:420px">' +
              '<div style="font-size:40px">⛴️</div>' +
              '<h1 style="font-size:18px;margin:12px 0 6px">Çevrimdışısınız</h1>' +
              '<p style="color:#94a3b8;font-size:13px;line-height:1.6">İnternet bağlantınız geri geldiğinde seferler ve harita yeniden yüklenecektir.</p>' +
              '</main></body></html>',
            { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }

        return new Response('Çevrimdışı', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data === 'CLEAR_ALL_CACHES') {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      }).then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ cleared: true });
        }
      })
    );
  }
});
