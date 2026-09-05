import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { TripPlannerWithMap } from "@/components/planner/TripPlannerWithMap";
import { getLiveOrOfficialSchedules } from "@/lib/agents/timetable-engine";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveMapPage() {
  const data = await getLiveOrOfficialSchedules();
  const schedules = data?.schedules || [];
  const serverTimeIso = data?.serverTimeIso || new Date().toISOString();

  return (
    <div className="flex flex-col min-h-screen bg-[#070b14] text-white">
      <TopBar />

      <main className="flex-1 p-3 sm:p-4 pb-[85px] overflow-y-auto">
        <TripPlannerWithMap
          schedules={schedules}
          serverTimeIso={serverTimeIso}
        />
      </main>

      <BottomNav />
    </div>
  );
}
