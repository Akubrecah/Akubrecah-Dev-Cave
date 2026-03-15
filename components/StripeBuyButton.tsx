"use client";

import Script from 'next/script';
import { useAuth } from '@clerk/nextjs';

interface StripeBuyButtonProps {
  buyButtonId: string;
  publishableKey: string;
}

export default function StripeBuyButton({ buyButtonId, publishableKey }: StripeBuyButtonProps) {
  const { userId, isLoaded } = useAuth();

  if (!isLoaded) return <div className="h-14 w-full bg-white/5 animate-pulse rounded-xl" />;

  return (
    <>
      <Script 
        async 
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="afterInteractive"
      />
      {/* @ts-expect-error - Stripe Custom Element */}
      <stripe-buy-button
        buy-button-id={buyButtonId}
        publishable-key={publishableKey}
        client-reference-id={userId || ""}
      />
    </>
  );
}
