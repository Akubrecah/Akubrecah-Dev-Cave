'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, TrendingUp } from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { AdminHeader } from '../_components/AdminHeader';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function MarketingDashboard() {
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

  const trafficSources = [
    { name: 'Organic Search', value: 42, color: '#f43f5e' },
    { name: 'Direct Traffic', value: 28, color: '#fb923c' },
    { name: 'Referral Net', value: 18, color: '#22c55e' },
    { name: 'Social Ads', value: 12, color: '#06b6d4' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-rose-500/30 overflow-x-hidden font-sans">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/05 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20 relative z-10">
        <AdminHeader 
          title="Growth & Acquisition" 
          subtitle="Marketing Attribution & ROI Analysis"
          onRefresh={refreshData}
          isSyncing={loading}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
               <div className="relative">
                  <div className="w-16 h-16 border-2 border-white/5 rounded-full animate-spin border-t-rose-500" />
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Aggregating Attribution Data...</p>
            </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
               className="space-y-8"
             >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-rose-500/30 transition-all">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-rose-500" /> Global CAC (Sim)
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">KES 4,800</h3>
                    <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Growth Targeting
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-rose-500/30 transition-all">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-sky-500" /> Web Sessions
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">{stats?.gaSessions || 0}</h3>
                    <p className="text-xs font-bold text-sky-500 mt-2 flex items-center gap-1">
                      Clarity Live Insight
                    </p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-rose-500/30 transition-all">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-emerald-500" /> Bounce Rate
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">{stats?.gaBounceRate?.toFixed(1) || '0.0'}%</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2">Active Retention</p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-rose-500/30 transition-all overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><MousePointer2 className="w-24 h-24 text-rose-500" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-rose-500" /> Conversion Ratio
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">5.4%</h3>
                    <p className="text-xs font-bold text-rose-500 mt-2">Click to Reg Delta</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">User Acquisition Slope (Real Daily)</h3>
                    <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={stats?.dailyUserTrend || []} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                           <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 'bold' }}
                             itemStyle={{ color: '#f43f5e' }}
                           />
                           <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={20}>
                              {(stats?.dailyUserTrend || []).map((entry: any, index: number) => (
                                 <Cell key={index} fill="#f43f5e" fillOpacity={1 - (index * 0.1)} />
                              ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Attribution Distribution</h3>
                    <div className="space-y-6 mt-10">
                      {trafficSources.map((source, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                             <span className="text-gray-500">{source.name}</span>
                             <span className="text-white">{source.value}%</span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${source.value}%`, backgroundColor: source.color }} />
                           </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-12 p-6 rounded-2xl bg-rose-500/05 border border-rose-500/10 border-dashed text-center">
                       <p className="text-xs font-bold text-rose-500/80 mb-2 font-sans italic opacity-60">&quot;Organic visibility remains our primary leverage.&quot;</p>
                       <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">&mdash; AkubrecaH Pulse Analytics</p>
                    </div>
                  </div>
                </div>
             </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
