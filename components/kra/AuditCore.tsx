'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle2, AlertCircle, FileCheck2, Eye, ArrowRight, ArrowLeft
} from 'lucide-react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { KENYA_DATA } from '@/lib/kenya-data';

interface AuditCoreProps {
  stats: { verifications: number; certificates: number; credits: number };
  setStats: React.Dispatch<React.SetStateAction<{ verifications: number; certificates: number; credits: number }>>;
  subscription: any;
}

export function AuditCore({ stats, setStats, subscription }: AuditCoreProps) {
  const [feature, setFeature] = useState<'generator' | 'viewer'>('generator');
  const [currentStep, setCurrentStep] = useState(1);
  const [verifyMode, setVerifyMode] = useState<'id' | 'pin'>('pin');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [isStatusError, setIsStatusError] = useState(false);
  const [isStatusPending, setIsStatusPending] = useState(false);

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

  const [viewerInput, setViewerInput] = useState('');
  const [viewerIdType, setViewerIdType] = useState('KE');
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerResult, setViewerResult] = useState<any>(null);

  const showStatus = (message: string, isError = false, isPending = false) => {
    setStatusMessage(message);
    setIsStatusError(isError);
    setIsStatusPending(isPending);
    if (!isPending) {
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountyChange = (county: string) => {
    const countyData = KENYA_DATA[county];
    
    if (county.toUpperCase() === 'WEST POKOT') {
      setFormData(prev => ({
        ...prev,
        county,
        postal: countyData ? countyData.postalCode : '',
        city: 'KAPENGURIA',
        building: 'LOKITA PLAZA',
        street: 'LOTODO STREET',
        station: 'KITALE'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        county,
        postal: countyData ? countyData.postalCode : ''
      }));
    }
  };

  const getKRAValue = (obj: any, ...keys: string[]): string => {
    if (!obj || typeof obj !== 'object') return '';
    
    // First pass: Direct match (case-insensitive)
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) return String(obj[key]);
      const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
      if (foundKey) return String(obj[foundKey]);
    }

    // Second pass: Check deeply in 'data', 'result', or 'TaxpayerDetails' if not found at root
    const commonWrappers = ['Data', 'Result', 'TaxpayerDetails', 'TaxpayerDetailsResponse'];
    for (const wrapper of commonWrappers) {
      if (obj[wrapper] && typeof obj[wrapper] === 'object') {
        const value = getKRAValue(obj[wrapper], ...keys);
        if (value) return value;
      }
    }
    
    return '';
  };

  const verifyAndAutofill = async () => {
    const isPinMode = verifyMode === 'pin';
    const inputValue = isPinMode ? formData.kraPin : formData.idNumber;
    if (!inputValue) {
      showStatus(`Please enter your ${isPinMode ? 'KRA PIN' : 'ID Number'}`, true);
      return;
    }
    showStatus('Finding your details...', false, true);
    try {
      const endpoint = isPinMode ? '/api/kra/check-pin-by-pin' : '/api/kra/check-pin';
      const body = isPinMode ? { pin: inputValue.toUpperCase() } : { idType: formData.idType, idNumber: inputValue };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.errorMessage || `Could not find your details. Please check your input and try again.`);
      
      setFormData(prev => ({
        ...prev,
        kraPin: getKRAValue(result, 'KRAPIN', 'TaxpayerPIN', 'PIN', 'PinNumber') || prev.kraPin,
        taxpayerName: (getKRAValue(result, 'TaxpayerName', 'Name', 'FullName', 'Taxpayer_Name') || prev.taxpayerName || '').toUpperCase(),
        obligation: getKRAValue(result, 'Type', 'TaxpayerType', 'Obligation', 'ObligationName') || prev.obligation,
        status: getKRAValue(result, 'Status', 'TaxpayerStatus', 'EffectiveStatus') || prev.status,
        station: getKRAValue(result, 'Station', 'TaxStation', 'StationName') || prev.station
      }));

      setStats(prev => ({ ...prev, verifications: prev.verifications + 1 }));
      showStatus('Details logged successfully!');
    } catch (error: any) {
      showStatus(error.message || 'We could not find your details', true);
    }
  };

  const handleQuickView = async () => {
    if (!viewerInput) return;
    setViewerLoading(true);
    setViewerResult(null);
    try {
      const endpoint = verifyMode === 'pin' ? '/api/kra/check-pin-by-pin' : '/api/kra/check-pin';
      const body = verifyMode === 'pin' ? { pin: viewerInput.toUpperCase() } : { idType: viewerIdType, idNumber: viewerInput };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.errorMessage || 'Could not find the details');
      setViewerResult(data);
    } catch (err: any) {
      setViewerResult({ error: err.message });
    } finally {
      setViewerLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!formData.taxpayerName) {
      showStatus('Please enter your full name', true);
      return;
    }
    showStatus('Preparing your certificate...', false, true);
    try {
      const limitRes = await fetch('/api/user/generate', { method: 'POST' });
      if (!limitRes.ok) {
        const d = await limitRes.json();
        showStatus(d.error || 'You have reached your limit', true);
        return;
      }
      const { generateKraPdf } = await import('@/lib/pdf/generate-kra-pdf');
      const pdfBytes = await generateKraPdf({ ...formData, tillDate: formData.tillDate || 'N.A.' });
      
      let base64Content = '';
      try {
        const bytes = new Uint8Array(pdfBytes);
        // Optimized conversion using binary string chunks to avoid stack overflow
        const CHUNK_SIZE = 0x8000; // 32KB chunks
        let binaryString = '';
        for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
          binaryString += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK_SIZE)));
        }
        base64Content = btoa(binaryString);
      } catch (e) {
        console.error('[AUDIT_CORE] Binary conversion failed:', e);
        showStatus('Internal error preparing download. Please try again.', true);
        return;
      }

      // Handle Immediate Download
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${formData.kraPin || 'KRA'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Save to History (background)
      try {
        const saveRes = await fetch('/api/user/certificates', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            kraPin: formData.kraPin, 
            taxpayerName: formData.taxpayerName, 
            details: formData,
            pdfContent: base64Content
          })
        });
        
        if (!saveRes.ok) {
          const errData = await saveRes.json().catch(() => ({}));
          console.error('[AUDIT_CORE] Failed to save certificate to history:', errData.error || saveRes.statusText);
        } else {
          setStats(prev => ({ ...prev, certificates: prev.certificates + 1 }));
        }
      } catch (saveErr) {
        console.error('[AUDIT_CORE] Network error saving certificate:', saveErr);
      }

      showStatus('Certificate generated and downloaded successfully!');
      showStatus('Certificate is ready!');
    } catch (err: any) {
      showStatus(err.message || 'Something went wrong', true);
    }
  };

  const inputClasses = "w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-[var(--color-brand-red)] focus:ring-4 focus:ring-[var(--color-brand-red)]/10 outline-none transition-all";
  const labelClasses = "block text-sm font-medium text-white/70 mb-1 ml-1";

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans">
      <div className="flex p-1 gap-1 border border-white/10 bg-white/5 rounded-3xl max-w-max mx-auto shadow-lg backdrop-blur-md">
        <button 
          onClick={() => setFeature('generator')}
          className={`px-6 py-2.5 flex items-center gap-2 rounded-3xl transition-all font-medium text-sm ${feature === 'generator' ? 'bg-[var(--color-brand-red)] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          <FileCheck2 size={18} /> Get Certificate
        </button>
        <button 
          onClick={() => setFeature('viewer')}
          className={`px-6 py-2.5 flex items-center gap-2 rounded-3xl transition-all font-medium text-sm ${feature === 'viewer' ? 'bg-[var(--color-brand-red)] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          <Eye size={18} /> Quick Check
        </button>
      </div>

      <AnimatePresence mode="wait">
        {feature === 'viewer' ? (
          <motion.div key="v" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="border border-white/10 bg-[#161616] rounded-[2rem] shadow-2xl min-h-[400px] overflow-hidden">
             <div className="grid md:grid-cols-2 h-full">
               <div className="p-8 md:p-10 border-b border-white/10 md:border-b-0 md:border-r border-white/10 space-y-8">
                 <div className="space-y-2">
                   <h3 className="text-2xl font-bold text-white">Quick Check</h3>
                   <p className="text-white/50 text-sm">Review details instantly without creating a certificate.</p>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex p-1 border border-white/10 bg-white/5 rounded-2xl">
                      <button onClick={() => setVerifyMode('pin')} className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${verifyMode === 'pin' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:bg-white/5'}`}>Use PIN</button>
                      <button onClick={() => setVerifyMode('id')} className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${verifyMode === 'id' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:bg-white/5'}`}>Use ID</button>
                    </div>
                    
                    <div className="space-y-1">
                      <label className={labelClasses}>Enter your {verifyMode === 'pin' ? 'PIN' : 'ID'} below</label>
                      <input 
                        type="text" 
                        value={viewerInput}
                        onChange={e => setViewerInput(e.target.value.toUpperCase())}
                        className={inputClasses}
                        placeholder={verifyMode === 'pin' ? "e.g., AXXXXXXXXX" : "e.g., 12345678"}
                      />
                    </div>
                    
                    <button onClick={handleQuickView} disabled={viewerLoading} className="w-full h-14 bg-[var(--color-brand-red)] rounded-2xl font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-all shadow-lg hover:shadow-[var(--color-brand-red)]/20 shadow-[var(--color-brand-red)]/10">
                      {viewerLoading ? 'Checking...' : 'Check Details'}
                    </button>
                 </div>
               </div>
               
               <div className="p-8 md:p-10 bg-black/40">
                 {viewerResult ? (
                   <div className="space-y-4 w-full bg-white/5 border border-white/10 rounded-3xl p-6 shadow-inner">
                     {viewerResult.error ? (
                       <div className="text-red-400 flex items-center gap-3 p-4 bg-red-400/10 rounded-2xl">
                         <AlertCircle size={20}/> 
                         <span className="font-medium">{viewerResult.error}</span>
                       </div>
                     ) : (
                       Object.entries(viewerResult).map(([k, v]: any) => (
                         <div key={k} className="flex justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0 items-center gap-4">
                           <span className="text-white/50 text-sm font-medium capitalize shrink-0">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                           <span className="text-right text-white font-semibold break-all text-sm">{String(v)}</span>
                         </div>
                       ))
                     )}
                   </div>
                 ) : (
                   <div className="h-full flex items-center justify-center flex-col gap-4 text-white/30">
                     <Search size={48} strokeWidth={1} />
                     <p className="font-medium">Information will appear here</p>
                   </div>
                 )}
               </div>
             </div>
          </motion.div>
        ) : (
          <motion.div key="g" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="border border-white/10 bg-[#161616] rounded-[2rem] shadow-2xl relative overflow-hidden">
             
             {/* Form Header */}
             <div className="p-6 md:px-8 md:pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 bg-white/5">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">Create Certificate</h3>
                  <p className="text-sm text-white/50">Follow the steps to complete your details.</p>
                </div>
                
                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/50 mr-2 border-r border-white/10 pr-4">Step {currentStep} of 4</span>
                  {[1, 2, 3, 4].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setCurrentStep(s)} 
                      className={`w-3 h-3 rounded-full transition-all ${currentStep === s ? 'bg-[var(--color-brand-red)] scale-125' : 'bg-white/20 hover:bg-white/40'}`}
                      aria-label={`Go to step ${s}`}
                    />
                  ))}
                </div>
             </div>

             <div className="p-6 md:p-8 min-h-[300px]">
                {/* Status Messages */}
                {statusMessage && (
                  <div className={`p-4 mb-8 flex items-center gap-3 rounded-2xl text-sm font-medium transition-all ${isStatusError ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-green-500/10 border border-green-500/30 text-emerald-400'}`}>
                    {isStatusError ? <AlertCircle size={18} /> : (isStatusPending ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={18} />)}
                    {statusMessage}
                  </div>
                )}

                {/* Step 1: Start */}
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 max-w-xl mx-auto text-center pt-2">
                     <h4 className="text-xl font-medium text-white mb-4">Let&apos;s find your records</h4>
                     <div className="flex p-1 border border-white/10 bg-white/5 rounded-2xl mx-auto w-max mb-6">
                       <button onClick={() => setVerifyMode('pin')} className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${verifyMode === 'pin' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:bg-white/5'}`}>I have my PIN</button>
                       <button onClick={() => setVerifyMode('id')} className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${verifyMode === 'id' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:bg-white/5'}`}>I have an ID</button>
                     </div>
                     
                     <div className="flex justify-center mb-8">
                        <div className="relative w-full max-w-sm flex items-center">
                          <input 
                            type="text" 
                            value={verifyMode === 'pin' ? formData.kraPin : formData.idNumber} 
                            onChange={e => updateForm(verifyMode === 'pin' ? 'kraPin' : 'idNumber', e.target.value.toUpperCase())}
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-[2rem] pl-6 pr-16 text-center text-lg text-white focus:border-[var(--color-brand-red)] focus:ring-4 focus:ring-[var(--color-brand-red)]/10 outline-none transition-all placeholder:text-white/30"
                            placeholder={verifyMode === 'pin' ? 'AXXXXXXXXX' : 'ID NUMBER'}
                          />
                          <button onClick={verifyAndAutofill} className="absolute right-2 h-12 px-5 flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand-red)] text-white font-semibold hover:scale-105 transition-all shadow-md">
                            <Search size={18} /> Find
                          </button>
                        </div>
                     </div>
                     
                     <button onClick={() => setCurrentStep(2)} className="inline-flex items-center justify-center gap-2 px-8 h-12 bg-white/10 text-white hover:bg-white text-sm font-semibold hover:text-black rounded-full transition-all mt-4">
                       Skip or Continue <ArrowRight size={16} />
                     </button>
                  </motion.div>
                )}

                {/* Step 2: Personal details */}
                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 max-w-2xl mx-auto">
                     <h4 className="text-xl font-medium text-white mb-4">Personal Details</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1 md:col-span-2">
                         <label className={labelClasses}>Full Name</label>
                         <input type="text" className={inputClasses} placeholder="John Doe" value={formData.taxpayerName} onChange={e => updateForm('taxpayerName', e.target.value.toUpperCase())} />
                       </div>
                       <div className="space-y-1 md:col-span-2">
                         <label className={labelClasses}>Email Address</label>
                         <input type="email" className={inputClasses} placeholder="hello@example.com" value={formData.email} onChange={e => updateForm('email', e.target.value)} />
                       </div>
                       <div className="space-y-1 hidden">
                         <label className={labelClasses}>Activity or Profession</label>
                         <input type="text" className={inputClasses} placeholder="e.g., Business or Employee" value={formData.activity} onChange={e => updateForm('activity', e.target.value.toUpperCase())} />
                       </div>
                     </div>
                     
                     <div className="flex justify-between items-center pt-5 border-t border-white/5">
                       <button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 px-6 h-12 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                         <ArrowLeft size={16} /> Back
                       </button>
                       <button onClick={() => setCurrentStep(3)} className="flex items-center gap-2 px-8 h-12 bg-white text-black hover:bg-[var(--color-brand-red)] hover:text-white rounded-full font-semibold transition-all">
                         Next Step <ArrowRight size={16} />
                       </button>
                     </div>
                  </motion.div>
                )}

                {/* Step 3: Address */}
                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 max-w-4xl mx-auto">
                     <h4 className="text-xl font-medium text-white mb-4">Contact Address</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       <div className="space-y-1">
                         <label className={labelClasses}>County</label>
                         <div className="relative">
                           <select className={`${inputClasses} appearance-none cursor-pointer pr-10`} value={formData.county} onChange={(e) => handleCountyChange(e.target.value)}>
                             <option value="">Select County...</option>
                             {Object.keys(KENYA_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                         </div>
                       </div>
                       {['city', 'postal', 'building', 'street', 'lrNumber'].map((f) => {
                         const labels: Record<string, string> = {
                           city: 'Town / City',
                           postal: 'Postal Code',
                           building: 'Building Name', 
                           street: 'Street Name',
                           lrNumber: 'LR Number'
                         };
                         const isFixed = formData.county.toUpperCase() === 'WEST POKOT' && ['city', 'building', 'street', 'postal'].includes(f);
                         return (
                           <div key={f} className="space-y-1">
                             <label className={labelClasses}>{labels[f]}</label>
                             <input type="text" className={`${inputClasses} disabled:opacity-40 disabled:pointer-events-none`} value={(formData as any)[f]} onChange={e => updateForm(f, e.target.value.toUpperCase())} disabled={isFixed} />
                           </div>
                         );
                       })}
                     </div>
                     
                     <div className="flex justify-between items-center pt-5 border-t border-white/5">
                       <button onClick={() => setCurrentStep(2)} className="flex items-center gap-2 px-6 h-12 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                         <ArrowLeft size={16} /> Back
                       </button>
                       <button onClick={() => setCurrentStep(4)} className="flex items-center gap-2 px-8 h-12 bg-white text-black hover:bg-[var(--color-brand-red)] hover:text-white rounded-full font-semibold transition-all">
                         Final Step <ArrowRight size={16} />
                       </button>
                     </div>
                  </motion.div>
                )}

                {/* Step 4: Finalize */}
                {currentStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 max-w-xl mx-auto text-center pt-2">
                     <div className="p-3 rounded-2xl w-max mx-auto mb-4">
                       <NextImage src="/logo.png" alt="Akubrecah Logo" width={180} height={48} className="object-contain h-12 w-auto opacity-100" />
                     </div>
                     <h4 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h4>
                     <p className="text-white/60 mb-8 max-w-sm mx-auto">Your details are ready. Click the button below to generate and download your official KRA PIN Certificate.</p>
                     
                     <div className="space-y-4 max-w-xs mx-auto">
                       <div className="text-left space-y-1 mb-6">
                         <label className={labelClasses}>Your Tax Station (if known)</label>
                         <input type="text" className={`${inputClasses} bg-white/5 text-center disabled:opacity-40 disabled:pointer-events-none`} placeholder="e.g., NAIROBI" value={formData.station} onChange={e => updateForm('station', e.target.value.toUpperCase())} disabled={formData.county.toUpperCase() === 'WEST POKOT'} />
                       </div>
                       
                       <button onClick={generateCertificate} disabled={isStatusPending} className="w-full h-16 bg-[var(--color-brand-red)] text-white rounded-full font-bold text-lg hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50 shadow-xl shadow-[var(--color-brand-red)]/20 flex items-center justify-center gap-3">
                          {isStatusPending ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Working...</>
                          ) : (
                            <><FileCheck2 size={24} /> Download Certificate</>
                          )}
                       </button>
                       
                       <button onClick={() => setCurrentStep(3)} className="w-full h-12 text-sm text-white/50 hover:text-white transition-all underline decoration-white/20 underline-offset-4">
                         Go back to check my details
                       </button>
                     </div>
                  </motion.div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
