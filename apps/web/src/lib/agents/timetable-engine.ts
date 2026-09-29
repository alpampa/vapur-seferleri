import { OFFICIAL_SCHEDULES_DATA, RawOfficialTrip } from '../data/official-schedules';
import type { ScheduleCardDto, SchedulesResponse } from '@/app/page';
import type { TripStatus } from '@/components/schedule/ScheduleCard';
import { getOfficialRouteFare, resolveRealisticPlatform } from '@/lib/data/official-fares';
import { selfHealTripRecord } from '@/lib/agents/self-healing-engine';

/**
 * Returns current Istanbul time components (UTC+3)
 */
export function getIstanbulTime() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  parts.forEach(p => { map[p.type] = p.value; });

  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10);
  const day = parseInt(map.day, 10);
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);

  // Day of week in Istanbul (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const istanbulDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const dayOfWeek = istanbulDate.getUTCDay();
  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;
  const isWeekend = isSaturday || isSunday;

  // Formatted date in Turkish
  const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return {
    year,
    month,
    day,
    hour,
    minute,
    isSaturday,
    isSunday,
    isWeekend,
    serverTimeIso: now.toISOString(),
    serverDateFormatted: dateFormatter.format(now)
  };
}

/**
 * Builds schedule DTOs for the current day based on official timetables
 */
export async function getLiveOrOfficialSchedules(): Promise<SchedulesResponse> {
  const ist = getIstanbulTime();
  const yearStr = ist.year;
  const monthStr = String(ist.month).padStart(2, '0');
  const dayStr = String(ist.day).padStart(2, '0');
  const nowMs = Date.now();

  // 1. Filter official schedule for today with precision day matching
  const todayOfficial = OFFICIAL_SCHEDULES_DATA.filter(trip => {
    if (ist.isSunday) {
      if (trip.runsSunday !== undefined) return trip.runsSunday;
      return !trip.isWeekdayOnly;
    } else if (ist.isSaturday) {
      if (trip.runsSaturday !== undefined) return trip.runsSaturday;
      return !trip.isWeekdayOnly;
    } else {
      // Monday to Friday (Weekday)
      if (trip.runsWeekday !== undefined) return trip.runsWeekday;
      return !trip.isWeekendOnly;
    }
  });

  // 2. Map raw official trips to full ScheduleCardDto
  const schedules: ScheduleCardDto[] = todayOfficial.map((rawTrip) => {
    const trip = selfHealTripRecord(rawTrip);
    const [hh, mm] = trip.departureTime.split(':');
    
    // Construct ISO string explicitly with +03:00 Istanbul offset
    const targetIso = `${yearStr}-${monthStr}-${dayStr}T${hh}:${mm}:00+03:00`;
    const targetTimeMs = new Date(targetIso).getTime();
    const diff = targetTimeMs - nowMs;

    let status: TripStatus = 'ON_TIME';
    let progress = 0;
    let delayText: string | undefined = undefined;

    if (diff < -15 * 60000) {
      status = 'COMPLETED';
      progress = 100;
    } else if (diff <= 0) {
      status = 'IN_TRANSIT';
      progress = 50;
    } else if (diff <= 10 * 60000) {
      status = 'BOARDING';
      progress = 15;
    } else if (diff <= 30 * 60000) {
      status = 'DEPARTING_SOON';
      progress = 5;
    } else {
      status = 'ON_TIME';
      progress = 0;
    }

    // 12-hour formatted time for display
    const hNum = parseInt(hh, 10);
    const mNum = parseInt(mm, 10);
    const isPm = hNum >= 12;
    const h12 = hNum % 12 === 0 ? 12 : hNum % 12;
    const dep12 = `${h12}:${String(mNum).padStart(2, '0')} ${isPm ? 'PM' : 'AM'}`;

    return {
      id: trip.id,
      origin: trip.origin,
      destination: trip.destination,
      operator: trip.operator,
      routeTitle: `${trip.origin} - ${trip.destination} Hattı`,
      departureTime: trip.departureTime,
      departureTime12: dep12,
      status,
      delayText,
      targetTimeIso: targetIso,
      platform: resolveRealisticPlatform(trip.origin, trip.destination, trip.operator),
      price: getOfficialRouteFare(trip.origin, trip.destination).fullFare,
      progress,
      category: trip.category || (trip.destination.includes('ada') || trip.origin.includes('ada') || trip.destination === 'Büyükada' || trip.origin === 'Büyükada' ? 'ADALAR' : 'BOGAZ'),
      stops: trip.stops && trip.stops.length > 0 ? trip.stops : undefined
    };
  });

  // 3. Sort chronologically by departure time
  schedules.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

  return {
    serverTimeIso: ist.serverTimeIso,
    serverDateFormatted: ist.serverDateFormatted,
    schedules
  };
}
