import {
  Complaint,
  Department,
  Officer,
  NotificationItem,
  AIAnalysisResult,
  PriorityBreakdown,
  DuplicateCheckResult,
  HotspotCluster,
  DashboardStats,
  User
} from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email?: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; phone?: string; address?: string; city?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  // Complaints
  async getComplaints(params?: {
    category?: string;
    status?: string;
    priority?: string;
    search?: string;
    citizenId?: string;
    departmentId?: string;
    officerId?: string;
  }): Promise<{ complaints: Complaint[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'All') query.append(k, v);
      });
    }
    const res = await fetch(`${API_BASE}/complaints?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },

  async getComplaint(id: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}`);
    if (!res.ok) throw new Error('Complaint not found');
    return res.json();
  },

  async createComplaint(data: {
    title: string;
    description: string;
    category: string;
    images: string[];
    location: {
      address: string;
      city: string;
      latitude: number;
      longitude: number;
      landmark?: string;
    };
    citizenId?: string;
    citizenName?: string;
    citizenPhone?: string;
    aiAnalysis?: AIAnalysisResult;
  }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit complaint');
    }
    return res.json();
  },

  async updateComplaintStatus(
    id: string,
    data: {
      status: string;
      changedBy?: string;
      changedByName?: string;
      comments?: string;
      afterImageUrl?: string;
    }
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async supportComplaint(id: string, userId?: string): Promise<{
    id: string;
    supportCount: number;
    priorityScore: number;
    priority: string;
    supportedByUserIds: string[];
  }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to support complaint');
    return res.json();
  },

  async reopenComplaint(id: string, data: { reason: string; citizenName?: string; citizenId?: string }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/reopen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to reopen complaint');
    return res.json();
  },

  // Admin
  async assignComplaint(data: {
    complaintId: string;
    departmentId: string;
    officerId: string;
    adminNotes?: string;
  }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/admin/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to assign complaint');
    return res.json();
  },

  async overridePriority(
    id: string,
    data: { priority: string; score: number; overrideReason: string; officerName?: string }
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}/priority`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to override priority');
    return res.json();
  },

  async getAdminStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/admin/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch admin dashboard stats');
    return res.json();
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  async getDepartmentOfficers(deptId: string): Promise<Officer[]> {
    const res = await fetch(`${API_BASE}/departments/${deptId}/officers`);
    if (!res.ok) throw new Error('Failed to fetch department officers');
    return res.json();
  },

  // Locations & Hotspots
  async getNearbyComplaints(lat: number, lng: number, radiusMeters = 5000, category?: string): Promise<Complaint[]> {
    const query = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radiusMeters: String(radiusMeters)
    });
    if (category && category !== 'All') query.append('category', category);
    const res = await fetch(`${API_BASE}/locations/nearby?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch nearby complaints');
    return res.json();
  },

  async getHotspots(): Promise<HotspotCluster[]> {
    const res = await fetch(`${API_BASE}/locations/hotspots`);
    if (!res.ok) throw new Error('Failed to fetch hotspots');
    return res.json();
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const query = userId ? `?userId=${userId}` : '';
    const res = await fetch(`${API_BASE}/notifications${query}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, { method: 'PUT' });
  },

  // AI Services
  async analyzeImage(imageBase64: string, userHint?: string): Promise<AIAnalysisResult & { source?: string }> {
    const res = await fetch(`${API_BASE}/ai/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, userHint })
    });
    if (!res.ok) throw new Error('Failed to analyze image with AI');
    return res.json();
  },

  async detectDuplicates(data: {
    latitude: number;
    longitude: number;
    category: string;
    title?: string;
    description?: string;
  }): Promise<DuplicateCheckResult> {
    const res = await fetch(`${API_BASE}/ai/detect-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Duplicate check failed');
    return res.json();
  },

  async predictPriority(data: {
    category: string;
    title: string;
    description: string;
    safetyRisk?: string;
    populationDensity?: string;
    supportCount?: number;
  }): Promise<PriorityBreakdown> {
    const res = await fetch(`${API_BASE}/ai/predict-priority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to predict priority');
    return res.json();
  },

  async voiceDraft(speechText: string, language = 'en'): Promise<{
    title: string;
    description: string;
    category: string;
    suggestedSeverity: string;
    extractedLandmarks: string;
    missingInformationPrompt: string;
  }> {
    const res = await fetch(`${API_BASE}/ai/voice-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speechText, language })
    });
    if (!res.ok) throw new Error('Voice draft processing failed');
    return res.json();
  },

  async verifyResolution(data: {
    beforeImageBase64: string;
    afterImageBase64: string;
    complaintTitle?: string;
  }): Promise<{
    status: 'Improvement Detected' | 'No Clear Improvement' | 'Unable to Verify';
    confidenceScore: number;
    verificationNotes: string;
    humanConfirmationRequired: boolean;
  }> {
    const res = await fetch(`${API_BASE}/ai/verify-resolution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Resolution verification failed');
    return res.json();
  }
};
