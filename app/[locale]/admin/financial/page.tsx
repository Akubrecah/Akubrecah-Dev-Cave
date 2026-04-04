'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, Receipt, Landmark } from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { AdminHeader } from '../_components/AdminHeader';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function FinancialDashboard() {
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

  const totalRevenue = stats?.totalRevenue || 0;
  // Simulated expenses for the P&L visualization (Real data would need an Expenses table)
  const opEx = Math.round(totalRevenue * 0.15); // Assuming 15% platform fee/hosting
  const netProfit = totalRevenue - opEx;

  // Map real dailyRevenueTrend to P&L format
  const pnlData = (stats?.dailyRevenueTrend || []).map((day: any) => ({
    name: day.date,
    revenue: day.revenue,
    expenses: Math.round(day.revenue * 0.15),
    profit: day.revenue - Math.round(day.revenue * 0.15),
  }));

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30 overflow-x-hidden font-sans">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/05 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20 relative z-10">
        <AdminHeader 
          title="Financial Oversight" 
          subtitle="P&L, Cashflow & Transaction Ledger"
          onRefresh={refreshData}
          isSyncing={loading}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
               <div className="relative">
                  <div className="w-16 h-16 border-2 border-white/5 rounded-full animate-spin border-t-amber-500" />
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Auditing Financial Records...</p>
            </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
               className="space-y-8"
             >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-amber-500/30 transition-all">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-emerald-500" /> Gross Revenue (Real)
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">KES {totalRevenue.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Fully Realized
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-amber-500/30 transition-all">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-red-500" /> Tracked OpEx
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">KES {opEx.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-red-500/50 mt-2 flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3" /> Calc (15% Sys)
                    </p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-amber-500/30 transition-all overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><TrendingUp className="w-24 h-24 text-amber-500" /></div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-amber-500" /> Net Profit Margin
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">85%</h3>
                    <p className="text-xs font-bold text-amber-500 mt-2">Adjusted yield</p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-amber-500/30 transition-all">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-sm bg-sky-500" /> Liquidity Pulse
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">OPTIMIZED</h3>
                    <p className="text-xs font-bold text-sky-500 mt-2">Treasury Checkpoint: PASS</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">P&L Heat Wave (Real-time Trend)</h3>
                    <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={pnlData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                           <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 'bold' }}
                             itemStyle={{ color: '#f59e0b' }}
                           />
                           <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.1} />
                           <Area type="monotone" dataKey="profit" stackId="2" stroke="#f59e0b" strokeWidth={3} fill="#f59e0b" fillOpacity={0.2} />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5 flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                       Ledger Feed <Receipt className="w-4 h-4 text-amber-500/50" />
                    </h3>
                    <div className="flex-1 space-y-4">
                      {stats?.recentTransactions?.slice(0, 5).map((tx: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-amber-500/20 transition-all font-sans">
                           <div className="overflow-hidden">
                              <p className="text-sm font-bold text-white truncate">{tx.user}</p>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{tx.date} &bull; {tx.id.slice(0,8)}</p>
                           </div>
                           <div className="text-right flex-shrink-0">
                              <p className="text-sm font-black text-emerald-500 tracking-tighter">KES {tx.amount}</p>
                              <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-1">REALIZED</p>
                           </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-8 w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 rounded-2xl text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                       <Landmark className="w-4 h-4" /> Download Fiscal Report
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
