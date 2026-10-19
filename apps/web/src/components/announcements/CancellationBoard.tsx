"use client";

import { useMemo } from "react";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";
import { buildCancellationBulletin } from "@/lib/utils/announcement-bulletin";
import { toTrDate } from "@/lib/utils/istanbul-date";
import { useAnnouncementStore } from "@/store/useAnnouncementStore";
import type { OperatorAnnouncement, TripDisruption } from "@/lib/types/announcement";
import type { ScheduleCardDto } from "@/lib/types/schedule";

interface CancellationBoardProps {
  announcements: OperatorAnnouncement[];
  disruptions: TripDisruption[];
  schedules: ScheduleCardDto[];
}

function isCancellationAnnouncement(a: OperatorAnnouncement): boolean {
  if (!a.sourceVerified) return false;
  if (a.type !== "CANCELLATION" && a.type !== "CANCELLED_TRIPS") return false;
  if (!isAnnouncementCurrent(a)) return false;
  const text = `${a.title || ""} ${a.body || ""}`.toLocaleLowerCase("tr-TR");
  if (text.includes("bulunmamaktadır") || text.includes("bulunmamaktadir")) return false;
  return (
    text.includes("iptal") ||
    text.includes("yapılamamakta") ||
    text.includes("yapilamamakta")
  );
}

/**
 * KULLANICI KURALI: İptal seferler yalnızca kayan şeritte kalmaz; ekranın
 * altında OKUNUR bir liste olarak da gösterilir. Tarih başta, iptal edilen
 * sefer/hatlar madde madde; tarifede eşleşen saatli seferler "İPTAL" etiketiyle.
 */
export function CancellationBoard({
  announcements,
  disruptions,
  schedules,
}: CancellationBoardProps) {
  const sourceHealth = useAnnouncementStore((s) => s.sourceHealth);
  const today = toTrDate();

  const active = useMemo(() => {
    const seen = new Set<string>();
    return announcements.filter((a) => {
      if (!isCancellationAnnouncement(a)) return false;
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [announcements]);

  const scheduleById = useMemo(
    () => new Map(schedules.map((s) => [s.id, s])),
    [schedules]
  );

  const confirmedTripsByAnnouncement = useMemo(() => {
    const map = new Map<string, TripDisruption[]>();
    for (const d of disruptions) {
      if (d.kind !== "CANCELLED") continue;
      if ((d.confidence ?? "CONFIRMED") !== "CONFIRMED") continue;
      // Yalnız BUGÜN çalışan tarifede karşılığı olan seferler gösterilir;
      // hafta sonu/hafta içi varyantları bugünün listesine karışmaz.
      if (!scheduleById.has(d.tripId)) continue;
      const list = map.get(d.announcementId) ?? [];
      if (!list.some((x) => x.tripId === d.tripId)) list.push(d);
      map.set(d.announcementId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const ta = scheduleById.get(a.tripId)?.departureTime ?? "";
        const tb = scheduleById.get(b.tripId)?.departureTime ?? "";
        return ta.localeCompare(tb);
      });
    }
    return map;
  }, [disruptions, scheduleById]);

  if (active.length === 0) return null;

  return (
    <section
      className="px-3 pt-1.5 animate-fadeIn"
      aria-label="İptal edilen seferler listesi"
    >
      <div className="rounded-xl border border-rose-300 dark:border-rose-900/70 bg-rose-50/80 dark:bg-rose-950/25 shadow-2xs overflow-hidden">
        <header className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-rose-600 dark:bg-rose-800 text-white">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle size={13} className="shrink-0" aria-hidden />
            <span className="text-[10.5px] font-black uppercase tracking-wider">
              İptal Seferler
            </span>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-black/25 shrink-0">
              {active.length} duyuru
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold shrink-0">
            <CalendarDays size={11} aria-hidden />
            {today}
          </span>
        </header>

        <div className="divide-y divide-rose-200/70 dark:divide-rose-900/50">
          {active.map((announcement) => {
            const bulletin = buildCancellationBulletin(announcement);
            const matchedTrips = confirmedTripsByAnnouncement.get(announcement.id) ?? [];
            const health = sourceHealth.find((h) => h.operator === announcement.operator);
            const unreachable = health?.status === "UNREACHABLE";

            return (
              <article key={announcement.id} className="px-2.5 py-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <OperatorLogo operator={announcement.operator} size="sm" showName={false} />
                  <span className="text-[11.5px] font-black text-slate-900 dark:text-white truncate">
                    {announcement.operator}
                  </span>
                  <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 shrink-0">
                    {bulletin.date}
                  </span>
                  {unreachable && (
                    <span
                      className="text-[8.5px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 shrink-0"
                      title="Kaynağa şu an erişilemiyor; son doğrulanmış duyuru gösteriliyor."
                    >
                      Doğrulanamadı
                    </span>
                  )}
                </div>

                {bulletin.reason && (
                  <p className="mt-1 text-[11px] leading-snug text-rose-900/90 dark:text-rose-100/90">
                    {bulletin.reason}
                  </p>
                )}

                {bulletin.items.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {bulletin.items.map((item, idx) => (
                      <li
                        key={`${announcement.id}-${idx}`}
                        className="flex items-start gap-1 text-[11.5px] leading-snug font-semibold text-slate-800 dark:text-slate-100"
                      >
                        <span className="text-rose-500 shrink-0" aria-hidden>
                          •
                        </span>
                        <span className="min-w-0 break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                    {announcement.body || announcement.title}
                  </p>
                )}

                {matchedTrips.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {matchedTrips.map((d) => {
                      const schedule = scheduleById.get(d.tripId);
                      return (
                        <span
                          key={d.tripId}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-slate-800 dark:text-slate-100"
                        >
                          <span className="font-mono text-rose-600 dark:text-rose-300">
                            {schedule?.departureTime ?? "—"}
                          </span>
                          <span className="truncate max-w-[170px]">
                            {schedule
                              ? `${schedule.origin} ➔ ${schedule.destination}`
                              : d.tripId}
                          </span>
                          <span className="text-rose-600 dark:text-rose-300 uppercase">İptal</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {matchedTrips.length === 0 && bulletin.items.length > 0 && (
                  <p className="mt-1 text-[9.5px] text-slate-500 dark:text-slate-400">
                    Duyuru hat/durak düzeyinde; tarifede saatli sefer eşleşmesi yok.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
