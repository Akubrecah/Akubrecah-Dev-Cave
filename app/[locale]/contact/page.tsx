'use client';

import React, { useState, useRef } from 'react';
import { Mail, MessageSquare, Phone, Calendar, Clock, Globe, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useUser, Show, SignInButton } from '@clerk/nextjs';

export default function Contact() {
  const { user, isLoaded } = useUser();
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleBookSession = () => {
    setSubject('Booking Request');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setStatus('SENDING');
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.fullName || user.username || 'Anonymous User',
          email: user.primaryEmailAddress?.emailAddress,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('SUCCESS');
      setMessage('');
      setTimeout(() => setStatus('IDLE'), 5000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('ERROR');
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-[1200px] mx-auto relative z-10">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.2) 0%, transparent 70%)' }}></div>

      <div className="relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 text-white/70">
            <Globe size={14} className="text-[var(--color-brand-red)]" />
            <span className="text-xs font-bold uppercase tracking-widest">Global Support Gateway</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">Excellence.</span>
          </h1>
          <p className="text-xl text-[#BEA0A0] max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re looking for enterprise solutions, technical support, or professional guidance, we are ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          
          {/* Email Support */}
          <div className="bg-[#111111] border border-white/10 rounded-[32px] p-10 flex flex-col items-center text-center transition-all duration-300 hover:border-[var(--color-brand-red)] group">
            <div className="p-4 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-2xl mb-8">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Direct Email</h3>
            <p className="text-[#BEA0A0] text-sm mb-8 leading-relaxed flex-grow italic">
              "24/7 technical assistance for high-priority filing services."
            </p>
            <a href="mailto:akubrecah@akubrecah.onmicrosoft.com" className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all text-sm tracking-wide">
              akubrecah@akubrecah.onmicrosoft.com
            </a>
          </div>

          {/* Schedule a Call */}
          <div className="bg-[#111111] border border-[var(--color-brand-red)] shadow-[0_0_40px_rgba(227,6,19,0.15)] rounded-[32px] p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar size={80} className="text-[var(--color-brand-red)]" />
            </div>
            <div className="w-20 h-20 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-2xl flex items-center justify-center mb-8 border border-[var(--color-brand-red)]/20 shadow-xl" aria-hidden="true">
              <Phone size={36} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Schedule a Session</h3>
            <p className="text-[#BEA0A0] text-sm mb-8 leading-relaxed flex-grow font-semibold">
              Book a session with our experts using our secure request form.
            </p>
            <button 
              onClick={handleBookSession}
              className="w-full py-4 bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-crimson)] hover:brightness-110 text-white rounded-xl font-bold shadow-lg transition-all text-sm tracking-wide uppercase"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Contact Form Section */}
        <div ref={formRef} className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col md:flex-row gap-12">
               {/* Left: Metadata */}
               <div className="md:w-1/3 border-r border-white/5 pr-0 md:pr-12 md:pb-0 pb-12">
                  <h2 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">Secure <br/> <span className="text-[var(--color-brand-yellow)]">Inquiry</span></h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-[var(--color-brand-yellow)]/30 transition-all">
                       <p className="text-[10px] uppercase tracking-widest text-[#BEA0A0] mb-1 font-black">Average Response</p>
                       <p className="text-white font-bold flex items-center gap-2">
                          <Clock size={14} className="text-green-500" />
                          &lt; 2 Hours
                       </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[10px] uppercase tracking-widest text-[#BEA0A0] mb-1 font-black">Identity Verified</p>
                       <p className="text-white font-bold flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-[var(--color-brand-red)]" />
                          Clerk.io Secure
                       </p>
                    </div>
                  </div>
               </div>

               {/* Right: Form */}
               <div className="flex-1">
                  <Show when="signed-in">
                      {status === 'SUCCESS' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="py-12 text-center space-y-8"
                        >
                          <div className="relative inline-block">
                             <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full animate-pulse" />
                             <div className="relative w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={48} className="text-green-500" />
                             </div>
                          </div>
                          
                          <div className="space-y-4">
                             <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">Signal <span className="text-green-500">Transmitted.</span></h3>
                             <p className="text-[#BEA0A0] text-lg max-w-sm mx-auto leading-relaxed">
                                Your inquiry has been successfully encrypted and routed to our executive support terminal.
                             </p>
                          </div>

                          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 max-w-sm mx-auto">
                             <div className="flex items-center justify-center gap-3 mb-2">
                                <Clock size={16} className="text-green-500" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">SLA: &lt; 2 Hours</span>
                             </div>
                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                You will receive a notification in your dashboard once our team has addressed your request.
                             </p>
                          </div>

                          <button 
                            onClick={() => setStatus('IDLE')}
                            className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest transition-all border border-white/10 active:scale-95"
                          >
                            Send Another Signal
                          </button>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ... (existing form content) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Your Full Name</label>
                                <input 
                                    type="text" 
                                    value={user?.fullName || user?.username || ''} 
                                    readOnly 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white/40 cursor-not-allowed outline-none font-medium"
                                />
                                </div>
                                <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={user?.primaryEmailAddress?.emailAddress || ''} 
                                    readOnly 
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white/40 cursor-not-allowed outline-none font-medium"
                                />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Inquiry Category</label>
                                <select 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-[var(--color-brand-yellow)]/30 focus:ring-1 focus:ring-[var(--color-brand-yellow)]/20 transition-all appearance-none cursor-pointer"
                                >
                                <option value="General Inquiry">General Inquiry</option>
                                <option value="Technical Support">Technical Support</option>
                                <option value="Booking Request">Request a Session</option>
                                <option value="Billing">Billing Issue</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Your Message</label>
                                <textarea 
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="How can we assist you today?"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white min-h-[160px] outline-none focus:border-[var(--color-brand-yellow)]/30 focus:ring-1 focus:ring-[var(--color-brand-yellow)]/20 transition-all resize-none"
                                ></textarea>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm font-bold animate-pulse">{error}</div>
                            )}

                            <button 
                                type="submit"
                                disabled={status === 'SENDING'}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg ${
                                status === 'SENDING' 
                                ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                                : 'bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-crimson)] text-white hover:scale-[1.01] active:scale-95'
                                }`}
                            >
                                {status === 'SENDING' ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Sending...
                                </>
                                ) : (
                                <>
                                    <Send size={20} />
                                    Send Message
                                </>
                                )}
                            </button>
                        </form>
                      )}
                  </Show>

                  <Show when="signed-out">
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                       <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                          <MessageSquare className="w-10 h-10 text-[var(--color-brand-red)]" />
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white">Identity Verification Required</h3>
                          <p className="text-[#BEA0A0] text-sm max-w-xs">
                             To prevent spam and ensure secure data handling, we require users to be signed in to send inquiries.
                          </p>
                       </div>
                       <SignInButton mode="modal">
                          <Button className="px-10 py-6 text-sm uppercase font-black tracking-widest">
                             Sign In to Message
                          </Button>
                       </SignInButton>
                    </div>
                  </Show>
               </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 text-center border-t border-white/5 pt-12">
          {/* Status content retained but modernized */}
        </div>
      </div>
    </main>
  );
}
