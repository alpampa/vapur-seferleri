"use client";

import { useState, useEffect } from "react";

export interface TransitClockState {
  nowMs: number;
  timeStr: string;
  dateStr: string;
  isTabVisible: boolean;
}

export interface TransitClockOptions {
  /**
   * true: sekme arka plana alındığında tick devam eder.
   * Alarm/bildirim gibi arka planda da tetiklenmesi gereken servisler için
   * kullanılır (tarayıcı arka plan zamanlayıcı kısıtlamaları yine geçerlidir).
   */
  keepTickingWhenHidden?: boolean;
  /**
   * Sunucu zamanı referansı (ISO string). Cihaz saati kaymalarını telafi eder.
   * DİKKAT: PWA Service Worker ağ kesintisinde BAYAT bir HTML belgesi sunabilir;
   * o belgedeki eski serverTimeIso saati geriye kaydırıp kalkmış seferleri
   * diriltebilir. Bu yüzden bayat örnekler reddedilir ve saat canlı sunucu
   * zamanıyla (/api/version) periyodik olarak yeniden senkronlanır.
   */
  serverTimeIso?: string;
}

const LAST_SEEN_SERVER_MS_KEY = "vapur_last_server_ms";
const LIVE_SYNC_INTERVAL_MS = 5 * 60_000;
const SYNC_THROTTLE_MS = 15_000;
/**
 * Payload'daki sunucu saati cihaz saatinden bu toleranstan fazla gerideyse
 * belge bayattır: offset olarak ASLA kabul edilmez (saat geriye saramaz).
 * Tolerans, cihaz saati birkaç dakika ileri olan kullanıcıları da kapsar.
 */
const STALE_SEED_TOLERANCE_MS = 10 * 60_000;

/**
 * Modül düzeyinde tekil saat düzeltmesi: tüm hook örnekleri tek offset paylaşır.
 * Böylece canlı senkron tek bir istekle tüm bileşenleri anında düzeltir.
 */
let sharedOffsetMs: number | null = null;
let lastLiveSyncMs = 0;
let lastAttemptMs = 0;
let syncInFlight: Promise<void> | null = null;
const tickListeners = new Set<() => void>();

function readLastSeenServerMs(): number {
  try {
    return Number(localStorage.getItem(LAST_SEEN_SERVER_MS_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeLastSeenServerMs(ms: number): void {
  try {
    if (ms > readLastSeenServerMs()) {
      localStorage.setItem(LAST_SEEN_SERVER_MS_KEY, String(ms));
    }
  } catch {}
}

/**
 * Sunucudan gelen zaman örneğini offset'e çevirir.
 * İki koruma: (1) bu tarayıcıda görülen en yeni sunucu saatinden geride olan
 * örnek bayattır, (2) cihaz saatinden 10+ dk geride örnek bayat belgedir.
 * Bayat örnek reddedilir; saat geriye asla saramaz.
 */
function seedOffsetFromServerIso(serverTimeIso?: string): void {
  if (!serverTimeIso) return;
  const parsed = new Date(serverTimeIso).getTime();
  if (isNaN(parsed)) return;

  if (parsed < readLastSeenServerMs()) return;
  const delta = parsed - Date.now();
  if (delta < -STALE_SEED_TOLERANCE_MS) return;

  writeLastSeenServerMs(parsed);
  sharedOffsetMs = delta;
}

/**
 * Canlı sunucu zamanı senkronu (no-store). Başarısız olursa mevcut offset korunur.
 */
export function syncTransitClock(force: boolean = false): Promise<void> {
  if (syncInFlight) return syncInFlight;
  const attemptNow = Date.now();
  if (!force && attemptNow - lastAttemptMs < SYNC_THROTTLE_MS) return Promise.resolve();
  lastAttemptMs = attemptNow;

  syncInFlight = fetch("/api/version", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((json) => {
      const iso = json && typeof json.serverTime === "string" ? json.serverTime : null;
      const parsed = iso ? Date.parse(iso) : NaN;
      if (isNaN(parsed)) return;
      sharedOffsetMs = parsed - Date.now();
      lastLiveSyncMs = Date.now();
      writeLastSeenServerMs(parsed);
      tickListeners.forEach((tick) => tick());
    })
    .catch(() => {})
    .finally(() => {
      syncInFlight = null;
    });

  return syncInFlight;
}

/**
 * Global Singleton Transit Clock
 * Replaces 100+ separate setIntervals across voyage cards with a single centralized ticker.
 * Pauses background execution when tab is hidden (Page Visibility API) to conserve mobile battery.
 */
export function useTransitClock(intervalMs: number = 1000, options: TransitClockOptions = {}): TransitClockState {
  const [clock, setClock] = useState<TransitClockState>(() => {
    seedOffsetFromServerIso(options.serverTimeIso);
    const now = new Date(Date.now() + (sharedOffsetMs ?? 0));
    return {
      nowMs: now.getTime(),
      timeStr: now.toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
      dateStr: now.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", weekday: "short", day: "numeric", month: "short" }),
      isTabVisible: typeof document !== "undefined" ? !document.hidden : true,
    };
  });

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    seedOffsetFromServerIso(options.serverTimeIso);

    const tick = () => {
      const now = new Date(Date.now() + (sharedOffsetMs ?? 0));
      setClock({
        nowMs: now.getTime(),
        timeStr: now.toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
        dateStr: now.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", weekday: "short", day: "numeric", month: "short" }),
        isTabVisible: !document.hidden,
      });
      // Periyodik canlı senkron: bayat belge veya cihaz saati değişimini telafi eder
      if (Date.now() - lastLiveSyncMs > LIVE_SYNC_INTERVAL_MS) {
        void syncTransitClock();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible again: immediately sync clock and resume ticker
        tick();
        if (!timerId) {
          timerId = setInterval(tick, intervalMs);
        }
      } else if (!options.keepTickingWhenHidden) {
        // Tab hidden: clear interval to save battery and memory
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      }
    };

    // bfcache / tab restore: pageshow fires when iOS Safari restores a frozen page
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        tick();
        if (!timerId) {
          timerId = setInterval(tick, intervalMs);
        }
      }
    };

    tickListeners.add(tick);
    timerId = setInterval(tick, intervalMs);
    // Y4: mount ve kademe geçişinde saati anında senkronla — setInterval'in ilk
    // atışını beklemeden güncel zaman (yavaş kademeden hızlıya geçişte kritik).
    tick();
    // Sayfa açılışında canlı sunucu saatiyle hizala (bayat belge koruması)
    void syncTransitClock();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      tickListeners.delete(tick);
      if (timerId) clearInterval(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [intervalMs, options.keepTickingWhenHidden, options.serverTimeIso]);

  return clock;
}
