'use client';

import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: string;
  theme: string;
  active: boolean;
}

const themeStyles: Record<string, { gradient: string; icon: string; text: string; shadow: string }> = {
  purple: {
    gradient: "from-[#7C3AED] via-[#3B82F6] to-[#7C3AED]",
    icon: "bg-[#7C3AED]/10 text-[#7C3AED]",
    text: "text-[#A78BFA]",
    shadow: "shadow-[#7C3AED]/20"
  },
  blue: {
    gradient: "from-[#3B82F6] via-[#22D3EE] to-[#3B82F6]",
    icon: "bg-[#3B82F6]/10 text-[#3B82F6]",
    text: "text-[#60A5FA]",
    shadow: "shadow-[#3B82F6]/20"
  },
  green: {
    gradient: "from-[#10B981] via-[#34D399] to-[#10B981]",
    icon: "bg-[#10B981]/10 text-[#10B981]",
    text: "text-[#34D399]",
    shadow: "shadow-[#10B981]/20"
  },
  pink: {
    gradient: "from-[#EC4899] via-[#F472B6] to-[#EC4899]",
    icon: "bg-[#EC4899]/10 text-[#EC4899]",
    text: "text-[#F472B6]",
    shadow: "shadow-[#EC4899]/20"
  },
  gold: {
    gradient: "from-[#F5C200] via-[#FFD700] to-[#F5C200]",
    icon: "bg-[#F5C200]/10 text-[#F5C200]",
    text: "text-[#F5C200]",
    shadow: "shadow-[#F5C200]/20"
  }
};

export function AlertBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    async function fetchNotification() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          // The API now returns an array. Find the first active popup.
          const popup = Array.isArray(data) 
            ? data.find((n: any) => n.type === 'popup')
            : (data?.type === 'popup' ? data : null);

          if (popup) {
            setNotification(popup);
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

  const style = themeStyles[notification.theme] || themeStyles.purple;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative max-w-xl w-full animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {/* Nexus Gradient Border Card */}
        <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${style.gradient} p-[1.5px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] ${style.shadow}`}>
          <div className="relative flex flex-col gap-6 rounded-[30px] bg-[#070B14] p-8 sm:p-12 text-center overflow-hidden">
            {/* Mesh Background Effect */}
            <div className={`absolute -top-24 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none bg-gradient-to-br ${style.gradient}`} />
            
            <div className={`mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${style.icon} p-3 relative z-10`}>
              <Info className="h-8 w-8" />
            </div>
            
            <div className="space-y-4 relative z-10">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Important Update
              </h3>
              <div 
                className="text-base sm:text-lg text-slate-300 leading-relaxed font-body"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                dangerouslySetInnerHTML={{ __html: notification.message }}
              />
            </div>

            <div className="pt-4 relative z-10">
              <button
                onClick={handleDismiss}
                className={`w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-full bg-gradient-to-r ${style.gradient} text-white font-bold text-lg hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl ${style.shadow}`}
              >
                Understood
              </button>
            </div>

            <button
              onClick={handleDismiss}
              className="absolute top-6 right-6 flex shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-white/5 hover:text-white focus:outline-none transition-colors p-2 z-20"
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
