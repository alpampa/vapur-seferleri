"use client";

import { useEffect, useState, useCallback } from "react";
import { OfflineMarineGuideBanner } from "./OfflineMarineGuideBanner";
import { RotateCcw, Sparkles } from "lucide-react";

/**
 * VAPUR SIFIR-ÖNBELLEK & ANLIK SÜRÜM YÖNETİCİSİ (CACHE GUARDIAN)
 * 
 * Amaç: Geliştirici kod push ettiğinde veya Vercel'e yeni deploy çıktığında
 * hiçbir son kullanıcı eski önbelleğe takılı kalmamalıdır.
 * 
 * Mekanizmalar:
 * 1. Service Worker updateViaCache: 'none' + reg.update() her odaklanmada çağrılır.
 * 2. controllerchange dinlenir: Yeni Service Worker devraldığı an sayfa otomatik yenilenir.
 * 3. /api/version periyodik ve sekme açılışında kontrol edilir: Sunucu sürümü değiştiyse önbellek silinir ve sayfa yenilenir.
 * 4. ChunkLoadError / Script error yakalanır: Eski build chunk'ı bulunamazsa otomatik cache temizleyip sayfayı yeniden yükler.
 * 5. Manuel acil durum reset fonksiyonu: window.purgeVapurCacheAndReload()
 */

// Uygulama istemciye yüklendiği andaki sürüm damgası
let currentClientVersion: string | null = null;

export function purgeAllCachesAndReload() {
  if (typeof window === "undefined") return;

  // 1. Service Worker önbelleklerini temizle
  if ("caches" in window) {
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).catch(() => {});
  }

  // 2. Service Worker'ı bilgilendir
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage("CLEAR_ALL_CACHES");
  }

  // 3. localStorage'daki geçici tarife önbelleklerini temizle
  try {
    localStorage.removeItem("vapur_schedules_cache_v1");
    localStorage.removeItem("vapur_schedules_last_sync");
  } catch {}

  // 4. Sert yenileme (Bypass cache)
  setTimeout(() => {
    window.location.reload();
  }, 200);
}

export function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  const checkForServerUpdate = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.onLine) return;

    try {
      // no-cache parametresiyle /api/version'u sorgula
      const res = await fetch(`/api/version?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
      });

      if (!res.ok) return;
      const data = await res.json();
      const serverVer = data.version;

      if (!currentClientVersion) {
        currentClientVersion = serverVer;
      } else if (serverVer && serverVer !== currentClientVersion) {
        console.log("[CacheGuardian] Yeni sunucu sürümü tespit edildi:", serverVer);
        setUpdateAvailable(true);
        // 1.5 saniye içinde kullanıcıyı rahatsız etmeden en güncel sürüme geçir
        setTimeout(() => {
          purgeAllCachesAndReload();
        }, 1200);
      }
    } catch {
      // Ağ hatası veya çevrimdışı, yutulur
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Global erişim için window nesnesine ata
    (window as any).purgeVapurCacheAndReload = purgeAllCachesAndReload;

    // 1. ChunkLoadError Yakalayıcı (Eski chunk 404 verdiğinde otomatik temizle ve yenile)
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event?.message || "";
      if (
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        console.warn("[CacheGuardian] Eski chunk yükleme hatası yakalandı. Önbellek temizlenip sayfa yenileniyor...");
        event.preventDefault();
        purgeAllCachesAndReload();
      }
    };
    window.addEventListener("error", handleGlobalError);

    // 2. Service Worker Kaydı & Yönetimi
    if ("serviceWorker" in navigator) {
      // updateViaCache: 'none' -> Tarayıcı asla sw.js'i HTTP önbelleğinde tutmaz
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((reg) => {
          // Sayfa her açıldığında derhal sunucudaki sw.js'i kontrol et
          reg.update().catch(() => {});

          // Yeni bir çalışan bulunduğunda
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[SW] Yeni sürüm yüklendi, hemen etkinleştiriliyor...");
                  newWorker.postMessage("SKIP_WAITING");
                  setUpdateAvailable(true);
                  setTimeout(() => {
                    window.location.reload();
                  }, 800);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("[SW] Kayıt hatası:", err);
        });

      // Yeni Service Worker kontrolü aldığında sayfayı anında yenile
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          console.log("[SW] Kontrolcü değişti. En güncel sürüm için sayfa yenileniyor...");
          window.location.reload();
        }
      });
    }

    // 3. Sekme Görünür Olduğunda ve Periyodik Güncelleme Kontrolü
    checkForServerUpdate();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((reg) => reg.update().catch(() => {}));
        }
        checkForServerUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Her 45 saniyede bir arka planda sessiz sürüm kontrolü yap
    const intervalId = setInterval(checkForServerUpdate, 45000);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [checkForServerUpdate]);

  return (
    <>
      <OfflineMarineGuideBanner />

      {/* Yeni Sürüm Tespit Edildiğinde Gözüken Canlı Güncelleme Rozeti */}
      {updateAvailable && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-bounce"
        >
          <div className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-black border border-emerald-400">
            <Sparkles size={14} className="animate-spin" />
            <span>Yeni Güncelleme Yayında — Sayfa Yenileniyor...</span>
            <button
              type="button"
              onClick={purgeAllCachesAndReload}
              className="bg-white text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <RotateCcw size={10} />
              <span>Yenile</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
