"use client";

import { Ship, Bell, BellRing, Star, ChevronRight, Radio, Footprints } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { resolveLiveVesselName } from "@/lib/agents/fleet-registry";
import { useEffect, useState } from "react";
import { resolveDynamicTrip, DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { useAlarmStore } from "@/store/useAlarmStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { requestNotificationPermission } from "@/lib/utils/sound";
import { predictTripOccupancy } from "@/lib/utils/occupancy";
import { useWalkingCatchStore } from "@/store/useWalkingCatchStore";
import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { ISTANBUL_PIERS } from "@/lib/services/route-planner";

export type TripStatus = "ON_TIME" | "DEPARTING_SOON" | "BOARDING" | "DELAYED" | "CANCELLED" | "IN_TRANSIT" | "ARRIVING" | "COMPLETED";

export interface ScheduleCardProps {
  id: string;
  origin: string;
  destination: string;
  operator: string;
  routeTitle: string;
  departureTime: string;
  departureTime12: string;
  status: TripStatus;
  targetTimeIso?: string;
  serverTimeIso?: string;
  delayText?: string;
  vessel?: string;
  platform: string;
  price: string;
  progress: number;
  stops?: { name: string; time: string }[];
  arrivalTime?: string;
  onClick?: () => void;
  isCompact?: boolean;
}

export function TripStatusBadge({ status, delayText }: { status: TripStatus; delayText?: string }) {
  let bgColor = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
  let label = status.replace("_", " ");
  
  switch (status) {
    case "ON_TIME": 
      // Kullanıcı kuralı: "Zamanında" yazısı kaldırıldı, yalın görünür
      return null;
    case "DEPARTING_SOON": 
      bgColor = "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-black animate-pulse"; 
      label = "AZ KALDI"; 
      break;
    case "BOARDING": 
      bgColor = "bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 font-bold animate-pulse"; 
      label = "YOLCU ALINIYOR"; 
      break;
    case "IN_TRANSIT": 
      bgColor = "bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 font-bold"; 
      label = "SEYİRDE"; 
      break;
    case "ARRIVING": 
      bgColor = "bg-cyan-100 dark:bg-cyan-600/30 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-bold"; 
      label = "YANAŞIYOR"; 
      break;
    case "DELAYED": 
      bgColor = "bg-rose-100 dark:bg-rose-600/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 font-bold"; 
      label = "GECİKMELİ"; 
      break;
    case "CANCELLED": 
      bgColor = "bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 font-black border border-rose-400 dark:border-rose-500/60 animate-pulse"; 
      label = "❌ İPTAL EDİLDİ"; 
      break;
    case "COMPLETED": 
      bgColor = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"; 
      label = "TAMAMLANDI"; 
      break;
  }

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-tight text-center whitespace-nowrap leading-none ${bgColor}`}>
      {label} {delayText && `(${delayText})`}
    </span>
  );
}

export function ScheduleCard(props: ScheduleCardProps) {
  const { isAlarmSet, toggleAlarm } = useAlarmStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { t, language } = useLanguageStore();

  const hasAlarm = isAlarmSet(props.id);
  const routeKey = `${props.origin} ➔ ${props.destination}`;
  const isFav = isFavorite(routeKey);

  const occupancy = predictTripOccupancy(props.origin, props.destination, props.departureTime);

  const [dynState, setDynState] = useState<DynamicTripResolution>(() => {
    return resolveDynamicTrip(
      props.origin,
      props.destination,
      props.departureTime,
      props.targetTimeIso || new Date().toISOString(),
      props.stops,
      props.arrivalTime,
      Date.now(),
      props.serverTimeIso
    );
  });

  const liveVessel = resolveLiveVesselName(
    props.origin,
    props.destination,
    props.operator,
    dynState.isDeparted,
    dynState.status,
    props.id
  );

  useEffect(() => {
    const update = () => {
      const resolved = resolveDynamicTrip(
        props.origin,
        props.destination,
        props.departureTime,
        props.targetTimeIso || new Date().toISOString(),
        props.stops,
        props.arrivalTime,
        Date.now(),
        props.serverTimeIso
      );
      setDynState(resolved);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [props.origin, props.destination, props.departureTime, props.targetTimeIso, props.stops, props.arrivalTime, props.serverTimeIso]);

  // If the trip has completely expired (30 seconds after its final departure leg), do not render
  if (dynState.isExpired) {
    return null;
  }

  const isDirect = !props.stops || props.stops.length === 0;

  // KULLANICI KURALI: Son 5 dakikada sefer saati de yanıp sönsün
  const isLast5Minutes = !!dynState.countdown && !dynState.isDeparted;

  // Profesyonel Yetişme Asistanı Entegrasyonu
  const { isEnabled: isCatchEnabled, getWalkingMinutesToPier } = useWalkingCatchStore();
  const { setActiveVoyage } = useActiveVoyageStore();

  const pierEntry = Object.entries(ISTANBUL_PIERS).find(([key]) => dynState.currentOrigin.toLowerCase().includes(key.toLowerCase()));
  const walkingMinutes = isCatchEnabled ? getWalkingMinutesToPier(pierEntry?.[1].lat, pierEntry?.[1].lng) : 0;

  let catchStatus: "CAN_CATCH" | "HURRY" | "MISS" | null = null;
  let catchStatusText = "";
  if (isCatchEnabled && !dynState.isDeparted) {
    let remainingMins = 999;
    if (dynState.countdown) {
      const parts = dynState.countdown.split(':').map(Number);
      if (parts.length === 2) remainingMins = parts[0] + parts[1] / 60;
    }
    if (remainingMins >= walkingMinutes + 2) {
      catchStatus = "CAN_CATCH";
      catchStatusText = `Yetişirsiniz (~${walkingMinutes} dk)`;
    } else if (remainingMins >= walkingMinutes - 1) {
      catchStatus = "HURRY";
      catchStatusText = `Hızlı yürüyün! (~${walkingMinutes} dk)`;
    } else {
      catchStatus = "MISS";
      catchStatusText = `Kaçırabilirsiniz`;
    }
  }

  const handleCardClick = () => {
    setActiveVoyage({
      id: props.id,
      origin: dynState.currentOrigin,
      destination: dynState.destination,
      operator: props.operator,
      vesselName: liveVessel.vesselName,
      mmsi: liveVessel.mmsi,
      departureTime: dynState.currentDepartureTime,
      arrivalTime: props.arrivalTime || "",
      price: props.price
    });
    if (props.onClick) props.onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white dark:bg-[#141d2e] hover:bg-slate-50 dark:hover:bg-[#1c283f] rounded-xl px-3 py-2.5 flex items-center justify-between gap-2.5 text-slate-900 dark:text-white shadow-xs dark:shadow-none transition-all duration-150 cursor-pointer group border ${
        isLast5Minutes
          ? "border-amber-400 dark:border-amber-500/60 shadow-sm shadow-amber-400/20 ring-1 ring-amber-400/30"
          : "border-slate-200 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500/40"
      }`}
    >
      {/* 1. Left Column: Departure Time & Countdown / Status Badge */}
      <div className="flex flex-col items-start justify-center shrink-0 w-[68px]">
        <span
          className={`font-mono font-black text-xl sm:text-2xl leading-none tabular-nums tracking-tight transition-all ${
            isLast5Minutes
              ? "text-amber-500 dark:text-amber-400 animate-pulse font-extrabold scale-105"
              : "text-blue-600 dark:text-blue-400"
          }`}
        >
          {dynState.currentDepartureTime}
        </span>
        <div className="mt-1">
          {dynState.isDeparted ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white animate-pulse inline-flex items-center gap-0.5">
              <Ship size={10} />
              <span>{t("departed")}</span>
            </span>
          ) : dynState.countdown ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 animate-pulse whitespace-nowrap">
              ⏳ {dynState.countdown}
            </span>
          ) : (
            <TripStatusBadge status={dynState.status} delayText={props.delayText} />
          )}
        </div>
      </div>

      {/* 2. Middle Column: Dynamic Route & Operator / Occupancy Meta */}
      <div className="flex flex-col min-w-0 flex-1 pr-1">
        {/* Route Line */}
        <div className="flex items-center gap-1.5 font-black text-sm sm:text-base leading-tight truncate">
          <span className="text-slate-900 dark:text-white truncate">{dynState.currentOrigin}</span>
          <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xs sm:text-sm shrink-0">➔</span>
          <span className="text-blue-700 dark:text-amber-300 font-bold truncate">{dynState.destination}</span>
        </div>

        {/* Meta Line: Operator, Occupancy dot, and Direct/Stops */}
        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap truncate">
          <OperatorLogo operator={props.operator} size="sm" showName={true} />

          {/* Assigned Vessel Name & Real Status Badge */}
          <span 
            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded border shrink-0 transition-colors ${
              liveVessel.isConfirmedUnderway
                ? "text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600/50 shadow-xs"
                : "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
            }`}
            title={liveVessel.statusText}
          >
            <Ship size={11} className={liveVessel.isConfirmedUnderway ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : "text-slate-500 dark:text-slate-400"} />
            <span className="font-mono tracking-tight font-black">{liveVessel.vesselName}</span>
            <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded leading-none ${
              liveVessel.isConfirmedUnderway
                ? "bg-emerald-600 text-white animate-pulse"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
              {liveVessel.isConfirmedUnderway ? "Seyirde" : "Rıhtımda"}
            </span>
          </span>

          <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>

          {/* Occupancy Indicator */}
          <span
            className="inline-flex items-center gap-1 font-semibold text-[11px]"
            title={occupancy.description}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                occupancy.level === "HIGH"
                  ? "bg-rose-500"
                  : occupancy.level === "MEDIUM"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
            <span
              className={
                occupancy.level === "HIGH"
                  ? "text-rose-600 dark:text-rose-300 font-bold"
                  : occupancy.level === "MEDIUM"
                  ? "text-amber-600 dark:text-amber-300 font-bold"
                  : "text-emerald-600 dark:text-emerald-300 font-bold"
              }
            >
              {language === "en" 
                ? (occupancy.level === "HIGH" ? "Crowded" : occupancy.level === "MEDIUM" ? "Normal" : "Low")
                : occupancy.label}
            </span>
          </span>

          <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>

          {/* Direct or Stops badge */}
          <span className="text-slate-500 dark:text-slate-400 text-[10px]">
            {isDirect ? t("direct") : `${props.stops?.length} ${t("stops")}`}
          </span>

          {/* Walking Catch Status Badge */}
          {catchStatus && (
            <>
              <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
              <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.2 rounded border ${
                catchStatus === "CAN_CATCH"
                  ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/40"
                  : catchStatus === "HURRY"
                  ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600/40 animate-pulse"
                  : "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-600/40"
              }`}>
                <Footprints size={9} />
                <span>{catchStatusText}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. Right Column: Price & Quick Action (Alarm, Fav, Arrow) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="text-right hidden xs:flex flex-col items-end">
          <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
            {props.price}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
            {props.platform}
          </span>
        </div>

        {/* Favorite Star Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(routeKey);
          }}
          title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
          className={`p-1.5 rounded-lg transition-colors ${
            isFav
              ? "text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/20"
              : "text-slate-400 hover:text-amber-500 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Star size={14} className={isFav ? "fill-amber-500 text-amber-500" : ""} />
        </button>

        {/* Alarm Bell Button */}
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            await requestNotificationPermission();
            toggleAlarm(props.id);
          }}
          title={hasAlarm ? "Hatırlatıcıyı Kaldır" : "15 Dk Önce Hatırlat"}
          className={`p-1.5 rounded-lg transition-colors ${
            hasAlarm
              ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20"
              : "text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {hasAlarm ? (
            <BellRing size={14} className="text-blue-600 dark:text-blue-400 animate-bounce" />
          ) : (
            <Bell size={14} />
          )}
        </button>

        {/* Details Chevron */}
        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}
