"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, DollarSign, FileCheck2, Shield, Search, 
  ChevronLeft, ChevronRight, RefreshCw, TrendingUp,
  Activity, Eye, ArrowLeft, Trash2, Edit2, Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'users' | 'transactions' | 'verifications' | 'safaricom' | 'notifications';

interface NotificationRow {
  id: string;
  message: string;
  type: string;
  active: boolean;
  createdAt: string;
}

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

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [notificationLoading, setNotificationLoading] = useState(false);
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

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error('Stats fetch failed:', e); }
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
      setNotificationLoading(true);
      const res = await fetch('/api/admin/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch (e) { console.error('Notifications fetch failed:', e); }
    finally { setNotificationLoading(false); }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchStats().finally(() => setLoading(false));
  }, [fetchStats]);

  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab, fetchUsers]);
  useEffect(() => { if (activeTab === 'transactions') fetchTransactions(); }, [activeTab, fetchTransactions]);
  useEffect(() => { if (activeTab === 'verifications') fetchVerifications(); }, [activeTab, fetchVerifications]);
  useEffect(() => { if (activeTab === 'notifications') fetchNotifications(); }, [activeTab, fetchNotifications]);
  
  const [safaricomLoading, setSafaricomLoading] = useState(false);
  const [safaricomResult, setSafaricomResult] = useState<any>(null);
  const [stkForm, setStkForm] = useState({ phoneNumber: '', amount: '1', accountRef: 'Test' });

  const handleSafaricomAction = async (action: string, params: any) => {
    try {
      setSafaricomLoading(true);
      const res = await fetch('/api/admin/safaricom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });
      const data = await res.json();
      setSafaricomResult(data);
    } catch (e) {
      console.error('Safaricom action failed:', e);
      setSafaricomResult({ error: String(e) });
    } finally {
      setSafaricomLoading(false);
    }
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload: Record<string, string | number | null> = {
        userId: editingUser.id,
        role: editForm.role,
        subscriptionTier: editForm.subscriptionTier,
        subscriptionStatus: editForm.subscriptionStatus,
        credits: editForm.credits,
      };
      
      payload.subscriptionEnd = editForm.subscriptionEnd 
        ? new Date(editForm.subscriptionEnd).toISOString() 
        : null;

      payload.pdfPremiumEnd = editForm.pdfPremiumEnd 
        ? new Date(editForm.pdfPremiumEnd).toISOString() 
        : null;

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (e) {
      console.error('User update failed:', e);
    }
  };

  const refreshAll = () => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'verifications') fetchVerifications();
    if (activeTab === 'notifications') fetchNotifications();
  };

  const handleSyncUsers = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/admin/sync-users');
      if (res.ok) {
        refreshAll();
      }
    } catch (e) {
      console.error('Failed to sync users:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'verifications', label: 'Verifications', icon: <Eye className="w-4 h-4" /> },
    { id: 'safaricom', label: 'Safaricom', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  const statCards = stats ? [
    { 
      label: 'Total Users', value: stats.totalUsers, sub: `+${stats.recentUsers} this week`,
      icon: <Users className="w-6 h-6" />, gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-400'
    },
    { 
      label: 'Revenue', value: `KES ${(stats.totalRevenue / 100).toLocaleString()}`, sub: `${stats.totalTransactions} transactions`,
      icon: <DollarSign className="w-6 h-6" />, gradient: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400'
    },
    { 
      label: 'Verifications', value: stats.totalVerifications, sub: `${stats.activeSubscriptions} active subs`,
      icon: <FileCheck2 className="w-6 h-6" />, gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', text: 'text-purple-400'
    },
    { 
      label: 'Certificates', value: stats.totalCertificates, sub: 'PIN certs generated',
      icon: <TrendingUp className="w-6 h-6" />, gradient: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', text: 'text-orange-400'
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-gray-800/60 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">AkubrecaH Platform Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSyncUsers} 
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all text-sm disabled:opacity-50"
              >
                {isSyncing ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isSyncing ? 'Syncing...' : 'Sync Clerk'}
              </button>
              <button onClick={refreshAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 transition-all text-sm">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((card, i) => (
                    <div key={i} className={`p-5 rounded-2xl bg-gradient-to-br ${card.gradient} border ${card.border} backdrop-blur-sm`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`${card.text}`}>{card.icon}</span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{card.label}</span>
                      </div>
                      <div className="text-3xl font-bold text-white">{card.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/60">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" /> Recent Users
                    </h3>
                    <p className="text-gray-400 text-sm">
                      <span className="text-2xl font-bold text-blue-400">{stats?.recentUsers || 0}</span> new users joined this week
                    </p>
                    <button 
                      onClick={() => setActiveTab('users')} 
                      className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View all users →
                    </button>
                  </div>
                  <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/60">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-400" /> Active Subscriptions
                    </h3>
                    <p className="text-gray-400 text-sm">
                      <span className="text-2xl font-bold text-emerald-400">{stats?.activeSubscriptions || 0}</span> active subscribers
                    </p>
                    <button 
                      onClick={() => setActiveTab('transactions')} 
                      className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      View transactions →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by email or name..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUsersPage(1); }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-700/50 text-sm focus:outline-none focus:border-emerald-500/50 text-white placeholder-gray-500"
                    />
                  </div>
                  <span className="text-sm text-gray-500">{usersTotal} users</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-800/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900/80 border-b border-gray-800/60">
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Tier</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Credits</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Verifications</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Certs</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Joined</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-white">{user.name || 'No name'}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              user.role === 'cyber' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 capitalize">{user.subscriptionTier.replace('_', ' ')}</span>
                              <span className={`text-[10px] ${user.subscriptionStatus === 'active' ? 'text-emerald-400' : 'text-gray-500'}`}>{user.subscriptionStatus}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-xs font-mono">{user.credits}</td>
                          <td className="px-4 py-3 text-purple-400">{user._count.verifications}</td>
                          <td className="px-4 py-3 text-orange-400">{user._count.certificates}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setEditForm({
                                  role: user.role,
                                  subscriptionTier: user.subscriptionTier,
                                  subscriptionStatus: user.subscriptionStatus,
                                  credits: user.credits,
                                  subscriptionEnd: user.subscriptionEnd ? new Date(user.subscriptionEnd).toISOString().split('T')[0] : '',
                                  pdfPremiumEnd: user.pdfPremiumEnd ? new Date(user.pdfPremiumEnd).toISOString().split('T')[0] : ''
                                });
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-emerald-400 transition-colors font-medium border border-gray-700"
                            >
                              Edit Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-8 text-gray-500">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {editingUser && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                      <h3 className="text-xl font-bold text-white mb-4">Edit User Profile</h3>
                      <form onSubmit={handleUserUpdate} className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Email</label>
                          <input type="text" disabled value={editingUser.email} className="w-full px-3 py-2 bg-gray-800/50 rounded-lg text-gray-500 border border-gray-700/50 cursor-not-allowed" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Role</label>
                            <select
                              value={editForm.role}
                              onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            >
                              <option value="personal">Personal</option>
                              <option value="cyber">Cyber</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Credits</label>
                            <input
                              type="number"
                              value={editForm.credits}
                              onChange={e => setEditForm(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Tier</label>
                            <select
                              value={editForm.subscriptionTier}
                              onChange={e => setEditForm(prev => ({ ...prev, subscriptionTier: e.target.value }))}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            >
                              <option value="none">None</option>
                              <option value="pro">Pro</option>
                              <option value="daily_pro">Daily Pro</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Status</label>
                            <select
                              value={editForm.subscriptionStatus}
                              onChange={e => setEditForm(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            >
                              <option value="inactive">Inactive</option>
                              <option value="active">Active</option>
                              <option value="past_due">Past Due</option>
                              <option value="canceled">Canceled</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Sub. End</label>
                            <input
                              type="date"
                              value={editForm.subscriptionEnd}
                              onChange={e => setEditForm(prev => ({ ...prev, subscriptionEnd: e.target.value }))}
                              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">PDF Premium End</label>
                            <input
                              type="date"
                              value={editForm.pdfPremiumEnd}
                              onChange={e => setEditForm(prev => ({ ...prev, pdfPremiumEnd: e.target.value }))}
                              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
                          <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-gray-800/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900/80 border-b border-gray-800/60">
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Amount</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Type</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-white">{tx.user?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{tx.user?.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-emerald-400 font-medium">KES {(tx.amount / 100).toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-400">{tx.type}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-500">No transactions yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination page={txPage} totalPages={txTotalPages} onPageChange={setTxPage} />
              </div>
            )}

            {/* Verifications Tab */}
            {activeTab === 'verifications' && (
              <div className="space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by PIN or taxpayer name..."
                    value={vfSearch}
                    onChange={(e) => { setVfSearch(e.target.value); setVfPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-700/50 text-sm focus:outline-none focus:border-emerald-500/50 text-white placeholder-gray-500"
                  />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-800/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900/80 border-b border-gray-800/60">
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Verified By</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">KRA PIN</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Taxpayer</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.map(vf => (
                        <tr key={vf.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-white">{vf.user?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{vf.user?.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-emerald-400">{vf.kraPin}</td>
                          <td className="px-4 py-3 text-gray-300">{vf.taxpayerName || 'N/A'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{new Date(vf.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {verifications.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-8 text-gray-500">No verifications yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination page={vfPage} totalPages={vfTotalPages} onPageChange={setVfPage} />
              </div>
            )}

            {/* Safaricom Tab */}
            {activeTab === 'safaricom' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* STK Push Test */}
                  <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/60">
                    <h3 className="text-lg font-semibold mb-4 text-emerald-400">M-Pesa Express (STK Push)</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Phone Number (254...)</label>
                        <input 
                          type="text" 
                          placeholder="254700000000"
                          value={stkForm.phoneNumber}
                          onChange={e => setStkForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-emerald-500/50" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Amount</label>
                          <input 
                            type="number" 
                            value={stkForm.amount}
                            onChange={e => setStkForm(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-emerald-500/50" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Ref</label>
                          <input 
                            type="text" 
                            value={stkForm.accountRef}
                            onChange={e => setStkForm(prev => ({ ...prev, accountRef: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-emerald-500/50" 
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSafaricomAction('stkpush', { 
                          phoneNumber: stkForm.phoneNumber, 
                          amount: stkForm.amount, 
                          accountReference: stkForm.accountRef, 
                          transactionDesc: 'Test from Admin' 
                        })}
                        disabled={safaricomLoading || !stkForm.phoneNumber}
                        className="w-full py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                      >
                        {safaricomLoading ? 'Processing...' : 'Send STK Push'}
                      </button>
                    </div>
                  </div>

                  {/* Other Actions */}
                  <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/60">
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">Account & IoT Tools</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => handleSafaricomAction('balance', { initiator: 'testman', securityCredential: '...' })}
                        className="w-full text-left p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                      >
                        <div className="font-medium text-sm text-white">Query Multi-Wallet Balance</div>
                        <div className="text-xs text-gray-500">Check current float and account balances</div>
                      </button>
                      <button 
                        onClick={() => handleSafaricomAction('activate_sim', { msisdn: '...', vpnGroup: '...', username: '...' })}
                        className="w-full text-left p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                      >
                        <div className="font-medium text-sm text-white">SIM Activation Utility</div>
                        <div className="text-xs text-gray-500">Provision development SIMs on IoT Portal</div>
                      </button>
                    </div>

                    {safaricomResult && (
                      <div className="mt-6 p-4 bg-black rounded-xl border border-gray-800 overflow-auto max-h-48 font-mono text-[10px]">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Last Response:</span>
                          <button onClick={() => setSafaricomResult(null)} className="text-red-400">Clear</button>
                        </div>
                        <pre className="text-emerald-400">{JSON.stringify(safaricomResult, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center bg-gray-900/40 p-6 rounded-2xl border border-gray-800/60">
                  <div>
                    <h2 className="text-xl font-bold text-white">Site Announcements</h2>
                    <p className="text-sm text-gray-400">Manage popups and marquees for all users</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingNotification(null);
                      setNotificationForm({ message: '', type: 'marquee', active: true });
                    }}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    Create New
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Container */}
                  <div className="p-8 rounded-2xl bg-gray-900/60 border border-gray-800/60 backdrop-blur-sm shadow-xl h-fit">
                    <h3 className="text-lg font-bold mb-6 text-emerald-400 flex items-center gap-2">
                       <Edit2 className="w-5 h-5" />
                      {editingNotification ? 'Update Announcement' : 'Compose Announcement'}
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Message (HTML/Gradients supported)</label>
                        <textarea 
                          rows={5}
                          value={notificationForm.message}
                          onChange={e => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-950/50 rounded-xl border border-gray-700 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-700" 
                          placeholder="e.g. <span class='text-emerald-400'>NEW:</span> M-Pesa integration is live!"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Display Style</label>
                          <select 
                            value={notificationForm.type}
                            onChange={e => setNotificationForm(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full px-4 py-2.5 bg-gray-950/50 rounded-xl border border-gray-700 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                          >
                            <option value="marquee">Marquee (Scrolling Top)</option>
                            <option value="popup">Popup (Center Modal)</option>
                          </select>
                        </div>
                        
                        <div className="flex items-end pb-1.5">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={notificationForm.active}
                                onChange={e => setNotificationForm(prev => ({ ...prev, active: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Active Now</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={async () => {
                            if (!notificationForm.message) return alert('Message is required');
                            const method = editingNotification ? 'PATCH' : 'POST';
                            const res = await fetch('/api/admin/notifications', {
                              method,
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                ...notificationForm,
                                id: editingNotification?.id
                              })
                            });
                            if (res.ok) {
                              fetchNotifications();
                              setNotificationForm({ message: '', type: 'marquee', active: true });
                              setEditingNotification(null);
                            }
                          }}
                          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                        >
                          {editingNotification ? 'Save Changes' : 'Publish Announcement'}
                        </button>
                        {editingNotification && (
                          <button 
                            onClick={() => {
                              setEditingNotification(null);
                              setNotificationForm({ message: '', type: 'marquee', active: true });
                            }}
                            className="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-all border border-gray-700 active:scale-[0.98]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* History List */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2 px-1">
                      Recent Announcements
                    </h3>
                    {notificationLoading ? (
                      <div className="flex items-center justify-center p-20 bg-gray-900/20 rounded-2xl border border-gray-800/40">
                         <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-12 text-center text-gray-500 bg-gray-900/20 rounded-2xl border border-gray-800/40 border-dashed">
                        No history found. Create your first announcement.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`group p-5 rounded-2xl border transition-all duration-300 ${
                            notif.active 
                            ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5 scale-[1.02]' 
                            : 'bg-gray-950/40 border-gray-800/60 opacity-60 hover:opacity-100 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                  notif.type === 'marquee' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                  {notif.type}
                                </span>
                                {notif.active && (
                                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    LIVE
                                  </span>
                                )}
                              </div>
                              <div 
                                className="text-sm text-gray-100 leading-relaxed font-medium" 
                                dangerouslySetInnerHTML={{ __html: notif.message }} 
                              />
                              <div className="text-[10px] text-gray-600 font-mono tracking-tighter">
                                Published {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingNotification(notif);
                                  setNotificationForm({
                                    message: notif.message,
                                    type: notif.type as any,
                                    active: notif.active
                                  });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="p-2.5 rounded-xl bg-gray-800 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all active:scale-90"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm('Permanently delete this announcement?')) {
                                    const res = await fetch(`/api/admin/notifications?id=${notif.id}`, { method: 'DELETE' });
                                    if (res.ok) fetchNotifications();
                                  }
                                }}
                                className="p-2.5 rounded-xl bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all active:scale-90"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 rounded-lg hover:bg-gray-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm text-gray-400">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-2 rounded-lg hover:bg-gray-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
