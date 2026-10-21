"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WifiOff, Wifi, Database } from "lucide-react";
import { loadSchedulesOffline } from "@/lib/services/offline-db";

/**
 * Tek çevrimdışı bilgi şeridi.
 *
 * KURAL: Yalnızca tarayıcı gerçekten çevrimdışıyken görünür. Çevrimiçi durumda
 * hiçbir uyarı basılmaz. "Canlı radar güncellendi" gibi doğrulanamayan ifade
 * kullanılmaz; yalnızca önbellekteki tarife sayısı ve bilinen son kayıt zamanı
 * dürüstçe gösterilir.
 */
export function OfflineMarineGuideBanner() {
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [cachedTripsCount, setCachedTripsCount] = useState<number | null>(null);
  const [lastSyncLabel, setLastSyncLabel] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    loadSchedulesOffline()
      .then((cached) => {
        if (Array.isArray(cached) && cached.length > 0) {
          setCachedTripsCount(cached.length);
        }
      })
      .catch(() => {});

    try {
      const savedAt = localStorage.getItem("vapur_offline_saved_at");
      if (savedAt) {
        const ms = Date.parse(savedAt);
        if (Number.isFinite(ms)) {
          setLastSyncLabel(
            new Intl.DateTimeFormat("tr-TR", {
              timeZone: "Europe/Istanbul",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(ms),
          );
        }
      }
    } catch {
      // localStorage erişilemezse etiket gösterilmez.
    }

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      router.refresh();
      window.setTimeout(() => setShowReconnected(false), 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  if (showReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-emerald-700 text-white px-3.5 py-1.5 text-[11px] font-bold flex items-center gap-2 shadow-sm"
      >
        <Wifi size={14} aria-hidden="true" />
        <span>Bağlantı geri geldi — seferler yenileniyor.</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-700 text-amber-50 px-3.5 py-1.5 text-[11px] shadow-sm border-b border-amber-500/60 flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff size={14} aria-hidden="true" className="shrink-0" />
        <span className="font-black uppercase tracking-wide shrink-0">Çevrimdışı</span>
        <span className="opacity-90 truncate">
          Kayıtlı resmî tarife gösteriliyor. Canlı duyurular ve iptaller güncellenemiyor.
        </span>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1 rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px]">
        <Database size={10} aria-hidden="true" />
        {cachedTripsCount != null ? `${cachedTripsCount} sefer` : "önbellek"}
        {lastSyncLabel ? ` · ${lastSyncLabel}` : ""}
      </span>
    </div>
  );
}
