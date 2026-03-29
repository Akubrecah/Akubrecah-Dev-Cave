"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, DollarSign, FileCheck2, Shield, Search, 
  ChevronLeft, ChevronRight, RefreshCw, TrendingUp,
  Activity, Eye, ArrowLeft, Trash2, Edit2, Bell,
  Plus, MessageSquare, Zap, Palette
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';


// Premium Components
import { AdminSidebar } from './_components/AdminSidebar';
import { AdminHeader } from './_components/AdminHeader';
import { AdminMetricCard } from './_components/AdminMetricCard';
import { PremiumAreaChart } from './_components/PremiumAreaChart';
import { ActivityStream, type ActivityItem } from './_components/ActivityStream';


import { OverviewTab } from './_components/tabs/OverviewTab';
import { UsersTab } from './_components/tabs/UsersTab';
import { TransactionsTab } from './_components/tabs/TransactionsTab';
import { VerificationsTab } from './_components/tabs/VerificationsTab';
import { SafaricomTab } from './_components/tabs/SafaricomTab';
import { NotificationsTab } from './_components/tabs/NotificationsTab';
type Tab = 'overview' | 'users' | 'transactions' | 'verifications' | 'safaricom' | 'notifications';

interface Stats {
  totalUsers: number;
  totalTransactions: number;
  totalVerifications: number;
  totalCertificates: number;
  totalRevenue: number;
  recentUsers: number;
  activeSubscriptions: number;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
  subscriptionStatus: string;
  subscriptionTier: string;
  subscriptionEnd: string | null;
  pdfPremiumEnd?: string | null;
  createdAt: string;
  _count: { verifications: number; certificates: number; transactions: number };
}

interface TransactionRow {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  user: { email: string; name: string | null };
}

interface VerificationRow {
  id: string;
  kraPin: string;
  taxpayerName: string | null;
  createdAt: string;
  user: { email: string; name: string | null };
}

interface NotificationRow {
  id: string;
  message: string;
  type: string;
  active: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab;
  
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'overview');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'users' | 'transactions' | 'traffic'>('revenue');

  function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  const [stats, setStats] = useState<Stats | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Users
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');

  // Transactions
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);

  // Verifications
  const [verifications, setVerifications] = useState<VerificationRow[]>([]);
  const [vfPage, setVfPage] = useState(1);
  const [vfTotalPages, setVfTotalPages] = useState(1);
  const [vfSearch, setVfSearch] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [editingNotification, setEditingNotification] = useState<NotificationRow | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    message: '',
    type: 'marquee' as 'marquee' | 'popup',
    theme: 'purple',
    active: true
  });

  // Editing user
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [viewingCertificatesUser, setViewingCertificatesUser] = useState<UserRow | null>(null);
  const [userCertificates, setUserCertificates] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    role: '',
    subscriptionTier: '',
    subscriptionStatus: '',
    credits: 0,
    subscriptionEnd: '',
    pdfPremiumEnd: ''
  });

  const [safaricomLoading, setSafaricomLoading] = useState(false);
  const [safaricomResult, setSafaricomResult] = useState<any>(null);
  const [paystackResult, setPaystackResult] = useState<any>(null);
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [paystackBalance, setPaystackBalance] = useState<any>(null);
  const [stkForm, setStkForm] = useState({ phoneNumber: '', amount: '1', accountRef: 'AdminTest' });

  // Data Actions
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error('Stats fetch failed:', e); }
  }, []);

  const fetchTimeSeries = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/time-series');
      if (res.ok) setTimeSeriesData(await res.json());
    } catch (e) { console.error('Time-series fetch failed:', e); }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      const res = await fetch('/api/admin/health');
      if (res.ok) setHealthData(await res.json());
    } catch (e) { console.error('Health fetch failed:', e); }
    finally { setHealthLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: usersPage.toString(), limit: '15' });
      if (userSearch) params.set('search', userSearch);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUsersTotalPages(data.totalPages);
        setUsersTotal(data.total);
      }
    } catch (e) { console.error('Users fetch failed:', e); }
  }, [usersPage, userSearch]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/transactions?page=${txPage}&limit=15`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setTxTotalPages(data.totalPages);
      }
    } catch (e) { console.error('Tx fetch failed:', e); }
  }, [txPage]);

  const fetchVerifications = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: vfPage.toString(), limit: '15' });
      if (vfSearch) params.set('search', vfSearch);
      const res = await fetch(`/api/admin/verifications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVerifications(data.verifications);
        setVfTotalPages(data.totalPages);
      }
    } catch (e) { console.error('Vf fetch failed:', e); }
  }, [vfPage, vfSearch]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch (e) { console.error('Notifications fetch failed:', e); }
  }, []);

  const handlePaystackAction = useCallback(async (action: string, params: any) => {
    try {
      setPaystackLoading(true);
      const res = await fetch('/api/admin/paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });
      const data = await res.json();
      if (action === 'balance' && data.data) {
        setPaystackBalance(data.data[0]);
      }
      setPaystackResult(data);
    } catch (e) { console.error('Paystack action failed:', e); }
    finally { setPaystackLoading(false); }
  }, []);

  const handleSafaricomAction = async (action: string, params: any) => {
    try {
      setSafaricomLoading(true);
      const res = await fetch('/api/admin/safaricom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });
      setSafaricomResult(await res.json());
    } catch (e) { console.error('Safaricom action failed:', e); }
    finally { setSafaricomLoading(false); }
  };

  const refreshAll = useCallback(() => {
    setLoading(true);
    const promises = [fetchStats(), fetchTimeSeries(), fetchHealth()];
    if (activeTab === 'users') promises.push(fetchUsers());
    if (activeTab === 'transactions') promises.push(fetchTransactions());
    if (activeTab === 'verifications') promises.push(fetchVerifications());
    if (activeTab === 'notifications') promises.push(fetchNotifications());
    
    Promise.all(promises).finally(() => setLoading(false));
  }, [activeTab, fetchStats, fetchTimeSeries, fetchHealth, fetchUsers, fetchTransactions, fetchVerifications, fetchNotifications]);

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    refreshAll();
    if (activeTab === 'safaricom') {
      handlePaystackAction('balance', {});
    }
  }, [activeTab, refreshAll, handlePaystackAction]);

  // Activity Feed Derived from Data
  const activities = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [];
    
    // Recent Users
    users.slice(0, 3).forEach(u => list.push({
      id: `u-${u.id}`,
      type: 'user',
      title: 'New Identity Secured',
      description: `${u.name || u.email} has joined the platform.`,
      timestamp: u.createdAt
    }));
    
    // Recent Transactions
    transactions.slice(0, 3).forEach(t => list.push({
      id: `t-${t.id}`,
      type: 'payment',
      title: 'Revenue Generated',
      description: `Successfull ${t.type} of KES ${(t.amount/100).toLocaleString()}.`,
      timestamp: t.createdAt
    }));

    return list.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [users, transactions]);

  const handleSyncUsers = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/admin/sync-users');
      if (res.ok) refreshAll();
    } catch (e) {
      console.error('Failed to sync users:', e);
    } finally {
      setIsSyncing(false);
    }
  };


  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload = {
        userId: editingUser.id,
        role: editForm.role,
        subscriptionTier: editForm.subscriptionTier,
        subscriptionStatus: editForm.subscriptionStatus,
        credits: editForm.credits,
        subscriptionEnd: editForm.subscriptionEnd ? new Date(editForm.subscriptionEnd).toISOString() : null,
        pdfPremiumEnd: editForm.pdfPremiumEnd ? new Date(editForm.pdfPremiumEnd).toISOString() : null,
      };
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setEditingUser(null); fetchUsers(); }
    } catch (e) { console.error('User update failed:', e); }
  };

  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification) return;

    try {
      const isNew = editingNotification.id === 'new';
      const method = isNew ? 'POST' : 'PATCH';
      const payload = isNew ? notificationForm : { ...notificationForm, id: editingNotification.id };

      const res = await fetch('/api/admin/notifications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingNotification(null);
        fetchNotifications();
      }
    } catch (e) {
      console.error('Failed to save notification:', e);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to terminate this broadcast?')) return;

    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
  };

  const fetchUserCertificates = async (user: UserRow) => {
    try {
      setViewingCertificatesUser(user);
      setCertsLoading(true);
      const res = await fetch(`/api/admin/users/${user.id}/certificates`);
      if (res.ok) {
        setUserCertificates(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch user certificates:', e);
    } finally {
      setCertsLoading(false);
    }
  };

  const handleDownloadCertificate = async (cert: any) => {
    try {
      const { generateKraPdf } = await import('@/lib/pdf/generate-kra-pdf');
      const filename = `RE_DOWNLOAD_KRA_PIN_${cert.kraPin}.pdf`;
      
      const pdfBytes = await generateKraPdf(cert.details);
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (e) {
      console.error('Failed to regenerate certificate:', e);
      alert('Failed to regenerate certificate PDF.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#F5C200]/30 overflow-x-hidden font-sans">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F5C200]/05 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E30613]/05 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20 relative z-10">
        <AdminHeader 
          title={activeTab === 'overview' ? 'Operational Insight' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
          subtitle="AkubrecaH Platform Control"
          onRefresh={refreshAll}
          isSyncing={isSyncing}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
               <div className="relative">
                  <div className="w-16 h-16 border-2 border-white/5 rounded-full animate-spin border-t-[#F5C200]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-2 h-2 bg-[#F5C200] rounded-full animate-pulse" />
                  </div>
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Initializing Core...</p>
            </div>
          ) : (
             <motion.div 
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
             >
                {activeTab === 'overview' && (
                  <OverviewTab stats={stats} chartMetric={chartMetric} setChartMetric={setChartMetric} timeSeriesData={timeSeriesData} isSyncing={isSyncing} handleSyncUsers={handleSyncUsers} healthLoading={healthLoading} healthData={healthData} activities={activities} />
                )}
                {activeTab === 'users' && (
                  <UsersTab userSearch={userSearch} setUserSearch={setUserSearch} setUsersPage={setUsersPage} usersTotal={usersTotal} users={users} usersPage={usersPage} usersTotalPages={usersTotalPages} setEditingUser={setEditingUser} setEditForm={setEditForm} fetchUserCertificates={fetchUserCertificates} />
                )}
                {activeTab === 'transactions' && (
                  <TransactionsTab transactions={transactions} txPage={txPage} txTotalPages={txTotalPages} setTxPage={setTxPage} />
                )}
                {activeTab === 'verifications' && (
                  <VerificationsTab vfSearch={vfSearch} setVfSearch={setVfSearch} setVfPage={setVfPage} verifications={verifications} vfPage={vfPage} vfTotalPages={vfTotalPages} />
                )}
                {activeTab === 'safaricom' && (
                  <SafaricomTab 
                    stkForm={stkForm} 
                    setStkForm={setStkForm} 
                    safaricomLoading={safaricomLoading} 
                    safaricomResult={safaricomResult} 
                    handleSafaricomAction={handleSafaricomAction} 
                    setSafaricomResult={setSafaricomResult}
                    paystackResult={paystackResult}
                    setPaystackResult={setPaystackResult}
                    paystackBalance={paystackBalance}
                    paystackLoading={paystackLoading}
                    handlePaystackAction={handlePaystackAction}
                  />
                )}
                {activeTab === 'notifications' && (
                  <NotificationsTab notifications={notifications} setEditingNotification={setEditingNotification} setNotificationForm={setNotificationForm} handleDeleteNotification={handleDeleteNotification} />
                )}
             </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {editingUser && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingUser(null)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl p-10 rounded-[48px] bg-[#1a1a1a] border border-white/5 shadow-2xl">
                 <h2 className="text-3xl font-black text-white tracking-tighter mb-8 uppercase">Profile Override</h2>
                 <form onSubmit={handleUserUpdate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Privilege Level</label>
                          <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-3xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 text-white">
                             <option value="personal">Personal</option>
                             <option value="cyber">Cyber</option>
                             <option value="admin">Admin</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Credits Reserve</label>
                          <input type="number" value={editForm.credits} onChange={e => setEditForm(p => ({ ...p, credits: parseInt(e.target.value) || 0 }))} className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-3xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 text-white" />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Tier Selection</label>
                          <select value={editForm.subscriptionTier} onChange={e => setEditForm(p => ({ ...p, subscriptionTier: e.target.value }))} className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-3xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 text-white">
                             <option value="none">Empty</option>
                             <option value="pro">Pro Status</option>
                             <option value="daily_pro">Daily Access</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Flow State</label>
                          <select value={editForm.subscriptionStatus} onChange={e => setEditForm(p => ({ ...p, subscriptionStatus: e.target.value }))} className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-3xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 text-white">
                             <option value="inactive">Deep Sleep</option>
                             <option value="active">Operational</option>
                             <option value="past_due">Awaiting Flow</option>
                          </select>
                       </div>
                    </div>

                    <div className="flex gap-4 pt-8">
                       <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all">Abort</button>
                       <button type="submit" className="flex-[2] py-5 bg-[#F5C200] text-black rounded-[24px] font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-[#F5C200]/20 active:scale-95">Commit Changes</button>
                    </div>
                 </form>
              </motion.div>
           </div>
        )}

        {editingNotification && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingNotification(null)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl p-10 rounded-[48px] bg-[#1a1a1a] border border-white/5 shadow-2xl">
                 <h2 className="text-3xl font-black text-white tracking-tighter mb-8 uppercase">Communications Override</h2>
                 <form onSubmit={handleSaveNotification} className="space-y-8">
                  {/* Broadcast Message */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                       <MessageSquare className="w-3 h-3 text-[#F5C200]" /> Broadcast Message
                    </label>
                    <textarea 
                      value={notificationForm.message}
                      onChange={e => setNotificationForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Enter the transmission content..."
                      className="w-full h-32 px-6 py-4 bg-[#0a0a0a] border border-white/5 rounded-3xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-white/20 text-white placeholder:text-gray-700 resize-none transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Transmission Mode */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3 h-3 text-[#F5C200]" /> Mode
                      </label>
                      <div className="flex p-1 bg-[#0a0a0a] border border-white/5 rounded-2xl">
                        {['marquee', 'popup'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNotificationForm(p => ({ ...p, type: t as any }))}
                            className={cn(
                              "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                              notificationForm.type === t ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Operational State */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3 h-3 text-[#F5C200]" /> Flow State
                      </label>
                      <button
                        type="button"
                        onClick={() => setNotificationForm(p => ({ ...p, active: !p.active }))}
                        className={cn(
                          "w-full py-2 px-4 rounded-2xl border transition-all flex items-center justify-between group h-[42px]",
                          notificationForm.active 
                            ? "bg-green-500/10 border-green-500/20 text-green-500" 
                            : "bg-red-500/10 border-red-500/20 text-red-500"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {notificationForm.active ? 'Operational' : 'Deep Sleep'}
                        </span>
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          notificationForm.active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        )} />
                      </button>
                    </div>
                  </div>

                  {/* Design Theme Selector */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                       <Palette className="w-3 h-3 text-[#F5C200]" /> Design Theme
                    </label>
                    <div className="grid grid-cols-5 gap-4 p-4 bg-[#0a0a0a] border border-white/5 rounded-3xl">
                      {[
                        { id: 'purple', name: 'Amethyst', color: 'from-[#7C3AED] to-[#3B82F6]' },
                        { id: 'blue', name: 'Azure', color: 'from-[#3B82F6] to-[#22D3EE]' },
                        { id: 'green', name: 'Emerald', color: 'from-[#10B981] to-[#34D399]' },
                        { id: 'pink', name: 'Rose', color: 'from-[#EC4899] to-[#F472B6]' },
                        { id: 'gold', name: 'Legacy', color: 'from-[#F5C200] to-[#FFD700]' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setNotificationForm({ ...notificationForm, theme: t.id })}
                          className={cn(
                            "group relative flex flex-col items-center gap-2 transition-all",
                            notificationForm.theme === t.id ? "scale-105" : "opacity-40 hover:opacity-100 hover:scale-105"
                          )}
                        >
                          <div className={cn(
                            "w-full aspect-square rounded-xl bg-gradient-to-br transition-all border border-white/10",
                            t.color,
                            notificationForm.theme === t.id && "ring-2 ring-white ring-offset-4 ring-offset-[#1a1a1a] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                          )} />
                          <span className="text-[7px] font-black text-white uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setEditingNotification(null)}
                      className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-5 bg-white text-black rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                    >
                      {editingNotification.id === 'new' ? 'Deploy Broadcast' : 'Commit Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
           </div>
        )}

        {viewingCertificatesUser && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 backdrop-blur-xl bg-black/80" onClick={(e) => e.target === e.currentTarget && setViewingCertificatesUser(null)}>
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-4xl bg-[#1a1a1a] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden relative">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                   <div>
                      <h3 className="text-2xl font-black text-white tracking-tighter uppercase">ARCHIVE VAULT</h3>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Citizenship Records: <span className="text-white">{viewingCertificatesUser.email}</span></p>
                   </div>
                   <button onClick={() => setViewingCertificatesUser(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                     <Plus className="w-5 h-5 rotate-45 text-gray-500" />
                   </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                   {certsLoading ? (
                     <div className="py-20 text-center">
                        <RefreshCw className="w-10 h-10 text-[#F5C200] animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Decrypting Archive...</p>
                     </div>
                   ) : userCertificates.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {userCertificates.map((cert) => (
                          <div key={cert.id} className="p-6 rounded-[32px] bg-[#0f0f0f] border border-white/5 group hover:border-[#F5C200]/20 transition-all relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><FileCheck2 className="w-16 h-16 text-[#F5C200]" /></div>
                             <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                   <div className="p-2.5 rounded-xl bg-[#F5C200]/10 text-[#F5C200]"><Shield className="w-4 h-4" /></div>
                                   <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest tabular-nums">ID: {cert.id.slice(-8)}</span>
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">KRA PIN CERTIFICATE</h4>
                                <div className="flex items-center gap-2 mb-6">
                                   <div className="w-1 h-1 rounded-full bg-[#F5C200]" />
                                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest tabular-nums">{cert.pinNumber}</p>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                   <p className="text-[9px] font-black text-gray-800 uppercase tracking-tighter">SECURED {new Date(cert.createdAt).toLocaleDateString()}</p>
                                   <button onClick={() => handleDownloadCertificate(cert)} className="flex items-center gap-2 px-4 py-2 bg-[#F5C200]/10 hover:bg-[#F5C200] text-[#F5C200] hover:text-black rounded-xl border border-[#F5C200]/20 transition-all font-black text-[9px] uppercase tracking-widest active:scale-95">Export</button>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="py-20 text-center">
                        <FileCheck2 className="w-12 h-12 text-gray-800 mx-auto mb-4 opacity-20" />
                        <p className="text-gray-600 font-black uppercase tracking-widest text-xs">Archive Empty</p>
                     </div>
                   )}
                </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
