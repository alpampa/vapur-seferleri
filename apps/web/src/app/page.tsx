import { TopBar } from "@/components/navigation/TopBar";
import { MainAppShell } from "@/components/views/MainAppShell";
import type { SchedulesResponse } from "@/lib/types/schedule";
import { getLiveOrOfficialSchedules } from "@/lib/agents/timetable-engine";
import { getStoredAnnouncementsMeta } from "@/lib/agents/data-snapshot-store";
import { fetchLiveMarineWeather, type MarineWeatherStatus } from "@/lib/services/marine-weather";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  const announcementsMeta = getStoredAnnouncementsMeta();

  return (
    <div className="min-h-screen w-full bg-[#040914] text-slate-100 flex justify-center">
      <div className="flex flex-col min-h-screen w-full max-w-2xl theme-app-shell bg-[#070e1e] text-[#f8fafc] border-x border-slate-800/80 shadow-2xl relative">
        <TopBar />

        <main className="flex-1 relative pb-24">
          <MainAppShell
            schedules={schedules}
            serverTimeIso={serverTimeIso}
            marineWeather={weather}
            sourceFreshness={{
              generatedAt: announcementsMeta.generatedAt,
              sourceCount: announcementsMeta.sourceCount,
            }}
          />
        </main>
      </div>
    </div>
  );
}
