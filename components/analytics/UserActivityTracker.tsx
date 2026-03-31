'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

export function UserActivityTracker() {
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (!isSignedIn || !userId) return;

    const trackActivity = async () => {
      try {
        await fetch('/api/user/heartbeat', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Use keepalive to ensure it finishes even if page is closed/moved
          keepalive: true
        });
      } catch (e) {
        // Silent fail
      }
    };

    // Track immediately on mount/sign-in
    trackActivity();

    // Track every 5 minutes while active
    const interval = setInterval(trackActivity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isSignedIn, userId]);

  return null;
}
