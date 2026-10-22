"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Landmark, Compass, Ship, Footprints, MapPin, Sparkles, BookOpen, Clock, ArrowRight, Image as ImageIcon, ExternalLink, Radio } from "lucide-react";
import { ADALAR_HERITAGE_DATA, IslandProfile, IslandHeritagePoint } from "@/lib/data/adalar-heritage";

interface AdalarHeritageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIslandFilter?: (islandName: string) => void;
  onOpenSatelliteMap?: (coords: { lat: number; lng: number; zoom: number }, islandName: string) => void;
}

export function AdalarHeritageModal({
  isOpen,
  onClose,
  onSelectIslandFilter,
  onOpenSatelliteMap
}: AdalarHeritageModalProps) {
  const [selectedIslandId, setSelectedIslandId] = useState<string>("buyukada");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"HERITAGE" | "GALLERY" | "TRANSIT">("HERITAGE");

  if (!isOpen) return null;

  const currentIsland = ADALAR_HERITAGE_DATA.find(i => i.id === selectedIslandId) || ADALAR_HERITAGE_DATA[0];

  const handleFilterIslandTrips = (islandName: string) => {
    if (onSelectIslandFilter) {
      onSelectIslandFilter(islandName);
    }
    onClose();
  };

  const handleOpenSatellite = () => {
    if (onOpenSatelliteMap) {
      onOpenSatelliteMap(currentIsland.satelliteCoordinates, currentIsland.name);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 260 }}
        role="dialog"
        aria-modal="true"
        aria-label="Adalar Kültür Atlası ve Tarihi Miras Rehberi"
        className="relative my-auto w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white z-10 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-bold shadow-md">
              <Compass size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  İSTANBUL ADALAR KÜLTÜR ATLASI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Kültürel Miras Rehberi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prens Adalarının mimari başyapıtları, edebiyat durakları ve tarihi iskeleleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenSatellite}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Adanın gerçek uydu haritasını açar"
            >
              <Radio size={13} className="text-cyan-400 animate-pulse" />
              <span>Uydudan Gör</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Island Navigation Tabs */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0">
          {ADALAR_HERITAGE_DATA.map((island) => (
            <button
              key={island.id}
              type="button"
              onClick={() => {
                setSelectedIslandId(island.id);
                setSelectedPhotoIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedIslandId === island.id
                  ? "bg-amber-500 text-slate-950 shadow-md scale-102"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-850 hover:text-white"
              }`}
            >
              <span>{island.name}</span>
              <span className={`text-[10px] font-normal opacity-80 ${selectedIslandId === island.id ? "text-slate-900 font-bold" : "text-slate-400"}`}>
                ({island.greekName})
              </span>
            </button>
          ))}
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Island Hero Photographic Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-lg aspect-video sm:aspect-[21/8] max-h-72">
            <img
              src={currentIsland.heroImageUrl}
              alt={currentIsland.heroImageCaption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                  {currentIsland.badge}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-emerald-400 border border-emerald-500/40">
                  Koordinat: {currentIsland.satelliteCoordinates.lat}° K, {currentIsland.satelliteCoordinates.lng}° D
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                {currentIsland.name} • {currentIsland.greekName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl drop-shadow-md">
                {currentIsland.overview}
              </p>
              <p className="text-[10px] text-slate-300/80 mt-1">
                Görsel: {currentIsland.heroImageCaption} ({currentIsland.heroImageCredit})
              </p>
            </div>
          </div>

          {/* Sub-Tabs: Kültürel Miras Noktaları / Fotoğraf Galerisi / Ulaşım */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("HERITAGE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "HERITAGE"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Landmark size={13} />
              <span>Tarihi ve Kültürel Noktalar ({currentIsland.heritagePoints.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("GALLERY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "GALLERY"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ImageIcon size={13} />
              <span>Fotoğraf Galerisi ({currentIsland.gallery.length + 1})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("TRANSIT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "TRANSIT"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Ship size={13} />
              <span>Deniz Ulaşım Hatları</span>
            </button>
          </div>

          {/* TAB 1: HERITAGE POINTS WITH REAL PHOTOGRAPHS */}
          {activeTab === "HERITAGE" && (
            <div className="space-y-4">
              {currentIsland.heritagePoints.map((point) => (
                <div
                  key={point.id}
                  className="rounded-2xl bg-slate-800/60 border border-slate-700/80 overflow-hidden flex flex-col md:flex-row gap-4 p-4 shadow-sm hover:border-slate-600 transition-colors"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative w-full md:w-56 h-40 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-950">
                    <img
                      src={point.imageUrl}
                      alt={point.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/40">
                        {point.era}
                      </span>
                    </div>
                  </div>

                  {/* Narrative & Details */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-white tracking-tight">
                        {point.name}
                      </h4>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <Footprints size={12} />
                        İskeleden {point.walkingMinutes} dk ({point.distanceFromPierKm} km)
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {point.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                      <Sparkles size={13} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 font-bold">Kültürel Önemi: </strong>
                        {point.significance}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/60 text-[11px] text-slate-400 flex items-center gap-2">
                      <MapPin size={12} className="text-blue-400 shrink-0" />
                      <span className="truncate">
                        <strong>Yürüyüş Rotası: </strong> {point.howToWalk}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: FULL PHOTO GALLERY */}
          {activeTab === "GALLERY" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentIsland.gallery.map((photo) => (
                  <div
                    key={photo.id}
                    className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/80 group flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/70 text-slate-200">
                        {photo.category}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 flex-1 flex flex-col justify-between">
                      <p className="text-xs font-bold text-white line-clamp-2">
                        {photo.caption}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2">
                        Kaynak: {photo.credit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSIT ROUTES */}
          {activeTab === "TRANSIT" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                {currentIsland.name} iskelesine bağlanan ana deniz hatları, ortalama seyir süreleri ve aktarma ipuçları:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentIsland.transitRoutes.map((route, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-sm font-black text-white flex items-center gap-1.5">
                        <Ship size={14} className="text-blue-400" />
                        <span>{route.departurePier} ➔ {currentIsland.name}</span>
                      </h5>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        ~{route.approxDurationMin} dk
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>İşletmeler:</span>
                      <strong className="text-slate-200">{route.operators.join(", ")}</strong>
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      💡 {route.tip}
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Compass size={11} className="text-amber-400 shrink-0" />
                      <span>{route.transitConnection}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Landmark size={14} className="text-amber-400" />
            <span>{currentIsland.name} Kültür Rehberi • Adalar Belediyesi & İBB Miras</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenSatellite}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Radio size={13} className="text-cyan-400" />
              <span>Uydudan Adaları İncele</span>
            </button>

            <button
              type="button"
              onClick={() => handleFilterIslandTrips(currentIsland.name)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <span>{currentIsland.name} Seferlerini Listele</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
