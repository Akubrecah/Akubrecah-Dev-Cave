import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, RefreshCw, DollarSign, ExternalLink } from 'lucide-react';

export function SafaricomTab({
  stkForm,
  setStkForm,
  safaricomLoading,
  safaricomResult,
  handleSafaricomAction,
  setSafaricomResult,
  paystackBalance,
  handlePaystackAction,
  paystackLoading,
  paystackResult,
  setPaystackResult
}: {
  stkForm: any;
  setStkForm: any;
  safaricomLoading: boolean;
  safaricomResult: any;
  handleSafaricomAction: (action: string, params: any) => void;
  setSafaricomResult: (val: any) => void;
  paystackBalance: any;
  handlePaystackAction: (action: string, params: any) => void;
  paystackLoading: boolean;
  paystackResult: any;
  setPaystackResult: (val: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       {/* Paystack Panel */}
       <div className="p-10 rounded-[32px] bg-[#1a1a1a] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
             <RefreshCw className="w-24 h-24 text-[#F5C200]" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase flex items-center gap-2">
            Paystack Hub
            <span className="px-2 py-0.5 rounded-lg bg-[#F5C200]/10 text-[#F5C200] text-[10px] tracking-widest border border-[#F5C200]/20">LIVE</span>
          </h3>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-8">Primary Payment Gateway Management</p>
          
          <div className="space-y-6">
             <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Balance Reserves</span>
                  <DollarSign className="w-4 h-4 text-[#F5C200]" />
                </div>
                <div className="text-2xl font-black text-white tabular-nums">
                  {paystackLoading ? '---' : paystackBalance ? `${paystackBalance.currency} ${(paystackBalance.balance / 100).toLocaleString()}` : '0.00'}
                </div>
                <button 
                  onClick={() => handlePaystackAction('balance', {})}
                  className="mt-4 flex items-center gap-2 text-[10px] font-black text-[#F5C200] hover:text-white transition-colors uppercase tracking-widest"
                >
                  <RefreshCw className={paystackLoading ? "w-3 h-3 animate-spin" : "w-3 h-3"} />
                  Re-fetch Reserves
                </button>
             </div>

             <div className="space-y-4 pt-4 border-t border-white/5">
                <button 
                   onClick={() => handlePaystackAction('list', {})}
                   className="w-full text-left p-6 rounded-[24px] bg-[#0f0f0f] border border-white/5 hover:bg-white/5 transition-all group flex items-center justify-between"
                >
                   <div>
                      <div className="font-bold text-white text-sm">Flow History</div>
                      <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-1 text-balance">Review direct Paystack transaction flow</div>
                   </div>
                   <ExternalLink className="w-5 h-5 text-gray-700 group-hover:text-[#F5C200] group-hover:translate-x-1 transition-all" />
                </button>
             </div>
          </div>
       </div>

       {/* Secondary M-Pesa Panel */}
       <div className="space-y-6">
          <div className="p-8 rounded-[32px] bg-[#1a1a1a] border border-white/5 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-20 h-20 text-[#F5C200]" />
             </div>
             <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6">M-Pesa Direct (Internal)</h4>
             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Terminal Line</label>
                  <input 
                    placeholder="254700000000"
                    value={stkForm.phoneNumber}
                    onChange={e => setStkForm((p: any) => ({ ...p, phoneNumber: e.target.value }))}
                    className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 transition-all text-white"
                  />
                </div>
                <button 
                  onClick={() => handleSafaricomAction('stkpush', { ...stkForm, amount: '1', accountRef: 'AdminTest' })}
                  disabled={safaricomLoading || !stkForm.phoneNumber}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                >
                  {safaricomLoading ? 'Waking...' : 'Internal STK Ping'}
                </button>
             </div>
          </div>

          <AnimatePresence mode="popLayout">
             {(safaricomResult || paystackResult) && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.98, y: 10 }}
                 className="p-8 rounded-[32px] bg-black border border-white/5 shadow-2xl relative overflow-hidden"
               >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F5C200]/50 to-transparent" />
                  <button onClick={() => { setSafaricomResult(null); setPaystackResult?.(null); }} className="absolute top-4 right-4 text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">Terminate View</button>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F5C200] animate-pulse" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Output Stream</span>
                  </div>
                  <pre className="text-[10px] font-mono text-[#F5C200]/80 overflow-auto max-h-80 custom-scrollbar leading-relaxed">
                    {JSON.stringify(safaricomResult || paystackResult, null, 2)}
                  </pre>
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}
