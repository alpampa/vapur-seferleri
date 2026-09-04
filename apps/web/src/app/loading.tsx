"use client";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Title Section Skeleton */}
        <div className="px-5 mt-2 animate-pulse">
          <div className="h-8 w-48 bg-gray-200/20 rounded-md mb-2"></div>
          <div className="h-4 w-32 bg-gray-200/10 rounded-md"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mx-5 my-4 h-12 bg-gray-200/10 rounded-full animate-pulse"></div>

        {/* Schedule Cards List Skeleton */}
        <div className="px-5 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-[var(--card)] rounded-[18px] p-4 flex gap-4 animate-pulse h-[120px]">
              <div className="w-[60px] h-full bg-gray-200/20 rounded-lg"></div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-5 w-3/4 bg-gray-200/20 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200/20 rounded"></div>
                <div className="h-4 w-full bg-gray-200/20 rounded mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
