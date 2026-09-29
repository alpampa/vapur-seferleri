/**
 * Türkiye Resmi Tatil ve Dini Bayram Takvim Motoru (2025 - 2028)
 * Resmi tatil ve bayram günlerinde Şehir Hatları ve diğer operatörler "Pazar / Tatil Tarifesi" uygular.
 */

export interface HolidayInfo {
  isHoliday: boolean;
  name?: string;
  isHalfDay?: boolean; // Arefe günleri yarım gün
}

// Sabit Milli Bayramlar (Ay-Gün bazlı, 1-indeksli)
const FIXED_HOLIDAYS: Record<string, string> = {
  "01-01": "Yılbaşı",
  "04-23": "Ulusal Egemenlik ve Çocuk Bayramı",
  "05-01": "Emek ve Dayanışma Günü",
  "05-19": "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
  "07-15": "Demokrasi ve Milli Birlik Günü",
  "08-30": "Zafer Bayramı",
  "10-29": "Cumhuriyet Bayramı"
};

// Değişken Dini Bayramlar (Yıl-Ay-Gün formatında)
const RELIGIOUS_HOLIDAYS: Record<string, string> = {
  // 2025
  "2025-03-29": "Ramazan Bayramı Arefesi",
  "2025-03-30": "Ramazan Bayramı 1. Gün",
  "2025-03-31": "Ramazan Bayramı 2. Gün",
  "2025-04-01": "Ramazan Bayramı 3. Gün",
  "2025-06-05": "Kurban Bayramı Arefesi",
  "2025-06-06": "Kurban Bayramı 1. Gün",
  "2025-06-07": "Kurban Bayramı 2. Gün",
  "2025-06-08": "Kurban Bayramı 3. Gün",
  "2025-06-09": "Kurban Bayramı 4. Gün",

  // 2026
  "2026-03-19": "Ramazan Bayramı Arefesi",
  "2026-03-20": "Ramazan Bayramı 1. Gün",
  "2026-03-21": "Ramazan Bayramı 2. Gün",
  "2026-03-22": "Ramazan Bayramı 3. Gün",
  "2026-05-26": "Kurban Bayramı Arefesi",
  "2026-05-27": "Kurban Bayramı 1. Gün",
  "2026-05-28": "Kurban Bayramı 2. Gün",
  "2026-05-29": "Kurban Bayramı 3. Gün",
  "2026-05-30": "Kurban Bayramı 4. Gün",

  // 2027
  "2027-03-09": "Ramazan Bayramı 1. Gün",
  "2027-03-10": "Ramazan Bayramı 2. Gün",
  "2027-03-11": "Ramazan Bayramı 3. Gün",
  "2027-05-16": "Kurban Bayramı 1. Gün",
  "2027-05-17": "Kurban Bayramı 2. Gün",
  "2027-05-18": "Kurban Bayramı 3. Gün",
  "2027-05-19": "Kurban Bayramı 4. Gün"
};

/**
 * Verilen tarihin Türkiye'de resmi tatil olup olmadığını kontrol eder.
 */
export function checkTurkishHoliday(year: number, month: number, day: number): HolidayInfo {
  const mStr = String(month).padStart(2, "0");
  const dStr = String(day).padStart(2, "0");
  const fixedKey = `${mStr}-${dStr}`;
  const fullKey = `${year}-${mStr}-${dStr}`;

  if (FIXED_HOLIDAYS[fixedKey]) {
    return {
      isHoliday: true,
      name: FIXED_HOLIDAYS[fixedKey]
    };
  }

  if (RELIGIOUS_HOLIDAYS[fullKey]) {
    const isArefe = RELIGIOUS_HOLIDAYS[fullKey].includes("Arefe");
    return {
      isHoliday: !isArefe, // Tam gün bayramlar tatil tarifesindedir
      name: RELIGIOUS_HOLIDAYS[fullKey],
      isHalfDay: isArefe
    };
  }

  return { isHoliday: false };
}
