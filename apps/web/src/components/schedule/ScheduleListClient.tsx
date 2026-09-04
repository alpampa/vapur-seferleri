"use client";

import { useState, useEffect, useMemo } from "react";
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
import { TripDetailsSheet } from "@/components/schedule/TripDetailsSheet";
import type { ScheduleCardDto } from "@/app/page";
import { Filter, Search, RotateCcw, MapPin, Navigation, ArrowLeftRight, Check, AlertTriangle } from "lucide-react";

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

// Haversine formula to compute distance in meters/kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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
}

export function ScheduleListClient({ schedules, serverTimeIso }: ScheduleListClientProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleCardDto | null>(null);
  const [now, setNow] = useState(Date.now());
  const [selectedRoute, setSelectedRoute] = useState<string>("ALL");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("ALL");
  const [selectedOperator, setSelectedOperator] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Geolocation states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestPier, setNearestPier] = useState<{ name: string; distanceKm: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"IDLE" | "LOCATING" | "ACTIVE" | "DENIED">("IDLE");

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
          setSelectedRoute("ALL"); // Reset route to show all trips from this pier
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

  // Compute unique origins
  const uniqueOrigins = useMemo(() => {
    const originsSet = new Set<string>();
    schedules.forEach((s) => originsSet.add(s.origin));
    return Array.from(originsSet);
  }, [schedules]);

  // Compute unique routes available in the schedule list
  const uniqueRoutes = useMemo(() => {
    const routesSet = new Set<string>();
    schedules.forEach((s) => {
      routesSet.add(`${s.origin} ➔ ${s.destination}`);
    });
    return Array.from(routesSet);
  }, [schedules]);

  // Compute unique operators
  const uniqueOperators = useMemo(() => {
    const ops = new Set<string>();
    schedules.forEach((s) => ops.add(s.operator));
    return Array.from(ops);
  }, [schedules]);

  // Reverse current route direction (Swap)
  const swapDirection = () => {
    if (selectedRoute === "ALL") return;
    const parts = selectedRoute.split(" ➔ ");
    if (parts.length === 2) {
      const swappedKey = `${parts[1]} ➔ ${parts[0]}`;
      // Check if opposite route exists
      if (uniqueRoutes.includes(swappedKey)) {
        setSelectedRoute(swappedKey);
      }
    }
  };

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      // Time expiration check (-30 seconds)
      if (schedule.targetTimeIso) {
        const targetMs = new Date(schedule.targetTimeIso).getTime();
        const serverNowMs = Date.now();
        const diff = targetMs - serverNowMs;
        if (diff < -30000) return false;
      }

      // Nearest pier / Origin filter
      if (selectedOrigin !== "ALL") {
        if (schedule.origin !== selectedOrigin) return false;
      }

      // Route filter
      if (selectedRoute !== "ALL") {
        const currentRouteKey = `${schedule.origin} ➔ ${schedule.destination}`;
        if (currentRouteKey !== selectedRoute) return false;
      }

      // Operator filter
      if (selectedOperator !== "ALL") {
        if (schedule.operator !== selectedOperator) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inOrigin = schedule.origin.toLowerCase().includes(q);
        const inDest = schedule.destination.toLowerCase().includes(q);
        const inVessel = schedule.vessel.toLowerCase().includes(q);
        const inOperator = schedule.operator.toLowerCase().includes(q);
        const inStops = schedule.stops?.some((st) => st.name.toLowerCase().includes(q));
        if (!inOrigin && !inDest && !inVessel && !inOperator && !inStops) return false;
      }

      return true;
    });
  }, [schedules, selectedOrigin, selectedRoute, selectedOperator, searchQuery]);

  return (
    <>
      {/* 1. Geolocation Location Bar */}
      <div className="px-4 pt-2.5 pb-1 bg-[#090d16]">
        {geoStatus === "ACTIVE" && nearestPier ? (
          <div className="bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <MapPin size={18} className="animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                    KONUMUNUZA EN YAKIN İSKELE
                  </span>
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                    {nearestPier.distanceKm < 1 
                      ? `${Math.round(nearestPier.distanceKm * 1000)} m` 
                      : `${nearestPier.distanceKm.toFixed(1)} km`}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white mt-0.5">
                  {nearestPier.name} Kalkışlı Seferler Listeleniyor
                </h4>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedOrigin("ALL");
                setGeoStatus("IDLE");
              }}
              className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700"
            >
              Tümünü Göster
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-blue-400 shrink-0" />
              <p className="text-xs text-slate-300 font-medium leading-tight">
                Size en yakın iskeleden kalkan seferleri görmek ister misiniz?
              </p>
            </div>
            <button
              onClick={requestLocation}
              disabled={geoStatus === "LOCATING"}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              {geoStatus === "LOCATING" ? "Konum Alınıyor..." : "En Yakın İskele"}
            </button>
          </div>
        )}
      </div>

      {/* 2. Route & Filter Bar Section */}
      <div className="px-4 py-3 bg-[#0f172a]/95 backdrop-blur border-b border-slate-800 sticky top-[69px] z-30 space-y-2.5 shadow-md">
        {/* Search Bar Input */}
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="İskele, vapur adı veya ara durak ara (Örn: Bostancı, Heybeliada, Barış Manço)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          )}
        </div>

        {/* Route Filter Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Filter size={13} className="text-blue-400" />
              ROTA SEÇİMİ (TIKLAYIN):
            </span>
            <div className="flex items-center gap-1.5">
              {selectedRoute !== "ALL" && (
                <button
                  onClick={swapDirection}
                  title="Gidiş-Dönüş Yönünü Değiştir"
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 border border-blue-500/40 px-2 py-0.5 rounded"
                >
                  <ArrowLeftRight size={11} />
                  Yönü Değiştir
                </button>
              )}
              {(selectedRoute !== "ALL" || selectedOrigin !== "ALL" || selectedOperator !== "ALL" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedRoute("ALL");
                    setSelectedOrigin("ALL");
                    setSelectedOperator("ALL");
                    setSearchQuery("");
                  }}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded"
                >
                  <RotateCcw size={11} />
                  Sıfırla
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 hide-scrollbar">
            {/* All Routes Chip */}
            <button
              onClick={() => {
                setSelectedRoute("ALL");
                setSelectedOrigin("ALL");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all shadow-sm ${
                selectedRoute === "ALL" && selectedOrigin === "ALL"
                  ? "bg-blue-600 text-white shadow-blue-500/30 border border-blue-400"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              TÜM ROTALAR ({schedules.length})
            </button>

            {/* Individual Route Chips */}
            {uniqueRoutes.map((routeKey) => {
              const count = schedules.filter((s) => `${s.origin} ➔ ${s.destination}` === routeKey).length;
              return (
                <button
                  key={routeKey}
                  onClick={() => {
                    setSelectedRoute(routeKey);
                    setSelectedOrigin("ALL");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 ${
                    selectedRoute === routeKey
                      ? "bg-amber-500 text-slate-950 shadow-amber-500/30 border border-amber-300"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                  }`}
                >
                  <span>{routeKey}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedRoute === routeKey ? "bg-black/30 text-slate-900" : "bg-slate-900 text-slate-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Operator Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            FİRMA:
          </span>
          <button
            onClick={() => setSelectedOperator("ALL")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all ${
              selectedOperator === "ALL"
                ? "bg-slate-200 text-slate-900 shadow-sm"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60"
            }`}
          >
            Tümü
          </button>
          {uniqueOperators.map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOperator(op)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedOperator === op
                  ? op === "Şehir Hatları"
                    ? "bg-red-600 text-white font-black shadow-sm"
                    : op === "Mavi Marmara"
                    ? "bg-sky-500 text-white font-black shadow-sm"
                    : "bg-purple-600 text-white font-black shadow-sm"
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
          Görüntülenen Sefer: <strong className="text-white text-sm">{filteredSchedules.length}</strong>
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
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              onClick={() => setSelectedSchedule(schedule)}
              className="cursor-pointer transition-transform active:scale-[0.99]"
            >
              <ScheduleCard
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
            <p className="text-base font-bold text-slate-300">Seçilen kriterlere uygun sefer bulunamadı.</p>
            <p className="text-xs mt-1 text-slate-500">
              Lütfen yukarıdaki filtreleri sıfırlayarak tüm seferleri görüntüleyin.
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
              Tüm Seferleri Göster
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


