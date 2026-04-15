'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Search, ChevronRight, RefreshCw,
  Mail, User, CheckCircle2, Loader2, Send, AlertCircle
} from 'lucide-react';
import { AdminHeader } from '../_components/AdminHeader';
import { AdminSidebar } from '../_components/AdminSidebar';

interface ContactMessage {
  id: string;
  userId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

export default function AdminMessagesPage() {
  // const params = useParams();
  // const router = useRouter();
  // const locale = params?.locale as string || 'en';

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [resolution, setResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/messages');
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (_e) {
      console.error('Failed to fetch messages:', _e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !resolution) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMessage.id,
          status: 'resolved',
          resolution
        }),
      });

      if (res.ok) {
        setResolution('');
        setSelectedMessage(null);
        fetchMessages();
      }
    } catch (_e) {
      console.error('Failed to resolve message:', _e);
    } finally {
      setIsSubmitting(false);
    }

  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
        m.name.toLowerCase().includes(search.toLowerCase()) || 
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-brand-red)]/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20 relative z-10">
        <AdminHeader 
          title="Support Terminal" 
          subtitle="Inquiry Management & Resolution"
          onRefresh={fetchMessages}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[24px] border border-white/10 w-full md:w-auto">
                {['all', 'pending', 'resolved'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setFilter(t as any)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filter === t 
                            ? 'bg-[var(--color-brand-red)] text-white shadow-lg' 
                            : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="relative w-full md:w-96">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text"
                    placeholder="Search communications..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[var(--color-brand-red)]/50 transition-all"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* List */}
            <div className="xl:col-span-1 space-y-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <RefreshCw className="w-10 h-10 text-[var(--color-brand-red)] animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Accessing Kernel...</p>
                    </div>
                ) : filteredMessages.length > 0 ? (
                    filteredMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedMessage(msg)}
                            className={`p-6 rounded-[32px] border transition-all cursor-pointer group relative overflow-hidden ${
                                selectedMessage?.id === msg.id
                                ? 'bg-white/10 border-[var(--color-brand-red)] shadow-2xl'
                                : 'bg-[#0a0a0a] border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                                    msg.status === 'pending' 
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                }`}>
                                    {msg.status}
                                </div>
                                <span className="text-[9px] font-bold text-gray-600 tabular-nums">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-[var(--color-brand-red)] transition-colors">
                                {msg.subject}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">
                                {msg.name} • {msg.email}
                            </p>

                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-[9px] font-black text-gray-700 uppercase">ID: {msg.id.slice(-8)}</span>
                                <ChevronRight size={14} className={`text-gray-700 transition-transform ${selectedMessage?.id === msg.id ? 'translate-x-1 text-[var(--color-brand-red)]' : ''}`} />
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white/5 rounded-[40px] border border-white/5 border-dashed">
                        <MessageSquare className="w-12 h-12 text-gray-800 mx-auto mb-4 opacity-20" />
                        <p className="text-gray-600 font-black uppercase tracking-widest text-xs">No signals detected</p>
                    </div>
                )}
            </div>

            {/* Content / Detail */}
            <div className="xl:col-span-2">
                <AnimatePresence mode="wait">
                    {selectedMessage ? (
                        <motion.div
                            key={selectedMessage.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-[#0a0a0a] border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden h-full flex flex-col"
                        >
                            {/* Header Info */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                                <div className="space-y-4">
                                    <div className="p-4 bg-[var(--color-brand-red)]/5 rounded-2xl border border-[var(--color-brand-red)]/10 inline-block">
                                        <MessageSquare className="w-8 h-8 text-[var(--color-brand-red)]" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
                                            {selectedMessage.subject}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                                                Incoming from {selectedMessage.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                    <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Status</p>
                                        <p className={`text-[10px] font-black uppercase ${selectedMessage.status === 'pending' ? 'text-amber-500' : 'text-green-500'}`}>
                                            {selectedMessage.status}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Received</p>
                                        <p className="text-[10px] font-black text-white uppercase tabular-nums">
                                            {new Date(selectedMessage.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Message Body */}
                            <div className="flex-grow space-y-8">
                                <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 relative">
                                    <div className="absolute -top-3 left-8 px-4 py-1 bg-black border border-white/10 rounded-full">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Signal Content</span>
                                    </div>
                                    <p className="text-lg text-gray-300 leading-relaxed font-medium">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/5">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Primary Contact</p>
                                            <p className="text-xs font-bold text-white">{selectedMessage.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/5">
                                        <User className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Platform ID</p>
                                            <p className="text-xs font-bold text-white tabular-nums">{selectedMessage.userId.slice(0, 16)}...</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Resolution Area */}
                                {selectedMessage.status === 'resolved' ? (
                                    <div className="p-8 rounded-[40px] bg-green-500/5 border border-green-500/10 relative mt-12">
                                        <div className="absolute -top-3 left-8 px-4 py-1 bg-black border border-green-500/20 rounded-full">
                                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                                                <CheckCircle2 size={10} /> Resolution Deployed
                                            </span>
                                        </div>
                                        <p className="text-sm text-green-500/80 leading-relaxed font-bold italic">
                                            &quot;{selectedMessage.resolution}&quot;
                                        </p>
                                        <p className="text-[9px] font-black text-green-500/40 uppercase mt-4 tracking-widest">
                                            Verified at {new Date(selectedMessage.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleResolve} className="space-y-6 pt-12">
                                        <div className="relative group">
                                            <textarea 
                                                required
                                                value={resolution}
                                                onChange={(e) => setResolution(e.target.value)}
                                                placeholder="Enter resolution notes... (User will be notified)"
                                                className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-white min-h-[160px] outline-none focus:border-[var(--color-brand-red)]/50 transition-all font-bold text-sm"
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting || !resolution}
                                            className="w-full py-6 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-crimson)] disabled:bg-white/10 text-white rounded-[24px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <Send size={20} /> Deploy Resolution
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white/5 border border-white/10 border-dashed rounded-[48px] p-12 text-center">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5">
                                <AlertCircle className="w-10 h-10 text-gray-700" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-600 uppercase tracking-tighter mb-4">No Signal Selected</h3>
                            <p className="text-sm text-gray-700 max-w-xs font-bold uppercase tracking-widest leading-relaxed">
                                Select a communication channel from the list to view full data and deploy resolutions.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
