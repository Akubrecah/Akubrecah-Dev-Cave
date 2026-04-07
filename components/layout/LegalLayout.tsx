'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Info, Scale, ShieldCheck, FileText, ArrowUp } from 'lucide-react';

interface Section {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: Section[];
  children: React.ReactNode;
  icon: React.ElementType;
}

export function LegalLayout({ 
  title, 
  subtitle, 
  lastUpdated, 
  sections, 
  children, 
  icon: Icon 
}: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Update active section based on scroll position
      const scrollPosition = window.scrollY + 100;
      
      for (const section of [...sections].reverse()) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }

      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Hero Header */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="p-4 rounded-2xl glass-panel border border-primary/20 text-primary shadow-xl shadow-primary/5">
              <Icon size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight">
                {title}
              </h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.3em] opacity-70">
                {subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                Effective as of {lastUpdated}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sticky Navigation Sidebar */}
          <aside className="lg:w-72 lg:shrink-0">
            <div className="sticky top-32 space-y-8">
              <div className="glass-panel p-6 border border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <Scale size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Document Index</span>
                </div>
                
                <nav className="flex flex-col gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-300 ${
                        activeSection === section.id 
                          ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                        {section.title}
                      </span>
                      <ChevronRight 
                        size={14} 
                        className={`transition-transform duration-300 ${
                          activeSection === section.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
                        }`}
                      />
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/5 border border-primary/10">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" />
                  Legal Verification
                </h4>
                <p className="text-[9px] text-muted-foreground font-medium leading-relaxed uppercase tracking-tighter">
                  This document has been audited for compliance with standard digital governance frameworks (GDPR, CCPA, and regional KRA mandates).
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 max-w-4xl">
            <div className="grid gap-16">
              {children}
            </div>

            {/* Footer Notice */}
            <div className="mt-20 pt-12 border-t border-white/5 opacity-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <FileText size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Akubrecah Legal Division</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Document ID: AK-LGL-2025-V2</p>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest text-center md:text-right">
                All rights reserved. Unauthorized reproduction is strictly prohibited.
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-10 right-10 p-4 rounded-2xl bg-primary text-white shadow-2xl shadow-primary/20 border border-primary-hover z-50 hover:scale-110 active:scale-95 transition-all"
          >
            <ArrowUp size={20} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LegalSection({ 
  id, 
  title, 
  tldr, 
  children 
}: { 
  id: string; 
  title: string; 
  tldr?: string; 
  children: React.ReactNode 
}) {
  return (
    <section id={id} className="scroll-mt-32 space-y-8 group">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-1 bg-primary rounded-full group-hover:w-12 transition-all duration-500" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
            {title}
          </h2>
        </div>
        
        {tldr && (
          <div className="glass-panel p-5 border-l-4 border-primary bg-primary/5 rounded-r-2xl">
            <div className="flex items-start gap-4">
              <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                <Info size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 block">Quick Summary (TL;DR)</span>
                <p className="text-[11px] font-bold text-foreground leading-[1.6] tracking-tight uppercase opacity-90">
                  {tldr}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="prose prose-invert prose-emerald max-w-none prose-p:text-muted-foreground prose-p:leading-loose prose-p:text-sm prose-p:font-medium prose-li:text-muted-foreground prose-li:text-sm prose-strong:text-white prose-strong:font-black">
        {children}
      </div>
    </section>
  );
}
