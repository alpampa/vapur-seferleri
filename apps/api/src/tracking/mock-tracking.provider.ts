import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { TrackingProvider, VesselPosition } from './tracking.provider';

@Injectable()
export class MockTrackingProvider implements TrackingProvider, OnModuleDestroy {
  private readonly logger = new Logger(MockTrackingProvider.name);
  private intervalRef: NodeJS.Timeout;

  // Base positions roughly around NY and SF
  private mockPositions: Record<string, VesselPosition> = {
    'empire-state-mock': {
      vesselId: 'empire-state-mock', // Will map to DB id later or mock
      latitude: 40.703,
      longitude: -74.009,
      heading: 45,
      speed: 12,
      timestamp: new Date().toISOString(),
    },
    'ms-sf-mock': {
      vesselId: 'ms-sf-mock',
      latitude: 37.795,
      longitude: -122.393,
      heading: 320,
      speed: 15,
      timestamp: new Date().toISOString(),
    },
  };

  constructor() {
    // Simulate movement
    this.intervalRef = setInterval(() => this.simulateMovement(), 3000);
  }

  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  private simulateMovement() {
    for (const id in this.mockPositions) {
      const pos = this.mockPositions[id];
      // Randomly tweak lat/lng to simulate moving vessel
      pos.latitude += (Math.random() - 0.5) * 0.001;
      pos.longitude += (Math.random() - 0.5) * 0.001;
      // Change heading smoothly
      pos.heading = (pos.heading + (Math.random() - 0.5) * 10) % 360;
      pos.timestamp = new Date().toISOString();
    }
  }

  getPositions(): Promise<VesselPosition[]> {
    this.logger.debug('Fetching positions from MockProvider');
    return Promise.resolve(Object.values(this.mockPositions));
  }
}
