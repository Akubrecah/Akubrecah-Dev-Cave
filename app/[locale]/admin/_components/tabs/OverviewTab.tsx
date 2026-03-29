import { motion } from 'framer-motion';
import { Users, DollarSign, Shield, FileCheck2, RefreshCw } from 'lucide-react';
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
