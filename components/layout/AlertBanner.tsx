'use client';

import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

export function AlertBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show every time the page is refreshed/mounted
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[hsl(var(--color-background))/0.4] backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative max-w-xl w-full animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[hsl(var(--color-brand-red))] via-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] p-[2.5px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <div className="relative flex flex-col gap-6 rounded-[22px] bg-[hsl(var(--color-background))] p-6 sm:p-10 text-center">
            <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--color-brand-red))/0.1] p-3 text-[hsl(var(--color-brand-red))]">
              <Info className="h-8 w-8" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-[hsl(var(--color-foreground))] tracking-tight">
                Service Requirements Update
              </h3>
              <div className="text-base sm:text-lg text-[hsl(var(--color-muted-foreground))] leading-relaxed space-y-4">
                <p>
                  Starting <strong className="text-[hsl(var(--color-foreground))] font-bold">May 01, 2026</strong>, an active subscription will be required in order to use KRA services on this platform.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 sm:p-6 rounded-2xl bg-[hsl(var(--color-primary))/0.05] border border-[hsl(var(--color-primary))/0.1] text-[hsl(var(--color-foreground))]">
                  <span className="text-3xl animate-bounce">🎉</span>
                  <p className="font-semibold text-lg sm:text-xl leading-snug">
                    <span className="text-[hsl(var(--color-accent))]">All PDF tools</span> will remain <span className="text-[hsl(var(--color-brand-green))] underline decoration-2 underline-offset-4">FREE</span>!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDismiss}
                className="w-full sm:w-auto min-w-[160px] px-8 py-3.5 rounded-xl bg-[hsl(var(--color-primary))] text-white font-bold text-lg hover:bg-[hsl(var(--color-primary))/0.9] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
              >
                Understood
              </button>
            </div>

            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 flex shrink-0 items-center justify-center rounded-full text-[hsl(var(--color-muted-foreground))] hover:bg-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-foreground))] focus:outline-none transition-colors p-2"
              aria-label="Dismiss alert"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
