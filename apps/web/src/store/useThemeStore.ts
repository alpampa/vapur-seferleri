"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppTheme = "dark" | "light";

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light", // Default to fresh daytime mode, user can toggle to dark anytime
      setTheme: (theme: AppTheme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        get().setTheme(next);
      }
    }),
    {
      name: "vapur_app_theme_v1",
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          if (state.theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      }
    }
  )
);
