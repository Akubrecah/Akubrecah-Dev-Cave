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
          className="mb-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md text-white/90">
            <Sparkles className="h-4 w-4 text-[var(--color-brand-red)]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#BEA0A0]">KRA Solutions Suite</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-white leading-tight mb-6 sm:mb-8 tracking-tight">
            Tax
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-yellow)] ml-4">
              Services.
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-[600px] mx-auto leading-relaxed">
            Choose a service below to manage your compliance quickly and effortlessly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto px-4 items-stretch">
          {solutions.map((sol, idx) => {
            const Icon = sol.icon;
            return (
              <Link key={sol.id} href={sol.href} className="block h-full">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel p-8 sm:p-10 h-full flex flex-col border-white/10 hover:border-[var(--color-brand-red)] transition-all duration-500 group rounded-[2rem] bg-[#0a0a0a] shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-[var(--color-brand-red)]/5 blur-3xl rounded-full group-hover:bg-[var(--color-brand-red)]/10 transition-colors" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div>
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${sol.bg} mb-8 ${sol.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">{sol.title}</h3>
                      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">{sol.subtitle}</h2>
                      <p className="text-white/60 text-base leading-relaxed mb-10">{sol.description}</p>
                    </div>
                      
                    <div className="mt-auto inline-flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 text-white font-medium border border-white/10 group-hover:bg-[var(--color-brand-red)] group-hover:border-[var(--color-brand-red)] transition-all shadow-inner">
                      <span className="text-sm">Start Service</span>
                      <div className="bg-white/10 p-2 rounded-xl group-hover:bg-black/20 transition-colors">
                        <ArrowRight className="h-4 w-4 group-hover:-rotate-45 transition-transform" />
                      </div>
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
