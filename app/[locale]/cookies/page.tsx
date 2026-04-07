'use client';

import React from 'react';
import { Target, ExternalLink, ShieldCheck, Settings, PieChart } from 'lucide-react';
import Link from 'next/link';
import { LegalLayout, LegalSection } from '@/components/layout/LegalLayout';

export default function CookiesPage() {
  const sections = [
    { id: 'what-are-cookies', title: 'What Are Cookies?' },
    { id: 'how-we-use-cookies', title: 'How We Use Cookies' },
    { id: 'categories', title: 'Cookie Categories' },
    { id: 'specific-cookies', title: 'Our Primary Cookies' },
    { id: 'third-parties', title: 'Third-Party Cookies' },
    { id: 'management', title: 'Managing Cookies' }
  ];

  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Transparency & Tracking"
      lastUpdated="April 7, 2026"
      sections={sections}
      icon={Target}
    >
      <LegalSection 
        id="what-are-cookies" 
        title="What Are Cookies?" 
        tldr="Cookies are tiny data files saved on your device which help our website work correctly and remember your preferences."
      >
        <p>
          Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
          They are widely used to make websites work more efficiently and to provide information to the site owners. 
          Cookies allow our systems to recognize your browser and remember certain information about your session.
        </p>
      </LegalSection>

      <LegalSection 
        id="how-we-use-cookies" 
        title="How We Use Cookies" 
        tldr="We use cookies to keep you logged in, process payments, and understand how people use our PDF tools."
      >
        <p>
          We use cookies for the following primary purposes:
        </p>
        <ul>
          <li><strong>Authentication:</strong> Keeping you signed in as you move between different PDF tools and admin pages.</li>
          <li><strong>Security:</strong> Preventing cross-site request forgery (CSRF) and other malicious activities.</li>
          <li><strong>Preferences:</strong> Remembering your UI choices, language settings, and dashboard layouts.</li>
          <li><strong>Analytics:</strong> Understanding how users interact with our features to optimize performance and usability.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="categories" 
        title="Cookie Categories" 
        tldr="Cookies are split into three groups: Necessary, Functional, and Analytical."
      >
        <p>
          The cookies we use are categorized as follows:
        </p>
        <div className="grid md:grid-cols-3 gap-6 my-8">
          <div className="glass-panel p-5 border border-primary/20 bg-primary/5 rounded-2xl">
            <ShieldCheck size={20} className="text-primary mb-3" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Strictly Necessary</h4>
            <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-tighter">
              Essential for the core platform to function, such as login sessions and payment processing.
            </p>
          </div>
          <div className="glass-panel p-5 border border-white/10 bg-white/5 rounded-2xl">
            <Settings size={20} className="text-muted-foreground mb-3" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Functional</h4>
            <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-tighter">
              Used to remember your settings and provide enhanced, personalized features.
            </p>
          </div>
          <div className="glass-panel p-5 border border-white/10 bg-white/5 rounded-2xl">
            <PieChart size={20} className="text-muted-foreground mb-3" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Analytical</h4>
            <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-tighter">
              Used to track anonymized usage statistics to help us improve the platform.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection 
        id="specific-cookies" 
        title="Our Primary Cookies" 
        tldr="Here are the specific keys we use to manage your session."
      >
        <p>This table outlines the primary cookies set directly by Akubrecah:</p>
        <div className="overflow-x-auto rounded-xl border border-white/10 my-6">
          <table className="w-full text-left text-[10px] uppercase font-bold tracking-tighter">
            <thead className="bg-white/5 border-b border-white/10 text-primary">
              <tr>
                <th className="px-4 py-3">Cookie Name</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              <tr>
                <td className="px-4 py-3">next-auth.session</td>
                <td className="px-4 py-3">Handles user authentication across the site.</td>
                <td className="px-4 py-3">30 Days</td>
              </tr>
              <tr>
                <td className="px-4 py-3">__Host-next-auth.csrf</td>
                <td className="px-4 py-3">Security token for CSRF protection.</td>
                <td className="px-4 py-3">Session</td>
              </tr>
              <tr>
                <td className="px-4 py-3">akubrecah_locale</td>
                <td className="px-4 py-3">Stores your selected UI language preference.</td>
                <td className="px-4 py-3">1 Year</td>
              </tr>
              <tr>
                <td className="px-4 py-3">stripe_sid</td>
                <td className="px-4 py-3">Payment processing and fraud detection.</td>
                <td className="px-4 py-3">30 Mins</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection 
        id="third-parties" 
        title="Third-Party Cookies" 
        tldr="We use trusted partners like Vercel and Google to help us monitor performance and traffic."
      >
        <p>
          In some cases, we use cookies provided by trusted third parties. 
          The following section details which third-party cookies you might encounter through this site:
        </p>
        <ul>
          <li><strong>Vercel Analytics:</strong> Used to track performance and error logs to ensure high availability.</li>
          <li><strong>Google Analytics:</strong> We use an anonymized version of GA to understand user navigation flows.</li>
          <li><strong>Stripe / Paystack:</strong> These financial providers set cookies required for secure billing workflows.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="management" 
        title="Managing Your Cookie Preferences" 
        tldr="You can disable cookies in your browser, but this will break critical features like logging in."
      >
        <p>
          You have the right to decide whether to accept or reject cookies. 
          Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline them if you prefer.
        </p>
        <p><strong>Browser-Specific Instructions:</strong></p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="https://support.google.com/chrome/answer/95647" className="text-primary hover:underline flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-primary/10 px-3 py-2 rounded-xl border border-primary/20">
            Chrome <ExternalLink size={10} />
          </Link>
          <Link href="https://support.apple.com/en-ie/guide/safari/sfri11471/mac" className="text-primary hover:underline flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-primary/10 px-3 py-2 rounded-xl border border-primary/20">
            Safari <ExternalLink size={10} />
          </Link>
          <Link href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-primary hover:underline flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-primary/10 px-3 py-2 rounded-xl border border-primary/20">
            Firefox <ExternalLink size={10} />
          </Link>
        </div>
        <p className="mt-8 p-4 rounded-xl bg-warning/10 border border-warning/20 text-warning-foreground text-[10px] font-bold uppercase tracking-widest leading-relaxed">
          Warning: If you choose to disable all cookies, you will not be able to log in to your account or access premium PDF tool features.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
