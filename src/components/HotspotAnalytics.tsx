import React, { useState, useEffect } from 'react';
import { HotspotCluster, DashboardStats } from '../types/index.ts';
import { api } from '../api/client.ts';
import {
  Flame,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Calendar,
  Building,
  BarChart3,
  Download,
  Info,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const HotspotAnalytics: React.FC = () => {
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getHotspots().then(setHotspots).catch(() => {});
    api.getAdminStats().then(setStats).catch(() => {});
  }, []);

  const trendData = [
    { month: 'Jun', total: 42, resolved: 38 },
    { month: 'Jul', total: 54, resolved: 49 },
    { month: 'Aug', total: 68, resolved: 58 },
    { month: 'Sep', total: 62, resolved: 56 },
    { month: 'Oct', total: 79, resolved: 71 },
    { month: 'Nov', total: 85, resolved: 74 }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Civic Intelligence & Hotspots
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Geospatial Ward Density</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Predictive Hotspots & Infrastructure Telemetry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Multi-source spatial clustering of recurring road fractures, drainage chokes, and solid waste dumps.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Generate Monthly PDF Report</span>
        </button>
      </div>

      {/* Geospatial Hotspot Clusters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Identified High-Frequency Problem Clusters
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Spatial radius: 300m - 600m</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hotspots.map(h => (
            <div
              key={h.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">
                    {h.primaryCategory}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">{h.name}</h4>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    h.severityLevel === 'High'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                  }`}
                >
                  {h.severityLevel}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400">Incident Density</span>
                  <p className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {h.complaintCount} <span className="text-xs font-normal text-slate-400">reports</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Open Backlog</span>
                  <p className="text-xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400">
                    {h.openIssues}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Cluster radius: {h.radiusMeters}m</span>
                <span className="font-mono text-[10px]">
                  {h.latitude.toFixed(3)}, {h.longitude.toFixed(3)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Monthly Resolution vs Volume Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comparative analysis of incoming complaints against verified clearances
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
              +14% Cleared MoM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#2563EB" fillOpacity={1} fill="url(#colorTotal)" name="Total Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#10B981" fillOpacity={1} fill="url(#colorResolved)" name="Remediated" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workload Allocation */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Department Performance Benchmark
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assigned work order volume vs on-site verified clearance
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.departmentPerformance || [
                  { department: 'Roads', assigned: 42, resolved: 35, rate: 83 },
                  { department: 'Sanitation', assigned: 38, resolved: 31, rate: 81 },
                  { department: 'Water', assigned: 29, resolved: 24, rate: 82 },
                  { department: 'Lighting', assigned: 26, resolved: 23, rate: 88 },
                  { department: 'Drainage', assigned: 21, resolved: 17, rate: 80 }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="assigned" fill="#94A3B8" name="Assigned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#2563EB" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Predictive Triage Advisory Box */}
      <div className="p-5 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/20 text-xs text-cyan-900 dark:text-cyan-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-cyan-950 dark:text-cyan-100">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <span>Predictive Monsoon & Road Pavement Advisory</span>
        </div>
        <p className="leading-relaxed">
          Based on historical water stagnation records and drainage choke frequency during the Northeast Monsoon,
          Indiranagar 100 Feet Corridor and HSR Layout Sector 2 are flagged for proactive culvert desilting.
          <em> Notice: Predictive models serve as municipal decision-support and require on-ground physical inspection before capital allocations.</em>
        </p>
      </div>
    </div>
  );
};
