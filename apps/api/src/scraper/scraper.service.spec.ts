import { ScraperService, scrapedTripSchema } from './scraper.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('ScraperService', () => {
  const prisma = {} as unknown as PrismaService;
  let service: ScraperService;

  beforeEach(() => {
    service = new ScraperService(prisma);
  });

  describe('scrapedTripSchema', () => {
    it('geçerli HH:mm kalkışı kabul eder', () => {
      expect(
        scrapedTripSchema.safeParse({ departureTime: '07:30' }).success,
      ).toBe(true);
    });

    it('geçersiz saat formatını reddeder', () => {
      expect(
        scrapedTripSchema.safeParse({ departureTime: '7:30am' }).success,
      ).toBe(false);
    });
  });

  describe('scrapePrensTurKartal (sabit doğrulanmış tarife)', () => {
    it('yalnızca şemaya uyan saatleri döndürür', async () => {
      const result = await service.scrapePrensTurKartal();
      expect(result.ptKartalToAdalar.length).toBeGreaterThan(0);
      expect(result.ptAdalarToKartal.length).toBeGreaterThan(0);
      for (const trip of result.ptKartalToAdalar) {
        expect(trip.departureTime).toMatch(/^\d{2}:\d{2}$/);
      }
    });
  });
});
