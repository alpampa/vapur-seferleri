"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function ServiceWorkerRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Vapur ServiceWorker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.warn("Vapur ServiceWorker registration failed:", err);
          });
      });
    }

    // 2. Online/Offline Listener
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="bg-amber-600 text-white px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md sticky top-0 z-50">
        <WifiOff size={14} className="animate-pulse" />
        <span>Çevrimdışı Mod — İnternet bağlantısı yok, tarifeler cihazınızın hafızasından çalışıyor.</span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md sticky top-0 z-50 animate-fadeIn">
        <Wifi size={14} />
        <span>İnternet bağlantısı yeniden kuruldu. Veriler senkronize edildi.</span>
      </div>
    );
  }

  return null;
}
