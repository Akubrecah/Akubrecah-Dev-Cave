"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, DollarSign, FileCheck2, Shield, Search, 
  ChevronLeft, ChevronRight, RefreshCw, TrendingUp,
  Activity, Eye, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'users' | 'transactions' | 'verifications';

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

  // Editing user role
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');

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

  useEffect(() => {
    setLoading(true);
    fetchStats().finally(() => setLoading(false));
  }, [fetchStats]);

  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab, fetchUsers]);
  useEffect(() => { if (activeTab === 'transactions') fetchTransactions(); }, [activeTab, fetchTransactions]);
  useEffect(() => { if (activeTab === 'verifications') fetchVerifications(); }, [activeTab, fetchVerifications]);

  const handleRoleUpdate = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: editRole }),
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (e) { console.error('Role update failed:', e); }
  };

  const refreshAll = () => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'verifications') fetchVerifications();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'verifications', label: 'Verifications', icon: <Eye className="w-4 h-4" /> },
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
            <button onClick={refreshAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 transition-all text-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
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
                            {editingUser === user.id ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value)}
                                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs"
                                >
                                  <option value="personal">Personal</option>
                                  <option value="cyber">Cyber</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button onClick={() => handleRoleUpdate(user.id)} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium">Save</button>
                                <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-300 text-xs">Cancel</button>
                              </div>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                user.role === 'cyber' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}>
                                {user.role}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-400">{user.subscriptionTier}</span>
                          </td>
                          <td className="px-4 py-3 text-purple-400">{user._count.verifications}</td>
                          <td className="px-4 py-3 text-orange-400">{user._count.certificates}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { setEditingUser(user.id); setEditRole(user.role); }}
                              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                            >
                              Edit Role
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
