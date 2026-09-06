"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Landmark, Compass, Ship, Footprints, MapPin, Sparkles, BookOpen, Clock, ArrowRight } from "lucide-react";
import { ADALAR_HERITAGE_DATA, IslandProfile } from "@/lib/data/adalar-heritage";

interface AdalarHeritageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIslandFilter?: (islandName: string) => void;
}

export function AdalarHeritageModal({ isOpen, onClose, onSelectIslandFilter }: AdalarHeritageModalProps) {
  const [selectedIslandId, setSelectedIslandId] = useState<string>("buyukada");

  if (!isOpen) return null;

  const currentIsland = ADALAR_HERITAGE_DATA.find(i => i.id === selectedIslandId) || ADALAR_HERITAGE_DATA[0];

  const handleFilterIslandTrips = (islandName: string) => {
    if (onSelectIslandFilter) {
      onSelectIslandFilter(islandName);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-4 flex min-h-full items-start sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="relative my-auto w-full max-w-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white z-10 flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-rose-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                <Landmark size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                    ADALAR TARİHİ MİRAS & ULAŞIM REHBERİ
                  </h3>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                    KÜLTÜR ROTASI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Tarihi yapılar, yazarların evleri, manastırlar ve vapurla en hızlı ulaşım hatları
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Island Tabs Selector */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar shrink-0">
            {ADALAR_HERITAGE_DATA.map((island) => (
              <button
                key={island.id}
                onClick={() => setSelectedIslandId(island.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedIslandId === island.id
                    ? "bg-amber-600 text-white shadow-sm scale-[1.02]"
                    : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <span>🏝️</span>
                <span>{island.name}</span>
                <span className="text-[10px] opacity-75 font-normal">({island.greekName})</span>
              </button>
            ))}
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Island Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-blue-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    {currentIsland.name} ({currentIsland.greekName})
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                    {currentIsland.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                  {currentIsland.overview}
                </p>
              </div>

              <button
                onClick={() => handleFilterIslandTrips(currentIsland.name)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
              >
                <Ship size={14} />
                <span>{currentIsland.name} Seferlerini Listele</span>
              </button>
            </div>

            {/* Section 1: Nasıl Ulaşılabilir? (Ulaşım Matrisi) */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Compass size={16} className="text-blue-500" />
                <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {currentIsland.name}\'ya Vapurla Nasıl Ulaşılır?
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentIsland.transitRoutes.map((route, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                        <MapPin size={12} className="text-rose-500" />
                        <span>{route.departurePier} Çıkışlı</span>
                      </span>
                      <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        ⏱️ ~{route.approxDurationMin} dk
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>Operatörler:</strong> {route.operators.join(", ")}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      🚇 {route.transitConnection}
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 italic bg-white/60 dark:bg-slate-800/40 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      💡 {route.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Tarihi Noktalar & Kültür Mirası */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <BookOpen size={16} className="text-amber-500" />
                <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Tarihi Noktalar & Kültürel Hafıza ({currentIsland.heritagePoints.length} Eser)
                </h5>
              </div>

              <div className="space-y-3">
                {currentIsland.heritagePoints.map((point) => (
                  <div
                    key={point.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h6 className="text-sm font-black text-slate-900 dark:text-white">
                            {point.name}
                          </h6>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                            {point.era}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                          ⭐ {point.significance}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40">
                          <Footprints size={12} />
                          <span>{point.walkingMinutes} dk ({point.distanceFromPierKm} km)</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {point.description}
                    </p>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Nasıl Yürünür:</span>
                      <span>{point.howToWalk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Prens Adaları Tarih & Denizcilik Dokümantasyonu
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-black transition-colors"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
