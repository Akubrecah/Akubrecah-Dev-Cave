'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, MessageSquare, BarChart3, TrendingUp, ShieldAlert } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AdminAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Industrial Terminal active. How can I assist with your dashboard data today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/dashboard-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Terminal connection failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              const content = data.choices[0]?.delta?.content || '';
              assistantMessage += content;
              
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            } catch (_e) {
              // Fragmented JSON, ignore and wait for next chunk
            }
          }
        }
      }
    } catch (_error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Sub-terminal offline. Please verify NVIDIA_API_KEY." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { label: "Revenue Trend", icon: <TrendingUp className="w-3 h-3" />, query: "What is the current revenue trend?" },
    { label: "User Audit", icon: <ShieldAlert className="w-3 h-3" />, query: "How many users joined this week?" },
    { label: "Stat Summary", icon: <BarChart3 className="w-3 h-3" />, query: "Give me an executive summary of the dashboard stats." }
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] z-[100] border border-white/20"
      >
        <Bot className="w-7 h-7" />
        <motion.div
           animate={{ scale: [1, 1.2, 1] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black"
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 w-[400px] h-[600px] bg-[#0A0A0A] border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden z-[100] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Dashboard AI</h3>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">NVIDIA NIM: Llama 3.1 70B</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-white text-black font-bold' 
                      : 'bg-white/5 text-white border border-white/5 leading-relaxed'
                  }`}>
                    {m.content || <div className="flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce !delay-100">.</span><span className="animate-bounce !delay-200">.</span></div>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
               <div className="px-6 py-2 flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s.query)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
               </div>
            )}

            {/* Input */}
            <div className="p-6 bg-white/[0.01]">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Query dashboard statistics..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all font-medium"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading}
                  className="absolute right-2 top-2 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-600 mt-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <MessageSquare className="w-3 h-3" /> Secure Administrative Session
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
