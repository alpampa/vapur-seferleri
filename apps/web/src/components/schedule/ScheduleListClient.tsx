"use client";

import { useState, useEffect, useMemo } from "react";
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
import { TripDetailsSheet } from "@/components/schedule/TripDetailsSheet";
import type { ScheduleCardDto } from "@/app/page";
import { Search, Navigation, ArrowLeftRight, Compass, MapPin, LayoutGrid, List, WifiOff, Footprints, Waves, Landmark, Tag, Sparkles, X, RotateCcw } from "lucide-react";
import { matchesTurkishSearch } from "@/lib/utils/search-normalizer";
import { AdalarHeritageModal } from "@/components/adalar/AdalarHeritageModal";
import { SponsoredDealsModal } from "@/components/commercial/SponsoredDealsModal";
import { MarineWeatherBanner } from "@/components/weather/MarineWeatherBanner";
import type { MarineWeatherStatus } from "@/lib/services/marine-weather";
import { resolveDynamicTrip } from "@/lib/utils/dynamic-trip";
import { AlarmManager } from "@/components/schedule/AlarmManager";
import { TripPlannerWithMap } from "@/components/planner/TripPlannerWithMap";
import { LastFerryAlert } from "@/components/schedule/LastFerryAlert";
import { FavoritesWidget } from "@/components/schedule/FavoritesWidget";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { MarineWeatherHUD } from "@/components/weather/MarineWeatherHUD";
import { CatchFerryAssistant } from "@/components/planner/CatchFerryAssistant";
import { LiveTripTrackerBar } from "@/components/schedule/LiveTripTrackerBar";

// Istanbul Ferry Pier Coordinates (Latitude, Longitude)
const PIER_COORDINATES: Record<string, { lat: number; lng: number; label: string }> = {
  "Bostancı": { lat: 40.9525, lng: 29.0944, label: "Bostancı İskelesi" },
  "Kabataş": { lat: 41.0347, lng: 28.9903, label: "Kabataş İskelesi" },
  "Kadıköy": { lat: 40.9908, lng: 29.0225, label: "Kadıköy İskelesi" },
  "Kartal": { lat: 40.8872, lng: 29.1864, label: "Kartal İskelesi" },
  "Büyükada": { lat: 40.8744, lng: 29.1283, label: "Büyükada İskelesi" },
  "Heybeliada": { lat: 40.8767, lng: 29.0992, label: "Heybeliada İskelesi" },
  "Burgazada": { lat: 40.8817, lng: 29.0700, label: "Burgazada İskelesi" },
  "Kınalıada": { lat: 40.9103, lng: 29.0522, label: "Kınalıada İskelesi" },
  "Eminönü": { lat: 41.0186, lng: 28.9739, label: "Eminönü İskelesi" },
  "Beşiktaş": { lat: 41.0422, lng: 29.0067, label: "Beşiktaş İskelesi" },
  "Üsküdar": { lat: 41.0267, lng: 29.0152, label: "Üsküdar İskelesi" },
  "Karaköy": { lat: 41.0222, lng: 28.9772, label: "Karaköy İskelesi" },
  "Yenikapı": { lat: 41.0028, lng: 28.9567, label: "Yenikapı İDO Terminali" },
  "Bakırköy": { lat: 40.9722, lng: 28.8753, label: "Bakırköy İDO İskelesi" },
  "Maltepe": { lat: 40.9231, lng: 29.1306, label: "Maltepe İskelesi" }
};

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface ScheduleListClientProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
  marineWeather?: MarineWeatherStatus | null;
  initialOrigin?: string;
}

export function ScheduleListClient({ schedules, serverTimeIso, marineWeather, initialOrigin }: ScheduleListClientProps) {
  const { t, language } = useLanguageStore();

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleCardDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"ADALAR" | "BOGAZ" | "ALL">("ADALAR");
  const [now, setNow] = useState(Date.now());
  const [selectedRoute, setSelectedRoute] = useState<string>("ALL");
  const [selectedOrigin, setSelectedOrigin] = useState<string>(initialOrigin || "ALL");
  const [selectedOperator, setSelectedOperator] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPlanner, setShowPlanner] = useState<boolean>(false);
  const [onlyImminent, setOnlyImminent] = useState<boolean>(false);
  const [isCompactDensity, setIsCompactDensity] = useState<boolean>(false);
  const { isOnline } = useOfflineSync();
  const [showMarineHUD, setShowMarineHUD] = useState<boolean>(false);
  const [showCatchAssistant, setShowCatchAssistant] = useState<boolean>(false);
  const [isAdalarModalOpen, setIsAdalarModalOpen] = useState<boolean>(false);
  const [isSponsoredModalOpen, setIsSponsoredModalOpen] = useState<boolean>(false);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(true);

  // Offline LocalStorage Caching
  const [effectiveSchedules, setEffectiveSchedules] = useState<ScheduleCardDto[]>(schedules);

  useEffect(() => {
    if (schedules && schedules.length > 0) {
      setEffectiveSchedules(schedules);
      try {
        localStorage.setItem("vapur_schedules_cache_v1", JSON.stringify(schedules));
      } catch (e) {}
    } else {
      try {
        const cached = localStorage.getItem("vapur_schedules_cache_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEffectiveSchedules(parsed);
          }
        }
      } catch (e) {}
    }
  }, [schedules]);

  // Clean initial search query
  useEffect(() => {
    setSearchQuery("");
  }, []);

  // Geolocation states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestPier, setNearestPier] = useState<{ name: string; distanceKm: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"IDLE" | "LOCATING" | "ACTIVE" | "DENIED">("IDLE");

  // Reactive tick every 1000ms
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("DENIED");
      return;
    }

    setGeoStatus("LOCATING");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setUserLocation({ lat: uLat, lng: uLng });

        let closest: { name: string; distanceKm: number } | null = null;
        let minDistance = Infinity;

        for (const [pierName, coords] of Object.entries(PIER_COORDINATES)) {
          const dist = calculateDistanceKm(uLat, uLng, coords.lat, coords.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = { name: pierName, distanceKm: dist };
          }
        }

        if (closest) {
          setNearestPier(closest);
          setSelectedOrigin(closest.name);
          setSelectedRoute("ALL");
          setGeoStatus("ACTIVE");
        }
      },
      (error) => {
        console.warn("Geolocation denied or error:", error.message);
        setGeoStatus("DENIED");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 1. Filter and resolve dynamic state for active trips
  const activeSchedulesWithDyn = useMemo(() => {
    return effectiveSchedules
      .filter((s) => {
        // GLOBAL ARAMA: Kullanıcı bir arama terimi yazdığında kategori kilidi kalkar, tüm İstanbul taranır
        if (searchQuery.trim().length > 0) return true;
        if (selectedCategory === "ALL") return true;
        const cat = s.category || (
          s.destination.toLowerCase().includes('ada') ||
          s.origin.toLowerCase().includes('ada') ||
          s.destination === 'Büyükada' ||
          s.origin === 'Büyükada'
            ? 'ADALAR'
            : 'BOGAZ'
        );
        return cat === selectedCategory;
      })
      .map((s) => {
        const dyn = resolveDynamicTrip(
          s.origin,
          s.destination,
          s.departureTime,
          s.targetTimeIso || new Date().toISOString(),
          s.stops,
          undefined,
          now,
          serverTimeIso
        );
        return {
          schedule: s,
          dyn
        };
      })
      .filter(({ dyn }) => !dyn.isExpired);
  }, [effectiveSchedules, selectedCategory, now, serverTimeIso]);

  // Compute unique routes
  const uniqueRoutes = useMemo(() => {
    const routesSet = new Set<string>();
    activeSchedulesWithDyn.forEach(({ schedule }) => {
      routesSet.add(`${schedule.origin} ➔ ${schedule.destination}`);
    });
    return Array.from(routesSet);
  }, [activeSchedulesWithDyn]);

  const uniqueOperators = useMemo(() => {
    const ops = new Set<string>();
    activeSchedulesWithDyn.forEach(({ schedule }) => ops.add(schedule.operator));
    return Array.from(ops);
  }, [activeSchedulesWithDyn]);

  const swapDirection = () => {
    if (selectedRoute === "ALL") return;
    const parts = selectedRoute.split(" ➔ ");
    if (parts.length === 2) {
      const swapped = `${parts[1]} ➔ ${parts[0]}`;
      const exists = uniqueRoutes.includes(swapped);
      if (exists) {
        setSelectedRoute(swapped);
      } else {
        setSelectedOrigin(parts[1]);
        setSelectedRoute("ALL");
      }
    }
  };

  // Final filtered list - KULLANICI KURALI: En üstte yer alacak ilk sefer (kesin kronolojik sıralama)
  const filteredList = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;
    const q = searchQuery.toLowerCase().trim();

    return activeSchedulesWithDyn.filter(({ schedule, dyn }) => {
      // GLOBAL VE TÜRKÇE KARAKTERE DUYARLI ARAMA (İ/I/ı/i, ş/s, ç/c, ğ/g, ü/u, ö/o tam uyumlu)
      if (hasSearch) {
        const inOrigin = matchesTurkishSearch(schedule.origin, q) || matchesTurkishSearch(dyn.currentOrigin, q);
        const inDest = matchesTurkishSearch(schedule.destination, q);
        const inOperator = matchesTurkishSearch(schedule.operator, q);
        const inRoute = matchesTurkishSearch(schedule.routeTitle, q);
        const inStops = schedule.stops?.some((st) => matchesTurkishSearch(st.name, q));
        if (!inOrigin && !inDest && !inOperator && !inRoute && !inStops) return false;
      } else {
        if (selectedOrigin !== "ALL") {
          const matchesOrigin = schedule.origin === selectedOrigin || dyn.currentOrigin === selectedOrigin;
          if (!matchesOrigin) return false;
        }

        if (selectedRoute !== "ALL") {
          const matchesOriginal = `${schedule.origin} ➔ ${schedule.destination}` === selectedRoute;
          const matchesDynamic = `${dyn.currentOrigin} ➔ ${dyn.destination}` === selectedRoute;
          if (!matchesOriginal && !matchesDynamic) return false;
        }

        if (selectedOperator !== "ALL") {
          if (schedule.operator !== selectedOperator) return false;
        }
      }

      if (onlyImminent) {
        if (dyn.isDeparted) return false;
        const isImminent = dyn.status === "BOARDING" || (
          dyn.countdown ? (
            dyn.countdown.startsWith("00:") || 
            parseInt(dyn.countdown.split(":")[0], 10) <= 15
          ) : false
        );
        if (!isImminent) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.dyn.isDeparted !== b.dyn.isDeparted) {
        return a.dyn.isDeparted ? 1 : -1;
      }
      return a.dyn.currentDepartureTime.localeCompare(b.dyn.currentDepartureTime);
    });
  }, [activeSchedulesWithDyn, selectedOrigin, selectedRoute, selectedOperator, searchQuery, onlyImminent]);

  // İptal Seferler Algoritması (Kullanıcı Kuralı: Kayan bantta ve kartlarda gösterim)
  const cancelledTrips = useMemo(() => {
    return activeSchedulesWithDyn.filter(
      ({ schedule, dyn }) => schedule.status === "CANCELLED" || dyn.status === "CANCELLED" || (Boolean(schedule.delayText) && schedule.delayText!.toLowerCase().includes("iptal"))
    );
  }, [activeSchedulesWithDyn]);

  return (
    <>
      <AlarmManager schedules={effectiveSchedules} />

      {/* 1. ÜST KONTROL BARI (TEK VE KOMPAKT SATIR): Kategori + Hızlı Eylemler */}
      <div className="px-3 pt-2">
        <div className="flex items-center justify-between gap-1.5 p-1 bg-slate-200/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs transition-colors">
          {/* Sol Kısım: 3 Ana Kategori (Adalar, Boğaz, Tümü) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSelectedCategory("ADALAR");
                setSelectedRoute("ALL");
                setSelectedOrigin("ALL");
              }}
              className={`py-1 px-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                selectedCategory === "ADALAR"
                  ? "bg-amber-400 text-slate-950 shadow-xs scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>🏝️</span>
              <span>{t("adalarLines")}</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory("BOGAZ");
                setSelectedRoute("ALL");
                setSelectedOrigin("ALL");
              }}
              className={`py-1 px-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                selectedCategory === "BOGAZ"
                  ? "bg-blue-600 text-white shadow-xs scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>🌊</span>
              <span>{t("bogazLines")}</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedRoute("ALL");
                setSelectedOrigin("ALL");
              }}
              className={`py-1 px-2 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-slate-800 dark:bg-slate-700 text-white shadow-xs scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>⚓</span>
              <span>{t("allLines")}</span>
            </button>
          </div>

          {/* Sağ Kısım: Kompakt Hızlı Araçlar */}
          <div className="flex items-center gap-1">
            {/* Arama Aç/Kapat Butonu */}
            <button
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                isSearchVisible || searchQuery.trim().length > 0
                  ? "bg-blue-600 text-white border-blue-500 shadow-2xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100"
              }`}
              title="İskele veya Hat Ara"
            >
              <Search size={12} />
              <span className="hidden sm:inline">Ara</span>
            </button>

            {/* Son 15 Dakika (Last Call) */}
            <button
              onClick={() => setOnlyImminent(!onlyImminent)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                onlyImminent
                  ? "bg-amber-400 text-slate-950 border-amber-400 shadow-2xs font-black"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100"
              }`}
              title="Kalkışına 15 dk veya daha az kalanlar"
            >
              <span className="text-amber-500">⚡</span>
              <span className="hidden sm:inline">≤15 dk</span>
            </button>

            {/* Harita / Nasıl Giderim Toggle */}
            <button
              onClick={() => setShowPlanner(!showPlanner)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                showPlanner
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-2xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100"
              }`}
              title="Harita ve Rota Planlayıcı"
            >
              <Compass size={12} />
              <span className="hidden sm:inline">Harita</span>
            </button>

            {/* En Yakın İskele */}
            <button
              onClick={requestLocation}
              disabled={geoStatus === "LOCATING"}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                geoStatus === "ACTIVE"
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100"
              }`}
              title="Konumuma En Yakın İskele"
            >
              <Navigation size={12} className={geoStatus === "ACTIVE" ? "text-white" : "text-blue-500"} />
              <span className="hidden sm:inline">
                {geoStatus === "LOCATING" ? "..." : geoStatus === "ACTIVE" && nearestPier ? nearestPier.name : "Yakın"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SATIR: KOMPAKT GÜZERGAH VE OPERATÖR FİLTRE ÇİPLERİ */}
      <div className="px-3 pt-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {/* Tümü Butonu */}
          <button
            onClick={() => {
              setSelectedRoute("ALL");
              setSelectedOrigin("ALL");
              setOnlyImminent(false);
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-black whitespace-nowrap transition-all shrink-0 ${
              selectedRoute === "ALL" && selectedOrigin === "ALL" && !onlyImminent
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800"
            }`}
          >
            {t("allRoutes")} ({activeSchedulesWithDyn.length})
          </button>

          {/* Gidiş-Dönüş Yön Değiştir */}
          {selectedRoute !== "ALL" && (
            <button
              onClick={swapDirection}
              title="Gidiş-Dönüş Değiştir"
              className="px-2 py-1 bg-amber-500 text-slate-950 rounded-md text-[11px] font-black flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
            >
              <ArrowLeftRight size={12} />
              <span>{t("swap")}</span>
            </button>
          )}

          {/* Dinamik Hat Hapları */}
          {uniqueRoutes.slice(0, 10).map((routeKey) => {
            const count = activeSchedulesWithDyn.filter(({ schedule }) => `${schedule.origin} ➔ ${schedule.destination}` === routeKey).length;
            const isSelected = selectedRoute === routeKey;
            return (
              <button
                key={routeKey}
                onClick={() => {
                  setSelectedRoute(isSelected ? "ALL" : routeKey);
                  setSelectedOrigin("ALL");
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 border cursor-pointer ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 font-black shadow-2xs border-amber-400"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800"
                }`}
              >
                <span>{routeKey}</span>
                <span className={`text-[9px] px-1 rounded-full font-bold ${
                  isSelected ? "bg-black/20 text-slate-950" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* Operatörler */}
          <span className="text-slate-400 dark:text-slate-700 font-bold px-0.5 shrink-0">|</span>
          {uniqueOperators.map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOperator(selectedOperator === op ? "ALL" : op)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1 border cursor-pointer ${
                selectedOperator === op
                  ? "bg-slate-100 dark:bg-slate-800 border-blue-500 text-slate-950 dark:text-white shadow-2xs ring-1 ring-blue-400/40"
                  : "bg-white dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <OperatorLogo operator={op} size="sm" showName={true} />
            </button>
          ))}
        </div>
      </div>

      {/* 3. İSTEĞE BAĞLI SATIR: ARAMA ÇUBUĞU (Kullanıcı İstediğinde Açılır, Ekranı Boğmaz) */}
      {isSearchVisible && (
        <div className="px-3 pt-1.5 space-y-1 animate-fadeIn">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              placeholder="İskele, hat veya vapur adı yazın (Örn: Kadıköy, Bostancı, Büyükada, Paşabahçe)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-rose-500 p-1"
                title="Temizle"
              >
                ✕
              </button>
            )}
          </div>

          {/* Hızlı İskele Seçim Hapları */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 hide-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap pl-0.5">
              Hızlı:
            </span>
            {["Kadıköy", "Bostancı", "Büyükada", "Heybeliada", "Eminönü", "Karaköy", "Beşiktaş", "Kabataş"].map((pier) => (
              <button
                key={pier}
                onClick={() => setSearchQuery(searchQuery === pier ? "" : pier)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                  searchQuery.toLowerCase().includes(pier.toLowerCase())
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                }`}
              >
                {pier}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. KULLANICI KURALI: KAYAN İPTAL SEFERLER DUYURU BANTI (Marquee Ticker) */}
      {cancelledTrips.length > 0 && (
        <div className="px-3 pt-1.5 animate-fadeIn">
          <div className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-sm flex items-center gap-2 overflow-hidden border border-rose-500">
            <div className="flex items-center gap-1.5 shrink-0 bg-black/40 px-2 py-0.5 rounded-lg font-black text-[10px] tracking-wider uppercase border border-rose-400/50">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>İPTAL SEFERLER</span>
            </div>
            
            <div className="overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center gap-4 text-xs font-bold">
              {cancelledTrips.map(({ schedule, dyn }, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-md">
                  <span>🔴 {schedule.origin} ➔ {schedule.destination}</span>
                  <span className="font-mono">{dyn.currentDepartureTime}</span>
                  <span className="text-amber-200">/ İPTAL ({schedule.delayText || "Lodos / Fırtına"})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Genişletilmiş Harita Planlayıcı (Açıldığında Görünür) */}
      {showPlanner && (
        <div className="px-3 pt-2 animate-fadeIn">
          <TripPlannerWithMap
            schedules={effectiveSchedules}
            serverTimeIso={serverTimeIso}
            onClose={() => setShowPlanner(false)}
          />
        </div>
      )}

      {/* Sonuç Başlığı & Yoğunluk Seçici */}
      <div className="px-3 pt-2 pb-1 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-[11px]">
            {t("activeTrips")}: <strong className="text-slate-900 dark:text-white text-xs">{filteredList.length}</strong>
          </span>

          <button
            onClick={() => setIsCompactDensity(!isCompactDensity)}
            title={isCompactDensity ? "Geniş Kart Görünümü" : "Kompakt Liste Görünümü"}
            className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            {isCompactDensity ? <LayoutGrid size={11} /> : <List size={11} />}
            <span className="hidden xs:inline">{isCompactDensity ? t("viewComfort") : t("viewCompact")}</span>
          </button>
        </div>

        {searchQuery.trim().length > 0 ? (
          <span className="text-blue-700 dark:text-blue-300 font-extrabold bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-500/30 px-2 py-0.5 rounded text-[11px]">
            🔍 {filteredList.length} Sefer Bulundu
          </span>
        ) : selectedRoute !== "ALL" ? (
          <span className="text-amber-700 dark:text-amber-300 font-extrabold bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/30 px-2 py-0.5 rounded text-[11px]">
            {selectedRoute}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
            Detay için sefere dokunun
          </span>
        )}
      </div>

      {/* Schedules List (Comfortable or Compact Rows) */}
      <div className={`px-3 flex flex-col ${isCompactDensity ? "gap-1.5" : "gap-2"} pb-12 mt-1`}>
        {filteredList.length > 0 ? (
          filteredList.map(({ schedule }) => (
            <ScheduleCard
              key={schedule.id}
              id={schedule.id}
              origin={schedule.origin}
              destination={schedule.destination}
              operator={schedule.operator}
              routeTitle={schedule.routeTitle}
              departureTime={schedule.departureTime}
              departureTime12={schedule.departureTime12}
              status={schedule.status}
              targetTimeIso={schedule.targetTimeIso}
              serverTimeIso={serverTimeIso}
              delayText={schedule.delayText}
              vessel={schedule.vessel}
              platform={schedule.platform}
              price={schedule.price}
              progress={schedule.progress}
              stops={schedule.stops}
              arrivalTime={schedule.arrivalTime}
              isCompact={isCompactDensity}
              onClick={() => setSelectedSchedule(schedule)}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="text-3xl">⚓</div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {searchQuery.trim().length > 0
                ? `\"${searchQuery}\" aramasıyla eşleşen aktif vapur seferi bulunamadı.`
                : language === "en" ? "No scheduled trips found matching your filters." : "Seçtiğiniz kriterlere uygun aktif sefer bulunamadı."}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              İskele adını kontrol edebilir veya filtreleri sıfırlayarak güncel tüm Boğaz ve Adalar seferlerini görebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRoute("ALL");
                setSelectedOrigin("ALL");
                setSelectedCategory("ALL");
                setSelectedOperator("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Filtreleri Sıfırla ve Tüm Seferleri Göster</span>
            </button>
          </div>
        )}
      </div>

      {/* Persistent Live Activity Bar (Sticky Bottom) */}
      <LiveTripTrackerBar />

      {/* Bottom Sheet for Trip Details with AIS Live Radar & IBB Pier Camera */}
      <TripDetailsSheet
        schedule={selectedSchedule}
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        serverTimeIso={serverTimeIso}
      />

      {/* Adalar Tarihi Miras & Ulaşım Rehberi Modalı */}
      <AdalarHeritageModal
        isOpen={isAdalarModalOpen}
        onClose={() => setIsAdalarModalOpen(false)}
        onSelectIslandFilter={(islandName) => {
          setSelectedCategory("ADALAR");
          setSearchQuery(islandName);
        }}
      />

      {/* İskele Ayrıcalıkları & Ticari Sponsorluk Modalı */}
      <SponsoredDealsModal
        isOpen={isSponsoredModalOpen}
        onClose={() => setIsSponsoredModalOpen(false)}
      />
    </>
  );
}
