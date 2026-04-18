import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ShieldCheck, Target, Zap, Search } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import { generateAboutMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateAboutMetadata(locale as Locale);
}

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  const values = [
    {
      icon: <ShieldCheck className="text-green-500" />,
      title: "Bank-Grade Security",
      description: "We use browser-based processing so your sensitive documents never leave your device."
    },
    {
      icon: <Target className="text-blue-500" />,
      title: "Kenyan Compliance",
      description: "Tailored specifically for the KRA ecosystem, helping thousands navigate tax season easily."
    },
    {
      icon: <Zap className="text-yellow-500" />,
      title: "Built for Speed",
      description: "Optimized engines that process complex PDF tasks and PIN lookups in under 2 seconds."
    }
  ];

  return (
    <main className="min-h-screen py-24 px-6 bg-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
           style={{ background: 'radial-gradient(circle at 20% 30%, var(--color-brand-red) 0%, transparent 60%)' }}></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-white/60 mb-6 uppercase tracking-widest">
            Our Story
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Compliance meets <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">Intelligence.</span>
          </h1>
          <p className="text-xl text-[#E8D5D5]/70 max-w-2xl mx-auto leading-relaxed">
            Akubrecah was built to solve a single problem: making complex Kenyan tax compliance as simple as a single click.
          </p>
        </div>

        {/* Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <div className="glass-panel p-10 border-white/10 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Target size={120} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">The Founder&apos;s Vision</h2>
            <p className="text-[#BEA0A0] text-lg leading-relaxed mb-6">
              In a world where document security is often an afterthought, we envisioned a platform where privacy is the default, not an option. Akubrecah was born in Nairobi, designed for the unique challenges of the Kenyan digital economy.
            </p>
            <p className="text-[#BEA0A0] text-lg leading-relaxed">
              We started with a simple KRA PIN tool and expanded into a full suite of 88+ professional utilities, now used by professionals across the country.
            </p>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">Why Professionals Trust Us</h2>
            <div className="grid grid-cols-1 gap-6">
              {values.map((v, i) => (
                <div key={i} className="flex gap-6 items-start p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{v.title}</h3>
                    <p className="text-[#BEA0A0]">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-12 mb-32 relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[var(--color-brand-red)]/10 blur-[100px] pointer-events-none"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div>
              <div className="text-white font-bold mb-4 uppercase tracking-widest text-sm text-[var(--color-brand-red)]">Security</div>
              <p className="text-[#E8D5D5]/80">Your files are processed 100% locally. We never see your data, and it never touches a cloud server.</p>
            </div>
            <div>
              <div className="text-white font-bold mb-4 uppercase tracking-widest text-sm text-[var(--color-brand-red)]">Reliability</div>
              <p className="text-[#E8D5D5]/80">99.9% uptime for KRA lookups, powered by optimized compliance infrastructure.</p>
            </div>
            <div>
              <div className="text-white font-bold mb-4 uppercase tracking-widest text-sm text-[var(--color-brand-red)]">Community</div>
              <p className="text-[#E8D5D5]/80">Designed with constant feedback from Kenyan accountants, tax agents, and business owners.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to streamline your workflow?</h2>
            <p className="text-[#BEA0A0] text-xl mb-12">Join the growing community of professionals in Kenya.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href={`/${locale}/dashboard`} className="btn-primary px-12 py-5 text-xl group">
                Verify KRA PIN <Search className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={`/${locale}/pdf-tools`} className="inline-flex items-center justify-center rounded-xl px-12 py-5 text-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all">
                Browse PDF Tools
              </Link>
            </div>
          </div>
          <Link href={`/${locale}/contact`} className="text-[#BEA0A0] hover:text-white transition-colors underline underline-offset-4">
            Need custom enterprise solutions? Contact us.
          </Link>
        </div>
      </div>
    </main>
  );
}
