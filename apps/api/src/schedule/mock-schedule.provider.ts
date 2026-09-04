import { Injectable, Logger } from '@nestjs/common';
import {
  ScheduleProvider,
  ScheduleCardDto,
  SchedulesResponse,
} from './schedule.provider';

@Injectable()
export class MockScheduleProvider implements ScheduleProvider {
  private readonly logger = new Logger(MockScheduleProvider.name);

  async getSchedules(): Promise<SchedulesResponse> {
    this.logger.debug('Fetching schedules from MockProvider');
    const now = new Date();
    const serverTimeIso = now.toISOString();

    const addMinutes = (m: number) =>
      new Date(now.getTime() + m * 60000).toISOString();

    const schedules: ScheduleCardDto[] = [
      {
        id: 'trip-1',
        origin: 'Manhattan',
        destination: 'Brooklyn',
        operator: 'NY Waterway',
        routeTitle: 'Route: Lower Manhattan → Dumbo',
        departureTime: '17:15',
        departureTime12: '(5:15 PM)',
        status: 'DEPARTING_SOON',
        targetTimeIso: addMinutes(4), // 4 mins countdown
        vessel: 'MV Empire State',
        platform: 'Pier 11',
        price: '$3.50',
        progress: 80,
      },
      {
        id: 'trip-2',
        origin: 'San Francisco',
        destination: 'Sausalito',
        operator: 'Golden Gate Ferry',
        routeTitle: 'Route: Ferry Building → Sausalito',
        departureTime: '17:30',
        departureTime12: '(5:30 PM)',
        status: 'ON_TIME',
        targetTimeIso: addMinutes(15),
        vessel: 'MS San Francisco',
        platform: 'Gate B',
        price: '$14.25',
        progress: 20,
      },
      {
        id: 'trip-3',
        origin: 'Seattle',
        destination: 'Bainbridge Island',
        operator: 'WSDOT Ferry',
        routeTitle: 'Route: Colman Dock → Bainbridge',
        departureTime: '17:45',
        departureTime12: '(5:45 PM)',
        status: 'BOARDING',
        targetTimeIso: addMinutes(1),
        vessel: 'MV Wenatchee',
        platform: 'Dock 1',
        price: '$9.85',
        progress: 95,
      },
      {
        id: 'trip-4',
        origin: 'Staten Island',
        destination: 'Manhattan',
        operator: 'SI Ferry',
        routeTitle: 'Route: St. George → Whitehall',
        departureTime: '18:00',
        departureTime12: '(6:00 PM)',
        status: 'DELAYED',
        delayText: '10 min',
        targetTimeIso: addMinutes(40),
        vessel: 'MV Alice Austen',
        platform: 'Slip 5',
        price: 'Free',
        progress: 5,
      },
      {
        id: 'trip-5',
        origin: 'Jersey City',
        destination: 'Manhattan',
        operator: 'NY Waterway',
        routeTitle: 'Route: Paulus Hook → Pier 11',
        departureTime: '18:15',
        departureTime12: '(6:15 PM)',
        status: 'CANCELLED',
        vessel: 'TBD',
        platform: 'Pier A',
        price: '$7.00',
        progress: 0,
      },
      {
        id: 'trip-6',
        origin: 'Oakland',
        destination: 'San Francisco',
        operator: 'SF Bay Ferry',
        routeTitle: 'Route: Jack London → Ferry Bldg',
        departureTime: '16:00',
        departureTime12: '(4:00 PM)',
        status: 'IN_TRANSIT',
        vessel: 'MV Hydrus',
        platform: 'Gate 2',
        price: '$4.60',
        progress: 50,
      },
      {
        id: 'trip-7',
        origin: 'Bremerton',
        destination: 'Seattle',
        operator: 'WSDOT Ferry',
        routeTitle: 'Route: Bremerton → Colman Dock',
        departureTime: '15:30',
        departureTime12: '(3:30 PM)',
        status: 'ARRIVING',
        vessel: 'MV Walla Walla',
        platform: 'Slip 1',
        price: '$9.85',
        progress: 90,
      },
      {
        id: 'trip-8',
        origin: 'Hoboken',
        destination: 'Manhattan',
        operator: 'NY Waterway',
        routeTitle: 'Route: Hoboken 14th → W 39th',
        departureTime: '15:00',
        departureTime12: '(3:00 PM)',
        status: 'COMPLETED',
        vessel: 'MV Yogi Berra',
        platform: 'Slip 2',
        price: '$8.00',
        progress: 100,
      },
    ];

    return { serverTimeIso, schedules };
  }
}
