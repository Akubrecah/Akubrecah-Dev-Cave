'use client';

import React, { useState, useEffect } from 'react';
import { MarqueeBanner } from './MarqueeBanner';

interface Notification {
  id: string;
  message: string;
  type: string;
  theme: string;
  speed?: number;
}

/**
 * Fetches the active marquee notification at runtime (client-side) via the
 * /api/notifications API route. This keeps the parent layout free of any
 * direct DB calls during Next.js static site generation.
 *
 * When a marquee is active, adds `has-marquee` to <html> so that the Header
 * and page content can self-adjust their positioning via CSS without needing
 * server-side props.
 */
export function MarqueeBannerLoader() {
  const [marquee, setMarquee] = useState<Notification | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data: Notification[] = await res.json();
        const found = Array.isArray(data)
          ? data.find((n) => n.type === 'marquee') ?? null
          : null;
        setMarquee(found);
        // Signal to Header + main layout that a marquee banner is present
        document.documentElement.classList.toggle('has-marquee', !!found);
      } catch {
        // Silent fail — banner is non-critical
      }
    }
    load();

    return () => {
      document.documentElement.classList.remove('has-marquee');
    };
  }, []);

  if (!marquee) return null;

  return (
    <MarqueeBanner
      message={marquee.message}
      theme={marquee.theme}
      speed={marquee.speed}
    />
  );
}

