/**
 * Transit Time Engine
 * Centralized, deterministic calculations for voyage schedules, countdowns, and midnight crossings.
 */

export interface VoyageTiming {
  minutesRemaining: number;
  secondsRemaining: number;
  countdownFormatted: string;
  isDeparted: boolean;
  isImminent: boolean;     // <= 15 min
  isLastCall: boolean;     // <= 3 min
  urgency: "DEPARTED" | "LAST_CALL" | "IMMINENT" | "UPCOMING";
  departureTimeFormatted: string;
}

/**
 * Resolves countdown and urgency for a voyage given its departure time (HH:mm) and current timestamp
 */
export function resolveVoyageTiming(
  departureTime: string,
  nowMs: number = Date.now(),
  targetDateIso?: string
): VoyageTiming {
  if (!departureTime || !departureTime.includes(":")) {
    return {
      minutesRemaining: 0,
      secondsRemaining: 0,
      countdownFormatted: "--:--",
      isDeparted: false,
      isImminent: false,
      isLastCall: false,
      urgency: "UPCOMING",
      departureTimeFormatted: departureTime || "--:--",
    };
  }

  const [depH, depM] = departureTime.split(":").map(Number);
  const now = new Date(nowMs);

  // Use Europe/Istanbul timezone components for accurate evaluation
  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = istFormatter.formatToParts(now);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  const currentYear = parseInt(map.year, 10);
  const currentMonth = parseInt(map.month, 10) - 1;
  const currentDay = parseInt(map.day, 10);
  const currentH = parseInt(map.hour, 10);
  const currentM = parseInt(map.minute, 10);
  const currentS = parseInt(map.second, 10);

  const currentTotalSec = currentH * 3600 + currentM * 60 + currentS;
  const depTotalSec = depH * 3600 + depM * 60;

  let diffSec = depTotalSec - currentTotalSec;

  // Handle midnight crossing:
  // If current time is late night (e.g. 23:50) and departure is early morning (00:20), diffSec was negative, add 86400
  if (currentH >= 20 && depH < 5) {
    diffSec += 86400;
  }
  // Conversely, if current time is early morning (00:10) and departure was 23:55 (departed 15 min ago)
  else if (currentH < 5 && depH >= 20) {
    diffSec -= 86400;
  }

  const isDeparted = diffSec < 0;
  const absDiffSec = Math.abs(diffSec);
  const minutesRemaining = Math.floor(diffSec / 60);

  let countdownFormatted = "";
  if (isDeparted) {
    const minsAgo = Math.floor(absDiffSec / 60);
    countdownFormatted = minsAgo === 0 ? "Şimdi kalktı" : `${minsAgo} dk önce`;
  } else {
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    if (m === 0) {
      countdownFormatted = `${s} sn kaldı`;
    } else if (m <= 60) {
      countdownFormatted = `${m} dk sonra`;
    } else {
      const hours = Math.floor(m / 60);
      const remM = m % 60;
      countdownFormatted = `${hours} sa ${remM} dk`;
    }
  }

  const isLastCall = !isDeparted && diffSec <= 180; // <= 3 minutes
  const isImminent = !isDeparted && diffSec <= 900; // <= 15 minutes

  let urgency: "DEPARTED" | "LAST_CALL" | "IMMINENT" | "UPCOMING" = "UPCOMING";
  if (isDeparted) urgency = "DEPARTED";
  else if (isLastCall) urgency = "LAST_CALL";
  else if (isImminent) urgency = "IMMINENT";

  return {
    minutesRemaining,
    secondsRemaining: diffSec,
    countdownFormatted,
    isDeparted,
    isImminent,
    isLastCall,
    urgency,
    departureTimeFormatted: departureTime,
  };
}
