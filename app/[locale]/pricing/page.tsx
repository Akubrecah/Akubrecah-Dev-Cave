"use client";

import { useState, useEffect } from 'react';
import { Check, Zap, Clock, Timer, Flame, Star, Crown, Shield, Award, ChevronRight } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { TIERS, TierKey } from '@/lib/pricing';

// Countdown hook for active subscription
function useCountdown(targetDateStr: string | null | undefined) {
  const calculateTimeLeft = (targetStr: string | null | undefined) => {
    if (!targetStr) return null;
    const target = new Date(targetStr).getTime();
    const diff = target - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDateStr));

  useEffect(() => {
    // If target changed, sync immediately (once per change)
    const current = calculateTimeLeft(targetDateStr);
    setTimeLeft(current);

    if (!targetDateStr || (current && current.expired)) return;

    const id = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDateStr));
    }, 1000);
    
    return () => clearInterval(id);
  }, [targetDateStr]);

  return timeLeft;
}

const TIER_ICONS: Record<TierKey, React.ReactNode> = {
  mobile:       <Zap size={20} />,
  basic:        <Clock size={20} />,
  standard:     <Timer size={20} />,
  standard_plus:<Flame size={20} />,
  pro:          <Star size={20} />,
  pro_plus:     <Award size={20} />,
  premium:      <Crown size={20} />,
  premium_plus: <Shield size={20} />,
};

const TIER_FEATURES: Record<TierKey, string[]> = {
  mobile: [
    '1 KRA nil return filing',
    '30-minute access window',
    'Instant activation',
    'Digital receipt',
    'Secure data handling',
  ],
  basic: [
    '2 KRA nil return filings',
    '2-hour access window',
    'Instant activation',
    'Digital receipt',
    'Secure data handling',
  ],
  standard: [
    '3 KRA nil return filings',
    '6-hour access window',
    'Instant activation',
    'Digital receipt',
    'Filing history access',
    'Secure data handling',
  ],
  standard_plus: [
    '5 KRA nil return filings',
    '12-hour access window',
    'Instant activation',
    'Digital receipt',
    'Filing history access',
    'Secure data handling',
  ],
  pro: [
    'Up to 15 KRA nil return filings',
    '24-hour access window',
    'Instant activation',
    'Priority processing',
    'Digital receipt',
    'Filing history access',
  ],
  pro_plus: [
    'Unlimited KRA filings',
    '3-day access window',
    'Instant activation',
    'Priority processing',
    'Digital receipt',
    'Filing history access',
  ],
  premium: [
    'Unlimited KRA filings',
    '1-week access window',
    'Instant activation',
    'Priority processing',
    'Digital receipt',
    'Full filing history',
    'Auto-fill from history',
  ],
  premium_plus: [
    'Unlimited KRA filings',
    '1-month access window',
    'Instant activation',
    'Priority processing',
    'Digital receipt',
    'Full filing history',
    'Auto-fill from history',
    'Dedicated support',
  ],
};

// Which tier IDs are "highlighted"
const HIGHLIGHTED: TierKey[] = ['pro', 'premium_plus'];

const QUICK_ACCESS: TierKey[] = ['mobile', 'basic', 'standard', 'standard_plus', 'pro'];
const EXTENDED_ACCESS: TierKey[] = ['pro_plus', 'premium', 'premium_plus'];

function PlanCard({
  tierId,
  isActive,
  loadingPlan,
  onSubscribe,
}: {
  tierId: TierKey;
  isActive: boolean;
  loadingPlan: string | null;
  onSubscribe: (tier: TierKey) => void;
}) {
  const tier = TIERS[tierId];
  const isHighlighted = HIGHLIGHTED.includes(tierId);
  const isUnlimited = tier.filings >= 999999;

  return (
    <div className={`relative flex flex-col rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 border ${
      isHighlighted
        ? 'bg-gradient-to-b from-[hsl(var(--color-primary)/0.12)] to-[hsl(var(--color-card))] border-[hsl(var(--color-primary))] shadow-[0_0_40px_rgba(31,111,91,0.12)]'
        : 'bg-[hsl(var(--color-card))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))]/50'
    }`}>
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[hsl(var(--color-primary))] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isHighlighted ? 'bg-[hsl(var(--color-primary))] text-white' : 'bg-white/5 text-[hsl(var(--color-muted-foreground))]'
        }`}>
          {TIER_ICONS[tierId]}
        </div>
        <div>
          <h3 className="text-base font-black uppercase italic tracking-tighter leading-none">{tier.name}</h3>
          <p className="text-[10px] text-[hsl(var(--color-muted-foreground))] font-bold uppercase tracking-widest mt-0.5">{tier.description}</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-xs font-bold text-[hsl(var(--color-muted-foreground))]">KES</span>
        <span className="text-4xl font-black tracking-tighter">{tier.price}</span>
      </div>

      {/* Time + Filing badges */}
      <div className="flex items-center gap-2 mb-6">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--color-primary))]/10 border border-[hsl(var(--color-primary))]/20 text-[9px] font-black uppercase tracking-widest text-[hsl(var(--color-primary))]">
          <Clock size={9} /> {tier.label}
        </span>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
          isUnlimited
            ? 'bg-[hsl(var(--color-accent))]/10 border-[hsl(var(--color-accent))]/20 text-[hsl(var(--color-accent))]'
            : 'bg-white/5 border-white/10 text-[hsl(var(--color-muted-foreground))]'
        }`}>
          {isUnlimited ? '∞ Unlimited' : `${tier.filings} Filing${tier.filings > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-7 flex-grow">
        {TIER_FEATURES[tierId].map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-[hsl(var(--color-muted-foreground))]">
            <Check size={14} className={`mt-0.5 flex-shrink-0 ${isHighlighted ? 'text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-accent))]'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSubscribe(tierId)}
        disabled={loadingPlan === tierId || isActive}
        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-xs italic disabled:opacity-50 ${
          isHighlighted
            ? 'bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-hover))] shadow-lg'
            : 'border-2 border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))]'
        }`}
      >
        {loadingPlan === tierId ? 'Processing...' : isActive ? 'Plan Active' : (
          <>Get Started <ChevronRight size={14} /></>
        )}
      </button>
    </div>
  );
}

export default function Pricing() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/status')
      .then(res => res.json())
      .then(data => { setUserStatus(data); setStatusLoading(false); })
      .catch(() => setStatusLoading(false));
  }, []);

  const countdown = useCountdown(userStatus?.subscriptionEnd);

  const isActive =
    !statusLoading &&
    userStatus?.subscriptionStatus === 'active' &&
    userStatus?.subscriptionEnd &&
    new Date(userStatus.subscriptionEnd) > new Date();

  const handleSubscribe = async (tier: TierKey) => {
    if (isActive) return;
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/pricing');
      return;
    }
    setLoadingPlan(tier);
    router.push(`/checkout?tier=${tier}`);
  };

  return (
    <div className="flex flex-col min-h-screen text-[hsl(var(--color-foreground))] bg-[hsl(var(--color-background))]">
      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-12 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at center, hsla(var(--color-primary), 0.15) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Active plan banner */}
          {isActive && (
            <div className="mb-8 p-6 rounded-3xl bg-green-500/10 border border-green-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-center gap-3 text-green-500 mb-2">
                <Check className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-widest italic">
                  Active: {userStatus?.activeTier?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
                Your access expires when the timer runs out below.
              </p>
              {countdown && !countdown.expired && (
                <div className="flex justify-center gap-6 mb-6 font-mono">
                  {countdown.days > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-500">{countdown.days}</div>
                      <div className="text-[8px] text-white/30 uppercase">days</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-500">{countdown.hours}</div>
                    <div className="text-[8px] text-white/30 uppercase">hrs</div>
                  </div>
                  <div className="text-2xl font-black text-white/20">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-500">{String(countdown.minutes).padStart(2, '0')}</div>
                    <div className="text-[8px] text-white/30 uppercase">min</div>
                  </div>
                  <div className="text-2xl font-black text-white/20">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-400">{String(countdown.seconds).padStart(2, '0')}</div>
                    <div className="text-[8px] text-white/30 uppercase">sec</div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500/60">
                  {userStatus?.usage?.remaining >= 999999 ? 'Unlimited' : userStatus?.usage?.remaining} filings remaining
                </span>
                <span className="text-white/20">·</span>
                <button
                  onClick={() => router.push(`/${window.location.pathname.split('/')[1] || 'en'}/dashboard`)}
                  className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white underline transition-colors"
                >
                  Go to Dashboard →
                </button>
              </div>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter italic">
            Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))]">Plans.</span>
          </h1>
          <p className="text-base text-[hsl(var(--color-muted-foreground))] uppercase tracking-widest font-bold mb-2">
            Instant activation · Secure Paystack checkout · No hidden fees
          </p>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]/60 uppercase tracking-widest">
            Access expires automatically — no recurring charges
          </p>
        </div>
      </section>

      {/* Quick Access Plans */}
      <section className="py-6 px-4 sm:px-6 max-w-[1300px] mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--color-muted-foreground))]/40">Quick Access</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {QUICK_ACCESS.map((tierId) => (
            <PlanCard
              key={tierId}
              tierId={tierId}
              isActive={isActive}
              loadingPlan={loadingPlan}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      </section>

      {/* Extended Plans */}
      <section className="py-6 px-4 sm:px-6 max-w-[1300px] mx-auto w-full pb-20">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--color-muted-foreground))]/40">Extended Access</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXTENDED_ACCESS.map((tierId) => (
            <PlanCard
              key={tierId}
              tierId={tierId}
              isActive={isActive}
              loadingPlan={loadingPlan}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
