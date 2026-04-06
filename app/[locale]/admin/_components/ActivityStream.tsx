'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, UserPlus, CreditCard, ShieldCheck, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ActivityType = 'user' | 'payment' | 'verification' | 'alert';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

const typeMap: Record<ActivityType, { icon: LucideIcon, color: string }> = {
  user: { icon: UserPlus, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  payment: { icon: CreditCard, color: 'text-primary bg-primary/10 border-primary/20' },
  verification: { icon: ShieldCheck, color: 'text-accent bg-accent/10 border-accent/20' },
  alert: { icon: Bell, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

export function ActivityStream({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="p-8 rounded-[40px] bg-background/40 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden min-h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-40">System Stream</h3>
          <p className="text-2xl font-bold text-white mt-1 tracking-tight">Real-time Activity</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false} mode="popLayout">
          {activities.map((item, idx) => {
            const config = typeMap[item.type];
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: idx * 0.05 }}
                className="group relative flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className={cn("p-3 rounded-2xl border", config.color)}>
                  <config.icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{item.title}</h4>
                  <p className="text-xs text-gray-500 font-medium">{item.description}</p>
                </div>
                
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {activities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 opacity-20">
          <ActivityStream.EmptyIcon className="w-12 h-12 mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest">Awaiting system events...</p>
        </div>
      )}
    </div>
  );
}

const EmptyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
EmptyIcon.displayName = 'ActivityStream.EmptyIcon';

ActivityStream.EmptyIcon = EmptyIcon;
