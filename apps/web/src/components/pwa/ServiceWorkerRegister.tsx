"use client";

import { useEffect, useState, useCallback } from "react";
import { OfflineMarineGuideBanner } from "./OfflineMarineGuideBanner";
import { RotateCcw, Sparkles } from "lucide-react";

/**
 * VAPUR SIFIR-ÖNBELLEK & ANLIK SÜRÜM YÖNETİCİSİ (CACHE GUARDIAN v11)
 *
 * Mobil cihazlarda (iOS Safari, Android Chrome) eski verilerin donup kalmasını
 * %100 önlemek için agresif önbellek temizleme ve anında yenileme motoru.
 */

export const CURRENT_APP_BUILD_ID = "vapur-build-20261023-1630";
let currentClientVersion: string | null = null;

export function purgeAllCachesAndReload() {
  if (typeof window === "undefined") return;

  // 1. Service Worker önbelleklerini tamamen sil
  if ("caches" in window) {
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).catch(() => {});
  }

  // 2. Service Worker'a önbellek temizleme emri gönder
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage("CLEAR_ALL_CACHES");
  }

  // 3. localStorage'daki tüm eski tarife ve senkronizasyon verilerini temizle
  try {
    localStorage.removeItem("vapur_schedules_cache_v1");
    localStorage.removeItem("vapur_schedules_last_sync");
    localStorage.removeItem("vapur_last_sync_time");
    localStorage.removeItem("vapur_transit_clock_diff");
  } catch {}

  // 4. IndexedDB veritabanını temizle
  try {
    if (window.indexedDB) {
      window.indexedDB.deleteDatabase("vapur_transit_offline_db");
    }
  } catch {}

  // 5. Safari/Chrome bfcache bypass için timestamp ile sert yenileme
  setTimeout(() => {
    const cleanUrl = window.location.pathname;
    window.location.replace(`${cleanUrl}?ts=${Date.now()}`);
  }, 250);
}

export function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  const checkForServerUpdate = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.onLine) return;

    try {
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
        setTimeout(() => {
          purgeAllCachesAndReload();
        }, 1200);
      }
    } catch {
      // Ağ hatası yutulur
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).purgeVapurCacheAndReload = purgeAllCachesAndReload;

    // Sürüm damgası kontrolü: Eğer kullanıcının cihazında kayıtlı build eskiyse derhal önbelleği temizle
    try {
      const storedBuild = localStorage.getItem("vapur_app_build_id");
      if (storedBuild && storedBuild !== CURRENT_APP_BUILD_ID) {
        console.log("[CacheGuardian] Eski build sürümü temizleniyor:", storedBuild, "➔", CURRENT_APP_BUILD_ID);
        localStorage.setItem("vapur_app_build_id", CURRENT_APP_BUILD_ID);
        purgeAllCachesAndReload();
        return;
      }
      localStorage.setItem("vapur_app_build_id", CURRENT_APP_BUILD_ID);
    } catch {}

    // 1. ChunkLoadError Yakalayıcı (Eski chunk 404 verdiğinde otomatik temizle ve yenile)
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event?.message || "";
      if (
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        console.warn("[CacheGuardian] Eski chunk yükleme hatası. Önbellek temizlenip sayfa yenileniyor...");
        event.preventDefault();
        purgeAllCachesAndReload();
      }
    };
    window.addEventListener("error", handleGlobalError);

    // 2. Service Worker Kaydı & Yönetimi
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((reg) => {
          reg.update().catch(() => {});

          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[SW] Yeni sürüm yüklendi, hemen etkinleştiriliyor...");
                  newWorker.postMessage("SKIP_WAITING");
                  setUpdateAvailable(true);
                  setTimeout(() => {
                    purgeAllCachesAndReload();
                  }, 800);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("[SW] Kayıt hatası:", err);
        });

      const hadController = !!navigator.serviceWorker.controller;
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController || refreshing) return;
        refreshing = true;
        console.log("[SW] Kontrolcü değişti. En güncel sürüm için sayfa yenileniyor...");
        purgeAllCachesAndReload();
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
    const intervalId = setInterval(checkForServerUpdate, 30000);

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
            <span>Yeni Sefer Verileri Yayında — Sayfa Yenileniyor...</span>
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
