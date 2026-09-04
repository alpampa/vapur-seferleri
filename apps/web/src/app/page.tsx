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
  schedules: ScheduleCardDto[];
}

async function getSchedules(): Promise<SchedulesResponse | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/schedules`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
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
