import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative mx-5 my-4">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-white/50" />
      </div>
      <input
        type="text"
        placeholder="Search Routes & Destinations..."
        className="w-full h-[52px] bg-white/10 glass rounded-full pl-12 pr-4 text-[var(--text-primary)] placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all text-[15px]"
      />
    </div>
  );
}
