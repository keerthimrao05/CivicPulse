import React, { useState } from 'react';
import { Complaint, IssueStatus } from '../types/index.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  ThumbsUp,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Sparkles,
  ArrowRight,
  Send,
  Loader2
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_STEPS: IssueStatus[] = [
  'REPORTED',
  'UNDER REVIEW',
  'VERIFIED',
  'ASSIGNED',
  'IN PROGRESS',
  'RESOLVED',
  'CLOSED'
];

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdate
}) => {
  const { user, role } = useAuth();

  const [isSupporting, setIsSupporting] = useState(false);
  const [showReopenInput, setShowReopenInput] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmittingReopen, setIsSubmittingReopen] = useState(false);

  if (!isOpen || !complaint) return null;

  const handleSupport = async () => {
    setIsSupporting(true);
    try {
      await api.supportComplaint(complaint.id, user?.id);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSupporting(false);
    }
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setIsSubmittingReopen(true);
    try {
      await api.reopenComplaint(complaint.id, {
        reason: reopenReason,
        citizenName: user?.name,
        citizenId: user?.id
      });
      setShowReopenInput(false);
      setReopenReason('');
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReopen(false);
    }
  };

  const currentStepIndex = STATUS_STEPS.indexOf(complaint.status);
  const isUserSupported = complaint.supportedByUserIds.includes(user?.id || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
              {complaint.complaintNumber}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                complaint.priority === 'Critical'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  : complaint.priority === 'High'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              {complaint.priority} Priority ({complaint.priorityScore}/100)
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{complaint.category}</span>
              <span aria-hidden="true">·</span>
              <span>Reported {new Date(complaint.createdAt).toLocaleDateString()}</span>
              <span aria-hidden="true">·</span>
              <span>By {complaint.citizenName}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {complaint.title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Location details */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{complaint.location.address}</p>
              {complaint.location.landmark && (
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Landmark: {complaint.location.landmark}</p>
              )}
              <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                GPS: {complaint.location.latitude.toFixed(4)}° N, {complaint.location.longitude.toFixed(4)}° E
              </p>
            </div>
          </div>

          {/* Photo Gallery (Before & After Resolution) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Photographic Evidence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original Before Photo */}
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 relative">
                <img
                  src={complaint.images[0] || '/src/assets/images/issue_pothole_detection_1794055372612.jpg'}
                  alt="Original civic defect"
                  referrerPolicy="no-referrer"
                  className="h-48 w-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[11px] font-semibold backdrop-blur-sm">
                  BEFORE (Reported Incident)
                </div>
              </div>

              {/* After Resolution Photo if verified */}
              {complaint.resolution ? (
                <div className="rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-slate-950 relative">
                  <img
                    src={complaint.resolution.afterImageUrl}
                    alt="Resolved site"
                    referrerPolicy="no-referrer"
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-700 text-white text-[11px] font-semibold backdrop-blur-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>AFTER (Remediated Site)</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center text-xs text-slate-400">
                  <Clock className="w-6 h-6 mb-2 text-slate-400" />
                  <span>Resolution audit pending</span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Department officer will upload post-repair photo upon completion.
                  </span>
                </div>
              )}
            </div>

            {/* Resolution Verification AI Box */}
            {complaint.resolution && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>AI Resolution Verification: {complaint.resolution.status}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {complaint.resolution.confidenceScore}% Visual Match
                  </span>
                </div>
                <p className="text-emerald-800 dark:text-emerald-300 leading-snug">
                  {complaint.resolution.verificationNotes}
                </p>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400 pt-1">
                  Verified by: <strong>{complaint.resolution.verifiedBy}</strong> on{' '}
                  {new Date(complaint.resolution.submittedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Lifecycle Progress Bar */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Resolution Lifecycle Pipeline
            </h3>
            <div className="flex items-center justify-between overflow-x-auto pb-2 text-[11px]">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = complaint.status === step;

                return (
                  <div key={step} className="flex items-center flex-1 min-w-[70px]">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPassed && !isCurrent ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`mt-1 font-medium text-center whitespace-nowrap text-[10px] ${
                          isCurrent
                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                            : isPassed
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-1 ${
                          currentStepIndex > idx ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department & Officer Assignment Box */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Assigned Department:</span>
              <p className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{complaint.assignedDepartmentName || 'Pending Department Routing'}</span>
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Inspecting Officer:</span>
              <p className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{complaint.assignedOfficerName || 'Under Triage Assignment'}</span>
              </p>
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Official Audit Trail & Action History
            </h3>
            <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-4 space-y-4 text-xs">
              {complaint.history.map(item => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.changedByName}
                    </span>
                    <span className="font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {item.previousStatus}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.newStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-snug">
                    {item.comments}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Reopen Complaint Drawer */}
          {complaint.status === 'RESOLVED' && (
            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  Dissatisfied with the resolution?
                </span>
                <button
                  type="button"
                  onClick={() => setShowReopenInput(!showReopenInput)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reopen Complaint</span>
                </button>
              </div>

              {showReopenInput && (
                <form onSubmit={handleReopen} className="mt-2 space-y-2 pt-2 border-t border-amber-200 dark:border-amber-900">
                  <label className="block text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                    Explain why the issue is not satisfactorily fixed (required for administrator audit):
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={reopenReason}
                    onChange={e => setReopenReason(e.target.value)}
                    placeholder="e.g., Pothole filled with loose rubble without bitumen, already breaking down again..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReopen}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      {isSubmittingReopen ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>Submit Reopen Request</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Action Footer: Endorsement & Close */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSupport}
                disabled={isSupporting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isUserSupported
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{isUserSupported ? 'Supported' : 'Support Issue'}</span>
                <span className="font-mono text-[11px] ml-1 px-1.5 py-0.2 rounded bg-black/20">
                  {complaint.supportCount}
                </span>
              </button>
              <span className="text-[11px] text-slate-400">
                Endorsements automatically increase the municipal priority score.
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
