"use client";

import { Anchor, Ship, Navigation, CheckCircle2, AlertCircle, DoorOpen, Clock, Footprints } from "lucide-react";

interface MooringTelemetryCardProps {
  vesselName: string;
  originPier: string;
  destinationPier: string;
  status: string;
  countdown?: string | null;
  isDeparted?: boolean;
}

export function MooringTelemetryCard({
  vesselName,
  originPier,
  destinationPier,
  status,
  countdown,
  isDeparted
}: MooringTelemetryCardProps) {
  // Parse remaining seconds if countdown exists
  let remainingSec = 999;
  if (countdown) {
    const parts = countdown.split(":").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      remainingSec = parts[0] * 60 + parts[1];
    }
  }

  const isIsland = originPier.includes("Ada") || destinationPier.includes("Ada");
  const totalBerthWindowSec = isIsland ? 300 : 240;
  const isAtBerth = !isDeparted && status !== "IN_TRANSIT" && remainingSec > 0 && remainingSec <= totalBerthWindowSec;

  const dwellSec = isAtBerth ? remainingSec : 0;
  const dwellMins = Math.floor(dwellSec / 60);
  const dwellRemainderSec = dwellSec % 60;
  const formattedDwell = `${String(dwellMins).padStart(2, "0")}:${String(dwellRemainderSec).padStart(2, "0")}`;

  // Mooring Telemetry State Calculation
  let distanceMeters = 0;
  let maneuverAngle = "0° Paralel";
  let mooringState: "APPROACHING" | "MOORING_LINES" | "RAMP_DEPLOYED" | "UNDERWAY" = "RAMP_DEPLOYED";
  let mooringStateText = "Rampa İndirildi / Yolcu İniş-Binişi Açık";
  let mooringColor = "text-emerald-500";
  let rampPercent = 100;

  if (isDeparted || status === "IN_TRANSIT") {
    mooringState = "UNDERWAY";
    mooringStateText = "Seyirde (Açık Deniz / Boğaz Hattı)";
    distanceMeters = 850;
    maneuverAngle = "310° Rota Seyri";
    mooringColor = "text-blue-500";
    rampPercent = 0;
  } else if (remainingSec > 180) {
    mooringState = "RAMP_DEPLOYED";
    mooringStateText = "Palamar Bağlı & Rampa İndirildi (Yolcu Alınıyor)";
    distanceMeters = 0;
    maneuverAngle = "0° Rıhtıma Yaslı";
    mooringColor = "text-emerald-500";
    rampPercent = 100;
  } else if (remainingSec > 60) {
    mooringState = "MOORING_LINES";
    mooringStateText = "Palamar Çözülme Hazırlığı (Son Turnike)";
    distanceMeters = 0;
    maneuverAngle = "2° Sancak Çözülme";
    mooringColor = "text-amber-500";
    rampPercent = 80;
  } else if (remainingSec > 0) {
    mooringState = "APPROACHING";
    mooringStateText = "Rampa Kapatılıyor / Palamar Bırakıldı";
    distanceMeters = 15;
    maneuverAngle = "8° Tornistan Çıkış";
    mooringColor = "text-rose-500";
    rampPercent = 20;
  }

  return (
    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Anchor size={15} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest block">
              CANLI PALAMAR & RAMPA TELEMETRİSİ
            </span>
            <h5 className="text-xs font-black text-white">
              {vesselName} ➔ {originPier} Rıhtımı
            </h5>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/40 border border-slate-700 ${mooringColor}`}>
          {mooringStateText.split("/")[0].trim()}
        </span>
      </div>

      {/* Mooring Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Rıhtım Mesafesi</span>
          <strong className="text-xs font-mono font-black text-cyan-300">
            {distanceMeters === 0 ? "0m (Yanaşık)" : `${distanceMeters}m`}
          </strong>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Manevra Açısı</span>
          <strong className="text-xs font-mono font-black text-amber-300">
            {maneuverAngle}
          </strong>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Rampa Durumu</span>
          <strong className={`text-xs font-mono font-black ${rampPercent > 50 ? "text-emerald-400" : "text-rose-400"}`}>
            %{rampPercent} Açık
          </strong>
        </div>
      </div>

      {/* İskelede Kalacak Süre (Berth Turnaround Countdown) Section */}
      {isAtBerth ? (
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dwellSec <= 60 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
              <Clock size={15} className={dwellSec <= 60 ? "animate-pulse" : ""} />
            </div>
            <div>
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">
                İSKELEDE KALACAK SÜRE (DWELL TIME)
              </span>
              <span className="text-[11px] font-bold text-slate-200">
                {dwellSec <= 60 ? "🚨 Kapılar Kapanıyor / Acele Edin" : "Turnikelerden Biniş Serbest"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-base font-mono font-black tabular-nums ${dwellSec <= 60 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
              {formattedDwell}
            </span>
            <span className="text-[9px] font-bold text-slate-400 block">Kalan Vakit</span>
          </div>
        </div>
      ) : null}

      {/* Visual Mooring Pier Dock Diagram */}
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
        {/* Pier side */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-8 bg-amber-600 rounded-sm shadow-sm" title="Rıhtım Babası (Mooring Bollard)" />
          <div className="text-left">
            <span className="text-[9px] font-mono text-slate-400 block">Rıhtım İskelesi</span>
            <strong className="text-[11px] font-black text-slate-200">{originPier}</strong>
          </div>
        </div>

        {/* Dynamic Mooring Rope Indicator */}
        <div className="flex-1 flex flex-col items-center justify-center px-2">
          <div className="w-full flex items-center justify-between text-[8px] font-mono text-slate-500 mb-0.5">
            <span>Baş Halat</span>
            <span>Kıç Palamar</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 ${
                mooringState === "RAMP_DEPLOYED"
                  ? "w-full bg-emerald-500"
                  : mooringState === "MOORING_LINES"
                  ? "w-3/4 bg-amber-500"
                  : "w-1/4 bg-rose-500"
              }`}
            />
          </div>
        </div>

        {/* Ferry side */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[9px] font-mono text-slate-400 block">Gemi Pruvası</span>
            <strong className="text-[11px] font-black text-slate-200">{vesselName}</strong>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500 flex items-center justify-center text-blue-400">
            <Ship size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
