import { motion } from 'framer-motion';
import { Search, FileCheck2, Edit2, Zap } from 'lucide-react';
import { Pagination } from '../Pagination';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TIER_COLOR: Record<string, string> = {
  basic: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  pro: 'bg-[#F5C200]/10 text-[#F5C200] border-[#F5C200]/20',
  enterprise: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  none: 'bg-white/5 text-gray-500 border-white/10',
};

export function UsersTab({
  userSearch,
  setUserSearch,
  setUsersPage,
  usersTotal,
  users,
  usersPage,
  usersTotalPages,
  setEditingUser,
  setEditForm,
  fetchUserCertificates,
  setAssigningUser,
}: {
  userSearch: string;
  setUserSearch: (val: string) => void;
  setUsersPage: (val: number) => void;
  usersTotal: number;
  users: any[];
  usersPage: number;
  usersTotalPages: number;
  setEditingUser: (val: any) => void;
  setEditForm: (val: any) => void;
  fetchUserCertificates: (val: any) => void;
  setAssigningUser: (val: any) => void;
}) {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between p-6 rounded-[24px] bg-[#1a1a1a] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
               <input 
                 type="text" 
                 placeholder="Search citizens..." 
                 value={userSearch}
                 onChange={e => { setUserSearch(e.target.value); setUsersPage(1); }}
                 className="w-80 pl-12 pr-4 py-2.5 bg-[#0f0f0f] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#F5C200]/30 transition-all font-bold placeholder:text-gray-700 text-white"
               />
             </div>
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#F5C200]" />
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{usersTotal} Total Identities</span>
             </div>
          </div>
       </div>

       <div className="rounded-[32px] border border-white/5 bg-[#1a1a1a] shadow-2xl overflow-hidden">
          <table className="w-full text-left">
             <thead>
               <tr className="bg-white/[0.02] border-b border-white/5">
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Identity</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Privileges</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Subscription</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Expiry</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600">Credits</th>
                 <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-600 text-right">Actions</th>
               </tr>
             </thead>
             <tbody>
               {users.map((u, i) => (
                 <motion.tr 
                   key={u.id}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: i * 0.02 }}
                   className="border-b border-white/[0.02] group hover:bg-white/[0.01] transition-colors"
                 >
                   <td className="py-5 px-8">
                     <div className="font-bold text-sm text-white group-hover:text-[#F5C200] transition-colors">{u.name || 'Anonymous'}</div>
                     <div className="text-[10px] font-black text-gray-600 uppercase tracking-tighter mt-0.5">{u.email}</div>
                   </td>
                   <td className="py-5 px-8">
                     <span className={cn(
                       "px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest border uppercase",
                       u.role === 'admin' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                       u.role === 'cyber' ? "bg-[#F5C200]/10 text-[#F5C200] border-[#F5C200]/20" :
                       "bg-white/5 text-gray-500 border-white/10"
                     )}>
                       {u.role}
                     </span>
                   </td>
                   <td className="py-5 px-8">
                     <div className="flex flex-col gap-1">
                       <span className={cn(
                         "inline-flex w-fit px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest border uppercase",
                         TIER_COLOR[u.subscriptionTier?.toLowerCase()] || TIER_COLOR['none']
                       )}>
                         {u.subscriptionTier?.replace('_', ' ') || 'NONE'}
                       </span>
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-widest",
                         u.subscriptionStatus === 'active' ? "text-[#F5C200]" : "text-gray-700"
                       )}>{u.subscriptionStatus || 'INACTIVE'}</span>
                     </div>
                   </td>
                   <td className="py-5 px-8">
                     {u.subscriptionEnd && new Date(u.subscriptionEnd) > new Date() ? (
                       <div className="flex flex-col">
                         <span className="text-[10px] font-black text-gray-400 tabular-nums">
                           {new Date(u.subscriptionEnd).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: '2-digit' })}
                         </span>
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                       </div>
                     ) : (
                       <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">—</span>
                     )}
                   </td>
                   <td className="py-5 px-8 text-xs font-black text-gray-500 tabular-nums">{u.credits}</td>
                   <td className="py-5 px-8">
                     <div className="flex items-center justify-end gap-2">
                       {/* Quick Assign Limit */}
                       <button 
                         onClick={() => setAssigningUser(u)}
                         className="p-2.5 rounded-xl border border-sky-500/20 hover:bg-sky-500/10 text-gray-600 hover:text-sky-400 transition-all group/btn"
                         title="Quick Assign Tier"
                       >
                         <Zap className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                       </button>
                       <button 
                         onClick={() => fetchUserCertificates(u)}
                         className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-gray-600 hover:text-white transition-all group/btn"
                         title="View Certificates"
                       >
                         <FileCheck2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                       </button>
                       <button 
                         onClick={() => {
                           setEditingUser(u);
                           setEditForm({
                             role: u.role,
                             subscriptionTier: u.subscriptionTier,
                             subscriptionStatus: u.subscriptionStatus,
                             credits: u.credits,
                             subscriptionEnd: u.subscriptionEnd ? new Date(u.subscriptionEnd).toISOString().split('T')[0] : '',
                             pdfPremiumEnd: u.pdfPremiumEnd ? new Date(u.pdfPremiumEnd).toISOString().split('T')[0] : ''
                           });
                         }}
                         className="p-2.5 rounded-xl border border-white/5 hover:bg-[#F5C200]/10 hover:border-[#F5C200]/30 text-gray-600 hover:text-[#F5C200] transition-all group/btn"
                         title="Edit Profile"
                       >
                         <Edit2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                       </button>
                     </div>
                   </td>
                 </motion.tr>
               ))}
             </tbody>
          </table>
       </div>
       <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
    </div>
  );
}
