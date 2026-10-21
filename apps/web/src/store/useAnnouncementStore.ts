import { create } from "zustand";
import type { OperatorAnnouncement, TripDisruption } from "@/lib/types/announcement";
import type { ChangeEvent, OperatorHealth } from "@/lib/agents/monitor-types";

export interface OperatorCoverageItem {
  operator: string;
  status: "SCANNED" | "FAILED" | "NO_SOURCE";
  url?: string;
  error?: string;
  announcementCount?: number;
  note?: string;
  usedFallback?: boolean;
}

interface AnnouncementState {
  announcements: OperatorAnnouncement[];
  disruptions: TripDisruption[];
  sourceHealth: OperatorHealth[];
  recentChanges: ChangeEvent[];
  coverage: OperatorCoverageItem[];
  liveScanAt: string | null;
  loadedAt: string | null;
  loading: boolean;
  error: string | null;
  setData: (data: {
    announcements: OperatorAnnouncement[];
    disruptions: TripDisruption[];
    sourceHealth?: OperatorHealth[];
    recentChanges?: ChangeEvent[];
    coverage?: OperatorCoverageItem[];
    liveScanAt?: string | null;
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  disruptions: [],
  sourceHealth: [],
  recentChanges: [],
  coverage: [],
  liveScanAt: null,
  loadedAt: null,
  loading: false,
  error: null,
  setData: (data) => {
    const nowIso = new Date().toISOString();
    set({
      announcements: data.announcements,
      disruptions: data.disruptions,
      sourceHealth: data.sourceHealth ?? [],
      recentChanges: data.recentChanges ?? [],
      coverage: data.coverage ?? [],
      liveScanAt: data.liveScanAt ?? nowIso,
      loadedAt: nowIso,
    });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

/** Bir seferin id'sine bağlı bozulma kaydı (varsa) */
export function getDisruptionForTrip(tripId: string): TripDisruption | undefined {
  return useAnnouncementStore
    .getState()
    .disruptions.find((d) => d.tripId === tripId);
}

/** Bir firmanın kaynak sağlığı (yoksa undefined) */
export function getOperatorHealth(operator: string): OperatorHealth | undefined {
  return useAnnouncementStore.getState().sourceHealth.find((h) => h.operator === operator);
}
