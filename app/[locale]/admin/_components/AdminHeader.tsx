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
      className="flex items-center justify-between px-8 py-6 bg-transparent"
    >
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Dashboard</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-[#F5C200] animate-pulse" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Status: Optimal</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar - SaaS Style */}
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 transition-colors group-hover:text-[#F5C200]" />
          <input
            type="text"
            placeholder="Search operations..."
            className="w-72 pl-11 pr-4 py-2 bg-[#1a1a1a] border border-white/5 rounded-xl text-xs font-bold focus:outline-none focus:border-[#F5C200]/50 transition-all placeholder:text-gray-700"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-2 py-1 bg-[#1a1a1a] border border-white/5 rounded-2xl">
          <Link href={`/${locale}`}>
            <button 
              className="p-2 rounded-xl hover:bg-white/5 transition-all group"
              title="Switch to Home"
            >
              <Home className="w-4 h-4 text-gray-500 group-hover:text-white" />
            </button>
          </Link>

          <div className="w-px h-4 bg-white/5 mx-1" />

          <button 
            onClick={onRefresh}
            className="p-2 rounded-xl hover:bg-white/5 transition-all group"
            title="Refresh Operations"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 group-hover:text-white ${isSyncing ? 'animate-spin text-[#F5C200]' : ''}`} />
          </button>

          <button className="p-2 rounded-xl hover:bg-white/5 transition-all group relative">
            <Bell className="w-4 h-4 text-gray-500 group-hover:text-white" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F5C200] border border-[#1a1a1a]" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white leading-none uppercase tracking-tighter">Administrator</p>
            <p className="text-[9px] font-bold text-[#F5C200] mt-1 uppercase tracking-widest opacity-80">Superuser</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5C200]/20 to-accent-foreground/20 border border-white/5 flex items-center justify-center p-2">
            <User className="w-full h-full text-[#F5C200]" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
