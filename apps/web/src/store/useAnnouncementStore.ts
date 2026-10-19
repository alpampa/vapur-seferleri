import { create } from "zustand";
import type { OperatorAnnouncement, TripDisruption } from "@/lib/types/announcement";
import type { ChangeEvent, OperatorHealth } from "@/lib/agents/monitor-types";

interface AnnouncementState {
  announcements: OperatorAnnouncement[];
  disruptions: TripDisruption[];
  sourceHealth: OperatorHealth[];
  recentChanges: ChangeEvent[];
  loadedAt: string | null;
  loading: boolean;
  error: string | null;
  setData: (data: {
    announcements: OperatorAnnouncement[];
    disruptions: TripDisruption[];
    sourceHealth?: OperatorHealth[];
    recentChanges?: ChangeEvent[];
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  disruptions: [],
  sourceHealth: [],
  recentChanges: [],
  loadedAt: null,
  loading: false,
  error: null,
  setData: (data) =>
    set({
      announcements: data.announcements,
      disruptions: data.disruptions,
      sourceHealth: data.sourceHealth ?? [],
      recentChanges: data.recentChanges ?? [],
      loadedAt: new Date().toISOString(),
    }),
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
