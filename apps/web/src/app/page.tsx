import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SearchBar } from "@/components/ui/SearchBar";
import { TripStatus } from "@/components/schedule/ScheduleCard";
import { NearbyRoutes } from "@/components/schedule/NearbyRoutes";
import { ScheduleListClient } from "@/components/schedule/ScheduleListClient";

export interface ScheduleCardDto {
  id: string;
  origin: string;
  destination: string;
  operator: string;
  routeTitle: string;
  departureTime: string;
  departureTime12: string;
  status: TripStatus;
  targetTimeIso?: string;
  delayText?: string;
  vessel: string;
  platform: string;
  price: string;
  progress: number;
  stops?: { name: string; time: string }[];
}

export interface SchedulesResponse {
  serverTimeIso: string;
  serverDateFormatted?: string;
  schedules: ScheduleCardDto[];
}

import axios from 'axios';
import * as cheerio from 'cheerio';

async function getSchedules(): Promise<SchedulesResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/schedules`, { cache: 'no-store' });
      if (res.ok) return res.json();
    } catch (e) {
      console.warn("API URL failed, falling back to serverless live scraper:", e);
    }
  }

  // 100% Standalone Serverless Live Scraper (Runs on Vercel Edge/Node without external backend required)
  try {
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const nowMs = Date.now();

    const httpClient = axios.create({
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    // 1. Şehir Hatları Kabataş
    const resKab = await httpClient.get('https://sehirhatlari.istanbul/tr/seferler/ic-hatlar/adalar-hatlari/kabatasadalar-177').catch(() => null);
    // 2. Şehir Hatları Bostancı
    const resBos = await httpClient.get('https://sehirhatlari.istanbul/tr/seferler/ic-hatlar/adalar-hatlari/bostanci-adalar-ring-hatti-770').catch(() => null);
    // 3. Mavi Marmara
    const resMMOut = await httpClient.get('https://mavimarmara.net/tarifeler/bostanci-buyukada/').catch(() => null);
    const resMMRet = await httpClient.get('https://mavimarmara.net/tarifeler/buyukada-bostanci/').catch(() => null);

    let schedulesList: ScheduleCardDto[] = [];

    const createDto = (
      id: string,
      origin: string,
      destination: string,
      operator: string,
      vessel: string,
      departureTime: string,
      price: string,
      platform: string,
      stops?: { name: string; time: string }[]
    ): ScheduleCardDto => {
      const [hh, mm] = departureTime.split(':').map(Number);
      const depDate = new Date(now);
      depDate.setHours(hh, mm, 0, 0);

      let status: TripStatus = "ON_TIME";
      const diff = depDate.getTime() - nowMs;
      if (diff < -30 * 60000) status = "COMPLETED";
      else if (diff < 0) status = "IN_TRANSIT";
      else if (diff < 10 * 60000) status = "BOARDING";
      else if (diff < 30 * 60000) status = "ON_TIME";

      const dep12 = depDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      return {
        id,
        origin,
        destination,
        operator,
        routeTitle: `${origin} - ${destination} Hattı`,
        departureTime,
        departureTime12: dep12,
        status,
        targetTimeIso: depDate.toISOString(),
        vessel,
        platform,
        price,
        progress: 0,
        stops
      };
    };

    // Parse Kabataş
    if (resKab && resKab.data) {
      const $ = cheerio.load(resKab.data);
      const outIdx = isWeekend ? 1 : 0;
      const retIdx = isWeekend ? 3 : 2;

      $('table').eq(outIdx).find('tr').each((ri, row) => {
        const cells: string[] = [];
        $(row).find('td, th').each((ci, cell) => cells.push($(cell).text().trim().replace(/\s+/g, ' ')));
        const kabTime = cells[0];
        if (kabTime && /^\d{2}:\d{2}$/.test(kabTime)) {
          const stops: { name: string; time: string }[] = [];
          if (cells[2] && /^\d{2}:\d{2}$/.test(cells[2])) stops.push({ name: 'Kadıköy', time: cells[2] });
          if (cells[3] && /^\d{2}:\d{2}$/.test(cells[3])) stops.push({ name: 'Kınalıada', time: cells[3] });
          if (cells[4] && /^\d{2}:\d{2}$/.test(cells[4])) stops.push({ name: 'Burgazada', time: cells[4] });
          if (cells[5] && /^\d{2}:\d{2}$/.test(cells[5])) stops.push({ name: 'Heybeliada', time: cells[5] });
          schedulesList.push(createDto(`sh-kab-out-${ri}`, 'Kabataş', 'Büyükada', 'Şehir Hatları', 'ŞH-Barış Manço', kabTime, '₺45.00', 'Peron 2', stops));
        }
      });

      $('table').eq(retIdx).find('tr').each((ri, row) => {
        const cells: string[] = [];
        $(row).find('td, th').each((ci, cell) => cells.push($(cell).text().trim().replace(/\s+/g, ' ')));
        const buyukadaTime = cells[1];
        if (buyukadaTime && /^\d{2}:\d{2}$/.test(buyukadaTime)) {
          const stops: { name: string; time: string }[] = [];
          if (cells[2] && /^\d{2}:\d{2}$/.test(cells[2])) stops.push({ name: 'Heybeliada', time: cells[2] });
          if (cells[3] && /^\d{2}:\d{2}$/.test(cells[3])) stops.push({ name: 'Burgazada', time: cells[3] });
          if (cells[4] && /^\d{2}:\d{2}$/.test(cells[4])) stops.push({ name: 'Kınalıada', time: cells[4] });
          if (cells[5] && /^\d{2}:\d{2}$/.test(cells[5])) stops.push({ name: 'Kadıköy', time: cells[5] });
          schedulesList.push(createDto(`sh-kab-ret-${ri}`, 'Büyükada', 'Kabataş', 'Şehir Hatları', 'ŞH-Barış Manço', buyukadaTime, '₺45.00', 'Peron 2', stops));
        }
      });
    }

    // Parse Bostancı Ring
    if (resBos && resBos.data) {
      const $ = cheerio.load(resBos.data);
      const ringFwd = isWeekend ? 1 : 0;
      const ringRev = isWeekend ? 3 : 2;

      $('table').eq(ringFwd).find('tr').each((ri, row) => {
        const cells: string[] = [];
        $(row).find('td, th').each((ci, cell) => cells.push($(cell).text().trim().replace(/\s+/g, ' ')));
        const bosTime = cells[0];
        if (bosTime && /^\d{2}:\d{2}$/.test(bosTime)) {
          const stops: { name: string; time: string }[] = [];
          if (cells[1] && /^\d{2}:\d{2}$/.test(cells[1])) stops.push({ name: 'Kınalıada', time: cells[1] });
          if (cells[2] && /^\d{2}:\d{2}$/.test(cells[2])) stops.push({ name: 'Burgazada', time: cells[2] });
          if (cells[3] && /^\d{2}:\d{2}$/.test(cells[3])) stops.push({ name: 'Heybeliada', time: cells[3] });
          schedulesList.push(createDto(`sh-bos-out-${ri}`, 'Bostancı', 'Büyükada', 'Şehir Hatları', 'ŞH-Moda', bosTime, '₺45.00', 'Peron 2', stops));
        }
      });

      $('table').eq(ringRev).find('tr').each((ri, row) => {
        const cells: string[] = [];
        $(row).find('td, th').each((ci, cell) => cells.push($(cell).text().trim().replace(/\s+/g, ' ')));
        const buyukadaTime = cells[1];
        if (buyukadaTime && /^\d{2}:\d{2}$/.test(buyukadaTime)) {
          const stops: { name: string; time: string }[] = [];
          if (cells[2] && /^\d{2}:\d{2}$/.test(cells[2])) stops.push({ name: 'Heybeliada', time: cells[2] });
          if (cells[3] && /^\d{2}:\d{2}$/.test(cells[3])) stops.push({ name: 'Burgazada', time: cells[3] });
          if (cells[4] && /^\d{2}:\d{2}$/.test(cells[4])) stops.push({ name: 'Kınalıada', time: cells[4] });
          schedulesList.push(createDto(`sh-bos-ret-${ri}`, 'Büyükada', 'Bostancı', 'Şehir Hatları', 'ŞH-Moda', buyukadaTime, '₺45.00', 'Peron 2', stops));
        }
      });
    }

    // Parse Mavi Marmara
    if (resMMOut && resMMOut.data) {
      const $ = cheerio.load(resMMOut.data);
      $('table').first().find('tr').each((ri, row) => {
        const cells: string[] = [];
        $(row).find('td, th').each((ci, cell) => cells.push($(cell).text().trim().replace(/\s+/g, ' ')));
        const t = cells[0];
        const routeDesc = cells[1];
        if (t && /^\d{2}:\d{2}$/.test(t)) {
          const stops: { name: string; time: string }[] = [];
          if (routeDesc && routeDesc.includes('HEYBELİADA')) {
            const [hh, mmVal] = t.split(':').map(Number);
            const stopDate = new Date(now);
            stopDate.setHours(hh, mmVal + 30, 0, 0);
            stops.push({ name: 'Heybeliada', time: stopDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) });
          }
          schedulesList.push(createDto(`mm-bos-out-${ri}`, 'Bostancı', 'Büyükada', 'Mavi Marmara', 'Marmara-1', t, '₺65.00', 'Peron 1', stops));
        }
      });
    }

    if (resMMRet && resMMRet.data) {
      const $ = cheerio.load(resMMRet.data);
      $('table').first().find('tr').each((ri, row) => {
        const cells: string[] = [];
        $(row).find('td, th').each((ci, cell) => cells.push($(cell).text().trim().replace(/\s+/g, ' ')));
        const t = cells[0];
        if (t && /^\d{2}:\d{2}$/.test(t)) {
          schedulesList.push(createDto(`mm-bos-ret-${ri}`, 'Büyükada', 'Bostancı', 'Mavi Marmara', 'Marmara-1', t, '₺65.00', 'Peron 1'));
        }
      });
    }

    // Prens Tur Kartal
    const ptKartal = ["06:20", "07:30", "08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30", "19:30", "20:30"];
    const ptBuyukada = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
    ptKartal.forEach((t, i) => schedulesList.push(createDto(`pt-krt-out-${i}`, 'Kartal', 'Büyükada', 'Prens Tur', 'Prens-5', t, '₺50.00', 'Peron 1')));
    ptBuyukada.forEach((t, i) => schedulesList.push(createDto(`pt-krt-ret-${i}`, 'Büyükada', 'Kartal', 'Prens Tur', 'Prens-5', t, '₺50.00', 'Peron 1')));

    schedulesList.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

    return {
      serverTimeIso: now.toISOString(),
      schedules: schedulesList
    };
  } catch (error) {
    console.error("Serverless Scraper Error:", error);
    return null;
  }
}

export default async function Home() {
  const data = await getSchedules();
  const schedules = data?.schedules || [];
  const serverTimeIso = data?.serverTimeIso || new Date().toISOString();

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      
      <main className="flex-1 overflow-y-auto hide-scrollbar relative pb-[80px]">
        {/* Title Section */}
        <div className="px-4 mt-3 mb-1">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Canlı Sefer Tarifeleri & Güzergahlar
          </h2>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            {data?.serverDateFormatted || new Intl.DateTimeFormat('tr-TR', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Europe/Istanbul' }).format(new Date(serverTimeIso))} • Tüm firmaların güncel resmi tarifeleri
          </p>
        </div>

        {/* Schedule Cards List via Client Component with Route Selectors */}
        <ScheduleListClient schedules={schedules} serverTimeIso={serverTimeIso} />
      </main>

      <BottomNav />
    </div>
  );
}
