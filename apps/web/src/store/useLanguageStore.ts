"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppLanguage = "tr" | "en";

export const DICTIONARY = {
  tr: {
    adalarLines: "Adalar Hatları",
    bogazLines: "Boğaz Hatları",
    allLines: "Tümü",
    searchPlaceholder: "İskele veya hat ara...",
    howToGo: "Nasıl Giderim?",
    map: "Harita",
    nearestPier: "En Yakın İskele",
    locating: "Aranıyor...",
    lastCall: "Son Çağrı (≤ 15 dk)",
    departed: "GİTTİ",
    countdownPrefix: "⏳",
    activeTrips: "Aktif Sefer",
    swap: "Çevir",
    allRoutes: "TÜMÜ",
    viewCompact: "Kompakt",
    viewComfort: "Geniş",
    dayMode: "Gündüz",
    nightMode: "Gece",
    close: "Kapat",
    direct: "Direkt Sefer",
    stops: "durak",
    vessel: "Gemi",
    preparingAtPier: "İskelede Hazırlanıyor",
    underway: "seyirde",
    radarTitle: "CANLI DENİZ RADARI (AIS)",
    radarSub: "Vapurların anlık telsiz ve rota takibi",
    cameraTitle: "İBB CANLI KAMERA",
    cameraSub: "İskele yoğunluğu ve deniz canlı yayını",
    routeTimeline: "MARMARAY / METRO STİLİ GÜZERGAH İLERLEMESİ"
  },
  en: {
    adalarLines: "Princes' Islands",
    bogazLines: "Bosphorus Lines",
    allLines: "All Lines",
    searchPlaceholder: "Search pier or route...",
    howToGo: "Route Planner",
    map: "Map",
    nearestPier: "Nearest Pier",
    locating: "Locating...",
    lastCall: "Last Call (≤ 15 min)",
    departed: "DEPARTED",
    countdownPrefix: "⏳",
    activeTrips: "Active Trips",
    swap: "Swap",
    allRoutes: "ALL",
    viewCompact: "Compact",
    viewComfort: "Cards",
    dayMode: "Day",
    nightMode: "Night",
    close: "Close",
    direct: "Non-stop",
    stops: "stops",
    vessel: "Vessel",
    preparingAtPier: "Boarding at Pier",
    underway: "underway",
    radarTitle: "LIVE RADAR (AIS)",
    radarSub: "Real-time vessel radio & tracking",
    cameraTitle: "IBB LIVE WEBCAM",
    cameraSub: "Pier crowd & live sea webcams",
    routeTimeline: "METRO-STYLE ROUTE PROGRESSION"
  }
} as const;

interface LanguageState {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof DICTIONARY["tr"]) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "tr",
      setLanguage: (language: AppLanguage) => set({ language }),
      toggleLanguage: () => {
        const next = get().language === "tr" ? "en" : "tr";
        set({ language: next });
      },
      t: (key) => {
        const lang = get().language;
        return DICTIONARY[lang][key] || DICTIONARY["tr"][key] || (key as string);
      }
    }),
    {
      name: "vapur_app_lang_v1"
    }
  )
);
