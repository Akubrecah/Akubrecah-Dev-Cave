'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileStack, LayoutGrid, Clock, CheckCircle2, Zap, ArrowRight, Sparkles, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function UserDashboard() {
  const params = useParams();
  const locale = params.locale as string;
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({ verifications: 0, certificates: 0, credits: 0 });

  useEffect(() => {
    fetch('/api/user/status')
      .then(res => res.json())
      .then(data => {
        setSubscription(data);
        setStats({ verifications: 0, certificates: 0, credits: data.credits || 0 });
      });
  }, []);

  const modules = [
    {
      title: 'KRA Solutions',
      description: 'Audit Core & Nil Return Node.',
      icon: ShieldCheck,
      href: `/${locale}/kra-solutions`,
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    },
    {
      title: 'PDF Suite',
      description: '88+ Professional WASM Tools.',
      icon: FileStack,
      href: `/${locale}/pdf-tools`,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 relative bg-black text-white">
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-0" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.15) 0%, transparent 70%)' }} />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60">
                <LayoutGrid size={14} className="text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Personal Command Center</span>
             </div>
             <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
               DASHBOARD.
             </h1>
             <p className="text-[#BEA0A0] text-xl font-bold uppercase tracking-wide">Secure Access Terminal</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
             <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Active Tier</div>
                <div className="text-2xl font-black italic uppercase text-red-500">{subscription?.subscriptionTier || 'FREE'}</div>
             </div>
             <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Available Credits</div>
                <div className="text-2xl font-black italic uppercase text-yellow-500">{stats.credits}</div>
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           {modules.map((m, i) => (
             <Link key={m.href} href={m.href}>
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-10 rounded-[3rem] border border-white/10 bg-white/5 hover:border-red-500/50 transition-all group relative overflow-hidden">
                  <div className={`p-6 rounded-3xl ${m.bg} ${m.color} inline-block mb-6`}>
                    <m.icon size={32} />
                  </div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{m.title}</h2>
                  <p className="text-[#BEA0A0] uppercase font-bold tracking-widest text-sm mb-10">{m.description}</p>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-red-500 transition-colors">
                     Enter System <ArrowRight size={14} />
                  </div>
               </motion.div>
             </Link>
           ))}
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 glass-panel p-10 rounded-[3rem] border border-white/10 bg-white/5">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Current Telemetry</h3>
                <Activity size={18} className="text-red-500 animate-pulse" />
             </div>
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-white/5 rounded-2xl border border-white/5 flex items-center px-6 justify-between opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <div className="w-32 h-2 bg-white/10 rounded" />
                    </div>
                    <div className="w-16 h-2 bg-white/10 rounded" />
                  </div>
                ))}
             </div>
           </div>
           
           <div className="glass-panel p-10 rounded-[3rem] border border-white/10 bg-white/5 flex flex-col justify-center items-center text-center">
              <Zap size={48} className="text-yellow-500 mb-6 animate-bounce" />
              <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4">Unlimited Access</h4>
              <p className="text-[#BEA0A0] text-[10px] font-black uppercase tracking-widest mb-8">Upgrade for unlimited KRA & PDF operations.</p>
              <Link href={`/${locale}/pricing`} className="w-full py-5 bg-white rounded-2xl text-black font-black uppercase tracking-widest italic hover:bg-red-500 hover:text-white transition-all text-xs">
                View Plans
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
