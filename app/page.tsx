import Link from 'next/link';
import { ArrowRight, Search, CheckCircle, FileDown, Zap, ShieldCheck, FileText, Code, Clock } from 'lucide-react';
import React from 'react'; // Added React import for React.Fragment

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center py-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }} aria-hidden="true"></div>
        <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[150%] pointer-events-none opacity-40"
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.4) 0%, transparent 60%)' }} aria-hidden="true"></div>
        <div className="absolute bottom-[-30%] left-[-20%] w-[60%] h-full pointer-events-none opacity-30"
             style={{ background: 'radial-gradient(ellipse at center, rgba(123, 10, 10, 0.4) 0%, transparent 60%)' }} aria-hidden="true"></div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-24 items-center relative z-10">
          
          <div className="hero-text text-left">
            <h1 className="text-5xl lg:text-7xl font-bold font-sans text-white leading-tight mb-8 tracking-tight">
              Verify Any <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">
                KRA PIN
              </span> Instantly.
            </h1>
            <p className="text-xl text-[#E8D5D5] mb-12 max-w-[500px] leading-relaxed">
              Professional tax compliance tool for individuals and businesses. Instant validations, automated certificates, and developer-first APIs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard" className="btn-primary text-base px-8 py-4">
                Start for Free
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-semibold tracking-wide text-white bg-transparent border-2 border-white/20 hover:border-[var(--color-brand-red)] hover:text-[var(--color-brand-red)] transition-all duration-300">
                <span className="material-symbols-outlined mr-2">play_circle</span> Learn More
              </Link>
            </div>
          </div>

          <div className="hero-visual relative h-[400px] lg:h-[500px] rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden" 
               style={{ background: 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)' }} aria-hidden="true">
            
            {/* Animated background orbs */}
            <div className="absolute w-[200px] h-[200px] rounded-full top-[20%] left-[20%] opacity-30 blur-[60px] animate-pulse" 
                 style={{ background: 'var(--color-brand-red)', animationDuration: '8s' }}></div>
            <div className="absolute w-[150px] h-[150px] rounded-full bottom-[20%] right-[20%] opacity-30 blur-[60px] animate-pulse" 
                 style={{ background: 'var(--color-brand-crimson)', animationDuration: '6s', animationDelay: '-4s' }}></div>

            <div className="glass-panel p-8 w-[85%] max-w-[400px] relative z-20"
                 style={{ background: 'rgba(123, 10, 10, 0.85)', backdropFilter: 'blur(20px)' }}>
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <span className="font-bold text-white">PIN Validation Status</span>
                <span className="text-[#34D399] font-medium bg-[#10B981]/10 px-3 py-1 rounded-full text-xs border border-[#10B981]/20">Active & Valid</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center text-[#BEA0A0]">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <div className="font-bold text-white">Jane Doe</div>
                  <div className="text-sm text-[#BEA0A0]">P051XXXXXXZ</div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] p-4 rounded-lg border border-white/5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#BEA0A0]">Station</span>
                  <span className="font-semibold text-white">North Nairobi</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#BEA0A0]">Obligation</span>
                  <span className="font-semibold text-white">Income Tax Resident</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#6A0808]/20 py-6 overflow-hidden border-y border-white/10 my-12" aria-label="Feature highlight marquee">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
             <React.Fragment key={i}>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Instant Verification</span>
                <span className="px-12 text-xl font-bold text-[var(--color-brand-red)]">•</span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Secure Processing</span>
                <span className="px-12 text-xl font-bold text-[var(--color-brand-red)]">•</span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">PDF Generation</span>
                <span className="px-12 text-xl font-bold text-[var(--color-brand-red)]">•</span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Developer API</span>
                <span className="px-12 text-xl font-bold text-[var(--color-brand-red)]">•</span>
             </React.Fragment>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />

      {/* How It Works */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto w-full">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-4 text-white">How It Works</h2>
        <p className="text-center text-[#E8D5D5] mb-16 max-w-[600px] mx-auto text-lg">
          From ID to verified PIN certificate in 3 simple steps.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <div className="bg-[#111111] rounded-2xl p-8 text-center border border-white/10 shadow-lg hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_40px_rgba(227,6,19,0.3)] transition-all duration-300">
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-[var(--color-brand-red)]" aria-hidden="true">
              <Search size={28} />
            </div>
            <div className="text-sm font-semibold text-[var(--color-brand-red)] mb-2 uppercase tracking-wider">Step 1</div>
            <h3 className="text-xl font-bold mb-3 text-white">Enter Your ID</h3>
            <p className="text-[#E8D5D5] text-sm leading-relaxed">Input your National ID, Alien ID, or existing KRA PIN to begin the verification.</p>
          </div>
          
          <div className="bg-[#111111] rounded-2xl p-8 text-center border border-white/10 shadow-lg hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_40px_rgba(227,6,19,0.3)] transition-all duration-300">
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-[var(--color-brand-red)]" aria-hidden="true">
              <CheckCircle size={28} />
            </div>
            <div className="text-sm font-semibold text-[var(--color-brand-red)] mb-2 uppercase tracking-wider">Step 2</div>
            <h3 className="text-xl font-bold mb-3 text-white">Instant Verification</h3>
            <p className="text-[#E8D5D5] text-sm leading-relaxed">Our system queries the KRA sandbox in milliseconds and returns your full taxpayer details.</p>
          </div>
          
          <div className="bg-[#111111] rounded-2xl p-8 text-center border border-white/10 shadow-lg hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_40px_rgba(227,6,19,0.3)] transition-all duration-300">
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-[var(--color-brand-red)]" aria-hidden="true">
              <FileDown size={28} />
            </div>
            <div className="text-sm font-semibold text-[var(--color-brand-red)] mb-2 uppercase tracking-wider">Step 3</div>
            <h3 className="text-xl font-bold mb-3 text-white">Download Certificate</h3>
            <p className="text-[#E8D5D5] text-sm leading-relaxed">Generate and download a professional A4 PDF certificate, ready for print or submission.</p>
          </div>

        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-6 max-w-[1400px] mx-auto w-full">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-white">Everything you need.</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[300px_300px] gap-6">
          
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_40px_rgba(227,6,19,0.3)] group">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-auto text-white group-hover:bg-[var(--color-brand-red)]/20 group-hover:text-[var(--color-brand-red)] transition-colors" aria-hidden="true">
              <Zap size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Lightning Fast</h3>
            <p className="text-[#E8D5D5]/80 text-sm">Direct integration with KRA Sandbox for millisecond response times.</p>
          </div>
          
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_40px_rgba(227,6,19,0.3)] group">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-auto text-white group-hover:bg-[var(--color-brand-red)]/20 group-hover:text-[var(--color-brand-red)] transition-colors" aria-hidden="true">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Secure</h3>
            <p className="text-[#E8D5D5]/80 text-sm">Client-side processing. Your data never leaves your browser.</p>
          </div>
          
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 lg:row-span-2 group hover:-translate-y-1 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_40px_rgba(227,6,19,0.3)]">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-auto text-white group-hover:bg-[var(--color-brand-red)]/20 group-hover:text-[var(--color-brand-red)] transition-colors" aria-hidden="true">
              <FileText size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">A4 Certificates</h3>
            <p className="text-[#E8D5D5]/80 text-sm mb-6">Generate high-fidelity, print-ready PDF certificates compliant with 2026 standards.</p>
            <div className="bg-white/5 rounded-xl h-[120px] border border-white/10 w-full relative overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div className="w-full h-8 bg-white/10 rounded animate-pulse"></div>
                </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-crimson)] border-none rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 lg:col-span-2 group hover:shadow-[0_0_40px_rgba(227,6,19,0.5)]">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-auto text-white" aria-hidden="true">
              <Code size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Dev Friendly</h3>
            <p className="text-white/80 text-sm">Built for integration. Leverage our robust REST APIs with token caching and retries built in.</p>
          </div>
          
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_40px_rgba(227,6,19,0.3)] group">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-auto text-white group-hover:bg-[var(--color-brand-red)]/20 group-hover:text-[var(--color-brand-red)] transition-colors" aria-hidden="true">
              <Clock size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">History</h3>
            <p className="text-[#E8D5D5]/80 text-sm">Track your verifications seamlessly in your dashboard.</p>
          </div>
          
        </div>
      </section>

    </main>
  );
}
