import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import API from "../services/api";

export default function Dashboard() {

  const [stats, setStats] = useState({
    households: 0,
    collectors: 0,
    pickups: 0,
    pending: 0,
    assigned: 0,
    completed: 0,
    cancelled: 0,
    wasteBreakdown: []
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const res = await API.get("/admin/dashboard/stats");
      setStats(res.data.data);
    } catch {
      alert("Failed to load dashboard stats");
    }
  };

  return (
    <div className="p-2 animate-fade-in space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Dashboard</h2>
          <p className="text-gray-400 mt-2">Real-time overview of waste management operations.</p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* HOUSEHOLDS CARD */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all"></div>
          <div className="relative z-10">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Households</p>
            <h3 className="text-4xl font-black text-white mt-2 group-hover:scale-105 transition-transform">{stats.households}</h3>
            <p className="text-xs text-success mt-2 font-mono">▲ Active Users</p>
          </div>
        </div>

        {/* COLLECTORS CARD */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all"></div>
          <div className="relative z-10">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Collectors</p>
            <h3 className="text-4xl font-black text-white mt-2 group-hover:scale-105 transition-transform">{stats.collectors}</h3>
            <p className="text-xs text-info mt-2 font-mono">● On Duty</p>
          </div>
        </div>

        {/* PICKUPS CARD */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl group-hover:bg-yellow-500/30 transition-all"></div>
          <div className="relative z-10">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Pickups</p>
            <h3 className="text-4xl font-black text-gradient-gold mt-2 group-hover:scale-105 transition-transform">{stats.pickups}</h3>
            <p className="text-xs text-warning mt-2 font-mono">★ All Time</p>
          </div>
        </div>

        {/* PENDING ACTIONS */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-red-500/30">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/20 rounded-full blur-2xl group-hover:bg-red-500/30 transition-all"></div>
          <div className="relative z-10">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Pending Requests</p>
            <h3 className="text-4xl font-black text-gradient-danger mt-2 group-hover:scale-105 transition-transform">{stats.pending}</h3>
            <p className="text-xs text-error mt-2 font-mono">! Action Needed</p>
          </div>
        </div>
      </div>

      {/* SECONDARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* REQUEST BREAKDOWN */}
        <div className="glass p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-6">Request Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition">
              <span className="text-gray-300">Assigned</span>
              <span className="text-xl font-bold text-info">{stats.assigned}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition">
              <span className="text-gray-300">Completed</span>
              <span className="text-xl font-bold text-success">{stats.completed}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition">
              <span className="text-gray-300">Cancelled</span>
              <span className="text-xl font-bold text-error">{stats.cancelled}</span>
            </div>
          </div>
        </div>

        {/* WASTE CATEGORY BREAKDOWN */}
        <div className="glass p-8 rounded-3xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Total Waste Collected (kg)</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.wasteBreakdown}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.wasteBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
