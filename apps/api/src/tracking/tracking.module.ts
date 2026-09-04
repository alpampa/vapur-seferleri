import { Module } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';
import { MockTrackingProvider } from './mock-tracking.provider';
import { PrismaTrackingProvider } from './prisma-tracking.provider';
import { TRACKING_PROVIDER } from './tracking.provider';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    TrackingGateway,
    {
      provide: TRACKING_PROVIDER,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => {
        if (process.env.ENABLE_DEMO_MODE === 'true') {
          return new MockTrackingProvider();
        }
        return new PrismaTrackingProvider(prisma);
      },
    },
  ],
  exports: [TRACKING_PROVIDER],
})
export class TrackingModule {}
