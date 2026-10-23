/**
 * VAPUR PWA SERVICE WORKER — ZERO-STALE NETWORK-FIRST ENGINE (v11)
 *
 * KRİTİK MOBİL KURALLARI:
 * 1. API istekleri (/api/*) ASLA Service Worker önbelleğine alınmaz; her zaman canlı sunucudan no-store ile çekilir.
 * 2. Navigasyon / HTML istekleri her zaman { cache: 'no-cache' } ile canlı sunucudan çekilir (mobilde donmuş HTML kalmasını önler).
 * 3. Harici domain karoları (CartoDB, OpenStreetMap) SW tarafından engellenmez, doğal browser fetch'ine bırakılır.
 * 4. Eski tüm önbellekler derhal temizlenir ve clients.claim() ile yeni SW hemen kontrolü alır.
 */

const CACHE_NAME = 'vapur-cache-v11-zero-stale';

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
            console.log('[SW] Eski önbellek silindi:', key);
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

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // 1. Harici alan adları (Harita karoları, Open-Meteo, vb.) — Doğrudan tarayıcıya bırak
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Canlı API uç noktaları (/api/*) — Asla önbelleğe alma, her zaman canlı sunucu
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => {
        return new Response(JSON.stringify({ error: 'Çevrimdışı', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 3. Sayfa Navigasyonu (HTML) — Canlı sunucudan taze HTML çek
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(async () => {
          // Yalnızca tamamen internetsiz kalındığında çevrimdışı sayfasını göster
          return new Response(
            '<!doctype html><html lang="tr"><head><meta charset="utf-8">' +
              '<meta name="viewport" content="width=device-width, initial-scale=1">' +
              '<title>Çevrimdışı — Vapur Seferleri</title></head>' +
              '<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' +
              'background:#070e1e;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center">' +
              '<main style="padding:24px;max-width:420px">' +
              '<div style="font-size:40px">⛴️</div>' +
              '<h1 style="font-size:18px;margin:12px 0 6px">Çevrimdışısınız</h1>' +
              '<p style="color:#94a3b8;font-size:13px;line-height:1.6">İnternet bağlantınız geri geldiğinde canlı seferler ve harita otomatik yüklenecektir.</p>' +
              '</main></body></html>',
            { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 4. Statik Varlıklar (Logolar, manifest, vb.) — Network-First
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
        const cached = await caches.match(req);
        if (cached) return cached;
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
