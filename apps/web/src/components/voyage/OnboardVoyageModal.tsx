"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Ship, Compass, Gauge, LifeBuoy, Volume2, MapPin, Radio, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { playHistoricalFerryHorn } from "@/lib/utils/sound";

interface OnboardVoyageModalProps {
  isOpen: boolean;
  onClose: () => void;
  vesselName?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  operator?: string;
}

export function OnboardVoyageModal({
  isOpen,
  onClose,
  vesselName = "ŞH-PAŞABAHÇE",
  origin = "Kadıköy",
  destination = "Karaköy",
  departureTime = "18:15",
  operator = "Şehir Hatları"
}: OnboardVoyageModalProps) {
  const [speedKts, setSpeedKts] = useState(11.8);
  const [headingDeg, setHeadingDeg] = useState(318);
  const [etaMinutes, setEtaMinutes] = useState(12);

  // Micro-fluctuations in AIS telemetry to mirror live vessel motion
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSpeedKts(prev => Number((11.4 + Math.random() * 0.8).toFixed(1)));
      setHeadingDeg(prev => Math.round(315 + Math.random() * 6));
      setEtaMinutes(prev => (prev > 1 ? prev : 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-lg bg-[#070d18] border border-blue-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Radio size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white tracking-tight">
                    CANLI GEMİ İÇİ SEYİR KOKPİTİ
                  </h3>
                  <span className="text-[9px] font-mono font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded uppercase animate-pulse">
                    ONBOARD AIS
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold">
                  Telsiz (AIS) Eşleştirilmiş Canlı Gemi Telemetrisi & Emniyet Kartı
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Active Vessel Telemetry Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950/60 border border-blue-500/30 mb-4 shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Ship size={20} className="text-emerald-400" />
                <span className="text-lg font-black text-white tracking-tight">
                  {vesselName}
                </span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold">
                  MMSI: 271000101
                </span>
              </div>
              <span className="text-xs font-bold text-amber-300">
                {origin} ➔ {destination}
              </span>
            </div>

            {/* 3 Cockpit Gauges */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-black uppercase mb-0.5">
                  <Gauge size={12} />
                  <span>Seyir Hızı</span>
                </div>
                <div className="font-mono text-lg font-black text-white">
                  {speedKts} <span className="text-xs text-emerald-400">Kts</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  ~{(speedKts * 1.852).toFixed(1)} km/s
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-400 text-[10px] font-black uppercase mb-0.5">
                  <Compass size={12} />
                  <span>Pruva / Rota</span>
                </div>
                <div className="font-mono text-lg font-black text-white">
                  {headingDeg}° <span className="text-xs text-blue-400">NW</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  Kuzeybatı Seyir
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-black uppercase mb-0.5">
                  <MapPin size={12} />
                  <span>İskele ETA</span>
                </div>
                <div className="font-mono text-lg font-black text-amber-300">
                  ~{etaMinutes} <span className="text-xs text-amber-400">Dk</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono truncate">
                  {destination} Rıhtım
                </div>
              </div>
            </div>
          </div>

          {/* Quick Acoustic Ferry Horn Blast */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Volume2 size={18} className="text-amber-400 animate-pulse" />
              <div>
                <span className="text-xs font-black text-white block">Tarihi Buharlı Vapur Düdüğü</span>
                <span className="text-[10px] text-slate-400">Web Audio API ile 218 Hz buharlı rezonans akustik düdüğü</span>
              </div>
            </div>
            <button
              onClick={() => playHistoricalFerryHorn()}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 shadow-md transition-all active:scale-95"
            >
              🔊 Düdük Çal
            </button>
          </div>

          {/* SOLAS International Maritime Passenger Safety Guide */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <LifeBuoy size={14} className="text-rose-400" />
                <span>GEMİ İÇİ EMNİYET & TOPLANMA İSTASYONU (SOLAS)</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                RESMİ PROSEDÜR
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Can Yeleği Dolapları</strong>
                  <span className="text-slate-400 text-[11px]">
                    Ana salon koltuk altları ve üst açık güverte baş/kıç dolaplarında yetişkin ve çocuk can yelekleri mevcuttur.
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Toplanma İstasyonları (Muster Stations)</strong>
                  <span className="text-slate-400 text-[11px]">
                    Acil durumlarda üst açık güverte sancak ve iskele şişme can salı (liferaft) alanlarında toplanılır.
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Telsiz Emniyet Kanalı</strong>
                  <span className="text-slate-400 text-[11px]">
                    VHF Kanal 16 (Denizde Can Güvenliği) ve Kanal 12/13 (İstanbul VTS Gemi Trafik Hizmetleri).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
