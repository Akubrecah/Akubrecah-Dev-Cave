"use client";

import { useState } from 'react';
import { Check, Zap, Building } from 'lucide-react';
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
    // Proceed to our custom checkout page setup for stripe
    router.push(`/checkout?tier=${tier}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }}></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">Pricing.</span>
          </h1>
          <p className="text-xl text-[#E8D5D5]">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6 max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1100px] mx-auto">
          
          {/* Card 0: KRA Pro Daily */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 flex flex-col hover:-translate-y-2 hover:border-[var(--color-brand-yellow)]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-white/5 text-white rounded-xl flex items-center justify-center mb-6">
              <Zap size={24} className="text-[var(--color-brand-yellow)]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Daily Pro</h3>
            <div className="text-5xl font-black text-white mb-8">
              100 <span className="text-lg font-medium text-[#BEA0A0]">KES/day</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3 text-[#E8D5D5]">
                <Check size={20} className="text-[var(--color-brand-yellow)]" /> Unlimited KRA Scans
              </li>
              <li className="flex items-center gap-3 text-[#E8D5D5]">
                <Check size={20} className="text-[var(--color-brand-yellow)]" /> Unlimited KRA PIN Certificates
              </li>
              <li className="flex items-center gap-3 text-[#E8D5D5]">
                <Check size={20} className="text-[var(--color-brand-yellow)]" /> instant Verification
              </li>
              <li className="flex items-center gap-3 text-[#E8D5D5]">
                <Check size={20} className="text-[var(--color-brand-yellow)]" /> 24-Hour Full Access
              </li>
            </ul>
            
            <button 
              onClick={() => handleSubscribe('daily')}
              disabled={loadingPlan === 'daily'}
              className="w-full py-4 rounded-xl border-2 border-white/20 text-white font-bold hover:border-[var(--color-brand-yellow)] hover:text-[var(--color-brand-yellow)] transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loadingPlan === 'daily' ? 'Processing...' : 'Subscribe Daily'}
            </button>
          </div>

          {/* Card 1: KRA Pro Weekly */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 flex flex-col hover:-translate-y-2 hover:border-[var(--color-brand-red)]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-white/5 text-white rounded-xl flex items-center justify-center mb-6">
              <Building size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Weekly Pro</h3>
            <div className="text-5xl font-black text-white mb-8">
              500 <span className="text-lg font-medium text-[#BEA0A0]">KES/week</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3 text-[#E8D5D5]">
                <Check size={20} className="text-[var(--color-brand-red)]" /> Unlimited KRA Scans
              </li>
              <li className="flex items-center gap-3 text-[#E8D5D5]">
                <Check size={20} className="text-[var(--color-brand-red)]" /> Unlimited KRA PIN Certificates
              </li>
              <li className="flex items-center gap-3 text-[#E8D5D5]">
                <Check size={20} className="text-[var(--color-brand-red)]" /> High-Speed Verification
              </li>
              <li className="flex items-center gap-3 text-[#E8D5D5]">
                <Check size={20} className="text-[var(--color-brand-red)]" /> 7-Day Full Access
              </li>
            </ul>
            
            <button 
              onClick={() => handleSubscribe('weekly')}
              disabled={loadingPlan === 'weekly'}
              className="w-full py-4 rounded-xl border-2 border-white/20 text-white font-bold hover:border-[var(--color-brand-red)] hover:text-[var(--color-brand-red)] transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loadingPlan === 'weekly' ? 'Processing...' : 'Subscribe Weekly'}
            </button>
          </div>

          {/* Card 2: KRA Pro Monthly */}
          <div className="bg-gradient-to-b from-[var(--color-brand-crimson)] to-[#111111] border border-[var(--color-brand-red)] rounded-3xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(227,6,19,0.2)]">
            <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md">
              Best Value
            </div>
            <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Monthly Pro</h3>
            <div className="text-5xl font-black text-white mb-8">
              1,500 <span className="text-lg font-medium text-white/70">KES/month</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3 text-white">
                <Check size={20} className="text-[#F5C200]" /> Unlimited KRA Scans
              </li>
              <li className="flex items-center gap-3 text-white">
                <Check size={20} className="text-[#F5C200]" /> Unlimited KRA PIN Certificates
              </li>
              <li className="flex items-center gap-3 text-white">
                <Check size={20} className="text-[#F5C200]" /> Priority Support
              </li>
              <li className="flex items-center gap-3 text-white">
                <Check size={20} className="text-[#F5C200]" /> API Integration Access
              </li>
              <li className="flex items-center gap-3 text-white">
                <Check size={20} className="text-[#F5C200]" /> 30-Day Full Access
              </li>
            </ul>
            
            <button 
              onClick={() => handleSubscribe('monthly')}
              disabled={loadingPlan === 'monthly'}
              className="w-full py-4 rounded-xl bg-white text-[var(--color-brand-red)] font-bold hover:bg-[#F5C200] transition-colors disabled:opacity-50"
            >
              {loadingPlan === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
