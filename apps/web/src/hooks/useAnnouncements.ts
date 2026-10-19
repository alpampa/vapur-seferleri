"use client";

import { useEffect } from "react";
import { useAnnouncementStore } from "@/store/useAnnouncementStore";

/**
 * Duyuru + bozulma verisini /api/announcements üzerinden yükler.
 * - Canlı senkron (23:00 ajanı) depoya işler → endpoint en güncel veriyi döner.
 * - Başarısızsa sessizce son yüklü değeri korur (uygulama bozulmaz).
 */
/** KULLANICI KURALI: yeni iptal en geç bir dakika içinde ekrana yansır. */
export function useAnnouncements(refreshMs = 60 * 1000) {
  const { setData, setLoading, setError } = useAnnouncementStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/announcements", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        setData({
          announcements: Array.isArray(json.announcements) ? json.announcements : [],
          disruptions: Array.isArray(json.disruptions) ? json.disruptions : [],
          sourceHealth: Array.isArray(json.sourceHealth) ? json.sourceHealth : [],
          recentChanges: Array.isArray(json.recentChanges) ? json.recentChanges : [],
        });
        setError(null);
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Duyuru alınamadı");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMs]);

  return useAnnouncementStore();
}
