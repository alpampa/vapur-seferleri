import { TopBar } from "@/components/navigation/TopBar";
import { MainAppShell } from "@/components/views/MainAppShell";
import type { SchedulesResponse } from "@/lib/types/schedule";
import { getLiveOrOfficialSchedules } from "@/lib/agents/timetable-engine";
import { getStoredAnnouncementsMeta } from "@/lib/agents/data-snapshot-store";
import { fetchLiveMarineWeather, type MarineWeatherStatus } from "@/lib/services/marine-weather";

// Canlı sefer panosu: sayfa her istekte yeniden render edilir (önbelleğe alınmaz).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * SEFER VERİSİ TEK KAYNAĞI (KULLANICI KURALI: asla uydurma veri).
 *
 * Dış API (`NEXT_PUBLIC_API_URL`) /schedules uç noktası demo veya basitleştirilmiş
 * (tek düz liste) sefer verisi döndürebildiği için buradan KASITLI OLARAK alınmaz.
 * Örnek: API, Bostancı 23:00 kısa (Kınalıada-Burgazada) ve uzun (Heybeliada-Büyükada)
 * hatlarını ayrı kayıtlar olarak temsil edemediği için tarife hatalı görünür.
 *
 * Kaynak olarak YALNIZCA doğrulanmış gömülü motor kullanılır:
 * official-scraped-schedules.json (Şehir Hatları) + mavi-marmara-schedules.ts +
 * dentur-schedules.ts — hepsi resmi kurumsal sitelerden birebir doğrulanmıştır.
 */
async function getSchedules(): Promise<SchedulesResponse> {
  return await getLiveOrOfficialSchedules();
}

export default async function Home() {
  let data: SchedulesResponse | null = null;
  let weather: MarineWeatherStatus | null = null;

  try {
    const results = await Promise.allSettled([
      getSchedules(),
      fetchLiveMarineWeather()
    ]);
    if (results[0].status === "fulfilled") {
      data = results[0].value;
    }
    if (results[1].status === "fulfilled") {
      weather = results[1].value;
    }
  } catch (e) {
    console.error("Home data fetching error:", e);
  }

  if (!data || !data.schedules || data.schedules.length === 0) {
    try {
      data = await getLiveOrOfficialSchedules();
    } catch (fallbackErr) {
      console.error("Critical fallback failed:", fallbackErr);
    }
  }

  const schedules = data?.schedules || [];
  const serverTimeIso = data?.serverTimeIso || new Date().toISOString();

  // GÜVEN KATMANI: resmî kaynakların en son doğrulanma üst verisi (sunucuda okunur,
  // client bundle'a JSON girmemesi için prop olarak geçirilir).
  const announcementsMeta = getStoredAnnouncementsMeta();

  return (
    <div className="flex flex-col min-h-screen theme-app-shell bg-[var(--app-bg,#070e1e)] text-[var(--app-text,#f8fafc)] transition-colors duration-200">
      <TopBar />
      
      <main className="flex-1 overflow-y-auto hide-scrollbar relative">
        <MainAppShell
          schedules={schedules}
          serverTimeIso={serverTimeIso}
          marineWeather={weather}
          sourceFreshness={{
            generatedAt: announcementsMeta.generatedAt,
            sourceCount: announcementsMeta.sourceCount,
            sourceStatus: announcementsMeta.sourceStatus,
          }}
        />
      </main>
    </div>
  );
}
