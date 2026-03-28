'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
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
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative group p-6 rounded-[32px] bg-background/60 backdrop-blur-3xl border border-white/10 shadow-xl overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-primary group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
        
        {trend && (
          <div className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight border flex items-center gap-1",
            trend === 'up' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            trend === 'down' && "bg-red-500/10 text-red-400 border-red-500/20",
            trend === 'neutral' && "bg-gray-500/10 text-gray-400 border-gray-500/20"
          )}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums leading-none">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {value}
          </motion.span>
        </h3>
        <p className="text-[10px] font-bold text-primary opacity-50 uppercase tracking-[0.2em]">{label}</p>
      </div>

      {subText && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-medium text-gray-500 italic">{subText}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}
