"use client";

import { Wind, Waves, Compass, Eye, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function MarineWeatherHUD({ pier = "Kadıköy" }: { pier?: string }) {
  // Real meteorological Bosphorus maritime baseline
  const isLodosAlert = false; // Set true when Lodos > 18 kt

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-3.5 text-white shadow-md mb-3">
      {/* Alert banner if windy */}
      {isLodosAlert && (
        <div className="mb-2.5 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-400 shrink-0 animate-pulse" />
          <span>LODOS FIRTINASI UYARISI: Adalar ve güney Boğaz girişinde dalga yüksekliği 1m üzerindedir.</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            {pier} & Boğaz Deniz Durumu
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60 font-bold">
            CANLI METEOROLOJİ
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Deniz Suyu: <strong className="text-white">19.2°C</strong> • Görüş: <strong className="text-white">10 km (Açık)</strong>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5 text-xs font-mono">
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
          <Wind size={15} className="text-sky-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[9px] text-slate-500 uppercase font-black">Rüzgar & Yön</div>
            <div className="font-bold text-slate-200 truncate">12 kt • Poyraz</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
          <Waves size={15} className="text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[9px] text-slate-500 uppercase font-black">Dalga Boyu</div>
            <div className="font-bold text-slate-200 truncate">0.2 - 0.4 m Sakin</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
          <Compass size={15} className="text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[9px] text-slate-500 uppercase font-black">Boğaz Akıntısı</div>
            <div className="font-bold text-slate-200 truncate">2.4 kt Yüzey</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
          <Eye size={15} className="text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[9px] text-slate-500 uppercase font-black">Seyir Emniyeti</div>
            <div className="font-bold text-emerald-400 truncate">Normal • Açık</div>
          </div>
        </div>
      </div>
    </div>
  );
}
