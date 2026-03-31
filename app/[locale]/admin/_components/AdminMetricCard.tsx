'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subText?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  index?: number;
}

export function AdminMetricCard({ 
  label, 
  value, 
  subText, 
  icon: Icon, 
  trend, 
  trendValue,
  index = 0 
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 100 }}
      className="relative group p-8 rounded-[32px] glass-panel border border-white/10 hover:border-[var(--color-brand-red)]/30 transition-all duration-300 shadow-2xl overflow-hidden flex flex-col"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest opacity-80">{label}</p>
          <h3 className="text-5xl font-black text-white tracking-tighter tabular-nums leading-none">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {value}
            </motion.span>
          </h3>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[var(--color-brand-red)] group-hover:bg-[var(--color-brand-red)]/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
        {subText ? (
          <span className="text-[10px] font-bold text-[#BEA0A0] uppercase tracking-tighter opacity-60">{subText}</span>
        ) : <div />}
        
        {trend && (
          <div className={cn(
            "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 uppercase",
            trend === 'up' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
            trend === 'down' && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
            trend === 'neutral' && "bg-white/5 text-gray-400 border border-white/10"
          )}>
            {trend === 'up' && <TrendingUp size={14} strokeWidth={3} />}
            {trendValue}
          </div>
        )}
      </div>

      {/* Subtle corner accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-red)]/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
}
