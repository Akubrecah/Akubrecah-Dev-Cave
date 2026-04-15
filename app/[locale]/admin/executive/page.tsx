'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, DollarSign, Users, BarChart3 } from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { AdminHeader } from '../_components/AdminHeader';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const dynamic = 'force-dynamic';

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  const refreshData = () => {
    setLoading(true);
    fetch('/api/admin/stats').then(res => res.json()).then(data => {
      setStats(data);
      setLoading(false);
    });
  };

  // Using real dailyRevenueTrend from API or fallback to mock for visualization during cold starts
  const chartData = stats?.dailyRevenueTrend || [
    { date: 'Mon', revenue: 0 },
    { date: 'Tue', revenue: 0 },
    { date: 'Wed', revenue: 0 },
    { date: 'Thu', revenue: 0 },
    { date: 'Fri', revenue: 0 },
    { date: 'Sat', revenue: 0 },
    { date: 'Sun', revenue: 0 },
  ];

  const totalRevenue = stats?.totalRevenue || 0;
  const activeBase = stats?.totalUsers || 0;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#F5C200]/30 overflow-x-hidden font-sans">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F5C200]/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20 relative z-10">
        <AdminHeader 
          title="Executive Command" 
          subtitle="Top-Level Performance Overview"
          onRefresh={refreshData}
          isSyncing={loading}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
               <div className="relative">
                  <div className="w-16 h-16 border-2 border-white/5 rounded-full animate-spin border-t-[#F5C200]" />
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Initializing Executive Systems...</p>
            </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
               className="space-y-8"
             >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 relative overflow-hidden group hover:border-[#F5C200]/30 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><DollarSign className="w-24 h-24 text-[#F5C200]" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-[#F5C200]" /> Total Platform Revenue
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">KES {totalRevenue.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2">All-time realized</p>
                  </div>
                  
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 relative overflow-hidden group hover:border-[#F5C200]/30 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><BarChart3 className="w-24 h-24 text-[#F5C200]" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-[#F5C200]" /> 7DA Growth Trend
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">+{stats?.recentUsers || 0}</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2">New users last 7 days</p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 relative overflow-hidden group hover:border-[#F5C200]/30 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><Users className="w-24 h-24 text-[#F5C200]" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-[#F5C200]" /> Total Active Base
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">{activeBase.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2">Live from DB</p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 relative overflow-hidden group hover:border-[#F5C200]/30 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><Activity className="w-24 h-24 text-[#F5C200]" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-[#38bdf8]" /> Online Sessions (Live)
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">{stats?.activeNow || 0}</h3>
                    <p className="text-xs font-bold text-[#38bdf8] mt-2">Clarity Pulse Integration</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5 relative">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">Revenue Growth Velocity</h3>
                       <div className="px-3 py-1 bg-[#F5C200]/10 text-[#F5C200] rounded-full text-[10px] font-black uppercase tracking-widest">Last 7 Days (Real-time)</div>
                    </div>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="execColorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F5C200" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#F5C200" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#F5C200' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#F5C200" strokeWidth={3} fillOpacity={1} fill="url(#execColorRev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5 flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Real-time Feed</h3>
                    
                    <div className="flex-1 space-y-4">
                      {stats?.recentTransactions?.slice(0, 4).map((tx: any, i: number) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                           <div className="w-2 h-2 rounded-full mt-1.5 bg-emerald-500" />
                           <div className="overflow-hidden">
                             <p className="text-sm font-bold text-white tracking-tight truncate">{tx.user}</p>
                             <div className="flex gap-2 mt-1">
                               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{tx.date}</span>
                               <span className="text-[10px] font-black text-gray-600 uppercase">&bull;</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">KES {tx.amount}</span>
                             </div>
                           </div>
                        </div>
                      ))}
                      {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                         <div className="text-center py-10">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Awaiting Transaction Signal...</p>
                         </div>
                      )}
                    </div>

                    <button className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-colors font-sans">
                       View All Transactions
                    </button>
                  </div>
                </div>
             </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
