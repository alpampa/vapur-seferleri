export interface VesselPosition {
  vesselId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: string;
}

export interface TrackingProvider {
  getPositions(): Promise<VesselPosition[]>;
}

export const TRACKING_PROVIDER = 'TRACKING_PROVIDER';
