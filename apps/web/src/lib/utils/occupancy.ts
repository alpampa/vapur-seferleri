export type OccupancyLevel = "LOW" | "MEDIUM" | "HIGH" | "RUSH";

export interface OccupancyInfo {
  level: OccupancyLevel;
  percentage: number;
  label: string;
  badgeClass: string;
  glowClass: string;
  description: string;
}

export interface AmenityInfo {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  available: boolean;
}

/**
 * ÖNERİ 1: İskele ve Vapur Yoğunluk Isı Endeksi (Crowd Density & Heat Index)
 * 
 * Gerçek Ulaşım Mantığı (İBB & Şehir Hatları Yolcu Yoğunluk Eğrisi):
 * 1. Hafta İçi Mesai Saatleri (Rush Hour):
 *    - 07:30 - 09:30: Anadolu -> Avrupa (Kadıköy, Üsküdar, Bostancı -> Eminönü, Karaköy, Beşiktaş) %88 - %95 Pik Yoğunluk
 *    - 17:00 - 19:45: Avrupa -> Anadolu (Karaköy, Eminönü, Beşiktaş -> Kadıköy, Üsküdar, Bostancı) %92 - %98 Pik Yoğunluk
 * 2. Hafta Sonu Ada Turizmi Dalgası:
 *    - 10:30 - 14:00: Şehir -> Adalar (Bostancı, Kabataş, Kadıköy -> Adalar) %90 - %95 Çok Yoğun
 *    - 17:30 - 20:30: Adalar -> Şehir dönüşü %95 - %100 Aşırı Yoğun (Turnike ve rıhtım kuyruğu)
 * 3. Gündüz Normal Saatler (10:00 - 16:30): %40 - %60 Dengeli Akış
 * 4. Gece / Sabah Erken Saatler: %15 - %30 Tenha
 */
export function predictTripOccupancy(
  origin: string,
  destination: string,
  departureTime: string,
  isWeekend: boolean = false
): OccupancyInfo {
  const [h, m] = departureTime.split(':').map(Number);
  const timeMin = (h || 0) * 60 + (m || 0);

  const isAnatoliaToEurope =
    (origin === 'Kadıköy' || origin === 'Üsküdar' || origin === 'Bostancı') &&
    (destination === 'Karaköy' || destination === 'Eminönü' || destination === 'Beşiktaş' || destination === 'Kabataş');

  const isEuropeToAnatolia =
    (origin === 'Karaköy' || origin === 'Eminönü' || origin === 'Beşiktaş' || origin === 'Kabataş') &&
    (destination === 'Kadıköy' || destination === 'Üsküdar' || destination === 'Bostancı');

  const isToAdalar =
    destination.includes('ada') || destination === 'Büyükada' || destination === 'Heybeliada' || destination === 'Kınalıada' || destination === 'Burgazada';

  const isFromAdalar =
    origin.includes('ada') || origin === 'Büyükada' || origin === 'Heybeliada' || origin === 'Kınalıada' || origin === 'Burgazada';

  // 1. Weekday Morning Rush (07:30 - 09:30): Anatolia -> Europe
  if (!isWeekend && timeMin >= 7 * 60 + 30 && timeMin <= 9 * 60 + 30 && isAnatoliaToEurope) {
    return {
      level: "RUSH",
      percentage: 92,
      label: "Pik Saat • %92 Doluluk",
      badgeClass: "bg-rose-950/90 border border-rose-500/60 text-rose-300 font-black ring-1 ring-rose-500/40",
      glowClass: "shadow-sm shadow-rose-500/30",
      description: "Sabah iş/okul giriş saatleri sebebiyle rıhtım turnikelerinde ve ana salonda yüksek yoğunluk beklenmektedir."
    };
  }

  // 2. Weekday Evening Rush (17:00 - 19:45): Europe -> Anatolia
  if (!isWeekend && timeMin >= 17 * 60 && timeMin <= 19 * 60 + 45 && isEuropeToAnatolia) {
    return {
      level: "RUSH",
      percentage: 95,
      label: "Pik Saat • %95 Doluluk",
      badgeClass: "bg-rose-950/90 border border-rose-500/60 text-rose-300 font-black ring-1 ring-rose-500/40",
      glowClass: "shadow-sm shadow-rose-500/30",
      description: "Akşam mesai çıkışı sebebiyle iskele rıhtımında kuyruk ve üst güvertelerde yoğun doluluk beklenmektedir."
    };
  }

  // 3. Weekend Outbound to Adalar (10:30 - 14:00)
  if (isWeekend && timeMin >= 10 * 60 + 30 && timeMin <= 14 * 60 && isToAdalar) {
    return {
      level: "HIGH",
      percentage: 88,
      label: "Yoğun • %88 Ada Akını",
      badgeClass: "bg-rose-950/90 border border-rose-500/50 text-rose-300 font-black",
      glowClass: "shadow-sm shadow-rose-500/20",
      description: "Hafta sonu ada ziyaretçileri sebebiyle açık güverte oturma alanları erken dolabilir."
    };
  }

  // 4. Weekend Return from Adalar (17:30 - 20:30)
  if (isWeekend && timeMin >= 17 * 60 + 30 && timeMin <= 20 * 60 + 30 && isFromAdalar) {
    return {
      level: "RUSH",
      percentage: 98,
      label: "Aşırı Yoğun • %98 Dönüş",
      badgeClass: "bg-rose-950/90 border border-rose-500/60 text-rose-300 font-black ring-1 ring-rose-500/40 animate-pulse",
      glowClass: "shadow-md shadow-rose-500/40",
      description: "Adalardan şehre dönüş dalgası sebebiyle turnikelerde ve rıhtımda yoğun bekleme yaşanabilir."
    };
  }

  // 5. Normal Daytime Hours (10:00 - 16:30)
  if (timeMin >= 10 * 60 && timeMin <= 16 * 60 + 30) {
    return {
      level: "MEDIUM",
      percentage: 52,
      label: "Normal • %52 Doluluk",
      badgeClass: "bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold",
      glowClass: "shadow-xs",
      description: "Dengeli yolcu akışı. Rahatça oturma yeri bulabilirsiniz."
    };
  }

  // 6. Early morning or Late night
  return {
    level: "LOW",
    percentage: 25,
    label: "Sakin • %25 Doluluk",
    badgeClass: "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold",
    glowClass: "shadow-xs",
    description: "Sakin sefer. Vapurda geniş boş yer ve ferah oturma alanı mevcuttur."
  };
}

/**
 * İskele bazlı anlık doluluk ve turnike kalabalık endeksi
 */
export function calculatePierCrowdDensity(pierName: string, isWeekend: boolean = false): {
  percentage: number;
  statusLabel: string;
  glowColor: string;
} {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const timeMin = currentHour * 60 + currentMin;

  const isAda = pierName.includes("Büyükada") || pierName.includes("Heybeliada") || pierName.includes("Kınalıada") || pierName.includes("Burgazada");

  if (isWeekend) {
    if (isAda && timeMin >= 17 * 60 && timeMin <= 20 * 60 + 30) {
      return { percentage: 96, statusLabel: "Rıhtım Aşırı Kalabalık (Dönüş Dalgası)", glowColor: "text-rose-400 bg-rose-500/20 border-rose-500/50" };
    }
    if (!isAda && (pierName === "Bostancı" || pierName === "Kabataş") && timeMin >= 10 * 60 && timeMin <= 13 * 60 + 30) {
      return { percentage: 89, statusLabel: "Ada Turnikeleri Yoğun", glowColor: "text-amber-400 bg-amber-500/20 border-amber-500/50" };
    }
  } else {
    // Weekday rush
    if ((pierName === "Kadıköy" || pierName === "Üsküdar") && timeMin >= 7 * 60 + 30 && timeMin <= 9 * 60 + 30) {
      return { percentage: 91, statusLabel: "Sabah İşe Gidiş Pik Saati", glowColor: "text-rose-400 bg-rose-500/20 border-rose-500/50" };
    }
    if ((pierName === "Eminönü" || pierName === "Karaköy" || pierName === "Beşiktaş") && timeMin >= 17 * 60 + 30 && timeMin <= 19 * 60 + 30) {
      return { percentage: 94, statusLabel: "Akşam İş Çıkışı Pik Saati", glowColor: "text-rose-400 bg-rose-500/20 border-rose-500/50" };
    }
  }

  if (timeMin >= 10 * 60 && timeMin <= 16 * 60 + 30) {
    return { percentage: 48, statusLabel: "Normal Yolcu Akışı", glowColor: "text-blue-400 bg-blue-500/20 border-blue-500/40" };
  }

  return { percentage: 22, statusLabel: "Rıhtım Tenha & Sakin", glowColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40" };
}

/**
 * ÖNERİ 2: Vapur İçi Canlı Büfe, Bisiklet, Evcil Hayvan ve Konfor Kapasite Rozetleri
 * UKOME ve Şehir Hatları resmi deniz taşımacılığı standartlarına göre belirlenir.
 */
export function getTripAmenities(operator: string, vesselName?: string): AmenityInfo[] {
  const isSehirHatlari = operator.toLowerCase().includes("şehir hatları") || operator.toLowerCase().includes("sehir hatlari");
  const isMaviMarmara = operator.toLowerCase().includes("mavi marmara");
  const isTuryol = operator.toLowerCase().includes("turyol");

  return [
    {
      id: "buffet",
      label: "Büfe & Taze Çay",
      shortLabel: "Büfe",
      icon: "☕",
      description: isSehirHatlari || isMaviMarmara 
        ? "Vapur büfesinde sıcak çay, kahve, tost ve taze simit servisi mevcuttur."
        : "Standart içecek ve atıştırmalık servisi.",
      available: true
    },
    {
      id: "bicycle",
      label: "Bisiklet Taşıma",
      shortLabel: "Bisiklet",
      icon: "🚲",
      description: "UKOME kararınca deniz hatlarında bisiklet geçişi ücretsizdir.",
      available: true
    },
    {
      id: "pet",
      label: "Evcil Hayvan",
      shortLabel: "Evcil Hayvan",
      icon: "🐾",
      description: "Açık güverte alanında tasmalı veya taşıma çantasında seyahat edilebilir.",
      available: true
    },
    {
      id: "accessible",
      label: "Engelsiz Erişim",
      shortLabel: "Engelli Rampası",
      icon: "♿",
      description: "İskele rıhtımı ve vapur girişi tekerlekli sandalye ve puset rampasıyla uyumludur.",
      available: true
    },
    {
      id: "wifi",
      label: "İBB Wi-Fi",
      shortLabel: "Wi-Fi",
      icon: "📶",
      description: isSehirHatlari ? "Şehir Hatları vapurlarında ve ana iskelelerde ücretsiz Wi-Fi internet." : "İskele alanında İBB Wi-Fi mevcuttur.",
      available: isSehirHatlari
    }
  ];
}
