"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, XCircle, CheckCircle2, RefreshCw, Navigation } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavSetting {
  id: string;
  href: string;
  label: string;
  isHidden: boolean;
  isDisabled: boolean;
}

export function NavigationTab() {
  const [settings, setSettings] = useState<NavSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/navigation');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch navigation settings', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSetting(id: string, field: 'isHidden' | 'isDisabled', value: boolean) {
    const updateKey = `${id}-${field}`;
    setUpdating(updateKey);
    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'PATCH',
        body: JSON.stringify({ id, [field]: value }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(prev => prev.map(s => s.id === id ? updated : s));
      }
    } catch (err) {
      console.error('Failed to update setting', err);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-[#F5C200] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-[32px] bg-[#1a1a1a] border border-white/5 shadow-2xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">Navigation Control Center</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black opacity-60">Manage global visibility and accessibility of header links</p>
        </div>
        <div className="p-3 rounded-2xl bg-[#F5C200]/10 border border-[#F5C200]/20">
          <Navigation className="w-5 h-5 text-[#F5C200]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {settings.length === 0 && (
          <div className="p-12 text-center rounded-[32px] border border-dashed border-white/10 bg-white/[0.02]">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No navigation links discovered yet</p>
          </div>
        )}
        
        {settings.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "p-6 rounded-[28px] border border-white/5 bg-[#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group hover:border-[#F5C200]/20",
              s.isHidden && "border-red-500/20 bg-red-500/[0.02]",
              s.isDisabled && "border-orange-500/20 bg-orange-500/[0.02]"
            )}
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                s.isHidden 
                  ? "bg-red-500/10 text-red-500" 
                  : s.isDisabled 
                    ? "bg-orange-500/10 text-orange-500" 
                    : "bg-white/5 text-[#F5C200] group-hover:bg-[#F5C200]/10"
              )}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">{s.label}</h4>
                <p className="text-[10px] text-gray-500 font-black tracking-widest mt-1 opacity-40">{s.href}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* HIDDEN TOGGLE */}
              <button
                onClick={() => toggleSetting(s.id, 'isHidden', !s.isHidden)}
                disabled={updating === `${s.id}-isHidden`}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                  s.isHidden 
                    ? "bg-red-500/20 text-red-500 border-red-500/30" 
                    : "bg-white/5 text-gray-400 hover:text-white border-transparent hover:border-white/10"
                )}
              >
                {updating === `${s.id}-isHidden` ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : s.isHidden ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                {s.isHidden ? 'Hidden' : 'Visible'}
              </button>

              {/* DISABLED TOGGLE */}
              <button
                onClick={() => toggleSetting(s.id, 'isDisabled', !s.isDisabled)}
                disabled={updating === `${s.id}-isDisabled`}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                  s.isDisabled 
                    ? "bg-orange-500/20 text-orange-500 border-orange-500/30" 
                    : "bg-white/5 text-gray-400 hover:text-white border-transparent hover:border-white/10"
                )}
              >
                {updating === `${s.id}-isDisabled` ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : s.isDisabled ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {s.isDisabled ? 'Disabled' : 'Enabled'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
