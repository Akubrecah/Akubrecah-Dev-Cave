'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

export default function StripeCheckoutForm({ tier }: { tier: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/dashboard?payment=success&tier=${tier}`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message ?? 'An unexpected error occurred.');
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 shadow-2xl">
        <PaymentElement 
          id="payment-element" 
          options={paymentElementOptions} 
          onReady={() => setIsReady(true)}
        />
        
        <button 
          disabled={isLoading || !stripe || !elements || !isReady} 
          id="submit"
          className="w-full mt-6 py-4 rounded-xl bg-[var(--color-brand-red)] text-white font-bold hover:bg-[var(--color-brand-crimson)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span id="button-text">
            {isLoading ? <div className="spinner" id="spinner">Processing...</div> : "Pay now"}
          </span>
        </button>
        {/* Show any error or success messages */}
        {message && <div id="payment-message" className="text-red-400 text-sm mt-4 text-center">{message}</div>}
      </div>
    </form>
  );
}
