import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingProvider, VesselPosition } from './tracking.provider';

@Injectable()
export class PrismaTrackingProvider implements TrackingProvider, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaTrackingProvider.name);
  private intervalRef: NodeJS.Timeout;
  private vesselStates: Record<string, VesselPosition> = {};

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('Initializing PrismaTrackingProvider (Virtual AIS)');
    // Fetch all vessels from DB
    const vessels = await this.prisma.vessel.findMany();
    
    // Initialize in-memory simulation states from DB values
    vessels.forEach(v => {
      this.vesselStates[v.id] = {
        vesselId: v.id,
        latitude: v.latitude || 37.795,
        longitude: v.longitude || -122.393,
        heading: v.heading || 0,
        speed: v.speed || 10,
        timestamp: new Date().toISOString(),
      };
    });

    // Simulate movement
    this.intervalRef = setInterval(() => this.simulateMovement(), 3000);
  }

  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  private simulateMovement() {
    for (const id in this.vesselStates) {
      const pos = this.vesselStates[id];
      // Randomly tweak lat/lng to simulate moving vessel
      pos.latitude += (Math.random() - 0.5) * 0.001;
      pos.longitude += (Math.random() - 0.5) * 0.001;
      // Change heading smoothly
      pos.heading = (pos.heading + (Math.random() - 0.5) * 10) % 360;
      pos.timestamp = new Date().toISOString();
      
      // In a real system, we might periodically save this back to the DB or Redis.
      // For this demo, we'll just keep it in memory for the WebSocket.
    }
  }

  async getPositions(): Promise<VesselPosition[]> {
    return Object.values(this.vesselStates);
  }
}
