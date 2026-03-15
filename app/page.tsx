import Link from 'next/link';
import { ArrowRight, Search, FileDown, Zap, ShieldCheck, FileText, Code, Scissors, Combine, FileArchive } from 'lucide-react';
import React from 'react';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      
      {/* Dual Hero Section */}
      <section className="relative min-h-[95vh] flex items-center py-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-200px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }} aria-hidden="true"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[80%] pointer-events-none opacity-40"
             style={{ background: 'radial-gradient(ellipse at center, rgba(30, 60, 220, 0.2) 0%, transparent 60%)' }} aria-hidden="true"></div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          
          <div className="hero-text text-left">
            <h1 className="text-5xl lg:text-7xl font-bold font-sans text-white leading-tight mb-8 tracking-tight">
              One Platform. <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">
                KRA & PDFs.
              </span>
            </h1>
            <p className="text-xl text-[#E8D5D5] mb-12 max-w-[550px] leading-relaxed">
              Instantly verify KRA PINs and generate compliance certificates. Plus, access a suite of secure, lightning-fast PDF manipulation tools right in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="btn-primary text-base px-8 py-4 flex items-center justify-center gap-2 group">
                <Search size={20} /> Verify KRA PIN <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pdf-tools" className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold tracking-wide text-white bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                <FileText size={20} className="mr-2" /> Explore PDF Tools
              </Link>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-6 h-[500px] lg:h-[600px]">
            {/* Top Visual - KRA */}
            <div className="relative rounded-3xl border border-white/10 overflow-hidden group" 
                 style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #111111 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-red)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-6 left-6 bg-[var(--color-brand-red)]/20 text-[var(--color-brand-red)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-brand-red)]/30 backdrop-blur-md">
                KRA Compliance System
              </div>
              <div className="h-full flex items-center justify-center p-8">
                 <div className="glass-panel p-6 w-full max-w-[350px] border border-white/10 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
                      style={{ background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(20px)' }}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                         <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                         Live Gateway
                      </div>
                      <span className="text-[#34D399] font-medium bg-[#10B981]/10 px-2 py-1 rounded-md text-xs border border-[#10B981]/20">Valid PIN</span>
                    </div>
                    <div className="h-4 w-3/4 bg-white/10 rounded mb-3"></div>
                    <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                 </div>
              </div>
            </div>

            {/* Bottom Visual - PDF Tools */}
            <div className="relative rounded-3xl border border-white/10 overflow-hidden group" 
                 style={{ background: 'linear-gradient(135deg, #111111 0%, #0a0a0a 100%)' }}>
               <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="absolute top-6 left-6 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30 backdrop-blur-md">
                Pro PDF Suite
              </div>
              <div className="h-full flex gap-4 p-8 pt-16 items-center justify-center">
                 <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:-translate-y-2 transition-transform duration-300">
                    <Combine size={28} className="text-white" />
                    <span className="text-xs font-bold text-white/70">Merge</span>
                 </div>
                 <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:-translate-y-4 transition-transform duration-300 delay-75 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <Scissors size={28} className="text-white" />
                    <span className="text-xs font-bold text-white/70">Split</span>
                 </div>
                 <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:-translate-y-2 transition-transform duration-300 delay-150">
                    <FileArchive size={28} className="text-white" />
                    <span className="text-xs font-bold text-white/70">Compress</span>
                 </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#6A0808]/20 py-6 overflow-hidden border-y border-white/10 my-12 backdrop-blur-sm" aria-label="Feature highlight marquee">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap items-center" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
             <React.Fragment key={i}>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Verify KRA PINs</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Merge PDFs</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Compress Files</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Developer API</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
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

      {/* Unified Features Grid */}
      <section className="py-24 px-6 max-w-[1400px] mx-auto w-full">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Everything you need for compliance and documents.</h2>
          <p className="text-[#E8D5D5] text-xl max-w-2xl mx-auto">One subscription unlocks industry-leading tax verification and secure, client-side document processing.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[300px_300px] gap-6">
          
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-red)] group">
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 rounded-xl flex items-center justify-center mb-auto text-[var(--color-brand-red)] transition-colors" aria-hidden="true">
              <Zap size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Instant KRA API</h3>
            <p className="text-[#E8D5D5]/80 text-sm">Direct integration with KRA Sandbox for millisecond response times on validations.</p>
          </div>
          
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-auto text-blue-400 transition-colors" aria-hidden="true">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">100% Private PDFs</h3>
            <p className="text-[#E8D5D5]/80 text-sm">PDFs are processed entirely inside your browser via WebAssembly. Zero uploads.</p>
          </div>
          
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 lg:row-span-2 group hover:-translate-y-1 hover:border-white/30">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-auto text-white" aria-hidden="true">
              <FileDown size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Automated Certificates</h3>
            <p className="text-[#E8D5D5]/80 text-base mb-8">Generate high-fidelity, print-ready PDF certificates compliant with 2026 standards instantly after KRA verification.</p>
            <div className="bg-[#111111] rounded-xl h-[200px] border border-white/10 w-full relative overflow-hidden flex flex-col items-center justify-center shadow-inner" aria-hidden="true">
                <FileText size={64} className="text-white/20 mb-4" />
                <div className="h-2 w-1/2 bg-white/10 rounded-full mb-2"></div>
                <div className="h-2 w-1/3 bg-white/10 rounded-full"></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-crimson)] border-none rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 lg:col-span-2 group shadow-xl">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-auto text-white" aria-hidden="true">
              <Code size={28} />
            </div>
            <h3 className="text-3xl font-bold mb-3 text-white">Developer Friendly APIs</h3>
            <p className="text-white/90 text-lg max-w-md">Built for scale. Leverage our robust REST APIs with token caching, webhooks, and automatic retries built in.</p>
            
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
               <span className="font-mono text-[200px] leading-none text-white font-black">{'{ }'}</span>
            </div>
          </div>
          
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/30 group">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-auto text-white" aria-hidden="true">
              <Combine size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Pro Utilities</h3>
            <p className="text-[#E8D5D5]/80 text-sm">Split 100-page contracts, merge financial records, and compress large decks in seconds.</p>
          </div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 border-t border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#111111]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to streamline your workflow?</h2>
          <p className="text-[#BEA0A0] text-xl mb-12 max-w-2xl mx-auto">Join thousands of professionals securing their compliance and managing documents faster.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/pricing" className="btn-primary text-lg px-10 py-5">
              View Pricing Tiers
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Projects */}
      <section className="py-24 px-6 bg-[#f8f8f8]">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-16">
            <div className="text-[var(--color-brand-red)] font-bold uppercase tracking-widest text-sm mb-2">Portfolio</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#111111]">Latest Projects</h2>
            <div className="w-20 h-1.5 bg-[var(--color-brand-red)] rounded-full mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                name: "Core Kids Academy", 
                url: "https://corekidsacademy.com/", 
                img: "https://dhali.com/wp-content/uploads/2025/06/core-kids-academy-clients-dhali.jpg" 
              },
              { 
                name: "Sierra Meat & Seafood", 
                url: "https://sierrameat.com/", 
                img: "https://dhali.com/wp-content/uploads/2024/05/Home-Sierra-Meat-resize-1.jpg" 
              },
              { 
                name: "SOCAL Put", 
                url: "https://socalput.com/", 
                img: "https://dhali.com/wp-content/uploads/2025/06/socalput-clients-dhali.jpg" 
              }
            ].map((project, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <img 
                  src={project.img} 
                  alt={project.name} 
                  className="w-full aspect-[16/9] object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#110c26] to-transparent opacity-90 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-2xl font-bold text-white mb-4">{project.name}</h3>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[var(--color-brand-red)] font-bold hover:text-white transition-colors">
                    Visit Website <ArrowRight size={18} className="ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link href="/clients" className="btn-primary px-10 py-4 text-lg">
              View All Clients
            </Link>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-24 px-6 bg-[#ececec]">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-16">
            <div className="text-[var(--color-brand-red)] font-bold uppercase tracking-widest text-sm mb-2">Service Excellence</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#111111]">Our Process</h2>
            <div className="w-20 h-1.5 bg-[var(--color-brand-red)] rounded-full mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Design",
                desc: "Creating a wire-frame design mock up of your website, taking your feedback and input into consideration.",
                img: "https://dhali.com/wp-content/uploads/2024/07/Dhali-Icon-design-white-1.png"
              },
              {
                title: "Develop",
                desc: "Hand-coding your design into a working WordPress website with dynamic elements and custom features.",
                img: "https://dhali.com/wp-content/uploads/2024/07/Dhali-Icon-website-dev-white-1.png"
              },
              {
                title: "Manage",
                desc: "Including website and database backups, security and plug-in updates while hosted on secure WHM platform servers.",
                img: "https://dhali.com/wp-content/uploads/2024/07/Dhali-Icon-management-white-1.svg"
              },
              {
                title: "Maintain",
                desc: "Servicing your website with timely updates and edits when requested by you, and offering training for your new website.",
                img: "https://dhali.com/wp-content/uploads/2024/07/Dhali-Icon-fixes-updates-white-1.png"
              }
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="h-24 bg-[#110d28] relative flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#110d28] rounded-full absolute -bottom-10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <img src={step.img} alt={step.title} className="w-12 h-12 object-contain" />
                  </div>
                </div>
                <div className="p-8 pt-16 text-center">
                  <h3 className="text-2xl font-bold text-[#111111] mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">{step.desc}</p>
                  <Link href="/services" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-[var(--color-brand-red)] transition-colors">
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://dhali.com/wp-content/uploads/2024/03/Testimonials.jpg" 
            alt="Testimonials Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        </div>
        
        <div className="max-w-[1000px] mx-auto w-full relative z-10 text-center">
          <div className="mb-16">
            <div className="text-[var(--color-brand-red)] font-bold uppercase tracking-widest text-sm mb-2">Success Stories</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white">Our Happy Clients</h2>
            <div className="w-20 h-1.5 bg-[var(--color-brand-red)] rounded-full mx-auto mt-6"></div>
          </div>
          
          <div className="space-y-12">
            {[
              {
                text: "Thank you for making this such an easy experience. You have all been wonderful! I am excited to look at the site better. Thank you so very much!",
                author: "Nicole Caggiano",
                role: "Owner, Leaps N Bounders"
              },
              {
                text: "Akubrecah Dev Cave provides impeccable service. They helped us with website design, maintenance, hosting, etc. I never have to worry about the details, Ravi and his team provide exceptional expert skills to address any opportunities that arise.",
                author: "Carolyn Sham",
                role: "Marketing Director, Custom Leather Craft"
              }
            ].map((t, i) => (
              <div key={i} className="glass-panel p-12 relative">
                <span className="text-6xl text-[var(--color-brand-red)] absolute top-4 left-6 opacity-20 font-serif">“</span>
                <p className="text-xl lg:text-2xl text-[#E8D5D5] italic leading-relaxed mb-8">
                  {t.text}
                </p>
                <div className="text-white">
                  <h4 className="font-bold text-lg">{t.author}</h4>
                  <p className="text-[var(--color-brand-red)] text-sm uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Publications */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-16">
            <div className="text-[var(--color-brand-red)] font-bold uppercase tracking-widest text-sm mb-2">Our Insights</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#111111]">Our Publications</h2>
            <div className="w-20 h-1.5 bg-[var(--color-brand-red)] rounded-full mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "How Akubrecah Dev Cave Builds Websites That Integrate with the Action Jackrabbit Plugin",
                date: "March 5, 2026",
                category: "WordPress",
                link: "https://dhali.com/design/how-dhali-builds-websites-that-integrate-with-the-action-jackrabbit-plugin/"
              },
              {
                title: "Why a Clean Staging Migration Is the Safest Way to Fix a Broken WordPress Site",
                date: "March 1, 2026",
                category: "Support",
                link: "https://dhali.com/support/why-a-clean-staging-migration-is-the-safest-way-to-fix-a-broken-wordpress-site/"
              },
              {
                title: "Jackrabbit Class Website Integration for Swim & Gym Schools",
                date: "February 18, 2026",
                category: "Design",
                link: "https://dhali.com/wordpress/jackrabbit-class-website-integration-for-swim-gym-schools/"
              }
            ].map((post, i) => (
              <div key={i} className="group bg-[#f8f8f8] rounded-2xl p-8 border border-gray-100 hover:border-[var(--color-brand-red)] hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{post.category}</span>
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">{post.date}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#111111] mb-6 line-clamp-2 group-hover:text-[var(--color-brand-red)] transition-colors">
                  {post.title}
                </h3>
                <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-bold text-[#111111] hover:text-[var(--color-brand-red)] transition-colors group">
                  Read More <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section id="about" className="py-24 px-6 bg-[#ececec] text-[#111111]">
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img 
              src="https://dhali.com/wp-content/uploads/2024/05/Dhali-about-us.png" 
              alt="About Us" 
              className="rounded-2xl shadow-2xl relative z-10"
            />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[var(--color-brand-red)]/10 rounded-full blur-3xl z-0"></div>
          </div>
          
          <div className="space-y-6">
            <div className="text-[var(--color-brand-red)] font-bold uppercase tracking-widest text-sm">Who We Are</div>
            <h2 className="text-4xl lg:text-5xl font-bold font-sans">Akubrecah Dev Cave is your complete technology partner.</h2>
            <div className="w-20 h-1.5 bg-[var(--color-brand-red)] rounded-full mb-8"></div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Akubrecah Dev Cave is your complete internet and technology solutions provider. We design, host, maintain and manage high quality websites since 1996.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Let our expert team provide you with the service and support you expect from leading website design experts. With over 20 years of experience, you can be assured of our quality and strong customer service.
            </p>
            <div className="flex items-center gap-8 pt-6">
               <img 
                 src="https://dhali.com/wp-content/uploads/2024/05/Reponsive-Design-green-1.png" 
                 alt="Responsive Design Icon" 
                 className="w-24 h-auto"
               />
               <div>
                 <h4 className="font-bold text-xl mb-1">Expert Support</h4>
                 <p className="text-gray-600 text-sm">A full staff to answer your emails and phone calls instantly.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
