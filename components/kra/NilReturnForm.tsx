'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormField';
import { CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { generateReceiptPdf, ReceiptPdfData } from '@/lib/pdf/generate-receipt-pdf';


const OBLIGATIONS = [
    { value: "1", label: "Income Tax - Individual Resident" },
    { value: "2", label: "Income Tax - Individual Non-Resident" },
    { value: "3", label: "Income Tax - Individual Partnership" },
    { value: "4", label: "Income Tax - Company" },
    { value: "5", label: "Value Added Tax (VAT)" },
    { value: "6", label: "Income Tax - PAYE" },
    { value: "7", label: "Excise" },
    { value: "8", label: "Income Tax - Rent Income (MRI)" },
];

interface NilReturnResult {
    ResponseCode: string;
    AckNumber: string;
    Status: string;
    Message: string;
}


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

export function NilReturnForm() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<NilReturnResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [downloading, setDownloading] = useState(false);
    const [formPin, setFormPin] = useState("");


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
        setFormPin(data.TaxpayerPIN);


        try {
            const res = await fetch('/api/kra/nil-return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.errorMessage || 'Failed to file Nil Return');

            setResult(json.RESPONSE as NilReturnResult);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
                taxpayerName: "KRA Taxpayer", // We don't have this from Nil Return API, using generic
                acknowledgmentNumber: result.AckNumber,
                date: new Date().toLocaleDateString('en-GB'),
            };

            const bytes = await generateReceiptPdf(pdfData);
            const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });


            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `KRA_Receipt_${result.AckNumber}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            console.error('Download failed:', err);
            setError('Failed to generate PDF receipt. Please try again.');
        } finally {
            setDownloading(false);
        }
    }



    return (
        <Card className="w-full max-w-2xl mx-auto border-2 border-emerald-500/20 bg-background/50 backdrop-blur-sm" size="lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    KRA Nil Return Filing
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                    File your Nil Return quickly and easily. Ensure you have no taxable income for the selected period.
                </p>
            </CardHeader>
            <CardContent>
                {error && (() => {
                    const isInfo = error.toLowerCase().includes('after') || error.toLowerCase().includes('march') || error.toLowerCase().includes('period');
                    return (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                            isInfo ? 'bg-amber-500/10 border border-amber-500/20 text-amber-700' : 'bg-red-500/10 border border-red-500/20 text-red-600'
                        }`}>
                            <AlertCircle className={`h-5 w-5 flex-shrink-0 ${isInfo ? 'text-amber-600' : 'text-red-500'}`} />
                            <div className="space-y-1">
                                <p className="text-sm font-bold">{isInfo ? 'Filing Period Notice' : 'Filing Error'}</p>
                                <p className="text-sm font-medium leading-relaxed">{error}</p>
                            </div>
                        </div>
                    );
                })()}

                {!result ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="pin" className="text-sm font-medium">KRA PIN</label>
                                <Input id="pin" name="pin" placeholder="e.g. A001234567X" required className="uppercase" />
                                <p className="text-[10px] text-muted-foreground italic">
                                    Test PIN: <code className="bg-emerald-500/10 px-1 rounded select-all cursor-pointer">A521040203F</code> (Sandbox only)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="obligation" className="text-sm font-medium">Obligation</label>
                                <Select id="obligation" name="obligation" required>
                                    <option value="">Select obligation</option>
                                    {OBLIGATIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="month" className="text-sm font-medium">Month</label>
                                <Select id="month" name="month" required>
                                    <option value="">Select month</option>
                                    {MONTHS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="year" className="text-sm font-medium">Year</label>
                                <Input id="year" name="year" type="number" placeholder="2025" defaultValue={new Date().getFullYear()} required />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            loading={loading} 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 text-lg transition-all hover:scale-[1.01]"
                        >
                            Submit Nil Return
                        </Button>
                    </form>
                ) : (
                    <div className="p-6 border-2 border-emerald-500/50 rounded-xl bg-emerald-500/5 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-3 text-emerald-600 mb-4">
                            <CheckCircle2 className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Successfully Filed!</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="text-muted-foreground font-medium">Response Code:</span>
                                <span className="font-mono font-medium">{result.ResponseCode}</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="text-muted-foreground font-medium">Acknowledgment Number:</span>
                                <span className="font-mono font-bold text-emerald-700">{result.AckNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                                <span className="text-muted-foreground font-medium">Status:</span>
                                <span className="font-medium">{result.Status}</span>
                            </div>
                            <p className="text-emerald-800 bg-emerald-100/50 p-3 rounded-lg mt-4 italic">
                                &quot;{result.Message}&quot;
                            </p>

                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <Button 
                                onClick={handleDownload}
                                loading={downloading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 flex items-center justify-center gap-2"
                            >
                                <Download className="h-5 w-5" />
                                Download Receipt
                            </Button>
                            <Button 
                                onClick={() => setResult(null)} 
                                variant="outline" 
                                className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 h-12"
                            >
                                File Another Return
                            </Button>
                        </div>

                    </div>
                )}
            </CardContent>
        </Card>
    );
}
