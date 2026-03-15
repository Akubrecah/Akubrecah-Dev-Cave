import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <main className="min-h-screen py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-6">Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">Support</span></h1>
        <p className="text-xl text-[#E8D5D5]">
          Have a question or need integration help? We&apos;re here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:border-[var(--color-brand-red)]">
          <div className="w-16 h-16 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-full flex items-center justify-center mb-6" aria-hidden="true">
            <Mail size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
          <p className="text-[#BEA0A0] mb-6 flex-grow">For general queries, billing, and API integration support.</p>
          <a href="mailto:support@krapincheckerpro.com" className="text-[var(--color-brand-red)] font-semibold hover:underline" aria-label="Send email to support@krapincheckerpro.com">
            support@krapincheckerpro.com
          </a>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:border-[var(--color-brand-red)]">
          <div className="w-16 h-16 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-full flex items-center justify-center mb-6" aria-hidden="true">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Developer Discord</h3>
          <p className="text-[#BEA0A0] mb-6 flex-grow">Join our community, ask questions, and share what you&apos;ve built.</p>
          <a href="#" className="text-[var(--color-brand-red)] font-semibold hover:underline" aria-label="Join our Developer Discord Server">
            Join the Server
          </a>
        </div>

      </div>
    </main>
  );
}
