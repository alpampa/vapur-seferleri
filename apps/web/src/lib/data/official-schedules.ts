import rawSchedules from "./official-scraped-schedules.json";
import { generateSupplementarySchedules } from "./supplementary-schedules";
import { getMaviMarmaraSchedules } from "./mavi-marmara-schedules";
import { getDenturSchedules } from "./dentur-schedules";
import { getPrensTurSchedules } from "./prens-tur-schedules";
import { getTuryolSchedules } from "./turyol-schedules";
import { getIdoSchedules } from "./ido-schedules";

export interface RawStop {
  name: string;
  time: string;
}

export type FerryOperatorName = 
  | 'Şehir Hatları' 
  | 'İDO' 
  | 'Turyol' 
  | 'Mavi Marmara' 
  | 'Dentur Avrasya' 
  | 'Prens Tur';

export interface RawOfficialTrip {
  id: string;
  origin: string;
  destination: string;
  operator: FerryOperatorName;
  category?: 'ADALAR' | 'BOGAZ';

  departureTime: string;
  arrivalTime?: string;
  platform: string;
  price: string;
  stops?: RawStop[];
  isWeekendOnly?: boolean;
  isWeekdayOnly?: boolean;
  runsWeekday?: boolean;
  runsSaturday?: boolean;
  runsSunday?: boolean;

  /** Sadece 'Sürekli Sefer' pencereleri için (uydurma saat üretilmez) */
  isContinuous?: boolean;
  /** Sürekli sefer penceresinin bitiş saati (HH:mm) */
  continuousUntil?: string;
  /** Hat tanımlayıcı (örn. Beşiktaş-Kadıköy) */
  lineName?: string;
}

/**
 * LİMAN BAŞKANLIĞI VE UKOME İZİNLİ TÜM OPERATÖRLER DOĞRULANMIŞ VERİ SETİ:
 * - Şehir Hatları : official-scraped-schedules.json (resmi portal dökümü).
 * - İDO           : ido.com.tr Marmara & Adalar hızlı deniz otobüsü tarifesi.
 * - Mavi Marmara  : mavimarmara.net resmi tarife sayfalarından doğrulanmış GERÇEK veri.
 * - Dentur Avrasya: denturavrasya.com hat sayfalarından canlı parse edilmiş veri.
 * - Prens Tur     : prenstur.net resmi 2026-2027 kış tarifesi afişinden çıkarılmış doğrulanmış veri.
 * - Turyol        : turyol.com iç arama motorundan canlı çekilmiş doğrulanmış veri.
 */
const baseTrips = rawSchedules as unknown as RawOfficialTrip[];
const supplementaryTrips = generateSupplementarySchedules();
const maviMarmaraTrips = getMaviMarmaraSchedules();
const denturTrips = getDenturSchedules();
const prensTurTrips = getPrensTurSchedules();
const turyolTrips = getTuryolSchedules();
const idoTrips = getIdoSchedules();

export const OFFICIAL_SCHEDULES_DATA: RawOfficialTrip[] = [
  ...baseTrips,
  ...supplementaryTrips,
  ...maviMarmaraTrips,
  ...denturTrips,
  ...prensTurTrips,
  ...turyolTrips,
  ...idoTrips,
];
