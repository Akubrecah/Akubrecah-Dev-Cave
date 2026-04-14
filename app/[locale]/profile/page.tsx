"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Sun, Moon, Monitor, Check,
  ArrowLeft, Bell, Lock,
  Sparkles, Palette, Globe
} from 'lucide-react';
import { UserProfile, useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme, type Theme } from '@/components/providers/ThemeProvider';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { theme, setTheme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-20 relative z-10">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-16">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest italic">Go Back</span>
          </button>
          
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
            >
              Account
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
            >
              Preferences
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Sidebar / Overview */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-10 rounded-[3rem] border border-white/10 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-yellow-500" />
              
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl mx-auto">
                    <Image 
                      src={user?.imageUrl || ''} 
                      alt={user?.fullName || 'User'} 
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-500 text-white rounded-2xl shadow-xl border-4 border-black">
                   <Shield size={16} />
                </div>
              </div>

              <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-2">{user?.fullName}</h1>
              <p className="text-[#BEA0A0] text-[10px] font-black uppercase tracking-[0.2em] mb-8">{user?.primaryEmailAddress?.emailAddress}</p>
              
              <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                 <div className="text-center">
                    <div className="text-lg font-black text-white italic">PRO</div>
                    <div className="text-[8px] text-white/30 uppercase font-black tracking-widest">Account Status</div>
                 </div>
                 <div className="text-center">
                    <div className="text-lg font-black text-emerald-500 italic">250</div>
                    <div className="text-[8px] text-white/30 uppercase font-black tracking-widest">Active Credits</div>
                 </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="glass-panel p-8 rounded-[2.5rem] border border-white/10"
            >
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 italic">Quick Controls</h3>
               <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                     <div className="flex items-center gap-3">
                        <Bell size={16} className="text-white/40 group-hover:text-yellow-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Notifications</span>
                     </div>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                     <div className="flex items-center gap-3">
                        <Lock size={16} className="text-white/40 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Privacy Vault</span>
                     </div>
                     <Check size={14} className="text-emerald-500 opacity-20" />
                  </button>
               </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' ? (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="glass-panel rounded-[3rem] border border-white/10 overflow-hidden bg-white/[0.02]">
                    <div className="p-10 border-b border-white/10 flex items-center justify-between">
                       <div>
                          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">Identity Profile</h2>
                          <p className="text-[10px] font-bold text-[#BEA0A0] uppercase tracking-widest">Clerk Protocol Management</p>
                       </div>
                       <Sparkles className="text-yellow-500 h-6 w-6 opacity-20" />
                    </div>
                    {/* Clerk UserProfile is quite large, but we can wrap it or use custom fields. 
                        Since the user wants full edit capability, Clerk's built-in is best. */}
                    <div className="p-0 clerk-profile-wrapper">
                       <UserProfile 
                          path={`/${locale}/profile`} 
                          routing="path" 
                          appearance={{
                            elements: {
                              rootBox: 'w-full max-w-none m-0 shadow-none',
                              card: 'bg-transparent shadow-none border-none p-0 md:p-10',
                              navbar: 'hidden', // We skip navbar to keep it clean
                              headerTitle: 'text-white italic font-black uppercase tracking-tighter text-xl',
                              headerSubtitle: 'text-white/40 text-[10px] font-black uppercase tracking-widest',
                              formFieldLabel: 'text-white/40 text-[10px] font-black uppercase tracking-widest mb-2',
                              formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-600 rounded-xl font-black uppercase tracking-widest italic text-[10px] py-4',
                              avatarBox: 'w-24 h-24 rounded-3xl',
                              userButtonPopoverActionButtonText: 'text-white',
                              profileSectionTitleText: 'text-white italic font-black uppercase tracking-widest text-xs border-b border-white/10 pb-4 mb-8',
                            }
                          }}
                       />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="glass-panel p-12 rounded-[3rem] border border-white/10 bg-white/[0.02]">
                     <div className="mb-12">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Visual Terminal</h2>
                        <p className="text-[10px] font-bold text-[#BEA0A0] uppercase tracking-widest">Interface Skin Calibration</p>
                     </div>

                     <div className="grid sm:grid-cols-3 gap-6">
                        {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                           <button
                             key={t}
                             onClick={() => setTheme(t)}
                             className={`relative group p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-6 overflow-hidden ${
                               theme === t 
                                 ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                                 : 'border-white/5 bg-white/5 hover:border-white/20'
                             }`}
                           >
                             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${theme === t ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                                {t === 'light' && <Sun size={24} />}
                                {t === 'dark' && <Moon size={24} />}
                                {t === 'system' && <Monitor size={24} />}
                             </div>
                             
                             <div className="text-center">
                                <p className="text-xs font-black uppercase tracking-widest mb-1 italic">{t}</p>
                                <p className="text-[8px] font-medium text-white/20 uppercase tracking-tighter">
                                   {t === 'light' && 'Solar High Contrast'}
                                   {t === 'dark' && 'Deep Space Mode'}
                                   {t === 'system' && 'OS Protocol Link'}
                                </p>
                             </div>

                             {theme === t && (
                                <motion.div 
                                  layoutId="theme-active"
                                  className="absolute top-4 right-4 text-emerald-500"
                                >
                                   <Check size={16} strokeWidth={4} />
                                </motion.div>
                             )}
                           </button>
                        ))}
                     </div>

                     <div className="mt-12 p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-6">
                        <div className="p-4 rounded-xl bg-yellow-500/10 text-yellow-500">
                           <Palette size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1 italic text-yellow-500">Emerald Accents</p>
                           <p className="text-[9px] font-medium text-white/40 uppercase leading-relaxed">Accents are currently synchronized to the AkubrecaH Emerald Foundation. Custom accent support coming soon.</p>
                        </div>
                     </div>
                  </div>

                  <div className="glass-panel p-12 rounded-[3rem] border border-white/10 bg-white/[0.02]">
                     <div className="mb-12">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Regional Specs</h2>
                        <p className="text-[10px] font-bold text-[#BEA0A0] uppercase tracking-widest">Localization Settings</p>
                     </div>

                     <div className="grid gap-4">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <Globe size={16} className="text-white/20" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Language Protocol</span>
                            </div>
                            <span className="text-[10px] font-black uppercase italic tracking-widest text-emerald-500">English (Global)</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <Monitor size={16} className="text-white/20" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Interface Scale</span>
                            </div>
                            <span className="text-[10px] font-black uppercase italic tracking-widest text-white/20">Standard 1.0</span>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
         .clerk-profile-wrapper .cl-internal-2f9ih3 { display: none !important; }
         .clerk-profile-wrapper .cl-card { 
            background: transparent !important; 
            box-shadow: none !important;
            border: none !important;
         }
         .clerk-profile-wrapper .cl-profileSectionTitle { border-bottom: 1px solid rgba(255,255,255,0.1) !important; }
         .clerk-profile-wrapper .cl-navbar { display: none !important; }
         .clerk-profile-wrapper .cl-scrollBox { background: transparent !important; }
         .clerk-profile-wrapper .cl-headerTitle { color: white !important; font-style: italic !important; font-weight: 900 !important; text-transform: uppercase !important; }
         .clerk-profile-wrapper .cl-headerSubtitle { color: rgba(255,255,255,0.4) !important; text-transform: uppercase !important; font-size: 10px !important; letter-spacing: 0.1em !important; }
         .clerk-profile-wrapper .cl-formFieldLabel { color: rgba(255,255,255,0.6) !important; font-weight: 900 !important; text-transform: uppercase !important; font-size: 10px !important; }
         .clerk-profile-wrapper .cl-formButtonPrimary { background-color: #10b981 !important; border-radius: 1rem !important; }
         .clerk-profile-wrapper .cl-formFieldInput { background-color: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; border-radius: 1rem !important; padding: 1rem !important; }
      `}</style>
    </div>
  );
}
