import { RawOfficialTrip } from "./official-schedules";

/**
 * İDO (İstanbul Deniz Otobüsleri) RESMİ TARİFE VERİ SETİ
 *
 * Kaynak: https://www.ido.com.tr/tr/sefer-saatleri
 * Kapsam: Marmara & Prens Adaları Hızlı Deniz Otobüsü Hatları:
 *   1. Bostancı ➔ Büyükada ➔ Heybeliada (Hızlı Hat)
 *   2. Heybeliada ➔ Büyükada ➔ Bostancı
 *   3. Kabataş ➔ Kadıköy ➔ Kınalıada ➔ Büyükada
 *   4. Büyükada ➔ Kınalıada ➔ Kadıköy ➔ Kabataş
 *
 * Ücret: İDO Adalar hatlarında dinamik/kademeli bilet tarifesi uygulanır;
 * standart bilet ortalaması baz alınmıştır.
 */

const IDO_FARE = "85,00 ₺";
const IDO_PLATFORM_BOSTANCI = "İDO Bostancı Terminali";
const IDO_PLATFORM_KABATAS = "İDO Kabataş İskelesi";
const IDO_PLATFORM_KADIKOY = "İDO Kadıköy İskelesi";
const IDO_PLATFORM_BUYUKADA = "İDO Büyükada İskelesi";
const IDO_PLATFORM_HEYBELIADA = "İDO Heybeliada İskelesi";

interface IdoTripConfig {
  id: string;
  dep: string;
  arr: string;
  origin: string;
  destination: string;
  platform: string;
  stops?: { name: string; time: string }[];
  isWeekendOnly?: boolean;
  isWeekdayOnly?: boolean;
  lineName: string;
}

const BOSTANCI_TO_ISLANDS: IdoTripConfig[] = [
  {
    id: "ido-bos-ada-0730",
    dep: "07:30",
    arr: "08:05",
    origin: "Bostancı",
    destination: "Heybeliada",
    platform: IDO_PLATFORM_BOSTANCI,
    stops: [{ name: "Büyükada", time: "07:50" }],
    isWeekdayOnly: true,
    lineName: "Bostancı - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-bos-ada-0930",
    dep: "09:30",
    arr: "10:05",
    origin: "Bostancı",
    destination: "Heybeliada",
    platform: IDO_PLATFORM_BOSTANCI,
    stops: [{ name: "Büyükada", time: "09:50" }],
    lineName: "Bostancı - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-bos-ada-1130",
    dep: "11:30",
    arr: "12:05",
    origin: "Bostancı",
    destination: "Heybeliada",
    platform: IDO_PLATFORM_BOSTANCI,
    stops: [{ name: "Büyükada", time: "11:50" }],
    lineName: "Bostancı - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-bos-ada-1330",
    dep: "13:30",
    arr: "14:05",
    origin: "Bostancı",
    destination: "Heybeliada",
    platform: IDO_PLATFORM_BOSTANCI,
    stops: [{ name: "Büyükada", time: "13:50" }],
    lineName: "Bostancı - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-bos-ada-1530",
    dep: "15:30",
    arr: "16:05",
    origin: "Bostancı",
    destination: "Heybeliada",
    platform: IDO_PLATFORM_BOSTANCI,
    stops: [{ name: "Büyükada", time: "15:50" }],
    lineName: "Bostancı - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-bos-ada-1730",
    dep: "17:30",
    arr: "18:05",
    origin: "Bostancı",
    destination: "Heybeliada",
    platform: IDO_PLATFORM_BOSTANCI,
    stops: [{ name: "Büyükada", time: "17:50" }],
    lineName: "Bostancı - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-bos-ada-1930",
    dep: "19:30",
    arr: "20:05",
    origin: "Bostancı",
    destination: "Heybeliada",
    platform: IDO_PLATFORM_BOSTANCI,
    stops: [{ name: "Büyükada", time: "19:50" }],
    lineName: "Bostancı - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-bos-ada-2100",
    dep: "21:00",
    arr: "21:35",
    origin: "Bostancı",
    destination: "Heybeliada",
    platform: IDO_PLATFORM_BOSTANCI,
    stops: [{ name: "Büyükada", time: "21:20" }],
    lineName: "Bostancı - Adalar Deniz Otobüsü",
  },
];

const ISLANDS_TO_BOSTANCI: IdoTripConfig[] = [
  {
    id: "ido-ada-bos-0815",
    dep: "08:15",
    arr: "08:50",
    origin: "Heybeliada",
    destination: "Bostancı",
    platform: IDO_PLATFORM_HEYBELIADA,
    stops: [{ name: "Büyükada", time: "08:30" }],
    isWeekdayOnly: true,
    lineName: "Adalar - Bostancı Deniz Otobüsü",
  },
  {
    id: "ido-ada-bos-1015",
    dep: "10:15",
    arr: "10:50",
    origin: "Heybeliada",
    destination: "Bostancı",
    platform: IDO_PLATFORM_HEYBELIADA,
    stops: [{ name: "Büyükada", time: "10:30" }],
    lineName: "Adalar - Bostancı Deniz Otobüsü",
  },
  {
    id: "ido-ada-bos-1215",
    dep: "12:15",
    arr: "12:50",
    origin: "Heybeliada",
    destination: "Bostancı",
    platform: IDO_PLATFORM_HEYBELIADA,
    stops: [{ name: "Büyükada", time: "12:30" }],
    lineName: "Adalar - Bostancı Deniz Otobüsü",
  },
  {
    id: "ido-ada-bos-1415",
    dep: "14:15",
    arr: "14:50",
    origin: "Heybeliada",
    destination: "Bostancı",
    platform: IDO_PLATFORM_HEYBELIADA,
    stops: [{ name: "Büyükada", time: "14:30" }],
    lineName: "Adalar - Bostancı Deniz Otobüsü",
  },
  {
    id: "ido-ada-bos-1615",
    dep: "16:15",
    arr: "16:50",
    origin: "Heybeliada",
    destination: "Bostancı",
    platform: IDO_PLATFORM_HEYBELIADA,
    stops: [{ name: "Büyükada", time: "16:30" }],
    lineName: "Adalar - Bostancı Deniz Otobüsü",
  },
  {
    id: "ido-ada-bos-1815",
    dep: "18:15",
    arr: "18:50",
    origin: "Heybeliada",
    destination: "Bostancı",
    platform: IDO_PLATFORM_HEYBELIADA,
    stops: [{ name: "Büyükada", time: "18:30" }],
    lineName: "Adalar - Bostancı Deniz Otobüsü",
  },
  {
    id: "ido-ada-bos-2015",
    dep: "20:15",
    arr: "20:50",
    origin: "Heybeliada",
    destination: "Bostancı",
    platform: IDO_PLATFORM_HEYBELIADA,
    stops: [{ name: "Büyükada", time: "20:30" }],
    lineName: "Adalar - Bostancı Deniz Otobüsü",
  },
  {
    id: "ido-ada-bos-2145",
    dep: "21:45",
    arr: "22:20",
    origin: "Heybeliada",
    destination: "Bostancı",
    platform: IDO_PLATFORM_HEYBELIADA,
    stops: [{ name: "Büyükada", time: "22:00" }],
    lineName: "Adalar - Bostancı Deniz Otobüsü",
  },
];

const KABATAS_KADIKOY_TO_ISLANDS: IdoTripConfig[] = [
  {
    id: "ido-kab-ada-0845",
    dep: "08:45",
    arr: "09:45",
    origin: "Kabataş",
    destination: "Büyükada",
    platform: IDO_PLATFORM_KABATAS,
    stops: [
      { name: "Kadıköy", time: "09:05" },
      { name: "Kınalıada", time: "09:30" },
    ],
    lineName: "Kabataş - Kadıköy - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-kab-ada-1045",
    dep: "10:45",
    arr: "11:45",
    origin: "Kabataş",
    destination: "Büyükada",
    platform: IDO_PLATFORM_KABATAS,
    stops: [
      { name: "Kadıköy", time: "11:05" },
      { name: "Kınalıada", time: "11:30" },
    ],
    lineName: "Kabataş - Kadıköy - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-kab-ada-1445",
    dep: "14:45",
    arr: "15:45",
    origin: "Kabataş",
    destination: "Büyükada",
    platform: IDO_PLATFORM_KABATAS,
    stops: [
      { name: "Kadıköy", time: "15:05" },
      { name: "Kınalıada", time: "15:30" },
    ],
    lineName: "Kabataş - Kadıköy - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-kab-ada-1715",
    dep: "17:15",
    arr: "18:15",
    origin: "Kabataş",
    destination: "Büyükada",
    platform: IDO_PLATFORM_KABATAS,
    stops: [
      { name: "Kadıköy", time: "17:35" },
      { name: "Kınalıada", time: "18:00" },
    ],
    lineName: "Kabataş - Kadıköy - Adalar Deniz Otobüsü",
  },
  {
    id: "ido-kab-ada-1945",
    dep: "19:45",
    arr: "20:45",
    origin: "Kabataş",
    destination: "Büyükada",
    platform: IDO_PLATFORM_KABATAS,
    stops: [
      { name: "Kadıköy", time: "20:05" },
      { name: "Kınalıada", time: "20:30" },
    ],
    lineName: "Kabataş - Kadıköy - Adalar Deniz Otobüsü",
  },
];

const ISLANDS_TO_KADIKOY_KABATAS: IdoTripConfig[] = [
  {
    id: "ido-ada-kab-0940",
    dep: "09:40",
    arr: "10:40",
    origin: "Büyükada",
    destination: "Kabataş",
    platform: IDO_PLATFORM_BUYUKADA,
    stops: [
      { name: "Kınalıada", time: "09:55" },
      { name: "Kadıköy", time: "10:20" },
    ],
    lineName: "Adalar - Kadıköy - Kabataş Deniz Otobüsü",
  },
  {
    id: "ido-ada-kab-1140",
    dep: "11:40",
    arr: "12:40",
    origin: "Büyükada",
    destination: "Kabataş",
    platform: IDO_PLATFORM_BUYUKADA,
    stops: [
      { name: "Kınalıada", time: "11:55" },
      { name: "Kadıköy", time: "12:20" },
    ],
    lineName: "Adalar - Kadıköy - Kabataş Deniz Otobüsü",
  },
  {
    id: "ido-ada-kab-1540",
    dep: "15:40",
    arr: "16:40",
    origin: "Büyükada",
    destination: "Kabataş",
    platform: IDO_PLATFORM_BUYUKADA,
    stops: [
      { name: "Kınalıada", time: "15:55" },
      { name: "Kadıköy", time: "16:20" },
    ],
    lineName: "Adalar - Kadıköy - Kabataş Deniz Otobüsü",
  },
  {
    id: "ido-ada-kab-1810",
    dep: "18:10",
    arr: "19:10",
    origin: "Büyükada",
    destination: "Kabataş",
    platform: IDO_PLATFORM_BUYUKADA,
    stops: [
      { name: "Kınalıada", time: "18:25" },
      { name: "Kadıköy", time: "18:50" },
    ],
    lineName: "Adalar - Kadıköy - Kabataş Deniz Otobüsü",
  },
  {
    id: "ido-ada-kab-2040",
    dep: "20:40",
    arr: "21:40",
    origin: "Büyükada",
    destination: "Kabataş",
    platform: IDO_PLATFORM_BUYUKADA,
    stops: [
      { name: "Kınalıada", time: "20:55" },
      { name: "Kadıköy", time: "21:20" },
    ],
    lineName: "Adalar - Kadıköy - Kabataş Deniz Otobüsü",
  },
];

export function getIdoSchedules(): RawOfficialTrip[] {
  const allConfigs = [
    ...BOSTANCI_TO_ISLANDS,
    ...ISLANDS_TO_BOSTANCI,
    ...KABATAS_KADIKOY_TO_ISLANDS,
    ...ISLANDS_TO_KADIKOY_KABATAS,
  ];

  return allConfigs.map((cfg) => ({
    id: cfg.id,
    origin: cfg.origin,
    destination: cfg.destination,
    operator: "İDO",
    category: "ADALAR",
    departureTime: cfg.dep,
    arrivalTime: cfg.arr,
    platform: cfg.platform,
    price: IDO_FARE,
    stops: cfg.stops,
    isWeekendOnly: cfg.isWeekendOnly,
    isWeekdayOnly: cfg.isWeekdayOnly,
    runsWeekday: cfg.isWeekendOnly ? false : true,
    runsSaturday: cfg.isWeekdayOnly ? false : true,
    runsSunday: cfg.isWeekdayOnly ? false : true,
    lineName: cfg.lineName,
  }));
}
