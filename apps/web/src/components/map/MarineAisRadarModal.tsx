"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Info, Search, ShieldAlert, X } from "lucide-react";
import { ISTANBUL_FERRY_FLEET } from "@/lib/agents/fleet-registry";
import { matchesTurkishSearch } from "@/lib/utils/search-normalizer";
import { getDynamicMarineTrafficUrl, getDynamicVesselFinderUrl } from "@/lib/radar-links";

interface MarineAisRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin?: string;
  destination?: string;
}

/**
 * Gemi sicili ve harici AIS bağlantıları.
 *
 * Bu bileşen GERÇEK AIS verisi göstermez. Daha önce simüle edilen hız,
 * ilerleme ve gemi konumu kaldırıldı; yalnızca doğrulanabilir filo sicili ve
 * harici canlı gemi takip bağlantıları sunulur.
 */
export function MarineAisRadarModal({
  isOpen,
  onClose,
  origin = "Kadıköy",
  destination = "Eminönü",
}: MarineAisRadarModalProps) {
  const [fleetSearch, setFleetSearch] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const filteredFleet = useMemo(() => {
    if (!fleetSearch.trim()) return ISTANBUL_FERRY_FLEET;
    return ISTANBUL_FERRY_FLEET.filter(
      (vessel) =>
        matchesTurkishSearch(vessel.name, fleetSearch) ||
        matchesTurkishSearch(vessel.operator, fleetSearch) ||
        vessel.mmsi.includes(fleetSearch.trim()),
    );
  }, [fleetSearch]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="marine-registry-title"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          onClick={(event) => event.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-white"
        >
          <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                id="marine-registry-title"
                className="text-sm font-black text-white truncate"
              >
                Gemi Sicili ve Harici Canlı Takip
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {origin} ➔ {destination} · uygulama içinde AIS konumu gösterilmez
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Gemi sicilini kapat"
              className="w-10 h-10 -mr-1 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-3 flex items-start gap-2">
              <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[11px] leading-relaxed text-amber-100">
                Bu ekran <strong>gerçek AIS verisi kullanmaz</strong>. Simüle hız, ilerleme
                veya gemi konumu gösterilmez. Geminin o anki fiziksel konumu için aşağıdaki
                harici canlı takip bağlantılarını kullanın.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={getDynamicMarineTrafficUrl({ origin, zoom: 15 })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 min-h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs inline-flex items-center gap-1.5"
              >
                <span>{origin} çevresi — MarineTraffic</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
              <a
                href={getDynamicVesselFinderUrl({ origin, destination, zoom: 14 })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 min-h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-cyan-500/30 font-bold text-xs inline-flex items-center gap-1.5"
              >
                <span>Rota — VesselFinder</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black uppercase text-slate-200 tracking-wider">
                Filo sicili ({filteredFleet.length})
              </span>
              <div className="relative w-full sm:w-56">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Vapur adı veya MMSI ara..."
                  value={fleetSearch}
                  onChange={(event) => setFleetSearch(event.target.value)}
                  className="w-full min-h-10 bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredFleet.map((vessel) => (
                <div
                  key={vessel.mmsi}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{vessel.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {vessel.builtYear}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      MMSI: <span className="text-cyan-400">{vessel.mmsi}</span> · {vessel.operator}
                    </div>
                  </div>

                  <a
                    href={`https://www.marinetraffic.com/en/ais/details/ships/mmsi:${vessel.mmsi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-2 min-h-10 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white text-[10px] font-bold border border-blue-500/40 inline-flex items-center gap-1 shrink-0"
                    title={`${vessel.name} için harici AIS sayfasını aç`}
                  >
                    <span>Harici AIS</span>
                    <ExternalLink size={10} aria-hidden="true" />
                  </a>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5 text-slate-500" aria-hidden="true" />
              <span>
                İşletmeler sefer tarifesinde gemi adı garanti etmez; gemiler günlük filo
                havuzundan atanır. Bu nedenle tarife kartında gemi adı gösterilmez.
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
