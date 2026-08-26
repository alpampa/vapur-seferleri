import { Controller, Get, Inject } from '@nestjs/common';
import { SCHEDULE_PROVIDER, ScheduleProvider } from './schedule.provider';

@Controller('schedules')
export class ScheduleController {
  constructor(
    @Inject(SCHEDULE_PROVIDER) private readonly scheduleProvider: ScheduleProvider,
  ) {}

  @Get()
  async getSchedules() {
    return this.scheduleProvider.getSchedules();
  }
}
