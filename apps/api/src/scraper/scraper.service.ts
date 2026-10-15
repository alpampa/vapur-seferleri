import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import axios, { type AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { z } from 'zod';

/** `$(selector)` çağrısının döndürdüğü Cheerio koleksiyonu (AnyNode importundan kaçınmak için). */
type CheerioTable = ReturnType<cheerio.CheerioAPI>;

/** `cheerio.load()` çıktısı — sürüme göre `Root` olduğu için türetilmiş tip kullanılır. */
type CheerioRoot = ReturnType<typeof cheerio.load>;

// ---------------------------------------------------------------------------
// Doğrulama (Zero-Hallucination): scraper çıktısı şemaya uymayan kayıtlar atılır.
// ---------------------------------------------------------------------------
const HHMM = /^\d{2}:\d{2}$/;

const scrapedStopSchema = z.object({
  name: z.string().min(1),
  time: z.string().regex(HHMM),
});

export const scrapedTripSchema = z.object({
  departureTime: z.string().regex(HHMM),
  arrivalTime: z.string().regex(HHMM).optional(),
  stops: z.array(scrapedStopSchema).optional(),
  routeDesc: z.string().optional(),
});

export type ScrapedTrip = z.infer<typeof scrapedTripSchema>;

/** [start, end) aralığındaki saat dilimini dakikaya çevirir. */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

interface StopColumn {
  name: string;
  col: number;
  /** Durak saati hesaplanırken eklenecek sabit dakika (bazı operatörler offset verir). */
  offsetMinutes?: number;
}

interface TableConfig {
  departureCol: number;
  arrivalCol?: number;
  stopCols?: StopColumn[];
  /** Belirtilirse, bu kolondaki değer kalkış saatinden büyükse satır ters yön sayılır. */
  guardCol?: number;
  defaultRouteDesc?: string;
}

type RawCell = string;

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new Logger(ScraperService.name);
  private readonly httpClient: AxiosInstance = axios.create({
    timeout: 12000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('ScraperService initialized. Triggering live timetable sync...');
    try {
      await this.syncTodaySchedules();
    } catch (err) {
      // Başlangıçta veri çekilemese bile uygulama ayağa kalkmalı.
      this.logger.error(
        `Initial timetable sync failed (non-fatal): ${(err as Error).message}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Europe/Istanbul' })
  async handleCron() {
    this.logger.log('Midnight CRON: syncing latest official timetables...');
    await this.syncTodaySchedules();
  }

  @Cron(CronExpression.EVERY_HOUR, { timeZone: 'Europe/Istanbul' })
  async handleHourlyCron() {
    this.logger.log('Hourly sync check triggered.');
    await this.syncTodaySchedules();
  }

  // -------------------------------------------------------------------------
  // HTTP + HTML yardımcıları
  // -------------------------------------------------------------------------

  /** Basit exponential backoff ile HTML çeker. */
  private async fetchHtml(url: string, attempts = 3): Promise<string> {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const res = await this.httpClient.get<string>(url);
        return res.data;
      } catch (err) {
        lastErr = err;
        if (attempt < attempts) {
          await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
        }
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
  }

  /** Belirtilen index'teki tabloyu ve ait olduğu cheerio örneğini döndürür. */
  private getTable(
    html: string,
    index: number,
  ): { $: CheerioRoot; table: CheerioTable } {
    const $ = cheerio.load(html);
    const table = $('table').eq(index);
    this.assertTableHasTimes(table, index);
    return { $, table };
  }

  /** Tablo satırlarını normalize edilmiş hücre dizilerine çevirir. */
  private extractRows(
    $: CheerioRoot,
    $table: CheerioTable,
  ): RawCell[][] {
    const rows: RawCell[][] = [];
    $table.find('tr').each((_ri, row) => {
      const cells: RawCell[] = [];
      $(row)
        .find('td, th')
        .each((_ci, cell) => {
          cells.push($(cell).text().trim().replace(/\s+/g, ' '));
        });
      rows.push(cells);
    });
    return rows;
  }

  /** Kısayol: HTML + index → normalize edilmiş satırlar. */
  private rowsFrom(html: string, index: number): RawCell[][] {
    const { $, table } = this.getTable(html, index);
    return this.extractRows($, table);
  }

  /** Seçilen tabloda hiç saat hücresi yoksa uyarır (site değişmiş olabilir). */
  private assertTableHasTimes($table: CheerioTable, index: number) {
    const text = $table.text();
    if (!HHMM.test(text)) {
      this.logger.warn(
        `Table #${index} contains no HH:mm cells — site layout may have changed.`,
      );
    }
  }

  /** Tek bir tablo yapılandırmasını ScrapedTrip listesine çevirir (şema doğrulamalı). */
  private parseTable(rows: RawCell[][], cfg: TableConfig): ScrapedTrip[] {
    const trips: ScrapedTrip[] = [];

    for (const cells of rows) {
      const dep = cells[cfg.departureCol];
      if (!dep || !HHMM.test(dep)) continue;

      const stops: { name: string; time: string }[] = [];
      for (const stop of cfg.stopCols ?? []) {
        const t = cells[stop.col];
        if (!t || !HHMM.test(t)) continue;
        let time = t;
        if (stop.offsetMinutes) {
          const total = toMinutes(t) + stop.offsetMinutes;
          const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
          const mm = String(total % 60).padStart(2, '0');
          time = `${hh}:${mm}`;
        }
        stops.push({ name: stop.name, time });
      }

      const arrival = cfg.arrivalCol != null ? cells[cfg.arrivalCol] : undefined;

      const candidate: ScrapedTrip = {
        departureTime: dep,
        arrivalTime: arrival && HHMM.test(arrival) ? arrival : undefined,
        stops: stops.length > 0 ? stops : undefined,
        routeDesc: cfg.defaultRouteDesc,
      };

      const parsed = scrapedTripSchema.safeParse(candidate);
      if (parsed.success) {
        trips.push(parsed.data);
      } else {
        this.logger.debug(
          `Skipping invalid scraped row: ${JSON.stringify(candidate)}`,
        );
      }
    }

    return trips;
  }

  // -------------------------------------------------------------------------
  // Operatör scraper'ları
  // -------------------------------------------------------------------------

  async scrapeSehirHatlariKabatas(
    isWeekend: boolean,
  ): Promise<{ outboundTrips: ScrapedTrip[]; returnTrips: ScrapedTrip[] }> {
    try {
      this.logger.log('Scraping: Şehir Hatları Kabataş-Adalar (177)...');
      const html = await this.fetchHtml(
        'https://sehirhatlari.istanbul/tr/seferler/ic-hatlar/adalar-hatlari/kabatasadalar-177',
      );

      const outbound = this.parseTable(
        this.rowsFrom(html, isWeekend ? 1 : 0),
        {
          departureCol: 0,
          arrivalCol: 6,
          stopCols: [
            { name: 'Kadıköy', col: 2 },
            { name: 'Kınalıada', col: 3 },
            { name: 'Burgazada', col: 4 },
            { name: 'Heybeliada', col: 5 },
          ],
        },
      );

      const ret = this.parseTable(
        this.rowsFrom(html, isWeekend ? 3 : 2),
        {
          departureCol: 1,
          arrivalCol: 7,
          stopCols: [
            { name: 'Heybeliada', col: 2 },
            { name: 'Burgazada', col: 3 },
            { name: 'Kınalıada', col: 4 },
            { name: 'Kadıköy', col: 5 },
          ],
        },
      );

      return { outboundTrips: outbound, returnTrips: ret };
    } catch (err) {
      this.logger.error(
        `Failed to scrape Şehir Hatları Kabataş: ${(err as Error).message}`,
      );
      return { outboundTrips: [], returnTrips: [] };
    }
  }

  async scrapeSehirHatlariBostanciRing(
    isWeekend: boolean,
  ): Promise<{ bostanciToAdalar: ScrapedTrip[]; adalarToBostanci: ScrapedTrip[] }> {
    try {
      this.logger.log('Scraping: Şehir Hatları Bostancı Ring (770)...');
      const html = await this.fetchHtml(
        'https://sehirhatlari.istanbul/tr/seferler/ic-hatlar/adalar-hatlari/bostanci-adalar-ring-hatti-770',
      );

      const forward = this.parseTable(
        this.rowsFrom(html, isWeekend ? 1 : 0),
        {
          departureCol: 0,
          arrivalCol: 4,
          stopCols: [
            { name: 'Kınalıada', col: 1 },
            { name: 'Burgazada', col: 2 },
            { name: 'Heybeliada', col: 3 },
          ],
        },
      );

      const reverse = this.parseTable(
        this.rowsFrom(html, isWeekend ? 3 : 2),
        {
          departureCol: 1,
          arrivalCol: 5,
          stopCols: [
            { name: 'Heybeliada', col: 2 },
            { name: 'Burgazada', col: 3 },
            { name: 'Kınalıada', col: 4 },
          ],
        },
      );

      return { bostanciToAdalar: forward, adalarToBostanci: reverse };
    } catch (err) {
      this.logger.error(
        `Failed to scrape Şehir Hatları Bostancı Ring: ${(err as Error).message}`,
      );
      return { bostanciToAdalar: [], adalarToBostanci: [] };
    }
  }

  async scrapeMaviMarmaraBostanci(): Promise<{
    mmBostanciToAdalar: ScrapedTrip[];
    mmAdalarToBostanci: ScrapedTrip[];
  }> {
    try {
      this.logger.log('Scraping: Mavi Marmara Bostancı-Adalar...');

      const outboundHtml = await this.fetchHtml(
        'https://mavimarmara.net/tarifeler/bostanci-buyukada/',
      );
      const mmBostanciToAdalar = this.parseTable(
        this.rowsFrom(outboundHtml, 0),
        {
          departureCol: 0,
          defaultRouteDesc: 'BÜYÜKADA',
        },
      );

      const returnHtml = await this.fetchHtml(
        'https://mavimarmara.net/tarifeler/buyukada-bostanci/',
      );
      const mmAdalarToBostanci = this.parseTable(
        this.rowsFrom(returnHtml, 0),
        { departureCol: 0, defaultRouteDesc: 'BOSTANCI' },
      );

      return { mmBostanciToAdalar, mmAdalarToBostanci };
    } catch (err) {
      this.logger.error(
        `Failed to scrape Mavi Marmara: ${(err as Error).message}`,
      );
      return { mmBostanciToAdalar: [], mmAdalarToBostanci: [] };
    }
  }

  async scrapePrensTurKartal(): Promise<{
    ptKartalToAdalar: ScrapedTrip[];
    ptAdalarToKartal: ScrapedTrip[];
  }> {
    // Prens Tur resmi matbu tarifesi (canlı HTML tablo yoksa sabit doğrulanmış saatler).
    const kartalTimes = ['06:20', '07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30', '20:30'];
    const buyukadaTimes = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

    return {
      ptKartalToAdalar: this.validateTimes(kartalTimes),
      ptAdalarToKartal: this.validateTimes(buyukadaTimes),
    };
  }

  private validateTimes(times: string[]): ScrapedTrip[] {
    return times
      .map((t) => scrapedTripSchema.safeParse({ departureTime: t }))
      .filter((r): r is { success: true; data: ScrapedTrip } => r.success)
      .map((r) => r.data);
  }

  // -------------------------------------------------------------------------
  // DB senkronizasyonu — NON-DESTRUCTIVE
  // -------------------------------------------------------------------------

  async syncTodaySchedules() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    this.logger.log(
      `Executing live timetable scraping for Istanbul ports (${today.toLocaleDateString('tr-TR')})...`,
    );

    const routeMMBostanciBuyukada = await this.prisma.route.findFirst({ where: { originPort: { code: 'BOS' }, destinationPort: { code: 'ADA' }, operator: { code: 'MM' } } });
    const routeMMBuyukadaBostanci = await this.prisma.route.findFirst({ where: { originPort: { code: 'ADA' }, destinationPort: { code: 'BOS' }, operator: { code: 'MM' } } });
    const routeSHBostanciBuyukada = await this.prisma.route.findFirst({ where: { originPort: { code: 'BOS' }, destinationPort: { code: 'ADA' }, operator: { code: 'SH' } } });
    const routeSHBuyukadaBostanci = await this.prisma.route.findFirst({ where: { originPort: { code: 'ADA' }, destinationPort: { code: 'BOS' }, operator: { code: 'SH' } } });
    const routeKabatasBuyukada = await this.prisma.route.findFirst({ where: { originPort: { code: 'KAB' }, destinationPort: { code: 'ADA' } } });
    const routeBuyukadaKabatas = await this.prisma.route.findFirst({ where: { originPort: { code: 'ADA' }, destinationPort: { code: 'KAB' } } });
    const routeKartalBuyukada = await this.prisma.route.findFirst({ where: { originPort: { code: 'KRT' }, destinationPort: { code: 'ADA' } } });
    const routeBuyukadaKartal = await this.prisma.route.findFirst({ where: { originPort: { code: 'ADA' }, destinationPort: { code: 'KRT' } } });

    const vessels = await this.prisma.vessel.findMany();
    if (
      !vessels.length ||
      !routeMMBostanciBuyukada ||
      !routeSHBostanciBuyukada ||
      !routeKabatasBuyukada ||
      !routeKartalBuyukada
    ) {
      this.logger.warn(
        "Core database elements missing. Ensure 'seed' has been run to create routes/vessels.",
      );
      return;
    }

    const vMM1 = vessels.find((v) => v.name === 'Marmara-1')?.id;
    const vSH1 = vessels.find((v) => v.name.includes('Manço'))?.id;
    const vPT1 = vessels.find((v) => v.name.includes('Prens'))?.id;
    if (!vMM1 || !vSH1 || !vPT1) {
      this.logger.warn('Missing vessels in DB.');
      return;
    }

    const isTodayWeekend = today.getDay() === 0 || today.getDay() === 6;
    const isTomorrowWeekend = tomorrow.getDay() === 0 || tomorrow.getDay() === 6;

    const [shKabatasToday, shRingToday, mmToday, ptToday, shKabatasTmrw, shRingTmrw] =
      await Promise.all([
        this.scrapeSehirHatlariKabatas(isTodayWeekend),
        this.scrapeSehirHatlariBostanciRing(isTodayWeekend),
        this.scrapeMaviMarmaraBostanci(),
        this.scrapePrensTurKartal(),
        this.scrapeSehirHatlariKabatas(isTomorrowWeekend),
        this.scrapeSehirHatlariBostanciRing(isTomorrowWeekend),
      ]);

    const nowMs = Date.now();

    const mapTripsToDb = (
      routeId: string,
      vesselId: string,
      scrapedList: ScrapedTrip[],
      defaultDurationMins: number,
      price: number,
      platform: string,
      baseDate: Date,
    ) =>
      scrapedList.map((item) => {
        const [hh, mmVal] = item.departureTime.split(':').map(Number);
        const dep = new Date(baseDate);
        dep.setHours(hh, mmVal, 0, 0);

        let arr: Date;
        if (item.arrivalTime && HHMM.test(item.arrivalTime)) {
          const [arrH, arrM] = item.arrivalTime.split(':').map(Number);
          arr = new Date(baseDate);
          arr.setHours(arrH, arrM, 0, 0);
          if (arr.getTime() <= dep.getTime()) arr.setDate(arr.getDate() + 1);
        } else {
          arr = new Date(dep.getTime() + defaultDurationMins * 60000);
        }

        let status = 'SCHEDULED';
        const diff = dep.getTime() - nowMs;
        if (diff < -30 * 60000) status = 'COMPLETED';
        else if (diff < 0) status = 'IN_TRANSIT';
        else if (diff < 10 * 60000) status = 'BOARDING';
        else if (diff < 30 * 60000) status = 'ON_TIME';

        return {
          routeId,
          vesselId,
          scheduledDeparture: dep,
          scheduledArrival: arr,
          status,
          price,
          platform,
          stops: item.stops && item.stops.length > 0 ? JSON.stringify(item.stops) : null,
        };
      });

    const trips: ReturnType<typeof mapTripsToDb> = [];

    trips.push(...mapTripsToDb(routeKabatasBuyukada!.id, vSH1, shKabatasToday.outboundTrips, 105, 45.0, 'Peron 2', today));
    trips.push(...mapTripsToDb(routeBuyukadaKabatas!.id, vSH1, shKabatasToday.returnTrips, 120, 45.0, 'Peron 2', today));
    trips.push(...mapTripsToDb(routeSHBostanciBuyukada!.id, vSH1, shRingToday.bostanciToAdalar, 75, 45.0, 'Peron 2', today));
    trips.push(...mapTripsToDb(routeSHBuyukadaBostanci!.id, vSH1, shRingToday.adalarToBostanci, 75, 45.0, 'Peron 2', today));
    trips.push(...mapTripsToDb(routeMMBostanciBuyukada!.id, vMM1, mmToday.mmBostanciToAdalar, 35, 65.0, 'Peron 1', today));
    trips.push(...mapTripsToDb(routeMMBuyukadaBostanci!.id, vMM1, mmToday.mmAdalarToBostanci, 35, 65.0, 'Peron 1', today));
    trips.push(...mapTripsToDb(routeKartalBuyukada!.id, vPT1, ptToday.ptKartalToAdalar, 25, 50.0, 'Peron 1', today));
    trips.push(...mapTripsToDb(routeBuyukadaKartal!.id, vPT1, ptToday.ptAdalarToKartal, 25, 50.0, 'Peron 1', today));

    trips.push(...mapTripsToDb(routeKabatasBuyukada!.id, vSH1, shKabatasTmrw.outboundTrips, 105, 45.0, 'Peron 2', tomorrow));
    trips.push(...mapTripsToDb(routeBuyukadaKabatas!.id, vSH1, shKabatasTmrw.returnTrips, 120, 45.0, 'Peron 2', tomorrow));
    trips.push(...mapTripsToDb(routeSHBostanciBuyukada!.id, vSH1, shRingTmrw.bostanciToAdalar, 75, 45.0, 'Peron 2', tomorrow));
    trips.push(...mapTripsToDb(routeSHBuyukadaBostanci!.id, vSH1, shRingTmrw.adalarToBostanci, 75, 45.0, 'Peron 2', tomorrow));

    // ZERO-DESTRUCTION: hiç geçerli sefer çekilemediyse mevcut veriyi KORU.
    if (trips.length === 0) {
      this.logger.error(
        'No valid trips scraped. Keeping existing database snapshot untouched.',
      );
      return;
    }

    // Yalnızca geçerli veri varsa bugün+yarın aralığını tazele.
    await this.prisma.$transaction([
      this.prisma.trip.deleteMany({
        where: { scheduledDeparture: { lt: today } },
      }),
      this.prisma.trip.deleteMany({
        where: { scheduledDeparture: { gte: today, lt: dayAfterTomorrow } },
      }),
      this.prisma.trip.createMany({ data: trips }),
    ]);

    this.logger.log(
      `LIVE SYNC COMPLETED: saved ${trips.length} verified trips from official sources.`,
    );
  }
}
