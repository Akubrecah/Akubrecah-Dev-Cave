import Link from 'next/link';

export default function About() {
  return (
    <main className="min-h-screen py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--color-brand-red)]/20 blur-[100px] pointer-events-none" aria-hidden="true"></div>
        <h1 className="text-5xl font-bold text-white mb-6 relative z-10">About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">Us</span></h1>
        <p className="text-xl text-[#E8D5D5] leading-relaxed relative z-10">
          We build compliance tools that developers and businesses love to use.
        </p>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 md:p-12 mb-12 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">Our Mission</h2>
        <p className="text-[#BEA0A0] leading-relaxed mb-8">
          KRA PIN Checker Pro was designed to simplify tax compliance in Kenya. By providing a bridge between complex government APIs and modern web applications, we empower businesses to automate their KYC and compliance workflows instantly securely.
        </p>

        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">Why Choose Us?</h2>
        <ul className="space-y-4 text-[#BEA0A0] list-disc pl-5">
          <li><strong>Speed:</strong> We cache results and optimize API calls to give you verification in milliseconds.</li>
          <li><strong>Security:</strong> We don&apos;t store your sensitive tax information permanently. All processing is secure.</li>
          <li><strong>Developer First:</strong> Our API is easy to integrate, well-documented, and reliable with built-in retries.</li>
        </ul>
      </div>

      <div className="text-center">
        <Link href="/contact" className="btn-secondary px-8 py-4">
          Contact Support
        </Link>
      </div>
    </main>
  );
}
