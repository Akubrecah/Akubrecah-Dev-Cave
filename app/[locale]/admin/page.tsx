"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, DollarSign, FileCheck2, Shield, Search, 
  ChevronLeft, ChevronRight, RefreshCw, TrendingUp,
  Activity, Eye, ArrowLeft, Trash2, Edit2, Bell,
  Plus
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
    active: true
  });

  // Editing user
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({
    role: '',
    subscriptionTier: '',
    subscriptionStatus: '',
    credits: 0,
    subscriptionEnd: '',
    pdfPremiumEnd: ''
  });

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

  const [safaricomLoading, setSafaricomLoading] = useState(false);
  const [safaricomResult, setSafaricomResult] = useState<any>(null);
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
    } catch (e) { console.error('Safaricom action failed:', e); }
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
    } catch (e) { console.error('User update failed:', e); }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-primary/30 overflow-x-hidden">
      {/* Visual background atmospheric enhancements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen transition-all duration-500 pb-20">
        <AdminHeader 
          title={activeTab === 'overview' ? 'Intelligence' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
          subtitle="AkubrecaH Platform Control"
          onRefresh={refreshAll}
          isSyncing={isSyncing}
        />

        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex items-center justify-center min-h-[60vh]"
              >
                <div className="relative w-16 h-16">
                   <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                   <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
              </motion.div>
            ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AdminMetricCard 
                          label="Platform Citizens" 
                          value={stats?.totalUsers || 0} 
                          subText={`+${stats?.recentUsers} this week`}
                          icon={Users}
                          trend="up"
                          trendValue="8%"
                          index={0}
                        />
                        <AdminMetricCard 
                          label="Global Revenue" 
                          value={`KES ${((stats?.totalRevenue || 0) / 100).toLocaleString()}`} 
                          subText="Gross completion volume"
                          icon={DollarSign}
                          trend="up"
                          trendValue="14%"
                          index={1}
                        />
                        <AdminMetricCard 
                          label="Deep Verifications" 
                          value={stats?.totalVerifications || 0} 
                          subText={`${stats?.activeSubscriptions} active subs`}
                          icon={Shield}
                          trend="neutral"
                          trendValue="0%"
                          index={2}
                        />
                        <AdminMetricCard 
                          label="Certs Generated" 
                          value={stats?.totalCertificates || 0} 
                          subText="Official PIN certificates"
                          icon={FileCheck2}
                          trend="up"
                          trendValue="21%"
                          index={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Growth Intelligence</h3>
                              <div className="flex gap-2">
                                {['revenue', 'users', 'transactions', 'traffic'].map((m) => (
                                    <button 
                                      key={m}
                                      onClick={() => setChartMetric(m as any)}
                                      className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                        chartMetric === m ? "bg-primary text-white" : "bg-white/5 text-gray-500 hover:text-white"
                                      )}
                                    >
                                       {m === 'traffic' ? 'Vercel Analytics' : m}
                                    </button>
                                 ))}
                              </div>
                           </div>
                           <PremiumAreaChart 
                             data={timeSeriesData.map(d => ({ date: d.date, value: d[chartMetric] }))} 
                             color={chartMetric === 'revenue' ? '#E30613' : chartMetric === 'users' ? '#F5C200' : chartMetric === 'traffic' ? '#F5C200' : '#E30613'} 
                           />
                           <div className="grid grid-cols-2 gap-6">
                              <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/10 backdrop-blur-xl group hover:bg-white/[0.04] transition-all">
                                 <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Sync Engine</h4>
                                 <p className="text-xl font-bold text-white leading-none">Clerk Identity</p>
                                 <button 
                                    onClick={handleSyncUsers}
                                    className="mt-6 flex items-center justify-center gap-3 w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl border border-primary/20 transition-all font-bold text-xs uppercase tracking-widest"
                                  >
                                    {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    Force Sync
                                  </button>
                              </div>
                              <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/10 backdrop-blur-xl group hover:bg-white/[0.04] transition-all relative overflow-hidden">
                                 <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Platform Pulse</h4>
                                 <p className="text-xl font-bold text-white leading-none">
                                   {healthLoading ? 'Scanning...' : healthData?.status === 'operational' ? 'All Nodes Go' : 'System Degraded'}
                                 </p>
                                 <div className="mt-8 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                       <motion.div 
                                         initial={{ width: 0 }} 
                                         animate={{ width: `${healthData?.score || 0}%` }} 
                                         className={cn(
                                           "h-full transition-all duration-1000",
                                           (healthData?.score || 0) > 80 ? "bg-primary" : "bg-amber-500"
                                         )} 
                                       />
                                    </div>
                                    <span className={cn(
                                      "text-[10px] font-bold",
                                      (healthData?.score || 0) > 80 ? "text-primary" : "text-amber-500"
                                    )}>
                                      {healthLoading ? '...' : `${Math.round(healthData?.score || 0)}%`}
                                    </span>
                                 </div>
                                 
                                 <div className="mt-4 grid grid-cols-2 gap-2">
                                    {healthData?.nodes && Object.entries(healthData.nodes).map(([node, status]) => (
                                      <div key={node} className="flex items-center gap-1.5">
                                        <div className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          status === 'up' ? "bg-primary shadow-[0_0_5px_var(--color-primary)]" : "bg-gray-700"
                                        )} />
                                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">{node}</span>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                         </div>
                         <ActivityStream activities={activities} />
                      </div>
                    </div>
                  )}

                  {/* Users Tab */}
                  {(activeTab as any) === 'users' && (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-6 rounded-[32px] bg-white/[0.02] border border-white/10">
                          <div className="flex items-center gap-6">
                             <div className="relative">
                               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                               <input 
                                 type="text" 
                                 placeholder="Locate user..." 
                                 value={userSearch}
                                 onChange={e => { setUserSearch(e.target.value); setUsersPage(1); }}
                                 className="w-80 pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                               />
                             </div>
                             <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">{usersTotal} total citizens</span>
                          </div>
                       </div>

                       <div className="rounded-[40px] border border-white/5 bg-white/[0.01] backdrop-blur-xl overflow-hidden shadow-2xl">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-white/5">
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Identity</th>
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Privileges</th>
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Subscription</th>
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Credits</th>
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Ops</th>
                              </tr>
                            </thead>
                            <tbody>
                              {users.map((u, i) => (
                                <motion.tr 
                                  key={u.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="border-b border-white/[0.03] group hover:bg-white/[0.01] transition-colors"
                                >
                                  <td className="py-5 px-8">
                                    <div className="font-bold text-sm text-white">{u.name || 'Anonymous'}</div>
                                    <div className="text-[11px] font-medium text-gray-500">{u.email}</div>
                                  </td>
                                  <td className="py-5 px-8">
                                    <span className={cn(
                                      "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight border capitalize",
                                      u.role === 'admin' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                      u.role === 'cyber' ? "bg-accent/10 text-accent border-accent/20" :
                                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                    )}>
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="py-5 px-8">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-gray-300 capitalize">{u.subscriptionTier.replace('_', ' ')}</span>
                                      <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider",
                                        u.subscriptionStatus === 'active' ? "text-primary" : "text-gray-600"
                                      )}>{u.subscriptionStatus}</span>
                                    </div>
                                  </td>
                                  <td className="py-5 px-8 text-sm font-mono text-gray-400">{u.credits}</td>
                                  <td className="py-5 px-8">
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
                                      className="p-3 rounded-2xl border border-white/5 hover:bg-primary/10 hover:border-primary/30 text-gray-500 hover:text-primary transition-all"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                       </div>
                       
                       <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
                    </div>
                  )}

                  {/* Transactions Tab */}
                  {(activeTab as any) === 'transactions' && (
                    <div className="space-y-6">
                       <div className="rounded-[40px] border border-white/5 bg-white/[0.01] backdrop-blur-xl overflow-hidden shadow-2xl">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-white/5">
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Identity</th>
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Volume</th>
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</th>
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">State</th>
                                <th className="text-left py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">Chronology</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions.map((tx, i) => (
                                <motion.tr 
                                  key={tx.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="border-b border-white/[0.03] group hover:bg-white/[0.01] transition-colors"
                                >
                                  <td className="py-5 px-8">
                                    <div className="font-bold text-sm text-white">{tx.user?.name || 'Anonymous'}</div>
                                    <div className="text-[11px] font-medium text-gray-500">{tx.user?.email}</div>
                                  </td>
                                  <td className="py-5 px-8 text-sm font-bold text-primary tabular-nums">KES {(tx.amount/100).toLocaleString()}</td>
                                  <td className="py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">{tx.type}</td>
                                  <td className="py-5 px-8">
                                    <span className={cn(
                                      "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight border uppercase",
                                      tx.status === 'completed' ? "bg-primary/10 text-primary border-primary/20" :
                                      tx.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                      "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}>
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td className="py-5 px-8 text-[11px] font-medium text-gray-500">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                       </div>
                       <Pagination page={txPage} totalPages={txTotalPages} onPageChange={setTxPage} />
                    </div>
                  )}

                  {/* Safaricom Tab */}
                  {(activeTab as any) === 'safaricom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                              <Shield className="w-24 h-24 text-primary" />
                           </div>
                           <h3 className="text-2xl font-bold text-white tracking-tight mb-8">M-Pesa Gateway</h3>
                           <div className="space-y-6">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Test MSISDN</label>
                                <input 
                                  placeholder="254700000000"
                                  value={stkForm.phoneNumber}
                                  onChange={e => setStkForm(p => ({ ...p, phoneNumber: e.target.value }))}
                                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-sm font-medium focus:outline-none focus:border-primary/30 transition-all"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Volume</label>
                                  <input 
                                    type="number"
                                    value={stkForm.amount}
                                    onChange={e => setStkForm(p => ({ ...p, amount: e.target.value }))}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-sm font-medium focus:outline-none focus:border-primary/30 transition-all"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Referential</label>
                                  <input 
                                    value={stkForm.accountRef}
                                    onChange={e => setStkForm(p => ({ ...p, accountRef: e.target.value }))}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-sm font-medium focus:outline-none focus:border-primary/30 transition-all"
                                  />
                                </div>
                              </div>
                              <button 
                                onClick={() => handleSafaricomAction('stkpush', { ...stkForm, transactionDesc: 'Ops Audit' })}
                                disabled={safaricomLoading || !stkForm.phoneNumber}
                                className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs transition-all disabled:opacity-50 shadow-xl shadow-primary/20 active:scale-95"
                              >
                                {safaricomLoading ? 'Initiating...' : 'Fire STK Push'}
                              </button>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Ops Utilities</h4>
                              <div className="space-y-4">
                                 <button onClick={() => handleSafaricomAction('balance', {})} className="w-full text-left p-6 rounded-[28px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group flex items-center justify-between">
                                    <div>
                                       <div className="font-bold text-white text-sm">Query Wallet Balance</div>
                                       <div className="text-[11px] text-gray-500 font-medium">Verify current float reserves</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                 </button>
                              </div>
                           </div>

                           <AnimatePresence>
                              {safaricomResult && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }} 
                                  animate={{ opacity: 1, scale: 1 }} 
                                  className="p-8 rounded-[40px] bg-black border border-white/5 shadow-2xl font-mono text-[10px] max-h-64 overflow-auto relative"
                                >
                                   <button onClick={() => setSafaricomResult(null)} className="absolute top-4 right-4 text-red-500 uppercase font-black">Close</button>
                                   <pre className="text-primary/80">{JSON.stringify(safaricomResult, null, 2)}</pre>
                                </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                    </div>
                  )}

                  {/* Placeholder for other tabs (Verifications, Notifications) */}
                  {['verifications', 'notifications'].includes(activeTab) && (
                     <div className="flex flex-col items-center justify-center min-h-[40vh] opacity-30 italic font-medium">
                        Content undergoing premium refactor...
                     </div>
                  )}

                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {editingUser && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setEditingUser(null)} 
                className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-xl p-10 rounded-[48px] bg-[#111111] border border-white/10 shadow-[0_0_100px_rgba(227,6,19,0.1)]"
              >
                 <h2 className="text-3xl font-black text-white tracking-tighter mb-8">Refining Profile</h2>
                 <form onSubmit={handleUserUpdate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Privilege Level</label>
                          <select 
                            value={editForm.role}
                            onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                            className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-sm font-medium focus:outline-none focus:border-primary/30 text-white"
                          >
                             <option value="personal">Personal</option>
                             <option value="cyber">Cyber</option>
                             <option value="admin">Admin</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Credits Reserve</label>
                          <input 
                            type="number"
                            value={editForm.credits}
                            onChange={e => setEditForm(p => ({ ...p, credits: parseInt(e.target.value) || 0 }))}
                            className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-sm font-medium focus:outline-none focus:border-primary/30"
                          />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Tier Selection</label>
                          <select 
                            value={editForm.subscriptionTier}
                            onChange={e => setEditForm(p => ({ ...p, subscriptionTier: e.target.value }))}
                            className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-sm font-medium focus:outline-none focus:border-primary/30 text-white"
                          >
                             <option value="none">Empty</option>
                             <option value="pro">Pro Status</option>
                             <option value="daily_pro">Daily Access</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Flow State</label>
                          <select 
                            value={editForm.subscriptionStatus}
                            onChange={e => setEditForm(p => ({ ...p, subscriptionStatus: e.target.value }))}
                            className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-sm font-medium focus:outline-none focus:border-primary/30 text-white"
                          >
                             <option value="inactive">Deep Sleep</option>
                             <option value="active">Operational</option>
                             <option value="past_due">Awaiting Flow</option>
                          </select>
                       </div>
                    </div>

                    <div className="flex gap-4 pt-8">
                       <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[24px] font-bold text-xs uppercase tracking-widest transition-all">Abort</button>
                       <button type="submit" className="flex-[2] py-5 bg-primary hover:bg-primary/90 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-primary/20">Commit Changes</button>
                    </div>
                 </form>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-8">
       <button 
         disabled={page === 1}
         onClick={() => onPageChange(page - 1)}
         className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all disabled:opacity-20"
       >
         <ChevronLeft className="w-5 h-5" />
       </button>
       <span className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold tracking-widest text-gray-400">
         NODE {page} / {totalPages}
       </span>
       <button 
         disabled={page === totalPages}
         onClick={() => onPageChange(page + 1)}
         className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all disabled:opacity-20"
       >
         <ChevronRight className="w-5 h-5" />
       </button>
    </div>
  );
}
