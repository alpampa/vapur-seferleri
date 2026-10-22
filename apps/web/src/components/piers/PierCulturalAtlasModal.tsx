"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  X,
  MapPin,
  Clock,
  Compass,
  Tag,
  Building,
  Coffee,
  Ship,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Gift,
} from "lucide-react";
import {
  PIER_CULTURAL_ATLAS,
  PierCulturalAtlas,
  getPierCulturalAtlas,
} from "@/lib/data/pier-cultural-heritage";

interface PierCulturalAtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPierName?: string;
  onSelectPierForSchedules?: (pierName: string) => void;
}

export function PierCulturalAtlasModal({
  isOpen,
  onClose,
  initialPierName = "Moda",
  onSelectPierForSchedules,
}: PierCulturalAtlasModalProps) {
  const [selectedPierName, setSelectedPierName] = useState<string>(initialPierName);
  const [activeTab, setActiveTab] = useState<"HERITAGE" | "DISTRICT" | "PERKS">("HERITAGE");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialPierName) {
      setSelectedPierName(initialPierName);
    }
  }, [initialPierName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const currentAtlas: PierCulturalAtlas =
    getPierCulturalAtlas(selectedPierName) || PIER_CULTURAL_ATLAS["Moda"];

  const pierKeys = Object.keys(PIER_CULTURAL_ATLAS);

  const handleGoToSchedules = () => {
    if (onSelectPierForSchedules) {
      onSelectPierForSchedules(currentAtlas.pierName);
    }
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-5 flex min-h-full items-start sm:items-center justify-center">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${currentAtlas.pierName} İskelesi ve Semt Kültür Atlası`}
          className="relative my-auto w-full max-w-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white z-10 flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* ÜST BAŞLIK */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shadow-md shrink-0">
                <Landmark size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {currentAtlas.pierName.toUpperCase()} İSKELESİ & SEMT ATLASI
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    {currentAtlas.region} BÖLGESİ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  {currentAtlas.architect ? `${currentAtlas.architect} • ` : ""}
                  {currentAtlas.builtYear ? `${currentAtlas.builtYear} Yapımı • ` : ""}
                  {currentAtlas.architecturalStyle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Kapat"
              className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* İSKELE DEĞİŞTİRME SEÇİCİSİ */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <MapPin size={11} />
              <span>İskele Atlası:</span>
            </span>

            <div className="flex items-center gap-1.5">
              {pierKeys.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedPierName(name)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    currentAtlas.pierName === name
                      ? "bg-emerald-600 text-white shadow-xs font-black"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* MİMARİ TANITIM KARTI */}
          <div className="p-4 sm:p-5 bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-blue-500/10 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-500" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {currentAtlas.architecturalStyle}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                {currentAtlas.heritageStory}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoToSchedules}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
            >
              <Ship size={14} />
              <span>{currentAtlas.pierName} Seferlerini Gör</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* SEKME ÇUBUĞU */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("HERITAGE")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "HERITAGE"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Building size={13} />
              <span>İskele Mimarisi & Tarih</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("DISTRICT")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "DISTRICT"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Compass size={13} />
              <span>15 Dk Yürüme Çemberi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PERKS")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "PERKS"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Gift size={13} className="text-amber-500" />
              <span>Semt İşletmeleri</span>
            </button>
          </div>

          {/* SEKME İÇERİKLERİ */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {activeTab === "HERITAGE" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Öne Çıkan Mimari Detaylar
                  </span>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {currentAtlas.architectureHighlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span className="leading-snug">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px] uppercase font-sans">İnşa Yılı</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{currentAtlas.builtYear ?? "—"}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px] uppercase font-sans">Mimarı</span>
                    <strong className="text-slate-900 dark:text-white text-xs truncate block" title={currentAtlas.architect}>
                      {currentAtlas.architect ?? "—"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px] uppercase font-sans">Konum Bölgesi</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{currentAtlas.region} Yakası</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "DISTRICT" && (
              <div className="space-y-3 animate-fadeIn">
                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block px-1">
                  İskeleden İndiğinizde 15 Dakika İçinde Keşfedebileceğiniz Tarihi ve Kültürel Duraklar:
                </span>

                <div className="space-y-2.5">
                  {currentAtlas.districtHighlights.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shadow-2xs hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            {item.title}
                          </strong>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {item.highlightBadge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                          {item.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end justify-center text-right">
                        <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap flex items-center gap-0.5">
                          🚶 ~{item.walkMinutes} dk
                        </span>
                        <span className="text-[9px] text-slate-400">Yürüme mesafesi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "PERKS" && (
              <div className="space-y-3 animate-fadeIn">
                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider block px-1">
                  {currentAtlas.pierName} İskelesi çıkışı yerel işletme avantajları:
                </span>

                {currentAtlas.curatedLocalPartners.length > 0 ? (
                  <div className="space-y-2.5">
                    {currentAtlas.curatedLocalPartners.map((partner) => (
                      <div
                        key={partner.id}
                        className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-300 dark:border-amber-500/30 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[9.5px] font-bold text-amber-600 dark:text-amber-400 block uppercase">
                              {partner.badge} • İskeleden ~{partner.distanceMeters} m
                            </span>
                            <strong className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                              {partner.businessName}
                            </strong>
                          </div>
                          <span className="px-2 py-1 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xs">
                            {partner.couponCode}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                          {partner.dealDescription}
                        </p>

                        <div className="pt-2 border-t border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {partner.offerTitle}
                          </span>
                          {partner.phoneOrWhatsapp && (
                            <a
                              href={`https://wa.me/${partner.phoneOrWhatsapp}?text=${encodeURIComponent(
                                `Merhaba, Vapur Canlı uygulamasındaki #${partner.couponCode} ayrıcalığıyla bilgi almak istiyorum.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <span>WhatsApp Rezervasyon</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                    <Coffee size={24} className="mx-auto text-amber-500 mb-2 opacity-60" />
                    <p className="font-bold">Bu iskele için doğrulanmış yerel işletme kaydı henüz yok.</p>
                    <p className="text-[11px] mt-1">Doğrulanmış işletme ve avantaj bilgisi eklendiğinde burada listelenecektir.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ALT BİLGİ */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">
              İstanbul İskeleleri & Yaşayan Semt Kültürü Atlası
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
