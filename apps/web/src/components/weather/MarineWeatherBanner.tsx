"use client";

import { useState } from "react";
import { AlertTriangle, Wind, Waves, Eye, ChevronDown, ChevronUp } from "lucide-react";
import type { MarineWeatherStatus } from "@/lib/services/marine-weather";

interface MarineWeatherBannerProps {
  weather?: MarineWeatherStatus | null;
}

export function MarineWeatherBanner({ weather }: MarineWeatherBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weather) return null;

  const isRisk = weather.isFerryDisruptionRisk;

  return (
    <div className="px-3 pt-1.5">
      <div
        className={`rounded-lg px-2.5 py-1.5 transition-all text-xs border shadow-sm ${
          isRisk
            ? "bg-amber-950/90 border-amber-500/50 text-amber-100 ring-1 ring-amber-500/40"
            : "bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 text-slate-300"
        }`}
      >
        {/* Main Alert / Status Row */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-2 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            {isRisk ? (
              <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle size={13} />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Waves size={13} />
              </div>
            )}

            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className={`font-bold text-xs truncate ${isRisk ? "text-amber-300" : "text-slate-200"}`}>
                {weather.alertTitle}
              </span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 shrink-0">
                {weather.temperature}°C
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline truncate">
                • {weather.windName.split(' ')[0]} ({weather.windSpeedKnots} kn)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-400 hover:text-white">
            <span className="text-[10px] hidden sm:inline font-medium">
              {isExpanded ? "Gizle" : "Hava Raporu"}
            </span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>

        {/* Collapsible Marine Details */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center animate-fadeIn">
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-blue-400 text-[10px] font-bold mb-0.5">
                <Wind size={11} />
                <span>Rüzgar</span>
              </div>
              <div className="font-bold text-white text-xs">{weather.windSpeedKnots} knot</div>
              <div className="text-[9px] text-slate-400">{weather.windName.split(' ')[0]}</div>
            </div>

            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-bold mb-0.5">
                <AlertTriangle size={11} />
                <span>Hamle</span>
              </div>
              <div className="font-bold text-amber-300 text-xs">{weather.windGustsKnots} knot</div>
              <div className="text-[9px] text-slate-400">Anlık Esme</div>
            </div>

            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-bold mb-0.5">
                <Eye size={11} />
                <span>Görüş</span>
              </div>
              <div className="font-bold text-white text-xs">{weather.visibilityKm} km</div>
              <div className="text-[9px] text-emerald-400 font-medium">
                {weather.visibilityKm < 2 ? "Sisli" : "Açık"}
              </div>
            </div>

            <div className="col-span-3 text-left bg-slate-950/40 p-2 rounded border border-slate-800 text-[11px] text-slate-300">
              {weather.alertDescription}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
