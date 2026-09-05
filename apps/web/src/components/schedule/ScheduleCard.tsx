"use client";

import { Ship, Bell, BellRing, Star, ChevronRight, Radio } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { resolveLiveVesselName } from "@/lib/agents/fleet-registry";
import { useEffect, useState } from "react";
import { resolveDynamicTrip, DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { useAlarmStore } from "@/store/useAlarmStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { requestNotificationPermission } from "@/lib/utils/sound";
import { predictTripOccupancy } from "@/lib/utils/occupancy";

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
}

export function TripStatusBadge({ status, delayText }: { status: TripStatus; delayText?: string }) {
  let bgColor = "bg-slate-800 text-slate-300";
  let label = status.replace("_", " ");
  
  switch (status) {
    case "ON_TIME": 
      // Kullanıcı talebi doğrultusunda: "Zamanında" ibaresi kaldırıldı, normal seferler yalın görünür
      return null;
    case "DEPARTING_SOON": 
      bgColor = "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black animate-pulse"; 
      label = "AZ KALDI"; 
      break;
    case "BOARDING": 
      bgColor = "bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold animate-pulse"; 
      label = "YOLCU ALINIYOR"; 
      break;
    case "IN_TRANSIT": 
      bgColor = "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold"; 
      label = "SEYİRDE"; 
      break;
    case "ARRIVING": 
      bgColor = "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold"; 
      label = "YANAŞIYOR"; 
      break;
    case "DELAYED": 
      bgColor = "bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold"; 
      label = "GECİKMELİ"; 
      break;
    case "CANCELLED": 
      bgColor = "bg-rose-950/90 text-rose-300 font-black border border-rose-500/60 animate-pulse"; 
      label = "❌ İPTAL EDİLDİ"; 
      break;
    case "COMPLETED": 
      bgColor = "bg-slate-800 text-slate-400"; 
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

  return (
    <div
      onClick={props.onClick}
      className="bg-[#141d2e] hover:bg-[#1c283f] border border-slate-700/60 hover:border-blue-500/40 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2.5 text-white shadow-sm transition-all duration-150 cursor-pointer group"
    >
      {/* 1. Left Column: Departure Time & Countdown / Status Badge */}
      <div className="flex flex-col items-start justify-center shrink-0 w-[68px]">
        <span className="font-mono font-black text-xl sm:text-2xl text-blue-400 leading-none tabular-nums tracking-tight">
          {dynState.currentDepartureTime}
        </span>
        <div className="mt-1">
          {dynState.isDeparted ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white animate-pulse inline-flex items-center gap-0.5">
              <Ship size={10} />
              <span>GİTTİ</span>
            </span>
          ) : dynState.countdown ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse whitespace-nowrap">
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
          <span className="text-white truncate">{dynState.currentOrigin}</span>
          <span className="text-blue-400 font-extrabold text-xs sm:text-sm shrink-0">➔</span>
          <span className="text-amber-300 truncate">{dynState.destination}</span>
        </div>

        {/* Meta Line: Operator, Occupancy dot, and Direct/Stops */}
        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap truncate">
          <OperatorLogo operator={props.operator} size="sm" showName={true} />

          {/* Underway Confirmed Vessel Name */}
          {liveVessel.isConfirmedUnderway && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded shrink-0 shadow-sm animate-pulse">
              🚢 {liveVessel.vesselName}
            </span>
          )}

          <span className="text-slate-600 font-bold">•</span>

          {/* Occupancy Indicator */}
          <span
            className="inline-flex items-center gap-1 font-semibold text-[11px]"
            title={occupancy.description}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                occupancy.level === "HIGH"
                  ? "bg-rose-400"
                  : occupancy.level === "MEDIUM"
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
            />
            <span
              className={
                occupancy.level === "HIGH"
                  ? "text-rose-300"
                  : occupancy.level === "MEDIUM"
                  ? "text-amber-300"
                  : "text-emerald-300"
              }
            >
              {occupancy.label}
            </span>
          </span>

          <span className="text-slate-600 font-bold">•</span>

          {/* Direct or Stops badge */}
          <span className="text-slate-400 text-[10px]">
            {isDirect ? "Direkt" : `${props.stops?.length || 0} Durak`}
          </span>
        </div>
      </div>

      {/* 3. Right Column: Price, Star, Alarm, and Chevron */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Price Tag */}
        <div className="bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-mono font-black text-xs px-2 py-1 rounded-md shadow-sm">
          {props.price}
        </div>

        {/* Favorite Star Button */}
        <button
          type="button"
          onClick={() => toggleFavorite(routeKey)}
          title={isFav ? "Favorilerden Çıkar" : "Bu Hattı Favorilere Ekle"}
          className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${
            isFav
              ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
              : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-amber-300"
          }`}
        >
          <Star size={13} className={isFav ? "fill-slate-950 text-slate-950" : ""} />
        </button>

        {/* Alarm Bell Button */}
        <button
          type="button"
          onClick={() => {
            requestNotificationPermission();
            toggleAlarm(props.id);
          }}
          title={hasAlarm ? "Alarmı Kaldır" : "Kalkışa 5 dakika kala sesli/bildirimle uyar"}
          className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${
            hasAlarm
              ? "bg-amber-500/20 border-amber-400 text-amber-300"
              : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          {hasAlarm ? (
            <BellRing size={13} className="text-amber-400 animate-bounce" />
          ) : (
            <Bell size={13} />
          )}
        </button>

        {/* Detail Arrow Indicator */}
        <div className="text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 pl-0.5">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
