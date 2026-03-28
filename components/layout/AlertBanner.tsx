'use client';

import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: string;
  active: boolean;
}

export function AlertBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    async function fetchNotification() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          if (data && data.type === 'popup') {
            setNotification(data);
            // Wait a bit before showing for effect
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
          }
        }
      } catch (e) {
        console.error('Failed to fetch notification for banner:', e);
      }
    }
    fetchNotification();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !notification) return null;

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
                Important Update
              </h3>
              <div 
                className="text-base sm:text-lg text-[hsl(var(--color-muted-foreground))] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: notification.message }}
              />
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
