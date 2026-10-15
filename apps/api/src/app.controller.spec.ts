import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }]),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should report ok status when database is reachable', async () => {
      const result = await appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result.services).toEqual({
        application: 'up',
        database: 'up',
      });
    });

    it('should report degraded status when database fails', async () => {
      const prisma = app.get<PrismaService>(PrismaService);
      jest
        .spyOn(prisma, '$queryRaw')
        .mockRejectedValueOnce(new Error('db down'));

      const result = await appController.getHealth();
      expect(result).toHaveProperty('status', 'degraded');
      expect(result.services.database).toBe('down');
    });
  });
});
