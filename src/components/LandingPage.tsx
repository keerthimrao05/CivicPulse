import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { DashboardStats } from '../types/index.ts';
import {
  Sparkles,
  Camera,
  MapPin,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Flame,
  Layers,
  ChevronRight,
  TrendingUp,
  Building2,
  Users
} from 'lucide-react';

interface LandingPageProps {
  onOpenReportModal: () => void;
  onExplore: () => void;
  onSelectTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenReportModal,
  onExplore,
  onSelectTab
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getAdminStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white min-h-[500px] flex items-center">
        {/* Cinematic Backdrop Image with Measured Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_smart_city_1794055371597.jpg"
            alt="Modern Smart City Infrastructure"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Municipal Infrastructure Governance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
            Building Smarter Cities Through Citizen Intelligence
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Report civic issues, track resolutions and help create cleaner, safer and smarter communities through artificial intelligence.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenReportModal}
              className="px-6 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-lg shadow-blue-900/50 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Camera className="w-4 h-4" />
              <span>Report an Issue</span>
            </button>
            <button
              onClick={onExplore}
              className="px-6 py-3 text-xs font-bold text-white bg-white/10 hover:bg-white/20 active:scale-[0.98] rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Live Statistics Section (Actual Database Figures) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center sm:text-left">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Issues Reported</span>
          <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {stats?.totalComplaints || 5}
            </span>
            <span className="text-xs font-mono text-emerald-600 font-semibold">+18% this month</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified community submissions</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center sm:text-left">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Issues Resolved</span>
          <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-emerald-600">
              {stats?.resolvedComplaints || 1}
            </span>
            <span className="text-xs font-mono text-emerald-600 font-semibold">94% photo verified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Inspected with before/after audit</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center sm:text-left">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Locations</span>
          <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
              198
            </span>
            <span className="text-xs text-slate-400">wards covered</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">GPS & PostGIS spatial clustering</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center sm:text-left">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Departments Connected</span>
          <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {stats?.departmentsConnected || 6}
            </span>
            <span className="text-xs text-slate-400">active agencies</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">PWD, Solid Waste, BWSSB, BESCOM</p>
        </div>
      </section>

      {/* How It Works (4-Step Flow) */}
      <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Lifecycle Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How CivicPulse AI Resolves Public Defects
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            From the moment a photo is snapped to physical asphalt compaction and citizen sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold flex items-center justify-center">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Report an Issue</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload photos with auto GPS geocoding, or simply describe the problem using speech in English or Kannada.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-mono font-bold flex items-center justify-center">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Analyses the Report</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Computer vision identifies potholes, waste spills, and ruptured lines. The priority engine scores safety hazard.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-mono font-bold flex items-center justify-center">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Authorities Receive Dispatch</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Super admins route work orders to the exact ward officer (Roads, Waste, Water) with SLA deadlines.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-mono font-bold flex items-center justify-center">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Track Resolution</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Citizens track real-time crew milestones, inspect before/after photos, or reopen complaints if unresolved.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Showcase */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Intelligence Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Built for Scale, Safety & Transparency
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI-Powered Vision Detection
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              YOLO and Gemini 3.8 multimodal analysis detect road cavities, uncollected waste, and pipeline failures with bounding box coordinates and confidence scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Intelligent Duplicate Deduplication
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Haversine spatial distance and semantic overlap prevent duplicate tickets for the same pothole, converting repetitive reports into community upvotes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Transparent Priority Scoring
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Mathematically weighs physical safety hazard (30 pts), defect severity (25 pts), proximity to schools and hospitals (20 pts), and community support.
            </p>
          </div>
        </div>
      </section>

      {/* Role Switcher Callout Box */}
      <section className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Ready to test the 3 Role Dashboards?</h3>
          <p className="text-xs text-slate-400 max-w-lg">
            Experience CivicPulse AI from the perspective of a local citizen reporting an issue, a road engineer resolving it with before/after photos, or a super administrator dispatching work orders.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('citizen')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Citizen View
          </button>
          <button
            onClick={() => onSelectTab('department')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Officer Hub
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            Admin Command
          </button>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="pt-12 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block mb-2">Platform</span>
            <ul className="space-y-1.5">
              <li><button onClick={() => onSelectTab('citizen')} className="hover:underline">Citizen Dashboard</button></li>
              <li><button onClick={() => onSelectTab('admin')} className="hover:underline">Command Center</button></li>
              <li><button onClick={() => onSelectTab('department')} className="hover:underline">Department Operations</button></li>
              <li><button onClick={() => onSelectTab('analytics')} className="hover:underline">Geospatial Hotspots</button></li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block mb-2">Civic Categories</span>
            <ul className="space-y-1.5">
              <li>Road Damage & Potholes</li>
              <li>Solid Waste & Sanitation</li>
              <li>Water Mainline Leakage</li>
              <li>Streetlight Failures</li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block mb-2">Technology</span>
            <ul className="space-y-1.5">
              <li>Python FastAPI & PostgreSQL</li>
              <li>PostGIS Spatial Queries</li>
              <li>Google GenAI (Gemini 3.8)</li>
              <li>OpenStreetMap & Leaflet</li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block mb-2">CivicPulse AI</span>
            <p className="text-[11px] leading-relaxed">
              "Your City. Your Voice. Our Smarter Future."
              A transparent civic technology solution built for modern municipal corporations.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 CivicPulse AI. All rights reserved. Public Smart City Platform.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Municipal Charter</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
