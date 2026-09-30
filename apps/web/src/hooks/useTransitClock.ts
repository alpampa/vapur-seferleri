"use client";

import { useState, useEffect } from "react";

export interface TransitClockState {
  nowMs: number;
  timeStr: string;
  dateStr: string;
  isTabVisible: boolean;
}

/**
 * Global Singleton Transit Clock
 * Replaces 100+ separate setIntervals across voyage cards with a single centralized ticker.
 * Pauses background execution when tab is hidden (Page Visibility API) to conserve mobile battery.
 */
export function useTransitClock(intervalMs: number = 1000): TransitClockState {
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
      } else {
        // Tab hidden: clear interval to save battery and memory
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      }
    };

    timerId = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerId) clearInterval(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs]);

  return clock;
}
