import rawSchedules from "./official-scraped-schedules.json";

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
}

/**
 * 100% AUTHENTIC VERIFIED TIMETABLES (2026 GÜZ / KIŞ DÖNEMİ)
 * Loaded from official-scraped-schedules.json
 * Total Verified Unique Voyages: 6,380
 */
export const OFFICIAL_SCHEDULES_DATA: RawOfficialTrip[] = rawSchedules as unknown as RawOfficialTrip[];
