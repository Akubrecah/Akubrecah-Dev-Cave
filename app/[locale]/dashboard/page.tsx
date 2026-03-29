"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileCheck2, FileText, ArrowLeft, Eye, CheckCircle2, Coins, Search,
  Activity, AlertCircle, Shield, Settings2, Terminal, Sparkles, ArrowRight, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { KENYA_DATA } from '@/lib/kenya-data';
import { NilReturnForm } from '@/components/kra/NilReturnForm';
import { useSearchParams } from 'next/navigation';

function DashboardContent() {
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
  const [feature, setFeature] = useState<'generator' | 'viewer' | 'nil-return'>('generator');
  const searchParams = useSearchParams();

  // Load feature from URL if present
  useEffect(() => {
    const f = searchParams.get('feature');
    if (f === 'nil-return') {
      setSelectedService('kra');
      setFeature('nil-return');
    }
  }, [searchParams]);
  const [verifyMode, setVerifyMode] = useState<'id' | 'pin'>('pin');
  
  const [marqueeSpeed, setMarqueeSpeed] = useState(50);

  // Sync initial marquee speed from server globally
  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        const marquee = data.find((n: any) => n.type === 'marquee' && n.active);
        if (marquee && marquee.speed) {
          setMarqueeSpeed(marquee.speed);
        }
      })
      .catch(console.error);
  }, []);
  
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
    fromDate: new Date().toISOString().split('T')[0],
    tillDate: 'N.A.',
    activity: ''
  });



  // Subscription state
  const [subscription, setSubscription] = useState<{
    tier: string;
    end?: string;
    pdfEnd?: string;
    isCyberPro: boolean;
    hasPdfPremium: boolean;
    role: string;
  } | null>(null);
  const [_usage, setUsage] = useState<{ KRA: number; PDF: number; limit: number } | null>(null);
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
    
    // Fetch initial marquee speed
    const fetchMarquee = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          const marquee = data.find((n: { type: string; speed?: number }) => n.type === 'marquee');
          if (marquee) setMarqueeSpeed(marquee.speed || 50);
        }
      } catch (err) {
        console.error('Failed to fetch marquee speed:', err);
      }
    };
    fetchMarquee();

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
      'premium_monthly': 'Cyber Premium (Monthly)',
      'premium_free': 'Promo: Free Access'
    };
    return labels[tier] || 'Selection Mode';
  };

  // Update formData helpers
  const updateForm = (field: keyof typeof formData, value: string) => {
    const finalValue = field === 'taxpayerName' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [field]: finalValue }));
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

  const getKRAValue = (obj: Record<string, unknown>, ...keys: string[]): string => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) return String(obj[key]);
      // Try case-insensitive
      const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
      if (foundKey) return String(obj[foundKey]);
    }
    return '';
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
        body: JSON.stringify(body),
        credentials: 'include' // Ensure session cookies are sent for potentially protected API routes
      });
      
      const result = await res.json().catch(() => ({}));
      console.log('[KRA-DASHBOARD] Verification response:', { status: res.status, ok: res.ok, result });

      if (!res.ok) {
        throw new Error(result.errorMessage || `KRA API returned ${res.status}`);
      }

      setFormData(prev => ({
        ...prev,
        kraPin: getKRAValue(result, 'TaxpayerPIN', 'PIN') || prev.kraPin,
        taxpayerName: (getKRAValue(result, 'TaxpayerName', 'Name') || prev.taxpayerName || '').toUpperCase(),
        obligation: getKRAValue(result, 'Type', 'TaxpayerType') || prev.obligation,
        status: getKRAValue(result, 'Status') || prev.status
      }));

      // Update local storage stats for UI
      const newStats = { ...stats, verifications: stats.verifications + 1 };
      setStats(newStats);
      localStorage.setItem('userStats', JSON.stringify(newStats));

      showStatus('Verification successful! Details updated.');
    } catch (error: Error | unknown) {
      console.error('[KRA-DASHBOARD] Verification error:', error);
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
        body: JSON.stringify(body),
        credentials: 'include'
      });

      const data = await res.json().catch(() => ({}));
      console.log('[KRA-DASHBOARD] QuickView response:', { status: res.status, ok: res.ok, data });

      if (!res.ok) {
        throw new Error(data.errorMessage || `KRA API returned ${res.status}`);
      }
      
      // Normalize data for consistent UI display
      const normalizedData = {
        ...data,
        TaxpayerPIN: getKRAValue(data, 'TaxpayerPIN', 'PIN'),
        TaxpayerName: getKRAValue(data, 'TaxpayerName', 'Name'),
        Type: getKRAValue(data, 'Type', 'TaxpayerType'),
        Status: getKRAValue(data, 'Status')
      };
      
      setViewerResult(normalizedData);
    } catch (err: Error | unknown) {
      console.error('[KRA-DASHBOARD] QuickView error:', err);
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

      // Template-based PDF generation using pdf-lib
      const { generateKraPdf } = await import('@/lib/pdf/generate-kra-pdf');
      
      const filename = formData.kraPin 
        ? `KRA_PIN_Certificate_${formData.kraPin}.pdf` 
        : `KRA_PIN_Certificate_${formData.taxpayerName.replace(/\s+/g, '_')}.pdf`;

      const pdfBytes = await generateKraPdf({
        ...formData,
        tillDate: formData.tillDate || 'N.A.'
      });
      
      const rawBytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes as ArrayBuffer);
      // .slice() returns a Uint8Array with a plain ArrayBuffer (not SharedArrayBuffer)
      const blob = new Blob([rawBytes.slice(0)], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      // Save certificate record to database for admin tracking
      try {
        await fetch('/api/user/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kraPin: formData.kraPin,
            taxpayerName: formData.taxpayerName,
            details: {
              ...formData,
              tillDate: formData.tillDate || 'N.A.'
            }
          })
        });
      } catch (saveErr) {
        console.error('Failed to save certificate record:', saveErr);
        // Don't show error to user as the PDF is already downloaded
      }
      
      // Clean up URL object
      setTimeout(() => URL.revokeObjectURL(link.href), 100);

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
    }
  };

  const handleUpdateMarqueeSpeed = (newSpeed: number) => {
    setMarqueeSpeed(newSpeed);
  };

  const commitMarqueeSpeed = async (newSpeed: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed: newSpeed })
      });
      router.refresh();
    } catch (err) {
      console.error('Failed to commit marquee speed:', err);
    }
  };

  if (selectedService === 'selection') {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 font-sans relative overflow-hidden bg-black text-white">
        {/* Glow Effects - Homepage Style */}
        <div className="absolute top-[-200px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }} aria-hidden="true" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[80%] pointer-events-none opacity-20"
             style={{ background: 'radial-gradient(ellipse at center, rgba(30, 60, 220, 0.2) 0%, transparent 60%)' }} aria-hidden="true" />

        <div className="max-w-[1400px] mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md text-white/90 mx-auto">
              <Sparkles className="h-4 w-4 text-[var(--color-brand-red)]" />
              <span className="text-sm font-black uppercase tracking-widest">Compliance Hub</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.85] mb-8 tracking-tighter italic">
              KRA <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">
                TERMINAL.
              </span>
            </h1>
            <p className="text-xl text-[#BEA0A0] max-w-[550px] mx-auto leading-relaxed font-bold uppercase tracking-wide">
              Secure node for real-time verification and automated compliance filing.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setSelectedService('kra')}
              className="glass-panel p-10 cursor-pointer border-white/10 hover:border-[var(--color-brand-red)] text-center transition-all duration-500 group rounded-[2.5rem] bg-[#0a0a0a] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-[var(--color-brand-red)]/5 blur-3xl rounded-full group-hover:bg-[var(--color-brand-red)]/10 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-green-500/10 mb-8 text-green-500 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-lg">
                  <FileCheck2 className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 italic tracking-tighter uppercase">Audit Core</h2>
                <p className="text-[#BEA0A0] text-sm leading-relaxed mb-8 uppercase tracking-widest font-bold">Professional verification & generation interface for instant KRA compliance data.</p>
                <div className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-[0.2em] border border-white/5 group-hover:bg-[var(--color-brand-red)] transition-all">
                  Initialize <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                setSelectedService('kra');
                setFeature('nil-return');
              }}
              className="glass-panel p-10 cursor-pointer border-white/10 hover:border-[var(--color-brand-yellow)] text-center transition-all duration-500 group rounded-[2.5rem] relative overflow-hidden bg-[#0a0a0a] shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]" />
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[var(--color-brand-yellow)]/5 blur-3xl rounded-full group-hover:bg-[var(--color-brand-yellow)]/10 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-yellow-500/10 mb-8 text-yellow-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Activity className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 italic tracking-tighter uppercase">Filing Node</h2>
                <p className="text-[#BEA0A0] text-sm leading-relaxed mb-8 uppercase tracking-widest font-bold">Automated interactive filing interface directly synchronized with KRA databases.</p>
                <div className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-[0.2em] border border-white/5 group-hover:bg-[var(--color-brand-yellow)] group-hover:text-black transition-all">
                  Initialize <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>

            <div className="glass-panel p-10 border border-white/10 rounded-3xl flex flex-col justify-between bg-[#111111]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Settings2 size={16} className="text-[var(--color-brand-red)]" /> System Interface
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-[#E8D5D5] uppercase tracking-wider">
                        <span>Marquee Speed</span>
                        <span className="text-[var(--color-brand-red)]">{marqueeSpeed}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="1000" 
                        step="5"
                        value={marqueeSpeed}
                        onChange={(e) => handleUpdateMarqueeSpeed(parseInt(e.target.value))}
                        onMouseUp={() => commitMarqueeSpeed(marqueeSpeed)}
                        onTouchEnd={() => commitMarqueeSpeed(marqueeSpeed)}
                        className="w-full h-2 bg-white/10 appearance-none rounded-full cursor-pointer accent-[var(--color-brand-red)]"
                      />
                    </div>
                  </div>
                </div>

                {subscription?.role === 'admin' && (
                  <button
                    onClick={() => router.push('/en/admin')}
                    className="w-full h-14 rounded-xl border border-[var(--color-brand-red)]/40 bg-[var(--color-brand-red)]/10 hover:bg-[var(--color-brand-red)]/20 transition-all flex items-center justify-center gap-3 group px-4"
                  >
                    <Shield className="w-5 h-5 text-[var(--color-brand-red)] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-white">Access Admin Console</span>
                  </button>
                )}
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-white/50">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- HTML2PDF Certificate Template (Hidden in DOM, rendered by html2pdf) ---

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 font-sans relative bg-black overflow-hidden text-white">
      {/* Homepage-style Glow Effects */}
      <div className="absolute top-[-200px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }} aria-hidden="true" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[80%] pointer-events-none opacity-20"
           style={{ background: 'radial-gradient(ellipse at center, rgba(30, 60, 220, 0.15) 0%, transparent 60%)' }} aria-hidden="true" />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Navigation & Telemetry Header */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3">
            <button 
              onClick={() => setSelectedService('selection')}
              className="inline-flex items-center gap-2 text-[#E8D5D5] hover:text-[var(--color-brand-red)] transition-colors group text-sm font-bold mb-2"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Modules
            </button>
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight flex items-center gap-6 italic tracking-tighter uppercase">
              <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10 shadow-2xl">
                <ShieldCheck className="text-[var(--color-brand-red)]" size={40} />
              </div>
              KRA Workspace
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="px-5 py-2 flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-xl text-green-500"><CheckCircle2 size={18} /></div>
              <div>
                <div className="text-sm font-bold text-white leading-none mb-1">{stats.verifications}</div>
                <div className="text-[10px] text-[#E8D5D5]/70 uppercase tracking-widest">Verifications</div>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="px-5 py-2 flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl text-blue-500"><FileText size={18} /></div>
              <div>
                <div className="text-sm font-bold text-white leading-none mb-1">{stats.certificates}</div>
                <div className="text-[10px] text-[#E8D5D5]/70 uppercase tracking-widest">Logs</div>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="px-5 py-2 flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-xl text-yellow-500"><Coins size={18} /></div>
              <div>
                <div className="text-sm font-bold text-white leading-none mb-1">{stats.credits}</div>
                <div className="text-[10px] text-[#E8D5D5]/70 uppercase tracking-widest">Credits</div>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className={`px-5 py-2 flex items-center gap-3 rounded-xl transition-all ${timeLeft !== null && timeLeft > 0 ? 'bg-[var(--color-brand-red)]/20 border border-[var(--color-brand-red)]/50' : ''}`}>
              <div className={`p-2 rounded-xl ${timeLeft !== null && timeLeft > 0 ? 'bg-[var(--color-brand-red)] text-white shadow-[0_0_15px_rgba(227,6,19,0.5)]' : 'bg-white/10 text-[#E8D5D5]/70'}`}>
                <Activity size={18} className={timeLeft !== null && timeLeft > 0 ? 'animate-pulse' : ''} />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none mb-1">
                  {timeLeft !== null ? formatTime(timeLeft) : 'Free Tier'}
                </div>
                <div className="text-[10px] text-[#E8D5D5]/70 uppercase tracking-widest">
                  {subscription?.tier ? getTierLabel(subscription.tier) : 'Guest'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-12 relative z-10 p-2 bg-white/5 rounded-[1.5rem] border border-white/10 inline-flex">
          <button 
            onClick={() => setFeature('generator')}
            className={`px-10 py-5 rounded-2xl flex items-center gap-4 transition-all font-black text-sm uppercase tracking-widest ${feature === 'generator' ? 'bg-[var(--color-brand-red)] text-white shadow-[0_0_30px_rgba(227,6,19,0.4)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            <FileCheck2 size={20} /> PDF Certificate
          </button>

          <button 
            onClick={() => setFeature('viewer')}
            className={`px-8 py-4 rounded-xl flex items-center gap-3 transition-all font-bold text-sm border ${feature === 'viewer' ? 'bg-[var(--color-brand-red)] text-white shadow-[0_0_20px_rgba(227,6,19,0.3)] border-transparent' : 'bg-white/5 text-[#E8D5D5]/70 hover:bg-white/10 hover:text-white border-white/10'}`}
          >
            <Eye size={18} /> Quick Verification
          </button>

          <button 
            onClick={() => setFeature('nil-return')}
            className={`px-8 py-4 rounded-xl flex items-center gap-3 transition-all font-bold text-sm border ${feature === 'nil-return' ? 'bg-[var(--color-brand-red)] text-white shadow-[0_0_20px_rgba(227,6,19,0.3)] border-transparent' : 'bg-white/5 text-[#E8D5D5]/70 hover:bg-white/10 hover:text-white border-white/10'}`}
          >
            <Activity size={18} /> File Nil Return
          </button>
        </div>

        {/* Module Viewports */}
        <AnimatePresence mode="wait">
          {feature === 'viewer' && (
            <motion.div 
              key="viewer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto border border-white/10 bg-slate-950/50 p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Scanning Protocol</h4>
                    <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Initialize Target Audit</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex bg-white/5 p-1 border border-white/10">
                      <button 
                        onClick={() => setVerifyMode('pin')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${verifyMode === 'pin' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                      >
                        PIN AUTH
                      </button>
                      <button 
                        onClick={() => setVerifyMode('id')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${verifyMode === 'id' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                      >
                        ID AUTH
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {verifyMode === 'id' && (
                        <select
                          value={viewerIdType}
                          onChange={e => setViewerIdType(e.target.value)}
                          className="bg-black border border-white/20 px-4 text-[10px] font-bold text-white uppercase focus:border-primary outline-none"
                        >
                          <option value="KE">Resident (KE)</option>
                          <option value="NKE">Non-Resident (NKE)</option>
                          <option value="NKENR">Non-Kenyan (NKENR)</option>
                          <option value="COMP">Company (COMP)</option>
                        </select>
                      )}
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          value={viewerInput}
                          onChange={e => setViewerInput(verifyMode === 'pin' ? e.target.value.toUpperCase() : e.target.value)}
                          placeholder={verifyMode === 'pin' ? "AXXXXXXXXX" : "CARD NUMBER"}
                          className="w-full bg-black border border-white/20 py-4 px-6 text-xl font-mono text-white uppercase focus:border-primary focus:outline-none placeholder:text-white/10"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleQuickView}
                      disabled={viewerLoading}
                      className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] italic transition-all disabled:opacity-50"
                    >
                      {viewerLoading ? 'EXECUTING SCAN...' : 'RUN VERIFICATION'}
                    </button>
                  </div>
                </div>

                <div className="bg-black/60 border border-white/5 p-8 relative min-h-[300px] flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Audit Result / Output</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-primary animate-pulse" />
                      <div className="w-1 h-1 bg-primary/60 animate-pulse delay-75" />
                      <div className="w-1 h-1 bg-primary/30 animate-pulse delay-150" />
                    </div>
                  </div>

                  {viewerResult ? (
                    <div className="flex-1 font-mono text-xs space-y-4">
                      {viewerResult.error ? (
                        <div className="text-primary p-4 border border-primary/20 bg-primary/5 uppercase font-bold italic">
                          System Fault: {viewerResult.error}
                        </div>
                      ) : (
                        <div className="space-y-4 animate-in fade-in duration-500">
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">PIN Identity</p>
                            <p className="text-white font-black text-lg tracking-widest">{viewerResult.TaxpayerPIN || viewerInput}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Legal Name</p>
                            <p className="text-white uppercase leading-tight font-black">{(viewerResult.TaxpayerName || 'N/A')}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Entity Type</p>
                              <p className="text-white text-[10px] font-black uppercase">{viewerResult.Type || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Compliance Status</p>
                              <p className="text-primary text-[10px] font-black uppercase">{viewerResult.Status || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 filter grayscale">
                      <Search size={48} className="mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Command Input</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Nil Return Dispatch */}
          {feature === 'nil-return' && (
            <motion.div 
              key="nil-return"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-[1400px] mx-auto"
            >
               <NilReturnForm />
            </motion.div>
          )}

        {/* Generator mode block */}
        {feature === 'generator' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid lg:grid-cols-12 gap-0 border border-white/10 bg-slate-900/20"
          >
            {/* Left: Configuration Console */}
            <div className="lg:col-span-7 p-12 border-r border-white/10">
              <div className="mb-12 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Module 01 / Generation</h3>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Configuration Matrix</p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(step => (
                    <div 
                      key={step} 
                      onClick={() => setCurrentStep(step)}
                      className={`w-8 h-8 flex items-center justify-center text-[10px] font-black cursor-pointer transition-all border ${currentStep === step ? 'bg-primary border-primary text-white' : 'border-white/10 text-slate-600 hover:border-white/30'}`}
                    >
                      0{step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Message */}
              <AnimatePresence>
                {statusMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 border-l-4 mb-8 flex items-center gap-4 ${isStatusError ? 'bg-primary/5 border-primary text-primary' : 'bg-emerald-500/5 border-emerald-500 text-emerald-500'}`}
                  >
                    {isStatusError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{statusMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Sections */}
              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Authentication Protocol</label>
                        <div className="flex bg-white/5 p-1 border border-white/10">
                          <button 
                            onClick={() => setVerifyMode('pin')}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${verifyMode === 'pin' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                          >
                            PIN VERIFY
                          </button>
                          <button 
                            onClick={() => setVerifyMode('id')}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${verifyMode === 'id' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                          >
                            ID VERIFY
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {verifyMode === 'pin' ? (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Taxpayer PIN</label>
                            <input 
                              type="text" 
                              className="w-full h-16 bg-black border border-white/20 px-6 text-2xl font-mono text-white uppercase focus:border-primary outline-none transition-all"
                              placeholder="AXXXXXXXXX"
                              value={formData.kraPin}
                              onChange={(e) => updateForm('kraPin', e.target.value.toUpperCase())}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2 col-span-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resident Type</label>
                              <select
                                value={formData.idType}
                                onChange={e => updateForm('idType', e.target.value)}
                                className="w-full h-16 bg-black border border-white/20 px-4 text-[10px] font-black text-white uppercase focus:border-primary outline-none"
                              >
                                <option value="KE">Resident</option>
                                <option value="NKE">Non-Res</option>
                                <option value="COMP">Company</option>
                              </select>
                            </div>
                            <div className="space-y-2 col-span-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">ID Number</label>
                              <input 
                                type="text" 
                                className="w-full h-16 bg-black border border-white/20 px-6 text-2xl font-mono text-white focus:border-primary outline-none"
                                placeholder="00000000"
                                value={formData.idNumber}
                                onChange={(e) => updateForm('idNumber', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        
                        <button 
                          onClick={verifyAndAutofill}
                          disabled={isStatusPending}
                          className="w-full h-16 border border-primary text-primary hover:bg-primary hover:text-white transition-all font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic"
                        >
                          <Search size={16} /> {isStatusPending ? 'EXECUTIVE QUERY...' : 'EXECUTE AUTO-DISCOVERY'}
                        </button>
                      </div>

                      <div className="pt-8 border-t border-white/5 flex justify-end">
                        <button onClick={() => setCurrentStep(2)} className="h-14 px-10 bg-white text-black font-black uppercase tracking-widest italic hover:bg-primary hover:text-white transition-all">
                          Proceed to Personal &rarr;
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Taxpayer Name (Full Legal)</label>
                          <input type="text" className="w-full h-16 bg-black border border-white/20 px-6 text-xl font-black text-white uppercase focus:border-primary outline-none" placeholder="IDENTIFIED NAME" value={formData.taxpayerName} onChange={(e) => updateForm('taxpayerName', e.target.value.toUpperCase())} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Email Link</label>
                          <input type="email" className="w-full h-16 bg-black border border-white/20 px-6 text-lg font-medium text-white focus:border-primary outline-none" placeholder="link@network.kra" value={formData.email} onChange={(e) => updateForm('email', e.target.value)} />
                        </div>
                      </div>
                      <div className="pt-8 border-t border-white/5 flex justify-between">
                        <button onClick={() => setCurrentStep(1)} className="h-14 px-8 border border-white/10 text-slate-500 font-black uppercase tracking-widest transition-all hover:text-white hover:border-white/30">&larr; Revise</button>
                        <button onClick={() => setCurrentStep(3)} className="h-14 px-10 bg-white text-black font-black uppercase tracking-widest italic hover:bg-primary hover:text-white transition-all">Address Matrix &rarr;</button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-600">Building / Suite</label>
                          <input type="text" className="w-full h-12 bg-black border border-white/10 px-4 text-xs font-bold text-white uppercase outline-none focus:border-primary" value={formData.building} onChange={(e) => updateForm('building', e.target.value.toUpperCase())} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-600">Street / Grid</label>
                          <input type="text" className="w-full h-12 bg-black border border-white/10 px-4 text-xs font-bold text-white uppercase outline-none focus:border-primary" value={formData.street} onChange={(e) => updateForm('street', e.target.value.toUpperCase())} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-600">City / District</label>
                          <input type="text" className="w-full h-12 bg-black border border-white/10 px-4 text-xs font-bold text-white uppercase outline-none focus:border-primary" value={formData.city} onChange={(e) => updateForm('city', e.target.value.toUpperCase())} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-600">Administrative County</label>
                          <select className="w-full h-12 bg-black border border-white/10 px-4 text-[10px] font-black text-white uppercase outline-none focus:border-primary" value={formData.county} onChange={(e) => handleCountyChange(e.target.value)}>
                            <option value="">-- SELECT --</option>
                            {Object.keys(KENYA_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-600">L.R. Record Number</label>
                          <input type="text" className="w-full h-12 bg-black border border-white/10 px-4 text-xs font-bold text-white uppercase outline-none focus:border-primary" value={formData.lrNumber} onChange={(e) => updateForm('lrNumber', e.target.value.toUpperCase())} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-600">Postal Code</label>
                          <input type="text" className="w-full h-12 bg-black border border-white/10 px-4 text-xs font-bold text-white outline-none focus:border-primary" value={formData.postal} onChange={(e) => updateForm('postal', e.target.value)} />
                        </div>
                      </div>
                      <div className="pt-8 border-t border-white/5 flex justify-between">
                        <button onClick={() => setCurrentStep(2)} className="h-14 px-8 border border-white/10 text-slate-500 font-black uppercase tracking-widest transition-all hover:text-white hover:border-white/30">&larr; Revise</button>
                        <button onClick={() => setCurrentStep(4)} className="h-14 px-10 bg-white text-black font-black uppercase tracking-widest italic hover:bg-primary hover:text-white transition-all">Finalize Schema &rarr;</button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tax Obligation Control</label>
                          <input type="text" readOnly className="w-full h-16 bg-white/5 border border-white/10 px-6 text-xs font-black text-white/40 uppercase cursor-not-allowed" value={formData.obligation} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Infrastructure Station</label>
                          <input type="text" className="w-full h-16 bg-black border border-white/20 px-6 text-sm font-black text-white uppercase focus:border-primary outline-none" placeholder="STATION ID" value={formData.station} onChange={(e) => updateForm('station', e.target.value.toUpperCase())} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activation Date</label>
                          <input type="date" className="w-full h-16 bg-black border border-white/20 px-6 text-sm font-black text-white uppercase focus:border-primary outline-none" value={formData.fromDate} onChange={(e) => updateForm('fromDate', e.target.value)} />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Principal Activity Description</label>
                          <input type="text" className="w-full h-16 bg-black border border-white/20 px-6 text-sm font-black text-white uppercase focus:border-primary outline-none" placeholder="E.G., INDUSTRIAL LOGISTICS" value={formData.activity} onChange={(e) => updateForm('activity', e.target.value.toUpperCase())} />
                        </div>
                      </div>
                      <div className="pt-8 border-t border-white/5 flex justify-between">
                        <button onClick={() => setCurrentStep(3)} className="h-14 px-8 border border-white/10 text-slate-500 font-black uppercase tracking-widest transition-all hover:text-white hover:border-white/30">&larr; Revise</button>
                        <button onClick={generateCertificate} disabled={isStatusPending} className="h-14 px-12 bg-primary text-white font-black uppercase tracking-[0.2em] italic hover:bg-white hover:text-black transition-all shadow-[0_10px_30px_rgba(227,6,19,0.3)]">
                          {isStatusPending ? 'ENGAGING ENGINE...' : 'DOWNLOAD P.IDENTITY / PDF'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Live Telemetry Schematic */}
            <div className="lg:col-span-5 bg-black/40 p-12 flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <Activity size={12} className="text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Telemetry</span>
                </div>
                <span className="text-[10px] font-mono text-slate-700">COORD: 39.29 | 10.12</span>
              </div>

              <div className="flex-1 relative border border-white/5 bg-slate-900/40 p-8 overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <Shield size={64} className="text-white/5 group-hover:text-primary/10 transition-colors" />
                </div>
                
                {/* Visual "Certificate" Header */}
                <div className="text-center border-b border-white/10 pb-6 mb-8">
                  <div className="inline-block px-4 py-1 border border-primary/40 bg-primary/10 text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">
                    Document Manifest
                  </div>
                  <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Pin Certificate Registry</h4>
                </div>

                {/* Data Matrix */}
                <div className="space-y-6 font-mono text-[11px] text-slate-400">
                  <div className="grid grid-cols-2 border-b border-white/5 pb-2">
                    <span className="font-bold opacity-40 uppercase tracking-widest">System_ID</span>
                    <span className="text-white text-right tracking-[0.2em]">{formData.kraPin || '[PENDING]'}</span>
                  </div>
                  <div className="grid grid-cols-2 border-b border-white/5 pb-2">
                    <span className="font-bold opacity-40 uppercase tracking-widest">Subject_Name</span>
                    <span className="text-white text-right truncate">{(formData.taxpayerName || '---')}</span>
                  </div>
                  <div className="grid grid-cols-2 border-b border-white/5 pb-2">
                    <span className="font-bold opacity-40 uppercase tracking-widest">Geo_Location</span>
                    <span className="text-white text-right">
                      {formData.county ? `${formData.county}, KE` : '---'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 border-b border-white/5 pb-2">
                    <span className="font-bold opacity-40 uppercase tracking-widest">Tax_Vector</span>
                    <span className="text-white text-right truncate">{formData.obligation?.substring(0, 15)}...</span>
                  </div>
                  <div className="grid grid-cols-2 border-b border-white/5 pb-2">
                    <span className="font-bold opacity-40 uppercase tracking-widest">Auth_Status</span>
                    <span className={`text-right font-black ${formData.status === 'Active' ? 'text-emerald-500' : 'text-primary'}`}>
                      {formData.status?.toUpperCase() || 'STANDBY'}
                    </span>
                  </div>
                </div>

                {/* Decorative Terminal elements */}
                <div className="mt-12 space-y-2">
                  <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 w-1/3 bg-primary/40"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-700 uppercase tracking-widest">
                    <span>Buffer: Syncing</span>
                    <span>Load: 2%</span>
                  </div>
                </div>

                <div className="mt-auto pt-12 text-center">
                  <p className="text-[10px] text-slate-600 font-medium italic">
                    &quot;Verify all parameters before engagement. Certificate dispatch is permanent.&quot;
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>


    </div>
  );
}

function DashboardFallback() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-6 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--color-brand-red)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard...</h2>
        <p className="text-[var(--color-text-secondary)]">Please wait while we prepare your workspace</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
