"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ExternalLink, Video, ShieldCheck, Eye } from "lucide-react";
import { useState } from "react";

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
  streamUrl: string;
  directUrl: string;
}

const PIER_CAMERAS: CameraLocation[] = [
  {
    id: "kadikoy",
    name: "Kadıköy Rıhtım & İskele",
    pierMatch: ["kadıköy", "kadikoy"],
    description: "Kadıköy Vapur İskelesi, yolcu yoğunluğu ve deniz trafiği canlı yayını",
    streamUrl: "https://istanbuluseyret.ibb.gov.tr/kadikoy-meydani/",
    directUrl: "https://istanbuluseyret.ibb.gov.tr/kadikoy-meydani/"
  },
  {
    id: "eminonu",
    name: "Eminönü İskelesi & Meydan",
    pierMatch: ["eminönü", "eminonu"],
    description: "Eminönü Şehir Hatları ve Turyol iskeleleri rıhtım görünümü",
    streamUrl: "https://istanbuluseyret.ibb.gov.tr/eminonu-meydani/",
    directUrl: "https://istanbuluseyret.ibb.gov.tr/eminonu-meydani/"
  },
  {
    id: "besiktas",
    name: "Beşiktaş İskelesi & Boğaz",
    pierMatch: ["beşiktaş", "besiktas"],
    description: "Beşiktaş Üsküdar/Kadıköy vapur iskelesi ve Boğaz giriş hattı",
    streamUrl: "https://istanbuluseyret.ibb.gov.tr/besiktas-meydani/",
    directUrl: "https://istanbuluseyret.ibb.gov.tr/besiktas-meydani/"
  },
  {
    id: "uskudar",
    name: "Üsküdar Sahil & Kız Kulesi",
    pierMatch: ["üsküdar", "uskudar"],
    description: "Üsküdar İskele Meydanı, Salacak ve Boğaz deniz akıntısı",
    streamUrl: "https://istanbuluseyret.ibb.gov.tr/uskudar-meydani/",
    directUrl: "https://istanbuluseyret.ibb.gov.tr/uskudar-meydani/"
  },
  {
    id: "kabatas",
    name: "Kabataş Martı İskelesi",
    pierMatch: ["kabataş", "kabatas"],
    description: "Kabataş Transfer Merkezi ve Adalar iskelesi rıhtımı",
    streamUrl: "https://istanbuluseyret.ibb.gov.tr/sarayburnu/",
    directUrl: "https://istanbuluseyret.ibb.gov.tr/sarayburnu/"
  },
  {
    id: "buyukada",
    name: "Büyükada İskele & Saat Meydanı",
    pierMatch: ["büyükada", "buyukada", "adalar", "heybeliada", "kınalıada", "burgazada"],
    description: "Büyükada Tarihi İskele, yanaşma rıhtımı ve ada deniz durumu",
    streamUrl: "https://istanbuluseyret.ibb.gov.tr/buyukada-saat-meydani/",
    directUrl: "https://istanbuluseyret.ibb.gov.tr/buyukada-saat-meydani/"
  }
];

export function PierLiveCameraModal({
  isOpen,
  onClose,
  origin = "",
  destination = ""
}: PierLiveCameraModalProps) {
  const normOrigin = (origin || "").toLowerCase();
  const normDest = (destination || "").toLowerCase();

  const defaultCam = PIER_CAMERAS.find(c => 
    c.pierMatch.some(p => normOrigin.includes(p) || normDest.includes(p))
  ) || PIER_CAMERAS[0];

  const [selectedCam, setSelectedCam] = useState<CameraLocation>(defaultCam);

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
                      İBB İskele & Deniz Canlı Kameraları
                    </h3>
                    <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                      CANLI YAYIN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    İstanbul Büyükşehir Belediyesi & UYM resmi turistik ve trafik deniz kameraları
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

            {/* Camera Switcher Pills */}
            <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto hide-scrollbar shrink-0">
              {PIER_CAMERAS.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCam(cam)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    selectedCam.id === cam.id
                      ? "bg-blue-600 border-blue-400 text-white shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <Eye size={12} className={selectedCam.id === cam.id ? "text-blue-200" : "text-slate-500"} />
                  <span>{cam.name}</span>
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center p-4">
              <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400">
                  <Video size={32} />
                </div>

                <h4 className="text-lg font-black text-white mb-1">
                  {selectedCam.name}
                </h4>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  {selectedCam.description}
                </p>

                <div className="space-y-2.5">
                  <a
                    href={selectedCam.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
                  >
                    <span>İBB Resmi Canlı Yayını İzle</span>
                    <ExternalLink size={16} />
                  </a>

                  <a
                    href="https://istanbuluseyret.ibb.gov.tr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                  >
                    <span>Tüm İstanbul Şehir Kameraları (İstanbul'u Seyret)</span>
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Tüm kameralar İBB resmi altyapısı üzerinden 7/24 canlı yayınlanmaktadır.</span>
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
