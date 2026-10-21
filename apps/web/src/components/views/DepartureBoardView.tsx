"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";
import { PierDepartureBoard } from "@/components/schedule/PierDepartureBoard";
import { TripDetailsSheet } from "@/components/schedule/TripDetailsSheet";
import { BoardTvMode } from "@/components/views/BoardTvMode";
import type { ScheduleCardDto } from "@/lib/types/schedule";

interface DepartureBoardViewProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
}

/**
 * PANO GÖRÜNÜMÜ: terminal FIDS tarzı iskele kalkış panosu.
 * Kullanıcı iskeleyi seçer, sıradaki kalkışları tek ekranda görür;
 * bir sefere dokununca normal sefer detayı (TripDetailsSheet) açılır.
 * `?tv=1` ile tam ekran B2B TV Kiosk modu açılır (reklamsız işletme ekranı).
 */
export function DepartureBoardView({ schedules, serverTimeIso }: DepartureBoardViewProps) {
  const [selectedPier, setSelectedPier] = useState<string>("ALL");
  const [selectedTrip, setSelectedTrip] = useState<ScheduleCardDto | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isTvMode, setIsTvMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tv") === "1") {
      setIsTvMode(true);
      const pierParam = params.get("pier");
      if (pierParam) setSelectedPier(pierParam);
    }
  }, []);

  if (isTvMode) {
    return (
      <BoardTvMode
        schedules={schedules}
        serverTimeIso={serverTimeIso}
        defaultPier={selectedPier !== "ALL" ? selectedPier : undefined}
        onExit={() => setIsTvMode(false)}
      />
    );
  }

  return (
    <div className="py-3 max-w-4xl mx-auto pb-24 animate-fadeIn">
      <PierDepartureBoard
        schedules={schedules}
        serverTimeIso={serverTimeIso}
        selectedOrigin={selectedPier}
        onSelectOrigin={setSelectedPier}
        onSelectTrip={(trip) => {
          setSelectedTrip(trip);
          setIsSheetOpen(true);
        }}
      />
      <div className="px-3 pt-2 flex items-start justify-between gap-3">
        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
          Pano, seçili iskelenin sıradaki kalkışlarını gösterir. Sefer detayı için vapura dokunun.
        </p>
        <button
          type="button"
          onClick={() => setIsTvMode(true)}
          className="shrink-0 min-h-[36px] px-3 rounded-xl border border-amber-400/50 bg-amber-400/10 text-amber-700 dark:text-amber-300 text-[11px] font-black flex items-center gap-1.5 hover:bg-amber-400/20 transition-colors cursor-pointer"
        >
          <Monitor size={14} aria-hidden="true" />
          <span>TV Modu (Kiosk)</span>
        </button>
      </div>

      <TripDetailsSheet
        schedule={selectedTrip}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        serverTimeIso={serverTimeIso}
      />
    </div>
  );
}
