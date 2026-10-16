"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontScale = "normal" | "large";

interface PreferencesState {
  fontScale: FontScale;
  touristMode: boolean;
  proUnlocked: boolean;
  setFontScale: (scale: FontScale) => void;
  setTouristMode: (enabled: boolean) => void;
  setProUnlocked: (unlocked: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      fontScale: "normal",
      touristMode: false,
      proUnlocked: false,
      setFontScale: (fontScale: FontScale) => set({ fontScale }),
      setTouristMode: (touristMode: boolean) => set({ touristMode }),
      setProUnlocked: (proUnlocked: boolean) => set({ proUnlocked }),
    }),
    {
      name: "vapur_app_prefs_v1",
    }
  )
);
