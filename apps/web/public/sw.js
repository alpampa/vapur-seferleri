/**
 * VAPUR PWA SERVICE WORKER — ZERO-STALE NETWORK-FIRST ENGINE
 *
 * KULLANICI KURALI: En son yayınlanan sürüm tüm tarayıcılarda ANINDA görünmelidir.
 * Asla eski JS/CSS önbelleği kullanıcıya sunulamaz (vapur saatleri hayati önem taşır).
 * 
 * Strateji:
 * - ONLINE (Çevrimiçi): %100 Network-First (Her zaman sunucudaki en güncel kod çekilir).
 * - OFFLINE (İnternet Yok): Yalnızca ağ bağlantısı koptuğunda önbellekten sunulur.
 */

const CACHE_NAME = 'vapur-cache-v4-network-first';

const STATIC_FALLBACK_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logos/operator-dentur.png',
  '/logos/operator-mavimarmara.png',
  '/logos/operator-prenstur.png',
  '/logos/operator-sehirhatlari.png',
  '/logos/operator-turyol.png'
];

// Yeni sürüm yayınlandığında beklemeksizin hemen devreye gir
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FALLBACK_ASSETS);
    }).catch(() => {})
  );
});

// Eski sürümlerin tüm önbelleklerini derhal temizle
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

// NETWORK-FIRST: Çevrimiçi iken daima taze ağ verisi, sadece internetsiz iken önbellek
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Sadece GET isteklerini işle
  if (req.method !== 'GET') return;

  // Chrome uzantıları veya harici şemaları atla
  if (!req.url.startsWith('http')) return;

  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        // Ağ başarılı: Yanıtı klonlayıp çevrimdışı fallback için sakla
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return networkResponse;
      })
      .catch(async () => {
        // Ağ koptu (OFFLINE): Önbellekten yanıt ver
        const cached = await caches.match(req);
        if (cached) return cached;

        // Sayfa navigasyonu için çevrimdışı kök fallback'i
        if (req.mode === 'navigate') {
          const rootFallback = await caches.match('/');
          if (rootFallback) return rootFallback;
        }

        return new Response('Çevrimdışısınız ve bu içerik önbellekte bulunmuyor.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});

// İstemciden (client) gelen acil önbellek temizleme mesajlarını dinle
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
