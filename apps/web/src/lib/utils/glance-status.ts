import type { DynamicTripResolution } from "@/lib/utils/dynamic-trip";

export type GlanceUrgency = "CALM" | "SOON" | "CRITICAL" | "DEPARTED";

export interface GlanceStatus {
  urgency: GlanceUrgency;
  minutes: number | null;
  liveCountdown: string | null;
}

export const GLANCE_SOON_MIN = 15;
export const GLANCE_CRITICAL_MIN = 5;

export function resolveGlanceStatus(
  dyn: Pick<DynamicTripResolution, "isDeparted" | "minutesUntilDeparture" | "countdown">
): GlanceStatus {
  if (dyn.isDeparted) {
    return { urgency: "DEPARTED", minutes: null, liveCountdown: null };
  }

  const minutes = dyn.minutesUntilDeparture ?? null;
  if (minutes == null) {
    return { urgency: "CALM", minutes: null, liveCountdown: dyn.countdown ?? null };
  }

  const urgency: GlanceUrgency =
    minutes <= GLANCE_CRITICAL_MIN ? "CRITICAL" : minutes <= GLANCE_SOON_MIN ? "SOON" : "CALM";

  return { urgency, minutes, liveCountdown: dyn.countdown ?? null };
}
