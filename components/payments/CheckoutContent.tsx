'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useUser } from '@clerk/nextjs';

type CheckoutStatus = 'INITIAL' | 'SENDING' | 'PENDING' | 'SUCCESS' | 'FAILED';
type PaymentMethod = 'PAYSTACK' | 'MPESA';

export function CheckoutContent() {
  const [status, setStatus] = useState<CheckoutStatus>('INITIAL');
  const [paymentMethod] = useState<PaymentMethod>('PAYSTACK');
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const tier = searchParams.get('tier');

  const { user } = useUser();
  const email = user?.emailAddresses[0]?.emailAddress || '';

  // Plan Details 
  const planDetails = {
    'hourly': { name: '1 Hour Access', price: 10, billing: 'per hour' },
    'three_hour': { name: '3 Hours Access', price: 20, billing: 'for 3 hours' },
    'daily': { name: 'Daily Pro', price: 50, billing: 'daily' },
    'weekly': { name: 'Weekly Pro', price: 250, billing: 'weekly' },
    'monthly': { name: 'Monthly Pro', price: 800, billing: 'monthly' },
  };

  const currentPlan = planDetails[tier as keyof typeof planDetails] || planDetails['weekly'];

  // Verify tier exists
  useEffect(() => {
    if (!tier) {
      router.push('/pricing');
    }
  }, [tier, router]);

  // Paystack Configuration
  const config = {
    reference: transactionId || '',
    email: email,
    amount: (currentPlan.price as number) * 100, // Amount in subunits
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    currency: 'KES',
    metadata: {
      custom_fields: [
        {
          display_name: "Plan Tier",
          variable_name: "tier",
          value: tier
        }
      ]
    }
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = () => {
    setStatus('SUCCESS');
    setTimeout(() => router.push('/dashboard'), 3000);
  };

  const onClose = () => {
    setStatus('INITIAL');
  };

  const handlePaystackPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod !== 'PAYSTACK') return;

    if (!email) {
      setError('User identity not found. Please sign in again.');
      return;
    }
    
    setError(null);
    setStatus('SENDING');

    try {
      const res = await fetch('/api/payments/paystack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, popup: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to prepare transaction');

      setTransactionId(data.reference);
    } catch (err: any) {
      setError(err.message);
      setStatus('INITIAL');
    }
  };

  useEffect(() => {
    if (transactionId && status === 'SENDING' && paymentMethod === 'PAYSTACK') {
       // @ts-ignore
       initializePayment(onSuccess, onClose);
       setStatus('PENDING');
    }
  }, [transactionId]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center py-24 px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.1) 0%, transparent 70%)' }}></div>
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start relative z-10">
          
        {/* Left Side: Summary */}
        <div className="text-white space-y-6">
            <h1 className="text-4xl font-bold">Checkout</h1>
            <p className="text-[#BEA0A0]">Complete your subscription via Secure Checkout.</p>
            
            <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 mt-8 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 border-b border-white/5 pb-4">Order Summary</h3>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[#E8D5D5] font-medium">{currentPlan.name}</span>
                    <span className="font-bold text-white tabular-nums">{currentPlan.price} KES</span>
                </div>
                <div className="flex justify-between items-center text-sm text-[#BEA0A0] mb-6">
                    <span className="capitalize">Billed {currentPlan.billing}</span>
                </div>
                
                <div className="flex justify-between items-center font-bold text-xl pt-4 border-t border-white/5">
                    <span>Total Due Today</span>
                    <span className="text-[var(--color-brand-red)] tabular-nums">{currentPlan.price} KES</span>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-[#BEA0A0]">
               <ShieldCheck className="text-[var(--color-brand-red)] shrink-0" size={20} />
               <p>Your payment is secured and encrypted via Paystack. We do not store your payment details.</p>
            </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-full bg-[#111111] p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            {status === 'SUCCESS' && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                    <p className="text-[#BEA0A0]">Your {currentPlan.name} is now active. Redirecting you to the dashboard...</p>
                    <Loader2 className="animate-spin text-green-500 mt-4" />
                </div>
            )}

            {status !== 'SUCCESS' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                           Payment Method
                        </h2>
                    </div>

                    {status === 'INITIAL' || status === 'FAILED' || status === 'SENDING' || status === 'PENDING' ? (
                        <form onSubmit={handlePaystackPayment} className="space-y-6">
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div className="flex items-start gap-4">
                                    <CreditCard className="text-[#F5C200] mt-1" size={24} />
                                    <div>
                                      <p className="text-sm font-bold text-white mb-1">Pay Securely via Paystack</p>
                                      <p className="text-xs text-[#BEA0A0]">Pay using <strong>M-Pesa Mobile Money</strong>, Card, or Bank Transfer via an inline secure popup.</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-4 p-5 bg-red-900/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-bottom-2 duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-red-500">Checkout Error</p>
                                        <p className="text-xs text-red-400/80 leading-relaxed">{error}</p>
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={status === 'SENDING'}
                                className="w-full bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-crimson)] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 overflow-hidden relative shadow-lg shadow-red-900/20"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                {status === 'SENDING' || status === 'PENDING' ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Secure Checkout Active...
                                    </>
                                ) : (
                                    <>
                                        Pay {currentPlan.price} KES
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : null}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
