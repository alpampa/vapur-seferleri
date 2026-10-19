"use client";

import { Star, Trash2 } from "lucide-react";
import { useFavoritesStore } from "@/store/useFavoritesStore";

export function FavoritesList() {
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4">Favorite Routes</h3>

      {favorites.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-[var(--card-bg)] border border-white/5 text-sm text-white/50">
          Henüz favori hat eklemediniz. Bir seferi yıldızlayarak buraya ekleyebilirsiniz.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {favorites.map((routeKey) => (
            <div
              key={routeKey}
              className="bg-[var(--card-bg)] border border-white/5 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-blue)]/10 flex items-center justify-center shrink-0">
                  <Star className="text-[var(--primary-blue)]" size={20} />
                </div>
                <h4 className="font-bold text-white text-sm truncate">{routeKey}</h4>
              </div>
              <button
                type="button"
                onClick={() => toggleFavorite(routeKey)}
                aria-label={`${routeKey} favorilerden çıkar`}
                className="p-2 -mr-1 rounded-lg text-white/30 hover:text-rose-400 hover:bg-white/5 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
