"use client";

import { useState } from 'react';
import { Check, Zap, Clock, Calendar, Star } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Pricing() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/pricing');
      return;
    }
    
    setLoadingPlan(tier);
    router.push(`/checkout?tier=${tier}`);
  };

  const plans = [
    {
      id: 'hourly',
      name: '1 Hour Access',
      price: '10',
      period: 'hour',
      icon: <Clock size={24} className="text-[var(--color-brand-yellow)]" />,
      features: ['Full KRA Scans', 'PIN Certificates', '1-Hour Access']
    },
    {
      id: 'three_hour',
      name: '3 Hours Access',
      price: '20',
      period: '3 hours',
      icon: <Clock size={24} className="text-[var(--color-brand-yellow)]" />,
      features: ['Full KRA Scans', 'PIN Certificates', '3-Hour Access']
    },
    {
      id: 'daily',
      name: 'Daily Pro',
      price: '50',
      period: 'day',
      icon: <Zap size={24} className="text-[var(--color-brand-yellow)]" />,
      features: ['Full KRA Scans', 'PIN Certificates', '24-Hour Access']
    },
    {
      id: 'weekly',
      name: 'Weekly Pro',
      price: '250',
      period: 'week',
      icon: <Calendar size={24} className="text-[var(--color-brand-red)]" />,
      features: ['Unlimited Scans', 'Priority Verification', '7-Day Access']
    },
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: '800',
      period: 'month',
      icon: <Star size={24} className="text-white" />,
      highlight: true,
      features: ['Unlimited Everything', 'API Access', '30-Day Access', '24/7 Support']
    }
  ];

  return (
    <div className="flex flex-col min-h-screen text-white bg-black">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }}></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">Access.</span>
          </h1>
          <p className="text-xl text-[#E8D5D5]">
            Instant activation. Pay via M-Pesa.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6 max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-[#111111] border rounded-3xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight 
                  ? 'border-[var(--color-brand-red)] shadow-[0_0_30px_rgba(227,6,19,0.2)] bg-gradient-to-b from-[var(--color-brand-crimson)] to-[#111111]' 
                  : 'border-white/10 hover:border-[var(--color-brand-yellow)]/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.highlight ? 'bg-white/20' : 'bg-white/5'}`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black">{plan.price}</span>
                <span className="text-sm font-medium text-[#BEA0A0]">KES/{plan.id === 'three_hour' ? '3h' : plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#E8D5D5]">
                    <Check size={16} className={plan.highlight ? "text-white" : "text-[var(--color-brand-yellow)]"} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 text-sm ${
                  plan.highlight
                    ? 'bg-white text-[var(--color-brand-red)] hover:bg-[var(--color-brand-yellow)]'
                    : 'border-2 border-white/20 hover:border-[var(--color-brand-yellow)] hover:text-[var(--color-brand-yellow)]'
                }`}
              >
                {loadingPlan === plan.id ? 'Processing...' : 'Unlock Now'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
