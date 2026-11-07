import React, { useState, useEffect } from 'react';
import {
  Complaint,
  Department,
  Officer,
  DashboardStats,
  IssuePriority,
  IssueStatus
} from '../types/index.ts';
import { api } from '../api/client.ts';
import { InteractiveMap } from './InteractiveMap.tsx';
import {
  Shield,
  Building2,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  ArrowUpDown,
  UserCheck,
  Edit3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download
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
  Cell,
  LineChart,
  Line
} from 'recharts';

interface AdminDashboardProps {
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenReportModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectComplaint,
  onOpenReportModal
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Action Drawers
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  const [overridingComplaint, setOverridingComplaint] = useState<Complaint | null>(null);
  const [overridePriority, setOverridePriority] = useState<IssuePriority>('High');
  const [overrideScore, setOverrideScore] = useState<number>(75);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isOverriding, setIsOverriding] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 6;

  const loadData = async () => {
    try {
      const [s, c, d] = await Promise.all([
        api.getAdminStats(),
        api.getComplaints(),
        api.getDepartments()
      ]);
      setStats(s);
      setComplaints(c.complaints);
      setDepartments(d);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When assigning modal opens and department changes, load that department's officers
  useEffect(() => {
    if (selectedDeptId) {
      api.getDepartmentOfficers(selectedDeptId).then(list => {
        setOfficers(list);
        if (list.length > 0) setSelectedOfficerId(list[0].id);
      }).catch(() => {});
    }
  }, [selectedDeptId]);

  // Filtered complaints
  let filtered = complaints.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.complaintNumber.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedComplaints = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Handle Assign Submission
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningComplaint || !selectedDeptId || !selectedOfficerId) return;

    setIsAssigning(true);
    try {
      await api.assignComplaint({
        complaintId: assigningComplaint.id,
        departmentId: selectedDeptId,
        officerId: selectedOfficerId,
        adminNotes: assignNotes
      });
      setAssigningComplaint(null);
      setAssignNotes('');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Priority Override Submission
  const handlePriorityOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overridingComplaint || !overrideReason.trim()) return;

    setIsOverriding(true);
    try {
      await api.overridePriority(overridingComplaint.id, {
        priority: overridePriority,
        score: overrideScore,
        overrideReason,
        officerName: 'Dr. Vikram Malhotra (Super Admin)'
      });
      setOverridingComplaint(null);
      setOverrideReason('');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsOverriding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Super Administrator Command
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Central Command Bengaluru</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Municipal Operations Cockpit
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated triage, multi-department work order routing, SLA monitoring, and verification audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['ID,Title,Category,Priority,Status,Address,Citizen']
                  .concat(
                    complaints.map(
                      c =>
                        `"${c.complaintNumber}","${c.title}","${c.category}","${c.priority}","${c.status}","${c.location.address}","${c.citizenName}"`
                    )
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `civicpulse_audit_report_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
            }}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
          >
            Create Incident
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Tabular nums) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Incidents</span>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {stats?.totalComplaints || complaints.length}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Pending Review</span>
          <p className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {stats?.pendingComplaints || 0}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-red-600 dark:text-red-400">Critical Priority</span>
          <p className="text-2xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400 mt-1">
            {stats?.criticalComplaints || 0}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Active Work Orders</span>
          <p className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1">
            {stats?.inProgressComplaints || 0}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Resolved & Closed</span>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {stats?.resolvedComplaints || 0}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Avg Resolution SLA</span>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {stats?.avgResolutionDays || 1.8}d
          </p>
        </div>
      </div>

      {/* Department Workload Matrix */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Connected Municipal Departments & SLA Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time work orders, assigned personnel, and resolution completion rates
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
            {departments.length} Agencies
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.slice(0, 3).map(dept => {
            const completionRate = Math.round((dept.totalResolved / Math.max(1, dept.totalAssigned)) * 100);
            return (
              <div
                key={dept.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 uppercase">{dept.code}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">{dept.name}</h4>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 text-[11px]">{completionRate}%</span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Assigned: <strong className="font-mono text-slate-700 dark:text-slate-200">{dept.totalAssigned}</strong></span>
                  <span>Resolved: <strong className="font-mono text-emerald-600">{dept.totalResolved}</strong></span>
                  <span>Avg SLA: <strong className="font-mono text-slate-700 dark:text-slate-200">{dept.avgResolutionHours}h</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Map & Geographic Distribution */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              City Incident Dispatch Map
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Color-coded by infrastructure classification and safety severity level
            </p>
          </div>
        </div>
        <InteractiveMap
          complaints={complaints}
          onSelectComplaint={onSelectComplaint}
          height="380px"
          showFilters={true}
        />
      </div>

      {/* Complaints Management Table with Multi-Filter, Search, and Pagination */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Table Filters Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search complaint # or street..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Categories</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Garbage Overflow">Garbage Overflow</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Streetlight Failure">Streetlight Failure</option>
              <option value="Drainage Blockage">Drainage Blockage</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical (85-100)</option>
              <option value="High">High (65-84)</option>
              <option value="Medium">Medium (35-64)</option>
              <option value="Low">Low (0-34)</option>
            </select>
          </div>

          <span className="font-mono text-slate-500 dark:text-slate-400">
            Showing {paginatedComplaints.length} of {filtered.length} incidents
          </span>
        </div>

        {/* Dense Professional Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Complaint ID</th>
                <th className="py-2.5 px-3">Problem Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Assigned Agency</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedComplaints.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {row.complaintNumber}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                    {row.title}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">{row.category}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.priority === 'Critical'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : row.priority === 'High'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {row.priority} ({row.priorityScore})
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-[180px] truncate text-slate-500 dark:text-slate-400">
                    {row.location.address}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {row.assignedDepartmentName ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {row.assignedDepartmentName.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold text-[11px]">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => {
                        setAssigningComplaint(row);
                        setSelectedDeptId(row.assignedDepartmentId || departments[0]?.id || '');
                      }}
                      title="Assign Department"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setOverridingComplaint(row);
                        setOverridePriority(row.priority);
                        setOverrideScore(row.priorityScore);
                      }}
                      title="Override Priority"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectComplaint(row)}
                      title="Inspect Details"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Modal Drawer */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <h3 className="text-sm font-bold">
              Assign Work Order: {assigningComplaint.complaintNumber}
            </h3>
            <p className="text-xs text-slate-500">
              {assigningComplaint.title} · {assigningComplaint.location.address}
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Municipal Agency</label>
                <select
                  value={selectedDeptId}
                  onChange={e => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Inspecting Officer</label>
                <select
                  value={selectedOfficerId}
                  onChange={e => setSelectedOfficerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Administrator Dispatch Instructions</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={e => setAssignNotes(e.target.value)}
                  placeholder="e.g. Expedite dispatch; school zone safety risk..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningComplaint(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  {isAssigning ? 'Dispatching...' : 'Dispatch Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Priority Override Modal */}
      {overridingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <h3 className="text-sm font-bold">
              Override Priority: {overridingComplaint.complaintNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Current AI Score: {overridingComplaint.priorityScore}/100 ({overridingComplaint.priority})
            </p>

            <form onSubmit={handlePriorityOverrideSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">New Severity Classification</label>
                <select
                  value={overridePriority}
                  onChange={e => {
                    const p = e.target.value as IssuePriority;
                    setOverridePriority(p);
                    if (p === 'Critical') setOverrideScore(92);
                    else if (p === 'High') setOverrideScore(75);
                    else if (p === 'Medium') setOverrideScore(50);
                    else setOverrideScore(25);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Critical">Critical (Emergency Response)</option>
                  <option value="High">High (Within 24 Hours)</option>
                  <option value="Medium">Medium (Scheduled Route)</option>
                  <option value="Low">Low (Maintenance Backlog)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Override Score (0 - 100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={overrideScore}
                  onChange={e => setOverrideScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Mandatory Administrative Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  placeholder="State the regulatory or safety justification for overriding the AI priority..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverridingComplaint(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOverriding}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
                >
                  {isOverriding ? 'Saving...' : 'Confirm Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
