'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Zap, Clock, ShieldCheck, Star, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

interface UserStatus {
  isPremiumUser: boolean;
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
      const target = status.isPremiumUser && status.subscriptionEnd 
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
    <div className="h-9 w-24 bg-black/5 animate-pulse rounded-full border border-black/10" />
  );
  if (!status) return null;

  return (
    <div className="flex items-center gap-2 group">
      {status.isPremiumUser ? (
        <div className="flex flex-col items-end mr-1">
          <Link 
            href="/pricing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F6F5B] text-white font-black text-[10px] shadow-sm hover:shadow-md transition-all uppercase tracking-widest italic"
          >
            <Star size={10} className="fill-[#F2E600] text-[#F2E600]" />
            <span>Premium</span>
          </Link>
          <span className="text-[10px] text-[#2E8B75] font-mono mt-0.5 flex items-center gap-1">
             <Clock size={8} /> {timeLeft} left
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-end mr-1">
          <Link 
            href="/pricing"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E5E7EB] border border-[#D1D5DB] hover:bg-[#D1D5DB] transition-all text-xs font-medium"
          >
            <Zap size={12} className={status.usage.remaining > 0 ? "text-[#1F6F5B] fill-[#1F6F5B]/20" : "text-[#D1D5DB]"} />
            <span className="text-[#2B2B2B]">
              {status.usage.limit >= 999999 ? '∞' : `${status.usage.remaining} / ${status.usage.limit}`}
            </span>
            <span className="text-[10px] text-[#2E8B75] border-l border-[#D1D5DB] pl-2 font-mono uppercase tracking-tighter">
              {status.usage.limit >= 999999 ? 'Unlimited' : 'Credits'}
            </span>
          </Link>
          <span className="text-[9px] text-[#2E8B75] font-mono mt-0.5 flex items-center gap-1 group-hover:text-[#1F6F5B] transition-colors">
            {status.usage.limit >= 999999 ? 'Enterprise Tier' : `Resets in ${timeLeft}`}
          </span>
        </div>
      )}
    </div>
  );
};
