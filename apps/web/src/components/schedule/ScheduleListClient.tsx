"use client";

import { useState, useEffect, useMemo } from "react";
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
import { TripDetailsSheet } from "@/components/schedule/TripDetailsSheet";
import type { ScheduleCardDto } from "@/app/page";
import { Search, MapPin, Navigation, ArrowLeftRight, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { MarineWeatherBanner } from "@/components/weather/MarineWeatherBanner";
import type { MarineWeatherStatus } from "@/lib/services/marine-weather";
import { resolveDynamicTrip } from "@/lib/utils/dynamic-trip";
import { AlarmManager } from "@/components/schedule/AlarmManager";
import { TripPlannerWithMap } from "@/components/planner/TripPlannerWithMap";
import { LastFerryAlert } from "@/components/schedule/LastFerryAlert";
import { FavoritesWidget } from "@/components/schedule/FavoritesWidget";
import { Compass } from "lucide-react";

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
  "Maltepe": { lat: 40.9231, lng: 29.1306, label: "Maltepe İskelesi" }
};

// Haversine formula to compute distance in kilometers
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
}

export function ScheduleListClient({ schedules, serverTimeIso, marineWeather }: ScheduleListClientProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleCardDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"ADALAR" | "BOGAZ" | "ALL">("ADALAR");
  const [now, setNow] = useState(Date.now());
  const [selectedRoute, setSelectedRoute] = useState<string>("ALL");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("ALL");
  const [selectedOperator, setSelectedOperator] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPlanner, setShowPlanner] = useState<boolean>(false);

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

  // Geolocation states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestPier, setNearestPier] = useState<{ name: string; distanceKm: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"IDLE" | "LOCATING" | "ACTIVE" | "DENIED">("IDLE");

  // High-precision reactive tick every 1000ms
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Request user geolocation and find nearest pier
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

        // Calculate closest pier
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

  // 1. Resolve dynamic states for all schedules (Removes expired trips 30s after departure & filters by category)
  const activeSchedulesWithDyn = useMemo(() => {
    return effectiveSchedules
      .filter((s) => {
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
      .filter(({ dyn }) => !dyn.isExpired); // Filter out expired trips
  }, [effectiveSchedules, selectedCategory, now, serverTimeIso]);

  // Compute unique routes from available active trips
  const uniqueRoutes = useMemo(() => {
    const routesSet = new Set<string>();
    activeSchedulesWithDyn.forEach(({ schedule, dyn }) => {
      routesSet.add(`${schedule.origin} ➔ ${schedule.destination}`);
    });
    return Array.from(routesSet);
  }, [activeSchedulesWithDyn]);

  // Compute unique operators
  const uniqueOperators = useMemo(() => {
    const ops = new Set<string>();
    activeSchedulesWithDyn.forEach(({ schedule }) => ops.add(schedule.operator));
    return Array.from(ops);
  }, [activeSchedulesWithDyn]);

  // Reverse current route direction (Swap)
  const swapDirection = () => {
    if (selectedRoute === "ALL") return;
    const parts = selectedRoute.split(" ➔ ");
    if (parts.length === 2) {
      const swappedKey = `${parts[1]} ➔ ${parts[0]}`;
      if (uniqueRoutes.includes(swappedKey)) {
        setSelectedRoute(swappedKey);
      }
    }
  };

  // Filter schedules based on active state and user selection
  const filteredList = useMemo(() => {
    return activeSchedulesWithDyn.filter(({ schedule, dyn }) => {
      // Nearest pier / Origin filter
      if (selectedOrigin !== "ALL") {
        const matchesInitial = schedule.origin === selectedOrigin;
        const matchesCurrent = dyn.currentOrigin === selectedOrigin;
        const matchesStop = schedule.stops?.some((st) => st.name === selectedOrigin);
        if (!matchesInitial && !matchesCurrent && !matchesStop) return false;
      }

      // Route filter
      if (selectedRoute !== "ALL") {
        const initialRouteKey = `${schedule.origin} ➔ ${schedule.destination}`;
        const currentRouteKey = `${dyn.currentOrigin} ➔ ${dyn.destination}`;
        if (initialRouteKey !== selectedRoute && currentRouteKey !== selectedRoute) return false;
      }

      // Operator filter
      if (selectedOperator !== "ALL") {
        if (schedule.operator !== selectedOperator) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inOrigin = schedule.origin.toLowerCase().includes(q) || dyn.currentOrigin.toLowerCase().includes(q);
        const inDest = schedule.destination.toLowerCase().includes(q);
        const inOperator = schedule.operator.toLowerCase().includes(q);
        const inStops = schedule.stops?.some((st) => st.name.toLowerCase().includes(q));
        if (!inOrigin && !inDest && !inOperator && !inStops) return false;
      }

      return true;
    });
  }, [activeSchedulesWithDyn, selectedOrigin, selectedRoute, selectedOperator, searchQuery]);

  return (
    <>
      <AlarmManager schedules={effectiveSchedules} />

      {/* Marine Weather & Storm / Lodos Warning Banner */}
      <MarineWeatherBanner weather={marineWeather} />

      {/* Nasıl Giderim & Canlı Harita Toggle Button */}
      <div className="px-3 pt-2">
        <button
          onClick={() => setShowPlanner(!showPlanner)}
          className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-between transition-all shadow-md ${
            showPlanner
              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white ring-2 ring-cyan-400/50"
              : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80"
          }`}
        >
          <div className="flex items-center gap-2">
            <Compass size={16} className={showPlanner ? "text-cyan-200 animate-spin" : "text-cyan-400"} />
            <span className="tracking-wide">🧭 NASIL GİDERİM? (Aktarma & Canlı Deniz Haritası)</span>
          </div>
          <span className="text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded text-cyan-300">
            {showPlanner ? "Paneli Kapat ▲" : "Rotayı ve Haritayı Aç ▼"}
          </span>
        </button>
      </div>

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

      {/* Category Segmented Switcher: Adalar vs Boğaz vs Tümü */}
      <div className="px-3 pt-2">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl shadow-inner">
          <button
            onClick={() => {
              setSelectedCategory("ADALAR");
              setSelectedRoute("ALL");
              setSelectedOrigin("ALL");
            }}
            className={`py-2 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              selectedCategory === "ADALAR"
                ? "bg-amber-400 text-slate-950 shadow-md font-black scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🏝️</span>
            <span>Adalar Hatları</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory("BOGAZ");
              setSelectedRoute("ALL");
              setSelectedOrigin("ALL");
            }}
            className={`py-2 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              selectedCategory === "BOGAZ"
                ? "bg-blue-600 text-white shadow-md font-black scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🌊</span>
            <span>Boğaz Hatları</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedRoute("ALL");
              setSelectedOrigin("ALL");
            }}
            className={`py-2 px-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              selectedCategory === "ALL"
                ? "bg-slate-700 text-white shadow-md font-black scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>⚓</span>
            <span>Tümü</span>
          </button>
        </div>
      </div>

      {/* Favorites & Commute Widget */}
      <FavoritesWidget
        schedules={effectiveSchedules}
        selectedRoute={selectedRoute}
        onSelectRoute={(r) => {
          setSelectedRoute(r);
          setSelectedOrigin("ALL");
        }}
      />

      {/* Last Ferry Safety Net Alert */}
      <LastFerryAlert
        schedules={filteredList.map((x) => x.schedule)}
        selectedRoute={selectedRoute}
        selectedOrigin={selectedOrigin}
        selectedCategory={selectedCategory}
      />

      {/* Ultra Compact Filter & Search Bar */}
      <div className="px-3 py-2 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-800 sticky top-[49px] z-30 space-y-2 shadow-md">
        {/* Row 1: Search & Nearest Pier Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="İskele, hat veya durak ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-white text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white bg-slate-800 px-1 rounded"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={requestLocation}
            disabled={geoStatus === "LOCATING"}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1 shrink-0 transition-colors shadow-sm ${
              geoStatus === "ACTIVE"
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            <Navigation size={13} />
            <span>{geoStatus === "LOCATING" ? "Aranıyor..." : geoStatus === "ACTIVE" && nearestPier ? nearestPier.name : "En Yakın İskele"}</span>
          </button>
        </div>

        {/* Row 2: Horizontal Route Chips & Swap */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
          {/* All Routes */}
          <button
            onClick={() => {
              setSelectedRoute("ALL");
              setSelectedOrigin("ALL");
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-black whitespace-nowrap transition-all shrink-0 ${
              selectedRoute === "ALL" && selectedOrigin === "ALL"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
            }`}
          >
            AKTİF SEFERLER ({activeSchedulesWithDyn.length})
          </button>

          {/* Swap Button if route selected */}
          {selectedRoute !== "ALL" && (
            <button
              onClick={swapDirection}
              title="Gidiş-Dönüş Değiştir"
              className="px-2 py-1 bg-amber-500 text-slate-950 rounded-md text-[11px] font-black flex items-center gap-1 shrink-0 shadow-sm"
            >
              <ArrowLeftRight size={12} />
              <span>Yönü Çevir</span>
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
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
                  selectedRoute === routeKey
                    ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
                }`}
              >
                <span>{routeKey}</span>
                <span className={`text-[9px] px-1 rounded-full font-bold ${
                  selectedRoute === routeKey ? "bg-black/30 text-slate-950" : "bg-slate-900 text-slate-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* Operator Filter Pills inline */}
          <span className="text-slate-600 font-bold px-1 shrink-0">|</span>
          {uniqueOperators.map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOperator(selectedOperator === op ? "ALL" : op)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap shrink-0 transition-all ${
                selectedOperator === op
                  ? "bg-slate-100 text-slate-950 font-black shadow-sm"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60"
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Matching Results Header */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between text-xs font-bold text-slate-400">
        <span>
          Görüntülenen Sefer: <strong className="text-white text-sm">{filteredList.length}</strong>
        </span>
        {selectedRoute !== "ALL" ? (
          <span className="text-amber-300 font-extrabold bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
            {selectedRoute}
          </span>
        ) : selectedOrigin !== "ALL" ? (
          <span className="text-emerald-300 font-extrabold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            📍 {selectedOrigin} Kalkışlılar
          </span>
        ) : null}
      </div>

      {/* Schedules List */}
      <div className="px-4 flex flex-col gap-3 pb-10 mt-2">
        {filteredList.length > 0 ? (
          filteredList.map(({ schedule }) => (
            <div
              key={schedule.id}
              onClick={() => setSelectedSchedule(schedule)}
              className="cursor-pointer transition-transform active:scale-[0.99]"
            >
              <ScheduleCard
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
              />
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-slate-400">
            <p className="text-base font-bold text-slate-300">Seçilen kriterlere uygun aktif sefer bulunamadı.</p>
            <p className="text-xs mt-1 text-slate-500">
              Kalkan seferler 30 saniye sonra listeden otomatik olarak kaldırılır.
            </p>
            <button
              onClick={() => {
                setSelectedRoute("ALL");
                setSelectedOrigin("ALL");
                setSelectedOperator("ALL");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        )}
      </div>

      <TripDetailsSheet
        schedule={selectedSchedule}
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
      />
    </>
  );
}
