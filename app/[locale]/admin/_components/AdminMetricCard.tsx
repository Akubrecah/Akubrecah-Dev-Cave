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
  value: React.ReactNode;
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
      className="relative group p-6 rounded-[24px] bg-[#1a1a1a] border border-white/5 hover:border-[#F5C200]/30 transition-all duration-300 shadow-xl overflow-hidden flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
          <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums leading-none">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {value}
            </motion.span>
          </h3>
        </div>
        <div className="p-3 rounded-2xl bg-[#2a2a2a] border border-white/5 text-[#F5C200] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
        {subText ? (
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{subText}</span>
        ) : <div />}
        
        {trend && (
          <div className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider flex items-center gap-1.5 uppercase",
            trend === 'up' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            trend === 'down' && "bg-red-500/10 text-red-400 border border-red-500/20",
            trend === 'neutral' && "bg-white/5 text-gray-400 border border-white/10"
          )}>
            {trend === 'up' && <TrendingUp size={12} />}
            {trendValue}
          </div>
        )}
      </div>

      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5C200]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
}
