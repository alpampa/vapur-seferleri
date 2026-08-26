import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from './schedule/schedule.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [ScheduleModule, TrackingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
