'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Settings, User, RefreshCw, Home, MessageSquare } from 'lucide-react';
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
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/admin/messages');
        if (res.ok) {
          const messages = await res.json();
          const count = messages.filter((m: any) => m.status === 'pending').length;
          setPendingCount(count);
        }
      } catch (e) {
        console.error('Failed to fetch pending count:', e);
      }
    };

    fetchPendingCount();
    // Poll every 5 minutes
    const interval = setInterval(fetchPendingCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-8 py-8 bg-transparent relative z-50 mt-4"
    >
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Command Center</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-brand-red)] animate-pulse shadow-[0_0_8px_rgba(227,6,19,0.8)]" />
            <p className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-[0.2em] opacity-80">System: Operational • Latency: 24ms</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar - SaaS Style */}
        <div className="relative group hidden xl:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-hover:text-[var(--color-brand-red)]" />
          <input
            type="text"
            placeholder="Search kernel operations..."
            className="w-80 pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] uppercase font-black focus:outline-none focus:border-[var(--color-brand-red)]/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-600 tracking-widest shadow-xl"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-3 py-1.5 glass-panel border border-white/10 rounded-[20px] shadow-2xl bg-white/5 backdrop-blur-md">
          <Link href={`/${locale}`}>
            <button 
              className="p-2.5 rounded-xl hover:bg-white/5 transition-all group"
              title="Switch to Home"
            >
              <Home className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </button>
          </Link>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <button 
            onClick={onRefresh}
            className="p-2.5 rounded-xl hover:bg-white/5 transition-all group"
            title="Refresh Operations"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 group-hover:text-white ${isSyncing ? 'animate-spin text-[var(--color-accent)]' : ''}`} />
          </button>

          <Link href={`/${locale}/admin/messages`}>
            <button className="p-2.5 rounded-xl hover:bg-white/5 transition-all group relative" title="Messages & Support">
              <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-white" />
              {pendingCount > 0 && (
                <div className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-[var(--color-brand-red)] flex items-center justify-center text-[8px] font-black text-white shadow-[0_0_10px_rgba(227,6,19,0.5)] border border-black">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </div>
              )}
            </button>
          </Link>

          <button className="p-2.5 rounded-xl hover:bg-white/5 transition-all group relative">
            <Bell className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        <div className="flex items-center gap-4 pl-4 border-l border-white/10 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white leading-none uppercase tracking-widest">Administrator</p>
            <p className="text-[9px] font-bold text-[var(--color-brand-red)] mt-1.5 uppercase tracking-widest opacity-80">Level 5 Clearance</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--color-brand-red)]/20 to-[var(--color-brand-crimson)]/20 border border-white/10 flex items-center justify-center p-2.5 shadow-xl group hover:border-[var(--color-brand-red)]/30 transition-all cursor-pointer">
            <User className="w-full h-full text-[var(--color-brand-red)] group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
