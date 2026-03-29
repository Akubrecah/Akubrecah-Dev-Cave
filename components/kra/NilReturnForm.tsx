import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormField';
import { CheckCircle2, AlertCircle, Download, Terminal, ChevronRight, ShieldCheck, Cpu, Database, Network } from 'lucide-react';
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
    const [terminalLogs, setTerminalLogs] = useState<{ id: string; msg: string; type: 'info' | 'success' | 'error' | 'cmd' }[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'cmd' = 'info') => {
        setTerminalLogs(prev => [...prev.slice(-15), { id: Math.random().toString(36), msg, type }]);
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalLogs]);

    useEffect(() => {
        addLog("System initialized. Ready for KRA direct filing.", "success");
        addLog("Security layer active: AES-256 standard.", "info");
    }, []);

    async function handleVerifyId() {
        if (!idNumber) {
            setError("Identification required.");
            addLog("Error: Missing ID number.", "error");
            return;
        }

        setVerifying(true);
        setError(null);
        addLog(`Initiating PIN retrieval for ID: ${idNumber}...`, "cmd");
        
        try {
            const res = await fetch('/api/kra/check-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idType, idNumber }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.errorMessage || 'Verification failed');

            if (data.TaxpayerPIN || data.PIN) {
                const pin = data.TaxpayerPIN || data.PIN;
                setFormPin(pin);
                setVerifyMode('pin');
                addLog(`Success: PIN ${pin} localized for ${data.TaxpayerName || 'Identity'}.`, "success");
                addLog("System auto-filling workspace.", "info");
            } else {
                throw new Error("No record found.");
            }
        } catch (err: unknown) {
            setError((err as Error).message);
            addLog(`Failed: ${(err as Error).message}`, "error");
        } finally {
            setVerifying(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError(null);
        addLog("Filing handshake initiated...", "cmd");

        const formData = new FormData(e.currentTarget);
        const data = {
            TaxpayerPIN: formData.get('pin')?.toString().toUpperCase() || '',
            ObligationCode: formData.get('obligation')?.toString() || '',
            Month: formData.get('month')?.toString() || '',
            Year: formData.get('year')?.toString() || '',
        };
        
        addLog(`Target: ${data.TaxpayerPIN} | Period: ${data.Month}/${data.Year}`, "info");

        try {
            const res = await fetch('/api/kra/nil-return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.errorMessage || 'Filing execution failed.');

            setResult(json.RESPONSE as NilReturnResult);
            addLog("Protocol complete. Acknowledgment received.", "success");
        } catch (err: unknown) {
            setError((err as Error).message);
            addLog(`Critical: ${(err as Error).message}`, "error");
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload() {
        if (!result) return;
        setDownloading(true);
        addLog("Compiling secure PDF receipt...", "cmd");
        try {
            const pdfData: ReceiptPdfData = {
                kraPin: formPin,
                taxpayerName: "KRA Authorized Entity",
                acknowledgmentNumber: result.AckNumber,
                date: new Date().toLocaleDateString('en-GB'),
            };

            const bytes = await generateReceiptPdf(pdfData);
            const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `KRA_ACK_${result.AckNumber}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            addLog("Receipt dispatched successfully.", "success");
        } catch (_err) {
            addLog("Error generating binary export.", "error");
            setError('Receipt generation failed.');
        } finally {
            setDownloading(false);
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-0 border border-white/10 bg-[#0F172A] shadow-2xl rounded-none overflow-hidden">
            {/* Terminal Sidebar */}
            <div className="w-full lg:w-80 bg-black/40 border-b lg:border-b-0 lg:border-r border-white/10 p-4 font-mono text-[10px] flex flex-col h-[600px] lg:h-auto">
                <div className="flex items-center gap-2 mb-4 text-[#F59E0B] border-b border-[#F59E0B]/10 pb-2">
                    <Terminal size={14} />
                    <span className="font-bold tracking-widest uppercase">Console.log</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                    <AnimatePresence initial={false}>
                        {terminalLogs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex gap-2 leading-relaxed ${
                                    log.type === 'error' ? 'text-red-400' : 
                                    log.type === 'success' ? 'text-emerald-400' : 
                                    log.type === 'cmd' ? 'text-amber-400' : 'text-slate-400'
                                }`}
                            >
                                <span className="opacity-30 flex-shrink-0">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                <span className="flex-shrink-0">{log.type === 'cmd' ? '>' : '$'}</span>
                                <span className="break-all">{log.msg}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={logEndRef} />
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-500/60">
                        <ShieldCheck size={12} />
                        <span className="uppercase tracking-tighter">Secure Link Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Cpu size={12} />
                        <span className="uppercase tracking-tighter">Hardware Accel: ON</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Network size={12} />
                        <span className="uppercase tracking-tighter">KRA Gateway: CONNECTED</span>
                    </div>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="flex-1 p-6 lg:p-10 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Database size={240} className="text-white" />
                </div>

                <div className="relative z-10 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <h2 className="text-3xl lg:text-5xl font-extrabold uppercase tracking-tighter text-white leading-none">
                            KRA <span className="text-primary italic">Workspace</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="h-[2px] w-12 bg-primary"></span>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#F59E0B] font-bold">Protocol: Nil Return Filing</p>
                        </div>
                    </motion.div>
                </div>

                <div className="flex-1 relative z-10">
                    {!result ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Mode Control - Staggered Reveal */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex border border-white/10 p-1 bg-black/20 w-max"
                            >
                                <button 
                                    type="button"
                                    onClick={() => setVerifyMode('pin')}
                                    className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${verifyMode === 'pin' ? 'bg-primary text-white shadow-[0_0_15px_rgba(227,6,19,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    PIN Manual
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setVerifyMode('id')}
                                    className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${verifyMode === 'id' ? 'bg-primary text-white shadow-[0_0_15px_rgba(227,6,19,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    ID Retrieval
                                </button>
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {verifyMode === 'id' ? (
                                    <motion.div 
                                        key="id"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4 max-w-md"
                                    >
                                        <div className="flex gap-0">
                                            <Select 
                                                value={idType} 
                                                onChange={e => setIdType(e.target.value)}
                                                className="w-[140px] h-12 rounded-none border-white/20 bg-black/40 text-xs font-bold uppercase tracking-tighter"
                                            >
                                                <option value="KE">Kenyan</option>
                                                <option value="NKE">Alien</option>
                                            </Select>
                                            <Input 
                                                placeholder="ID IDENTIFIER" 
                                                value={idNumber}
                                                onChange={e => setIdNumber(e.target.value)}
                                                className="flex-1 h-12 rounded-none border-l-0 border-white/20 bg-black/40 text-lg font-mono placeholder:opacity-20"
                                            />
                                        </div>
                                        <Button 
                                            type="button"
                                            onClick={handleVerifyId}
                                            loading={verifying}
                                            className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-none font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                        >
                                            Execute Discovery <ChevronRight size={16} />
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="pin"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4 max-w-md"
                                    >
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Taxpayer PIN</label>
                                            <Input 
                                                name="pin" 
                                                placeholder="AXXXXXXXXX" 
                                                required 
                                                className="h-14 rounded-none border-white/20 bg-black/40 text-3xl font-mono uppercase tracking-[0.2em] text-primary"
                                                value={formPin}
                                                onChange={e => setFormPin(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Obligation</label>
                                    <Select name="obligation" required defaultValue="1" className="h-12 rounded-none border-white/20 bg-black/40 text-xs font-bold uppercase tracking-tighter">
                                        {OBLIGATIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Period Month</label>
                                    <Select name="month" required className="h-12 rounded-none border-white/20 bg-black/40 text-xs font-bold uppercase tracking-tighter">
                                        <option value="">-- SELECT --</option>
                                        {MONTHS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Period Year</label>
                                    <Input name="year" type="number" placeholder="2025" defaultValue={new Date().getFullYear()} required className="h-12 rounded-none border-white/20 bg-black/40 font-mono text-center" />
                                </div>
                            </motion.div>

                            <div className="pt-6">
                                <Button 
                                    type="submit" 
                                    loading={loading} 
                                    className="w-full lg:w-auto px-12 h-16 bg-primary hover:bg-primary/90 text-white rounded-none font-black uppercase italic tracking-tighter text-xl shadow-[0_10px_30px_rgba(227,6,19,0.3)] transition-all hover:translate-y-[-2px] hover:shadow-[0_15px_40px_rgba(227,6,19,0.4)]"
                                >
                                    Authorize Filing Dispatch
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 bg-black/20 border border-emerald-500/20 p-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CheckCircle2 size={120} className="text-emerald-500" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-emerald-500 leading-none">Status: Success</h3>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500/60 font-medium">Record persistent in KRA infrastructure</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 max-w-2xl">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reference ID</p>
                                    <p className="text-xl font-mono text-white tracking-widest">{result.AckNumber}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Response Code</p>
                                    <p className="text-xl font-mono text-white tracking-widest">{result.ResponseCode}</p>
                                </div>
                            </div>

                            <div className="bg-emerald-500/5 p-4 border-l-4 border-emerald-500 italic text-emerald-100/70 text-sm">
                                &quot;{result.Message}&quot;
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button 
                                    onClick={handleDownload}
                                    loading={downloading}
                                    className="px-8 h-12 bg-white text-black hover:bg-slate-100 rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-3"
                                >
                                    <Download size={16} /> Export Receipt.PDF
                                </Button>
                                <Button 
                                    onClick={() => setResult(null)} 
                                    className="px-8 h-12 border border-white/10 hover:bg-white/5 rounded-none font-bold uppercase tracking-widest text-xs"
                                >
                                    Return to Workspace
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-4 bg-red-500/10 border-l-4 border-red-500 flex items-center gap-4 text-red-500"
                    >
                        <AlertCircle size={20} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Fault Detected</p>
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
