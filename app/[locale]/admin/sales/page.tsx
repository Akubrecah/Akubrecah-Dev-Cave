'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BadgeDollarSign, Target, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { AdminHeader } from '../_components/AdminHeader';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function SalesDashboard() {
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

  const totalUsers = stats?.totalUsers || 1;
  const totalTransactions = stats?.totalTransactions || 0;
  const closeRate = ((totalTransactions / totalUsers) * 100).toFixed(1);
  const arpu = stats?.totalRevenue ? (stats.totalRevenue / totalUsers).toFixed(0) : '0';

  // Pipeline visualization based on actual stats
  const salesData = [
    { stage: 'Users', count: stats?.totalUsers || 0 },
    { stage: 'Qualified', count: Math.round((stats?.totalUsers || 0) * 0.4) }, // Calculated qualified estimate
    { stage: 'Transactions', count: stats?.totalTransactions || 0 },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20 relative z-10">
        <AdminHeader 
          title="Sales Operations" 
          subtitle="Pipeline & Conversion Metrics"
          onRefresh={refreshData}
          isSyncing={loading}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
               <div className="relative">
                  <div className="w-16 h-16 border-2 border-white/5 rounded-full animate-spin border-t-emerald-500" />
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Loading Sales Logic...</p>
            </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
               className="space-y-8"
             >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><BadgeDollarSign className="w-24 h-24 text-emerald-500" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-emerald-500" /> Active Subscriptions
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">{stats?.activeSubscriptions?.toLocaleString() || 0}</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2">Real-time DB Active</p>
                  </div>
                  
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><Target className="w-24 h-24 text-emerald-500" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-emerald-500" /> Close Rate (Tx/User)
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">{closeRate}%</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2">Conversion Efficiency</p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><TrendingUp className="w-24 h-24 text-emerald-500" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-emerald-500" /> ARPU
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">KES {arpu}</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2">Derived from total Rev</p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><ArrowUpRight className="w-24 h-24 text-emerald-500" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-[#F5C200]" /> Goal Progress
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">74%</h3>
                    <div className="w-full h-1 bg-white/10 mt-3 rounded-full overflow-hidden">
                       <div className="h-full bg-[#F5C200] w-[74%]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5 relative">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Real-time Pipeline (Units)</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis dataKey="stage" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#10b981' }}
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          />
                          <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                            {salesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill="#10b981" fillOpacity={1 - (index * 0.25)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Live Deal Feed</h3>
                    <div className="space-y-4">
                      {stats?.recentTransactions?.slice(0, 4).map((deal: any, i: number) => (
                         <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all overflow-hidden font-sans">
                            <div className="overflow-hidden">
                               <p className="text-sm font-bold text-white tracking-tight truncate">{deal.user}</p>
                               <div className="flex gap-2 mt-1 items-center">
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Closed</span>
                                  <span className="text-[10px] font-black text-emerald-500/50">&bull;</span>
                                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{deal.date}</span>
                               </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                               <p className="text-sm font-black text-emerald-500 tracking-tighter">KES {deal.amount}</p>
                            </div>
                         </div>
                      ))}
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
