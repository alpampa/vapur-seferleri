"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle, Ship, DoorOpen, ShieldAlert, Footprints } from "lucide-react";

interface BerthTurnaroundIndicatorProps {
  originPier: string;
  destinationPier: string;
  vesselName: string;
  status: string;
  countdown?: string | null;
  isDeparted?: boolean;
}

export function BerthTurnaroundIndicator({
  originPier,
  destinationPier,
  vesselName,
  status,
  countdown,
  isDeparted
}: BerthTurnaroundIndicatorProps) {
  // Parse remaining seconds to departure
  let totalRemainingSec = 0;
  if (countdown) {
    const parts = countdown.split(":").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      totalRemainingSec = parts[0] * 60 + parts[1];
    }
  }

  // Island pier turnaround is 5 min (300s), city/bosphorus pier is 4 min (240s)
  const isIsland = originPier.includes("Ada") || destinationPier.includes("Ada");
  const totalBerthWindowSec = isIsland ? 300 : 240;

  // Dwell countdown on berth: If departure is within 5 minutes, vessel is at the pier!
  const isAtBerth = !isDeparted && status !== "IN_TRANSIT" && totalRemainingSec > 0 && totalRemainingSec <= totalBerthWindowSec;

  const berthDwellSec = isAtBerth ? totalRemainingSec : 0;
  const dwellMinutes = Math.floor(berthDwellSec / 60);
  const dwellSeconds = berthDwellSec % 60;
  const formattedDwell = `${String(dwellMinutes).padStart(2, "0")}:${String(dwellSeconds).padStart(2, "0")}`;

  // Calculate dwell progress percentage
  const dwellProgressPercent = Math.min(100, Math.max(0, Math.round((berthDwellSec / totalBerthWindowSec) * 100)));

  // Determine turnaround phase and urgency
  let phase: "BOARDING_OPEN" | "LAST_CALL" | "RAMP_CLOSING" | "DEPARTED" | "SCHEDULED_WAIT";
  let phaseTitle = "";
  let phaseBadge = "";
  let phaseColor = "";
  let advisoryText = "";

  if (isDeparted || status === "IN_TRANSIT") {
    phase = "DEPARTED";
    phaseTitle = "Vapur Rıhtımdan Ayrıldı";
    phaseBadge = "Seyirde";
    phaseColor = "border-blue-500 bg-blue-500/10 text-blue-400";
    advisoryText = `${vesselName} iskeleden palamar çözerek boğaza açılmıştır.`;
  } else if (!isAtBerth) {
    phase = "SCHEDULED_WAIT";
    phaseTitle = `Vapur İskeleye Yanaşacak (${countdown || "Planlandı"})`;
    phaseBadge = "Beklemede";
    phaseColor = "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
    advisoryText = `Sefer kalkışına henüz süre var. Vapur iskeleye yanaştığında iniş-biniş sayacı başlayacaktır.`;
  } else if (berthDwellSec > 90) {
    phase = "BOARDING_OPEN";
    phaseTitle = "Yolcu İniş-Binişi Açık";
    phaseBadge = "Turnikeler Açık";
    phaseColor = "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    advisoryText = `Turnikelerden rahatça geçebilirsiniz. Vapur rıhtımda bağlı, yolcu alımı devam ediyor.`;
  } else if (berthDwellSec > 35) {
    phase = "LAST_CALL";
    phaseTitle = "Son Çağrı • Binişler Kapanıyor";
    phaseBadge = "Acele Edin!";
    phaseColor = "border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-400";
    advisoryText = `Turnikeye koşan yolcular için son anlar! Rampa görevlileri kalkış hazırlığı yapıyor.`;
  } else {
    phase = "RAMP_CLOSING";
    phaseTitle = "Rampa Kaldırılıyor & Palamar Mola";
    phaseBadge = "Kapılar Kapanıyor";
    phaseColor = "border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-400";
    advisoryText = `Güvenlik zinciri takılıyor, turnikeler kapatılmak üzere!`;
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${phaseColor}`}>
            <DoorOpen size={16} className={phase === "LAST_CALL" || phase === "RAMP_CLOSING" ? "animate-pulse" : ""} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                İSKELEDE KALIŞ & BİNİŞ SÜRESİ
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${phaseColor}`}>
                {phaseBadge}
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              {phaseTitle}
            </h4>
          </div>
        </div>

        {/* Big Countdown Badge if At Berth */}
        {isAtBerth && (
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-slate-400 uppercase">Kalan Süre</span>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-base sm:text-lg font-mono font-black tabular-nums ${
                berthDwellSec <= 60
                  ? "text-rose-600 dark:text-rose-400 animate-pulse font-extrabold"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}>
                {formattedDwell}
              </span>
              <span className="text-[10px] font-bold text-slate-400">dk</span>
            </div>
          </div>
        )}
      </div>

      {/* Dwell Progress Bar */}
      {isAtBerth && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Rıhtım Yanaşma</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              %{dwellProgressPercent} Vakit Kaldı ({berthDwellSec} saniye)
            </span>
            <span>Kalkış</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-1000 ${
                berthDwellSec > 90
                  ? "bg-emerald-500"
                  : berthDwellSec > 35
                  ? "bg-amber-500"
                  : "bg-rose-500 animate-pulse"
              }`}
              style={{ width: `${dwellProgressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Advisory Note */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2 text-xs">
        <Footprints size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
          {advisoryText}
        </p>
      </div>
    </div>
  );
}
