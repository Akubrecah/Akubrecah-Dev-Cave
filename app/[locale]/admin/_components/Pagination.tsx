import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-8">
       <button 
         disabled={page === 1}
         onClick={() => onPageChange(page - 1)}
         className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-[#F5C200]/10 hover:border-[#F5C200]/20 transition-all disabled:opacity-20"
       >
         <ChevronLeft className="w-5 h-5 text-gray-400" />
       </button>
       <span className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black tracking-widest text-gray-500 uppercase">
         Node {page} / {totalPages}
       </span>
       <button 
         disabled={page === totalPages}
         onClick={() => onPageChange(page + 1)}
         className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-[#F5C200]/10 hover:border-[#F5C200]/20 transition-all disabled:opacity-20"
       >
         <ChevronRight className="w-5 h-5 text-gray-400" />
       </button>
    </div>
  );
}
