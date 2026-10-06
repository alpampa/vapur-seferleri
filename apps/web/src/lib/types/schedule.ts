/**
 * Sefer veri modeli — tek kaynak (single source of truth).
 *
 * Bu tipler daha önce `app/page.tsx` ve `ScheduleCard.tsx` içinde tanımlıydı;
 * lib servislerinin sayfa/bileşen import etmesi dairesel bağımlılık riski
 * taşıdığı için merkezi tip modülüne taşındı.
 */

export type TripStatus =
  | "ON_TIME"
  | "DEPARTING_SOON"
  | "BOARDING"
  | "DELAYED"
  | "CANCELLED"
  | "IN_TRANSIT"
  | "ARRIVING"
  | "COMPLETED";

export interface ScheduleCardDto {
  id: string;
  origin: string;
  destination: string;
  operator: string;
  routeTitle: string;
  departureTime: string;
  departureTime12: string;
  status: TripStatus;
  targetTimeIso?: string;
  delayText?: string;
  vessel?: string;
  platform: string;
  price: string;
  progress: number;
  category?: 'ADALAR' | 'BOGAZ';
  stops?: { name: string; time: string }[];
  arrivalTime?: string;

  /** Sürekli sefer penceresi ise start saati (HH:mm) */
  isContinuous?: boolean;
  /** Sürekli sefer pencere bitişi (HH:mm) */
  continuousUntil?: string;
  /** Hat adı */
  lineName?: string;
}

export interface SchedulesResponse {
  serverTimeIso: string;
  serverDateFormatted?: string;
  schedules: ScheduleCardDto[];
}
