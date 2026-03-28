'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Settings, User, RefreshCw, Home } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  isSyncing?: boolean;
}

export function AdminHeader({ title, subtitle, onRefresh, isSyncing }: AdminHeaderProps) {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between p-8 bg-transparent"
    >
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase italic">Ops Intelligence</h1>
        <p className="text-xs font-bold text-primary opacity-60 uppercase tracking-[0.3em] mt-2 ml-1">System Overlord</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar - Premium Style */}
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-hover:text-primary" />
          <input
            type="text"
            placeholder="LATENT DATA SEARCH..."
            className="w-80 pl-12 pr-4 py-3 bg-background/60 backdrop-blur-3xl border border-white/10 rounded-2xl text-[10px] font-black tracking-[0.1em] focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-700 placeholder:uppercase"
          />
        </div>

        {/* Action Buttons */}
        <Link href={`/${locale}`}>
          <button 
            className="p-3 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all group"
            title="Switch to Home"
          >
            <Home className="w-5 h-5 text-gray-400 group-hover:text-primary transition-all" />
          </button>
        </Link>

        <button 
          onClick={onRefresh}
          className="p-3 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all group"
          title="Refresh Operations"
        >
          <RefreshCw className={`w-5 h-5 text-gray-400 group-hover:text-primary transition-all ${isSyncing ? 'animate-spin text-primary' : ''}`} />
        </button>

        <button className="p-3 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 hover:bg-white/5 transition-all group relative">
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-all" />
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse border-2 border-background" />
        </button>

        <div className="flex items-center gap-3 p-1.5 pl-4 rounded-3xl bg-background/40 backdrop-blur-xl border border-white/10">
          <div className="text-right">
            <p className="text-xs font-bold text-white leading-none">Admin</p>
            <p className="text-[10px] font-bold text-primary opacity-60 mt-1 uppercase tracking-widest">Active</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/30 to-accent-foreground/30 border border-white/10 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
