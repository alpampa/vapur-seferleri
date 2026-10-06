"use client";

import { useSyncExternalStore } from "react";

// Tarayıcı online/offline olaylarına abonelik (tek sefer kurulur)
function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOfflineSync() {
  // useSyncExternalStore: SSR'de sunucu anlık görüntüsü (true) kullanılır,
  // hydrasyon sonrası gerçek tarayıcı durumu yansır, gereksiz re-render yok.
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );

  return { isOnline };
}
