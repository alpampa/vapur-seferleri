"use client";

import { Anchor, Navigation, ShieldCheck, Waves, Crown, Ship, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { resolveDynamicTrip, DynamicTripResolution } from "@/lib/utils/dynamic-trip";

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
}

export function TripStatusBadge({ status, delayText }: { status: TripStatus; delayText?: string }) {
  let bgColor = "bg-slate-700 text-white";
  let label = status.replace("_", " ");
  
  switch (status) {
    case "DEPARTING_SOON": 
      bgColor = "bg-amber-500 text-slate-950 font-black animate-pulse"; 
      label = "KALKIŞA AZ KALDI"; 
      break;
    case "ON_TIME": 
      bgColor = "bg-emerald-600 text-white font-bold"; 
      label = "ZAMANINDA"; 
      break;
    case "BOARDING": 
      bgColor = "bg-blue-600 text-white font-bold animate-pulse"; 
      label = "YOLCU ALINIYOR"; 
      break;
    case "IN_TRANSIT": 
      bgColor = "bg-indigo-600 text-white font-bold"; 
      label = "SEYİR HALİNDE"; 
      break;
    case "ARRIVING": 
      bgColor = "bg-cyan-600 text-white font-bold"; 
      label = "YANAŞIYOR"; 
      break;
    case "DELAYED": 
      bgColor = "bg-rose-600 text-white font-bold"; 
      label = "GECİKMELİ"; 
      break;
    case "CANCELLED": 
      bgColor = "bg-slate-900 text-rose-400 font-bold border border-rose-500/30"; 
      label = "İPTAL"; 
      break;
    case "COMPLETED": 
      bgColor = "bg-slate-600 text-slate-200"; 
      label = "TAMAMLANDI"; 
      break;
  }

  return (
    <div className={`px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wide text-center shadow-sm ${bgColor}`}>
      {label} {delayText && `(${delayText})`}
    </div>
  );
}

function OperatorBranding({ operator }: { operator: string }) {
  if (operator === "Şehir Hatları") {
    return (
      <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/40 text-red-100 px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wide shadow-sm">
        <Anchor size={13} className="text-red-400" />
        <span>ŞEHİR HATLARI</span>
      </div>
    );
  }
  if (operator === "Mavi Marmara") {
    return (
      <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-400/40 text-sky-100 px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wide shadow-sm">
        <Waves size={13} className="text-sky-300" />
        <span>MAVİ MARMARA</span>
      </div>
    );
  }
  if (operator === "Prens Tur") {
    return (
      <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-400/40 text-purple-100 px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wide shadow-sm">
        <Crown size={13} className="text-purple-300" />
        <span>PRENS TUR</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold">
      <Navigation size={13} />
      <span>{operator}</span>
    </div>
  );
}

export function ScheduleCard(props: ScheduleCardProps) {
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
    <div className="bg-[#1e293b] hover:bg-[#24344d] border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col gap-3 text-white shadow-lg transition-all duration-200 relative overflow-hidden group">
      {/* Top Header Line: Departure Time, Route Title & Status Badge */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-700/60 pb-3">
        {/* Dynamic Departure Time & Active Leg Route */}
        <div className="flex items-center gap-3.5">
          {/* Big Departure Time Box (Updates dynamically to current station time) */}
          <div className="flex flex-col items-center justify-center bg-slate-900/90 border border-blue-500/30 rounded-xl px-3 py-1.5 min-w-[72px] shadow-inner">
            <span className="font-mono font-black text-2xl text-blue-400 leading-none tabular-nums tracking-tight">
              {dynState.currentDepartureTime}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">
              {dynState.currentDepartureTime12}
            </span>
          </div>

          {/* Dynamic Route Origin & Destination */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg text-white tracking-tight">
                {dynState.currentOrigin}
              </span>
              <span className="text-blue-400 font-extrabold text-lg sm:text-xl">➔</span>
              <span className="font-black text-base sm:text-lg text-amber-300 tracking-tight">
                {dynState.destination}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <OperatorBranding operator={props.operator} />
            </div>
          </div>
        </div>

        {/* Status & Price Box */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {dynState.isDeparted ? (
            <div className="px-3 py-1 rounded-md text-white text-[11px] font-black bg-rose-600 shadow-sm animate-pulse flex items-center gap-1">
              <Ship size={13} />
              <span>HAREKET ETTİ</span>
            </div>
          ) : dynState.countdown ? (
            <div className="flex flex-col items-end bg-amber-950/80 border border-amber-500/50 px-2.5 py-0.5 rounded-lg shadow-sm">
              <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">KALKIŞA</span>
              <span className="text-amber-300 font-mono font-black text-base tabular-nums leading-tight animate-pulse">
                {dynState.countdown}
              </span>
            </div>
          ) : (
            <TripStatusBadge status={dynState.status} delayText={props.delayText} />
          )}

          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-black text-sm px-2.5 py-0.5 rounded-md shadow-sm">
            {props.price}
          </div>
        </div>
      </div>

      {/* Middle/Bottom: Metro / Marmaray Progressive Route Timeline */}
      {!isDirect && dynState.waypoints && dynState.waypoints.length > 1 ? (
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-black uppercase tracking-wider text-[10px]">
              <Navigation size={11} className="text-amber-400" />
              <span>DURAK VE GÜZERGAH İLERLEMESİ:</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {dynState.waypoints.filter(w => w.state === "COMPLETED").length} / {dynState.waypoints.length} Durak Geçildi
            </span>
          </div>

          {/* Horizontal Metro / Marmaray Track */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 hide-scrollbar">
            {dynState.waypoints.map((wp, wIdx) => {
              const isCompleted = wp.state === "COMPLETED";
              const isCurrent = wp.state === "CURRENT";
              const isLast = wIdx === dynState.waypoints.length - 1;

              return (
                <div key={wIdx} className="flex items-center shrink-0">
                  {/* Station Pill */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all shadow-sm ${
                      isCompleted
                        ? "bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold"
                        : isCurrent
                        ? "bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300/80 shadow-md shadow-amber-500/30 scale-[1.02]"
                        : "bg-slate-900/90 border border-slate-800 text-slate-300 font-medium"
                    }`}
                  >
                    {isCompleted ? (
                      <span className="text-emerald-400 text-[11px] font-black">✓</span>
                    ) : isCurrent ? (
                      <span className="text-[10px] font-black animate-pulse flex items-center gap-0.5 text-slate-950">
                        ➔ 🚢
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                    )}

                    <span className="tracking-tight">{wp.name}</span>
                    <span
                      className={`font-mono text-[10px] ${
                        isCompleted
                          ? "text-emerald-400/90 font-bold"
                          : isCurrent
                          ? "text-slate-950 underline font-black"
                          : "text-slate-400 font-semibold"
                      }`}
                    >
                      ({wp.time})
                    </span>
                  </div>

                  {/* Connecting Track Segment */}
                  {!isLast && (
                    <div
                      className={`w-3.5 sm:w-4 h-[3px] mx-0.5 rounded-full ${
                        isCompleted
                          ? "bg-emerald-500"
                          : isCurrent
                          ? "bg-gradient-to-r from-amber-400 via-amber-500 to-slate-700"
                          : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="inline-flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-black px-2.5 py-1 rounded">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>DİREKT SEFER (Ara Duraksız)</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800/70 border border-slate-700/60 px-2.5 py-1 rounded-lg">
            <span className="text-slate-400">İskele:</span>
            <span className="text-blue-300 font-black">{props.platform}</span>
          </div>
        </div>
      )}

      {/* Direct Trips Footer Platform info when stops exist */}
      {!isDirect && (
        <div className="flex items-center justify-end text-xs font-bold text-slate-300 pt-0.5">
          <div className="bg-slate-800/70 border border-slate-700/60 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
            <span className="text-slate-400">Kalkış İskelesi:</span>
            <span className="text-blue-300 font-black">{props.platform}</span>
          </div>
        </div>
      )}
    </div>
  );
}
