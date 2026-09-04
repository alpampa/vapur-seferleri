"use client";

import { Anchor, Navigation, ShieldCheck, Waves, Crown } from "lucide-react";
import { useEffect, useState } from "react";

export type TripStatus = "ON_TIME" | "DEPARTING_SOON" | "BOARDING" | "DELAYED" | "CANCELLED" | "IN_TRANSIT" | "ARRIVING" | "COMPLETED";

interface ScheduleCardProps {
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
  vessel: string;
  platform: string;
  price: string;
  progress: number;
  stops?: { name: string; time: string }[];
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
  const [countdown, setCountdown] = useState<string | null>(null);
  const [hasDeparted, setHasDeparted] = useState(false);

  useEffect(() => {
    if (!props.targetTimeIso || !props.serverTimeIso) return;
    
    const clientNow = Date.now();
    const serverNow = new Date(props.serverTimeIso).getTime();
    const offset = serverNow - clientNow;
    const target = new Date(props.targetTimeIso).getTime();

    const updateCountdown = () => {
      const accurateNow = Date.now() + offset;
      const diff = target - accurateNow;

      // Only mark departed if it passed by more than 1 minute AND less than 4 hours ago
      if (diff < -60000 && diff > -4 * 3600000) {
        setHasDeparted(true);
        setCountdown(null);
        return;
      }

      setHasDeparted(false);

      // Show countdown only if within 15 minutes of departure (0 to 15 mins)
      if (diff > 0 && diff <= 15 * 60000) {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
      } else {
        setCountdown(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [props.targetTimeIso, props.serverTimeIso]);

  return (
    <div className="bg-[#1e293b] hover:bg-[#24344d] border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col gap-3 text-white shadow-lg transition-all duration-200 relative overflow-hidden group">
      {/* Top Header Line: Departure Time, Route Title & Status Badge */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-700/60 pb-3">
        {/* Departure Time & Route */}
        <div className="flex items-center gap-3.5">
          {/* Big Departure Time Box */}
          <div className="flex flex-col items-center justify-center bg-slate-900/90 border border-blue-500/30 rounded-xl px-3 py-1.5 min-w-[72px] shadow-inner">
            <span className="font-mono font-black text-2xl text-blue-400 leading-none tabular-nums tracking-tight">
              {props.departureTime}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">
              {props.departureTime12}
            </span>
          </div>

          {/* Route Origin & Destination */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg text-white tracking-tight">
                {props.origin}
              </span>
              <span className="text-blue-400 font-extrabold text-lg sm:text-xl">➔</span>
              <span className="font-black text-base sm:text-lg text-amber-300 tracking-tight">
                {props.destination}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <OperatorBranding operator={props.operator} />
              <span className="text-xs font-bold text-slate-300">
                • {props.vessel}
              </span>
            </div>
          </div>
        </div>

        {/* Status & Price Box */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {hasDeparted ? (
            <div className="px-3 py-1 rounded-md text-white text-[11px] font-black bg-rose-600 shadow-sm animate-pulse">
              HAREKET ETTİ
            </div>
          ) : countdown ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">KALKIŞA</span>
              <span className="text-amber-400 font-mono font-black text-lg tabular-nums leading-none">
                {countdown}
              </span>
            </div>
          ) : (
            <TripStatusBadge status={props.status} delayText={props.delayText} />
          )}

          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-black text-sm px-2.5 py-0.5 rounded-md shadow-sm">
            {props.price}
          </div>
        </div>
      </div>

      {/* Bottom Line: Intermediate Stops & Platform Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
        {/* Stops / Route Waypoints */}
        <div className="flex-1">
          {props.stops && props.stops.length > 0 ? (
            <div className="flex items-start sm:items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                UĞRADIĞI DURAKLAR:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {props.stops.map((stop, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-slate-800/90 border border-slate-700 text-slate-100 text-xs font-bold px-2 py-1 rounded shadow-sm"
                  >
                    <span>{stop.name}</span>
                    <span className="text-emerald-400 font-mono font-black">({stop.time})</span>
                    {idx < (props.stops?.length || 0) - 1 && (
                      <span className="text-slate-500 font-bold ml-1">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-black px-2.5 py-1 rounded">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>DİREKT SEFER (Ara Duraksız)</span>
            </div>
          )}
        </div>

        {/* Platform & Terminal Info */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs font-bold text-slate-300 bg-slate-800/70 border border-slate-700/60 px-2.5 py-1 rounded-lg">
          <span className="text-slate-400">İskele:</span>
          <span className="text-blue-300 font-black">{props.platform}</span>
        </div>
      </div>
    </div>
  );
}

