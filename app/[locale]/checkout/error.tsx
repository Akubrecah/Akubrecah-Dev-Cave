'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Checkout Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={40} />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">Checkout Error</h2>
      <p className="text-[#BEA0A0] max-w-md mb-8 leading-relaxed">
        Something went wrong while initializing the payment. This might be due to a connection issue or an invalid session.
      </p>

      {error.message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mb-8 font-mono text-xs text-red-400">
          Error: {error.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-crimson)] text-white font-bold py-3 px-8 rounded-2xl transition-all"
        >
          <RefreshCcw size={18} />
          Try Again
        </button>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-2xl border border-white/10 transition-all"
        >
          <Home size={18} />
          Back Home
        </Link>
      </div>
    </div>
  );
}
