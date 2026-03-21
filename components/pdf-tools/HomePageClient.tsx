'use client';

import { 
  ArrowRight, Search, ShieldCheck, Zap, Sparkles, CheckCircle2, 
  Clock, FileCheck, Users, Lock, Globe, FileText, Scissors, 
  FileStack, FileCode, Wand2, LayoutGrid, MousePointer2 
} from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
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
      title: 'KRA Solutions',
      description: 'Verify KRA PINs and file Nil Returns instantly. Get professional compliance certificates in seconds.',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Zap,
      title: 'PDF Power Suite',
      description: '88+ professional PDF tools at your fingertips. Merge, split, compress, and convert with bank-grade security.',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    {
      icon: Lock,
      title: '100% Privacy',
      description: 'Your documents and PIN queries are processed securely. We never store your sensitive data on our servers.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
  ];

  // Featured PDF Tools
  const featuredPdfTools = [
    {
      id: 'merge-pdf',
      name: 'Merge PDF',
      description: 'Combine multiple PDFs into one document easily.',
      icon: FileStack,
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    },
    {
      id: 'split-pdf',
      name: 'Split PDF',
      description: 'Extract pages or separate a PDF into multiple files.',
      icon: Scissors,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'compress-pdf',
      name: 'Compress PDF',
      description: 'Reduce file size while optimizing for maximal quality.',
      icon: Wand2,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      id: 'pdf-to-word',
      name: 'PDF to Word',
      description: 'Convert PDF files to editable Word documents.',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-600/10'
    }
  ];

  // How it works steps
  const steps = [
    {
      number: '01',
      title: 'Choose Your Tool',
      description: 'Select from our KRA verification suite or 88+ professional PDF tools for any document task.',
      icon: LayoutGrid
    },
    {
      number: '02',
      title: 'Instant Processing',
      description: 'Our lightning-fast engines process your request in real-time right in your browser.',
      icon: Clock
    },
    {
      number: '03',
      title: 'Download & Done',
      description: 'Get your verified results or processed files immediately with zero wait time.',
      icon: FileCheck
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section - Dual Focus */}
      <section className="relative min-h-[95vh] flex items-center py-24 overflow-hidden bg-black">
        {/* Glow Effects */}
        <div className="absolute top-[-200px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }} aria-hidden="true"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[80%] pointer-events-none opacity-40"
             style={{ background: 'radial-gradient(ellipse at center, rgba(30, 60, 220, 0.2) 0%, transparent 60%)' }} aria-hidden="true"></div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          
          <div className="hero-text text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md text-white/90">
              <Sparkles className="h-4 w-4 text-[var(--color-brand-red)]" aria-hidden="true" />
              <span className="text-sm font-medium">
                The Ultimate KRA & PDF Intelligence Platform
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-8 tracking-tight">
              One Suite. <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">
                Infinite Power.
              </span>
            </h1>
            <p className="text-xl text-[#E8D5D5] mb-12 max-w-[550px] leading-relaxed font-sans">
              Instantly verify KRA PINs and master your documents with 88+ professional PDF tools. Professional precision meets lightning-fast speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={isSignedIn ? `/${locale}/dashboard` : `/${locale}/sign-in`} className="btn-primary text-base px-8 py-4 flex items-center justify-center gap-2 group">
                <Search size={20} /> Verify KRA PIN <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={`/${locale}/pdf-tools`} className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold tracking-wide text-white bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 gap-2">
                <FileText size={20} /> Explore PDF Tools
              </Link>
            </div>
          </div>

          {/* Combined Preview Card */}
          <div className="relative rounded-3xl border border-white/10 overflow-hidden group h-[500px] lg:h-[600px]" 
               style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #111111 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-red)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-6 left-6 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 text-white/60">
              Integrated Compliance System
            </div>
            
            <div className="h-full flex flex-col items-center justify-center p-8 space-y-6">
               {/* KRA Component */}
               <div className="glass-panel p-6 w-full max-w-[340px] border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 space-y-4"
                    style={{ background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(20px)' }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                       <ShieldCheck size={14} className="text-green-500" />
                       KRA GATEWAY
                    </div>
                    <span className="text-[#34D399] font-medium bg-[#10B981]/10 px-2 py-0.5 rounded text-[10px] border border-[#10B981]/20 uppercase">Compliant</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-green-500/50"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Search size={14} className="text-white/40" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-2/3 bg-white/10 rounded mb-1"></div>
                      <div className="h-2 w-1/2 bg-white/5 rounded"></div>
                    </div>
                  </div>
               </div>

               {/* PDF Component */}
               <div className="glass-panel p-6 w-full max-w-[340px] border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 space-y-4 translate-x-4 lg:translate-x-8"
                    style={{ background: 'rgba(30, 30, 30, 0.6)', backdropFilter: 'blur(20px)' }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                       <FileStack size={14} className="text-blue-500" />
                       PDF PROCESSOR
                    </div>
                    <span className="text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded text-[10px] border border-blue-500/20 uppercase">WASM Core</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Zap size={18} className="text-blue-500" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="h-2.5 w-full bg-white/10 rounded"></div>
                       <div className="h-2 w-4/5 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-1 bg-white/10 rounded-full"></div>)}
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
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Merge PDFs</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Verify KRA PINs</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">KRA Nil Returns</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Split & Organize</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Taxpayer Lookup</span>
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

      {/* Main Features Grid */}
      <section className="py-32 px-6 bg-[#0a0a0a]" aria-label="Features">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                Engineered for Professionals
              </h2>
              <p className="text-[#E8D5D5]/70 max-w-2xl mx-auto text-xl font-sans">
                A unified powerhouse for Kenyan compliance and global document management.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="p-10 glass-panel border-white/10 hover:border-[var(--color-brand-red)] transition-all duration-500 group">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bg} mb-8 ${feature.color} group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-[#E8D5D5]/80 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
      </section>

      {/* PDF Tools Secondary Hero Section */}
      <section className="py-32 px-6 bg-[#111111] overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none"
             style={{ background: 'radial-gradient(circle at center, var(--color-brand-red) 0%, transparent 60%)' }}></div>
        
        <div className="max-w-[1400px] mx-auto w-full relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Master Your PDFs <br/>
                <span className="text-[var(--color-brand-red)]">Private. Fast. Powerful.</span>
              </h2>
              <p className="text-[#E8D5D5]/70 text-xl mb-10 max-w-xl leading-relaxed">
                Unlock 88+ premium tools. From high-fidelity conversion to complex document staging, everything happens directly in your browser.
              </p>
              <Link href={`/${locale}/pdf-tools`} className="inline-flex items-center gap-2 text-white font-bold hover:text-[var(--color-brand-red)] transition-colors group text-lg">
                View all 88+ tools <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {featuredPdfTools.map((tool) => (
                <Link key={tool.id} href={`/${locale}/pdf-tools/${tool.id}`}>
                  <Card className="p-8 glass-panel border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 group bg-white/5">
                    <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center mb-6`}>
                      <tool.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                    <p className="text-[#E8D5D5]/60 text-sm leading-relaxed">{tool.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 bg-[#0a0a0a]" aria-labelledby="how-it-works-heading">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-20">
            <h2 id="how-it-works-heading" className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Streamlined Workflow
            </h2>
            <p className="text-[#E8D5D5]/70 max-w-2xl mx-auto text-xl font-sans">
              Experience the future of document and compliance management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-br from-[var(--color-brand-red)]/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Card className="p-10 glass-panel border-white/10 hover:border-white/20 transition-all duration-500 h-full relative z-10">
                    <div className="text-7xl font-black text-white/5 mb-6 group-hover:text-[var(--color-brand-red)]/20 transition-colors uppercase italic tracking-tighter">{step.number}</div>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 mb-6 group-hover:bg-[var(--color-brand-red)]/10 group-hover:text-[var(--color-brand-red)] transition-all">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-[#E8D5D5]/70 text-lg leading-relaxed">{step.description}</p>
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
          <div className="space-y-4">
            <div className="text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-3">
              <Users size={32} className="text-[var(--color-brand-red)]" />
              1K+
            </div>
            <div className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-widest bg-[var(--color-brand-red)]/10 py-1 px-4 rounded-full inline-block">
              Active Users
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-3">
              <ShieldCheck size={32} className="text-green-500" />
              100%
            </div>
            <div className="text-sm font-bold text-green-500 uppercase tracking-widest bg-green-500/10 py-1 px-4 rounded-full inline-block">
              Secure
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-3">
              <Zap size={32} className="text-yellow-500" />
              88+
            </div>
            <div className="text-sm font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 py-1 px-4 rounded-full inline-block">
              PDF Tools
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-3">
              <Globe size={32} className="text-blue-500" />
              24/7
            </div>
            <div className="text-sm font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 py-1 px-4 rounded-full inline-block">
              Available
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 border-t border-white/10 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-8 animate-bounce">
            <Sparkles className="text-[var(--color-brand-red)]" size={32} />
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">Master Your workflow today.</h2>
          <p className="text-[#BEA0A0] text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed">Join thousands of Kenyans using Akubrecah for secure compliance and high-performance document mastery.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href={isSignedIn ? `/${locale}/dashboard` : `/${locale}/sign-in`} className="btn-primary text-xl px-12 py-5 flex items-center justify-center gap-3 group shadow-[0_0_20px_rgba(227,6,19,0.3)]">
              Get Started Free <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link href={`/${locale}/pdf-tools`} className="inline-flex items-center justify-center rounded-xl px-12 py-5 text-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all backdrop-blur-md">
              Browse Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
