export type TripStatus =
  | 'ON_TIME'
  | 'DEPARTING_SOON'
  | 'BOARDING'
  | 'DELAYED'
  | 'CANCELLED'
  | 'IN_TRANSIT'
  | 'ARRIVING'
  | 'COMPLETED';

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
  vessel: string;
  platform: string;
  price: string;
  progress: number;
  stops?: { name: string; time: string }[];
}

export interface SchedulesResponse {
  serverTimeIso: string;
  serverDateFormatted?: string;
  schedules: ScheduleCardDto[];
}

export interface ScheduleProvider {
  getSchedules(): Promise<SchedulesResponse>;
}

export const SCHEDULE_PROVIDER = 'SCHEDULE_PROVIDER';
