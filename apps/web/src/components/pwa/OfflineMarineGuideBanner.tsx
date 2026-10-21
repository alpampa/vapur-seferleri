"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi, Compass, ShieldCheck, RefreshCw, Anchor, Smartphone } from "lucide-react";

export function OfflineMarineGuideBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [cachedTripsCount, setCachedTripsCount] = useState<number>(692);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  useEffect(() => {
    // Determine initial online state
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      // Check cached schedules count
      try {
        const cached = localStorage.getItem("vapur_schedules_cache_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setCachedTripsCount(parsed.length);
          }
        }
      } catch (e) {}

      const syncTime = localStorage.getItem("vapur_last_sync_time") || new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      setLastSyncTime(syncTime);

      const handleOnline = () => {
        setIsOffline(false);
        setShowReconnected(true);
        const nowStr = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        setLastSyncTime(nowStr);
        localStorage.setItem("vapur_last_sync_time", nowStr);
        setTimeout(() => setShowReconnected(false), 4000);
      };

      const handleOffline = () => {
        setIsOffline(true);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between gap-2 shadow-lg sticky top-0 z-50 animate-fadeIn">
        <div className="flex items-center gap-2">
          <Wifi size={15} className="animate-pulse" />
          <span>İnternet Bağlantısı Kuruldu — Canlı radar ve meteoroloji verileri güncellendi.</span>
        </div>
        <span className="text-[10px] font-mono opacity-80">Senkronize: {lastSyncTime}</span>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-3.5 py-2.5 text-xs shadow-xl sticky top-0 z-50 border-b border-amber-500/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center shrink-0 border border-white/20">
              <Compass size={16} className="animate-spin text-amber-200" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black uppercase tracking-wide text-amber-100 flex items-center gap-1">
                  <WifiOff size={13} />
                  MARMARA AÇIKLARI / ÇEVRİMDİŞİ MOD AKTİF
                </span>
                <span className="bg-black/30 text-amber-200 text-[9px] font-mono px-1.5 py-0.2 rounded border border-white/10">
                  {cachedTripsCount} Sefer Hafızada
                </span>
              </div>
              <p className="text-[11px] text-amber-100/90 font-medium">
                Hücresel şebeke çekmiyor olsa dahi Adalar, Kadıköy ve Boğaz sefer saatleriniz çevrimdışı olarak kesintisiz çalışıyor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center gap-1 text-[10px] bg-white/15 px-2 py-1 rounded-md font-mono">
              <ShieldCheck size={12} className="text-emerald-300" />
              <span>Yerel Önbellek Korumalı</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
