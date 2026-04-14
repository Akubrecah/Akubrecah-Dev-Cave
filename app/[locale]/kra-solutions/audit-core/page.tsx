'use client';

import React, { useState, useEffect } from 'react';
import { AuditCore } from '@/components/kra/AuditCore';
import { ShieldCheck, ArrowLeft, FileText, Coins, CheckCircle2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function AuditCorePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [stats, setStats] = useState({ verifications: 0, certificates: 0, credits: 5 });
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user/status', {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        setSubscription(data);
        setStats(prev => ({ ...prev, credits: data.credits ?? prev.credits }));
      })
      .catch((err) => console.error('[AUDIT CORE] status fetch failed', err));
  }, []);

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6 font-sans relative bg-black text-white">
      {/* Background Glows */}
      <div className="absolute top-[-200px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }} />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-4">
            <button 
              onClick={() => router.push(`/${locale}/kra-solutions`)}
              className="inline-flex items-center gap-2 text-[#BEA0A0] hover:text-[var(--color-brand-red)] transition-colors group text-sm font-black uppercase tracking-widest"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Solutions
            </button>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight flex items-center gap-4 sm:gap-6 uppercase">
              <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10 shadow-2xl shadow-red-500/10">
                <ShieldCheck className="text-[var(--color-brand-red)]" size={40} />
              </div>
              Get Certificate
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-md">
            <div className="px-5 py-2 flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-xl text-green-500"><CheckCircle2 size={18} /></div>
              <div>
                <div className="text-sm font-black text-white leading-none mb-1">{stats.verifications}</div>
                <div className="text-[10px] text-[#BEA0A0]/70 uppercase tracking-widest font-black">Checks</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div className="px-5 py-2 flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl text-blue-500"><FileText size={18} /></div>
              <div>
                <div className="text-sm font-black text-white leading-none mb-1">{stats.certificates}</div>
                <div className="text-[10px] text-[#BEA0A0]/70 uppercase tracking-widest font-black">Cert Log</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div className="px-5 py-2 flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-xl text-yellow-500"><Coins size={18} /></div>
              <div>
                <div className="text-sm font-black text-white leading-none mb-1">{stats.credits}</div>
                <div className="text-[10px] text-[#BEA0A0]/70 uppercase tracking-widest font-black">Credits</div>
              </div>
            </div>
          </div>
        </div>

        <AuditCore stats={stats} setStats={setStats} subscription={subscription} />
      </div>
    </div>
  );
}
