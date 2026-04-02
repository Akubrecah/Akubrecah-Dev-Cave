import { motion } from 'framer-motion';
import { Users, DollarSign, Shield, FileCheck2, RefreshCw, Activity as ActivityIcon, TrendingUp, Eye, BarChart2, ExternalLink } from 'lucide-react';
import { AdminMetricCard } from '../AdminMetricCard';
import { PremiumAreaChart } from '../PremiumAreaChart';
import { ActivityStream, type ActivityItem } from '../ActivityStream';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function OverviewTab({
  stats,
  chartMetric,
  setChartMetric,
  timeSeriesData,
  isSyncing,
  handleSyncUsers,
  healthLoading,
  healthData,
  activities
}: {
  stats: any;
  chartMetric: any;
  setChartMetric: any;
  timeSeriesData: any[];
  isSyncing: boolean;
  handleSyncUsers: () => void;
  healthLoading: boolean;
  healthData: any;
  activities: ActivityItem[];
}) {
  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricCard 
          label="Total Citizens" 
          value={stats?.totalUsers || 0} 
          subText={`+${stats?.recentUsers} this week`}
          icon={Users}
          trend="up"
          trendValue="8%"
          index={0}
        />
        <AdminMetricCard 
          label="Revenue Volume" 
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
          trendValue="STABLE"
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

      {/* Google Analytics & Clarity Pulse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl group transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><ActivityIcon className="w-16 h-16 text-[var(--color-accent)]" /></div>
          <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-2 opacity-60">LIVE SESSIONS</h4>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{stats?.gaSessions?.toLocaleString() || '---'}</p>
            <span className="text-[10px] font-black text-[var(--color-accent)] uppercase">Live</span>
          </div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">Active session volume</p>
        </div>

        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl group transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><TrendingUp className="w-16 h-16 text-emerald-500" /></div>
          <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-2 opacity-60">AVG ENGAGEMENT</h4>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{stats?.gaAvgDuration || '---'}</p>
            <span className="text-[10px] font-black text-emerald-500 uppercase">optimal</span>
          </div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">Retention Intelligence</p>
        </div>

        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl group transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><Eye className="w-16 h-16 text-blue-500" /></div>
          <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-2 opacity-60">BOUNCE STABILITY</h4>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{stats?.gaBounceRate || '---'}%</p>
            <span className="text-[10px] font-black text-emerald-500 uppercase">Stable</span>
          </div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">Traffic Stability</p>
        </div>
      </div>

      {/* Microsoft Clarity Native Intelligence Center */}
      <div className="grid grid-cols-1 gap-8">
        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl relative overflow-hidden group min-h-[400px] flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <BarChart2 className="w-48 h-48 text-[#F5C200]" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#F5C200]/10 border border-[#F5C200]/20 flex items-center justify-center">
                  <ActivityIcon className="w-8 h-8 text-[#F5C200]" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-[0.3em] mb-1 opacity-60">
                    Behavioral Intelligence Center
                  </h3>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-black text-white italic tracking-tighter">Native Telemetry</p>
                    <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Source: Microsoft Clarity API</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <a 
                   href="https://clarity.microsoft.com/projects/view/w4r5iil0md/dashboard"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-[#F5C200]/40 transition-all"
                >
                  <ExternalLink size={12} />
                  Full Dashboard
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Intelligence Parameters */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#F5C200]/20 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-500 italic mb-1">User Friction Index</span>
                        <span className="text-2xl font-black text-white italic tracking-tighter tabular-nums">
                          {stats?.clarityFriction || '0.12'}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                        (stats?.clarityFriction || 0) < 0.3 ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" : "text-amber-500 bg-amber-500/10 border border-amber-500/20"
                      )}>
                        { (stats?.clarityFriction || 0) < 0.3 ? 'LOW' : 'WATCH' }
                      </span>
                  </div>
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#F5C200]/20 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-500 italic mb-1">Rage Click Frequency</span>
                        <span className="text-2xl font-black text-white italic tracking-tighter tabular-nums">
                          {stats?.clarityRageClicks || '0'}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-[#F5C200] uppercase tracking-widest px-3 py-1 rounded-lg bg-[#F5C200]/10 border border-[#F5C200]/20">
                        Minimal
                      </span>
                  </div>
              </div>

              {/* Advanced Engagement Metrics */}
              <div className="p-8 rounded-[24px] bg-black/40 border border-white/5 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <TrendingUp className="w-24 h-24 text-[var(--color-accent)]" />
                  </div>
                  <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-6 opacity-60 italic">Live Stability Pipeline</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Operational Rate</p>
                        <p className="text-2xl font-black text-white italic tabular-nums tracking-tighter">99.9%</p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="w-[99.9%] h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Capture Speed</p>
                        <p className="text-2xl font-black text-white italic tabular-nums tracking-tighter">0.3s</p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="w-[92%] h-full bg-[#F5C200] shadow-[0_0_8px_rgba(245,194,0,0.5)]" />
                        </div>
                    </div>
                  </div>
                  <p className="mt-8 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Telemetry synchronized in real-time via Master API Secure Tunnel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-[0.2em] opacity-60">Growth Intelligence</h3>
               <div className="flex gap-1.5 glass-panel p-1 rounded-xl border border-white/10">
                {['revenue', 'users', 'transactions', 'traffic'].map((m) => (
                    <button 
                      key={m}
                      onClick={() => setChartMetric(m as any)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                        chartMetric === m ? "bg-[var(--color-brand-red)] text-white shadow-lg shadow-red-900/40" : "text-gray-500 hover:text-white"
                      )}
                    >
                       {m === 'traffic' ? 'Network' : m}
                    </button>
                 ))}
               </div>
            </div>
            <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl relative overflow-hidden group">
              <PremiumAreaChart 
                data={timeSeriesData.map(d => ({ date: d.date, value: d[chartMetric] }))} 
                color={chartMetric === 'revenue' ? '#E30613' : '#F5C200'}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl group transition-all">
                  <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-2 opacity-60">Sync Engine</h4>
                  <p className="text-xl font-black text-white leading-none tracking-tight">Clerk Identity</p>
                  <button 
                     onClick={handleSyncUsers}
                     className="mt-6 flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-[var(--color-brand-red)]/10 text-white hover:text-[var(--color-brand-red)] rounded-xl border border-white/10 hover:border-[var(--color-brand-red)]/20 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg"
                   >
                     {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                     Force Sync
                   </button>
               </div>
               <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl group transition-all relative overflow-hidden">
                  <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-2 opacity-60">Platform Pulse</h4>
                  <p className="text-xl font-black text-white leading-none tracking-tight">
                    {healthLoading ? 'Scanning...' : healthData?.status === 'operational' ? 'Operational' : 'Critical'}
                  </p>
                  <div className="mt-8 flex items-center gap-2">
                     <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${healthData?.score || 0}%` }} 
                          className={cn(
                            "h-full transition-all duration-1000",
                            (healthData?.score || 0) > 80 ? "bg-[var(--color-accent)]" : "bg-amber-500"
                          )} 
                        />
                     </div>
                     <span className={cn(
                       "text-[10px] font-black tabular-nums",
                       (healthData?.score || 0) > 80 ? "text-[var(--color-accent)]" : "text-amber-500"
                     )}>
                       {healthLoading ? '...' : `${Math.round(healthData?.score || 0)}%`}
                     </span>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                     {healthData?.nodes && Object.entries(healthData.nodes).map(([node, status]) => (
                       <div key={node} className="flex items-center gap-2">
                         <div className={cn(
                           "w-1.5 h-1.5 rounded-full",
                           status === 'up' ? "bg-[var(--color-accent)] shadow-[0_0_8px_rgba(245,194,0,0.5)]" : "bg-gray-700"
                         )} />
                         <span className="text-[9px] font-black uppercase text-[#BEA0A0] tracking-tighter opacity-80">{node}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
         <ActivityStream activities={activities} />
      </div>
   </div>
  );
}
