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
    if (tier === 'enterprise') {
      router.push(`/${window.location.pathname.split('/')[1] || 'en'}/contact`);
      return;
    }
    
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-[#111111] border rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight 
                  ? 'border-[var(--color-brand-red)] shadow-[0_0_30px_rgba(227,6,19,0.2)] bg-gradient-to-b from-[var(--color-brand-crimson)] to-[#111111]' 
                  : 'border-white/10 hover:border-[var(--color-brand-yellow)]/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.highlight ? 'bg-white/20' : 'bg-white/5'}`}>
                {plan.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-[#BEA0A0] mb-6 min-h-[40px]">{plan.description}</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                {plan.price === 'Contact Us' ? (
                  <span className="text-3xl font-black">Contact Us</span>
                ) : (
                  <>
                    <span className="text-sm font-bold text-[#BEA0A0]">KES</span>
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-sm font-medium text-[#BEA0A0]">/{plan.period}</span>
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
                disabled={loadingPlan === plan.id}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 text-base ${
                  plan.highlight
                    ? 'bg-white text-[var(--color-brand-red)] hover:bg-[var(--color-brand-yellow)]'
                    : 'border-2 border-white/20 hover:border-[var(--color-brand-yellow)] hover:text-[var(--color-brand-yellow)]'
                }`}
              >
                {loadingPlan === plan.id ? 'Processing...' : (plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started')}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
