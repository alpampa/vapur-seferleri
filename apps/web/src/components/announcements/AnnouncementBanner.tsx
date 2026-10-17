"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Megaphone, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { MarqueeTicker } from "@/components/ui/MarqueeTicker";
import { AnnouncementDetailSheet } from "@/components/announcements/AnnouncementDetailSheet";
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
  // KULLANICI KURALI: Üst satır "DUYURU" (firma açıklaması), alt şerit
  // "İPTAL SEFERLER" (saatli sefer listesi) — rozetler görev ayrımını netleştirir.
  CANCELLATION: { label: "DUYURU", tone: "danger" },
  CANCELLED_TRIPS: { label: "DUYURU", tone: "danger" },
  EXTRA_SERVICE: { label: "EK SEFER", tone: "notice" },
  SCHEDULE_CHANGE: { label: "TARİFE", tone: "notice" },
  INFO: { label: "DUYURU", tone: "info" },
  WEATHER: { label: "HAVA", tone: "info" },
};

/**
 * Ana ekran duyuru bandı — TEK SATIRDA akan (marquee) kompakt tasarım.
 * KULLANICI KURALI: İptal duyuruları asla yok sayılamaz — kapatma düğmesi YOKTUR,
 * uzun resmi açıklama kayan yazı olarak harfiyen akar.
 */
export function AnnouncementBanner({ announcements, className = "" }: AnnouncementBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // KULLANICI KURALI: Detay UYGULAMA İÇİNDE açılır (dış siteye yönlendirme YOK).
  // Açıkken rotasyon donar; pencere kayan metinle birlikte değişmez.
  const [detailItem, setDetailItem] = useState<OperatorAnnouncement | null>(null);

  // KULLANICI KURALI: Duyuru bandında YALNIZCA doğrulanmış, güncel ve gerçek İPTAL seferleri gösterilir.
  // Tarife değişimi, mehtap turu, genel bilgilendirme vb. haberler kesinlikle gösterilmez.
  const activeList = announcements.filter((a) => {
    if (!a.sourceVerified || !isAnnouncementCurrent(a)) return false;
    if (a.type !== "CANCELLATION" && a.type !== "CANCELLED_TRIPS") return false;
    const text = `${a.title || ""} ${a.body || ""}`.toLocaleLowerCase("tr-TR");
    if (text.includes("bulunmamaktadır") || text.includes("bulunmamaktadir")) return false;
    return text.includes("iptal") || text.includes("yapılamamakta") || text.includes("yapilamamakta");
  });

  const hasCancellation = activeList.length > 0;

  // Kayan yazı okunurken rotasyonla kesilmesin: metni uzun duyuru varsa
  // otomatik rotasyon kapanır; gezinme yalnızca oklarla yapılır.
  const hasLongText = activeList.some(
    (a) => Math.max((a.body || "").length, (a.title || "").length) > 140
  );

  // Otomatik Rotasyon: Metinler kısaysa 4.5 saniyede bir sonraki duyuruya geç.
  // Detay penceresi açıkken rotasyon durur (okunan duyuru altından kaymaz).
  // (Hook kuralı: Erken return'den ÖNCE çağrılmalı)
  useEffect(() => {
    if (activeList.length <= 1 || hasLongText || detailItem) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeList.length, hasLongText, detailItem]);

  if (activeList.length === 0) return null;

  const currentItem = activeList[currentIndex % activeList.length] || activeList[0];
  const tone = TYPE_META[currentItem.type]?.tone ?? "danger";

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeList.length);
  };

  return (
    <>
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

        {/* Orta: TEK SATIR KAYAN duyuru metni — tıklanınca detay UYGULAMA İÇİNDE açılır */}
        <div className="min-w-0 flex-1 flex items-center gap-1.5 text-xs">
          <OperatorLogo operator={currentItem.operator} size="sm" showName={false} />
          <MarqueeTicker speedPxPerSec={55}>
            <button
              type="button"
              onClick={() => setDetailItem(currentItem)}
              aria-label="Duyuru detayını aç"
              className={`font-semibold text-[11px] leading-tight hover:underline inline-flex items-center gap-1 min-h-10 cursor-pointer text-left ${
                tone === "danger"
                  ? "text-rose-700 dark:text-rose-300 font-bold"
                  : "text-slate-800 dark:text-slate-200"
              }`}
              title={`${currentItem.title} ${currentItem.body ? `- ${currentItem.body}` : ""}`}
            >
              {/* İptal durumunda doğrudan açıklama cümlesini yaz */}
              {hasCancellation && currentItem.body ? (
                <span className="text-rose-700 dark:text-rose-200 font-extrabold">
                  {currentItem.body}
                </span>
              ) : (
                <>
                  <span>{currentItem.title}</span>
                  {currentItem.body && (
                    <span className="opacity-80 text-[10.5px]">
                      — {currentItem.body}
                    </span>
                  )}
                </>
              )}
              <Info size={10} className="shrink-0 opacity-60 ml-0.5" aria-hidden />
            </button>
          </MarqueeTicker>
        </div>

        {/* Sağ: İlerleme Sayacı ve Oklar (KULLANICI KURALI: İptal duyurusu kapatılamaz) */}
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
        </div>
      </div>
    </div>

      {/* UYGULAMA İÇİ duyuru detayı — dış siteye yönlendirme yapılmaz */}
      <AnnouncementDetailSheet
        announcement={detailItem}
        isOpen={detailItem !== null}
        onClose={() => setDetailItem(null)}
      />
    </>
  );
}
