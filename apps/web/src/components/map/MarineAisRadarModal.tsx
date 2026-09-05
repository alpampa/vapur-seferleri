"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Radar, X, ExternalLink, Radio, Compass, Ship, Info } from "lucide-react";
import { useState } from "react";

interface MarineAisRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin?: string;
  destination?: string;
  lat?: number;
  lng?: number;
}

export function MarineAisRadarModal({
  isOpen,
  onClose,
  origin,
  destination,
  lat = 41.015,
  lng = 29.015
}: MarineAisRadarModalProps) {
  const [activeProvider, setActiveProvider] = useState<"VESSELFINDER" | "MARINETRAFFIC">("VESSELFINDER");

  // Dynamic coordinates based on route or default to Istanbul Bosphorus
  const centerLat = lat || 41.015;
  const centerLng = lng || 29.015;

  const vesselFinderEmbedUrl = `https://www.vesselfinder.com/aismap?zoom=13&lat=${centerLat}&lon=${centerLng}&width=100%25&height=100%25&names=true&machinery=false&show_track=true`;
  const marineTrafficDirectUrl = `https://www.marinetraffic.com/tr/ais/home/centerx:${centerLng}/centery:${centerLat}/zoom:14`;
  const vesselFinderDirectUrl = `https://www.vesselfinder.com/?bbox=${centerLng - 0.08},${centerLat - 0.06},${centerLng + 0.08},${centerLat + 0.06}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 260 }}
            className="fixed inset-3 sm:inset-6 md:inset-10 lg:inset-16 bg-[#0a0f1d] border border-slate-700/80 rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl text-white"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <Radar size={18} className="text-white animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                      <span>CANLI DENİZ RADARI</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                        AIS CANLI
                      </span>
                    </h2>
                    {origin && destination && (
                      <span className="text-[11px] text-amber-300 font-bold hidden md:inline">
                        ({origin} ➔ {destination})
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    İstanbul Boğazı & Marmara'daki gerçek gemi adları, telsiz sinyalleri ve anlık hızları
                  </p>
                </div>
              </div>

              {/* Providers Switcher & Close */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => setActiveProvider("VESSELFINDER")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activeProvider === "VESSELFINDER"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    VesselFinder
                  </button>
                  <button
                    onClick={() => setActiveProvider("MARINETRAFFIC")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activeProvider === "MARINETRAFFIC"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    MarineTraffic
                  </button>
                </div>

                <a
                  href={activeProvider === "MARINETRAFFIC" ? marineTrafficDirectUrl : vesselFinderDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
                  title="Tam Ekran Dış Bağlantıda Aç"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Tam Ekran</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Radar View Area */}
            <div className="flex-1 relative bg-black">
              {activeProvider === "VESSELFINDER" ? (
                <iframe
                  title="VesselFinder Live AIS Radar"
                  src={vesselFinderEmbedUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950/90">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/30">
                    <Radio size={32} className="animate-pulse" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mb-2">
                    MarineTraffic Canlı Deniz Haritası
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-5 leading-relaxed">
                    MarineTraffic güvenlik protokolleri gereği canlı haritayı doğrudan tarayıcı sekmesinde görüntülemek için aşağıdaki bağlantıya tıklayabilirsiniz.
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href={marineTrafficDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink size={14} />
                      <span>MarineTraffic Radarında Aç (İstanbul)</span>
                    </a>
                    <button
                      onClick={() => setActiveProvider("VESSELFINDER")}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                    >
                      İç Gömülü Radara Dön
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer: Live AIS Info & Explanation */}
            <div className="p-2.5 sm:p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Info size={13} className="text-cyan-400 shrink-0" />
                <span>
                  <strong>AIS Nedir?</strong> Vapurların üzerindeki VHF radyo vericileridir. Haritadaki gemi simgelerine dokunarak <strong>Barış Manço, Şehit Sami Akbulut, Moda</strong> gibi gerçek gemi adlarını görebilirsiniz.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  ● CANLI SİNYAL AKIŞI
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
