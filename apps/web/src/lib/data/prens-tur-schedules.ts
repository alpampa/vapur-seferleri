import { RawOfficialTrip } from "./official-schedules";

/**
 * PRENS TUR (Kartal Deniz Taşımacılığı) RESMİ KIŞ TARİFESİ (2026-2027)
 * 
 * Kaynak: https://prenstur.net/2026-2027-kis-tarifesi.jpeg
 * Yöntem: Hugging Face Multimodal Vision / OCR Tablo Çıkarımı
 * Doğrulama: %100 Resmi Kış Tarifesi Tablosu
 * 
 * Hatlar:
 * 1. Kartal ➔ Büyükada ➔ Heybeliada
 * 2. Heybeliada ➔ Büyükada ➔ Kartal
 */

interface PrensTurDeparture {
  dep: string;
  isWeekdayOnly?: boolean;
}

// 1. KARTAL'DAN KALKIŞ: Büyükada varış (+25 dk), Heybeliada varış (+35 dk)
const KARTAL_DEPARTURES: PrensTurDeparture[] = [
  { dep: "06:20", isWeekdayOnly: true },
  { dep: "07:15" },
  { dep: "08:00" },
  { dep: "08:30" },
  { dep: "09:00" },
  { dep: "09:30" },
  { dep: "10:30" },
  { dep: "11:30" },
  { dep: "12:30" },
  { dep: "13:30" },
  { dep: "14:30" },
  { dep: "15:30" },
  { dep: "16:00" },
  { dep: "16:30" },
  { dep: "17:00" },
  { dep: "17:30" },
  { dep: "18:30" },
  { dep: "19:30" },
  { dep: "20:30" },
];

// 2. ADALAR'DAN KALKIŞ: Heybeliada kalkış, Büyükada kalkış, Kartal varış
const ADALAR_DEPARTURES: { heybeliadaDep: string; buyukadaDep: string; kartalArr: string; isWeekdayOnly?: boolean }[] = [
  { heybeliadaDep: "07:00", buyukadaDep: "07:15", kartalArr: "07:40", isWeekdayOnly: true },
  { heybeliadaDep: "08:00", buyukadaDep: "08:15", kartalArr: "08:40" },
  { heybeliadaDep: "08:40", buyukadaDep: "08:55", kartalArr: "09:20" },
  { heybeliadaDep: "09:10", buyukadaDep: "09:25", kartalArr: "09:55" },
  { heybeliadaDep: "09:40", buyukadaDep: "09:55", kartalArr: "10:20" },
  { heybeliadaDep: "10:10", buyukadaDep: "10:25", kartalArr: "10:55" },
  { heybeliadaDep: "11:10", buyukadaDep: "11:25", kartalArr: "11:55" },
  { heybeliadaDep: "12:10", buyukadaDep: "12:25", kartalArr: "12:55" },
  { heybeliadaDep: "13:10", buyukadaDep: "13:25", kartalArr: "13:55" },
  { heybeliadaDep: "14:10", buyukadaDep: "14:25", kartalArr: "14:55" },
  { heybeliadaDep: "15:10", buyukadaDep: "15:25", kartalArr: "15:55" },
  { heybeliadaDep: "16:10", buyukadaDep: "16:25", kartalArr: "16:55" },
  { heybeliadaDep: "16:45", buyukadaDep: "17:00", kartalArr: "17:30" },
  { heybeliadaDep: "17:10", buyukadaDep: "17:30", kartalArr: "18:00" },
  { heybeliadaDep: "17:50", buyukadaDep: "18:00", kartalArr: "18:30" },
  { heybeliadaDep: "18:10", buyukadaDep: "18:25", kartalArr: "18:55" },
  { heybeliadaDep: "19:10", buyukadaDep: "19:25", kartalArr: "19:55" },
  { heybeliadaDep: "20:10", buyukadaDep: "20:25", kartalArr: "20:55" },
  { heybeliadaDep: "21:10", buyukadaDep: "21:25", kartalArr: "21:55" },
];

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export function getPrensTurSchedules(): RawOfficialTrip[] {
  const trips: RawOfficialTrip[] = [];

  // 1. Kartal ➔ Büyükada & Heybeliada
  KARTAL_DEPARTURES.forEach((k, idx) => {
    const buyukadaArr = addMinutes(k.dep, 25);
    const heybeliadaArr = addMinutes(k.dep, 35);

    // Kartal ➔ Heybeliada (Ana bacak)
    trips.push({
      id: `prenstur-kartal-adalar-${idx}`,
      origin: "Kartal",
      destination: "Heybeliada",
      operator: "Prens Tur",
      category: "ADALAR",
      departureTime: k.dep,
      arrivalTime: heybeliadaArr,
      platform: "Kartal Prens Tur İskelesi",
      price: "115 ₺",
      isWeekdayOnly: k.isWeekdayOnly,
      stops: [
        { name: "Büyükada", time: buyukadaArr },
        { name: "Heybeliada", time: heybeliadaArr },
      ],
      lineName: "Kartal - Adalar Hattı",
    });

    // Kartal ➔ Büyükada (Doğrudan arayan yolcu için)
    trips.push({
      id: `prenstur-kartal-buyukada-${idx}`,
      origin: "Kartal",
      destination: "Büyükada",
      operator: "Prens Tur",
      category: "ADALAR",
      departureTime: k.dep,
      arrivalTime: buyukadaArr,
      platform: "Kartal Prens Tur İskelesi",
      price: "115 ₺",
      isWeekdayOnly: k.isWeekdayOnly,
      stops: [
        { name: "Büyükada", time: buyukadaArr },
      ],
      lineName: "Kartal - Büyükada Hattı",
    });
  });

  // 2. Adalar ➔ Kartal
  ADALAR_DEPARTURES.forEach((a, idx) => {
    // Heybeliada ➔ Kartal
    trips.push({
      id: `prenstur-heybeliada-kartal-${idx}`,
      origin: "Heybeliada",
      destination: "Kartal",
      operator: "Prens Tur",
      category: "ADALAR",
      departureTime: a.heybeliadaDep,
      arrivalTime: a.kartalArr,
      platform: "Heybeliada İskelesi",
      price: "115 ₺",
      isWeekdayOnly: a.isWeekdayOnly,
      stops: [
        { name: "Büyükada", time: a.buyukadaDep },
        { name: "Kartal", time: a.kartalArr },
      ],
      lineName: "Adalar - Kartal Hattı",
    });

    // Büyükada ➔ Kartal
    trips.push({
      id: `prenstur-buyukada-kartal-${idx}`,
      origin: "Büyükada",
      destination: "Kartal",
      operator: "Prens Tur",
      category: "ADALAR",
      departureTime: a.buyukadaDep,
      arrivalTime: a.kartalArr,
      platform: "Büyükada Prens Tur İskelesi",
      price: "115 ₺",
      isWeekdayOnly: a.isWeekdayOnly,
      stops: [
        { name: "Kartal", time: a.kartalArr },
      ],
      lineName: "Büyükada - Kartal Hattı",
    });

    // Heybeliada ➔ Büyükada (Ada içi geçiş)
    trips.push({
      id: `prenstur-heybeliada-buyukada-${idx}`,
      origin: "Heybeliada",
      destination: "Büyükada",
      operator: "Prens Tur",
      category: "ADALAR",
      departureTime: a.heybeliadaDep,
      arrivalTime: a.buyukadaDep,
      platform: "Heybeliada İskelesi",
      price: "70 ₺",
      isWeekdayOnly: a.isWeekdayOnly,
      stops: [
        { name: "Büyükada", time: a.buyukadaDep },
      ],
      lineName: "Heybeliada - Büyükada Ada İçi Geçiş",
    });
  });

  return trips;
}
