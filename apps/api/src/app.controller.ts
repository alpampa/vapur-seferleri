import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('health')
  async getHealth() {
    let databaseUp = true;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseUp = false;
    }

    return {
      status: databaseUp ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        application: 'up',
        database: databaseUp ? 'up' : 'down',
      },
    };
  }
}
