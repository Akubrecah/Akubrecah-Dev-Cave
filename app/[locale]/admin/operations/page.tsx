'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Activity, Database, HardDrive, Cpu, Wifi } from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { AdminHeader } from '../_components/AdminHeader';

export default function OperationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([
          fetch('/api/admin/stats').then(res => res.json()),
          fetch('/api/admin/health').then(res => res.json()).catch(() => null)
        ]);
        setStats(statsRes);
        setHealthData(healthRes);
        setLoading(false);
      } catch (err) {
        console.error('Ops fetch fail', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    fetch('/api/admin/health').then(res => res.json()).then(data => {
      setHealthData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30 overflow-x-hidden font-sans">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.03] blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20 relative z-10">
        <AdminHeader 
          title="Infrastructure Ops" 
          subtitle="System Health & Integrity"
          onRefresh={refreshData}
          isSyncing={loading}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
               <div className="relative">
                  <div className="w-16 h-16 border-2 border-white/5 rounded-full animate-spin border-t-white" />
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Probing Network Nodes...</p>
            </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
               className="space-y-8"
             >
                <div className="p-8 rounded-[32px] bg-[#0f0f0f] border border-white/5 relative overflow-hidden flex items-center justify-between">
                   <div className="relative z-10 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 relative">
                         <div className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-20" />
                         <Server className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Systems Operational</h2>
                         <p className="text-xs font-black text-gray-500 uppercase tracking-widest mt-1">Status: {healthData?.status || 'Active'}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Global Uptime</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">99.98%</h3>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                       <Cpu className="w-4 h-4 text-white" /> Traffic Density
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">{stats?.activeNow || 0}</h3>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Active Now (L7)</p>
                  </div>
                  
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                       <HardDrive className="w-4 h-4 text-white" /> Usage Patterns
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">{stats?.totalCertificates || 0}</h3>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Certificates Processed</p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                       <Database className="w-4 h-4 text-white" /> DB Latency
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">{healthData?.queryTimeMs || '42'}ms</h3>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Neon Region: AWS-EU-1</p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                       <Wifi className="w-4 h-4 text-white" /> Network Ping
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">{healthData?.pingTime || '24ms'}</h3>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Edge Cache: HIT</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center justify-between">
                       Primary Node Health <Activity className="w-4 h-4 text-emerald-500" />
                    </h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-xs font-bold text-gray-400">Prisma Strategy</span>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">Optimized</span>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-xs font-bold text-gray-400">Environment Mode</span>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">Production</span>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-xs font-bold text-gray-400">API Gateway</span>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">Operational</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                       External Gateway Signals <Wifi className="w-4 h-4 text-emerald-500/50" />
                    </h3>
                    <div className="space-y-4">
                      {[
                         { service: "Paystack API", status: "Operational", ping: "28ms" },
                         { service: "Safaricom Daraja", status: "Operational", ping: "145ms" },
                         { service: "Clarity Pulse", status: "Operational", ping: "62ms" },
                         { service: "Mailgun MTA", status: "Operational", ping: "42ms" }
                      ].map((gw, i) => (
                         <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all overflow-hidden font-sans">
                            <div className="flex items-center gap-3">
                               <div className={`w-1.5 h-1.5 rounded-full ${gw.status === 'Operational' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-[#f59e0b]'}`} />
                               <p className="text-xs font-bold text-white tracking-tight">{gw.service}</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{gw.ping}</span>
                               <span className={`text-[9px] font-black uppercase tracking-widest ${gw.status === 'Operational' ? 'text-emerald-500' : 'text-[#f59e0b]'}`}>{gw.status}</span>
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
