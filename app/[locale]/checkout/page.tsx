'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Phone, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

type CheckoutStatus = 'INITIAL' | 'SENDING' | 'PENDING' | 'SUCCESS' | 'FAILED';

function CheckoutContent() {
  const [status, setStatus] = useState<CheckoutStatus>('INITIAL');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const tier = searchParams.get('tier');

  // Verify tier exists
  useEffect(() => {
    if (!tier) {
      router.push('/pricing');
    }
  }, [tier, router]);

  const handleMpesaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('SENDING');

    // Basic validation
    let formattedPhone = phoneNumber.trim().replace(/\+/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.substring(1);
    if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) formattedPhone = '254' + formattedPhone;
    
    if (!/^254\d{9}$/.test(formattedPhone)) {
      setError('Please enter a valid Safaricom number (e.g. 0712345678)');
      setStatus('INITIAL');
      return;
    }

    try {
      const res = await fetch('/api/payments/mpesa/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, phoneNumber: formattedPhone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate M-Pesa payment');

      setTransactionId(data.transactionId);
      setStatus('PENDING');
    } catch (err: any) {
      setError(err.message);
      setStatus('INITIAL');
    }
  };

  // Polling for transaction status
  const checkStatus = useCallback(async () => {
    if (!transactionId || status !== 'PENDING') return;

    try {
      setIsChecking(true);
      setLastCheckResult(null);
      const res = await fetch(`/api/payments/mpesa/status?id=${transactionId}`);
      const data = await res.json();

      if (data.status === 'completed') {
        setStatus('SUCCESS');
        setTimeout(() => router.push('/dashboard'), 3000);
      } else if (data.status === 'failed') {
        setStatus('FAILED');
        setError(data.failureReason || 'Transaction failed or was cancelled.');
      } else {
        // Still pending
        setLastCheckResult('Still waiting for M-Pesa...');
        setTimeout(() => setLastCheckResult(null), 3000);
      }
    } catch (err) {
      console.error('Status check error:', err);
    } finally {
      setIsChecking(false);
    }
  }, [transactionId, status, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'PENDING') {
      interval = setInterval(checkStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [status, checkStatus]);

  // Plan Details (Matching Stripe setup)
  const planDetails = {
    'hourly': { name: '1 Hour Access', price: '10 KES', billing: 'per hour' },
    'three_hour': { name: '3 Hours Access', price: '20 KES', billing: 'for 3 hours' },
    'daily': { name: 'Daily Pro', price: '50 KES', billing: 'daily' },
    'weekly': { name: 'Weekly Pro', price: '250 KES', billing: 'weekly' },
    'monthly': { name: 'Monthly Pro', price: '800 KES', billing: 'monthly' },
  };

  const currentPlan = planDetails[tier as keyof typeof planDetails] || planDetails['weekly'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center py-24 px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
        {/* Left Side: Summary */}
        <div className="text-white space-y-6">
            <h1 className="text-4xl font-bold">Checkout</h1>
            <p className="text-[#BEA0A0]">Complete your subscription using M-Pesa STK Push.</p>
            
            <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 mt-8 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 border-b border-white/5 pb-4">Order Summary</h3>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[#E8D5D5] font-medium">{currentPlan.name}</span>
                    <span className="font-bold text-white">{currentPlan.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-[#BEA0A0] mb-6">
                    <span className="capitalize">Billed {currentPlan.billing}</span>
                </div>
                
                <div className="flex justify-between items-center font-bold text-xl pt-4 border-t border-white/5">
                    <span>Total Due Today</span>
                    <span className="text-[var(--color-brand-red)]">{currentPlan.price}</span>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-[#BEA0A0]">
               <ShieldCheck className="text-[var(--color-brand-red)] shrink-0" size={20} />
               <p>Your payment is secured by Safaricom Daraja. We do not store your M-Pesa PIN.</p>
            </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-full bg-[#111111] p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Success State */}
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

            {/* Initial / Sending / Pending / Failed States */}
            {status !== 'SUCCESS' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png" alt="M-Pesa" className="h-8" />
                           Payments
                        </h2>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-white/50'}`}>
                           {status === 'PENDING' ? 'Waiting for PIN' : 'Secure STK Push'}
                        </div>
                    </div>

                    {status === 'INITIAL' || status === 'FAILED' ? (
                        <form onSubmit={handleMpesaPayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#E8D5D5]">Safaricom Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                    <input 
                                        type="tel"
                                        placeholder="0712345678"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--color-brand-red)] transition-all"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-[#BEA0A0] pl-2 italic">Enter the number that will receive the M-Pesa prompt.</p>
                            </div>

                            {error && (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-5 bg-red-900/10 border border-red-500/20 rounded-2xl">
                                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-red-500">Payment Failed</p>
                                            <p className="text-xs text-red-400/80 leading-relaxed">{error}</p>
                                        </div>
                                    </div>
                                    
                                    {status === 'FAILED' && (
                                        <button 
                                            type="button"
                                            onClick={() => setStatus('INITIAL')}
                                            className="w-full py-4 text-sm font-bold text-white bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                                        >
                                            Try Again with M-Pesa
                                        </button>
                                    )}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={status === 'SENDING'}
                                className="w-full bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-crimson)] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {status === 'SENDING' ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Initiating...
                                    </>
                                ) : (
                                    <>
                                        Pay {currentPlan.price}
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : status === 'PENDING' ? (
                        <div className="space-y-8 py-4 animate-pulse">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-500/20">
                                    <Phone size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Check Your Phone</h3>
                                <p className="text-[#BEA0A0] text-sm max-w-xs mx-auto">
                                    A prompt has been sent to <strong>{phoneNumber}</strong>. Please enter your M-Pesa PIN to complete the payment.
                                </p>
                            </div>
                            
                            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4">
                               <div className="flex items-center justify-between text-xs text-white/50">
                                  <span>Waiting for verification...</span>
                                  <Loader2 className="animate-spin" size={14} />
                               </div>
                               <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-500 w-1/2 animate-[progress_2s_infinite_linear]" />
                               </div>
                            </div>

                            <div className="space-y-4">
                                {lastCheckResult && (
                                    <p className="text-center text-[10px] text-yellow-500 animate-bounce">
                                        {lastCheckResult}
                                    </p>
                                )}
                                <button 
                                    onClick={checkStatus}
                                    disabled={isChecking}
                                    className="w-full py-3 rounded-xl bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isChecking ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            Checking Status...
                                        </>
                                    ) : (
                                        'Check Status Manually'
                                    )}
                                </button>
                                
                                <button 
                                    onClick={() => setStatus('INITIAL')}
                                    className="w-full py-3 text-[#BEA0A0] text-sm hover:text-white transition-colors"
                                >
                                    Cancel or Use Different Number
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e30613]"></div>
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}
