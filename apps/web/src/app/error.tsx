"use client";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-6 text-sm">
          Failed to load schedule data. The MockProvider or API might be down.
        </p>
        <button
          onClick={() => reset()}
          className="bg-[var(--primary-blue)] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          Try again
        </button>
      </main>
      
      <BottomNav />
    </div>
  );
}
