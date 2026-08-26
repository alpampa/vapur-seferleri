import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { TRACKING_PROVIDER, TrackingProvider } from './tracking.provider';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws/tracking'
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private broadcastInterval: NodeJS.Timeout;

  constructor(
    @Inject(TRACKING_PROVIDER) private readonly trackingProvider: TrackingProvider,
  ) {
    this.startBroadcasting();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Optionally send immediate positions on connect
    this.trackingProvider.getPositions().then(positions => {
      client.emit('vessel.positions', positions);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private startBroadcasting() {
    // Broadcast positions every 3 seconds
    this.broadcastInterval = setInterval(async () => {
      try {
        const positions = await this.trackingProvider.getPositions();
        this.server.emit('vessel.positions', positions);
      } catch (err) {
        this.logger.error('Failed to broadcast positions', err);
      }
    }, 3000);
  }
}
