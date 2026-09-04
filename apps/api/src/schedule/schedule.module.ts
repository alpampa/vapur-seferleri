import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { MockScheduleProvider } from './mock-schedule.provider';
import { PrismaScheduleProvider } from './prisma-schedule.provider';
import { SCHEDULE_PROVIDER } from './schedule.provider';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ScheduleController],
  providers: [
    {
      provide: SCHEDULE_PROVIDER,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => {
        if (process.env.ENABLE_DEMO_MODE === 'true') {
          return new MockScheduleProvider();
        }
        return new PrismaScheduleProvider(prisma);
      },
    },
  ],
  exports: [SCHEDULE_PROVIDER],
})
export class ScheduleModule {}
