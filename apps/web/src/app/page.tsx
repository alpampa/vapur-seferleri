import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SearchBar } from "@/components/ui/SearchBar";
import { ScheduleCard, TripStatus } from "@/components/schedule/ScheduleCard";
import { NearbyRoutes } from "@/components/schedule/NearbyRoutes";
import { LiveMap } from "@/components/schedule/LiveMap";

interface ScheduleCardDto {
  id: string;
  origin: string;
  destination: string;
  operator: string;
  routeTitle: string;
  departureTime: string;
  departureTime12: string;
  status: TripStatus;
  countdown?: string;
  countdownSubtext?: string;
  delayText?: string;
  vessel: string;
  platform: string;
  price: string;
  progress: number;
}

async function getSchedules(): Promise<ScheduleCardDto[]> {
  try {
    const res = await fetch('http://localhost:3001/schedules', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    return [];
  }
}

export default async function Home() {
  const schedules = await getSchedules();

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Title Section */}
        <div className="px-5 mt-2">
          <h1 className="text-[32px] font-bold leading-tight">Ferry Schedules</h1>
          <p className="text-[var(--text-secondary)] text-[15px] mt-1 font-medium">Tuesday, Oct 26</p>
        </div>

        <LiveMap />

        <SearchBar />

        {/* Schedule Cards List */}
        <div className="px-5 flex flex-col gap-3">
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                origin={schedule.origin}
                destination={schedule.destination}
                operator={schedule.operator}
                routeTitle={schedule.routeTitle}
                departureTime={schedule.departureTime}
                departureTime12={schedule.departureTime12}
                status={schedule.status}
                countdown={schedule.countdown}
                countdownSubtext={schedule.countdownSubtext}
                delayText={schedule.delayText}
                vessel={schedule.vessel}
                platform={schedule.platform}
                price={schedule.price}
                progress={schedule.progress}
              />
            ))
          ) : (
            <div className="text-center py-10 text-white/50">
              No schedules available. Is the API running?
            </div>
          )}
        </div>

        <NearbyRoutes />
      </main>

      <BottomNav />
    </div>
  );
}
