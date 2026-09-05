import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SearchBar } from "@/components/ui/SearchBar";
import { TripStatus } from "@/components/schedule/ScheduleCard";
import { NearbyRoutes } from "@/components/schedule/NearbyRoutes";
import { ScheduleListClient } from "@/components/schedule/ScheduleListClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  vessel?: string;
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

import { getLiveOrOfficialSchedules } from "@/lib/agents/timetable-engine";
import { fetchLiveMarineWeather, type MarineWeatherStatus } from "@/lib/services/marine-weather";

async function getSchedules(): Promise<SchedulesResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && !apiUrl.includes('localhost')) {
    try {
      const res = await fetch(`${apiUrl}/schedules`, { next: { revalidate: 60 } });
      if (res.ok) {
        const json = await res.json();
        if (json?.schedules?.length > 0) return json;
      }
    } catch (e) {
      console.warn("API URL failed, falling back to built-in timetable engine:", e);
    }
  }

  // 100% Reliable Official Timetable Engine with Istanbul Time & Live Updates
  return await getLiveOrOfficialSchedules();
}

export default async function Home() {
  const [data, weather] = await Promise.all([
    getSchedules(),
    fetchLiveMarineWeather()
  ]);

  const schedules = data?.schedules || [];
  const serverTimeIso = data?.serverTimeIso || new Date().toISOString();

  return (
    <div className="flex flex-col min-h-screen bg-[#070b14]">
      <TopBar />
      
      <main className="flex-1 overflow-y-auto hide-scrollbar relative pb-[76px]">
        {/* Schedule Cards List via Client Component with Integrated Sleek Filters */}
        <ScheduleListClient
          schedules={schedules}
          serverTimeIso={serverTimeIso}
          marineWeather={weather}
        />
      </main>

      <BottomNav />
    </div>
  );
}
