export type TripStatus = "SCHEDULED" | "BOARDING" | "ON_TIME" | "DEPARTING_SOON" | "DELAYED" | "DEPARTED" | "ARRIVING" | "COMPLETED" | "CANCELLED";

export interface ScheduleCardDto {
  id: string;
  origin: string;
  destination: string;
  operator: string;
  routeTitle: string;
  departureTime: string;
  departureTime12: string;
  status: TripStatus;
  countdown?: string;
  countdownSubtext?: string;
  delayText?: string;
  vessel: string;
  platform: string;
  price: string;
  progress: number;
}

export interface ScheduleProvider {
  getSchedules(): Promise<ScheduleCardDto[]>;
}

export const SCHEDULE_PROVIDER = 'SCHEDULE_PROVIDER';
