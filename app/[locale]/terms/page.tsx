import React from 'react';
import { Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#F9FAFB] text-[#2B2B2B] px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white border border-[#D1D5DB] rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#D1D5DB]/50">
            <div className="p-3 bg-[#F2F2F2] rounded-xl shadow-sm border border-[#D1D5DB] text-[#1F6F5B]">
              <Shield size={28} />
            </div>
            <h1 className="text-3xl font-black text-[#2B2B2B] tracking-tight">Terms of Service</h1>
          </div>
          
          <div className="prose prose-emerald max-w-none text-[#2B2B2B]/80 font-medium space-y-6">
            <p className="text-sm text-[#1F6F5B] font-bold">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement. Any participation in this service will constitute acceptance of this agreement.</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">2. Description of Service</h2>
            <p>Akubrecah Entertainment provides users with access to PDF modification tools and KRA reporting verification services. You must provide all equipment necessary for your own Internet connection and agree that the functionality is provided &quot;as is&quot;.</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">3. User Conduct</h2>
            <p>You agree not to use the service to process illegal content, infringe on copyright laws, or purposefully bypass security limitations. Misuse of the verification APIs will result in immediate termination of service access.</p>

            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">4. Privacy Policy</h2>
            <p>Our Privacy Policy, which sets out how we will use your information, can be found at our Privacy page. By using this platform, you consent to the processing described therein and warrant that all data provided by you is accurate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
