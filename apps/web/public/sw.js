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

const CACHE_NAME = 'vapur-cache-v5-network-first';

// DİKKAT: '/' buraya EKLENMEZ. Install anındaki HTML belgesi, içine gömülü eski
// serverTimeIso ile "donmuş" kalır ve çevrimdışı fallback'te sunulursa saat geriye
// kayarak kalkmış seferleri diriltir. Navigasyon fallback'i yalnızca en son başarılı
// ağ yanıtının kopyasından (aşağıdaki cache.put) karşılanır.
const STATIC_FALLBACK_ASSETS = [
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
        // Ağ koptu (OFFLINE): Önbellekten yanıt ver.
        // Navigasyon isteklerinde Next.js HTML'e "Vary: RSC, Next-Router-State-Tree..."
        // eklediği için önbelleğe alınan belge, farklı başlıklı navigasyon isteğiyle
        // eşleşmez. Bu yüzden navigasyonlarda ignoreVary ile ararız.
        const isNavigate = req.mode === 'navigate';
        const cached = await caches.match(req, { ignoreVary: isNavigate });
        if (cached) return cached;

        // Sayfa navigasyonu için çevrimdışı kök fallback'i
        if (isNavigate) {
          const rootFallback =
            (await caches.match('/', { ignoreVary: true })) ||
            (await caches.match(new URL('/', req.url).href, { ignoreVary: true }));
          if (rootFallback) return rootFallback;
        }

        // Navigasyon için kullanıcı dostu çevrimdışı sayfa (düz metin 503 yerine)
        if (req.mode === 'navigate') {
          return new Response(
            '<!doctype html><html lang="tr"><head><meta charset="utf-8">' +
              '<meta name="viewport" content="width=device-width, initial-scale=1">' +
              '<title>Çevrimdışı — Vapur Seferleri</title></head>' +
              '<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' +
              'background:#070e1e;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center">' +
              '<main style="padding:24px;max-width:420px">' +
              '<div style="font-size:40px">⛴️</div>' +
              '<h1 style="font-size:18px;margin:12px 0 6px">Çevrimdışısınız</h1>' +
              '<p style="color:#94a3b8;font-size:13px;line-height:1.6">Bu sayfa henüz cihazınızda ' +
              'önbelleğe alınmadı. İnternet bağlantınız geri geldiğinde seferler ve harita yeniden yüklenecektir.</p>' +
              '</main></body></html>',
            { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
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
