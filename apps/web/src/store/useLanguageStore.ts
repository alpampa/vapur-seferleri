"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppLanguage = "tr" | "en" | "de" | "ar" | "ru";

export interface LanguageMeta {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "tr", name: "Türkçe", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" }
];

export const DICTIONARY = {
  tr: {
    adalarLines: "Adalar Hatları",
    bogazLines: "Boğaz Hatları",
    allLines: "Tüm Hatlar",
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
    routeTimeline: "MARMARAY / METRO STİLİ GÜZERGAH İLERLEMESİ",
    themesTitle: "TEMALAR",
    audioGuide: "Sesli Rehber",
    wallet: "İstanbulkart",
    cockpit: "Gemi Kokpiti",
    missedFerry: "Vapuru Kaçırdım"
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
    routeTimeline: "METRO-STYLE ROUTE PROGRESSION",
    themesTitle: "THEMES",
    audioGuide: "Audio Guide",
    wallet: "Transit Pass",
    cockpit: "Cockpit",
    missedFerry: "Missed Ferry"
  },
  de: {
    adalarLines: "Prinzeninseln",
    bogazLines: "Bosporus-Linien",
    allLines: "Alle Linien",
    searchPlaceholder: "Anleger oder Route suchen...",
    howToGo: "Routenplaner",
    map: "Karte",
    nearestPier: "Nächster Anleger",
    locating: "Standort wird ermittelt...",
    lastCall: "Letzter Aufruf (≤ 15 min)",
    departed: "ABGEFAHREN",
    countdownPrefix: "⏳",
    activeTrips: "Aktive Fahrten",
    swap: "Richtung tauschen",
    allRoutes: "ALLE",
    viewCompact: "Kompakt",
    viewComfort: "Karten",
    dayMode: "Tag",
    nightMode: "Nacht",
    close: "Schließen",
    direct: "Direktfahrt",
    stops: "Haltestellen",
    vessel: "Schiff",
    preparingAtPier: "Am Anleger / Einstieg",
    underway: "unterwegs",
    radarTitle: "LIVE-RADAR (AIS)",
    radarSub: "Echtzeit-Schiffsfunk & Positionsverfolgung",
    cameraTitle: "LIVE-WEBCAM",
    cameraSub: "Anleger-Webcams und Seeblick",
    routeTimeline: "METRO-STIL ROUTENVERLAUF",
    themesTitle: "DESIGNS",
    audioGuide: "Audioguide",
    wallet: "Istanbulkart",
    cockpit: "Schiffscockpit",
    missedFerry: "Fähre verpasst"
  },
  ar: {
    adalarLines: "خطوط جزر الأميرات",
    bogazLines: "خطوط البوسفور",
    allLines: "جميع الخطوط",
    searchPlaceholder: "ابحث عن رصيف أو خط...",
    howToGo: "مخطط الرحلة",
    map: "الخريطة",
    nearestPier: "أقرب رصيف",
    locating: "جارٍ تحديد الموقع...",
    lastCall: "النداء الأخير (≤ 15 دقيقة)",
    departed: "غادرت",
    countdownPrefix: "⏳",
    activeTrips: "رحلات نشطة",
    swap: "تبديل الاتجاه",
    allRoutes: "الكل",
    viewCompact: "مضغوط",
    viewComfort: "بطاقات",
    dayMode: "نهاري",
    nightMode: "ليلي",
    close: "إغلاق",
    direct: "رحلة مباشرة",
    stops: "محطات",
    vessel: "السفينة",
    preparingAtPier: "تستعد في الرصيف",
    underway: "مبحرة",
    radarTitle: "رادار الملاحة المباشر (AIS)",
    radarSub: "تتبع لاسلكي لحظي للسفن في البوسفور",
    cameraTitle: "كاميرات المراقبة المباشرة",
    cameraSub: "ازدحام الأرصفة وبث البحر المباشر",
    routeTimeline: "مسار الرحلة على نمط المترو",
    themesTitle: "السمات",
    audioGuide: "الدليل الصوتي",
    wallet: "بطاقة إسطنبول",
    cockpit: "قمرة السفينة",
    missedFerry: "فاتتني العبارة"
  },
  ru: {
    adalarLines: "Принцевы острова",
    bogazLines: "Линии Босфора",
    allLines: "Все линии",
    searchPlaceholder: "Поиск причала или маршрута...",
    howToGo: "Маршрутизатор",
    map: "Карта",
    nearestPier: "Ближайший причал",
    locating: "Определение геопозиции...",
    lastCall: "Последняя посадка (≤ 15 мин)",
    departed: "ОТПЛЫЛ",
    countdownPrefix: "⏳",
    activeTrips: "Активные рейсы",
    swap: "Поменять направление",
    allRoutes: "ВСЕ",
    viewCompact: "Компактно",
    viewComfort: "Карточки",
    dayMode: "День",
    nightMode: "Ночь",
    close: "Закрыть",
    direct: "Прямой рейс",
    stops: "остановок",
    vessel: "Судно",
    preparingAtPier: "Посадка у причала",
    underway: "в пути",
    radarTitle: "ЖИВОЙ РАДАР (AIS)",
    radarSub: "Отслеживание паромов по радиосигналу AIS",
    cameraTitle: "ВЕБ-КАМЕРЫ ПРИЧАЛОВ",
    cameraSub: "Загруженность причалов и вид на море",
    routeTimeline: "ПРОГРЕСС МАРШРУТА",
    themesTitle: "ТЕМЫ",
    audioGuide: "Аудиогид",
    wallet: "Истанбулкарт",
    cockpit: "Кокпит судна",
    missedFerry: "Опоздал на паром"
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
        const order: AppLanguage[] = ["tr", "en", "de", "ar", "ru"];
        const curr = get().language;
        const nextIdx = (order.indexOf(curr) + 1) % order.length;
        set({ language: order[nextIdx] });
      },
      t: (key) => {
        const lang = get().language;
        const dict = DICTIONARY[lang] || DICTIONARY["tr"];
        return (dict as any)[key] || DICTIONARY["tr"][key] || (key as string);
      }
    }),
    {
      name: "vapur_app_lang_v2"
    }
  )
);
