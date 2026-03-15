'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useSearchParams, useRouter } from 'next/navigation';
import StripeCheckoutForm from '@/components/StripeCheckoutForm';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tier = searchParams.get('tier');

  useEffect(() => {
    if (!tier) {
      router.push('/pricing');
      return;
    }

    // Create PaymentIntent as soon as the page loads
    fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
           throw new Error(data.error || 'Failed to initialize checkout');
        }
        return data;
      })
      .then((data) => {
        if (data.clientSecret) {
            setClientSecret(data.clientSecret);
        } else {
            setError(data.error || 'Failed to initialize payment');
        }
      })
      .catch((err) => {
        console.error("Error creating payment intent:", err);
        setError(err.message || "Could not initialize payment. Please try again later.");
      });
  }, [tier, router]);

  const appearance = useMemo(() => ({
    theme: 'night' as const,
    variables: {
      colorPrimary: '#e30613',
      colorBackground: '#111111',
      colorText: '#ffffff',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  }), []);

  const options = useMemo(() => ({
    clientSecret,
    appearance,
  }), [clientSecret, appearance]);

  // Map tier to display name and amount
  let planName = 'Premium Plan';
  let planPrice = '50 KES';
  
  if (tier === 'weekly') {
      planName = 'Cyber Pro Weekly';
      planPrice = '300 KES';
  } else if (tier === 'monthly') {
      planName = 'Cyber Pro Monthly';
      planPrice = '1,000 KES';
  } else if (tier === 'daily') {
      planName = 'PDF Premium Daily';
      planPrice = '50 KES';
  } else if (tier === 'premium_weekly') {
      planName = 'Cyber Premium Weekly';
      planPrice = '700 KES';
  } else if (tier === 'premium_monthly') {
      planName = 'Cyber Premium Monthly';
      planPrice = '2,500 KES';
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center py-24 px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
        <div className="text-white space-y-6">
            <h1 className="text-4xl font-bold">Checkout</h1>
            <p className="text-[#BEA0A0]">Complete your subscription to unlock premium features.</p>
            
            <div className="bg-[#111111] p-6 rounded-2xl border border-white/10 mt-8">
                <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-4">Order Summary</h3>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[#E8D5D5]">{planName}</span>
                    <span className="font-bold">{planPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-[#BEA0A0] mb-6">
                    <span>Billed {tier?.includes('daily') ? 'daily' : tier?.includes('weekly') ? 'weekly' : 'monthly'}</span>
                </div>
                
                <div className="flex justify-between items-center font-bold text-lg pt-4 border-t border-white/10">
                    <span>Total Due Today</span>
                    <span className="text-[var(--color-brand-red)]">{planPrice}</span>
                </div>
            </div>
        </div>

        <div className="w-full">
            {error ? (
                <div className="bg-red-900/40 border border-red-500 text-red-100 p-6 rounded-2xl text-center">
                    <p>{error}</p>
                    <button 
                      onClick={() => router.push('/pricing')}
                      className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        Return to Pricing
                    </button>
                </div>
            ) : clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                   <StripeCheckoutForm tier={tier as string} />
                </Elements>
            ) : (
                <div className="flex justify-center items-center h-64 bg-[#111111] rounded-2xl border border-white/10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-brand-red)]"></div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
