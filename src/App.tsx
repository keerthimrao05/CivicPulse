/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { CitizenDashboard } from './components/CitizenDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { DepartmentDashboard } from './components/DepartmentDashboard.tsx';
import { HotspotAnalytics } from './components/HotspotAnalytics.tsx';
import { ReportIssueModal } from './components/ReportIssueModal.tsx';
import { ComplaintDetailModal } from './components/ComplaintDetailModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { Complaint } from './types/index.ts';

function MainApp() {
  const { role } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleComplaintUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'landing' && (
          <LandingPage
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onExplore={() => setCurrentTab('citizen')}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'citizen' && (
          <CitizenDashboard
            key={`cit-${refreshTrigger}`}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSelectComplaint={comp => setSelectedComplaint(comp)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            key={`adm-${refreshTrigger}`}
            onSelectComplaint={comp => setSelectedComplaint(comp)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {currentTab === 'department' && (
          <DepartmentDashboard
            key={`dept-${refreshTrigger}`}
            onSelectComplaint={comp => setSelectedComplaint(comp)}
          />
        )}

        {currentTab === 'analytics' && <HotspotAnalytics key={`hot-${refreshTrigger}`} />}
      </main>

      {/* Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          handleComplaintUpdated();
        }}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        onUpdate={() => {
          handleComplaintUpdated();
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
