"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AlarmState {
  alarms: Record<string, boolean>; // tripId -> true
  triggered: Record<string, boolean>; // tripId -> true
  toggleAlarm: (tripId: string) => boolean; // returns new state
  isAlarmSet: (tripId: string) => boolean;
  markTriggered: (tripId: string) => void;
  isTriggered: (tripId: string) => boolean;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: {},
      triggered: {},
      toggleAlarm: (tripId: string) => {
        const current = !!get().alarms[tripId];
        const next = !current;
        set((state) => ({
          alarms: {
            ...state.alarms,
            [tripId]: next
          }
        }));
        return next;
      },
      isAlarmSet: (tripId: string) => !!get().alarms[tripId],
      markTriggered: (tripId: string) => {
        set((state) => ({
          triggered: {
            ...state.triggered,
            [tripId]: true
          }
        }));
      },
      isTriggered: (tripId: string) => !!get().triggered[tripId]
    }),
    {
      name: 'vapur_trip_alarms_v1'
    }
  )
);
