"use client";

import { useEffect } from "react";
import { useAlarmStore } from "@/store/useAlarmStore";
import { playMarineChime, requestNotificationPermission } from "@/lib/utils/sound";
import type { ScheduleCardDto } from "@/app/page";

interface AlarmManagerProps {
  schedules: ScheduleCardDto[];
}

export function AlarmManager({ schedules }: AlarmManagerProps) {
  const { alarms, triggered, markTriggered } = useAlarmStore();

  useEffect(() => {
    const checkAlarms = () => {
      const now = Date.now();

      schedules.forEach((trip) => {
        // Is this trip tracked by user?
        if (!alarms[trip.id]) return;
        // Has it already been triggered?
        if (triggered[trip.id]) return;

        const targetTimeMs = trip.targetTimeIso ? new Date(trip.targetTimeIso).getTime() : 0;
        if (!targetTimeMs) return;

        const diff = targetTimeMs - now;

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
    };

    checkAlarms();
    const interval = setInterval(checkAlarms, 2000);
    return () => clearInterval(interval);
  }, [schedules, alarms, triggered, markTriggered]);

  return null;
}
