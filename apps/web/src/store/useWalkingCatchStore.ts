import { create } from 'zustand';

export interface WalkingCatchState {
  isEnabled: boolean;
  userDistanceMeters: number;
  walkingSpeedKmH: number;
  userLocation: { lat: number; lng: number } | null;
  toggleEnabled: () => void;
  setDistanceMeters: (meters: number) => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  getWalkingMinutesToPier: (pierLat?: number, pierLng?: number) => number;
}

export const useWalkingCatchStore = create<WalkingCatchState>((set, get) => ({
  isEnabled: false,
  userDistanceMeters: 500,
  walkingSpeedKmH: 4.8,
  userLocation: null,

  toggleEnabled: () => set((state) => ({ isEnabled: !state.isEnabled })),
  setDistanceMeters: (meters: number) => set({ userDistanceMeters: meters }),
  setUserLocation: (loc) => set({ userLocation: loc, isEnabled: loc !== null }),

  getWalkingMinutesToPier: (pierLat?: number, pierLng?: number) => {
    const { userLocation, userDistanceMeters, walkingSpeedKmH } = get();
    if (userLocation && pierLat && pierLng) {
      const R = 6371e3;
      const phi1 = (userLocation.lat * Math.PI) / 180;
      const phi2 = (pierLat * Math.PI) / 180;
      const deltaPhi = ((pierLat - userLocation.lat) * Math.PI) / 180;
      const deltaLambda = ((pierLng - userLocation.lng) * Math.PI) / 180;
      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceMeters = R * c;
      const metersPerMinute = (walkingSpeedKmH * 1000) / 60;
      return Math.max(1, Math.round(distanceMeters / metersPerMinute));
    }
    const metersPerMinute = (walkingSpeedKmH * 1000) / 60;
    return Math.max(1, Math.round(userDistanceMeters / metersPerMinute));
  }
}));