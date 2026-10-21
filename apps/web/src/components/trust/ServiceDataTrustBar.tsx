"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShieldAlert, ShieldCheck, ExternalLink, X, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { resolveServiceDayInfo, tariffBadgeLabel } from "@/lib/utils/service-day-info";
import { resolveDataFreshness } from "@/lib/utils/data-freshness";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useAnnouncementStore } from "@/store/useAnnouncementStore";
import { OPERATOR_REGISTRY } from "@/lib/data/operator-registry";

export interface SourceFreshnessMeta {
  generatedAt?: string;
  sourceCount: number;
}

export type SelectedDayFilter = "TODAY" | "WEEKDAY" | "SATURDAY" | "SUNDAY";

interface ServiceDataTrustBarProps {
  serverTimeIso: string;
  freshness: SourceFreshnessMeta;
  selectedDayType?: SelectedDayFilter;
}

const TIME_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function ServiceDataTrustBar({
  serverTimeIso,
  freshness,
  selectedDayType = "TODAY",
}: ServiceDataTrustBarProps) {
  const { t } = useLanguageStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const liveScanAt = useAnnouncementStore((s) => s.liveScanAt);
  const loadedAt = useAnnouncementStore((s) => s.loadedAt);
  const coverage = useAnnouncementStore((s) => s.coverage);
  const loading = useAnnouncementStore((s) => s.loading);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const parsedMs = Date.parse(serverTimeIso);
  const serverMs = Number.isNaN(parsedMs) ? Date.now() : parsedMs;
  const day = resolveServiceDayInfo(serverMs);

  // Canlı tarama verisi ulaştıysa ve en az bir resmi kaynak canlı doğrulandıysa canlı zaman damgasını kullan;
  // aksi halde sunucu snapshot tarihine geri dön (asla sahte/göreceli tarih üretme).
  const hasLiveVerifiedSource = coverage.some((c) => c.status === "SCANNED" && !c.usedFallback);
  const effectiveGeneratedAt = hasLiveVerifiedSource
    ? (liveScanAt || loadedAt || freshness.generatedAt)
    : (freshness.generatedAt || liveScanAt || loadedAt);
  const effectiveNowMs = loadedAt ? Math.max(serverMs, Date.parse(loadedAt)) : serverMs;

  const fresh = resolveDataFreshness(effectiveGeneratedAt, effectiveNowMs);
  const liveTimeStr =
    hasLiveVerifiedSource && effectiveGeneratedAt
      ? TIME_FORMATTER.format(new Date(effectiveGeneratedAt))
      : null;

  const activeSourceCount =
    coverage.filter((c) => c.status === "SCANNED").length || freshness.sourceCount;

  const displayTariffBadge =
    selectedDayType === "WEEKDAY"
      ? "Hafta içi (Seçili)"
      : selectedDayType === "SATURDAY"
      ? "Cumartesi (Seçili)"
      : selectedDayType === "SUNDAY"
      ? "Pazar / Tatil (Seçili)"
      : tariffBadgeLabel(day);

  const tariffTone =
    selectedDayType !== "TODAY"
      ? "bg-blue-600 text-white border-blue-500"
      : day.isHoliday
      ? "bg-rose-600 text-white border-rose-500"
      : day.tariffDay === "SUNDAY" || day.tariffDay === "SATURDAY"
      ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-400/40"
      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";

  return (
    <>
      <div
        className={`flex flex-1 items-center gap-1.5 min-w-0 overflow-hidden ${
          day.isHoliday ? "text-rose-700 dark:text-rose-300" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <span
          className={`text-[9px] font-black px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${tariffTone}`}
        >
          {displayTariffBadge}
        </span>
        {day.holidayName && selectedDayType === "TODAY" && (
          <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 truncate shrink-0">
            {day.holidayName}
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isModalOpen}
          title="Resmi duyuru ve tarife kaynaklarının doğrulama durumunu incelemek için tıklayın"
          className={`flex items-center gap-1 min-w-0 overflow-hidden px-1.5 py-0.5 rounded-lg border transition-colors cursor-pointer ${
            fresh.isStale
              ? "text-amber-700 dark:text-amber-400 border-amber-300/60 dark:border-amber-700/50 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/70"
              : "text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-800/70"
          }`}
        >
          {loading ? (
            <RefreshCw size={11} className="shrink-0 text-blue-500 animate-spin" aria-hidden="true" />
          ) : fresh.isStale ? (
            <ShieldAlert size={11} className="shrink-0 text-amber-500" aria-hidden="true" />
          ) : (
            <ShieldCheck size={11} className="shrink-0 text-emerald-500" aria-hidden="true" />
          )}
          <span className="text-[10px] font-bold tabular-nums truncate">
            {hasLiveVerifiedSource && liveTimeStr ? (
              <>
                <span className="hidden sm:inline">{t("trustAnnouncement")}: </span>
                Bugün {liveTimeStr} · {activeSourceCount} {t("sources")}
              </>
            ) : fresh.verifiedOnLabel ? (
              <>
                <span className="hidden sm:inline">{t("trustAnnouncement")}: </span>
                {fresh.verifiedOnLabel} ({fresh.ageLabel}) · {activeSourceCount} {t("sources")}
              </>
            ) : (
              t("trustMissing")
            )}
          </span>
        </button>
      </div>

      {isModalOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Resmi Duyuru ve Tarife Kaynak Doğrulama Durumu"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="text-sm sm:text-base font-black tracking-tight">
                      Resmi Kaynak & İptal Doğrulama Durumu
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Planlı tarifeler ve anlık sefer iptal duyurularının şeffaf kaynak raporu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Kapat"
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-3 max-h-[75vh] overflow-y-auto">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Aktif Tarife Günü:</span>
                    <span className="text-slate-900 dark:text-white">{day.dateLabel} ({day.tariffLabel})</span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Son Duyuru Kontrolü:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {hasLiveVerifiedSource && liveTimeStr
                        ? `Bugün ${liveTimeStr} (Canlı Tarama)`
                        : `${fresh.verifiedOnLabel ?? "Bilinmiyor"} (${fresh.ageLabel})`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {OPERATOR_REGISTRY.map((op) => {
                    const cov = coverage.find((c) => c.operator === op.name);
                    const isLiveOk = cov?.status === "SCANNED" && !cov?.usedFallback;
                    const isFallback = cov?.usedFallback;

                    return (
                      <div
                        key={op.name}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-xs text-slate-900 dark:text-white">
                              {op.name}
                            </span>
                            {isLiveOk ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 size={10} /> Canlı Doğrulandı
                              </span>
                            ) : isFallback ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                <AlertTriangle size={10} /> Kayıtlı Yedek
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                Resmi Tarife Tablosu
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            {cov?.note || op.statusNote}
                          </p>
                        </div>

                        <a
                          href={op.officialAnnouncementsUrl || op.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-black inline-flex items-center gap-1"
                        >
                          <span>Resmi Site</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    );
                  })}

                  {/* İDO Resmi İptal ve Sefer Sayfası Doğrudan Erişim Bağlantısı */}
                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          İDO (İstanbul Deniz Otobüsleri)
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                          Resmi İptal & Sefer Bağlantısı
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        Bostancı–Adalar ve Kabataş–Adalar deniz otobüsü anlık iptal duyuruları için resmi İDO sayfasını kontrol edebilirsiniz.
                      </p>
                    </div>
                    <a
                      href="https://www.ido.com.tr/tr/iptal-seferler"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-black inline-flex items-center gap-1"
                    >
                      <span>İDO İptaller</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
