import { LiveMap } from "@/components/schedule/LiveMap";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function LiveMapPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col relative pb-[80px]">
        <LiveMap />
      </main>
      <BottomNav />
    </div>
  );
}
