"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Anchor, Check, Ship, X } from "lucide-react";
import { VesselVisualCard } from "@/components/vessel/VesselVisualCard";
import { ISTANBUL_FERRY_FLEET, type RegisteredVessel } from "@/lib/agents/fleet-registry";

interface VesselHeritageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVesselName?: string;
  onSelectVessel?: (vesselName: string) => void;
}


const VERIFIED_VESSEL_HISTORY: Record<string, { shipyard: string; story: string; deckTip: string }> = {
  "Paşabahçe": {
    shipyard: "Cantieri Navali di Taranto (İtalya, 1952)",
    story: "1952 yılında İtalya'nın Taranto tersanesinde inşa edilen Paşabahçe, Boğaz ve Adalar hattının en hızlı ve ikonik tarihi vapurlarındandır. Haliç Tersanesi'nde kapsamlı restorasyondan geçirilerek 2022 yılında yeniden seferlere kazandırılmıştır.",
    deckTip: "Kıç açık güverte martı beslemek ve Tarihi Yarımada siluetini izlemek için en rüzgaraltı noktadır; iç salonda 1952 tarihli Artemis kabartması yer alır."
  },
  "Barış Manço": {
    shipyard: "Camialtı Tersanesi (İstanbul, 1973)",
    story: "1973 yılında Kasımpaşa Camialtı Tersanesi'nde inşa edilen geleneksel Şehir Hatları vapuru, sanatçı Barış Manço'nun anısını yaşatmaktadır.",
    deckTip: "Kadıköy-Beşiktaş ve Adalar seyirlerinde üst güverte sancak ve iskele balkonları Kız Kulesi ve gün batımı fotoğrafçılığı için idealdir."
  },
  "Moda": {
    shipyard: "Haliç Tersanesi (İstanbul, 1986)",
    story: "600 yıllık Haliç Tersanesi'nde inşa edilen klasik çelik deplasman gövdeli yolcu vapurudur; adını Kadıköy'ün tarihi Moda semtinden alır.",
    deckTip: "Geniş arka açık güvertesi lodoslu havalarda dahi dengeli bir seyir ve panoramik Marmara manzarası sunar."
  },
  "Şehit Sami Akbulut": {
    shipyard: "Haliç Tersanesi (İstanbul, 1987)",
    story: "Haliç Tersanesi yapımı 1500+ yolcu kapasiteli klasik Boğaz ve Adalar vapurudur; yüksek bordası sayesinde açık deniz seyrine dayanıklıdır.",
    deckTip: "Adalar hattında Kınalıada ve Heybeliada yaklaşmalarını üst ön güverteden (pruva) izlemek için uygundur."
  },
  "İsmail Hakkı Durusu": {
    shipyard: "Haliç Tersanesi (İstanbul, 1988)",
    story: "Şehir Hatları filosunun klasik nesil yüksek kapasiteli yolcu vapurlarından biridir.",
    deckTip: "İç ahşap dokulu salon pencereleri kış seyirlerinde Boğaz yalılarını izlemek için geniş görüş açısı sağlar."
  }
};

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]+/g, " ").trim();
}

function findVessel(name?: string): RegisteredVessel {
  if (!name) return ISTANBUL_FERRY_FLEET[0];
  const target = normalize(name);
  return (
    ISTANBUL_FERRY_FLEET.find((vessel) => normalize(vessel.name) === target) ??
    ISTANBUL_FERRY_FLEET.find((vessel) => normalize(vessel.name).includes(target)) ??
    ISTANBUL_FERRY_FLEET[0]
  );
}

export function VesselHeritageModal({
  isOpen,
  onClose,
  initialVesselName,
  onSelectVessel,
}: VesselHeritageModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedName, setSelectedName] = useState(initialVesselName ?? ISTANBUL_FERRY_FLEET[0].name);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && initialVesselName) {
      setSelectedName(findVessel(initialVesselName).name);
    }
  }, [isOpen, initialVesselName]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const selected = useMemo(() => findVessel(selectedName), [selectedName]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99990] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Vapur Kültürü ve Seyir Rehberi"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Ship size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black tracking-tight">
                Vapur Kültürü & Seyir Rehberi
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                İstanbul filosundaki vapurların mimari profili ve güverte özellikleri
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Filosu
            </span>
            <div className="max-h-[45vh] md:max-h-[60vh] overflow-y-auto space-y-1 pr-1">
              {ISTANBUL_FERRY_FLEET.map((vessel) => {
                const active = vessel.name === selected.name;
                return (
                  <button
                    key={vessel.mmsi}
                    type="button"
                    onClick={() => setSelectedName(vessel.name)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      active
                        ? "bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                        : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="truncate">{vessel.name}</span>
                    {active ? <Check size={13} className="shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 min-w-0">
            <VesselVisualCard
              vesselName={selected.name}
              operator={selected.operator}
              builtYear={selected.builtYear}
              capacityPax={selected.capacityPax}
              callSign={selected.callSign}
              mmsi={selected.mmsi}
            />

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Anchor size={12} />
                <span>Sefer Bilgisi</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">{selected.name}</strong>{" "}
                {selected.operator} filosunda {selected.builtYear} yılında hizmete girmiştir.
                Kayıtlı yolcu kapasitesi {selected.capacityPax.toLocaleString("tr-TR")} kişidir.
                {VERIFIED_VESSEL_HISTORY[selected.name] ? ` ${VERIFIED_VESSEL_HISTORY[selected.name].story}` : ""}
              </p>
              {VERIFIED_VESSEL_HISTORY[selected.name] && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200">
                  <strong>Tersane:</strong> {VERIFIED_VESSEL_HISTORY[selected.name].shipyard}
                  <br />
                  <strong>Seyir & Güverte Notu:</strong> {VERIFIED_VESSEL_HISTORY[selected.name].deckTip}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {selected.assignedLines.map((line) => (
                  <span
                    key={line}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>

            {onSelectVessel ? (
              <button
                type="button"
                onClick={() => {
                  onSelectVessel(selected.name);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer transition-colors"
              >
                {selected.name} vapurunu seç
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
