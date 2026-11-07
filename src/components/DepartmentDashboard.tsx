import React, { useState, useEffect, useRef } from 'react';
import { Complaint, IssueStatus } from '../types/index.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  UploadCloud,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Loader2,
  X
} from 'lucide-react';

interface DepartmentDashboardProps {
  onSelectComplaint: (complaint: Complaint) => void;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  onSelectComplaint
}) => {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<'assigned' | 'in_progress' | 'resolved'>('assigned');

  // Resolving Work Order State
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isVerifyingWithAI, setIsVerifyingWithAI] = useState(false);
  const [aiVerificationResult, setAiVerificationResult] = useState<{
    status: 'Improvement Detected' | 'No Clear Improvement' | 'Unable to Verify';
    confidenceScore: number;
    verificationNotes: string;
  } | null>(null);
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const res = await api.getComplaints({
        departmentId: user?.departmentId || 'dept-road'
      });
      setComplaints(res.complaints);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Status transition (e.g. from ASSIGNED to IN PROGRESS)
  const handleMarkInProgress = async (complaint: Complaint) => {
    try {
      await api.updateComplaintStatus(complaint.id, {
        status: 'IN PROGRESS',
        changedBy: user?.id,
        changedByName: user?.name,
        comments: 'Field crew arrived on site with equipment and safety perimeter.'
      });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Upload After Photo
  const handleAfterPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = reader.result as string;
      setAfterImage(b64);
      runAIVerification(b64);
    };
    reader.readAsDataURL(file);
  };

  // Quick Preset After Photo for fast demonstration
  const handleUsePresetAfterPhoto = () => {
    const preset = '/src/assets/images/hero_smart_city_1794055371597.jpg';
    setAfterImage(preset);
    runAIVerification(preset);
  };

  const runAIVerification = async (afterB64: string) => {
    if (!resolvingComplaint) return;
    setIsVerifyingWithAI(true);
    try {
      const result = await api.verifyResolution({
        beforeImageBase64: resolvingComplaint.images[0] || '',
        afterImageBase64: afterB64,
        complaintTitle: resolvingComplaint.title
      });
      setAiVerificationResult(result);
      if (!resolutionNotes) {
        setResolutionNotes(result.verificationNotes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyingWithAI(false);
    }
  };

  const handleCompleteResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint || !afterImage) return;

    setIsSubmittingResolution(true);
    try {
      await api.updateComplaintStatus(resolvingComplaint.id, {
        status: 'RESOLVED',
        changedBy: user?.id,
        changedByName: user?.name,
        comments: resolutionNotes || 'Repairs completed and validated via image verification.',
        afterImageUrl: afterImage
      });

      setResolvingComplaint(null);
      setAfterImage(null);
      setAiVerificationResult(null);
      setResolutionNotes('');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const assignedTasks = complaints.filter(c => c.status === 'ASSIGNED');
  const inProgressTasks = complaints.filter(c => c.status === 'IN PROGRESS');
  const resolvedTasks = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');

  return (
    <div className="space-y-6">
      {/* Department Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Department Operations Unit
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">
              {user?.departmentName || 'Road Infrastructure & Maintenance'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Officer Field Queue: {user?.name || 'Sarah Jenkins'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Field work orders, dispatch staging, and AI photographic resolution verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {inProgressTasks.length} Active Field Works
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-3.5 py-1.5 font-semibold rounded-lg transition-colors ${
            activeTab === 'assigned'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Assigned Tasks ({assignedTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-3.5 py-1.5 font-semibold rounded-lg transition-colors ${
            activeTab === 'in_progress'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          In Progress ({inProgressTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-3.5 py-1.5 font-semibold rounded-lg transition-colors ${
            activeTab === 'resolved'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Resolved Archive ({resolvedTasks.length})
        </button>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'assigned'
          ? assignedTasks
          : activeTab === 'in_progress'
          ? inProgressTasks
          : resolvedTasks
        ).map(task => (
          <div
            key={task.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {task.complaintNumber}
                  </span>
                  <span>·</span>
                  <span>{task.category}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {task.title}
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                  task.priority === 'Critical'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                }`}
              >
                {task.priority} ({task.priorityScore}/100)
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              {task.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{task.location.address}</span>
            </div>

            {/* Photo preview */}
            <div className="rounded-xl overflow-hidden h-36 bg-slate-950 relative">
              <img
                src={task.images[0] || '/src/assets/images/issue_pothole_detection_1794055372612.jpg'}
                alt={task.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                Reported by {task.citizenName}
              </span>
            </div>

            {/* Actions Strip */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onSelectComplaint(task)}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                Audit Timeline
              </button>

              <div className="flex items-center gap-2">
                {task.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleMarkInProgress(task)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Begin Work (In Progress)</span>
                  </button>
                )}

                {task.status === 'IN PROGRESS' && (
                  <button
                    onClick={() => setResolvingComplaint(task)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Resolve</span>
                  </button>
                )}

                {task.status === 'RESOLVED' && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolved & Archived</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Verification Modal (Section 16) */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold">
                  Resolution Verification: {resolvingComplaint.complaintNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Upload an after-remediation photograph. AI compares with before-photo to audit improvement.
                </p>
              </div>
              <button
                onClick={() => setResolvingComplaint(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Before vs After Side-by-Side Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original Before */}
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 relative">
                <img
                  src={resolvingComplaint.images[0] || '/src/assets/images/issue_pothole_detection_1794055372612.jpg'}
                  alt="Original hazard"
                  referrerPolicy="no-referrer"
                  className="h-44 w-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-semibold">
                  BEFORE INCIDENT
                </span>
              </div>

              {/* After Photo Upload */}
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAfterPhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                {afterImage ? (
                  <div className="rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-slate-950 relative">
                    <img
                      src={afterImage}
                      alt="Remediated site"
                      referrerPolicy="no-referrer"
                      className="h-44 w-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-semibold">
                      AFTER PHOTO READY
                    </span>
                    <button
                      type="button"
                      onClick={() => setAfterImage(null)}
                      className="absolute top-2 right-2 p-1 bg-black/70 rounded text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-44 cursor-pointer border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 rounded-xl p-4 text-center bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col items-center justify-center transition-colors"
                  >
                    <UploadCloud className="w-6 h-6 text-emerald-600 mb-1" />
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Upload After-Repair Photo
                    </p>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleUsePresetAfterPhoto();
                      }}
                      className="mt-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 underline"
                    >
                      Or use sample fixed photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Verification Assessment */}
            {isVerifyingWithAI ? (
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center gap-3 text-xs text-blue-800 dark:text-blue-200">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Comparing before and after photos with computer vision model...</span>
              </div>
            ) : aiVerificationResult ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>AI Audit: {aiVerificationResult.status}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    {aiVerificationResult.confidenceScore}% Visual Clearance
                  </span>
                </div>
                <p className="text-emerald-800 dark:text-emerald-300 leading-snug">
                  {aiVerificationResult.verificationNotes}
                </p>
              </div>
            ) : null}

            {/* Officer Engineering Remarks */}
            <form onSubmit={handleCompleteResolution} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  Field Remediation Report & Materials Used <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Cleared 1.4 tons of debris, applied cold-mix bitumen compaction, restored traffic flow..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingComplaint(null)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!afterImage || isSubmittingResolution}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5"
                >
                  {isSubmittingResolution ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Sign Off & Resolve Complaint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
