"use client";

import { useState } from "react";
import { AlertTriangle, Wind, Waves, Eye, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import type { MarineWeatherStatus } from "@/lib/services/marine-weather";

interface MarineWeatherBannerProps {
  weather?: MarineWeatherStatus | null;
}

export function MarineWeatherBanner({ weather }: MarineWeatherBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weather) return null;

  const isRisk = weather.isFerryDisruptionRisk;

  return (
    <div className="px-3 pt-2">
      <div
        className={"rounded-xl p-2.5 transition-all text-xs border shadow-sm " + (
          isRisk
            ? "bg-amber-950/90 border-amber-500/50 text-amber-100"
            : "bg-slate-900/80 border-slate-800 text-slate-300"
        )}
      >
        {/* Main Alert Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-2 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            {isRisk ? (
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle size={15} />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Waves size={15} />
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className={"font-bold text-xs truncate " + (isRisk ? "text-amber-300" : "text-white")}>
                  {weather.alertTitle}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60 shrink-0">
                  {weather.temperature}°C
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">
                {weather.windName} • {weather.windSpeedKnots} knot (Hamle: {weather.windGustsKnots} kn)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-400 hover:text-white">
            <span className="text-[10px] hidden sm:inline font-medium">
              {isExpanded ? "Detayı Gizle" : "Deniz Raporu"}
            </span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>

        {/* Collapsible Marine Details */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center animate-fadeIn">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-blue-400 text-[10px] font-bold mb-0.5">
                <Wind size={12} />
                <span>Rüzgar</span>
              </div>
              <div className="font-bold text-white text-xs">{weather.windSpeedKnots} knot</div>
              <div className="text-[9px] text-slate-400">{weather.windName.split(' ')[0]}</div>
            </div>

            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-bold mb-0.5">
                <AlertTriangle size={12} />
                <span>Rüzgar Hamlesi</span>
              </div>
              <div className="font-bold text-amber-300 text-xs">{weather.windGustsKnots} knot</div>
              <div className="text-[9px] text-slate-400">Anlık Sert Esme</div>
            </div>

            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-bold mb-0.5">
                <Eye size={12} />
                <span>Görüş Mesafesi</span>
              </div>
              <div className="font-bold text-white text-xs">{weather.visibilityKm} km</div>
              <div className="text-[9px] text-emerald-400 font-medium">
                {weather.visibilityKm < 2 ? "Düşük (Sis)" : "Açık"}
              </div>
            </div>

            <div className="col-span-3 text-left bg-slate-950/40 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 mt-0.5">
              {weather.alertDescription}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
