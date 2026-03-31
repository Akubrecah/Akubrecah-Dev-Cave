"use client";

import { useState, useEffect } from 'react';
import { Check, Zap, Clock, Calendar, Star } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Live countdown hook
function useCountdown(targetDateStr: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; expired: boolean } | null>(null);

  useEffect(() => {
    if (!targetDateStr) { setTimeLeft(null); return; }
    const target = new Date(targetDateStr).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, expired: true }); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setTimeLeft({ days, hours, minutes, expired: false });
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [targetDateStr]);

  return timeLeft;
}

export default function Pricing() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Fetch current subscription status
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

  const handleSubscribe = async (tier: string) => {
    if (tier === 'enterprise') {
      router.push(`/${window.location.pathname.split('/')[1] || 'en'}/contact`);
      return;
    }
    
    if (isActive) return;

    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/pricing');
      return;
    }
    
    setLoadingPlan(tier);
    router.push(`/checkout?tier=${tier}`);
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for students and first-time filers',
      price: '50',
      period: 'nil return',
      icon: <Zap size={24} className="text-[var(--color-brand-yellow)]" />,
      features: [
        'Single nil return filing',
        'Basic email support',
        '24-hour processing',
        'Sign up required',
        'Digital receipt',
        'Secure data handling'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For regular filers who need more features',
      price: '100',
      period: 'multiple returns',
      icon: <Star size={24} className="text-white" />,
      highlight: true,
      features: [
        '10 multiple nil return filing',
        'Priority email support',
        'Sign up required',
        'Digital receipt',
        'Secure data handling',
        'Filing history access',
        'Auto-fill from previous returns'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for businesses',
      price: 'Contact Us',
      period: 'custom',
      icon: <Check size={24} className="text-[var(--color-brand-red)]" />,
      features: [
        'Unlimited nil return filing',
        'Unlimited actual tax returns filing',
        '24/7 priority support',
        'Instant processing',
        'Digital receipt',
        'Secure data handling',
        'Filing history access',
        'Auto-fill from previous returns',
        'Dedicated account manager',
        'Custom API integration',
        'Company and individual tax returns'
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen text-[hsl(var(--color-foreground))] bg-[hsl(var(--color-background))]">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, hsla(var(--color-primary), 0.15) 0%, transparent 70%)' }}></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          {isActive && (
            <div className="mb-8 p-6 rounded-3xl bg-green-500/10 border border-green-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-center gap-3 text-green-500 mb-2">
                <Check className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-widest italic">Plan Active: {userStatus?.activeTier?.toUpperCase()}</span>
              </div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">You have an active subscription. Payments are disabled until it expires.</p>
              
              {countdown && !countdown.expired && (
                <div className="flex justify-center gap-4 mb-6 font-mono">
                  <div className="text-center">
                    <div className="text-xl font-black text-green-500">{countdown.days}</div>
                    <div className="text-[8px] text-white/30 uppercase">days</div>
                  </div>
                  <div className="text-xl font-black text-white/20">:</div>
                  <div className="text-center">
                    <div className="text-xl font-black text-green-500">{countdown.hours}</div>
                    <div className="text-[8px] text-white/30 uppercase">hrs</div>
                  </div>
                  <div className="text-xl font-black text-white/20">:</div>
                  <div className="text-center">
                    <div className="text-xl font-black text-green-500">{countdown.minutes}</div>
                    <div className="text-[8px] text-white/30 uppercase">min</div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => router.push(`/${window.location.pathname.split('/')[1] || 'en'}/dashboard`)}
                className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-green-500 hover:text-white transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}
          <h1 className="text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter italic">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))]">Access.</span>
          </h1>
          <p className="text-xl text-[hsl(var(--color-muted-foreground))] uppercase tracking-widest font-bold">
            Instant activation. Secure Checkout via Paystack.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6 max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-[hsl(var(--color-card))] border rounded-[2.5rem] p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight 
                  ? 'border-[hsl(var(--color-primary))] shadow-[0_0_30px_rgba(31,111,91,0.1)] bg-gradient-to-b from-[hsl(var(--color-primary)/0.1)] to-[hsl(var(--color-card))]' 
                  : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))]/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.highlight ? 'bg-white/20' : 'bg-white/5'}`}>
                {plan.icon}
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">{plan.name}</h3>
              <p className="text-xs text-[hsl(var(--color-muted-foreground))] font-bold uppercase tracking-widest mb-6 min-h-[40px]">{plan.description}</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                {plan.price === 'Contact Us' ? (
                  <span className="text-3xl font-black">Contact Us</span>
                ) : (
                  <>
                    <span className="text-sm font-bold text-[hsl(var(--color-muted-foreground))]">KES</span>
                    <span className="text-5xl font-black text-[hsl(var(--color-foreground))] tracking-tighter">{plan.price}</span>
                    <span className="text-sm font-medium text-[hsl(var(--color-muted-foreground))] uppercase tracking-widest">/{plan.period}</span>
                  </>
                )}
              </div>
              
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#E8D5D5]">
                    <Check size={18} className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-white" : "text-[var(--color-brand-yellow)]"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan === plan.id || (isActive && plan.id !== 'enterprise')}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center disabled:opacity-50 text-sm italic ${
                  plan.highlight
                    ? 'bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-hover))] shadow-lg'
                    : 'border-2 border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))]'
                }`}
              >
                {loadingPlan === plan.id ? 'Processing...' : (isActive && plan.id !== 'enterprise' ? 'Plan Active' : (plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'))}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
