import { motion } from 'framer-motion';
import { Search, Shield } from 'lucide-react';
import { Pagination } from '../Pagination';

export function VerificationsTab({
  vfSearch,
  setVfSearch,
  setVfPage,
  verifications,
  vfPage,
  vfTotalPages
}: {
  vfSearch: string;
  setVfSearch: (val: string) => void;
  setVfPage: (val: number) => void;
  verifications: any[];
  vfPage: number;
  vfTotalPages: number;
}) {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between p-6 rounded-[24px] bg-[#1a1a1a] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
               <input 
                 type="text" 
                 placeholder="Search PINs or Names..." 
                 value={vfSearch}
                 onChange={e => { setVfSearch(e.target.value); setVfPage(1); }}
                 className="w-80 pl-12 pr-4 py-2.5 bg-[#0f0f0f] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#F5C200]/30 transition-all font-bold placeholder:text-gray-700 text-white"
               />
             </div>
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#F5C200]" />
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deep Verification Protocol</span>
             </div>
          </div>
       </div>

       <div className="rounded-[32px] border border-white/5 bg-[#1a1a1a] shadow-2xl overflow-hidden">
          <table className="w-full text-left">
             <thead>
               <tr className="bg-white/[0.02] border-b border-white/5">
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Taxpayer</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">KRA PIN</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Initiator</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Chronology</th>
               </tr>
             </thead>
             <tbody>
               {verifications.map((vf, i) => (
                 <motion.tr 
                   key={vf.id}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: i * 0.02 }}
                   className="border-b border-white/[0.02] group hover:bg-white/[0.01] transition-colors"
                 >
                   <td className="py-5 px-8">
                     <div className="font-bold text-sm text-white group-hover:text-[#F5C200] transition-colors">{vf.taxpayerName || 'Direct ID Pull'}</div>
                     <span className="text-[9px] font-black text-[#F5C200]/60 uppercase tracking-widest">Verified</span>
                   </td>
                   <td className="py-5 px-8 text-sm font-black text-gray-400 tabular-nums uppercase">{vf.kraPin}</td>
                   <td className="py-5 px-8">
                     <div className="text-[10px] font-black text-white uppercase tracking-tighter">{vf.user?.name || 'Anonymous'}</div>
                     <div className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{vf.user?.email}</div>
                   </td>
                   <td className="py-5 px-8 text-[10px] font-black text-gray-700 uppercase tracking-widest">
                     {new Date(vf.createdAt).toLocaleString()}
                   </td>
                 </motion.tr>
               ))}
               {verifications.length === 0 && (
                 <tr>
                   <td colSpan={4} className="py-20 text-center">
                      <Shield className="w-12 h-12 text-gray-800 mx-auto mb-4 opacity-20" />
                      <p className="text-gray-600 font-black uppercase tracking-widest text-xs">No verification records found</p>
                   </td>
                 </tr>
               )}
             </tbody>
          </table>
       </div>
       <Pagination page={vfPage} totalPages={vfTotalPages} onPageChange={setVfPage} />
    </div>
  );
}
