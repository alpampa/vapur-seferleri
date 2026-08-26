import { Module } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';
import { MockTrackingProvider } from './mock-tracking.provider';
import { TRACKING_PROVIDER } from './tracking.provider';

@Module({
  providers: [
    TrackingGateway,
    {
      provide: TRACKING_PROVIDER,
      useClass: MockTrackingProvider,
    },
  ],
  exports: [TRACKING_PROVIDER],
})
export class TrackingModule {}
