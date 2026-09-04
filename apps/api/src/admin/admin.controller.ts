import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  @Get('stats')
  getAdminStats() {
    return {
      activeVessels: 24,
      dailyPassengers: 12400,
      systemUptime: '99.9%',
      activeIncidents: 1,
    };
  }
}
