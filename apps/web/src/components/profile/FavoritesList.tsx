import { Star, Clock, MapPin, ChevronRight } from "lucide-react";

export function FavoritesList() {
  // Mock favorites
  const favorites = [
    { id: 1, origin: "Kadıköy", destination: "Beşiktaş", type: "Ferry" },
    { id: 2, origin: "Bostancı", destination: "Adalar", type: "Ferry" },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4">Favorite Routes</h3>
      <div className="flex flex-col gap-3">
        {favorites.map((fav) => (
          <div key={fav.id} className="bg-[var(--card-bg)] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary-blue)]/10 flex items-center justify-center">
                <Star className="text-[var(--primary-blue)]" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{fav.origin} to {fav.destination}</h4>
                <p className="text-white/50 text-xs mt-0.5">{fav.type}</p>
              </div>
            </div>
            <button className="text-white/30 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
