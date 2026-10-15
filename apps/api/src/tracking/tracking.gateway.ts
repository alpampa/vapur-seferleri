import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TRACKING_PROVIDER, type TrackingProvider } from './tracking.provider';

@WebSocketGateway({
  cors: {
    origin: (process.env.FRONTEND_URL ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0 && o !== '*'),
    credentials: true,
  },
  namespace: '/ws/tracking',
})
export class TrackingGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private broadcastInterval: NodeJS.Timeout;

  constructor(
    @Inject(TRACKING_PROVIDER)
    private readonly trackingProvider: TrackingProvider,
    private readonly jwt: JwtService,
  ) {
    this.startBroadcasting();
  }

  onModuleDestroy() {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }
  }

  afterInit() {
    this.logger.log('Tracking Gateway initialized');
  }

  private isAuthorized(client: Socket): boolean {
    // Demo modunda harici kimlik doğrulaması zorunlu değildir.
    if (process.env.ENABLE_DEMO_MODE === 'true') {
      return true;
    }

    const authToken: unknown = client.handshake.auth?.token;
    const headerToken = client.handshake.headers?.authorization;
    const token =
      typeof authToken === 'string'
        ? authToken
        : typeof headerToken === 'string' && headerToken.startsWith('Bearer ')
          ? headerToken.slice('Bearer '.length)
          : undefined;

    if (!token) return false;

    try {
      this.jwt.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
      });
      return true;
    } catch {
      return false;
    }
  }

  handleConnection(client: Socket) {
    if (!this.isAuthorized(client)) {
      this.logger.warn(`Unauthorized WebSocket connection rejected: ${client.id}`);
      client.emit('auth.error', { message: 'Unauthorized' });
      client.disconnect(true);
      return;
    }

    this.logger.log(`Client connected: ${client.id}`);
    this.trackingProvider.getPositions().then((positions) => {
      client.emit('vessel.positions', positions);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private startBroadcasting() {
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
