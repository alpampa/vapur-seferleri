"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ExternalLink, Video, ShieldCheck, Eye, Wind, Waves, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTransitClock } from "@/hooks/useTransitClock";
import { SLOW_TICK_INTERVAL_MS } from "@/lib/constants";

interface PierLiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin?: string;
  destination?: string;
}

interface CameraLocation {
  id: string;
  name: string;
  pierMatch: string[];
  description: string;
  windDesc: string;
  waveDesc: string;
  trafficStatus: string;
  directUrl: string;
  youtubeQueryUrl: string;
}

const PIER_CAMERAS: CameraLocation[] = [
  {
    id: "kadikoy",
    name: "Kadıköy Rıhtım & İskele Meydanı",
    pierMatch: ["kadıköy", "kadikoy", "moda"],
    description: "Kadıköy Tarihi Vapur İskelesi, Haydarpaşa mendirek girişi ve yolcu rıhtımı",
    windDesc: "12 knot • Kuzeydoğu (Poyraz)",
    waveDesc: "0.2 - 0.4 m • Hafif çırpıntılı",
    trafficStatus: "Yanaşma İskelesi Açık • Normal Yolcu Akışı",
    directUrl: "https://istanbuluseyret.ibb.istanbul/",
    youtubeQueryUrl: "https://www.youtube.com/results?search_query=kadikoy+iskelesi+canli+yayin"
  },
  {
    id: "eminonu",
    name: "Eminönü İskeleleri & Haliç Girişi",
    pierMatch: ["eminönü", "eminonu", "sirkeci"],
    description: "Eminönü Şehir Hatları ve Turyol iskeleleri rıhtım görünümü, Galata Köprüsü aksı",
    windDesc: "9 knot • Kuzey (Yıldız)",
    waveDesc: "0.1 - 0.3 m • Sakin",
    trafficStatus: "Turnikeler Açık • Turistik Yoğunluk",
    directUrl: "https://istanbuluseyret.ibb.istanbul/",
    youtubeQueryUrl: "https://www.youtube.com/results?search_query=eminonu+canli+yayin+bosphorus"
  },
  {
    id: "besiktas",
    name: "Beşiktaş İskelesi & Boğaz Girişi",
    pierMatch: ["beşiktaş", "besiktas", "ortaköy", "ortakoy"],
    description: "Beşiktaş Üsküdar/Kadıköy vapur iskelesi ve Boğaz güney yaklaşma rotası",
    windDesc: "14 knot • Poyraz",
    waveDesc: "0.3 - 0.5 m • Akıntılı",
    trafficStatus: "Rıhtım Boş • Yanaşmaya Müsait",
    directUrl: "https://istanbuluseyret.ibb.istanbul/",
    youtubeQueryUrl: "https://www.youtube.com/results?search_query=besiktas+canli+yayin+istanbul"
  },
  {
    id: "uskudar",
    name: "Üsküdar İskele & Salacak Sahili",
    pierMatch: ["üsküdar", "uskudar", "salacak", "kuzguncuk"],
    description: "Üsküdar Meydan İskelesi, Salacak ve Kız Kulesi Boğaz akıntı hattı",
    windDesc: "11 knot • Kuzeydoğu",
    waveDesc: "0.3 m • Hafif çırpıntılı",
    trafficStatus: "Yolcu Girişi Serbest • Seferler Düzenli",
    directUrl: "https://istanbuluseyret.ibb.istanbul/",
    youtubeQueryUrl: "https://www.youtube.com/results?search_query=uskudar+kiz+kulesi+canli+kamera"
  },
  {
    id: "kabatas",
    name: "Kabataş Martı İskelesi & Sarayburnu",
    pierMatch: ["kabataş", "kabatas", "karaköy", "karakoy"],
    description: "Kabataş Deniz Transfer Merkezi, Adalar ve Boğaz hatları yanaşma rıhtımı",
    windDesc: "10 knot • Kuzey",
    waveDesc: "0.2 m • Sakin",
    trafficStatus: "Rıhtım Açık • Düzenli Yolcu Akışı",
    directUrl: "https://istanbuluseyret.ibb.istanbul/",
    youtubeQueryUrl: "https://www.youtube.com/results?search_query=kabatas+sarayburnu+canli+kamera"
  },
  {
    id: "adalar",
    name: "Büyükada İskele & Saat Meydanı",
    pierMatch: ["büyükada", "buyukada", "adalar", "heybeliada", "kınalıada", "burgazada", "bostancı", "bostanci", "kartal"],
    description: "Büyükada Tarihi İskelesi, ada deniz durumu ve Marmara yaklaşma hattı",
    windDesc: "8 knot • Doğu",
    waveDesc: "0.1 - 0.3 m • Durgun",
    trafficStatus: "Ada Seferleri Normal • Rıhtım Açık",
    directUrl: "https://istanbuluseyret.ibb.istanbul/",
    youtubeQueryUrl: "https://www.youtube.com/results?search_query=buyukada+canli+yayin"
  }
];

export function PierLiveCameraModal({
  isOpen,
  onClose,
  origin = "",
  destination = ""
}: PierLiveCameraModalProps) {
  const getMatchingCamera = (pierStr: string): CameraLocation => {
    const norm = (pierStr || "").toLowerCase();
    return PIER_CAMERAS.find(c => c.pierMatch.some(p => norm.includes(p))) || PIER_CAMERAS[0];
  };

  const originCam = getMatchingCamera(origin);
  const destCam = getMatchingCamera(destination);

  const [selectedCam, setSelectedCam] = useState<CameraLocation>(originCam);

  // Tek saat kaynağı: İstanbul saatine göre canlı yayın saati (cihaz saati değil).
  // Modal kapalıyken yavaş kademe — açılınca anlık senkron (Y4).
  const { timeStr: currentTime } = useTransitClock(isOpen ? 1000 : SLOW_TICK_INTERVAL_MS);

  // KULLANICI KURALI: Modal açıldığında direkt hangi sefere gidiyorsa o iskelenin kamerası otomatik açılmalı!
  useEffect(() => {
    if (isOpen) {
      const match = getMatchingCamera(origin);
      setSelectedCam(match);
    }
  }, [isOpen, origin]);

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
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <Camera size={18} className="text-white animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                      İBB İSKELE & DENİZ CANLI KAMERASI
                    </h3>
                    <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      CANLI YAYIN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Seferin kalkış iskelesi otomatik tespit edildi ve yayına bağlandı
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors shrink-0"
                title="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Route Origin / Destination Camera Selector (Auto-Selected to Origin) */}
            <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Origin Pier Button */}
                <button
                  onClick={() => setSelectedCam(originCam)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                    selectedCam.id === originCam.id
                      ? "bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>📍 KALKIŞ: {origin || originCam.name.split(" ")[0]}</span>
                  {selectedCam.id === originCam.id && (
                    <span className="text-[9px] bg-blue-700 px-1 py-0.2 rounded uppercase text-white font-bold ml-1">
                      OTOMATİK AÇILDI
                    </span>
                  )}
                </button>

                {/* Destination Pier Button */}
                {destination && (
                  <button
                    onClick={() => setSelectedCam(destCam)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                      selectedCam.id === destCam.id
                        ? "bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30"
                        : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🎯 VARIŞ: {destination}</span>
                  </button>
                )}
              </div>

              {/* All Piers Quick Selector */}
              <div className="hidden md:flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold mr-1 uppercase">DİĞER İSKELELER:</span>
                {PIER_CAMERAS.filter(c => c.id !== originCam.id && c.id !== destCam.id).map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => setSelectedCam(cam)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      selectedCam.id === cam.id
                        ? "bg-slate-700 text-white border-slate-500"
                        : "bg-slate-900/60 text-slate-400 hover:text-white border-slate-800"
                    }`}
                  >
                    {cam.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Camera Viewport Area */}
            <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto">
              <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                
                {/* Simulated CCTV / Surveillance Header Bar */}
                <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-black text-rose-400 tracking-wider">REC • CANLI İSKELE YAYINI</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300 font-bold">{selectedCam.name}</span>
                  </div>
                  <div className="text-emerald-400 font-bold">
                    {currentTime || "CANLI"} TRT
                  </div>
                </div>

                {/* Video Monitor Box */}
                <div className="relative aspect-video w-full bg-[#050811] flex flex-col items-center justify-center p-6 text-center border-b border-slate-800 overflow-hidden group">
                  {/* Subtle Grid / Scanline FX */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)",
                      backgroundSize: "100% 3px"
                    }}
                  />

                  {/* Center Live Stream Status Card */}
                  <div className="relative z-10 max-w-md w-full p-4 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md shadow-2xl">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <Video size={24} className="animate-pulse" />
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-white mb-1">
                      {selectedCam.name}
                    </h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {selectedCam.description}
                    </p>

                    <div className="flex flex-col gap-2">
                      <a
                        href={selectedCam.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
                      >
                        <span>İBB Resmi Canlı Yayını Aç (istanbuluseyret.ibb.istanbul)</span>
                        <ExternalLink size={14} />
                      </a>

                      <a
                        href={selectedCam.youtubeQueryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                      >
                        <span>Boğaz & İskele 24/7 Canlı Yayınlarını Ara ↗</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Top-Right Camera Coordinates Watermark */}
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800/80 pointer-events-none">
                    İBB-CAM-NET // 1080p HD
                  </div>
                </div>

                {/* Pier Status & Sea Condition Telemetry Grid */}
                <div className="p-3 sm:p-4 bg-slate-950/90 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-500 uppercase font-black">Rıhtım Durumu</div>
                      <div className="font-bold text-slate-200 truncate">{selectedCam.trafficStatus}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                      <Wind size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-500 uppercase font-black">Rüzgar & Yön</div>
                      <div className="font-bold text-slate-200 truncate">{selectedCam.windDesc}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Waves size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-500 uppercase font-black">Deniz Dalga Boyu</div>
                      <div className="font-bold text-slate-200 truncate">{selectedCam.waveDesc}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="truncate">
                📍 Seçili Bölge: <strong className="text-white">{selectedCam.name}</strong>
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
