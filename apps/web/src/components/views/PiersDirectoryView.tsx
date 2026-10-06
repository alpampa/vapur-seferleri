"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Camera, Train, Navigation, Ship, ChevronRight } from "lucide-react";
import { ISTANBUL_PIERS } from "@/lib/data/piers";
import { getPierTransit } from "@/lib/data/pier-transit-connections";
import { calculatePierCrowdDensity } from "@/lib/utils/occupancy";
import { getPierMobility } from "@/lib/data/pier-parking-bicycle";
import { Car, Bike } from "lucide-react";
import { Users } from "lucide-react";
import { PierLiveCameraModal } from "@/components/map/PierLiveCameraModal";
import { Landmark, Tag, Sparkles, BookOpen, Compass } from "lucide-react";
import { AdalarHeritageModal } from "@/components/adalar/AdalarHeritageModal";
import { SponsoredDealsModal } from "@/components/commercial/SponsoredDealsModal";
import type { ScheduleCardDto } from "@/lib/types/schedule";

interface PiersDirectoryViewProps {
  schedules: ScheduleCardDto[];
  onSelectPierForSchedules?: (pierName: string) => void;
}

export function PiersDirectoryView({ schedules, onSelectPierForSchedules }: PiersDirectoryViewProps) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<"ALL" | "Adalar" | "Avrupa" | "Anadolu">("ALL");
  const [activeCameraPier, setActiveCameraPier] = useState<string | null>(null);
  const [isAdalarHeritageOpen, setIsAdalarHeritageOpen] = useState(false);
  const [isSponsoredDealsOpen, setIsSponsoredDealsOpen] = useState(false);

  const piersList = useMemo(() => {
    return Object.values(ISTANBUL_PIERS).filter(pier => {
      const matchesSearch = pier.name.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = selectedRegion === "ALL" || pier.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [search, selectedRegion]);

  const getPierDepartureCount = (pierName: string) => {
    return schedules.filter(s => s.origin.toLowerCase().includes(pierName.toLowerCase())).length;
  };

  return (
    <div className="px-3 py-3 max-w-4xl mx-auto space-y-3 animate-fadeIn pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d172a] to-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
            <MapPin size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>İSTANBUL VAPUR İSKELELERİ REHBERİ</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                {Object.keys(ISTANBUL_PIERS).length} İSKELE AKTİF
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tüm iskelelerin canlı kameraları, metro/tramvay aktarma hatları ve kalkan vapur saatleri
            </p>
          </div>
        </div>
      </div>

      {/* KULLANICI KURALI: İskeleler Bölümüne Taşınan 'Adalar Mirası' ve 'İskele Fırsatları' Panelleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Adalar Tarihi Mirası Rehber Kartı */}
        <div
          onClick={() => setIsAdalarHeritageOpen(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer group shadow-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Landmark size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  ADALAR TARİHİ MİRASI REHBERİ
                </h4>
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded">
                  KÜLTÜR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Rum Yetimhanesi, Troçki Evi, Ruhban Okulu, Sait Faik Müzesi ve adalara ulaşım rotaları
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-500 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* İskele Fırsatları & Yerel Sponsorluk Kartı */}
        <div
          onClick={() => setIsSponsoredDealsOpen(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Tag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  İSKELE AYRICALIKLARI & FIRSATLAR
                </h4>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                  SPONSOR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                İskele çevresi tarihi çay bahçeleri, ada bisiklet indirimleri ve yerel işletme avantajları
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-emerald-500 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Search & Region Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="İskele adı ara (örn: Kadıköy, Büyükada, Beşiktaş)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 hide-scrollbar">
          {(["ALL", "Adalar", "Anadolu", "Avrupa"] as const).map(reg => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                selectedRegion === reg
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {reg === "ALL" ? "Tüm İskeleler" : `${reg} Yakası`}
            </button>
          ))}
        </div>
      </div>

      {/* Pier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {piersList.map(pier => {
          const transitLines = getPierTransit(pier.name);
          const depCount = getPierDepartureCount(pier.name);
          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pier.lat},${pier.lng}`;

          return (
            <div
              key={pier.name}
              className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-black shrink-0">
                      📍
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        {pier.name} İskelesi
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {pier.region} Bölgesi • Turnikeler Açık
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md font-bold shrink-0">
                    {depCount} Günlük Sefer
                  </span>
                </div>

                {/* Transit Connections */}
                {transitLines.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                      <Train size={11} className="text-slate-400" />
                      <span>Raylı Sistem & Ulaşım Bağlantıları:</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {transitLines.map(t => (
                        <span
                          key={t.name}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${t.badgeBg}`}></span>
                          <strong>{t.line}</strong> {t.name.split(' ')[0]} ({t.walkMinutes} dk)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveCameraPier(pier.name)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1 transition-all"
                    title="İskele Canlı Kamerasını İzle"
                  >
                    <Camera size={13} />
                    <span>Canlı Kamera</span>
                  </button>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                    title="Google Haritalar ile Yol Tarifi Al"
                  >
                    <Navigation size={13} />
                    <span>Yol Tarifi</span>
                  </a>
                </div>

                {onSelectPierForSchedules && (
                  <button
                    onClick={() => onSelectPierForSchedules(pier.name)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1 transition-all shadow-xs"
                  >
                    <Ship size={13} />
                    <span>Seferleri Gör</span>
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pier Camera Modal */}
      <PierLiveCameraModal
        isOpen={!!activeCameraPier}
        onClose={() => setActiveCameraPier(null)}
        origin={activeCameraPier || "Kadıköy"}
      />
    </div>
  );
}
