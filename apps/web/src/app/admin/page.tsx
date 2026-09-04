import { Ship, Users, Activity, Settings2 } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Live metrics and system status.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          Generate Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Vessels", value: "24", icon: Ship, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Daily Passengers", value: "12.4k", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "System Uptime", value: "99.9%", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active Incidents", value: "1", icon: Settings2, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg}`}>
              <kpi.icon className={kpi.color} size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Mock CRUD Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Schedules</h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium">Route</th>
                <th className="p-4 font-medium">Vessel</th>
                <th className="p-4 font-medium">Departure</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {[
                { route: "Kadıköy - Beşiktaş", vessel: "MS Şehir Hatları", time: "14:30", status: "ON TIME", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                { route: "Bostancı - Adalar", vessel: "MS Mavi Marmara", time: "15:00", status: "DELAYED", color: "text-amber-700 bg-amber-50 border-amber-200" },
                { route: "Eminönü - Üsküdar", vessel: "MS Turyol", time: "15:15", status: "BOARDING", color: "text-blue-700 bg-blue-50 border-blue-200" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{row.route}</td>
                  <td className="p-4 text-gray-600">{row.vessel}</td>
                  <td className="p-4 text-gray-600">{row.time}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${row.color}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-gray-400 hover:text-gray-900 transition-colors font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
