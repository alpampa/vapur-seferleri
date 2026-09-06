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

  return (
    <>
      <AlarmManager schedules={effectiveSchedules} />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="px-3 pt-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-between gap-2 shadow-xs">
            <span className="flex items-center gap-2">
              <WifiOff size={15} className="shrink-0 text-amber-500" />
              <span>
                {language === "en" 
                  ? "Offline Mode: Showing cached ferry timetables." 
                  : "Çevrimdışı Mod: Kaydedilmiş vapur seferleri gösteriliyor."}
              </span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 font-mono font-bold shrink-0">OFFLINE</span>
          </div>
        </div>
      )}

      {/* Marine Weather Report (Discreet 1-line chip or alert if storm) */}
      <MarineWeatherBanner weather={marineWeather} />

      {/* Category Segmented Switcher: Adalar vs Boğaz vs Tümü */}
      <div className="px-3 pt-2">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs transition-colors">
          <button
            onClick={() => {
              setSelectedCategory("ADALAR");
              setSelectedRoute("ALL");
              setSelectedOrigin("ALL");
            }}
            className={`py-1.5 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
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
            className={`py-1.5 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
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
            className={`py-1.5 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              selectedCategory === "ALL"
                ? "bg-slate-800 dark:bg-slate-700 text-white shadow-xs scale-[1.01]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>⚓</span>
            <span>{t("allLines")}</span>
          </button>
        </div>
      </div>

      {/* Hızlı Kültür & Sponsorluk & Araç Butonları Çubuğu */}
      <div className="px-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {/* Adalar Tarihi Miras & Kültür Notaları Butonu */}
          <button
            onClick={() => setIsAdalarModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-black whitespace-nowrap flex items-center gap-1 shrink-0 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs transition-all cursor-pointer"
            title="Adalar Tarihi Miras, Sürgün Köşkleri ve Ulaşım Rehberi"
          >
            <Landmark size={13} className="text-amber-600 dark:text-amber-400" />
            <span>Adalar Mirası & Rehber</span>
          </button>

          {/* İskele Ayrıcalıkları & Ticari Sponsorluk Butonu */}
          <button
            onClick={() => setIsSponsoredModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-black whitespace-nowrap flex items-center gap-1 shrink-0 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs transition-all cursor-pointer"
            title="Vapur Yolcularına Özel İskele İndirimleri & Yerel Sponsorluk"
          >
            <Tag size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>İskele Fırsatları</span>
          </button>

          {/* Arama Çubuğu Göster / Gizle Toggle Butonu */}
          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 shrink-0 border transition-all ${
              isSearchVisible
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/60"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800"
            }`}
            title="Arama Çubuğunu Aç/Kapat"
          >
            <Search size={13} />
            <span>{isSearchVisible ? "Aramayı Gizle" : "İskele Ara"}</span>
          </button>

          {/* Nasıl Giderim & Canlı Harita Toggle Button */}
          <button
            onClick={() => setShowPlanner(!showPlanner)}
            title="Aktarma Planlayıcı ve Canlı Harita"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 shrink-0 transition-all border ${
              showPlanner
                ? "bg-cyan-600 text-white border-cyan-400 shadow-2xs"
                : "bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-cyan-700 dark:text-cyan-300 border-slate-300 dark:border-slate-700/80 shadow-2xs"
            }`}
          >
            <Compass size={14} className={showPlanner ? "animate-spin text-white" : "text-cyan-600 dark:text-cyan-400"} />
            <span>{t("howToGo")}</span>
          </button>

          {/* En Yakın İskele Geolocation Button */}
          <button
            onClick={requestLocation}
            disabled={geoStatus === "LOCATING"}
            title="Konumuma En Yakın İskele"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 shrink-0 transition-colors shadow-2xs border ${
              geoStatus === "ACTIVE"
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700/80"
            }`}
          >
            <Navigation size={13} className={geoStatus === "ACTIVE" ? "text-white" : "text-blue-600 dark:text-blue-400"} />
            <span>
              {geoStatus === "LOCATING" ? t("locating") : geoStatus === "ACTIVE" && nearestPier ? nearestPier.name : t("nearestPier")}
            </span>
          </button>

          {/* Vapura Yetişme Asistanı Toggle */}
          <button
            onClick={() => setShowCatchAssistant(!showCatchAssistant)}
            title="Vapura Yetişme ve Yürüme Asistanı"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 shrink-0 transition-colors shadow-2xs border ${
              showCatchAssistant
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-slate-300 dark:border-slate-700/80"
            }`}
          >
            <Footprints size={13} className={showCatchAssistant ? "animate-pulse text-white" : "text-emerald-500"} />
            <span>Yetişme Asistanı</span>
          </button>

          {/* Deniz Durumu & Dalga HUD Toggle */}
          <button
            onClick={() => setShowMarineHUD(!showMarineHUD)}
            title="Canlı Boğaz & Rıhtım Deniz Durumu"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 shrink-0 transition-colors shadow-2xs border ${
              showMarineHUD
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-slate-300 dark:border-slate-700/80"
            }`}
          >
            <Waves size={13} className={showMarineHUD ? "animate-pulse text-white" : "text-indigo-500"} />
            <span>Deniz Durumu</span>
          </button>
        </div>
      </div>

      {/* Akıllı Arama Çubuğu & Canlı Öneri Rozetleri (İsteğe Bağlı Görünüm) */}
      {isSearchVisible && (
        <div className="px-3 pt-2 space-y-1.5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              placeholder="İskele, hat veya vapur adı yazın (Örn: Kadıköy, Bostancı, Büyükada, Paşabahçe)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1"
                title="Aramayı Temizle"
              >
                ✕
              </button>
            )}
          </div>

          {/* Hızlı İskele Öneri Rozetleri */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 hide-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap pl-0.5">
              Hızlı İskeleler:
            </span>
            {["Kadıköy", "Bostancı", "Büyükada", "Heybeliada", "Eminönü", "Karaköy", "Beşiktaş", "Kabataş"].map((pier) => (
              <button
                key={pier}
                onClick={() => setSearchQuery(searchQuery === pier ? "" : pier)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all border ${
                  searchQuery.toLowerCase().includes(pier.toLowerCase())
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {pier}
              </button>
            ))}
          </div>

          {/* Arama Sonucu Bildirim Rozeti */}
          {searchQuery.trim().length > 0 && (
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
              <span>
                🔍 <strong>\"{searchQuery}\"</strong> araması için <strong>{filteredList.length}</strong> sefer bulundu.
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Aramayı Sıfırla</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expanded Trip Planner with Live Map */}
      {showPlanner && (
        <div className="px-3 pt-2 animate-fadeIn">
          <TripPlannerWithMap
            schedules={effectiveSchedules}
            serverTimeIso={serverTimeIso}
            onClose={() => setShowPlanner(false)}
          />
        </div>
      )}

      {/* Marine Weather HUD */}
      {showMarineHUD && (
        <div className="px-3 pt-2 animate-fadeIn">
          <MarineWeatherHUD pier={selectedOrigin !== "ALL" ? selectedOrigin : (nearestPier?.name || "Kadıköy")} />
        </div>
      )}

      {/* Walking Catch Assistant */}
      {showCatchAssistant && (
        <div className="px-3 pt-2 animate-fadeIn">
          <CatchFerryAssistant currentPier={selectedOrigin !== "ALL" ? selectedOrigin : (nearestPier?.name || "Kadıköy")} />
        </div>
      )}

      {/* Horizontal Route Chips & Filter Bar */}
      <div className="px-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {/* All Routes */}
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

          {/* 15-Minute Imminent Quick Filter / Son Çağrı */}
          <button
            onClick={() => setOnlyImminent(!onlyImminent)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-black whitespace-nowrap transition-all shrink-0 flex items-center gap-1 border ${
              onlyImminent
                ? "bg-amber-400 text-slate-950 border-amber-300 shadow-2xs ring-1 ring-amber-400/50"
                : "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-amber-400/40 dark:border-amber-500/30"
            }`}
            title="Kalkışına 15 dakika veya daha az kalan seferleri göster"
          >
            <span className={onlyImminent ? "" : "animate-pulse"}>⚡</span>
            <span>{t("lastCall")}</span>
          </button>

          {/* Swap Button if route selected */}
          {selectedRoute !== "ALL" && (
            <button
              onClick={swapDirection}
              title="Gidiş-Dönüş Değiştir"
              className="px-2 py-1 bg-amber-500 text-slate-950 rounded-md text-[11px] font-black flex items-center gap-1 shrink-0 shadow-2xs"
            >
              <ArrowLeftRight size={12} />
              <span>{t("swap")}</span>
            </button>
          )}

          {/* Individual Routes */}
          {uniqueRoutes.map((routeKey) => {
            const count = activeSchedulesWithDyn.filter(({ schedule }) => `${schedule.origin} ➔ ${schedule.destination}` === routeKey).length;
            return (
              <button
                key={routeKey}
                onClick={() => {
                  setSelectedRoute(routeKey);
                  setSelectedOrigin("ALL");
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 border ${
                  selectedRoute === routeKey
                    ? "bg-amber-400 text-slate-950 font-black shadow-2xs border-amber-400"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800"
                }`}
              >
                <span>{routeKey}</span>
                <span className={`text-[9px] px-1 rounded-full font-bold ${
                  selectedRoute === routeKey ? "bg-black/20 text-slate-950" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* Operators */}
          <span className="text-slate-400 dark:text-slate-700 font-bold px-0.5 shrink-0">|</span>
          {uniqueOperators.map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOperator(selectedOperator === op ? "ALL" : op)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1 border ${
                selectedOperator === op
                  ? "bg-slate-100 dark:bg-slate-800 border-blue-500 text-slate-950 dark:text-white shadow-2xs ring-1 ring-blue-400/40"
                  : "bg-white dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <OperatorLogo operator={op} size="sm" showName={true} />
            </button>
          ))}
        </div>
      </div>

      {/* Favorites Widget (Shows only if user has favorites) */}
      <FavoritesWidget
        schedules={effectiveSchedules}
        selectedRoute={selectedRoute}
        onSelectRoute={(r) => {
          setSelectedRoute(r);
          setSelectedOrigin("ALL");
        }}
      />

      {/* Last Ferry Safety Net (Shows only when urgent / selected route) */}
      <LastFerryAlert
        schedules={filteredList.map((x) => x.schedule)}
        selectedRoute={selectedRoute}
        selectedOrigin={selectedOrigin}
        selectedCategory={selectedCategory}
      />

      {/* Results Header with View Density Switcher */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-[11px]">
            {t("activeTrips")}: <strong className="text-slate-900 dark:text-white text-xs">{filteredList.length}</strong>
          </span>

          {/* Density Toggle (Kompakt vs Geniş Kart) */}
          <button
            onClick={() => setIsCompactDensity(!isCompactDensity)}
            title={isCompactDensity ? "Geniş Kart Görünümü" : "Kompakt Liste Görünümü"}
            className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1 shadow-2xs"
          >
            {isCompactDensity ? <LayoutGrid size={11} /> : <List size={11} />}
            <span className="hidden xs:inline">{isCompactDensity ? t("viewComfort") : t("viewCompact")}</span>
          </button>
        </div>

        {selectedRoute !== "ALL" ? (
          <span className="text-amber-700 dark:text-amber-300 font-extrabold bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/30 px-2 py-0.5 rounded text-[11px]">
            {selectedRoute}
          </span>
        ) : selectedOrigin !== "ALL" ? (
          <span className="text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded text-[11px]">
            📍 {selectedOrigin}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
            {language === "en" ? "Tap trip for details & live AIS" : "Detay için sefere dokunun"}
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
