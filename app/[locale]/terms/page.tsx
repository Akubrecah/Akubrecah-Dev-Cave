'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { LegalLayout, LegalSection } from '@/components/layout/LegalLayout';

export default function TermsPage() {
  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'accounts', title: 'User Accounts' },
    { id: 'conduct', title: 'User Conduct & Usage' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'billing', title: 'Billing & Refunds' },
    { id: 'liability', title: 'Liability & Warranty' },
    { id: 'indemnity', title: 'Indemnification' },
    { id: 'jurisdiction', title: 'Governing Law' }
  ];

  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Standard Usage Agreement"
      lastUpdated="April 7, 2026"
      sections={sections}
      icon={Shield}
    >
      <LegalSection 
        id="acceptance" 
        title="1. Acceptance of Terms" 
        tldr="By using Akubrecah, you agree to follow these rules. If you don't agree, please stop using the service."
      >
        <p>
          Welcome to Akubrecah Entertainment. By accessing or using our platform, 
          you agree to be bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy. 
          This is a legally binding agreement between you and Akubrecah Entertainment. 
          If you do not agree to these Terms, you are prohibited from using or accessing this site.
        </p>
      </LegalSection>

      <LegalSection 
        id="accounts" 
        title="2. User Accounts & Security" 
        tldr="You are responsible for keeping your login information safe and all activities that happen under your account."
      >
        <p>
          To access certain features, you must create a secure account. 
          You agree to provide accurate, current, and complete information. 
          You are solely responsible for maintaining the confidentiality of your account credentials 
          and for all activities that occur under your account. 
          We reserve the right to suspend any account that provides false data or violates our security protocols.
        </p>
      </LegalSection>

      <LegalSection 
        id="conduct" 
        title="3. User Conduct & Acceptable Use" 
        tldr="Don't use our tools for illegal activities, and don't try to break our system."
      >
        <p>
          You agree not to use the platform for any unlawful purpose or to:
        </p>
        <ul>
          <li>Upload, process, or distribute illegal content or materials that infringe on third-party rights.</li>
          <li>Attempt to gain unauthorized access to our Command Center, user databases, or computing infrastructure.</li>
          <li>Bypass rate limits or subscription tiers through automated scripts (except where explicitly allowed via API).</li>
          <li>Abuse our KRA verification tools for fraudulent tax reporting or identity theft.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="intellectual-property" 
        title="4. Intellectual Property" 
        tldr="We own the platform code and design. You own the content you create using our tools."
      >
        <p>
          All platform components, including the &quot;Command Center&quot; UI, proprietary PDF processing logic, 
          logos, and text, are the exclusive property of Akubrecah Entertainment. 
          We grant you a limited, non-exclusive license to use the platform for its intended purposes. 
          You retain full ownership of any document you process or generate using our local-execution tools.
        </p>
      </LegalSection>

      <LegalSection 
        id="billing" 
        title="5. Billing, Subscriptions &amp; Refunds" 
        tldr="Subscriptions recur automatically. You can cancel at any time, but refunds are only given in specific cases."
      >
        <p>
          Our platform offers both free and premium subscription tiers. 
          Premium tiers are billed in advance on a monthly or annual basis. 
          Subscriptions will automatically renew unless canceled at least 24 hours before the end of the billing cycle.
        </p>
        <p><strong>Refund Policy:</strong></p>
        <ul>
          <li>We offer a 7-day &quot;Satisfaction Guarantee&quot; for new subscriptions.</li>
          <li>Refunds for annual plans are calculated pro-rata after the first 30 days.</li>
          <li>Subscription cancellations are finalized at the end of the current billing cycle.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="liability" 
        title="6. Liability &amp; Warranty" 
        tldr="We provide the service &apos;as is&apos; and aren&apos;t liable for accidental data loss or service downtime."
      >
        <p>
          Akubrecah provides services on an &quot;as is&quot; and &quot;as available&quot; basis. 
          We make no warranties, expressed or implied, regarding the continuous availability of the platform 
          or the total accuracy of KRA-relayed data. In no event shall Akubrecah Entertainment be liable 
          for any damages arising out of the use or inability to use the platform.
        </p>
      </LegalSection>

      <LegalSection 
        id="indemnity" 
        title="7. Indemnification" 
        tldr="You agree to protect us if your actions on our platform lead to legal trouble."
      >
        <p>
          You agree to indemnify and hold harmless Akubrecah Entertainment and its affiliates 
          from and against any claims, damages, obligations, losses, or costs 
          arising from your use of the platform and any violation of these Terms.
        </p>
      </LegalSection>

      <LegalSection 
        id="jurisdiction" 
        title="8. Governing Law & Jurisdiction" 
        tldr="Any legal disputes will be resolved in Nairobi, Kenya."
      >
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Kenya. 
          Any disputes arising under or in connection with these Terms shall be subject 
          to the exclusive jurisdiction of the courts in Nairobi.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
