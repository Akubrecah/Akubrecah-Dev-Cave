'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle2, AlertCircle, FileCheck2, Eye, Activity, Shield, ArrowRight, Clock, Coins, Sparkles
} from 'lucide-react';
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
    setFormData(prev => ({
      ...prev,
      county,
      postal: countyData ? countyData.postalCode : ''
    }));
  };

  const getKRAValue = (obj: any, ...keys: string[]): string => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) return String(obj[key]);
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
      const endpoint = isPinMode ? '/api/kra/check-pin-by-pin' : '/api/kra/check-pin';
      const body = isPinMode ? { pin: inputValue.toUpperCase() } : { idType: formData.idType, idNumber: inputValue };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.errorMessage || `KRA API error`);
      
      setFormData(prev => ({
        ...prev,
        kraPin: getKRAValue(result, 'KRAPIN', 'TaxpayerPIN', 'PIN') || prev.kraPin,
        taxpayerName: (getKRAValue(result, 'TaxpayerName', 'Name') || prev.taxpayerName || '').toUpperCase(),
        obligation: getKRAValue(result, 'Type', 'TaxpayerType') || prev.obligation,
        status: getKRAValue(result, 'Status') || prev.status
      }));

      setStats(prev => ({ ...prev, verifications: prev.verifications + 1 }));
      showStatus('Verification successful!');
    } catch (error: any) {
      showStatus(error.message || 'Verification failed', true);
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
      if (!res.ok) throw new Error(data.errorMessage || 'QuickView failed');
      setViewerResult(data);
    } catch (err: any) {
      setViewerResult({ error: err.message });
    } finally {
      setViewerLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!formData.taxpayerName) {
      showStatus('Please enter Taxpayer Name', true);
      return;
    }
    showStatus('Generating...', false, true);
    try {
      const limitRes = await fetch('/api/user/generate', { method: 'POST' });
      if (!limitRes.ok) {
        const d = await limitRes.json();
        showStatus(d.error || 'Limit reached', true);
        return;
      }
      const { generateKraPdf } = await import('@/lib/pdf/generate-kra-pdf');
      const pdfBytes = await generateKraPdf({ ...formData, tillDate: formData.tillDate || 'N.A.' });
      
      // Convert pdfBytes to base64 string for database storage
      let base64Content: string;
      try {
        const binary = String.fromCharCode(...Array.from(pdfBytes));
        base64Content = btoa(binary);
      } catch (e) {
        console.error('Base64 conversion failed, falling back to blob only', e);
        base64Content = '';
      }

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `KRA_Certificate_${formData.kraPin || 'Generated'}.pdf`;
      link.click();

      // Save record to DB including pdf base64 content
      fetch('/api/user/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          kraPin: formData.kraPin, 
          taxpayerName: formData.taxpayerName, 
          details: formData,
          pdfContent: base64Content
        })
      });

      setStats(prev => ({ ...prev, certificates: prev.certificates + 1 }));
      showStatus('Certificate generated!');
    } catch (err: any) {
      showStatus(err.message || 'Generation failed', true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap gap-4 p-2 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md inline-flex">
        <button 
          onClick={() => setFeature('generator')}
          className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest ${feature === 'generator' ? 'bg-[var(--color-brand-red)] text-white shadow-xl shadow-red-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <FileCheck2 size={18} /> Audit Console
        </button>
        <button 
          onClick={() => setFeature('viewer')}
          className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest ${feature === 'viewer' ? 'bg-[var(--color-brand-red)] text-white shadow-xl shadow-red-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <Eye size={18} /> Quick View
        </button>
      </div>

      <AnimatePresence mode="wait">
        {feature === 'viewer' ? (
          <motion.div key="v" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-panel p-10 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-xl">
             <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-8">
                 <h3 className="text-2xl font-black italic uppercase tracking-tighter">Target Audit</h3>
                 <div className="space-y-6">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                      <button onClick={() => setVerifyMode('pin')} className={`flex-1 py-3 text-[10px] font-black rounded-xl ${verifyMode === 'pin' ? 'bg-white text-black' : 'text-white/40'}`}>PIN</button>
                      <button onClick={() => setVerifyMode('id')} className={`flex-1 py-3 text-[10px] font-black rounded-xl ${verifyMode === 'id' ? 'bg-white text-black' : 'text-white/40'}`}>ID</button>
                    </div>
                    <input 
                      type="text" 
                      value={viewerInput}
                      onChange={e => setViewerInput(e.target.value.toUpperCase())}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 text-xl font-mono text-white focus:border-[var(--color-brand-red)] outline-none transition-all"
                      placeholder="ENTER PIN OR ID"
                    />
                    <button onClick={handleQuickView} disabled={viewerLoading} className="w-full h-16 bg-[var(--color-brand-red)] rounded-2xl font-black uppercase tracking-widest italic text-white hover:opacity-90 transition-all">
                      {viewerLoading ? 'SCANNING...' : 'EXECUTE SCAN'}
                    </button>
                 </div>
               </div>
               <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5">
                 {viewerResult ? (
                   <div className="space-y-4 font-mono text-sm">
                     {viewerResult.error ? <div className="text-emerald-500 font-black">ERROR: {viewerResult.error}</div> : (
                       Object.entries(viewerResult).map(([k, v]: any) => (
                         <div key={k} className="flex justify-between border-b border-white/5 py-2">
                           <span className="text-white/40 uppercase text-[10px]">{k}</span>
                           <span className="text-white font-bold">{String(v)}</span>
                         </div>
                       ))
                     )}
                   </div>
                 ) : <div className="h-full flex items-center justify-center text-white/5 uppercase tracking-widest font-black">Ready for Command</div>}
               </div>
             </div>
          </motion.div>
        ) : (
          <motion.div key="g" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-12 gap-0 border border-white/10 glass-panel rounded-[3rem] overflow-hidden bg-white/5 backdrop-blur-xl">
             <div className="lg:col-span-12 p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-brand-red)]">Module / Configuration</h3>
                    <p className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Configuration Matrix</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(s => (
                      <button key={s} onClick={() => setCurrentStep(s)} className={`w-12 h-12 rounded-2xl font-black text-xs transition-all border ${currentStep === s ? 'bg-[var(--color-brand-red)] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}>0{s}</button>
                    ))}
                  </div>
                </div>

                {statusMessage && (
                  <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 ${isStatusError ? 'bg-emerald-500/10 border border-emerald-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                    {isStatusError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{statusMessage}</span>
                  </div>
                )}

                <div className="min-h-[400px]">
                  {currentStep === 1 && (
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Protocol Discovery</label>
                          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                            <button onClick={() => setVerifyMode('pin')} className={`flex-1 py-4 text-[10px] font-black rounded-xl transition-all ${verifyMode === 'pin' ? 'bg-white text-black' : 'text-white/40'}`}>PIN AUTH</button>
                            <button onClick={() => setVerifyMode('id')} className={`flex-1 py-4 text-[10px] font-black rounded-xl transition-all ${verifyMode === 'id' ? 'bg-white text-black' : 'text-white/40'}`}>ID AUTH</button>
                          </div>
                          <div className="flex gap-4">
                            <input 
                              type="text" 
                              value={verifyMode==='pin'?formData.kraPin:formData.idNumber} 
                              onChange={e => updateForm(verifyMode==='pin'?'kraPin':'idNumber', e.target.value.toUpperCase())}
                              className="flex-1 bg-white/5 border border-white/10 rounded-[2rem] h-20 px-8 text-3xl font-mono text-white focus:border-[var(--color-brand-red)] outline-none transition-all placeholder:text-white/5"
                              placeholder={verifyMode==='pin'?'AXXXXXXXXX':'ID NUMBER'}
                            />
                            <button onClick={verifyAndAutofill} className="px-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-[var(--color-brand-red)] transition-all group">
                              <Search size={24} className="text-white group-hover:scale-110" />
                            </button>
                          </div>
                       </div>
                       <button onClick={() => setCurrentStep(2)} className="w-full h-16 bg-white rounded-3xl text-black font-black uppercase tracking-widest italic hover:bg-[var(--color-brand-red)] hover:text-white transition-all">Proceed to Profile →</button>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-8">
                       <div className="grid grid-cols-1 gap-6">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Legal Identity</label>
                           <input type="text" className="w-full h-18 bg-white/5 border border-white/10 rounded-3xl px-8 text-xl font-black text-white uppercase focus:border-[var(--color-brand-red)] outline-none" value={formData.taxpayerName} onChange={e => updateForm('taxpayerName', e.target.value.toUpperCase())} />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Communication Link</label>
                           <input type="email" className="w-full h-18 bg-white/5 border border-white/10 rounded-3xl px-8 text-lg font-bold text-white focus:border-[var(--color-brand-red)] outline-none" value={formData.email} onChange={e => updateForm('email', e.target.value)} />
                         </div>
                       </div>
                       <div className="flex gap-4">
                         <button onClick={() => setCurrentStep(1)} className="flex-1 h-16 border border-white/10 rounded-3xl text-white/40 font-black uppercase tracking-widest hover:text-white hover:border-white/30 transition-all">Back</button>
                         <button onClick={() => setCurrentStep(3)} className="flex-[2] h-16 bg-white rounded-3xl text-black font-black uppercase tracking-widest italic hover:bg-[var(--color-brand-red)] hover:text-white transition-all">Address Matrix →</button>
                       </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-8">
                       <div className="grid grid-cols-2 gap-4">
                         {['building', 'street', 'city', 'lrNumber', 'postal'].map(f => (
                           <div key={f} className="space-y-1">
                             <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">{f.replace(/([A-Z])/g, ' $1')}</label>
                             <input type="text" className="w-full h-14 bg-white/5 border border-white/10 rounded-3xl px-6 text-sm font-bold text-white uppercase focus:border-[var(--color-brand-red)] outline-none" value={(formData as any)[f]} onChange={e => updateForm(f, e.target.value.toUpperCase())} />
                           </div>
                         ))}
                         <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">County</label>
                           <select className="w-full h-14 bg-white/5 border border-white/10 rounded-3xl px-6 text-sm font-black text-white uppercase outline-none focus:border-[var(--color-brand-red)]" value={formData.county} onChange={(e) => handleCountyChange(e.target.value)}>
                             <option value="">-- SELECT --</option>
                             {Object.keys(KENYA_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                         </div>
                       </div>
                       <div className="flex gap-4">
                         <button onClick={() => setCurrentStep(2)} className="flex-1 h-16 border border-white/10 rounded-3xl text-white/40 font-black uppercase tracking-widest hover:text-white hover:border-white/30 transition-all">Back</button>
                         <button onClick={() => setCurrentStep(4)} className="flex-[2] h-16 bg-white rounded-3xl text-black font-black uppercase tracking-widest italic hover:bg-[var(--color-brand-red)] hover:text-white transition-all">Finalize Schema →</button>
                       </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-8">
                       <div className="grid grid-cols-2 gap-6">
                         <div className="col-span-2 space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Infrastructure Station</label>
                           <input type="text" className="w-full h-18 bg-white/5 border border-white/10 rounded-3xl px-8 text-sm font-black text-white uppercase focus:border-[var(--color-brand-red)] outline-none" placeholder="REVENUE STATION" value={formData.station} onChange={e => updateForm('station', e.target.value.toUpperCase())} />
                         </div>
                         <div className="col-span-2 space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Operating Activity</label>
                           <input type="text" className="w-full h-18 bg-white/5 border border-white/10 rounded-3xl px-8 text-sm font-black text-white uppercase focus:border-[var(--color-brand-red)] outline-none" value={formData.activity} onChange={e => updateForm('activity', e.target.value.toUpperCase())} />
                         </div>
                       </div>
                       <div className="flex gap-4">
                         <button onClick={() => setCurrentStep(3)} className="flex-1 h-16 border border-white/10 rounded-3xl text-white/40 font-black uppercase tracking-widest hover:text-white hover:border-white/30 transition-all">Back</button>
                         <button onClick={generateCertificate} disabled={isStatusPending} className="flex-[2] h-16 bg-[var(--color-brand-red)] rounded-3xl text-white font-black uppercase tracking-widest italic hover:bg-white hover:text-black transition-all shadow-xl shadow-red-500/20">
                            {isStatusPending ? 'ENGAGING ENGINE...' : 'DOWNLOAD IDENTITY / PDF'}
                         </button>
                       </div>
                    </div>
                  )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
