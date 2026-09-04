import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleProvider, SchedulesResponse, ScheduleCardDto, TripStatus } from './schedule.provider';

@Injectable()
export class PrismaScheduleProvider implements ScheduleProvider {
  private readonly logger = new Logger(PrismaScheduleProvider.name);

  constructor(private prisma: PrismaService) {}

  async getSchedules(): Promise<SchedulesResponse> {
    this.logger.debug('Fetching schedules from DB');
    
    // Only fetch trips that haven't departed more than 1 minute ago
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    const trips = await this.prisma.trip.findMany({
      where: {
        scheduledDeparture: {
          gte: oneMinuteAgo
        }
      },
      include: {
        route: {
          include: {
            originPort: true,
            destinationPort: true,
            operator: true,
          }
        },
        vessel: true,
      },
      orderBy: { scheduledDeparture: 'asc' },
    });

    const schedules: ScheduleCardDto[] = trips.map(t => {
      // Mock progress calculation for Demo
      let progress = 0;
      if (t.status === 'IN_TRANSIT') progress = 50;
      else if (t.status === 'COMPLETED') progress = 100;

      const targetDate = t.scheduledDeparture;
      
      // Format to Europe/Istanbul time
      const timeFormatter = new Intl.DateTimeFormat('tr-TR', {
        timeZone: 'Europe/Istanbul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const time24 = timeFormatter.format(targetDate);
      
      const time12Formatter = new Intl.DateTimeFormat('tr-TR', {
        timeZone: 'Europe/Istanbul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const time12 = time12Formatter.format(targetDate);

      let parsedStops = [];
      if (t.stops) {
        try {
          parsedStops = JSON.parse(t.stops);
        } catch (e) {
          this.logger.error('Failed to parse stops JSON', e);
        }
      }

      return {
        id: t.id,
        origin: t.route.originPort.name,
        destination: t.route.destinationPort.name,
        operator: t.route.operator.name,
        routeTitle: `${t.route.originPort.name} - ${t.route.destinationPort.name}`,
        departureTime: time24,
        departureTime12: time12,
        status: t.status as TripStatus,
        targetTimeIso: targetDate.toISOString(),
        vessel: t.vessel?.name || 'Unknown Vessel',
        platform: t.platform || 'TBD',
        price: `${t.price.toFixed(2)} ₺`,
        progress,
        stops: parsedStops.length > 0 ? parsedStops : undefined,
      };
    });

    const serverTime = new Date();
    const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    return {
      serverTimeIso: serverTime.toISOString(),
      serverDateFormatted: dateFormatter.format(serverTime),
      schedules,
    };
  }
}
