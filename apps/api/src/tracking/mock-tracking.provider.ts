import { Injectable, Logger } from '@nestjs/common';
import { TrackingProvider, VesselPosition } from './tracking.provider';

@Injectable()
export class MockTrackingProvider implements TrackingProvider {
  private readonly logger = new Logger(MockTrackingProvider.name);
  
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
    }
  };

  constructor() {
    // Simulate movement
    setInterval(() => this.simulateMovement(), 3000);
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

  async getPositions(): Promise<VesselPosition[]> {
    this.logger.debug('Fetching positions from MockProvider');
    return Object.values(this.mockPositions);
  }
}
