"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Ship, LifeBuoy, Volume2, MapPin, Clock, CheckCircle2 } from "lucide-react";
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
                <Ship size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white tracking-tight">
                    SEYİR BİLGİ KARTI
                  </h3>
                  <span className="text-[9px] font-mono font-black bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded uppercase">
                    PLANLANAN
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold">
                  Tarifedeki sefer bilgisi ve gemi içi emniyet notları
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

          {/* Planlanan sefer bilgisi — canlı AIS/telemetri YOK */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-blue-500/30 mb-4 shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Ship size={20} className="text-emerald-400" />
                <span className="text-lg font-black text-white tracking-tight">
                  {vesselName}
                </span>
                <span className="text-[10px] font-mono bg-slate-700/60 text-slate-300 border border-slate-600 px-1.5 py-0.2 rounded font-bold">
                  {operator}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-300">
                {origin} ➔ {destination}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-black uppercase mb-0.5">
                  <Clock size={12} />
                  <span>Kalkış</span>
                </div>
                <div className="font-mono text-lg font-black text-white">{departureTime}</div>
                <div className="text-[9px] text-slate-400 font-mono">tarife saati</div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-400 text-[10px] font-black uppercase mb-0.5">
                  <MapPin size={12} />
                  <span>Rota</span>
                </div>
                <div className="text-[11px] font-black text-white truncate">{destination}</div>
                <div className="text-[9px] text-slate-400 font-mono">varış iskelesi</div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-300 text-[10px] font-black uppercase mb-0.5">
                  <Ship size={12} />
                  <span>Gemi</span>
                </div>
                <div className="text-[11px] font-black text-white">Günlük atanır</div>
                <div className="text-[9px] text-slate-400 font-mono">garanti edilmez</div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug mt-2.5">
              Canlı hız, pruva ve konum verisi gösterilmez. Gemi ataması işletme tarafından
              sefer günü yapılır.
            </p>
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
