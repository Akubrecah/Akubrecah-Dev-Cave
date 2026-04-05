import React from 'react';
import { Target } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#F9FAFB] text-[#2B2B2B] px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white border border-[#D1D5DB] rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#D1D5DB]/50">
            <div className="p-3 bg-[#F2F2F2] rounded-xl shadow-sm border border-[#D1D5DB] text-[#1F6F5B]">
              <Target size={28} />
            </div>
            <h1 className="text-3xl font-black text-[#2B2B2B] tracking-tight">Cookie Policy</h1>
          </div>
          
          <div className="prose prose-emerald max-w-none text-[#2B2B2B]/80 font-medium space-y-6">
            <p className="text-sm text-[#1F6F5B] font-bold">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">What Are Cookies</h2>
            <p>Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow) that enable the site's or service provider's systems to recognize your browser and capture and remember certain key operational information.</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">How We Use Cookies</h2>
            <p>We use cookies fundamentally to understand and save your preferences for future visits and compile aggregate data about site traffic. This analytical understanding allows us to continually optimize the UI and offer highly responsive toolkits in the future.</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">Essential Operational Cookies</h2>
            <p>Some cookies are strictly necessary for the core operation of our platform. This includes secure authentication tokens handling user login states across localized routes, and payment portal routing mechanisms, allowing you to seamlessly and safely traverse protected sectors of the application.</p>
            
            <h2 className="text-xl font-bold text-[#2B2B2B] mt-8 mb-4">Managing Cookies</h2>
            <p>You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies through your browser settings. However, if you turn cookies off, mission-critical features like logging into your admin reporting dashboard or accessing subscription tools may not function properly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
