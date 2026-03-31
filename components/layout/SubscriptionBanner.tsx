'use client';

import { useState, useEffect } from 'react';
import { Timer, Zap, CreditCard, RefreshCw } from 'lucide-react';

export function SubscriptionBanner() {
  const [status, setStatus] = useState<any>(null);
  const [subscriptionTimeLeft, setSubscriptionTimeLeft] = useState<string | null>(null);
  const [refreshTimeLeft, setRefreshTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/user/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (e) {
        console.error('Failed to fetch user status:', e);
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Timer for Subscription duration
  useEffect(() => {
    if (!status?.subscriptionEnd && !status?.pdfPremiumEnd) {
      setSubscriptionTimeLeft(null);
      return;
    }

    const end = new Date(status.pdfPremiumEnd || status.subscriptionEnd).getTime();
    
    function updateSubscriptionTimer() {
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setSubscriptionTimeLeft(null);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        setSubscriptionTimeLeft(`${days}d ${hours % 24}h`);
      } else {
        setSubscriptionTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }

    updateSubscriptionTimer();
    const timer = setInterval(updateSubscriptionTimer, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // Timer for Credit Refresh (Midnight)
  useEffect(() => {
    if (!status?.usage?.nextRefresh) return;

    const refreshEnd = new Date(status.usage.nextRefresh).getTime();

    function updateRefreshTimer() {
      const now = new Date().getTime();
      const distance = refreshEnd - now;

      if (distance < 0) {
        setRefreshTimeLeft('Refreshing...');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setRefreshTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }

    updateRefreshTimer();
    const timer = setInterval(updateRefreshTimer, 1000);
    return () => clearInterval(timer);
  }, [status]);

  if (!status) return null;

  return (
    <div className="bg-[#F5C200] text-black py-1 px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[10px] font-black uppercase tracking-widest overflow-hidden relative group border-b border-black/10 z-[70]">
      <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      
      {/* Credits Section */}
      <div className="flex items-center gap-2 relative z-10">
        <CreditCard className="w-3 h-3" />
        <span>Remaining Credits: <span className="tabular-nums text-[11px] underline">
          {status.isCyberPro ? 'UNLIMITED' : status.usage?.remaining ?? 0}
        </span></span>
      </div>

      {/* Subscription Duration (Only if active) */}
      {subscriptionTimeLeft && (
        <div className="flex items-center gap-2 relative z-10 border-l border-black/20 pl-6">
          <Zap className="w-3 h-3 fill-current animate-pulse" />
          <span>{status.subscriptionTier?.replace('_', ' ')}: <span className="tabular-nums text-[10px]">{subscriptionTimeLeft}</span></span>
        </div>
      )}

      {/* Refresh Countdown */}
      {!status.isCyberPro && refreshTimeLeft && (
        <div className="flex items-center gap-2 relative z-10 border-l border-black/20 pl-6">
          <RefreshCw className="w-3 h-3" />
          <span>Next Refresh: <span className="tabular-nums text-[10px]">{refreshTimeLeft}</span></span>
        </div>
      )}

      {/* Admin Highlight */}
      {status.role === 'admin' && (
        <div className="flex items-center gap-2 relative z-10 border-l border-black/20 pl-6 text-red-700">
          <Zap className="w-3 h-3 fill-current" />
          <span>ADMIN ACCESS</span>
        </div>
      )}
    </div>
  );
}
