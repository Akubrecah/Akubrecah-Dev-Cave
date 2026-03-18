"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileCheck2, FileText, ArrowLeft, Eye, CheckCircle, Coins, Search, Hash, 
  Download, Activity, Zap 
} from 'lucide-react';

import { KENYA_DATA } from '@/lib/kenya-data';

export default function Dashboard() {
  const router = useRouter();
  
  // Define showStatus early so it can be used in useEffect
  const showStatus = (message: string, isError = false, isPending = false) => {
    setStatusMessage(message);
    setIsStatusError(isError);
    setIsStatusPending(isPending);
    
    if (!isPending) {
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };
  
  // Dashboard routing
  const [selectedService, setSelectedService] = useState<'selection' | 'kra'>('selection');
  const [feature, setFeature] = useState<'generator' | 'viewer'>('generator');
  const [verifyMode, setVerifyMode] = useState<'id' | 'pin'>('pin');
  
  // KRA Wizard stats
  const [stats, setStats] = useState({ verifications: 0, certificates: 0, credits: 5 });
  
  // Viewer state
  const [viewerInput, setViewerInput] = useState('');
  const [viewerIdType, setViewerIdType] = useState('KE'); // Used in Quick View
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerResult, setViewerResult] = useState<Record<string, string> | null>(null);
  
  // Generator State
  const [currentStep, setCurrentStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');
  const [isStatusError, setIsStatusError] = useState(false);
  const [isStatusPending, setIsStatusPending] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    kraPin: '',
    idNumber: '',
    idType: 'KE',
    taxpayerName: '',
    email: '',
    building: '',
    street: '',
    city: '',
    county: '',
    district: '',
    lrNumber: '',
    box: '',
    postal: '',
    taxArea: '',
    obligation: 'INCOME TAX - RESIDENT INDIVIDUAL',
    station: '',
    status: 'Active',
    fromDate: '',
    tillDate: 'N.A.',
    activity: ''
  });

  const certContainerRef = useRef<HTMLDivElement>(null);

  // Subscription state
  const [subscription, setSubscription] = useState<{
    tier: string;
    end?: string;
    pdfEnd?: string;
    isCyberPro: boolean;
    hasPdfPremium: boolean;
    role: string;
  } | null>(null);
  const [usage, setUsage] = useState<{ KRA: number; PDF: number; limit: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Initialize and fetch user status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/user/status');
        if (res.ok) {
          const data = await res.json();
          setSubscription({
            tier: data.subscriptionTier,
            end: data.subscriptionEnd,
            pdfEnd: data.pdfPremiumEnd,
            isCyberPro: data.isCyberPro,
            hasPdfPremium: data.hasPdfPremium,
            role: data.role
          });
          setUsage(data.usage || null);
          setStats(prev => ({ ...prev, credits: data.credits ?? prev.credits }));
        }
      } catch (err) {
        console.error('Failed to fetch user status:', err);
      }
    };

    fetchStatus();
    
    // Check for successful payment and poll if necessary
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      showStatus('Payment successful! Syncing your subscription...', false, true);
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        const res = await fetch('/api/user/status');
        if (res.ok) {
          const data = await res.json();
          if (data.subscriptionStatus === 'active') {
             setSubscription({
               tier: data.subscriptionTier,
               end: data.subscriptionEnd,
               pdfEnd: data.pdfPremiumEnd,
               isCyberPro: data.isCyberPro,
               hasPdfPremium: data.hasPdfPremium,
               role: data.role
             });
             setUsage(data.usage || null);
             setStats(prev => ({ ...prev, credits: data.credits ?? prev.credits }));
             showStatus('Subscription activated successfully!');
             clearInterval(pollInterval);
             // Remove query params
             router.replace('/dashboard');
          }
        }
        if (attempts >= 10) {
          clearInterval(pollInterval);
          showStatus('Subscription update is taking a moment. Please refresh in a few seconds.', false, false);
        }
      }, 2000);
      return () => clearInterval(pollInterval);
    }

    const storedStats = localStorage.getItem('userStats');
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    } else {
      setStats({ verifications: 0, certificates: 0, credits: 5 });
    }
  }, [router]);

  // Timer logic
  useEffect(() => {
    if (!subscription) return;

    const targetDate = subscription.tier === 'daily' 
      ? subscription.pdfEnd 
      : subscription.end;

    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(targetDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(distance / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [subscription]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Expired';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      'daily': 'Daily PDF Premium',
      'weekly': 'Cyber Pro (Weekly)',
      'monthly': 'Cyber Pro (Monthly)',
      'premium_weekly': 'Cyber Premium (Weekly)',
      'premium_monthly': 'Cyber Premium (Monthly)'
    };
    return labels[tier] || 'Selection Mode';
  };

  // Update formData helpers
  const updateForm = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountyChange = (county: string) => {
    const countyData = KENYA_DATA[county];
    setFormData(prev => ({
      ...prev,
      county,
      district: '',
      postal: countyData ? countyData.postalCode : ''
    }));
  };

  const verifyAndAutofill = async () => {
    const isPinMode = verifyMode === 'pin';
    const inputValue = isPinMode ? formData.kraPin : formData.idNumber;

    if (!inputValue) {
      showStatus(`Please enter a ${isPinMode ? 'KRA PIN' : 'ID Number'}`, true);
      return;
    }

    showStatus('Verifying with KRA...', false, true);

    try {
      const endpoint = isPinMode 
        ? '/api/kra/check-pin-by-pin' 
        : '/api/kra/check-pin';
      
      const body = isPinMode 
        ? { pin: inputValue.toUpperCase() } 
        : { idType: formData.idType, idNumber: inputValue };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.errorMessage || `KRA API returned ${res.status}`);
      }

      const result = await res.json();
      
      setFormData(prev => ({
        ...prev,
        kraPin: result.TaxpayerPIN || prev.kraPin,
        taxpayerName: result.TaxpayerName || prev.taxpayerName,
        obligation: result.Type || prev.obligation,
        status: result.Status || prev.status
      }));

      // Update local storage stats for UI
      const newStats = { ...stats, verifications: stats.verifications + 1 };
      setStats(newStats);
      localStorage.setItem('userStats', JSON.stringify(newStats));

      showStatus('Verification successful! Details updated.');
    } catch (error: Error | unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Error occurred during verification';
      
      if (msg.includes('429') || msg.toLowerCase().includes('limit reached')) {
        showStatus('Daily limit reached. Redirecting to upgrade...', true);
        setTimeout(() => router.push('/pricing?reason=kra_limit_reached'), 1500);
        return;
      }
      
      showStatus(msg, true);
    }
  };

  const handleQuickView = async () => {
    if (!viewerInput) {
      alert(`Please enter a ${verifyMode === 'pin' ? 'PIN' : 'ID Number'}`);
      return;
    }
    setViewerLoading(true);
    setViewerResult(null);
    try {
      const endpoint = verifyMode === 'pin' 
        ? '/api/kra/check-pin-by-pin' 
        : '/api/kra/check-pin';
      
      const body = verifyMode === 'pin' 
        ? { pin: viewerInput.toUpperCase() } 
        : { idType: viewerIdType, idNumber: viewerInput };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.errorMessage || `KRA API returned ${res.status}`);
      }
      const data = await res.json();
      setViewerResult(data);
    } catch (err: Error | unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('429') || msg.toLowerCase().includes('limit reached')) {
        setViewerResult({ error: 'Daily limit reached. Please upgrade for unlimited access.' });
        setTimeout(() => router.push('/pricing?reason=kra_limit_reached'), 2000);
      } else {
        setViewerResult({ error: msg });
      }
    } finally {
      setViewerLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!formData.taxpayerName) {
      showStatus('Please enter at least the Taxpayer Name', true);
      return;
    }

    showStatus('Checking user limits...', false, true);

    try {
      const limitRes = await fetch('/api/user/generate', { method: 'POST' });
      
      const contentType = limitRes.headers.get('content-type');
      let limitData: Record<string, unknown> = {};
      
      if (contentType && contentType.includes('application/json')) {
        limitData = await limitRes.json() as Record<string, unknown>;
      } else {
        const text = await limitRes.text();
        throw new Error(`Unexpected non-JSON response from server (Status: ${limitRes.status}). ${text.substring(0, 50)}...`);
      }
      
      if (!limitRes.ok) {
         showStatus((limitData.error as string) || 'Failed to authorize generation', true);
         // Redirect to pricing with context
         router.push('/pricing?reason=kra_limit_reached');
         return;
      }

      showStatus('Generating PDF...', false, true);

      // Lazy load html2pdf client-side
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = certContainerRef.current;
      if (!element) throw new Error('Certificate container not found');

      // Unhide the ref temporarily for generation
      element.style.display = 'flex';

      const filename = formData.kraPin 
        ? `KRA_PIN_Certificate_${formData.kraPin}.pdf` 
        : `KRA_PIN_Certificate_${formData.taxpayerName.replace(/\\s+/g, '_')}.pdf`;
      
      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
      
      element.style.display = 'none';

      // Update local storage stats for UI purely for display feedback
      const newStats = { ...stats, certificates: stats.certificates + 1 };
      setStats(newStats);
      localStorage.setItem('userStats', JSON.stringify(newStats));
      
      let successMsg = 'Certificate generated successfully!';
      if (limitData.remainingFreeGenerates !== undefined) {
         successMsg += ` (${limitData.remainingFreeGenerates} free uses left today)`;
      }
      showStatus(successMsg);

    } catch (err: unknown) {
      console.error(err);
      let errorDetail = 'Unknown error';
      if (err instanceof Error) errorDetail = err.message;
      else if (typeof err === 'string') errorDetail = err;
      showStatus(`Failed to generate PDF: ${errorDetail}`, true);
      if (certContainerRef.current) certContainerRef.current.style.display = 'none';
    }
  };

  // UI Selection Views
  if (selectedService === 'selection') {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-[var(--color-text-secondary)] text-lg mb-12">Choose a service to get started</p>
          
          <div className="max-w-2xl mx-auto">
            <div 
              onClick={() => setSelectedService('kra')}
              className="bg-[#111111] border border-white/10 p-12 rounded-3xl cursor-pointer hover:-translate-y-2 hover:border-[var(--color-brand-red)] transition-all duration-300 text-center"
            >
              <div className="w-20 h-20 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileCheck2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">KRA PIN CERTIFICATE</h2>
              <p className="text-[var(--color-text-secondary)] mb-6">Verify KRA PINs and generate professional PDF certificates with full taxpayer details.</p>
              <button className="w-full py-3 rounded-xl bg-[var(--color-brand-red)] text-white font-bold hover:bg-[var(--color-deep-crimson)] transition-colors">
                ENTER KRA DASHBOARD →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- HTML2PDF Certificate Template (Hidden in DOM, rendered by html2pdf) ---
  const todayStr = new Date().toLocaleDateString('en-GB');

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Navigation back */}
        <button 
          onClick={() => setSelectedService('selection')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> BACK TO SERVICES
        </button>

        {/* Top Controls Generator vs Viewer */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div 
            onClick={() => setFeature('generator')}
            className={`p-6 rounded-2xl cursor-pointer border-2 transition-all flex items-center gap-4 ${feature === 'generator' ? 'border-[var(--color-brand-red)] bg-[#111111]' : 'border-white/10 bg-black/50 hover:border-white/20'}`}
          >
            <div className={`p-4 rounded-xl ${feature === 'generator' ? 'bg-[var(--color-brand-red)]/20 text-[var(--color-brand-red)]' : 'bg-white/5 text-white/50'}`}>
              <FileCheck2 size={24} />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${feature === 'generator' ? 'text-white' : 'text-white/50'}`}>GENERATE CERTIFICATE</h3>
              <p className="text-sm text-white/50">Full verification & PDF download</p>
            </div>
          </div>

          <div 
            onClick={() => setFeature('viewer')}
            className={`p-6 rounded-2xl cursor-pointer border-2 transition-all flex items-center gap-4 ${feature === 'viewer' ? 'border-[#F5C200] bg-[#111111]' : 'border-white/10 bg-black/50 hover:border-white/20'}`}
          >
            <div className={`p-4 rounded-xl ${feature === 'viewer' ? 'bg-[#F5C200]/20 text-[#F5C200]' : 'bg-white/5 text-white/50'}`}>
              <Eye size={24} />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${feature === 'viewer' ? 'text-white' : 'text-white/50'}`}>QUICK PIN VIEW</h3>
              <p className="text-sm text-white/50">View details without generating certificate</p>
            </div>
          </div>
        </div>

        {/* View mode block */}
        {feature === 'viewer' && (
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 max-w-3xl mx-auto">
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setVerifyMode('pin')}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${verifyMode === 'pin' ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red)]/10 text-white' : 'border-white/10 text-white/40 hover:border-white/20'}`}
              >
                PIN VERIFICATION
              </button>
              <button 
                onClick={() => setVerifyMode('id')}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${verifyMode === 'id' ? 'border-[#34D399] bg-[#34D399]/10 text-white' : 'border-white/10 text-white/40 hover:border-white/20'}`}
              >
                ID VERIFICATION
              </button>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1 flex gap-2">
                {verifyMode === 'id' && (
                  <select
                    value={viewerIdType}
                    onChange={e => setViewerIdType(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:border-[#34D399] focus:outline-none transition-colors max-w-[130px]"
                  >
                    <option value="KE">Resident (KE)</option>
                    <option value="NKE">Non-Resident (NKE)</option>
                    <option value="NKENR">Non-Kenyan (NKENR)</option>
                    <option value="COMP">Company (COMP)</option>
                  </select>
                )}
                <div className="relative flex-1">
                  {verifyMode === 'pin' ? <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} /> : <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />}
                  <input 
                    type="text" 
                    value={viewerInput}
                    onChange={e => setViewerInput(verifyMode === 'pin' ? e.target.value.toUpperCase() : e.target.value)}
                    placeholder={verifyMode === 'pin' ? "Enter KRA PIN (e.g., A001234567Z)" : "Enter National ID Number"}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white uppercase focus:outline-none focus:border-[#34D399]"
                  />
                </div>
              </div>
              <button 
                onClick={handleQuickView}
                disabled={viewerLoading}
                className={`font-bold px-8 rounded-xl transition-colors disabled:opacity-50 ${verifyMode === 'pin' ? 'bg-[#F5C200] text-black hover:bg-[#F5C200]/90' : 'bg-[#34D399] text-black hover:bg-[#34D399]/90'}`}
              >
                {viewerLoading ? 'VERIFYING...' : 'VERIFY'}
              </button>
            </div>

            {viewerResult && (
              <div className="mt-8 p-6 bg-black/50 rounded-2xl border border-white/5">
                {viewerResult.error ? (
                  <p className="text-[var(--color-brand-red)]">{viewerResult.error}</p>
                ) : (
                  <div className="text-white space-y-2">
                    <p><strong>Result:</strong> {viewerResult.TaxpayerPIN || viewerInput}</p>
                    <p><strong>Name:</strong> {viewerResult.TaxpayerName || 'N/A'}</p>
                    <p><strong>Type:</strong> {viewerResult.Type || 'N/A'}</p>
                    <p><strong>Status:</strong> {viewerResult.Status || 'N/A'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Generator mode block */}
        {feature === 'generator' && (
          <>
            {/* Stats & Subscription Timer */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-[#111111] rounded-2xl p-6 border border-white/5 flex items-center gap-3">
                <div className="bg-white/5 p-2 rounded-lg text-white/50"><CheckCircle size={20} /></div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.verifications}</div>
                  <div className="text-[10px] text-white/40 uppercase">Verifications</div>
                </div>
              </div>
              <div className="bg-[#111111] rounded-2xl p-6 border border-white/5 flex items-center gap-3">
                <div className="bg-white/5 p-2 rounded-lg text-white/50"><FileText size={20} /></div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.certificates}</div>
                  <div className="text-[10px] text-white/40 uppercase">Certificates</div>
                </div>
              </div>


              <div className="bg-[#111111] rounded-2xl p-6 border border-white/5 flex items-center gap-3">
                <div className="bg-[var(--color-brand-red)]/10 p-2 rounded-lg text-[var(--color-brand-red)]"><Coins size={20} /></div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.credits}</div>
                  <div className="text-[10px] text-[var(--color-brand-red)] uppercase">Credits</div>
                </div>
              </div>
              
              {/* Timer Block */}
              <div className={`rounded-2xl p-4 border transition-all flex items-center justify-between gap-3 ${timeLeft !== null && timeLeft > 0 ? 'bg-[var(--color-brand-red)]/20 border-[var(--color-brand-red)]/30' : 'bg-[#111111] border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${timeLeft !== null && timeLeft > 0 ? 'bg-[var(--color-brand-red)] text-white' : 'bg-white/5 text-white/50 animate-pulse'}`}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white leading-tight">
                      {timeLeft !== null ? formatTime(timeLeft) : 'No Plan'}
                    </div>
                    <div className="text-[9px] text-white/60 uppercase tracking-widest font-semibold mt-1">
                      {subscription?.tier ? getTierLabel(subscription.tier) : (usage ? `KRA ${usage.KRA}/${usage.limit}` : 'Free Tier')}
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="grid lg:grid-cols-5 gap-8">
              {/* Wizard Form */}
              <div className="lg:col-span-3 bg-[#111111] rounded-3xl border border-white/10 p-8">
                
                {/* Steps Header */}
                <div className="flex items-center justify-between mb-10 relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-white/5 z-0"></div>
                  
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => setCurrentStep(step)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= step ? 'bg-[var(--color-brand-red)] text-white' : 'bg-[#222] text-white/30 border border-white/10'}`}>
                        {step}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= step ? 'text-white/80' : 'text-white/30'}`}>
                        {step === 1 ? 'Verify' : step === 2 ? 'Personal' : step === 3 ? 'Address' : 'Tax & Gen'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status Message */}
                {statusMessage && (
                  <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${isStatusError ? 'bg-red-500/10 border-red-500/20 text-red-400' : isStatusPending ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                    {isStatusError ? <Activity size={18} /> : isStatusPending ? <Search size={18} className="animate-pulse" /> : <CheckCircle size={18} />}
                    {statusMessage}
                  </div>
                )}

                {/* Form Sections */}
                <div className="space-y-6">
                  {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-xl font-bold text-white mb-6">VERIFICATION STEP</h3>
                      
                      <div className="flex gap-4 mb-6">
                        <button 
                          onClick={() => setVerifyMode('pin')}
                          className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${verifyMode === 'pin' ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red)]/10 text-white' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                        >
                          PIN VERIFICATION
                        </button>
                        <button 
                          onClick={() => setVerifyMode('id')}
                          className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${verifyMode === 'id' ? 'border-[#34D399] bg-[#34D399]/10 text-white' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                        >
                          ID VERIFICATION
                        </button>
                      </div>

                      <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4">
                        {verifyMode === 'pin' ? (
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase mb-2">KRA PIN</label>
                            <input 
                              type="text" 
                              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase focus:border-[var(--color-brand-red)] focus:outline-none transition-colors"
                              placeholder="e.g., A012345678Z"
                              value={formData.kraPin}
                              onChange={(e) => updateForm('kraPin', e.target.value.toUpperCase())}
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase mb-2">Resident Type & ID Number</label>
                            <div className="flex gap-2">
                              <select
                                value={formData.idType}
                                onChange={e => updateForm('idType', e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#34D399] focus:outline-none transition-colors max-w-[150px]"
                              >
                                <option value="KE">Kenyan Resident</option>
                                <option value="NKE">Non-Resident</option>
                                <option value="NKENR">Non-Kenyan</option>
                                <option value="COMP">Company</option>
                              </select>
                              <input 
                                type="text" 
                                className="flex-1 w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#34D399] focus:outline-none transition-colors"
                                placeholder="e.g., 12345678"
                                value={formData.idNumber}
                                onChange={(e) => updateForm('idNumber', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        
                        <button 
                          onClick={verifyAndAutofill}
                          disabled={isStatusPending}
                          className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${verifyMode === 'pin' ? 'bg-[var(--color-brand-red)]/20 border border-[var(--color-brand-red)]/30 hover:bg-[var(--color-brand-red)]/30' : 'bg-[#34D399]/20 border border-[#34D399]/30 hover:bg-[#34D399]/30'}`}
                        >
                          <Search size={18} /> {isStatusPending ? 'VERIFYING...' : 'VERIFY & AUTO-FILL'}
                        </button>
                      </div>
                      <div className="flex justify-end mt-8">
                        <button onClick={() => setCurrentStep(2)} className="py-3 px-6 bg-[var(--color-brand-red)] text-white rounded-xl font-bold hover:bg-[var(--color-deep-crimson)] transition-colors">
                          NEXT: PERSONAL DETAILS →
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-xl font-bold text-white mb-6">PERSONAL DETAILS</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-white/50 uppercase mb-2">Taxpayer Name *</label>
                          <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase focus:border-[var(--color-brand-red)] outline-none" placeholder="FULL NAME AS PER KRA" value={formData.taxpayerName} onChange={(e) => updateForm('taxpayerName', e.target.value.toUpperCase())} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-white/50 uppercase mb-2">Email Address</label>
                          <input type="email" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[var(--color-brand-red)] outline-none" placeholder="email@example.com" value={formData.email} onChange={(e) => updateForm('email', e.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-between mt-8">
                        <button onClick={() => setCurrentStep(1)} className="py-3 px-6 border border-white/20 text-white rounded-xl font-bold hover:bg-white/5 transition-colors">← BACK</button>
                        <button onClick={() => setCurrentStep(3)} className="py-3 px-6 bg-[var(--color-brand-red)] text-white rounded-xl font-bold hover:bg-[var(--color-deep-crimson)] transition-colors">NEXT: ADDRESS →</button>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-xl font-bold text-white mb-6">ADDRESS DETAILS</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">Building</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase outline-none" value={formData.building} onChange={(e) => updateForm('building', e.target.value.toUpperCase())} /></div>
                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">Street/Road</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase outline-none" value={formData.street} onChange={(e) => updateForm('street', e.target.value.toUpperCase())} /></div>
                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">City/Town</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase outline-none" value={formData.city} onChange={(e) => updateForm('city', e.target.value.toUpperCase())} /></div>
                        
                        <div>
                          <label className="block text-xs font-bold text-white/50 uppercase mb-2">County</label>
                          <select className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase outline-none" value={formData.county} onChange={(e) => handleCountyChange(e.target.value)}>
                            <option value="">-- SELECT COUNTY --</option>
                            {Object.keys(KENYA_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-white/50 uppercase mb-2">Sub-County</label>
                          <select className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase outline-none" value={formData.district} onChange={(e) => updateForm('district', e.target.value)}>
                            <option value="">-- SUB-COUNTY --</option>
                            {formData.county && KENYA_DATA[formData.county]?.subCounties.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                          </select>
                        </div>

                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">L.R. Number</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase outline-none" value={formData.lrNumber} onChange={(e) => updateForm('lrNumber', e.target.value.toUpperCase())} /></div>
                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">P.O. Box</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase outline-none" value={formData.box} onChange={(e) => updateForm('box', e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">Postal Code</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase outline-none" value={formData.postal} onChange={(e) => updateForm('postal', e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">Tax Area</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase outline-none" value={formData.taxArea} onChange={(e) => updateForm('taxArea', e.target.value.toUpperCase())} /></div>
                      </div>
                      <div className="flex justify-between mt-8">
                        <button onClick={() => setCurrentStep(2)} className="py-3 px-6 border border-white/20 text-white rounded-xl font-bold hover:bg-white/5 transition-colors">← BACK</button>
                        <button onClick={() => setCurrentStep(4)} className="py-3 px-6 bg-[var(--color-brand-red)] text-white rounded-xl font-bold hover:bg-[var(--color-deep-crimson)] transition-colors">NEXT: TAX DETAILS →</button>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-xl font-bold text-white mb-6">TAX DETAILS</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-white/50 uppercase mb-2">Tax Obligation</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase" value={formData.obligation} onChange={(e) => updateForm('obligation', e.target.value.toUpperCase())} /></div>
                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">Station</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase" value={formData.station} onChange={(e) => updateForm('station', e.target.value.toUpperCase())} /></div>
                        <div>
                          <label className="block text-xs font-bold text-white/50 uppercase mb-2">Status</label>
                          <select className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white" value={formData.status} onChange={(e) => updateForm('status', e.target.value)}>
                            <option value="Active">Active</option><option value="Dormant">Dormant</option><option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">Effective From</label><input type="date" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white" value={formData.fromDate} onChange={(e) => updateForm('fromDate', e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-white/50 uppercase mb-2">Effective Till</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase" value={formData.tillDate} onChange={(e) => updateForm('tillDate', e.target.value)} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-white/50 uppercase mb-2">Principal Activity</label><input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white uppercase" placeholder="e.g., RETAIL TRADE" value={formData.activity} onChange={(e) => updateForm('activity', e.target.value.toUpperCase())} /></div>
                      </div>
                      <div className="flex justify-between mt-8">
                        <button onClick={() => setCurrentStep(3)} className="py-3 px-6 border border-white/20 text-white rounded-xl font-bold hover:bg-white/5 transition-colors">← BACK</button>
                        <button onClick={generateCertificate} disabled={isStatusPending} className="py-3 px-6 bg-[#F5C200] text-black rounded-xl font-extrabold flex items-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50">
                          <Download size={18} /> GENERATE CERTIFICATE
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Live Preview Side Panel */}
              <div className="lg:col-span-2">
                <div className="sticky top-24 bg-[#111111] rounded-3xl border border-white/10 p-6 overflow-hidden">
                  <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Live Preview</h3>
                  
                  <div className="bg-white rounded-xl p-6 text-black relative shadow-lg">
                    <div className="absolute top-0 w-full h-8 bg-black/5 opacity-50 left-0"></div>
                    
                    <div className="text-center border-b border-black/10 pb-4 mb-4 relative z-10">
                      <h4 className="font-bold text-sky-900 border border-sky-900 mx-auto w-max px-4 py-1 text-sm bg-sky-50">CERTIFICATE PREVIEW</h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-500">PIN</span>
                        <span className="font-bold">{formData.kraPin || '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-500">Taxpayer</span>
                        <span className="font-bold">{formData.taxpayerName || '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-500">Address</span>
                        <span className="text-right">
                          {[formData.building, formData.street, formData.city].filter(Boolean).join(', ') || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-500">Tax Obligation</span>
                        <span className="text-right">{formData.obligation || '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-500">Status</span>
                        <span className={`font-bold ${formData.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>{formData.status}</span>
                      </div>
                    </div>

                    <div className="mt-6 text-[10px] text-gray-400 text-center">
                      Disclaimer : This is a live preview. Click Generate to download the official PDF.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* Hidden Certificate Container for html2pdf */}
      <div 
        ref={certContainerRef} 
        style={{ display: 'none', width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm', boxSizing: 'border-box', fontFamily: '"Inter", system-ui, -apple-system, sans-serif', color: 'black', flexDirection: 'column', position: 'relative' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '15px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/kra-logo.jpeg" alt="KRA Logo" style={{ height: '50px' }} />
          </div>
          <div style={{ background: '#e5e7eb', padding: '10px 40px', fontWeight: 900, fontSize: '18px', border: '1px solid #d1d5db', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            PIN Certificate
          </div>
          <div style={{ textAlign: 'right', fontSize: '9px', lineHeight: 1.4 }}>
            <strong>For General Tax Questions<br/>Contact KRA Call Centre</strong><br/>
            Tel: +254 (020) 4999 999<br/>
            Cell: +254(0711)099 999<br/>
            Email: callcentre@kra.go.ke
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <div style={{ textAlign: 'right', lineHeight: 1.5 }}>
            <div style={{ fontSize: '11px' }}><strong>Certificate Date :</strong> {todayStr}</div>
            <div style={{ fontWeight: 700, fontSize: '12px', marginTop: '5px' }}>Personal Identification Number</div>
            <div style={{ fontWeight: 500, fontSize: '11px' }}>{formData.kraPin || 'N/A'}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '20px' }}>
          This is to certify that taxpayer shown herein has been registered with Kenya Revenue Authority
        </div>

        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Taxpayer Information</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 6px', fontWeight: 700, width: '30%' }}>Taxpayer Name</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}>{formData.taxpayerName || 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 6px', fontWeight: 700, width: '30%' }}>Email Address</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}>{formData.email || 'N/A'}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Registered Address</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>L.R. Number :</strong> {formData.lrNumber}</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>Building :</strong> {formData.building}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>Street/Road :</strong> {formData.street}</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>City/Town :</strong> {formData.city}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>County :</strong> {formData.county}</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>Sub-County :</strong> {formData.district}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>Tax Area :</strong> {formData.taxArea}</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>Station :</strong> {formData.station}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>P. O. Box :</strong> {formData.box}</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}><strong>Postal Code :</strong> {formData.postal}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Tax Obligation(s) Registration</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11px', textAlign: 'center' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '3px 6px' }}>Sr. No.</th>
              <th style={{ border: '1px solid black', padding: '3px 6px' }}>Tax Obligation(s)</th>
              <th style={{ border: '1px solid black', padding: '3px 6px' }}>Effective From Date</th>
              <th style={{ border: '1px solid black', padding: '3px 6px' }}>Effective Till</th>
              <th style={{ border: '1px solid black', padding: '3px 6px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}>1</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}>{formData.obligation}</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}>{formData.fromDate}</td>
              <td style={{ border: '1px solid black', padding: '3px 6px' }}>{formData.tillDate}</td>
              <td style={{ border: '1px solid black', padding: '3px 6px', color: formData.status === 'Active' ? 'green' : 'red', fontWeight: 600 }}>{formData.status}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '10px', lineHeight: 1.5, marginTop: 'auto', paddingTop: '20px' }}>
          The above PIN must appear on all your tax invoices and correspondences with Kenya Revenue Authority. 
          Your accounting end date is 31st December as per the provisions stated in the Income Tax Act unless 
          a change has been approved by the Commissioner-Domestic Taxes Department.
        </div>
        <div style={{ borderTop: '1px solid black', paddingTop: '5px', marginTop: '30px', fontWeight: 700, fontSize: '10px' }}>
          Disclaimer : This is a system generated certificate and does not require signature.
        </div>
      </div>
    </div>
  );
}
