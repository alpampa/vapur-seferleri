import { Search, User, Ship } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2 text-[var(--text-primary)]">
      <div className="flex items-center gap-2">
        <div className="bg-[var(--primary-blue)] p-1.5 rounded-md flex items-center justify-center">
          <Ship size={20} className="text-white" />
        </div>
        <span className="font-semibold text-lg tracking-tight">FerryFlow</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button aria-label="Search" className="hover:opacity-80 transition-opacity">
          <Search size={24} />
        </button>
        <button aria-label="Open profile" className="hover:opacity-80 transition-opacity bg-white/10 p-1 rounded-full">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
