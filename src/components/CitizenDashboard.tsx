import React, { useState, useEffect } from 'react';
import { Complaint, IssueCategory, IssueStatus } from '../types/index.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { InteractiveMap } from './InteractiveMap.tsx';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  MapPin,
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import {
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

interface CitizenDashboardProps {
  onOpenReportModal: () => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onOpenReportModal,
  onSelectComplaint
}) => {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'nearby'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await api.getComplaints({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        citizenId: activeTab === 'my' ? user?.id : undefined
      });
      setComplaints(res.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [activeTab, selectedCategory, searchQuery, user]);

  // Statistics calculation
  const totalReports = complaints.length;
  const pendingReports = complaints.filter(c => c.status === 'REPORTED' || c.status === 'UNDER REVIEW').length;
  const inProgressReports = complaints.filter(c => c.status === 'IN PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedReports = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  const myComplaintsCount = complaints.filter(c => c.citizenId === user?.id).length;

  // Chart data
  const categoryData = [
    { name: 'Roads', count: complaints.filter(c => c.category === 'Road Damage').length, color: '#2563EB' },
    { name: 'Sanitation', count: complaints.filter(c => c.category === 'Garbage Overflow').length, color: '#10B981' },
    { name: 'Water', count: complaints.filter(c => c.category === 'Water Leakage').length, color: '#06B6D4' },
    { name: 'Lighting', count: complaints.filter(c => c.category === 'Streetlight Failure').length, color: '#F59E0B' },
    { name: 'Drainage', count: complaints.filter(c => c.category === 'Drainage Blockage').length, color: '#8B5CF6' }
  ];

  const activityData = [
    { month: 'Jun', reported: 18, resolved: 15 },
    { month: 'Jul', reported: 24, resolved: 21 },
    { month: 'Aug', reported: 32, resolved: 28 },
    { month: 'Sep', reported: 28, resolved: 25 },
    { month: 'Oct', reported: 36, resolved: 33 },
    { month: 'Nov', reported: complaints.length, resolved: resolvedReports }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Citizen Action Center
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking public infrastructure integrity across Bengaluru wards.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-sm transition-all whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Complaints</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalReports}
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
              Active Ward
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Under Triage</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {pendingReports}
            </span>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
              Verification
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">In Progress (Field Work)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
              {inProgressReports}
            </span>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
              Active Crew
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resolved & Verified</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {resolvedReports}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
              Photo Audit
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Civic Issues Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any pin to inspect hazard severity, photos, and current workflow status
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {complaints.length} geo-markers
            </span>
          </div>

          <InteractiveMap
            complaints={complaints}
            onSelectComplaint={onSelectComplaint}
            height="440px"
            showFilters={true}
          />
        </div>

        {/* Right Col: Category Breakdown & Activity Charts */}
        <div className="space-y-6">
          {/* Category Share Chart */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Issues by Category
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={65} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Activity Mini Chart */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Monthly Resolution Velocity
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="reported" fill="#94A3B8" name="Reported" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List / Feed */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Controls: Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Community Issues ({totalReports})
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'my'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              My Submitted Reports ({myComplaintsCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search complaint # or street..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Complaints Table / Cards */}
        {complaints.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            <p>No complaints match your current filter.</p>
            <button
              onClick={onOpenReportModal}
              className="mt-3 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Log First Entry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {complaints.map(item => (
              <div
                key={item.id}
                onClick={() => onSelectComplaint(item)}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.images[0] || '/src/assets/images/issue_pothole_detection_1794055372612.jpg'}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.complaintNumber}
                      </span>
                      <span>·</span>
                      <span>{item.category}</span>
                      <span>·</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{item.location.address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.priority === 'Critical'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : item.priority === 'High'
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {item.priority} Priority ({item.priorityScore})
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium mt-1">
                      Status: <strong>{item.status}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="font-mono tabular-nums">{item.supportCount}</span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
