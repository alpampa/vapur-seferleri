"use client";

import { useState } from "react";
import { AlertTriangle, Megaphone, X, ExternalLink } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import type { OperatorAnnouncement } from "@/lib/types/announcement";

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
 * Ana ekran duyuru bandı — yalnızca kaynaktan doğrulanmış ("sourceVerified")
 * duyuruları gösterir. İptal varsa kırmızı ton, yoksa sade bilgi şeridi.
 */
export function AnnouncementBanner({ announcements, className = "" }: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const verified = announcements.filter((a) => a.sourceVerified);
  const cancellations = verified.filter(
    (a) => a.type === "CANCELLATION" || a.type === "CANCELLED_TRIPS"
  );
  const others = verified.filter(
    (a) => a.type !== "CANCELLATION" && a.type !== "CANCELLED_TRIPS"
  );

  const all = verified.filter((a) => !dismissedIds.has(a.id));
  if (all.length === 0) return null;

  const hasCancellation = cancellations.length > 0;
  const showItems = hasCancellation
    ? all.filter((a) => a.type === "CANCELLATION" || a.type === "CANCELLED_TRIPS").slice(0, 3)
    : all.slice(0, 3);

  if (showItems.length === 0) return null;

  const dismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className={`px-3 pt-2 animate-fadeIn ${className}`} role="region" aria-label="Firma duyuruları">
      <div
        className={`rounded-xl border px-3 py-2 shadow-sm ${
          hasCancellation
            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60"
            : "bg-sky-50 dark:bg-slate-900/60 border-sky-200 dark:border-slate-800"
        }`}
      >
        <div className="flex items-start gap-2">
          <span
            className={`mt-0.5 shrink-0 ${
              hasCancellation ? "text-rose-500" : "text-sky-500 dark:text-sky-400"
            }`}
          >
            {hasCancellation ? <AlertTriangle size={15} aria-hidden /> : <Megaphone size={15} aria-hidden />}
          </span>

          <div className="min-w-0 flex-1">
            <p
              className={`text-[10px] font-black uppercase tracking-wide ${
                hasCancellation
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-sky-600 dark:text-sky-400"
              }`}
            >
              {hasCancellation ? "İptal sefer bildirimi" : "Firma duyuruları"}
            </p>

            <ul className="mt-1 space-y-1">
              {showItems.map((a) => {
                const tone = TYPE_META[a.type]?.tone ?? "info";
                return (
                  <li key={a.id} className="flex items-start gap-1.5 text-xs">
                    <OperatorLogo operator={a.operator} size="sm" showName={false} />
                    <a
                      href={a.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-semibold leading-snug hover:underline inline-flex items-center gap-1 ${
                        tone === "danger"
                          ? "text-rose-700 dark:text-rose-300"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {a.title}
                      <ExternalLink size={10} className="shrink-0 opacity-50" />
                    </a>
                    {a.body && (
                      <span className="text-slate-500 dark:text-slate-400 leading-snug">{a.body}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => dismiss(showItems[0].id)}
            aria-label="Duyuru bandını kapat"
            className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>

        <p className="mt-1 pl-6 text-[10px] text-slate-400 dark:text-slate-500">
          Kaynak: resmi firma duyuru sayfaları — canlı senkron
        </p>
      </div>
    </div>
  );
}
