'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicCheckoutContent = dynamic(
  () => import('@/components/payments/CheckoutContent').then(mod => mod.CheckoutContent),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-[var(--color-brand-red)]"></div>
      </div>
    )
  }
);

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-[var(--color-brand-red)]"></div>
      </div>
    }>
      <DynamicCheckoutContent />
    </React.Suspense>
  );
}
