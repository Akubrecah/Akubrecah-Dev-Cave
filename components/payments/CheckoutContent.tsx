'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, Loader, ShieldCheck, Mail, Phone, ArrowRight } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useUser } from '@clerk/nextjs';
import NextImage from 'next/image';

type CheckoutStatus = 'INITIAL' | 'SENDING' | 'PENDING' | 'SUCCESS' | 'FAILED';

export function CheckoutContent() {
  const [status, setStatus] = useState<CheckoutStatus>('INITIAL');
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const tier = searchParams.get('tier');

  const { user } = useUser();
  const email = user?.emailAddresses[0]?.emailAddress || '';

  // Fetch current subscription status
  useEffect(() => {
    fetch('/api/user/status')
      .then(res => res.json())
      .then(data => { setUserStatus(data); setStatusLoading(false); })
      .catch(() => setStatusLoading(false));
  }, []);

  // Plan Details 
  const planDetails = {
    'basic': { name: 'Basic Plan', price: 50, billing: 'Single filing content', image: '/logo.png' },
    'pro': { name: 'Pro Plan', price: 100, billing: 'Multiple returns up to 10', image: '/logo.png' },
  };
  
  const currentPlan = planDetails[tier as keyof typeof planDetails] || planDetails['basic'];

  // Verify tier exists
  useEffect(() => {
    if (!tier) {
      router.push('/pricing');
      return;
    }
    if (tier === 'enterprise') {
      router.push(`/${window.location.pathname.split('/')[1] || 'en'}/contact`);
      return;
    }
  }, [tier, router]);

  // Initialize Paystack Hook
  const initializePayment = usePaystackPayment({} as any);

  // Handle Paystack Payment Initialization (Inline Popup)
  const handlePaystackPayment = async () => {
    setError(null);
    setStatus('SENDING');
    
    try {
      // 1. Get Payment Details from Backend
      const res = await fetch('/api/payments/paystack/checkout', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      const config = {
        reference: data.reference,
        email: email,
        amount: data.amount, // Already in subunits (KES * 100) from backend
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_d3f46e14c6bc06d50de9f681a866d5a543cea647',
        currency: 'KES',
      };

      // 2. Trigger Paystack Inline Popup
      initializePayment({
        config,
        onSuccess: (reference: any) => {
          console.log('Payment Successful:', reference);
          setStatus('SUCCESS');
          // Redirect after 3 seconds of showing the custom success screen
          setTimeout(() => {
            router.push(`/${window.location.pathname.split('/')[1] || 'en'}/dashboard?payment=success`);
          }, 4000);
        },
        onClose: () => {
          console.log('Payment Modal Closed');
          setStatus('INITIAL');
        }
      } as any);

    } catch (err: any) {
      setError(err.message || 'Payment initialization failed');
      setStatus('FAILED');
      setTimeout(() => setStatus('INITIAL'), 5000);
    }
  };

  // Active subscription guard
  const hasActiveSub =
    !statusLoading &&
    userStatus?.subscriptionStatus === 'active' &&
    userStatus?.subscriptionEnd &&
    new Date(userStatus.subscriptionEnd) > new Date();

  const expiryDate = userStatus?.subscriptionEnd
    ? new Date(userStatus.subscriptionEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(circle at center, rgba(31, 111, 91, 0.05) 0%, transparent 60%)' }}></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#1F6F5B]/5 blur-[120px] rounded-full"></div>

      <div className="wrapper max-w-5xl w-full z-10 transition-all duration-500">
        {/* Active plan gate — block payment */}
        {hasActiveSub ? (
          <div className="flex flex-col items-center justify-center text-center gap-8 rounded-[2.5rem] border border-green-500/20 bg-green-500/5 backdrop-blur-xl p-16">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500/60 mb-2">Plan Already Active</p>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">
                {(userStatus?.activeTier || 'free').toUpperCase()} Plan
              </h2>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
                Your plan is active until <span className="text-white">{expiryDate}</span>. It will auto-renew when it expires.
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-12 py-5 bg-white rounded-2xl text-black font-black uppercase tracking-widest italic hover:bg-emerald-500 hover:text-white transition-all text-sm"
            >
              ← Return to Dashboard
            </button>
          </div>
        ) : (
        <div className="checkout_wrapper grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-[2.5rem] border border-[#D1D5DB] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/40 backdrop-blur-xl">
          
          {/* Left Side: Product Info */}
          <div className="product_info p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-br from-white to-[#F2F2F2] border-r border-[#D1D5DB]">
            <div className="relative w-48 h-48 mb-4 group">
               <div className="absolute inset-0 bg-[#1F6F5B]/10 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700"></div>
               <NextImage 
                  src={currentPlan.image} 
                  alt={currentPlan.name} 
                  width={200}
                  height={200}
                  className="object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(31,111,91,0.1)]"
               />
            </div>
            <div className="content space-y-4">
              <h3 className="text-2xl font-bold tracking-tight text-[#2B2B2B] leading-tight">
                AkubrecaH <br/> {currentPlan.name}
              </h3>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-[#1F6F5B] tabular-nums drop-shadow-[0_0_15px_rgba(31,111,91,0.1)]">
                  KES. {currentPlan.price} /=
                </span>
                <p className="text-[#2E8B75] text-sm mt-3 uppercase tracking-widest">{currentPlan.billing}</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full border border-black/5 text-[10px] text-[#2E8B75] uppercase tracking-tighter mt-10">
               <ShieldCheck className="w-3 h-3 text-[#1F6F5B]" />
               Secure Professional Filing Gateway
            </div>
          </div>

          {/* Right Side: Checkout Form */}
          <div className="checkout_form p-8 md:p-12 flex flex-col space-y-8 bg-white/80 relative overflow-hidden">
            {status === 'SUCCESS' && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#F2F2F2]/90 backdrop-blur-xl text-center p-12 animate-in fade-in zoom-in duration-500">
                    <div className="relative mb-8">
                       <div className="absolute inset-0 bg-[#1F6F5B]/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                       <div className="w-24 h-24 bg-[#1F6F5B] text-white rounded-full flex items-center justify-center relative z-10 shadow-[0_20px_40px_rgba(31,111,91,0.3)]">
                           <CheckCircle2 size={48} strokeWidth={3} />
                       </div>
                    </div>
                    
                    <div className="space-y-4 max-w-sm">
                       <h2 className="text-4xl font-black text-[#2B2B2B] uppercase tracking-tighter italic">
                          Transaction <br/> <span className="text-[#1F6F5B]">Confirmed</span>
                       </h2>
                       <p className="text-[#2E8B75] font-bold uppercase tracking-widest text-xs leading-relaxed">
                          Your {currentPlan.name} has been successfully activated. Terminal access granted.
                       </p>
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-4">
                       <div className="flex gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#1F6F5B] animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-[#1F6F5B] animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2 h-2 rounded-full bg-[#1F6F5B] animate-bounce [animation-delay:-0.3s]"></span>
                       </div>
                       <p className="text-[10px] font-black text-[#2B2B2B]/40 uppercase tracking-[0.2em]">Redirecting to command center...</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
               <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F6F5B]">Payment Portal</p>
               <NextImage src="/logo.png" alt="AkubrecaH" width={80} height={20} className="opacity-40" />
            </div>

            <div className="details space-y-8 flex-1 flex flex-col justify-center">
              <div className="section text-center space-y-6 py-8">
                <div className="flex items-center justify-center bg-[#F3F4F6] rounded-3xl p-8 border border-[#D1D5DB] relative group overflow-hidden">
                  <div className="absolute inset-0 bg-[#3483fa]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center">
                     <div className="flex items-center justify-center p-4 bg-white rounded-xl mb-4 shadow-md">
                        <NextImage 
                          src="https://upload.wikimedia.org/wikipedia/commons/2/22/Paystack_logo.svg"
                          alt="Paystack Logo" 
                          width={140} 
                          height={70}
                          className="object-contain"
                        />
                     </div>
                     <p className="text-[10px] text-[#2E8B75] uppercase font-black tracking-widest">Global Secure Checkout</p>
                  </div>
                </div>
                
                <p className="text-sm text-[#2B2B2B] font-medium leading-relaxed px-4">
                  Powered by <b>Paystack Secure Checkout</b>. Complete your transaction using <b>M-Pesa</b>, <b>Card</b>, or <b>Bank Transfer</b> without leaving this page.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs animate-in slide-in-from-top-2">
                   <AlertCircle size={16} />
                   <span>{error}</span>
                </div>
              )}

              <button 
                onClick={() => handlePaystackPayment()}
                disabled={status === 'SENDING' || status === 'PENDING'}
                className={`btn flex items-center justify-center group w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_15px_30px_-10px_rgba(31,111,91,0.2)] mt-auto ${
                   status === 'SENDING' || status === 'PENDING' 
                   ? 'bg-[#E5E7EB] text-[#2E8B75] cursor-not-allowed' 
                   : 'bg-[#1F6F5B] hover:bg-[#145A47] text-white hover:scale-[1.02] active:scale-95'
                }`}
              >
                {status === 'SENDING' ? (
                   <span className="flex items-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      Contacting Paystack...
                   </span>
                ) : status === 'PENDING' ? (
                   <span className="flex items-center gap-2 animate-pulse">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting to Provider...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                      Proceed to Payment
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </span>
                )}
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-6">
                 <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                    <ShieldCheck className="w-5 h-5 text-[#2B2B2B]" />
                    <span className="text-[8px] uppercase tracking-widest text-[#2B2B2B]">PCI DSS Level 1</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                    <CreditCardIcon />
                    <span className="text-[8px] uppercase tracking-widest text-[#2B2B2B]">Secure Terminal</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
        )}
        
        {/* Support Section */}
        {!hasActiveSub && (
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 text-[#2E8B75]/60 animate-in fade-in slide-in-from-bottom-4 delay-300 duration-1000">
             <div className="flex items-center gap-3 text-sm font-medium">
                <div className="p-2 rounded-lg bg-black/5"><Mail size={16} /></div>
                <span className="text-[#2B2B2B]">akubrecah@akubrecah.onmicrosoft.com</span>
             </div>
             <div className="w-1 h-1 bg-black/10 rounded-full hidden md:block"></div>
             <p className="text-xs">Secure Managed Payments via Paystack</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
