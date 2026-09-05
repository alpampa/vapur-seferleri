export type OccupancyLevel = "LOW" | "MEDIUM" | "HIGH";

export interface OccupancyInfo {
  level: OccupancyLevel;
  percentage: number;
  label: string;
  badgeClass: string;
  description: string;
}

export function predictTripOccupancy(
  origin: string,
  destination: string,
  departureTime: string,
  isWeekend: boolean = false
): OccupancyInfo {
  const [h, m] = departureTime.split(':').map(Number);
  const timeMin = h * 60 + m;

  const isAnatoliaToEurope =
    (origin === 'Kadıköy' || origin === 'Üsküdar' || origin === 'Bostancı') &&
    (destination === 'Karaköy' || destination === 'Eminönü' || destination === 'Beşiktaş' || destination === 'Kabataş');

  const isEuropeToAnatolia =
    (origin === 'Karaköy' || origin === 'Eminönü' || origin === 'Beşiktaş' || origin === 'Kabataş') &&
    (destination === 'Kadıköy' || destination === 'Üsküdar' || destination === 'Bostancı');

  const isToAdalar =
    destination.includes('ada') || destination === 'Büyükada' || destination === 'Heybeliada';

  const isFromAdalar =
    origin.includes('ada') || origin === 'Büyükada' || origin === 'Heybeliada';

  // 1. Weekday Morning Rush (07:30 - 09:30): Anatolia -> Europe
  if (!isWeekend && timeMin >= 7 * 60 + 30 && timeMin <= 9 * 60 + 30 && isAnatoliaToEurope) {
    return {
      level: "HIGH",
      percentage: 88,
      label: "Yoğun (İş/Okul Girişi)",
      badgeClass: "bg-rose-950/90 border border-rose-500/50 text-rose-300 font-black",
      description: "Sabah iş ve okul giriş saati sebebiyle yüksek yolcu yoğunluğu beklenmektedir."
    };
  }

  // 2. Weekday Evening Rush (17:00 - 19:45): Europe -> Anatolia
  if (!isWeekend && timeMin >= 17 * 60 && timeMin <= 19 * 60 + 45 && isEuropeToAnatolia) {
    return {
      level: "HIGH",
      percentage: 92,
      label: "Yoğun (İş Çıkışı)",
      badgeClass: "bg-rose-950/90 border border-rose-500/50 text-rose-300 font-black",
      description: "Akşam iş çıkışı ve dönüş saati sebebiyle iskelede sıra ve yoğunluk olabilir."
    };
  }

  // 3. Weekend Outbound to Adalar (10:30 - 14:00)
  if (isWeekend && timeMin >= 10 * 60 + 30 && timeMin <= 14 * 60 && isToAdalar) {
    return {
      level: "HIGH",
      percentage: 90,
      label: "Yoğun (Hafta Sonu Ada Turizmi)",
      badgeClass: "bg-rose-950/90 border border-rose-500/50 text-rose-300 font-black",
      description: "Hafta sonu ada ziyaretçileri sebebiyle vapurda oturma yerleri erken dolabilir."
    };
  }

  // 4. Weekend Return from Adalar (17:30 - 20:30)
  if (isWeekend && timeMin >= 17 * 60 + 30 && timeMin <= 20 * 60 + 30 && isFromAdalar) {
    return {
      level: "HIGH",
      percentage: 95,
      label: "Çok Yoğun (Adadan Dönüş)",
      badgeClass: "bg-rose-950/90 border border-rose-500/50 text-rose-300 font-black",
      description: "Adalardan şehre dönüş saatinde iskele turnikelerinde yoğunluk yaşanabilir."
    };
  }

  // 5. Normal Daytime Hours (10:00 - 16:30)
  if (timeMin >= 10 * 60 && timeMin <= 16 * 60 + 30) {
    return {
      level: "MEDIUM",
      percentage: 52,
      label: "Orta Yoğunluk",
      badgeClass: "bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold",
      description: "Normal seyir yoğunluğu. Rahatça oturma yeri bulabilirsiniz."
    };
  }

  // 6. Early morning or Late night
  return {
    level: "LOW",
    percentage: 28,
    label: "Sakin",
    badgeClass: "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold",
    description: "Sakin saatler. Vapurda bolca boş yer mevcuttur."
  };
}
