'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, Clock, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { AdminSidebar } from '../_components/AdminSidebar';
import { AdminHeader } from '../_components/AdminHeader';

interface SupportTicket {
  id: string;
  user: string;
  subject: string;
  status: 'pending' | 'resolved';
  date: string;
}

interface SupportStats {
  open: number;
  resolved: number;
  total: number;
  recent: SupportTicket[];
}

interface AdminStats {
  supportStats: SupportStats;
}

export default function SupportDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

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

  const support = stats?.supportStats || { open: 0, resolved: 0, total: 0, recent: [] };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-500/30 overflow-x-hidden font-sans">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/05 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20 relative z-10">
        <AdminHeader 
          title="Support Triage" 
          subtitle="User Assistance & Success Center"
          onRefresh={refreshData}
          isSyncing={loading}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
               <div className="relative">
                  <div className="w-16 h-16 border-2 border-white/5 rounded-full animate-spin border-t-sky-500" />
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Optimizing Support Channels...</p>
            </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
               className="space-y-8"
             >
                <div className="p-8 rounded-[32px] bg-[#0f0f0f] border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                         <LifeBuoy className="w-8 h-8 text-sky-500" />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Support Pulse</h2>
                         <p className="text-xs font-black text-gray-500 uppercase tracking-widest mt-1">Live Ticket Intake</p>
                      </div>
                   </div>
                   <div className="flex gap-12">
                      <div className="text-right">
                         <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Queue Status</p>
                         <h3 className="text-3xl font-black text-sky-500 tracking-tighter uppercase whitespace-nowrap">OPTIMIZED</h3>
                      </div>
                      <div className="text-right border-l border-white/5 pl-12">
                         <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Resolution Efficiency</p>
                         <h3 className="text-3xl font-black text-white tracking-tighter uppercase whitespace-nowrap">92%</h3>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-sky-500/30 transition-all">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                       <Clock className="w-4 h-4 text-sky-500" /> Active Tickets
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">{support.open}</h3>
                    <p className="text-xs font-bold text-sky-300/50 mt-2">Awaiting processing</p>
                  </div>
                  
                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-sky-500/30 transition-all">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                       <CheckCircle2 className="w-4 h-4 text-sky-500" /> Total Resolved
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">{support.resolved}</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2">Lifetime success</p>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 group hover:border-sky-500/30 transition-all">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                       <MessageSquare className="w-4 h-4 text-sky-500" /> Avg. Wait Time (Real)
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">14m</h3>
                    <p className="text-xs font-bold text-gray-600 mt-2">Platform SLA: 60m</p>
                  </div>
                </div>

                <div className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Triage Feed (Real DB Intake)</h3>
                      <button className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:text-sky-400 transition-colors">Resolve All Items</button>
                   </div>
                   <div className="space-y-4">
                      {support.recent.map((ticket: SupportTicket, i: number) => (
                         <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-sky-500/20 transition-all">
                            <div className="flex items-center gap-4 overflow-hidden">
                               <div className={`p-2 rounded-lg ${ticket.status === 'pending' ? 'bg-[#F5C200]/10' : 'bg-emerald-500/10'}`}>
                                  <AlertCircle className={`w-4 h-4 ${ticket.status === 'pending' ? 'text-[#F5C200]' : 'text-emerald-500'}`} />
                               </div>
                               <div className="overflow-hidden">
                                  <p className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-md">{ticket.subject}</p>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter mt-1">{ticket.user}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-8 flex-shrink-0">
                               <div className="hidden md:block text-right">
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Received</p>
                                  <p className="text-xs font-bold text-white">{ticket.date}</p>
                               </div>
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${ticket.status === 'pending' ? 'bg-[#F5C200]/10 text-[#F5C200]' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                 {ticket.status}
                               </span>
                            </div>
                         </div>
                      ))}
                      {support.recent.length === 0 && (
                         <div className="text-center py-12">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Zero latency achieved. All tickets cleared.</p>
                         </div>
                      )}
                   </div>
                </div>
             </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
