"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, ShieldAlert, ShieldCheck, ShieldQuestion, X } from "lucide-react";
import type { AnnouncementSourceStatus } from "@/lib/agents/data-snapshot-store";

interface SourceStatusSheetProps {
  isOpen: boolean;
  onClose: () => void;
  generatedAt?: string;
  sourceStatus: AnnouncementSourceStatus[];
}

const DATE_TIME_FMT = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatMoment(iso?: string): string {
  if (!iso) return "Saat bilgisi yok";
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "Saat bilgisi yok";
  return DATE_TIME_FMT.format(ms);
}

function statusMeta(status: AnnouncementSourceStatus["status"]) {
  switch (status) {
    case "SCANNED":
      return {
        label: "Kaynak okundu",
        Icon: ShieldCheck,
        tone: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800",
      };
    case "FAILED":
      return {
        label: "Kaynağa ulaşılamadı",
        Icon: ShieldAlert,
        tone: "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800",
      };
    default:
      return {
        label: "Resmî duyuru kaynağı yok",
        Icon: ShieldQuestion,
        tone: "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700",
      };
  }
}

export function SourceStatusSheet({
  isOpen,
  onClose,
  generatedAt,
  sourceStatus,
}: SourceStatusSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    <div
      className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-status-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl"
      >
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="source-status-title"
              className="text-sm font-black text-slate-900 dark:text-white"
            >
              Resmî kaynak kontrol durumu
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Son tarama: {formatMoment(generatedAt)}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Kaynak durumunu kapat"
            className="w-10 h-10 -mr-1 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-2">
          {sourceStatus.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
              Kaynak durumu kaydı bulunamadı.
            </p>
          ) : (
            sourceStatus.map((source) => {
              const meta = statusMeta(source.status);
              return (
                <div
                  key={source.operator}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {source.operator}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {source.status === "SCANNED"
                          ? `${formatMoment(source.fetchedAt)} itibarıyla kontrol edildi`
                          : "Bu firma için otomatik kontrol zamanı yok"}
                        {typeof source.announcementCount === "number" &&
                          ` · ${source.announcementCount} duyuru`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wide ${meta.tone}`}
                    >
                      <meta.Icon size={11} aria-hidden="true" />
                      {meta.label}
                    </span>
                  </div>

                  {(source.note || source.error) && (
                    <p className="text-[10.5px] leading-snug text-slate-600 dark:text-slate-400 mt-1.5">
                      {source.error || source.note}
                    </p>
                  )}

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink size={11} aria-hidden="true" />
                      Resmî kaynağı aç
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 pb-4">
          <p className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-3 py-2 text-[10.5px] leading-snug text-amber-900 dark:text-amber-200">
            Bu ekran yalnızca resmî kaynağın okunabildiğini gösterir. Sefer saatleri
            <strong> planlanan tarifedir</strong>; geminin o an denizde olduğu anlamına gelmez.
            İptal ve düzenlemeler yalnızca yayınlandığı gün için geçerlidir.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
