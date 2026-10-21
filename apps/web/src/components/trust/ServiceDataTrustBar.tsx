"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { resolveServiceDayInfo, tariffBadgeLabel } from "@/lib/utils/service-day-info";
import { resolveDataFreshness } from "@/lib/utils/data-freshness";
import { useLanguageStore } from "@/store/useLanguageStore";
import type { AnnouncementSourceStatus } from "@/lib/agents/data-snapshot-store";
import { SourceStatusSheet } from "@/components/trust/SourceStatusSheet";

export interface SourceFreshnessMeta {
  generatedAt?: string;
  sourceCount: number;
  sourceStatus?: AnnouncementSourceStatus[];
}

interface ServiceDataTrustBarProps {
  serverTimeIso: string;
  freshness: SourceFreshnessMeta;
}

export function ServiceDataTrustBar({ serverTimeIso, freshness }: ServiceDataTrustBarProps) {
  const { t } = useLanguageStore();
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const parsedMs = Date.parse(serverTimeIso);
  const serverMs = Number.isNaN(parsedMs) ? 0 : parsedMs;
  const day = resolveServiceDayInfo(serverMs);
  const fresh = resolveDataFreshness(freshness.generatedAt, serverMs);

  const tariffTone = day.isHoliday
    ? "bg-rose-600 text-white border-rose-500"
    : day.tariffDay === "SUNDAY" || day.tariffDay === "SATURDAY"
    ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-400/40"
    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsStatusOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${t("trustAnnouncement")} — kaynak bazlı son kontrol durumunu aç`}
        className={`flex flex-1 items-center gap-1.5 min-w-0 overflow-hidden text-left rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          day.isHoliday ? "text-rose-700 dark:text-rose-300" : "text-slate-500 dark:text-slate-400"
        }`}
        title="Kaynak bazlı son kontrol saatini ve resmî bağlantıları göster"
      >
        <span
          className={`text-[9px] font-black px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${tariffTone}`}
        >
          {tariffBadgeLabel(day)}
        </span>
        {day.holidayName && (
          <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 truncate shrink-0">
            {day.holidayName}
          </span>
        )}
        <span
          className={`flex items-center gap-1 min-w-0 overflow-hidden ${
            fresh.isStale ? "text-amber-700 dark:text-amber-400" : ""
          }`}
        >
          {fresh.isStale ? (
            <ShieldAlert size={11} className="shrink-0" aria-hidden="true" />
          ) : (
            <ShieldCheck size={11} className="shrink-0 text-emerald-500" aria-hidden="true" />
          )}
          <span className="text-[10px] font-bold tabular-nums truncate">
            {fresh.verifiedOnLabel ? (
              <>
                <span className="hidden sm:inline">{t("trustAnnouncement")}: </span>
                {fresh.verifiedOnLabel} ({fresh.ageLabel}) · {freshness.sourceCount} {t("sources")}
              </>
            ) : (
              t("trustMissing")
            )}
          </span>
        </span>
      </button>

      <SourceStatusSheet
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        generatedAt={freshness.generatedAt}
        sourceStatus={freshness.sourceStatus ?? []}
      />
    </>
  );
}
