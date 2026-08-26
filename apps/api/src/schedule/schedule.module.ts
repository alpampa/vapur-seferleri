import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { MockScheduleProvider } from './mock-schedule.provider';
import { SCHEDULE_PROVIDER } from './schedule.provider';

@Module({
  controllers: [ScheduleController],
  providers: [
    {
      provide: SCHEDULE_PROVIDER,
      useClass: MockScheduleProvider,
    },
  ],
  exports: [SCHEDULE_PROVIDER],
})
export class ScheduleModule {}
