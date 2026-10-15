"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_THEME_ID, THEME_STORAGE_KEY } from "@/lib/theme-ids";

export type ThemePresetId =
  | "deep-navy"      // 1. Derin Boğaz & Lacivert (Bosphorus Midnight Navy)
  | "nordic-clean"   // 2. Modern İskandinav & Minimalist Beyaz (Nordic Porcelain)
  | "heritage-brass" // 3. Tarihi Vapur & Klasik Pirinç (Istanbul Heritage Nautical)
  | "cyber-radar"    // 4. Siber Deniz & OLED Siyah (Cyber Marine Phosphor)
  | "golden-hour"    // 5. Boğaz Gün Batımı & Altın Saat (Sunset Twilight)
  | "aegean-emerald" // 6. Ege & Kıyı Ferahlığı (Aegean Sea Emerald)
  | "sun-contrast";  // 7. Güneş Modu & Ultra Kontrast (Sunlight Legibility)

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  nameEn: string;
  description: string;
  previewColors: string[]; // 4 color swatches
  isDark: boolean;
  bgClass: string;
  cardBgClass: string;
  accentColor: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "deep-navy",
    name: "Derin Boğaz & Lacivert",
    nameEn: "Bosphorus Midnight Navy",
    description: "Uluslararası denizcilik standartlarında derin lacivert, parlak safir ve altın vurgular.",
    previewColors: ["#070e1e", "#0f172a", "#2563eb", "#f59e0b"],
    isDark: true,
    bgClass: "bg-[#070e1e]",
    cardBgClass: "bg-[#0f172a]",
    accentColor: "#2563eb"
  },
  {
    id: "nordic-clean",
    name: "Modern İskandinav Minimal",
    nameEn: "Nordic Porcelain Clean",
    description: "Apple ve İsviçre tipografi standartlarında porselen beyazı, jet siyah ve okyanus mavisi.",
    previewColors: ["#f8fafc", "#ffffff", "#0284c7", "#0f172a"],
    isDark: false,
    bgClass: "bg-[#f8fafc]",
    cardBgClass: "bg-white",
    accentColor: "#0284c7"
  },
  {
    id: "heritage-brass",
    name: "Tarihi Vapur & Pirinç",
    nameEn: "Istanbul Heritage Nautical",
    description: "Geleneksel Şehir Hatları meşesi, parlak pirinç aksamlar ve sıcak fildişi zarafeti.",
    previewColors: ["#faf7f2", "#f3ede2", "#b45309", "#0f766e"],
    isDark: false,
    bgClass: "bg-[#faf7f2]",
    cardBgClass: "bg-[#ffffff]",
    accentColor: "#b45309"
  },
  {
    id: "cyber-radar",
    name: "Siber Radar & OLED Siyah",
    nameEn: "Cyber Marine OLED Black",
    description: "Gerçek OLED siyahı, fosforlu zümrüt AIS gemi hedefleri ve neon telemetri göstergeleri.",
    previewColors: ["#000000", "#050914", "#10b981", "#06b6d4"],
    isDark: true,
    bgClass: "bg-black",
    cardBgClass: "bg-[#060b17]",
    accentColor: "#10b981"
  },
  {
    id: "golden-hour",
    name: "Boğaz Altın Saat & Gün Batımı",
    nameEn: "Golden Hour Sunset",
    description: "Tarihi Yarımada üzerinde batan güneşin kehribar, ametist ve gül tonları.",
    previewColors: ["#140d28", "#1e1338", "#f59e0b", "#f43f5e"],
    isDark: true,
    bgClass: "bg-[#140d28]",
    cardBgClass: "bg-[#1e1338]",
    accentColor: "#f59e0b"
  },
  {
    id: "aegean-emerald",
    name: "Ege & Kıyı Ferahlığı",
    nameEn: "Aegean Sea Emerald",
    description: "Akdeniz deniz köpüğü ferahlığı, çam ormanları yeşili ve turkuaz kıyı suları.",
    previewColors: ["#f0fdf4", "#ffffff", "#059669", "#0891b2"],
    isDark: false,
    bgClass: "bg-[#f0fdf4]",
    cardBgClass: "bg-white",
    accentColor: "#059669"
  },
  {
    id: "sun-contrast",
    name: "Güneş Modu & Ultra Kontrast",
    nameEn: "Sunlight Ultra Contrast",
    description: "Açık havada maksimum okunabilirlik: saf beyaz zemin, saf siyah metin ve koyu kenarlıklar. İskele güneşinde telefonu zorlamadan okumak için.",
    previewColors: ["#ffffff", "#ffffff", "#000000", "#0040c8"],
    isDark: false,
    bgClass: "bg-white",
    cardBgClass: "bg-white",
    accentColor: "#0040c8"
  }
];

interface ThemeStoreState {
  theme: ThemePresetId;
  setTheme: (theme: ThemePresetId) => void;
  currentPreset: () => ThemePreset;
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME_ID,
      setTheme: (themeId: ThemePresetId) => {
        set({ theme: themeId });
        if (typeof document !== "undefined") {
          const preset = THEME_PRESETS.find(p => p.id === themeId) || THEME_PRESETS[0];
          document.documentElement.setAttribute("data-theme", themeId);
          if (preset.isDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      },
      currentPreset: () => {
        const themeId = get().theme;
        return THEME_PRESETS.find(p => p.id === themeId) || THEME_PRESETS[0];
      }
    }),
    {
      name: THEME_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          const preset = THEME_PRESETS.find(p => p.id === state.theme) || THEME_PRESETS[0];
          document.documentElement.setAttribute("data-theme", state.theme);
          if (preset.isDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      }
    }
  )
);
