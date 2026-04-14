'use client';

import { useState, useEffect, useRef } from 'react';
import { Timer, Zap } from 'lucide-react';

export function SubscriptionBanner() {
  const [status, setStatus] = useState<any>(null);
  const [subscriptionTimeLeft, setSubscriptionTimeLeft] = useState<string | null>(null);
  const [refreshTimeLeft, setRefreshTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/user/status', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });
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

  // Helper to format time distance
  const formatDistance = (distance: number) => {
    if (distance <= 0) return 'Expired';
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    if (days > 0) return `${days}d ${hours}h ${String(minutes).padStart(2,'0')}m`;
    return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  };

  // Timer for Subscription duration
  useEffect(() => {
    if (!status?.subscriptionEnd) {
      setTimeout(() => setSubscriptionTimeLeft(null), 0);
      return;
    }
    const subscriptionEnd = new Date(status.subscriptionEnd).getTime();
    
    const updateTimer = () => {
      setSubscriptionTimeLeft(formatDistance(subscriptionEnd - Date.now()));
    };
    
    setTimeout(updateTimer, 0);
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [status?.subscriptionEnd]);

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

    setTimeout(updateRefreshTimer, 0);
    const timer = setInterval(updateRefreshTimer, 1000);
    return () => clearInterval(timer);
  }, [status]);

  if (!status) return null;

  return (
    <div className="bg-[#F5C200] text-black py-1 px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[10px] font-black uppercase tracking-widest overflow-hidden relative group border-b border-black/10 z-[70]">
      <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      
      {/* Credits Section */}
      <div className="flex items-center gap-2 relative z-10">
        <Zap className="w-3 h-3 text-current" />
        <span>Remaining Filings: <span className="tabular-nums">
          {status.usage?.remaining >= 15 ? 'Unlimited' : status.usage?.remaining ?? 0}
        </span></span>
      </div>

      {/* Subscription Duration Countdown */}
      {subscriptionTimeLeft && (
        <div className="flex items-center gap-2 relative z-10 border-l border-black/20 pl-6">
          <Timer className="w-3 h-3 animate-pulse" />
          <span className="tabular-nums font-mono">{subscriptionTimeLeft}</span>
        </div>
      )}

      {/* Admin Toggle */}
      {status.role === 'admin' && (
        <div className="flex items-center gap-2 relative z-10 border-l border-black/20 pl-6 text-red-600 font-black">
          <span>ADMIN ACCESS</span>
        </div>
      )}
    </div>
  );
}
