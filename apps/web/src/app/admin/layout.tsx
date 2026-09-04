import { Anchor, Users, Navigation, AlertTriangle, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] w-full bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Anchor className="text-white" size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">FerryAdmin</span>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium">
            <Navigation size={18} /> Dashboard
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <Users size={18} /> Users
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <AlertTriangle size={18} /> Alerts
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
            <LogOut size={18} /> Exit to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="text-blue-600" size={20} />
            <span className="font-bold text-lg">FerryAdmin</span>
          </div>
          <Link href="/" className="text-sm font-medium text-gray-500">Exit</Link>
        </header>

        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
