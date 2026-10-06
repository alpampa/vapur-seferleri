import { create } from "zustand";
import type { OperatorAnnouncement, TripDisruption } from "@/lib/types/announcement";

interface AnnouncementState {
  announcements: OperatorAnnouncement[];
  disruptions: TripDisruption[];
  loadedAt: string | null;
  loading: boolean;
  error: string | null;
  setData: (data: {
    announcements: OperatorAnnouncement[];
    disruptions: TripDisruption[];
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  disruptions: [],
  loadedAt: null,
  loading: false,
  error: null,
  setData: (data) =>
    set({ announcements: data.announcements, disruptions: data.disruptions, loadedAt: new Date().toISOString() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

/** Bir seferin id'sine bağlı bozulma kaydı (varsa) */
export function getDisruptionForTrip(tripId: string): TripDisruption | undefined {
  return useAnnouncementStore
    .getState()
    .disruptions.find((d) => d.tripId === tripId);
}
