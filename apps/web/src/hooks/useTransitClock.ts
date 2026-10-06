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
}

/**
 * Global Singleton Transit Clock
 * Replaces 100+ separate setIntervals across voyage cards with a single centralized ticker.
 * Pauses background execution when tab is hidden (Page Visibility API) to conserve mobile battery.
 */
export function useTransitClock(intervalMs: number = 1000, options: TransitClockOptions = {}): TransitClockState {
  const [clock, setClock] = useState<TransitClockState>(() => {
    const now = new Date();
    return {
      nowMs: now.getTime(),
      timeStr: now.toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
      dateStr: now.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", weekday: "short", day: "numeric", month: "short" }),
      isTabVisible: typeof document !== "undefined" ? !document.hidden : true,
    };
  });

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    const tick = () => {
      const now = new Date();
      setClock({
        nowMs: now.getTime(),
        timeStr: now.toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
        dateStr: now.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", weekday: "short", day: "numeric", month: "short" }),
        isTabVisible: !document.hidden,
      });
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
        // (arka planda da çalışması gereken servisler için keepTickingWhenHidden)
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      }
    };

    timerId = setInterval(tick, intervalMs);
    // Y4: mount ve kademe geçişinde saati anında senkronla — setInterval'in ilk
    // atışını beklemeden güncel zaman (yavaş kademeden hızlıya geçişte kritik).
    tick();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerId) clearInterval(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs, options.keepTickingWhenHidden]);

  return clock;
}
