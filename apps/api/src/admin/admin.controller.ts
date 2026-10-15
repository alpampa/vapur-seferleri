import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async getAdminStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [activeVessels, tripsToday, userCount] = await Promise.all([
      this.prisma.vessel.count({ where: { status: { not: 'OFFLINE' } } }),
      this.prisma.trip.count({
        where: { scheduledDeparture: { gte: startOfDay } },
      }),
      this.prisma.user.count(),
    ]);

    return {
      activeVessels,
      tripsToday,
      registeredUsers: userCount,
      generatedAt: new Date().toISOString(),
    };
  }
}
