import { create } from 'zustand';

export interface ActiveVoyage {
  id: string;
  origin: string;
  destination: string;
  operator: string;
  vesselName: string;
  mmsi: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
}

interface ActiveVoyageState {
  activeVoyage: ActiveVoyage | null;
  setActiveVoyage: (voyage: ActiveVoyage | null) => void;
  clearActiveVoyage: () => void;
}

export const useActiveVoyageStore = create<ActiveVoyageState>((set) => ({
  activeVoyage: null,
  setActiveVoyage: (voyage) => set({ activeVoyage: voyage }),
  clearActiveVoyage: () => set({ activeVoyage: null }),
}));