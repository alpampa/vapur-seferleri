"use client";

import { useState } from "react";
import { ScheduleListClient } from "@/components/schedule/ScheduleListClient";
import { PiersDirectoryView } from "@/components/views/PiersDirectoryView";
import { MarineWeatherSafetyCenter } from "@/components/views/MarineWeatherSafetyCenter";
import { FavoritesAlarmsView } from "@/components/views/FavoritesAlarmsView";
import { BottomNav } from "@/components/navigation/BottomNav";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import type { MarineWeatherStatus } from "@/lib/services/marine-weather";

interface MainAppShellProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
  marineWeather?: MarineWeatherStatus | null;
}

export function MainAppShell({ schedules, serverTimeIso, marineWeather }: MainAppShellProps) {
  const [activeTab, setActiveTab] = useState<string>("schedules");
  const [forcedPierFilter, setForcedPierFilter] = useState<string | null>(null);

  // PWA App Shortcuts (Hızlı Kısayollar) Entegrasyonu (?view=piers, ?view=weather, vb.)
  useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      if (view === "piers" || view === "weather" || view === "favorites" || view === "schedules") {
        setActiveTab(view);
      }
    }
  });

  const handleSelectPierForSchedules = (pierName: string) => {
    setForcedPierFilter(pierName);
    setActiveTab("schedules");
  };

  return (
    <>
      {activeTab === "schedules" && (
        <ScheduleListClient
          schedules={schedules}
          serverTimeIso={serverTimeIso}
          marineWeather={marineWeather}
          initialOrigin={forcedPierFilter || undefined}
        />
      )}

      {activeTab === "piers" && (
        <PiersDirectoryView
          schedules={schedules}
          onSelectPierForSchedules={handleSelectPierForSchedules}
        />
      )}

      {activeTab === "weather" && (
        <MarineWeatherSafetyCenter
          weather={marineWeather}
        />
      )}

      {activeTab === "favorites" && (
        <FavoritesAlarmsView
          schedules={schedules}
          serverTimeIso={serverTimeIso}
          onNavigateToSchedules={() => setActiveTab("schedules")}
        />
      )}

      {/* Controlled Interactive Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== "schedules") {
            setForcedPierFilter(null);
          }
        }}
      />
    </>
  );
}
