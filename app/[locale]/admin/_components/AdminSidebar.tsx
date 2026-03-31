'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  FileCheck2, 
  Shield, 
  Activity, 
  Bell, 
  LayoutDashboard,
  Settings,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: Activity, href: '/admin' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin?tab=users' },
  { id: 'transactions', label: 'Transactions', icon: DollarSign, href: '/admin?tab=transactions' },
  { id: 'verifications', label: 'Verifications', icon: FileCheck2, href: '/admin?tab=verifications' },
  { id: 'safaricom', label: 'Safaricom', icon: Shield, href: '/admin?tab=safaricom' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/admin?tab=notifications' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const locale = params?.locale as string || 'en';

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-6 top-24 bottom-6 w-64 z-50 rounded-[32px] glass-panel border border-white/10 shadow-2xl overflow-hidden hidden lg:flex flex-col"
    >
      {/* Brand Profile */}
      <div className="p-8 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-crimson)] flex items-center justify-center shadow-lg shadow-red-900/20">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight leading-4 uppercase">Akubrecah</h2>
            <p className="text-[10px] font-bold text-[var(--color-brand-red)] opacity-80 uppercase tracking-[0.2em] mt-1">Admin Ops</p>
          </div>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 p-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {navItems.map((item, idx) => {
          const isActive = currentTab === item.id;
          
          return (
            <motion.div
              key={item.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Link
                href={`/${locale}${item.href}`}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "text-[var(--color-accent)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04] active:scale-95"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-2xl shadow-[inset_0_0_12px_rgba(245,194,0,0.1)]"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  />
                )}
                
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110 relative z-10",
                  isActive ? "text-[var(--color-accent)] drop-shadow-[0_0_8px_rgba(245,194,0,0.5)]" : "text-gray-500 group-hover:text-gray-300"
                )} />
                
                <span className="text-sm font-bold relative z-10 tracking-tight">{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-auto relative z-10"
                  >
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </motion.div>
                )}

                {/* Hover Glow Effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-[var(--color-accent)]/0 group-hover:bg-[var(--color-accent)]/5 transition-colors" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-[var(--color-brand-red)] hover:bg-[var(--color-brand-red)]/5 transition-all duration-300 group font-bold"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm">Exit Admin</span>
        </Link>
      </div>
    </motion.aside>
  );
}
