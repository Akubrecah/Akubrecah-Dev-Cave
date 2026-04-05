import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, AlertCircle, Download, ClipboardList, Info, FileText, Calendar, Search } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { generateReceiptPdf, ReceiptPdfData } from '@/lib/pdf/generate-receipt-pdf';

const OBLIGATIONS = [
    { value: "1", label: "Income Tax - Individual Resident" },
];

const MONTHS = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

interface NilReturnResult {
    ResponseCode: string;
    AckNumber: string;
    Status: string;
    Message: string;
}

export function NilReturnForm() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<NilReturnResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [formPin, setFormPin] = useState("");
    const [verifyMode, setVerifyMode] = useState<'pin' | 'id'>('pin');
    const [idNumber, setIdNumber] = useState("");
    const [idType, setIdType] = useState("KE");
    const [verifying, setVerifying] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded || !user) return;
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/user/status');
                if (res.ok) {
                    const data = await res.json();
                    setIsAdmin(data.role === 'admin');
                    setSubscription(data);
                }
            } catch (err) {
                console.error("Status check failed:", err);
            }
        };
        checkStatus();
    }, [user, isLoaded]);

    async function handleVerifyId() {
        if (!idNumber) {
            setError("Oops! Please enter your ID number.");
            return;
        }

        setVerifying(true);
        setError(null);
        
        try {
            const res = await fetch('/api/kra/check-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idType, idNumber }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.errorMessage || 'We couldn’t find your details.');

            if (data.TaxpayerPIN || data.PIN) {
                const pin = data.TaxpayerPIN || data.PIN;
                setFormPin(pin);
                setVerifyMode('pin');
            } else {
                throw new Error("We couldn't find a KRA PIN for this ID.");
            }
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setVerifying(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            TaxpayerPIN: formData.get('pin')?.toString().toUpperCase() || '',
            ObligationCode: formData.get('obligation')?.toString() || '',
            Month: formData.get('month')?.toString() || '',
            Year: formData.get('year')?.toString() || '',
        };
        
        try {
            const res = await fetch('/api/kra/nil-return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.errorMessage || 'There was a problem submitting your return.');

            setResult(json.RESPONSE as NilReturnResult);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload() {
        if (!result) return;
        setDownloading(true);
        try {
            const pdfData: ReceiptPdfData = {
                kraPin: formPin,
                taxpayerName: "Taxpayer", // Generic fallback for privacy
                acknowledgmentNumber: result.AckNumber,
                date: new Date().toLocaleDateString('en-GB'),
            };

            const bytes = await generateReceiptPdf(pdfData);
            const blob = new Blob([bytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Receipt_${result.AckNumber}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (_err) {
            setError('We encountered a problem while creating your receipt.');
        } finally {
            setDownloading(false);
        }
    }

    const inputClasses = "w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm text-white focus:border-[var(--color-brand-yellow)] focus:ring-4 focus:ring-[var(--color-brand-yellow)]/10 outline-none transition-all";
    const labelClasses = "block text-sm font-medium text-white/70 mb-2 ml-1";

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 font-sans">
            <div className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium">
                    <CheckCircle2 size={16} /> Fast, safe, and secure
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                    File your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-300">Nil Return</span>
                </h2>
                <p className="text-lg text-white/50 max-w-lg mx-auto">
                    Quickly file your return in just a few clicks. Your security and privacy are our top priorities.
                </p>
            </div>

            <div className="relative z-10 w-full bg-[#161616] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12 relative flex flex-col h-full">
                    
                    {!result ? (
                        <>
                            <div className="flex p-1 border border-white/10 bg-white/5 rounded-3xl w-max mx-auto mb-10 shadow-lg">
                                <button 
                                    type="button"
                                    onClick={() => setVerifyMode('pin')}
                                    className={`px-8 py-2.5 text-sm font-medium rounded-3xl transition-all ${verifyMode === 'pin' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                >
                                    I have my PIN
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setVerifyMode('id')}
                                    className={`px-8 py-2.5 text-sm font-medium rounded-3xl transition-all ${verifyMode === 'id' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                >
                                    I have an ID
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <AnimatePresence mode="wait">
                                    {verifyMode === 'id' ? (
                                        <motion.div 
                                            key="id"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-4 max-w-sm mx-auto"
                                        >
                                            <div className="space-y-1">
                                                <label className={labelClasses}>Find your PIN via ID Number</label>
                                                <div className="relative flex gap-3">
                                                    <div className="relative">
                                                        <select 
                                                            value={idType} 
                                                            onChange={e => setIdType(e.target.value)}
                                                            className={`${inputClasses} w-[110px] sm:w-[130px] flex-shrink-0 cursor-pointer appearance-none px-4 bg-[length:14px]`}
                                                        >
                                                            <option value="KE">Kenyan ID</option>
                                                            <option value="NKE">Alien ID</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
                                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.2 7.2L10 12l4.8-4.8 1.4 1.4L10 14.8 3.8 8.6z"/></svg>
                                                        </div>
                                                    </div>
                                                    <div className="relative flex-1">
                                                        <input 
                                                            placeholder="e.g., 12345678" 
                                                            value={idNumber}
                                                            onChange={e => setIdNumber(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleVerifyId();
                                                                }
                                                            }}
                                                            className={`${inputClasses} pr-[100px] sm:pr-[120px]`}
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={handleVerifyId}
                                                            disabled={verifying}
                                                            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 sm:px-6 rounded-xl bg-[var(--color-brand-yellow)] text-black font-bold flex items-center justify-center gap-2 transition-all hover:bg-white disabled:opacity-50 shadow-md"
                                                        >
                                                            {verifying ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Search size={18} />}
                                                            <span className="hidden sm:inline">Find</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="pin"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-4 max-w-sm mx-auto text-center"
                                        >
                                            <div className="space-y-1">
                                                <label className={labelClasses}>Enter your KRA PIN</label>
                                                <input 
                                                    name="pin" 
                                                    placeholder="AXXXXXXXXX" 
                                                    required 
                                                    className="w-full h-16 border border-white/10 bg-white/5 rounded-[2rem] text-center text-xl font-mono uppercase tracking-widest text-white focus:border-[var(--color-brand-yellow)] focus:ring-4 focus:ring-[var(--color-brand-yellow)]/10 transition-all outline-none"
                                                    value={formPin}
                                                    onChange={e => setFormPin(e.target.value.toUpperCase())}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 shadow-inner">
                                    <div className="flex items-center gap-3 text-white">
                                        <Calendar className="text-yellow-500" size={24} />
                                        <h3 className="font-semibold text-lg">Select Filing Period</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className={labelClasses}>Month</label>
                                            <select name="month" required className={`${inputClasses} cursor-pointer`}>
                                                <option value="">Select Month...</option>
                                                {MONTHS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className={labelClasses}>Year</label>
                                            <input name="year" type="number" placeholder="2025" defaultValue={new Date().getFullYear()} required className={inputClasses} />
                                        </div>
                                    </div>
                                    <div className="hidden">
                                        <select name="obligation" defaultValue="1">
                                            {OBLIGATIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 max-w-xs mx-auto">
                                    <Button 
                                        type="submit" 
                                        loading={loading} 
                                        className="w-full h-16 bg-[var(--color-brand-yellow)] hover:bg-white text-black font-semibold rounded-full text-lg shadow-xl shadow-yellow-500/20 hover:scale-[1.02] transition-all"
                                    >
                                        File My Return Now
                                    </Button>
                                    <p className="text-center text-xs text-white/40 mt-4 flex items-center justify-center gap-2">
                                        <Info size={14}/> Double-check your details before submitting
                                    </p>
                                </div>
                            </form>
                        </>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-8 text-center space-y-8"
                        >
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/30">
                                <CheckCircle2 size={56} className="text-emerald-500" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold text-white">Success!</h3>
                                <p className="text-white/60">Your Nil Return has been processed successfully.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl rounded-tr-xl flex flex-col items-center justify-center">
                                    <p className="text-xs text-white/50 mb-2 uppercase font-medium">Reference Number</p>
                                    <p className="font-mono text-xl text-white break-all">{result.AckNumber}</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl rounded-tl-xl flex flex-col items-center justify-center">
                                    <p className="text-xs text-white/50 mb-2 uppercase font-medium">Status</p>
                                    <p className="font-semibold text-emerald-400 capitalize">{result.ResponseCode}</p>
                                </div>
                            </div>
                            
                            {result.Message && (
                                <div className="max-w-lg w-full bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl text-sm border border-emerald-500/20">
                                    {result.Message}
                                </div>
                            )}

                             <div className="flex flex-col sm:flex-row gap-4 pt-6 max-w-md w-full mx-auto">
                                <Button 
                                    onClick={handleDownload}
                                    loading={downloading}
                                    className="h-14 bg-white text-black hover:bg-[var(--color-brand-yellow)] rounded-full font-semibold transition-all flex-1 shadow-md shadow-white/5 flex items-center justify-center gap-2"
                                >
                                    <Download size={18} /> Download Receipt
                                </Button>
                                <Button 
                                    onClick={() => setResult(null)} 
                                    className="h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-medium transition-all flex-1"
                                >
                                    File Another
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute bottom-6 left-6 right-6"
                            >
                                <div className="p-4 bg-red-500/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center gap-4 text-white">
                                    <div className="bg-white/20 p-2 rounded-full">
                                        <AlertCircle size={20} strokeWidth={2.5} />
                                    </div>
                                    <p className="text-sm font-medium flex-1">{error}</p>
                                    <button onClick={() => setError(null)} className="text-white/60 hover:text-white p-2">✕</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Friendly helper text outside the main box */}
            <p className="text-center text-sm text-white/30 hidden md:flex items-center justify-center gap-2 mt-4">
                <FileText size={16} /> Made simple for you. We don't store your KRA PIN indefinitely.
            </p>
        </div>
    );
}
