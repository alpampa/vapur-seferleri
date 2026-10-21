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

function isValidDateIso(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  return (
    probe.getUTCFullYear() === y &&
    probe.getUTCMonth() === m - 1 &&
    probe.getUTCDate() === d
  );
}

/**
 * Seçili İstanbul takvim gününün tarife tipi.
 * Resmî tatillerde Pazar/holiday tarifesi uygulanır.
 */
export function getDayTypeForDate(dateIso: string): 'WEEKDAY' | 'SATURDAY' | 'SUNDAY' {
  const [y, m, d] = dateIso.split('-').map(Number);
  const holiday = checkTurkishHoliday(y, m, d);
  if (holiday.isHoliday) return 'SUNDAY';
  const dayOfWeek = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  if (dayOfWeek === 0) return 'SUNDAY';
  if (dayOfWeek === 6) return 'SATURDAY';
  return 'WEEKDAY';
}

export interface ScheduleQueryOptions {
  /** YYYY-MM-DD (Europe/Istanbul). Geçersiz/geçmiş tarih bugüne düşer. */
  dateIso?: string;
}

/**
 * Builds schedule DTOs for the selected Istanbul day (default: today).
 * Geçmiş tarihlerde canlı durum üretilmez; tüm seferler ON_TIME/planlanan kalır.
 */
export async function getLiveOrOfficialSchedules(
  options: ScheduleQueryOptions = {}
): Promise<SchedulesResponse> {
  const ist = getIstanbulTime();
  const todayIso = `${ist.year}-${String(ist.month).padStart(2, '0')}-${String(ist.day).padStart(2, '0')}`;
  const requested = options.dateIso?.trim();
  const selectedDateIso =
    requested && isValidDateIso(requested) && requested >= todayIso ? requested : todayIso;
  const isToday = selectedDateIso === todayIso;
  const dayType = getDayTypeForDate(selectedDateIso);
  const nowMs = Date.now();

  const selectedDate = new Date(`${selectedDateIso}T12:00:00+03:00`);
  const selectedDateFormatted = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(selectedDate);

  // 1. Filter official schedule for the selected day with day & holiday matching
  const dayOfficial = OFFICIAL_SCHEDULES_DATA.filter(trip => {
    if (dayType === 'SUNDAY') {
      if (trip.runsSunday !== undefined) return trip.runsSunday;
      return !trip.isWeekdayOnly;
    } else if (dayType === 'SATURDAY') {
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
  const sanitizedTrips: RawOfficialTrip[] = dayOfficial
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

    // ÜCRET KURALI: Şehir Hatları seferleri resmi İBB/ŞH tarife tablosundan
    // (rota + gece penceresi duyarlı) fiyatlanır; diğer operatörlerde (Turyol,
    // Mavi Marmara, Dentur, Prens Tur) operatörün kendi doğrulanmış fiyatı esastır.
    const officialFare = getOfficialRouteFare(trip.origin, trip.destination, trip.departureTime);
    const operatorPrice = trip.price && trip.price.trim() !== "" ? trip.price : undefined;
    const resolvedPrice = trip.operator === "Şehir Hatları"
      ? officialFare.fullFare
      : (operatorPrice ?? officialFare.fullFare);

    // Gece seferi (00:00-04:59 kalkış) akşam saatlerinde (20:00+) görüntülenirken
    // kalkış yarına taşınır: 23:50'de 00:15 seferi "GİTTİ" değil "yaklaşan" olur.
    // Kural tek kaynaktır: nightRolloverDayOffset (istanbul-time).
    // Bugün: gece yarısını aşan seferler için mevcut rollover kuralı korunur.
    // Gelecek gün: sefer seçili takvim gününe sabitlenir; canlı durum üretilmez.
    const targetIso = isToday
      ? istanbulIsoFor(trip.departureTime, nowMs, nightRolloverDayOffset(trip.departureTime, nowMs) === 1) ??
        `${selectedDateIso}T${hh}:${mm}:00+03:00`
      : `${selectedDateIso}T${hh}:${mm}:00+03:00`;
    const targetTimeMs = new Date(targetIso).getTime();
    const diff = targetTimeMs - nowMs;

    let status: TripStatus = 'ON_TIME';
    let progress = 0;
    const delayText: string | undefined = undefined;

    if (isToday) {
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
      price: resolvedPrice,
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
    serverDateFormatted: selectedDateFormatted,
    selectedDateIso,
    dayType,
    isToday,
    schedules
  };
}
