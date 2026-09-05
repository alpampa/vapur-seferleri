"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[]; // array of route keys: "Kadıköy ➔ Karaköy"
  toggleFavorite: (routeKey: string) => boolean;
  isFavorite: (routeKey: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: ["Kadıköy ➔ Karaköy", "Kabataş ➔ Büyükada"], // Defaults popular
      toggleFavorite: (routeKey: string) => {
        const current = get().favorites;
        const exists = current.includes(routeKey);
        const next = exists
          ? current.filter(r => r !== routeKey)
          : [...current, routeKey];

        set({ favorites: next });
        return !exists;
      },
      isFavorite: (routeKey: string) => get().favorites.includes(routeKey)
    }),
    {
      name: 'vapur_favorites_v1'
    }
  )
);
