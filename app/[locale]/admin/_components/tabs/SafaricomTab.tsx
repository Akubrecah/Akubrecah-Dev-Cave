import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';

export function SafaricomTab({
  stkForm,
  setStkForm,
  safaricomLoading,
  safaricomResult,
  handleSafaricomAction,
  setSafaricomResult
}: {
  stkForm: any;
  setStkForm: any;
  safaricomLoading: boolean;
  safaricomResult: any;
  handleSafaricomAction: (action: string, params: any) => void;
  setSafaricomResult: (val: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       <div className="p-10 rounded-[32px] bg-[#1a1a1a] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
             <Shield className="w-24 h-24 text-[#F5C200]" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-8 uppercase">Payment Gateway</h3>
          <div className="space-y-6">
             <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Test MSISDN</label>
               <input 
                 placeholder="254700000000"
                 value={stkForm.phoneNumber}
                 onChange={e => setStkForm((p: any) => ({ ...p, phoneNumber: e.target.value }))}
                 className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 transition-all placeholder:text-gray-800 text-white"
               />
             </div>
             <div className="grid grid-cols-2 gap-6">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Volume</label>
                 <input 
                   type="number"
                   value={stkForm.amount}
                   onChange={e => setStkForm((p: any) => ({ ...p, amount: e.target.value }))}
                   className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 transition-all text-white"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Referential</label>
                 <input 
                   value={stkForm.accountRef}
                   onChange={e => setStkForm((p: any) => ({ ...p, accountRef: e.target.value }))}
                   className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 transition-all text-white"
                 />
               </div>
             </div>
             <button 
               onClick={() => handleSafaricomAction('stkpush', { ...stkForm, transactionDesc: 'Ops Audit' })}
               disabled={safaricomLoading || !stkForm.phoneNumber}
               className="w-full py-4 bg-[#F5C200] hover:bg-[#F5C200]/90 text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-xl shadow-[#F5C200]/20 active:scale-95"
             >
               {safaricomLoading ? 'Initiating...' : 'Fire STK Push'}
             </button>
          </div>
       </div>

       <div className="space-y-6">
          <div className="p-8 rounded-[32px] bg-[#1a1a1a] border border-white/5 shadow-2xl">
             <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6">Ops Utilities</h4>
             <div className="space-y-4">
                <button onClick={() => handleSafaricomAction('balance', {})} className="w-full text-left p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 hover:bg-white/5 transition-all group flex items-center justify-between">
                   <div>
                      <div className="font-bold text-white text-sm">Query Wallet Balance</div>
                      <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-1">Verify current float reserves</div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-[#F5C200] group-hover:translate-x-1 transition-all" />
                </button>
             </div>
          </div>

          <AnimatePresence>
             {safaricomResult && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 className="p-8 rounded-[32px] bg-black border border-white/5 shadow-2xl relative"
               >
                  <button onClick={() => setSafaricomResult(null)} className="absolute top-4 right-4 text-xs font-black text-red-500 uppercase tracking-widest">Close Output</button>
                  <pre className="text-[10px] font-mono text-[#F5C200]/80 overflow-auto max-h-64 custom-scrollbar">{JSON.stringify(safaricomResult, null, 2)}</pre>
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}
