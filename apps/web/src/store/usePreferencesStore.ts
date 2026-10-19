"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontScale = "normal" | "large";
export type ScheduleCategory = "ADALAR" | "BOGAZ" | "ALL";

interface PreferencesState {
  fontScale: FontScale;
  touristMode: boolean;
  proUnlocked: boolean;
  scheduleCategory: ScheduleCategory;
  /** Kullanıcı sefer iptali bildirimlerini açık tutmak istiyor mu (tarayıcı izninden bağımsız tercih) */
  notificationsEnabled: boolean;
  setFontScale: (scale: FontScale) => void;
  setTouristMode: (enabled: boolean) => void;
  setProUnlocked: (unlocked: boolean) => void;
  setScheduleCategory: (category: ScheduleCategory) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      fontScale: "normal",
      touristMode: false,
      proUnlocked: false,
      scheduleCategory: "ADALAR",
      notificationsEnabled: false,
      setFontScale: (fontScale: FontScale) => set({ fontScale }),
      setTouristMode: (touristMode: boolean) => set({ touristMode }),
      setProUnlocked: (proUnlocked: boolean) => set({ proUnlocked }),
      setScheduleCategory: (scheduleCategory: ScheduleCategory) => set({ scheduleCategory }),
      setNotificationsEnabled: (notificationsEnabled: boolean) => set({ notificationsEnabled }),
    }),
    {
      name: "vapur_app_prefs_v1",
    }
  )
);
