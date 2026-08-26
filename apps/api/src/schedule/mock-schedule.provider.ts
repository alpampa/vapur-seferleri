import { Injectable, Logger } from '@nestjs/common';
import { ScheduleProvider, ScheduleCardDto } from './schedule.provider';

@Injectable()
export class MockScheduleProvider implements ScheduleProvider {
  private readonly logger = new Logger(MockScheduleProvider.name);

  async getSchedules(): Promise<ScheduleCardDto[]> {
    this.logger.debug('Fetching schedules from MockProvider');
    
    // In a real app, this would query the DB. We return mock data for DEMO_MODE.
    return [
      {
        id: 'trip-1',
        origin: 'Manhattan',
        destination: 'Brooklyn',
        operator: 'NY Waterway',
        routeTitle: 'Route: Lower Manhattan → Dumbo',
        departureTime: '17:15',
        departureTime12: '(5:15 PM)',
        status: 'DEPARTING_SOON', // Maps to DEPARTING SOON in UI
        countdown: '04:32',
        countdownSubtext: '(Min/Sec)',
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
        countdown: '19:18',
        countdownSubtext: 'Countdown',
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
        status: 'DELAYED',
        delayText: '10 min',
        countdown: '33:05',
        countdownSubtext: 'Countdown',
        vessel: 'MV Wenatchee',
        platform: 'Dock 1',
        price: '$9.85',
        progress: 5,
      }
    ];
  }
}
