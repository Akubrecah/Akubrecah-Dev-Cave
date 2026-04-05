import React from 'react';
import { Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#F9FAFB] text-[#2B2B2B] px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white border border-[#D1D5DB] rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#D1D5DB]/50">
            <div className="p-3 bg-[#F2F2F2] rounded-xl shadow-sm border border-[#D1D5DB] text-[#1F6F5B]">
              <Lock size={28} />
            </div>
            <h1 className="text-3xl font-black text-[#2B2B2B] tracking-tight">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-emerald max-w-none text-[#2B2B2B]/80 font-medium space-y-6">
            <p className="text-sm text-[#1F6F5B] font-bold">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">Information We Do Not Collect</h2>
            <p>Our platform is built strictly on local execution principles for PDF manipulation. When using the PDF functionality, your files are never uploaded to our servers. All parsing, merging, and modifications occur entirely locally within your browser's memory sandbox.</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">Information We Collect</h2>
            <p>We may collect account-related information (such as your email and name) if you authenticate using our secure authentication providers. When using our authorized APIs (like KRA reporting services), necessary tax station fields and identity records are temporarily relayed securely over HTTPS strictly for fulfilling that real-time operation.</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">How We Use Your Data</h2>
            <p>All structured user metadata is utilized exclusively for enforcing subscription limits, generating compliance certificates, and providing real-time transaction reporting on your dashboard. We firmly mandate that we will never sell, distribute, or otherwise lease your personal information to third parties.</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">Data Security</h2>
            <p>We implement a variety of stringent security measures to maintain the safety of your personal information. High-availability cloud encryption protects your account records, ensuring GDPR compliance and complete confidentiality of any PII required for service delivery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
