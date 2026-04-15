"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FileCheck2, Shield, 
  RefreshCw,
  Trash2,
  Plus, Zap, Clock, CheckCircle2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';


// Premium Components
import { AdminSidebar } from './_components/AdminSidebar';
import { AdminHeader } from './_components/AdminHeader';
import { type ActivityItem } from './_components/ActivityStream';


import { OverviewTab } from './_components/tabs/OverviewTab';
import { UsersTab } from './_components/tabs/UsersTab';
import { TransactionsTab } from './_components/tabs/TransactionsTab';
import { VerificationsTab } from './_components/tabs/VerificationsTab';
import { SafaricomTab } from './_components/tabs/SafaricomTab';
import { NotificationsTab } from './_components/tabs/NotificationsTab';
import { NavigationTab } from './_components/tabs/NavigationTab';
type Tab = 'overview' | 'users' | 'transactions' | 'verifications' | 'safaricom' | 'notifications' | 'navigation';

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
  theme: string;
  active: boolean;
  speed: number;
  createdAt: string;
}

interface HealthData {
  status: 'operational' | 'degraded' | 'down';
  score: number;
  latency: number;
  nodes: {
    database: 'up' | 'down';
    auth: 'up' | 'down';
    payments: 'up' | 'down';
    compliance: 'up' | 'down';
  };
  timestamp: string;
  error?: string;
}

interface TimeSeriesDataItem {
  date: string;
  users: number;
  transactions: number;
  revenue: number;
  traffic: number;
  active_users: number;
}

interface UserCertificate {
  id: string;
  userId: string;
  pinNumber: string;
  kraPin: string;
  details: Record<string, any>;
  createdAt: string;
}

interface SafaricomApiResponse {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  ResultCode?: number;
  ResultDesc?: string;
  [key: string]: any;
}

export default function AdminDashboard() {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab;
  
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'overview');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'users' | 'transactions' | 'traffic'>('revenue');

  function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  const [stats, setStats] = useState<Stats | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataItem[]>([]);
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
    customTheme: {
      from: '#7C3AED',
      via: '#3B82F6',
      to: '#7C3AED',
      border: 'rgba(124, 58, 237, 0.2)'
    },
    active: true,
    speed: 30
  });

  // Editing user
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [viewingCertificatesUser, setViewingCertificatesUser] = useState<UserRow | null>(null);
  const [userCertificates, setUserCertificates] = useState<UserCertificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    role: '',
    subscriptionTier: '',
    subscriptionStatus: '',
    credits: 0,
    subscriptionEnd: '',
    pdfPremiumEnd: ''
  });

  // Quick Assign Limit
  const [assigningUser, setAssigningUser] = useState<UserRow | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignForm, setAssignForm] = useState({
    tier: 'basic' as 'basic' | 'pro',
    days: 1,
  });

  // Data Actions
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (_e) { console.error('Stats fetch failed:', _e); }
  }, []);

  const fetchTimeSeries = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/time-series');
      if (res.ok) setTimeSeriesData(await res.json());
    } catch (_e) { console.error('Time-series fetch failed:', _e); }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      const res = await fetch('/api/admin/health');
      if (res.ok) setHealthData(await res.json());
    } catch (_e) { console.error('Health fetch failed:', _e); }
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
    } catch (_e) { console.error('Users fetch failed:', _e); }
  }, [usersPage, userSearch]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/transactions?page=${txPage}&limit=15`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setTxTotalPages(data.totalPages);
      }
    } catch (_e) { console.error('Tx fetch failed:', _e); }
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
    } catch (_e) { console.error('Vf fetch failed:', _e); }
  }, [vfPage, vfSearch]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch (_e) { console.error('Notifications fetch failed:', _e); }
  }, []);

  /*
  const handlePaystackAction = useCallback(async (action: string, params: any) => {
    try {
      setPaystackLoading(true);
      const res = await fetch("/api/admin/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, params }),
      });
      const data = await res.json();
      if (action === "balance" && Array.isArray(data.data)) {
        // Find KES balance specifically, otherwise fallback to the first one
        const kesBalance = data.data.find((b: any) => b.currency === "KES");
        setPaystackBalance(kesBalance || data.data[0]);
      }
      setPaystackResult(data);
    } catch (_e) {
      console.error("Paystack action failed:", _e);
    } finally {
      setPaystackLoading(false);
    }
  }, []);
  */

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
  }, [activeTab, refreshAll]);

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
      description: `Successful ${t.type} of KES ${(t.amount/100).toLocaleString()}.`,
      timestamp: t.createdAt
    }));

    // Recent Verifications
    verifications.slice(0, 3).forEach(v => list.push({
      id: `v-${v.id}`,
      type: 'verification',
      title: 'Deep Integrity Scan',
      description: `KRA PIN ${v.kraPin} verified by ${v.user.name || v.user.email.split('@')[0]}.`,
      timestamp: v.createdAt
    }));

    return list.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
  }, [users, transactions, verifications]);

  const handleSyncUsers = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/admin/sync-users');
      if (res.ok) refreshAll();
    } catch (_e) {
      console.error('Failed to sync users:', _e);
    } finally {
      setIsSyncing(false);
    }
  };

  const [safaricomLoading, setSafaricomLoading] = useState(false);
  const [safaricomResult, setSafaricomResult] = useState<SafaricomApiResponse | null>(null);
  // const [paystackLoading, setPaystackLoading] = useState(false);
  // const [paystackBalance, setPaystackBalance] = useState<any>(null);
  // const [paystackResult, setPaystackResult] = useState<any>(null);
  const [stkForm, setStkForm] = useState({ phoneNumber: '', amount: '1', accountRef: 'AdminTest' });

  const handleSafaricomAction = async (action: string, params: any) => {
    try {
      setSafaricomLoading(true);
      const res = await fetch('/api/admin/safaricom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });
      setSafaricomResult(await res.json());
    } catch (_e) { console.error('Safaricom action failed:', _e); }
    finally { setSafaricomLoading(false); }
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
    } catch (_e) { console.error('User update failed:', _e); }
  };

  const handleAssignLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningUser) return;
    try {
      setAssignLoading(true);
      setAssignSuccess('');
      const res = await fetch('/api/admin/users/assign-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: assigningUser.id,
          tier: assignForm.tier,
          days: assignForm.days,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssignSuccess(data.message || 'Tier assigned successfully!');
        fetchUsers();
        setTimeout(() => {
          setAssigningUser(null);
          setAssignSuccess('');
        }, 2200);
      } else {
        alert(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Assign limit failed:', err);
      alert('Network error while assigning limit.');
    } finally {
      setAssignLoading(false);
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
    } catch (_e) {
      console.error('Failed to fetch user certificates:', _e);
    } finally {
      setCertsLoading(false);
    }
  };

  const handleDownloadCertificate = async (cert: UserCertificate) => {
    try {
      const { generateKraPdf } = await import('@/lib/pdf/generate-kra-pdf');
      const filename = `RE_DOWNLOAD_KRA_PIN_${cert.kraPin}.pdf`;
      
      const pdfBytes = await generateKraPdf(cert.details as import('@/lib/pdf/generate-kra-pdf').KraPdfData);
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (_e) {
      console.error('Failed to regenerate certificate:', _e);
      alert('Failed to regenerate certificate PDF.');
    }
  };
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isNew = editingNotification?.id === 'new';
      const method = isNew ? 'POST' : 'PATCH';
      
      const payload = {
        ...notificationForm,
        id: isNew ? undefined : editingNotification?.id,
        customTheme: JSON.stringify(notificationForm.customTheme)
      };
      
      const res = await fetch('/api/admin/notifications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setEditingNotification(null);
        fetchNotifications();
        // Force refresh to update server-side layout
        window.location.reload(); 
      } else {
        const err = await res.json();
        alert(`Failed to deploy: ${err.error || 'Unknown error'}`);
      }
    } catch (_e) {
      console.error('Notification save failed:', _e);
      alert('Network error while deploying signal.');
    }
  };

  const handleNotificationDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchNotifications();
    } catch (_e) {
      console.error('Notification delete failed:', _e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[var(--color-brand-red)]/30 overflow-x-hidden font-sans">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-brand-red)]/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--color-brand-yellow)]/05 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20 relative z-10">
        <AdminHeader 
          title={activeTab === 'overview' ? 'Operational Insight' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
          subtitle="AkubrecaH Platform Control"
          onRefresh={refreshAll}
          isSyncing={isSyncing}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto relative">
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
                  <UsersTab userSearch={userSearch} setUserSearch={setUserSearch} setUsersPage={setUsersPage} usersTotal={usersTotal} users={users} usersPage={usersPage} usersTotalPages={usersTotalPages} setEditingUser={setEditingUser} setEditForm={setEditForm} fetchUserCertificates={fetchUserCertificates} setAssigningUser={setAssigningUser} />
                )}
                {activeTab === 'transactions' && (
                  <TransactionsTab transactions={transactions} txPage={txPage} txTotalPages={txTotalPages} setTxPage={setTxPage} />
                )}
                {activeTab === 'verifications' && (
                  <VerificationsTab vfSearch={vfSearch} setVfSearch={setVfSearch} setVfPage={setVfPage} verifications={verifications} vfPage={vfPage} vfTotalPages={vfTotalPages} />
                )}
                {activeTab === 'safaricom' && (
                  <SafaricomTab stkForm={stkForm} setStkForm={setStkForm} safaricomLoading={safaricomLoading} safaricomResult={safaricomResult} handleSafaricomAction={handleSafaricomAction} setSafaricomResult={setSafaricomResult} />
                )}
                {activeTab === 'notifications' && (
                  <NotificationsTab 
                    notifications={notifications} 
                    setEditingNotification={setEditingNotification} 
                    setNotificationForm={setNotificationForm}
                    handleNotificationDelete={handleNotificationDelete}
                  />
                )}
                {activeTab === 'navigation' && (
                  <NavigationTab />
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
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Privilege Level</label>
                        <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-sm font-black italic uppercase tracking-widest focus:outline-none focus:border-[var(--color-brand-red)] text-white">
                           <option value="user">USER</option>
                           <option value="admin">ADMIN</option>
                           <option value="premium">PREMIUM</option>
                           <option value="cyber">CYBER (Legacy)</option>
                           <option value="enterprise">ENTERPRISE</option>
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Tier Selection</label>
                        <select value={editForm.subscriptionTier} onChange={e => setEditForm(p => ({ ...p, subscriptionTier: e.target.value }))} className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-sm font-black italic uppercase tracking-widest focus:outline-none focus:border-[var(--color-brand-red)] text-white">
                           <option value="none">NONE</option>
                           <option value="basic">BASIC (10/DAY)</option>
                           <option value="pro">PRO (UNLIMITED)</option>
                           <option value="enterprise">ENTERPRISE (UNLIMITED)</option>
                           <option value="daily_pro">LEGACY DAILY PRO</option>
                           <option value="weekly">LEGACY WEEKLY</option>
                           <option value="monthly">LEGACY MONTHLY</option>
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Available Credits</label>
                        <input type="number" value={editForm.credits} onChange={e => setEditForm(p => ({ ...p, credits: parseInt(e.target.value) }))} className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-xl font-black italic uppercase tracking-widest focus:outline-none focus:border-[var(--color-brand-red)] text-white" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Identity Hash</label>
                        <input type="text" readOnly className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-white/20 uppercase tracking-tighter" value={editingUser.id} />
                     </div>
                  </div>
                    <div className="flex gap-4 pt-8">
                       <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all italic tracking-widest border border-white/5">ABORT COMMAND</button>
                    <button type="submit" className="flex-[2] py-5 bg-[var(--color-brand-red)] hover:bg-white hover:text-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-red-500/20 italic">COMMIT PROTOCOL</button>
                  </div>
                 </form>
              </motion.div>
           </div>
        )}

        {/* ── Quick Assign Limit Modal ── */}
        {assigningUser && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setAssigningUser(null); setAssignSuccess(''); }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md p-10 rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-3xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]" />
              
              {/* Header */}
              <div className="flex items-center gap-5 mb-10">
                <div className="p-4 rounded-[1.5rem] bg-white/10 border border-white/10 shadow-sm">
                  <Zap className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Quick Assign.</h2>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-1 italic">
                    ID: {assigningUser.email.split('@')[0]}
                  </p>
                </div>
              </div>

              {assignSuccess ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
                  <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <p className="text-sm font-black text-emerald-400 text-center uppercase tracking-wide">{assignSuccess}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleAssignLimit} className="space-y-8">
                  {/* Tier Selector */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-4 italic">Select Node</label>
                    <div className="grid grid-cols-2 gap-4">
                      {(['basic', 'pro'] as const).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setAssignForm(p => ({ ...p, tier }))}
                          className={cn(
                            "relative py-8 rounded-3xl border-2 font-black transition-all group overflow-hidden",
                            assignForm.tier === tier
                              ? tier === 'basic'
                                ? "border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_30px_rgba(31,111,91,0.2)]"
                                : "border-yellow-500 bg-yellow-500/10 text-white shadow-[0_0_30px_rgba(245,194,0,0.2)]"
                              : "border-white/5 bg-white/5 text-white/20 hover:border-white/20"
                          )}
                        >
                          <div className="flex flex-col items-center gap-2 relative z-10">
                            <span className="text-2xl group-hover:scale-125 transition-transform">{tier === 'basic' ? '⚡' : '🔥'}</span>
                            <span className="text-xs uppercase italic tracking-widest">{tier}</span>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest opacity-40",
                            )}>
                              {tier === 'basic' ? '10 USES/DAY' : 'UNLIMITED'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Duration</label>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-[#F5C200]">
                        <Clock className="w-3 h-3" />
                        <span>{assignForm.days} day{assignForm.days !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    {/* Quick presets */}
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 3, 7, 30].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setAssignForm(p => ({ ...p, days: d }))}
                          className={cn(
                            "py-2.5 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all",
                            assignForm.days === d
                              ? "border-[#F5C200]/50 bg-[#F5C200]/10 text-[#F5C200]"
                              : "border-white/5 bg-[#0f0f0f] text-gray-600 hover:border-white/10 hover:text-gray-400"
                          )}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>

                    {/* Custom slider */}
                    <div className="px-1">
                      <input
                        type="range"
                        min="1" max="365" step="1"
                        value={assignForm.days}
                        onChange={e => setAssignForm(p => ({ ...p, days: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-[#0f0f0f] rounded-full appearance-none cursor-pointer accent-[#F5C200] border border-white/5"
                      />
                      <div className="flex justify-between text-[8px] font-bold text-gray-700 uppercase tracking-tighter mt-1 px-0.5">
                        <span>1 day</span>
                        <span>1 year</span>
                      </div>
                    </div>
                  </div>

                  {/* Expiry preview */}
                  <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 backdrop-blur-md">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-2 italic px-2">Access Expiry Node</p>
                    <p className="text-lg font-black text-white italic tracking-tight tabular-nums px-2">
                      {(() => {
                        const d = new Date();
                        d.setDate(d.getDate() + assignForm.days);
                        return d.toLocaleDateString('en-KE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
                      })()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setAssigningUser(null)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all italic border border-white/5">ABORT</button>
                    <button
                      type="submit"
                      disabled={assignLoading}
                      className={cn(
                        "flex-[2] py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl italic",
                        assignForm.tier === 'pro'
                          ? "bg-yellow-500 text-black shadow-yellow-500/20"
                          : "bg-emerald-500 text-white shadow-red-500/20",
                        assignLoading && "opacity-60 pointer-events-none"
                      )}
                    >
                      {assignLoading ? 'EXECUTING...' : `COMMIT ${assignForm.tier}`}
                    </button>
                  </div>
                </form>
              )}
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
        {editingNotification && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingNotification(null)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl p-10 rounded-[48px] bg-[#1a1a1a] border border-white/5 shadow-2xl">
               <h2 className="text-3xl font-black text-white tracking-tighter mb-8 uppercase">Broadcast Control</h2>
               <form onSubmit={handleNotificationSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Message (HTML Allowed)</label>
                    <textarea 
                      value={notificationForm.message} 
                      onChange={e => setNotificationForm(p => ({ ...p, message: e.target.value }))}
                      required
                      className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-3xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 text-white min-h-[120px]"
                      placeholder="e.g. <b>Update:</b> New tools deployed!"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Transmission Type</label>
                      <select value={notificationForm.type} onChange={e => setNotificationForm(p => ({ ...p, type: e.target.value as any }))} className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-3xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 text-white">
                        <option value="marquee">Marquee (Scrolling)</option>
                        <option value="popup">Popup (Overlay)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Visual Theme</label>
                      <select value={notificationForm.theme} onChange={e => setNotificationForm(p => ({ ...p, theme: e.target.value }))} className="w-full px-6 py-4 bg-[#0f0f0f] border border-white/5 rounded-3xl text-sm font-bold focus:outline-none focus:border-[#F5C200]/30 text-white">
                        <option value="purple">Nexus Purple</option>
                        <option value="gold">Kenyan Gold</option>
                        <option value="blue">Cyber Blue</option>
                        <option value="green">Operational Green</option>
                        <option value="pink">Alert Pink</option>
                      </select>
                    </div>
                  </div>
                  
                  {notificationForm.type === 'marquee' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Scroll Duration (Lower = Faster)</label>
                        <span className="text-[10px] font-black text-[#F5C200]">{notificationForm.speed}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="120" 
                        step="5"
                        value={notificationForm.speed} 
                        onChange={e => setNotificationForm(p => ({ ...p, speed: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-[#0f0f0f] rounded-lg appearance-none cursor-pointer accent-[#F5C200] border border-white/5"
                      />
                      <div className="flex justify-between text-[8px] font-bold text-gray-500 uppercase tracking-tighter px-1">
                        <span>High Velocity (5s)</span>
                        <span>Standard (30s)</span>
                        <span>Cinematic (120s)</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 px-1">
                    <input 
                      type="checkbox" 
                      id="notif-active"
                      checked={notificationForm.active}
                      onChange={e => setNotificationForm(p => ({ ...p, active: e.target.checked }))}
                      className="w-4 h-4 rounded border-white/5 bg-[#0f0f0f] text-[#F5C200] focus:ring-[#F5C200]/20"
                    />
                    <label htmlFor="notif-active" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">Live Activation</label>
                  </div>

                  <div className="flex gap-4 pt-4">
                     {editingNotification.id !== 'new' && (
                       <button type="button" onClick={() => handleNotificationDelete(editingNotification.id)} className="p-5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-[24px] transition-all"><Trash2 size={20} /></button>
                     )}
                     <button type="button" onClick={() => setEditingNotification(null)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all">Abort</button>
                     <button type="submit" className="flex-[2] py-5 bg-[#F5C200] text-black rounded-[24px] font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-[#F5C200]/20 active:scale-95">Deploy Signal</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
