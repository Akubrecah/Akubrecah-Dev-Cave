'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { LegalLayout, LegalSection } from '@/components/layout/LegalLayout';

export default function PrivacyPage() {
  const sections = [
    { id: 'data-collection', title: 'Data Collection' },
    { id: 'processing-basis', title: 'Processing Basis' },
    { id: 'global-compliance', title: 'Global Compliance' },
    { id: 'user-rights', title: 'Your Legal Rights' },
    { id: 'data-retention', title: 'Data Retention' },
    { id: 'security', title: 'Security Protocols' },
    { id: 'subprocessors', title: 'Sub-processors' }
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Data Governance & Protection"
      lastUpdated="April 7, 2026"
      sections={sections}
      icon={Lock}
    >
      <LegalSection 
        id="data-collection" 
        title="Information We Collect" 
        tldr="We collect minimal account data and zero file-content data. Your PDFs never leave your machine."
      >
        <p>
          At Akubrecah, we operate on a &quot;Privacy-by-Design&quot; principle. 
          The core functionality of our PDF tools is purely client-side; all parsing, merging, 
          and manipulation occurs within your browser&apos;s local memory sandbox. We do not see or store the contents of your files.
        </p>
        <p><strong>Specifically, we collect:</strong></p>
        <ul>
          <li><strong>Identity Data:</strong> Full name and email address provided during account registration or SSO authentication.</li>
          <li><strong>Transaction Data:</strong> Subscription tier, payment history (processed via Stripe/Paystack), and credit utilization.</li>
          <li><strong>Technical Data:</strong> IP addresses, browser types, and operating system metadata for session security and anti-fraud monitoring.</li>
          <li><strong>Usage Data:</strong> Anonymized interaction logs with specific UI components to improve platform performance.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="processing-basis" 
        title="Lawful Basis for Processing" 
        tldr="We process data only when necessary to provide the service or when you give us explicit consent."
      >
        <p>
          Under the General Data Protection Regulation (GDPR) and similar frameworks, 
          we rely on the following legal bases to process your personal information:
        </p>
        <ul>
          <li><strong>Performance of a Contract:</strong> To manage your account and provide the services you have subscribed to.</li>
          <li><strong>Legal Obligation:</strong> To comply with tax laws and anti-money laundering regulations (e.g., KRA reporting compliance).</li>
          <li><strong>Legitimate Interests:</strong> To improve our services, detect security threats, and prevent unauthorized access to our system.</li>
          <li><strong>Consent:</strong> When you subscribe to our newsletter or participate in Beta testing features.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="global-compliance" 
        title="Global Compliance (GDPR &amp; CCPA)" 
        tldr="We adhere to the highest global standards for data protection, ensuring your rights are protected worldwide."
      >
        <p>
          Whether you are in the European Union or California, we extend the following guarantees:
        </p>
        <ul>
          <li><strong>GDPR (EU):</strong> We operate as a Data Controller for your account information and a Data Processor for any service-related metadata. We use secure EEA-based or equivalent adequacy-standard data centers.</li>
          <li><strong>CCPA/CPRA (California):</strong> We do not &quot;sell&quot; your personal information. You have the &quot;Right to Know&quot; and the &quot;Right to Opt-Out&quot; of any non-essential data collection.</li>
          <li><strong>Regional Mandates:</strong> We comply with Kenya&apos;s Data Protection Act for local transaction reporting and KRA verification services.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="user-rights" 
        title="Your Legal Rights" 
        tldr="You have full control over your data, including the right to access, edit, or delete it at any time."
      >
        <p>
          You possess the following rights regarding your personal data:
        </p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal information we hold about you via the Admin Dashboard.</li>
          <li><strong>Correction:</strong> Update inaccurate information directly in your Profile settings.</li>
          <li><strong>Erasure (The Right to be Forgotten):</strong> Request the permanent deletion of your account and associated records.</li>
          <li><strong>Portability:</strong> Receive a machine-readable export of your transaction and usage history.</li>
          <li><strong>Withdrawal of Consent:</strong> Opt-out of marketing communications or non-essential cookies.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="data-retention" 
        title="Data Retention &amp; Purging" 
        tldr="We keep your data only as long as your account is active, plus a mandatory statutory period for tax records."
      >
        <p>
          Personal data is retained only for the duration necessary for the purposes outlined in this policy:
        </p>
        <ul>
          <li><strong>Account Records:</strong> Maintained for the lifetime of the account plus 12 months post-deactivation.</li>
          <li><strong>Financial Records:</strong> Retained for 7 years to comply with statutory tax and auditing requirements.</li>
          <li><strong>Usage Logs:</strong> Anonymized after 30 days and permanently deleted after 90 days.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="security" 
        title="Security Protocols" 
        tldr="Our architecture uses military-grade encryption and isolated execution to ensure data integrity."
      >
        <p>
          We implement a multi-layered security strategy:
        </p>
        <ul>
          <li><strong>In-Transit:</strong> All data is encrypted using TLS 1.3 protocols.</li>
          <li><strong>At-Rest:</strong> Database records are encrypted using AES-256 standards.</li>
          <li><strong>Isolation:</strong> PDF processing is sandboxed in the client browser, preventing horizontal data leakage.</li>
          <li><strong>Monitoring:</strong> 24/7 automated threat detection and anomaly reporting via our Command Center.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="subprocessors" 
        title="Third-Party Sub-processors" 
        tldr="We only share data with vetted infrastructure partners necessary for service delivery."
      >
        <p>
          To provide a seamless experience, we use the following vetted partners:
        </p>
        <ul>
          <li><strong>Cloud Infrastructure:</strong> Vercel (Deployment & Hosting)</li>
          <li><strong>Database:</strong> Neon DB (PostgreSQL managed service)</li>
          <li><strong>Authentication:</strong> NextAuth (OAuth 2.0 integration)</li>
          <li><strong>Payments:</strong> Stripe / Paystack (Financial processing)</li>
        </ul>
      </LegalSection>
    </LegalLayout>
  );
}
