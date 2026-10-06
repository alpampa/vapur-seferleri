"use client";

import { useEffect } from "react";
import { useAlarmStore } from "@/store/useAlarmStore";
import { playMarineChime, requestNotificationPermission } from "@/lib/utils/sound";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { useTransitClock } from "@/hooks/useTransitClock";

interface AlarmManagerProps {
  schedules: ScheduleCardDto[];
}

export function AlarmManager({ schedules }: AlarmManagerProps) {
  const { alarms, triggered, markTriggered } = useAlarmStore();

  // Tek saat kaynağı — alarm bildirimleri sekme arka plandayken de tetiklenmelidir,
  // bu yüzden keepTickingWhenHidden açık (tarayıcı kısıtlamaları yine geçerli).
  const { nowMs } = useTransitClock(2000, { keepTickingWhenHidden: true });

  useEffect(() => {
    schedules.forEach((trip) => {
      // Is this trip tracked by user?
      if (!alarms[trip.id]) return;
      // Has it already been triggered?
      if (triggered[trip.id]) return;

      const targetTimeMs = trip.targetTimeIso ? new Date(trip.targetTimeIso).getTime() : 0;
      if (!targetTimeMs) return;

      const diff = targetTimeMs - nowMs;

      // Trigger condition: when trip enters last 5 minutes (0 to 300,000 ms)
      if (diff > 0 && diff <= 5 * 60 * 1000) {
        markTriggered(trip.id);
        playMarineChime();

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const minutesLeft = Math.ceil(diff / 60000);
          new Notification(`⏰ Vapur Kalkıyor: Son ${minutesLeft} Dakika!`, {
            body: `${trip.origin} ➔ ${trip.destination} (${trip.operator}) peronu: ${trip.platform || 'Ana Rıhtım'}. İyi yolculuklar!`,
            icon: '/favicon.ico',
            tag: trip.id
          });
        }
      }
    });
  }, [schedules, alarms, triggered, markTriggered, nowMs]);

  return null;
}
