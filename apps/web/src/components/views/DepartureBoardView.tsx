"use client";

import { useState } from "react";
import { PierDepartureBoard } from "@/components/schedule/PierDepartureBoard";
import { TripDetailsSheet } from "@/components/schedule/TripDetailsSheet";
import type { ScheduleCardDto } from "@/lib/types/schedule";

interface DepartureBoardViewProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
}

/**
 * PANO GÖRÜNÜMÜ: terminal FIDS tarzı iskele kalkış panosu.
 * Kullanıcı iskeleyi seçer, sıradaki 3 vapuru tek ekranda görür;
 * bir sefere dokununca normal sefer detayı (TripDetailsSheet) açılır.
 * Panonun kendi detay çekmecesini tutması, sefer listesine bağımlılığı sıfırlar.
 */
export function DepartureBoardView({ schedules, serverTimeIso }: DepartureBoardViewProps) {
  const [selectedPier, setSelectedPier] = useState<string>("ALL");
  const [selectedTrip, setSelectedTrip] = useState<ScheduleCardDto | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
      <p className="px-3 pt-2 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
        Pano, seçili iskelenin sıradaki kalkışlarını gösterir. Sefer detayı için vapura dokunun.
      </p>

      <TripDetailsSheet
        schedule={selectedTrip}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        serverTimeIso={serverTimeIso}
      />
    </div>
  );
}
