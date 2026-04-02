import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, Shield, FileCheck2, RefreshCw, Activity as ActivityIcon, TrendingUp, Eye, LayoutDashboard, MousePointer2, Video, BarChart2, ExternalLink, Loader2 } from 'lucide-react';
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
  const [clarityType, setClarityType] = useState<'dashboard' | 'heatmaps' | 'recordings'>('dashboard');
  const [clarityLoading, setClarityLoading] = useState(true);

  const clarityUrls = {
    dashboard: "https://clarity.microsoft.com/projects/view/w4r5iil0md/dashboard",
    heatmaps: "https://clarity.microsoft.com/projects/view/w4r5iil0md/heatmaps",
    recordings: "https://clarity.microsoft.com/projects/view/w4r5iil0md/recordings"
  };

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

      {/* Microsoft Clarity Intelligence Center - Embedded Viewport */}
      <div className="grid grid-cols-1 gap-8">
        <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl relative overflow-hidden group min-h-[900px] flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <ActivityIcon className="w-48 h-48 text-[#F5C200]" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#F5C200]/10 border border-[#F5C200]/20 flex items-center justify-center">
                  <BarChart2 className="w-8 h-8 text-[#F5C200]" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-[0.3em] mb-1 opacity-60">
                    Behavioral Intelligence Center
                  </h3>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-black text-white italic tracking-tighter">Microsoft Clarity</p>
                    <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Node: w4r5iil0md</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Segmented Switcher */}
              <div className="flex p-1.5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl">
                {(['dashboard', 'heatmaps', 'recordings'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setClarityLoading(true);
                      setClarityType(type);
                    }}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2",
                      clarityType === type 
                        ? "bg-[#F5C200] text-black shadow-lg shadow-[#F5C200]/20" 
                        : "text-gray-500 hover:text-white"
                    )}
                  >
                    {type === 'dashboard' && <LayoutDashboard size={12} />}
                    {type === 'heatmaps' && <MousePointer2 size={12} />}
                    {type === 'recordings' && <Video size={12} />}
                    {type}
                    {clarityType === type && (
                      <motion.div 
                        layoutId="clarityTab" 
                        className="absolute inset-0 bg-white/10 rounded-xl" 
                        initial={false}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Viewport View */}
            <div className="flex-1 relative rounded-[24px] border border-white/5 bg-black/40 overflow-hidden shadow-inner">
              <AnimatePresence mode="wait">
                {clarityLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
                  >
                    <Loader2 className="w-10 h-10 text-[#F5C200] animate-spin mb-4" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse italic">Establishing Data Pipeline...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <iframe 
                src={clarityUrls[clarityType]}
                onLoad={() => setClarityLoading(false)}
                className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity duration-700 contrast-125 saturate-50 hover:saturate-100"
                style={{ filter: 'grayscale(0.2) contrast(1.1)' }}
                allowFullScreen
              />

              {/* Viewport Overlay Info */}
              <div className="absolute bottom-6 left-6 z-10 flex items-center gap-4">
                 <div className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-3">
                   <div className="flex items-center gap-1.5">
                     <span className="text-[8px] font-black text-gray-500 uppercase italic">Security:</span>
                     <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">ENCRYPTED</span>
                   </div>
                   <div className="w-px h-3 bg-white/10" />
                   <div className="flex items-center gap-1.5">
                     <span className="text-[8px] font-black text-gray-500 uppercase italic">Source:</span>
                     <span className="text-[8px] font-black text-[#F5C200] uppercase tracking-widest italic">{clarityType.toUpperCase()}</span>
                   </div>
                 </div>
              </div>

              <div className="absolute top-6 right-6 z-10">
                <a 
                  href={clarityUrls[clarityType]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-gray-400 hover:text-white hover:border-[#F5C200]/40 transition-all group/popout"
                >
                  <ExternalLink size={16} className="group-hover/popout:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Quick Status Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest opacity-60 italic">Intelligence Parameters</h4>
                    <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest text-emerald-500">
                      Live Feed
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-[#F5C200]/20 transition-all">
                        <span className="text-[10px] font-black uppercase text-gray-500 italic">User Friction Index</span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">LOW (0.12)</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-[#F5C200]/20 transition-all">
                        <span className="text-[10px] font-black uppercase text-gray-500 italic">Rage Click Frequency</span>
                        <span className="text-[10px] font-black text-[#F5C200] uppercase tracking-widest">Minimal</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-[#F5C200]/20 transition-all">
                        <span className="text-[10px] font-black uppercase text-gray-500 italic">Navigation Clarity</span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal</span>
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-[32px] glass-panel border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <ActivityIcon className="w-24 h-24 text-[var(--color-accent)]" />
              </div>
              <h4 className="text-[10px] font-black text-[#BEA0A0] uppercase tracking-widest mb-6 opacity-60 italic">Advanced Engagement Metrics</h4>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Stability Rate</p>
                    <p className="text-2xl font-black text-white italic tabular-nums tracking-tighter">99.8%</p>
                    <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-[99.8%] h-full bg-emerald-500" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Capture Velocity</p>
                    <p className="text-2xl font-black text-white italic tabular-nums tracking-tighter">0.4s</p>
                    <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-[85%] h-full bg-[#F5C200]" />
                    </div>
                 </div>
              </div>
              <p className="mt-8 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Behavioral pulse synchronized hourly via Microsoft Clarity Engine</p>
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
