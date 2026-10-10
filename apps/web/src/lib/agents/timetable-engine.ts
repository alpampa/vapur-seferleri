import { OFFICIAL_SCHEDULES_DATA, RawOfficialTrip } from '../data/official-schedules';
import type { ScheduleCardDto, SchedulesResponse, TripStatus } from '@/lib/types/schedule';
import { getOfficialRouteFare, resolveRealisticPlatform } from '@/lib/data/official-fares';
import { selfHealTripRecord } from '@/lib/agents/self-healing-engine';
import { checkTurkishHoliday } from '@/lib/utils/holiday-calendar';
import { istanbulIsoFor, compareHhmm, nightRolloverDayOffset } from '@/lib/utils/istanbul-time';

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

  const holiday = checkTurkishHoliday(year, month, day);
  const isHoliday = holiday.isHoliday;

  return {
    year,
    month,
    day,
    hour,
    minute,
    isSaturday,
    isSunday,
    isWeekend,
    isHoliday,
    holidayName: holiday.name,
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

  // 1. Filter official schedule for today with precision day & holiday matching
  const todayOfficial = OFFICIAL_SCHEDULES_DATA.filter(trip => {
    // Official holidays apply the Sunday / Holiday timetable
    if (ist.isSunday || ist.isHoliday) {
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

  // 1b. Sanitize: veri kaynağındaki bozuk kayıtları temizle
  //   - departureTime "HH:mm" formatında değilse kayıt atlanır
  //   - origin/destination placeholder metin taşıyorsa atlanır (örn: "Sadece Hafta İçi...")
  //   - varış < kalkış ve kalkış 17:00'den önceyse veri hatasıdır: varış temizlenir,
  //     selfHealTripRecord gerçekçi seyir süresine göre yeniden hesaplar.
  //     17:00 sonrası kalkışta bu gece yarısını aşan gerçek seferdir, korunur.
  const sanitizedTrips: RawOfficialTrip[] = todayOfficial
    .filter(trip => /^\d{2}:\d{2}$/.test(trip.departureTime))
    .filter(trip =>
      !trip.origin.includes('...') && !trip.destination.includes('...')
      && !trip.origin.includes('Sadece') && !trip.destination.includes('Sadece')
      // SIFIR HATA: Kalkış ve varış noktası aynı olan (örn: Büyükada -> Büyükada) geçersiz seferler elenir
      && trip.origin.trim() !== trip.destination.trim()
    )
    .map(trip => {
      // Ara durak temizliği: stops içinde kalkış veya varış iskelesiyle aynı isimde olanlar temizlenir
      const cleanedStops = trip.stops?.filter(
        st => st.name.trim() !== trip.origin.trim() && st.name.trim() !== trip.destination.trim()
      );
      const depHour = parseInt(trip.departureTime.slice(0, 2), 10);
      const hasBadArrival =
        !!trip.arrivalTime &&
        /^\d{2}:\d{2}$/.test(trip.arrivalTime) &&
        compareHhmm(trip.arrivalTime, trip.departureTime) < 0 &&
        depHour < 17;
      return {
        ...(hasBadArrival ? { ...trip, arrivalTime: undefined } : trip),
        stops: cleanedStops && cleanedStops.length > 0 ? cleanedStops : undefined
      };
    });

  // 2. Map raw official trips to full ScheduleCardDto
  const schedules: ScheduleCardDto[] = sanitizedTrips.map((rawTrip) => {
    const trip = selfHealTripRecord(rawTrip);
    const [hh, mm] = trip.departureTime.split(':');

    // Gece seferi (00:00-04:59 kalkış) akşam saatlerinde (20:00+) görüntülenirken
    // kalkış yarına taşınır: 23:50'de 00:15 seferi "GİTTİ" değil "yaklaşan" olur.
    // Kural tek kaynaktır: nightRolloverDayOffset (istanbul-time).
    const targetIso =
      istanbulIsoFor(trip.departureTime, nowMs, nightRolloverDayOffset(trip.departureTime, nowMs) === 1) ??
      `${yearStr}-${monthStr}-${dayStr}T${hh}:${mm}:00+03:00`;
    const targetTimeMs = new Date(targetIso).getTime();
    const diff = targetTimeMs - nowMs;

    let status: TripStatus = 'ON_TIME';
    let progress = 0;
    const delayText: string | undefined = undefined;

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
      stops: trip.stops && trip.stops.length > 0 ? trip.stops : undefined,
      arrivalTime: trip.arrivalTime,
      isContinuous: trip.isContinuous || undefined,
      continuousUntil: trip.continuousUntil,
      lineName: trip.lineName
    };
  });

  // 3. Sort chronologically by resolved target time
  // (gece yarısı yarına taşınan seferler 23:xx'den sonra sıralanır)
  schedules.sort((a, b) =>
    (a.targetTimeIso ?? a.departureTime).localeCompare(b.targetTimeIso ?? b.departureTime)
  );

  return {
    serverTimeIso: ist.serverTimeIso,
    serverDateFormatted: ist.serverDateFormatted,
    schedules
  };
}
