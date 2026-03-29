import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const themeIndicator: Record<string, string> = {
  purple: "bg-[#7C3AED]",
  blue: "bg-[#3B82F6]",
  green: "bg-[#10B981]",
  pink: "bg-[#EC4899]",
  gold: "bg-[#F5C200]",
};

export function NotificationsTab({
  notifications,
  setEditingNotification,
  setNotificationForm,
  handleDeleteNotification
}: {
  notifications: any[];
  setEditingNotification: (val: any) => void;
  setNotificationForm: (val: any) => void;
  handleDeleteNotification: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between p-6 rounded-[24px] bg-[#1a1a1a] border border-white/5 shadow-2xl">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Platform Communications</h3>
          <button 
            onClick={() => {
              setEditingNotification({ id: 'new', message: '', type: 'marquee', theme: 'purple', active: true, createdAt: '' });
              setNotificationForm({ message: '', type: 'marquee', theme: 'purple', active: true });
            }}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
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
                "p-8 rounded-[32px] border border-white/5 bg-[#1a1a1a] shadow-2xl relative group overflow-hidden",
                !n.active && "opacity-50 grayscale"
              )}
            >
               {/* Theme Indicator Bar */}
               <div className={cn("absolute top-0 left-0 right-0 h-1", themeIndicator[n.theme] || themeIndicator.purple)} />

               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                       "px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase border",
                       n.type === 'marquee' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-[#F5C200]/10 text-[#F5C200] border-[#F5C200]/20"
                    )}>
                      {n.type}
                    </span>
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                       Theme: <span className="text-gray-400">{n.theme || 'purple'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                       onClick={() => {
                         setEditingNotification(n);
                         setNotificationForm({ message: n.message, type: n.type as any, theme: n.theme || 'purple', active: n.active });
                       }}
                       className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all transition-colors"
                     >
                       <Edit2 className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleDeleteNotification(n.id)}
                       className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-500 transition-all transition-colors"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <p 
                    className="text-white text-sm font-medium leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: n.message }}
                  />
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest tabular-nums">
                        Created: {new Date(n.createdAt).toLocaleDateString()}
                     </span>
                     <div className={cn(
                        "w-2 h-2 rounded-full",
                        n.active ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-700"
                     )} />
                  </div>
               </div>
            </motion.div>
          ))}
       </div>
    </div>
  );
}
