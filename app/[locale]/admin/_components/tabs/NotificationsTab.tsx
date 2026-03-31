import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function NotificationsTab({
  notifications,
  setEditingNotification,
  setNotificationForm,
  handleNotificationDelete
}: {
  notifications: any[];
  setEditingNotification: (val: any) => void;
  setNotificationForm: (val: any) => void;
  handleNotificationDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between p-6 rounded-[24px] bg-[#1a1a1a] border border-white/5 shadow-2xl">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Platform Communications</h3>
          <button 
            onClick={() => {
              setEditingNotification({ id: 'new', message: '', type: 'marquee', active: true, createdAt: '', speed: 30 });
              setNotificationForm({ message: '', type: 'marquee', active: true, theme: 'purple', speed: 30 });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5C200] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F5C200]/90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Deploy Broadcast
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notifications.map((n, i) => (
            <motion.div 
              key={n.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-8 rounded-[32px] border border-white/5 bg-[#1a1a1a] shadow-2xl relative group",
                !n.active && "opacity-50 grayscale"
              )}
            >
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                       "px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase border",
                       n.type === 'marquee' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-[#F5C200]/10 text-[#F5C200] border-[#F5C200]/20"
                    )}>
                      {n.type}
                    </span>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Theme: {n.theme}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                       onClick={() => {
                         setEditingNotification(n);
                         setNotificationForm({ message: n.message, type: n.type as any, active: n.active, theme: n.theme, speed: n.speed || 30 });
                       }}
                       className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                     >
                       <Edit2 className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleNotificationDelete(n.id)}
                       className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-emerald-500 transition-all"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               <p className="text-sm font-black text-white line-clamp-2 mb-6 uppercase tracking-tight leading-relaxed">{n.message}</p>
               <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</span>
                  <div className={cn(
                     "w-1.5 h-1.5 rounded-full",
                     n.active ? "bg-[#F5C200] animate-pulse shadow-[0_0_8px_#F5C200]" : "bg-gray-800"
                  )} />
               </div>
            </motion.div>
          ))}
       </div>
    </div>
  );
}
