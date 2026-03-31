'use client';

import React from 'react';
import { NilReturnForm } from '@/components/kra/NilReturnForm';
import { Activity, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function NilReturnPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 font-sans relative bg-black text-white">
      {/* Background Glows */}
      <div className="absolute top-[-200px] right-1/4 translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(30, 60, 220, 0.2) 0%, transparent 70%)' }} />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-12">
          <button 
            onClick={() => router.push(`/${locale}/kra-solutions`)}
            className="inline-flex items-center gap-2 text-[#BEA0A0] hover:text-[var(--color-brand-red)] transition-colors group text-sm font-black uppercase tracking-widest mb-6"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Solutions
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-sm text-white/90">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">KRA Filing Node 02</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight flex items-center gap-6 italic tracking-tighter uppercase">
                <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10 shadow-2xl shadow-blue-500/10">
                  <Activity className="text-yellow-500" size={40} />
                </div>
                Filing Node.
              </h1>
            </div>

            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md max-w-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Link Established</span>
              </div>
              <p className="text-xs text-[#BEA0A0] leading-relaxed font-bold uppercase tracking-wide">
                Direct synchronization with KRA iTax databases active. Interactive step-by-step filing initialized.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto">
          <NilReturnForm />
        </div>
      </div>
    </div>
  );
}
