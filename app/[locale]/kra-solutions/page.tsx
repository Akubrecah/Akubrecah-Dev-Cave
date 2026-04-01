'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck2, Activity, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function KraSolutionsHub() {
  const params = useParams();
  const locale = params.locale as string;

  const solutions = [
    {
      id: 'audit-core',
      title: 'PIN Services',
      subtitle: 'PIN Certificate',
      description: 'Quick KRA PIN verification and professional certificate retrieval.',
      icon: FileCheck2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      href: `/${locale}/kra-solutions/audit-core`
    },
    {
      id: 'nil-return',
      title: 'Filing Services',
      subtitle: 'Nil Return',
      description: 'Simple step-by-step filing for taxpayers with zero income.',
      icon: Activity,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      href: `/${locale}/kra-solutions/nil-return`
    }
  ];

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6 font-sans relative overflow-hidden bg-black text-white">
      {/* Background Glows */}
      <div className="absolute top-[-200px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }} />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md text-white/90">
            <Sparkles className="h-4 w-4 text-[var(--color-brand-red)]" />
            <span className="text-xs font-black uppercase tracking-widest italic">KRA Solutions Suite</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.85] mb-6 sm:mb-8 tracking-tighter italic uppercase">
            Tax <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">
              Services.
            </span>
          </h1>
          <p className="text-xl text-[#BEA0A0] max-w-[600px] mx-auto leading-relaxed font-bold uppercase tracking-wide">
            Choose a service below to manage your KRA compliance quickly and easily.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {solutions.map((sol, idx) => {
            const Icon = sol.icon;
            return (
              <Link key={sol.id} href={sol.href}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel p-8 sm:p-12 cursor-pointer border-white/10 hover:border-[var(--color-brand-red)] transition-all duration-500 group rounded-[2rem] sm:rounded-[3rem] bg-[#0a0a0a] shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-[var(--color-brand-red)]/5 blur-3xl rounded-full group-hover:bg-[var(--color-brand-red)]/10 transition-colors" />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${sol.bg} mb-8 ${sol.color} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                      <Icon className="h-10 w-10" />
                    </div>
                    <h3 className="text-sm font-black text-white/30 uppercase tracking-[.4em] mb-2">{sol.title}</h3>
                    <h2 className="text-4xl font-black text-white mb-6 italic tracking-tighter uppercase">{sol.subtitle}</h2>
                    <p className="text-[#BEA0A0] text-sm leading-relaxed mb-10 uppercase tracking-widest font-bold">{sol.description}</p>
                    <div className="inline-flex items-center justify-center gap-4 px-10 py-5 rounded-3xl bg-white/5 text-white font-black uppercase tracking-[0.2em] border border-white/5 group-hover:bg-[var(--color-brand-red)] transition-all">
                      Start Now <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
