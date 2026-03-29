import { motion } from 'framer-motion';
import { Pagination } from '../Pagination';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function TransactionsTab({
  transactions,
  txPage,
  txTotalPages,
  setTxPage
}: {
  transactions: any[];
  txPage: number;
  txTotalPages: number;
  setTxPage: (val: number) => void;
}) {
  return (
    <div className="space-y-6">
       <div className="rounded-[32px] border border-white/5 bg-[#1a1a1a] shadow-2xl overflow-hidden">
          <table className="w-full text-left">
             <thead>
               <tr className="bg-white/[0.02] border-b border-white/5">
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Identity</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Volume</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Category</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Reference</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">State</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Chronology</th>
               </tr>
             </thead>
             <tbody>
               {transactions.map((tx, i) => (
                 <motion.tr 
                   key={tx.id}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: i * 0.02 }}
                   className="border-b border-white/[0.02] group hover:bg-white/[0.01] transition-colors"
                 >
                   <td className="py-5 px-8">
                     <div className="font-bold text-sm text-white group-hover:text-[#F5C200] transition-colors">{tx.user?.name || 'Anonymous'}</div>
                     <div className="text-[10px] font-black text-gray-600 uppercase tracking-tighter mt-0.5">{tx.user?.email}</div>
                   </td>
                   <td className="py-5 px-8 text-sm font-black text-[#F5C200] tabular-nums">KES {(tx.amount/100).toLocaleString()}</td>
                   <td className="py-5 px-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">{tx.type}</td>
                   <td className="py-5 px-8">
                     <span className={cn(
                       "px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest border uppercase",
                       tx.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                       tx.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                       "bg-red-500/10 text-red-500 border-red-500/20"
                     )}>
                       {tx.status}
                     </span>
                   </td>
                   <td className="py-5 px-8 text-[10px] font-black text-gray-700 uppercase tracking-widest">
                     {new Date(tx.createdAt).toLocaleDateString()}
                   </td>
                 </motion.tr>
               ))}
             </tbody>
          </table>
       </div>
       <Pagination page={txPage} totalPages={txTotalPages} onPageChange={setTxPage} />
    </div>
  );
}
