import { Map as MapIcon, Calendar, MapPin, Ticket, Bell } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full glass bg-white/5 border-t border-white/10 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex justify-between items-center px-6 h-[76px]">
        {/* Map */}
        <button className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <MapIcon size={24} />
          <span className="text-[10px] font-medium">Map</span>
        </button>
        
        {/* Schedules */}
        <button className="flex flex-col items-center gap-1 text-[var(--text-primary)] transition-colors">
          <Calendar size={24} />
          <span className="text-[10px] font-medium">Schedules</span>
        </button>

        {/* Live Map (Center Floating) */}
        <div className="relative -top-5">
          <button className="bg-[var(--primary-blue)] w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(38,150,255,0.4)] text-white hover:bg-[var(--bright-blue)] transition-colors border-4 border-[var(--deep-navy)]">
            <MapPin size={24} fill="currentColor" className="text-white mb-0.5" />
          </button>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-[var(--primary-blue)] whitespace-nowrap">
            Live Map
          </span>
        </div>

        {/* Tickets */}
        <button className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <Ticket size={24} />
          <span className="text-[10px] font-medium">Tickets</span>
        </button>

        {/* Notifications */}
        <button className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <Bell size={24} />
          <span className="text-[10px] font-medium">Notifications</span>
        </button>
      </div>
    </nav>
  );
}
