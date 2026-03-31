'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Zap, Clock, ShieldCheck, Star, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

interface UserStatus {
  isCyberPro: boolean;
  hasPdfPremium: boolean;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  usage: {
    remaining: number;
    limit: number;
    nextRefresh: string;
  };
}

export const UserCreditsIndicator = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const fetchStatus = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch('/api/user/status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch user status:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchStatus();
    // Poll every 2 minutes
    const interval = setInterval(fetchStatus, 120000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Timer logic
  useEffect(() => {
    if (!status) return;

    const timer = setInterval(() => {
      const target = status.isCyberPro && status.subscriptionEnd 
        ? new Date(status.subscriptionEnd) 
        : new Date(status.usage.nextRefresh);
      
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${pad(hours % 24)}h`);
      } else {
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  if (!isLoaded || !isSignedIn) return null;
  if (loading && !status) return (
    <div className="h-9 w-24 bg-white/5 animate-pulse rounded-full border border-white/10" />
  );
  if (!status) return null;

  return (
    <div className="flex items-center gap-2 group">
      {status.isCyberPro ? (
        <div className="flex flex-col items-end mr-1">
          <Link 
            href="/pricing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 font-bold text-xs shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all"
          >
            <Star size={12} className="fill-yellow-400" />
            <span className="uppercase tracking-widest">Premium</span>
          </Link>
          <span className="text-[10px] text-white/40 font-mono mt-0.5 flex items-center gap-1">
             <Clock size={8} /> {timeLeft} left
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-end mr-1">
          <Link 
            href="/pricing"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-medium"
          >
            <Zap size={12} className={status.usage.remaining > 0 ? "text-[var(--color-brand-red)] fill-[var(--color-brand-red)]/20" : "text-white/20"} />
            <span className="text-white/90">
              {status.usage.limit >= 999999 ? '∞' : `${status.usage.remaining} / ${status.usage.limit}`}
            </span>
            <span className="text-[10px] text-white/40 border-l border-white/10 pl-2 font-mono uppercase tracking-tighter">
              {status.usage.limit >= 999999 ? 'Unlimited' : 'Credits'}
            </span>
          </Link>
          <span className="text-[9px] text-white/30 font-mono mt-0.5 flex items-center gap-1 group-hover:text-[var(--color-brand-red)]/60 transition-colors">
            {status.usage.limit >= 999999 ? 'Privileged Node' : `Resets in ${timeLeft}`}
          </span>
        </div>
      )}
    </div>
  );
};
