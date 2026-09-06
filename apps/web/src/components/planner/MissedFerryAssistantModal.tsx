"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertOctagon, Train, Ship, Compass, ArrowRight, CheckCircle, Clock, Zap, MapPin, Anchor } from "lucide-react";
import { calculateMissedFerryAlternatives, MissedFerryRescuePlan } from "@/lib/services/missed-ferry-engine";
import { SharedSeaTaxiModal } from "@/components/taxishare/SharedSeaTaxiModal";

interface MissedFerryAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin: string;
  destination: string;
  missedDepartureTime: string;
}

export function MissedFerryAssistantModal({
  isOpen,
  onClose,
  origin,
  destination,
  missedDepartureTime
}: MissedFerryAssistantModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSeaTaxiOpen, setIsSeaTaxiOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const plan: MissedFerryRescuePlan = calculateMissedFerryAlternatives(origin, destination, missedDepartureTime);

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto min-h-full">
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative my-auto w-full max-w-lg bg-white dark:bg-[#0c1220] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-md">
                <AlertOctagon size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    VAPURU KAÇIRDIM! NE YAPMALIYIM?
                  </h3>
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 px-1.5 py-0.2 rounded font-black">
                    KURTARMA PLANI
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {origin} ➔ {destination} ({missedDepartureTime} seferi kaçırıldı)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 mb-4">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300 mb-1">
              <Zap size={14} className="text-amber-500" />
              <span>En Hızlı Alternatif: ~{plan.fastestOptionMinutes} Dakikada Karşıya Geçiş</span>
            </div>
            <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
              {plan.summary}
            </p>
          </div>

          {/* Paylaşımlı Deniz Taksi Banner */}
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Anchor size={16} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  GECE / ACİL DENİZ TAKSİ ÇAĞIR
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  İskeledeki diğer yolcularla masrafı bölüşerek geçin
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSeaTaxiOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shrink-0"
            >
              Hesapla ➔
            </button>
          </div>

          {/* Alternatives List */}
          <div className="space-y-3">
            {plan.alternatives.map((alt, idx) => (
              <div
                key={alt.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-xl text-white ${alt.badgeBg}`}>
                      {alt.type === "MARMARAY" || alt.type === "METRO" ? <Train size={16} /> : <Ship size={16} />}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {idx + 1}. {alt.title}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {alt.subtitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 shrink-0">
                    ~{alt.estimatedTravelMinutes} dk
                  </span>
                </div>

                {/* Instructions steps */}
                <div className="space-y-1.5 my-2.5 pl-2 border-l-2 border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  {alt.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold shrink-0">➔</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Info: Cost & Departure */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Ücret: {alt.costEstimate}
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {alt.departureNotice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <SharedSeaTaxiModal
        isOpen={isSeaTaxiOpen}
        onClose={() => setIsSeaTaxiOpen(false)}
        defaultOrigin={origin}
        defaultDestination={destination}
      />
    </AnimatePresence>,
    document.body
  );
}
