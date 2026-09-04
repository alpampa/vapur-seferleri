import { BottomNav } from "@/components/navigation/BottomNav";
import { TopBar } from "@/components/navigation/TopBar";
import { FavoritesList } from "@/components/profile/FavoritesList";
import { Settings, CreditCard, Bell, LogOut, Shield } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-[100px] px-5 pt-4">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--primary-blue)] to-blue-300 p-1">
            <div className="w-full h-full bg-[#041225] rounded-full overflow-hidden flex items-center justify-center">
              <span className="text-2xl font-bold text-white">JD</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">John Doe</h1>
            <p className="text-white/50 text-sm mt-1">john.doe@example.com</p>
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-xs font-bold mt-2">
               <Shield size={12} /> Verified
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-[var(--card-bg)] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard className="text-white/70" size={20} />
              <span className="font-medium">Payment Methods</span>
            </div>
            <Settings className="text-white/30" size={16} />
          </div>
          <div className="p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="text-white/70" size={20} />
              <span className="font-medium">Notifications</span>
            </div>
            <Settings className="text-white/30" size={16} />
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <LogOut className="text-red-400" size={20} />
              <span className="font-medium text-red-400">Log Out</span>
            </div>
          </div>
        </div>

        <FavoritesList />
      </main>

      <BottomNav />
    </div>
  );
}
