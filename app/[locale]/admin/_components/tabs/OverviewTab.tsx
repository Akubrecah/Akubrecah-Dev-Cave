import { motion } from 'framer-motion';
import { Users, DollarSign, Shield, FileCheck2, RefreshCw, Activity as ActivityIcon, TrendingUp, Eye, LayoutDashboard, MousePointer2, Video, BarChart2, ExternalLink } from 'lucide-react';
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

      {/* Google Analytics Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl group transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><ActivityIcon className="w-16 h-16 text-[var(--color-accent)]" /></div>
          <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-2 opacity-60">ACTIVE SESSIONS</h4>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{stats?.gaSessions?.toLocaleString() || '---'}</p>
            <span className="text-[10px] font-black text-[var(--color-accent)] uppercase">+12%</span>
          </div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">Active session volume</p>
        </div>

        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl group transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><TrendingUp className="w-16 h-16 text-emerald-500" /></div>
          <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-2 opacity-60">PLATFORM ENGAGEMENT</h4>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{stats?.gaAvgDuration || '---'}</p>
            <span className="text-[10px] font-black text-emerald-500 uppercase">optimal</span>
          </div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">Retention Intelligence</p>
        </div>

        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl group transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><Eye className="w-16 h-16 text-blue-500" /></div>
          <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-2 opacity-60">TRAFFIC STABILITY</h4>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{stats?.gaBounceRate || '---'}%</p>
            <span className="text-[10px] font-black text-emerald-500 uppercase">-4%</span>
          </div>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">Traffic Stability</p>
        </div>
      </div>

      {/* Microsoft Clarity Insight Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <ActivityIcon className="w-24 h-24 text-[#F5C200]" />
          </div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-[0.3em] mb-6 opacity-60">
              Behavioral Intelligence Center
            </h3>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#F5C200]/10 border border-[#F5C200]/20 flex items-center justify-center">
                <BarChart2 className="w-8 h-8 text-[#F5C200]" />
              </div>
              <div>
                <p className="text-2xl font-black text-white italic tracking-tighter">Microsoft Clarity</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Tracking: w4r5iil0md</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a 
                href="https://clarity.microsoft.com/projects/view/w4r5iil0md/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#F5C200]/40 hover:bg-[#F5C200]/5 transition-all group/btn"
              >
                <LayoutDashboard className="w-5 h-5 text-gray-400 group-hover/btn:text-[#F5C200] mb-2" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover/btn:text-white">Dashboard</span>
              </a>
              <a 
                href="https://clarity.microsoft.com/projects/view/w4r5iil0md/heatmaps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#F5C200]/40 hover:bg-[#F5C200]/5 transition-all group/btn"
              >
                <MousePointer2 className="w-5 h-5 text-gray-400 group-hover/btn:text-[#F5C200] mb-2" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover/btn:text-white">Heatmaps</span>
              </a>
              <a 
                href="https://clarity.microsoft.com/projects/view/w4r5iil0md/recordings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#F5C200]/40 hover:bg-[#F5C200]/5 transition-all group/btn"
              >
                <Video className="w-5 h-5 text-gray-400 group-hover/btn:text-[#F5C200] mb-2" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover/btn:text-white">Recordings</span>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Insights / Summary */}
        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-center">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest opacity-60">Intelligence Summary</h4>
                <a 
                  href="https://clarity.microsoft.com/projects" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F5C200]/10 border border-[#F5C200]/20 text-[8px] font-black uppercase tracking-widest text-[#F5C200] hover:bg-[#F5C200] hover:text-black transition-all"
                >
                  Full Dashboard <ExternalLink size={10} />
                </a>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-black uppercase text-gray-500 italic">User Friction Index</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">LOW (0.12)</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-black uppercase text-gray-500 italic">Rage Click Frequency</span>
                    <span className="text-[10px] font-black text-[#F5C200] uppercase tracking-widest">Minimal</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-black uppercase text-gray-500 italic">Navigation Clarity</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal</span>
                </div>
            </div>
            <p className="mt-6 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Behavioral pulse synchronized via Microsoft Clarity</p>
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
