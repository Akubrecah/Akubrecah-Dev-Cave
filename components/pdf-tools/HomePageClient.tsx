'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { ArrowRight, Search, ShieldCheck, Zap, Sparkles, CheckCircle2, Clock, FileCheck, Users, Lock, Globe } from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { type Locale } from '@/lib/i18n/config';

interface HomePageClientProps {
  locale: Locale;
  localizedToolContent?: Record<string, { title: string; description: string }>;
}

export default function HomePageClient({ locale }: HomePageClientProps) {
  const { isSignedIn } = useAuth();

  // KRA Features
  const features = [
    {
      icon: ShieldCheck,
      title: 'Instant Verification',
      description: 'Verify any KRA PIN in seconds. Get taxpayer name, obligation type, and compliance status instantly.',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Direct integration with KRA systems. Get real-time results with automatic retry and failover.',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    {
      icon: Lock,
      title: '100% Secure',
      description: 'Bank-grade encryption. Your queries are private and never stored on our servers.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
  ];

  // How it works steps
  const steps = [
    {
      number: '01',
      title: 'Enter KRA PIN or ID Number',
      description: 'Input the KRA PIN directly, or search by National ID, Passport, or Company Registration number.',
      icon: Search
    },
    {
      number: '02',
      title: 'Instant Verification',
      description: 'Our system connects directly to KRA and retrieves the taxpayer details in real-time.',
      icon: Clock
    },
    {
      number: '03',
      title: 'Get Results',
      description: 'View the taxpayer name, PIN, obligation type, and current compliance status immediately.',
      icon: FileCheck
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section - KRA Focused */}
      <section className="relative min-h-[95vh] flex items-center py-24 overflow-hidden bg-black">
        {/* Glow Effects */}
        <div className="absolute top-[-200px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }} aria-hidden="true"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[80%] pointer-events-none opacity-40"
             style={{ background: 'radial-gradient(ellipse at center, rgba(30, 60, 220, 0.2) 0%, transparent 60%)' }} aria-hidden="true"></div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          
          <div className="hero-text text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[var(--color-brand-red)]" aria-hidden="true" />
              <span className="text-sm font-medium text-white">
                Powered by Akubrecah Technologies
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-8 tracking-tight">
              KRA PIN{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">
                Checker Pro
              </span>
            </h1>
            <p className="text-xl text-[#E8D5D5] mb-12 max-w-[550px] leading-relaxed font-sans">
              Instantly verify KRA PINs and taxpayer details. Check compliance status, get taxpayer names, and verify obligation types — all in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={isSignedIn ? `/${locale}/dashboard` : `/${locale}/sign-in`} className="btn-primary text-base px-8 py-4 flex items-center justify-center gap-2 group">
                <Search size={20} /> Verify KRA PIN <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={`/${locale}/pricing`} className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold tracking-wide text-white bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                View Plans
              </Link>
            </div>
          </div>

          {/* KRA Verification Preview */}
          <div className="relative rounded-3xl border border-white/10 overflow-hidden group h-[500px] lg:h-[600px]" 
               style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #111111 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-red)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-6 left-6 bg-[var(--color-brand-red)]/20 text-[var(--color-brand-red)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-brand-red)]/30 backdrop-blur-md">
              KRA Compliance System
            </div>
            <div className="h-full flex items-center justify-center p-8">
               <div className="glass-panel p-8 w-full max-w-[380px] border border-white/10 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500 space-y-6"
                    style={{ background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(20px)' }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                       <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                       Live Gateway
                    </div>
                    <span className="text-[#34D399] font-medium bg-[#10B981]/10 px-2 py-1 rounded-md text-xs border border-[#10B981]/20">Valid PIN</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wider mb-1">PIN Number</div>
                      <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Taxpayer Name</div>
                      <div className="h-5 w-full bg-white/10 rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Obligation</div>
                      <div className="h-5 w-1/2 bg-white/10 rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Status</div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-green-400 text-sm font-medium">Active & Compliant</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#6A0808]/20 py-6 overflow-hidden border-y border-white/10 backdrop-blur-sm" aria-label="Feature highlight marquee">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap items-center" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
             <React.Fragment key={i}>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Verify KRA PINs</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Check Compliance</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Taxpayer Lookup</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Instant Results</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">100% Secure</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
             </React.Fragment>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />

      {/* Features Section */}
      <section className="py-24 px-6 bg-[#0a0a0a]" aria-label="Features">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Why KRA PIN Checker Pro?
              </h2>
              <p className="text-[#E8D5D5]/70 max-w-2xl mx-auto text-lg font-sans">
                The most reliable way to verify KRA PINs and taxpayer compliance in Kenya.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="p-8 glass-panel border-white/10 hover:border-[var(--color-brand-red)] transition-all duration-500">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bg} mb-6 ${feature.color}`}>
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-[#E8D5D5]/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-[#111111]" aria-labelledby="how-it-works-heading">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-16">
            <h2 id="how-it-works-heading" className="text-4xl lg:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-[#E8D5D5]/70 max-w-2xl mx-auto text-lg font-sans">
              Verify any KRA PIN in three simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative group">
                  <Card className="p-8 glass-panel border-white/10 hover:border-[var(--color-brand-red)]/30 transition-all duration-500 h-full">
                    <div className="text-6xl font-black text-[var(--color-brand-red)]/20 mb-4">{step.number}</div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-brand-red)]/10 mb-4">
                      <Icon className="h-6 w-6 text-[var(--color-brand-red)]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-[#E8D5D5]/70 leading-relaxed">{step.description}</p>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t border-white/5 bg-[#0a0a0a]" aria-label="Statistics">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold text-white">
              <Users size={40} className="mx-auto text-[var(--color-brand-red)] mb-2" />
              1K+
            </div>
            <div className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-widest">
              Users
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold text-white">
              <Lock size={40} className="mx-auto text-[var(--color-brand-red)] mb-2" />
              100%
            </div>
            <div className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-widest">
              Secure
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold text-white">
              <Zap size={40} className="mx-auto text-[var(--color-brand-red)] mb-2" />
              &lt;3s
            </div>
            <div className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-widest">
              Response Time
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold text-white">
              <Globe size={40} className="mx-auto text-[var(--color-brand-red)] mb-2" />
              24/7
            </div>
            <div className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-widest">
              Availability
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 border-t border-white/10 bg-gradient-to-b from-[#111111] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to verify?</h2>
          <p className="text-[#BEA0A0] text-xl mb-12 max-w-2xl mx-auto">Start verifying KRA PINs instantly. No complex setup required — just sign in and go.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href={isSignedIn ? `/${locale}/dashboard` : `/${locale}/sign-in`} className="btn-primary text-lg px-10 py-5 flex items-center justify-center gap-2">
              <Search size={20} /> Start Verifying
            </Link>
            <Link href={`/${locale}/pricing`} className="inline-flex items-center justify-center rounded-xl px-10 py-5 text-lg font-semibold text-white border border-white/20 hover:bg-white/5 transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
