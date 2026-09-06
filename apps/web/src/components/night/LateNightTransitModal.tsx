"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Car, Bus, Clock, ShieldCheck, MapPin, Sparkles, Navigation, AlertTriangle, ArrowRight } from "lucide-react";
import { NIGHT_DOLMUS_ROUTES, NIGHT_TAXI_ESTIMATES, METROBUS_NIGHT_INFO } from "@/lib/data/night-transit-matrix";

interface LateNightTransitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LateNightTransitModal({ isOpen, onClose }: LateNightTransitModalProps) {
  const [activeTab, setActiveTab] = useState<"DOLMUS" | "TAXI" | "METROBUS">("DOLMUS");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-4 flex min-h-full items-start sm:items-center justify-center">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          className="relative my-auto w-full max-w-2xl bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white z-10 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-700 to-amber-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                <Moon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                    SON VAPUR KAÇTIYSA: GECE KURTARMA MATRİSİ
                  </h3>
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                    00:30 - 05:30
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Sarı dolmuş peronları, gece taksi tarifesi ve 7/24 Metrobüs aktarmaları
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab("DOLMUS")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "DOLMUS"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>🚕</span>
              <span>Sarı Dolmuşlar (7/24)</span>
            </button>

            <button
              onClick={() => setActiveTab("TAXI")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "TAXI"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>🚖</span>
              <span>Gece Taksi Ücretleri</span>
            </button>

            <button
              onClick={() => setActiveTab("METROBUS")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "METROBUS"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>🚌</span>
              <span>24h Metrobüs</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {/* DOLMUŞ TAB */}
            {activeTab === "DOLMUS" && (
              <div className="space-y-2.5 animate-fadeIn">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-xs font-medium leading-relaxed">
                  <strong>💡 Sarı Dolmuş Bilgisi:</strong> Gece vapurları sonlandıktan sonra Kadıköy Rıhtım, Beşiktaş ve Taksim arasında sarı dolmuşlar sabaha kadar kesintisiz çalışır. Doldukça kalkar, ortalama bekleme süresi 5-10 dakikadır.
                </div>

                <div className="space-y-2">
                  {NIGHT_DOLMUS_ROUTES.map((route) => (
                    <div
                      key={route.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {route.departurePierHub} ➔ {route.destination}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-600/40">
                              {route.operatingHours}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin size={11} className="text-amber-500 shrink-0" />
                            <span><strong>Durak:</strong> {route.standLocation}</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400 block">
                            {route.approxFareTl}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ⏱️ ~{route.approxDurationMin} dk
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-600 dark:text-slate-400 italic pt-1.5 border-t border-slate-200/80 dark:border-slate-800">
                        {route.tip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAXI TAB */}
            {activeTab === "TAXI" && (
              <div className="space-y-2.5 animate-fadeIn">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700/60 text-blue-800 dark:text-blue-300 text-xs font-medium leading-relaxed">
                  <strong>🚖 Gece Taksi Hesaplaması:</strong> UKOME resmi taksimetre açılış ve kilometre tarifesi ile 15 Temmuz Şehitler Köprüsü geçiş ücreti dahil hesaplanmış ortalama aralıklardır.
                </div>

                <div className="space-y-2">
                  {NIGHT_TAXI_ESTIMATES.map((taxi, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{taxi.fromPier}</span>
                          <ArrowRight size={12} className="text-blue-500" />
                          <span>{taxi.toPier}</span>
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          🛣️ <strong>Rota:</strong> {taxi.routeVia} ({taxi.distanceKm} km)
                        </p>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ {taxi.bridgeOrTunnelToll}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400 block">
                          {taxi.estimatedCostRangeTl}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          ⏱️ ~{taxi.approxDurationMin} dk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* METROBUS TAB */}
            {activeTab === "METROBUS" && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/60 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Bus size={20} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h5 className="text-sm font-black text-slate-900 dark:text-white">
                      {METROBUS_NIGHT_INFO.service}
                    </h5>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                      İstanbul\'un 24 saat kesintisiz kıtalararası omurgası
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300 block">Güzergah:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{METROBUS_NIGHT_INFO.coverage}</span>
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300 block">Gece Sefer Sıklığı:</strong>
                    <span className="text-slate-600 dark:text-slate-400 font-bold text-emerald-600 dark:text-emerald-400">{METROBUS_NIGHT_INFO.nightInterval}</span>
                  </div>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-300 block">İskele Bağlantısı:</strong>
                    <span className="text-slate-600 dark:text-slate-400">{METROBUS_NIGHT_INFO.pierHubConnection}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    💳 {METROBUS_NIGHT_INFO.fareInfo}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Gece Ulaşım & Emniyet Rehberi
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
