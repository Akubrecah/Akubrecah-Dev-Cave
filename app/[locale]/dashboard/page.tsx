'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileStack, LayoutGrid, ArrowRight, Zap, Activity, Clock, Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Live countdown hook
function useCountdown(targetDateStr: string | null | undefined) {
  const calculateTimeLeft = (targetStr: string | null | undefined) => {
    if (!targetStr) return null;
    const target = new Date(targetStr).getTime();
    const diff = target - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDateStr));
  const [prevTarget, setPrevTarget] = useState(targetDateStr);

  if (targetDateStr !== prevTarget) {
    setPrevTarget(targetDateStr);
    setTimeLeft(calculateTimeLeft(targetDateStr));
  }

  useEffect(() => {
    if (!targetDateStr || (timeLeft && timeLeft.expired)) return;

    const id = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDateStr));
    }, 1000);
    
    return () => clearInterval(id);
  }, [targetDateStr, timeLeft?.expired]);

  return timeLeft;
}

export default function UserDashboard() {
  const params = useParams();
  const locale = params.locale as string;
  const [subscription, setSubscription] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    // Add cache buster to status check
    fetch(`/api/user/status?t=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => setSubscription(data))
      .catch((err) => console.error('[DASHBOARD] status fetch failed', err));
    
    fetch('/api/user/certificates', {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => setCerts(Array.isArray(data) ? data : []))
      .catch((err) => console.error('[DASHBOARD] certificates fetch failed', err));
  }, []);

  const countdown = useCountdown(subscription?.subscriptionEnd);

  const modules = [
    {
      title: 'KRA Solutions',
      description: 'KRA PIN & Nil Return Services.',
      icon: ShieldCheck,
      href: `/${locale}/kra-solutions`,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
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

  const tierLabel = (subscription?.activeTier || 'free').toUpperCase();
  const isActive = subscription?.subscriptionStatus === 'active';
  const credits = subscription?.usage?.remaining ?? 0;
  const dailyLimit = subscription?.usage?.limit ?? 0;

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 relative bg-black text-white">
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-0"
           style={{ background: 'radial-gradient(ellipse at center, rgba(31, 111, 91, 0.15) 0%, transparent 70%)' }} />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60">
              <LayoutGrid size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Personal Command Center</span>
            </div>
            <div className="flex items-center gap-6">
               <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">DASHBOARD.</h1>
               <Link 
                 href={`/${locale}/profile`}
                 className="p-4 rounded-3xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all group"
                 title="Preferences & Theme"
               >
                 <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
               </Link>
            </div>
            <p className="text-[#BEA0A0] text-xl font-bold uppercase tracking-wide">Secure Access Terminal</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-auto">
            {/* Active Tier */}
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Active Tier</div>
              <div className={`text-2xl font-black italic uppercase ${isActive ? 'text-emerald-500' : 'text-white/40'}`}>
                {tierLabel}
              </div>
              {isActive && (
                <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-green-500/70">● Active</div>
              )}
            </div>

            {/* Daily Credits */}
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Credits Today</div>
              <div className="text-2xl font-black italic uppercase text-yellow-500">
                {dailyLimit >= 999999 ? '∞' : `${credits}/${dailyLimit}`}
              </div>
            </div>

            {/* Countdown */}
            <div className="col-span-2 lg:col-span-1 p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                <Clock size={12} /> Expires In
              </div>
              {!subscription ? (
                <div className="text-white/20 text-sm font-mono animate-pulse">Loading...</div>
              ) : countdown && !countdown.expired ? (
                <div className="flex gap-3 font-mono">
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-500">{countdown.days}</div>
                    <div className="text-[9px] text-white/30 uppercase">days</div>
                  </div>
                  <div className="text-2xl font-black text-white/20">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-500">{countdown.hours}</div>
                    <div className="text-[9px] text-white/30 uppercase">hrs</div>
                  </div>
                  <div className="text-2xl font-black text-white/20">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-500">{countdown.minutes}</div>
                    <div className="text-[9px] text-white/30 uppercase">min</div>
                  </div>
                  <div className="text-2xl font-black text-white/20">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-500">{countdown.seconds}</div>
                    <div className="text-[9px] text-white/30 uppercase">sec</div>
                  </div>
                </div>
              ) : countdown?.expired ? (
                <div className="text-[10px] font-black uppercase text-emerald-500/70 tracking-widest">Expired</div>
              ) : (
                <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">No Active Plan</div>
              )}
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {modules.map((m, i) => (
            <Link key={m.href} href={m.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-10 rounded-[3rem] border border-white/10 bg-white/5 hover:border-emerald-500/50 transition-all group relative overflow-hidden"
              >
                <div className={`p-6 rounded-3xl ${m.bg} ${m.color} inline-block mb-6`}>
                  <m.icon size={32} />
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{m.title}</h2>
                <p className="text-[#BEA0A0] uppercase font-bold tracking-widest text-sm mb-10">{m.description}</p>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-emerald-500 transition-colors">
                  Enter System <ArrowRight size={14} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-panel p-10 rounded-[3rem] border border-white/10 bg-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Identity Archive</h3>
              <Activity size={18} className="text-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              {certs.length > 0 ? certs.slice(0, 5).map(cert => (
                <div key={cert.id} className="h-16 bg-white/5 rounded-2xl border border-white/5 flex items-center px-8 justify-between hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(31,111,91,0.5)]" />
                    <div>
                      <div className="text-xs font-black text-white uppercase italic tracking-tighter">{cert.taxpayerName}</div>
                      <div className="text-[10px] text-white/40 font-mono uppercase">{cert.kraPin}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <span className="text-[9px] font-mono text-white/20 hidden md:block">{new Date(cert.createdAt).toLocaleDateString()}</span>
                     <a 
                       href={`/api/user/certificates/${cert.id}/download`} 
                       className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-emerald-500 hover:border-emerald-500/50 transition-all"
                       download
                     >
                       <ArrowRight size={14} />
                     </a>
                  </div>
                </div>
              )) : (
                <div className="h-40 flex flex-col items-center justify-center text-center opacity-20">
                  <div className="w-12 h-px bg-white mb-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Historical Data Found</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-10 rounded-[3rem] border border-white/10 bg-white/5 flex flex-col justify-center items-center text-center">
            <Zap size={48} className="text-yellow-500 mb-6 animate-bounce" />
            <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4">
              {isActive ? 'Plan Active' : 'Unlock More'}
            </h4>
            <p className="text-[#BEA0A0] text-[10px] font-black uppercase tracking-widest mb-8">
              {isActive ? `${tierLabel} plan is running. Upgrade anytime.` : 'Upgrade for unlimited KRA & PDF operations.'}
            </p>
            <Link
              href={isActive ? '#' : `/${locale}/pricing`}
              aria-disabled={isActive}
              className={`w-full py-5 rounded-2xl text-black font-black uppercase tracking-widest italic text-xs transition-all ${
                isActive
                  ? 'bg-white/10 text-white/40 cursor-not-allowed pointer-events-none'
                  : 'bg-white hover:bg-emerald-500 hover:text-white'
              }`}
            >
              {isActive ? 'Plan Active' : 'View Plans'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
