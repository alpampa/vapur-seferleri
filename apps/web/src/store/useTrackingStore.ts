import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface VesselPosition {
  vesselId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: string;
}

interface TrackingState {
  positions: VesselPosition[];
  connected: boolean;
  reconnecting: boolean;
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  positions: [],
  connected: false,
  reconnecting: false,
  socket: null,

  connect: () => {
    // Only connect if we aren't already connected or trying to connect
    if (get().socket) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    
    const socket = io(`${wsUrl}/ws/tracking`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    socket.on("connect", () => {
      set({ connected: true, reconnecting: false });
      console.log("Zustand: Connected to Realtime Tracking Engine");
    });

    socket.on("disconnect", () => {
      set({ connected: false });
    });
    
    socket.io.on("reconnect_attempt", () => {
      set({ reconnecting: true });
    });

    socket.on("vessel.positions", (data: VesselPosition[]) => {
      set({ positions: data });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false, reconnecting: false, positions: [] });
    }
  }
}));
