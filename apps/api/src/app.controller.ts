import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    // In production, this would use @nestjs/terminus to check DB/Redis
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        application: 'up',
        database: process.env.ENABLE_DEMO_MODE === 'true' ? 'mocked' : 'up',
        redis: process.env.ENABLE_DEMO_MODE === 'true' ? 'mocked' : 'up',
      },
    };
  }
}
