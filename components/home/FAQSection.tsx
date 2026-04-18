'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Zap, Globe, MessageSquare } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

const FAQItem = ({ question, answer, icon }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-6 text-left group transition-all"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)]' : 'bg-white/5 text-white/40 group-hover:text-white/60'}`}>
            {icon || <HelpCircle size={20} />}
          </div>
          <span className={`text-lg font-semibold transition-colors ${isOpen ? 'text-white' : 'text-[#E8D5D5]/80 group-hover:text-white'}`}>
            {question}
          </span>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-white/20 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-brand-red)]' : ''}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] pb-6' : 'max-h-0'}`}
      >
        <p className="text-[#BEA0A0] text-lg leading-relaxed pl-14">
          {answer}
        </p>
      </div>
    </div>
  );
};

export default function FAQSection() {
  const faqs = [
    {
      icon: <Globe size={20} />,
      question: "How do I verify a KRA PIN online?",
      answer: "Simply enter the KRA PIN in our verification tool. Akubrecah connects to official compliance channels to retrieve real-time status, taxpayer name, and registration details in milliseconds."
    },
    {
      icon: <ShieldCheck size={20} />,
      question: "Is my data safe with Akubrecah?",
      answer: "Absolutely. We use browser-native processing (WASM). Your PDF documents are never uploaded to our servers—they stay on your device. KRA queries are encrypted and processed securely without permanent storage."
    },
    {
      icon: <Zap size={20} />,
      question: "What makes Akubrecah different from traditional service centres?",
      answer: "Speed and privacy. Instead of waiting or sharing your details with third parties, you can file Nil Returns and verify pins instantly from your own device, for free, with bank-grade security."
    },
    {
      icon: <MessageSquare size={20} />,
      question: "Are the PDF tools really free?",
      answer: "Yes! All 88+ PDF tools are browser-based and free to use. Some advanced KRA automation features may use a daily credit system, which refreshes every 24 hours for free users."
    }
  ];

  return (
    <section className="py-32 px-6 bg-black relative overflow-hidden" id="faq">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-brand-red)]/5 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Got <span className="text-[var(--color-brand-red)]">Questions?</span>
          </h2>
          <p className="text-[#E8D5D5]/60 text-xl max-w-2xl mx-auto">
            Everything you need to know about Kenyan compliance and document mastery.
          </p>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index} 
              question={faq.question} 
              answer={faq.answer} 
              icon={faq.icon} 
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[#BEA0A0] text-lg mb-6">Didn&apos;t find what you were looking for?</p>
          <a 
            href="mailto:support@akubrecah.com" 
            className="inline-flex items-center gap-2 text-[var(--color-brand-red)] font-bold hover:underline group"
          >
            Contact our Kenyan support team <Zap size={16} className="group-hover:animate-pulse" />
          </a>
        </div>
      </div>
    </section>
  );
}
