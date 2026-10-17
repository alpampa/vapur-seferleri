"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Megaphone, X, ExternalLink, ChevronRight, ChevronLeft } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import type { OperatorAnnouncement } from "@/lib/types/announcement";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";

interface AnnouncementBannerProps {
  announcements: OperatorAnnouncement[];
  className?: string;
}

const TYPE_META: Record<
  OperatorAnnouncement["type"],
  { label: string; tone: "danger" | "notice" | "info" }
> = {
  CANCELLATION: { label: "İPTAL", tone: "danger" },
  CANCELLED_TRIPS: { label: "İPTAL SEFERLER", tone: "danger" },
  EXTRA_SERVICE: { label: "EK SEFER", tone: "notice" },
  SCHEDULE_CHANGE: { label: "TARİFE", tone: "notice" },
  INFO: { label: "DUYURU", tone: "info" },
  WEATHER: { label: "HAVA", tone: "info" },
};

/**
 * Ana ekran duyuru bandı — TEK SATIRDA DÖNERLİ (Rotasyonlu) ve kompakt tasarım.
 * Tarihi geçmiş tüm duyurular elenir, kalan güncel duyurular 4.5 saniyede bir sırayla akar.
 */
export function AnnouncementBanner({ announcements, className = "" }: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  // KULLANICI KURALI: Duyuru bandında YALNIZCA doğrulanmış, güncel ve gerçek İPTAL seferleri gösterilir.
  // Tarife değişimi, mehtap turu, genel bilgilendirme vb. haberler kesinlikle gösterilmez.
  const activeList = announcements.filter((a) => {
    if (!a.sourceVerified || dismissedIds.has(a.id) || !isAnnouncementCurrent(a)) return false;
    if (a.type !== "CANCELLATION" && a.type !== "CANCELLED_TRIPS") return false;
    const text = `${a.title || ""} ${a.body || ""}`.toLocaleLowerCase("tr-TR");
    if (text.includes("bulunmamaktadır") || text.includes("bulunmamaktadir")) return false;
    return text.includes("iptal") || text.includes("yapılamamakta") || text.includes("yapilamamakta");
  });

  const hasCancellation = activeList.length > 0;

  // Otomatik Rotasyon: Her 4.5 saniyede bir sonraki duyuruya geç (Hook kuralı: Erken return'den ÖNCE çağrılmalı)
  useEffect(() => {
    if (activeList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeList.length]);

  if (activeList.length === 0) return null;

  const currentItem = activeList[currentIndex % activeList.length] || activeList[0];
  const tone = TYPE_META[currentItem.type]?.tone ?? "danger";

  const dismissCurrent = () => {
    setDismissedIds((prev) => new Set(prev).add(currentItem.id));
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeList.length);
  };

  return (
    <div className={`px-3 pt-1.5 animate-fadeIn ${className}`} role="region" aria-label="Firma duyuruları">
      <div
        className={`rounded-xl border px-2.5 py-1.5 shadow-2xs flex items-center justify-between gap-2 transition-all ${
          hasCancellation
            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60"
            : "bg-sky-50 dark:bg-slate-900/80 border-sky-200 dark:border-slate-800"
        }`}
      >
        {/* Sol İkon + Başlık Rozeti */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`${
              hasCancellation ? "text-rose-500 animate-pulse" : "text-sky-500 dark:text-sky-400"
            }`}
          >
            {hasCancellation ? <AlertTriangle size={13} aria-hidden /> : <Megaphone size={13} aria-hidden />}
          </span>
          <span
            className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
              hasCancellation
                ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                : "bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300"
            }`}
          >
            {TYPE_META[currentItem.type]?.label || (hasCancellation ? "İPTAL" : "DUYURU")}
          </span>
        </div>

        {/* Orta: Tek Satır Dönen Duyuru Metni (İptal açıklaması harfiyen gösterilir) */}
        <div className="min-w-0 flex-1 flex items-center gap-1.5 text-xs truncate">
          <OperatorLogo operator={currentItem.operator} size="sm" showName={false} />
          <a
            href={currentItem.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-semibold text-[11px] leading-tight hover:underline truncate inline-flex items-center gap-1 min-w-0 flex-1 min-h-10 ${
              tone === "danger"
                ? "text-rose-700 dark:text-rose-300 font-bold"
                : "text-slate-800 dark:text-slate-200"
            }`}
            title={`${currentItem.title} ${currentItem.body ? `- ${currentItem.body}` : ""}`}
          >
            {/* İptal durumunda doğrudan resmi açıklama cümlesini yaz */}
            {hasCancellation && currentItem.body ? (
              <span className="truncate text-rose-700 dark:text-rose-200 font-extrabold">
                {currentItem.body}
              </span>
            ) : (
              <>
                <span className="truncate">{currentItem.title}</span>
                {currentItem.body && (
                  <span className="opacity-80 text-[10.5px] truncate">
                    — {currentItem.body}
                  </span>
                )}
              </>
            )}
            <ExternalLink size={9} className="shrink-0 opacity-60 ml-0.5" />
          </a>
        </div>

        {/* Sağ: İlerleme Sayacı, Oklar ve Kapat Butonu */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {activeList.length > 1 && (
            <div className="flex items-center gap-0.5 text-[9px] font-mono mr-1">
              <span className="text-slate-700 dark:text-slate-300 font-bold">
                {(currentIndex % activeList.length) + 1}
              </span>
              <span>/</span>
              <span>{activeList.length}</span>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Önceki duyuru"
                className="flex h-10 w-10 items-center justify-center rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer ml-1"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Sonraki duyuru"
                className="flex h-10 w-10 items-center justify-center rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={dismissCurrent}
            aria-label="Duyuruyu kapat"
            className="flex h-10 w-10 items-center justify-center rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
