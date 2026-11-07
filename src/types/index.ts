export type UserRole = 'citizen' | 'officer' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
  city: string;
  departmentId?: string;
  departmentName?: string;
  avatar?: string;
  createdAt: string;
}

export type IssueCategory =
  | 'Road Damage'
  | 'Garbage Overflow'
  | 'Water Leakage'
  | 'Drainage Blockage'
  | 'Streetlight Failure'
  | 'Public Infrastructure Damage'
  | 'Water Stagnation'
  | 'Other Civic Issues';

export type IssuePriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type IssueStatus =
  | 'REPORTED'
  | 'UNDER REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REOPENED'
  | 'AWAITING INFORMATION';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface AIAnalysisResult {
  detectedIssue: string;
  category: IssueCategory;
  confidence: number; // 0 - 100
  suggestedSeverity: IssuePriority;
  explanation: string;
  safetyRisk: 'High' | 'Medium' | 'Low';
  estimatedAffectedPeople?: string;
  boundingBoxes?: BoundingBox[];
}

export interface PriorityBreakdown {
  score: number; // 0 - 100
  level: IssuePriority;
  factors: {
    safetyRiskScore: number;
    severityScore: number;
    populationDensityScore: number;
    durationUnresolvedScore: number;
    supportingReportsBonus: number;
  };
  reasoning: string;
}

export interface ResolutionVerification {
  beforeImageUrl: string;
  afterImageUrl: string;
  status: 'Improvement Detected' | 'No Clear Improvement' | 'Unable to Verify';
  confidenceScore: number;
  verificationNotes: string;
  submittedAt: string;
  verifiedBy?: string;
}

export interface StatusHistoryEntry {
  id: string;
  previousStatus: IssueStatus;
  newStatus: IssueStatus;
  changedBy: string;
  changedByName: string;
  timestamp: string;
  comments: string;
  supportingPhotoUrl?: string;
}

export interface Complaint {
  id: string;
  complaintNumber: string; // e.g. CP-2026-8941
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  priorityScore: number;
  priorityReasoning?: string;
  status: IssueStatus;
  images: string[];
  location: {
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    landmark?: string;
  };
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  aiAnalysis?: AIAnalysisResult;
  resolution?: ResolutionVerification;
  supportCount: number;
  supportedByUserIds: string[];
  history: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headName: string;
  contactEmail: string;
  contactPhone: string;
  totalAssigned: number;
  totalResolved: number;
  avgResolutionHours: number;
  officersCount: number;
}

export interface Officer {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  activeTasks: number;
  completedTasks: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  complaintId: string;
  title: string;
  message: string;
  type: 'status_change' | 'assignment' | 'verification' | 'duplicate_merged' | 'urgent';
  isRead: boolean;
  createdAt: string;
}

export interface DuplicateCheckResult {
  isDuplicateSuspected: boolean;
  similarityScore: number; // 0 - 100
  distanceMeters: number;
  existingComplaint?: Complaint;
  comparisonDetails: {
    categoryMatch: boolean;
    distanceMeters: number;
    descriptionSimilarity: number;
    visualSimilarity: number;
  };
}

export interface HotspotCluster {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  complaintCount: number;
  primaryCategory: IssueCategory;
  severityLevel: 'High' | 'Medium' | 'Low';
  openIssues: number;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  criticalComplaints: number;
  avgResolutionDays: number;
  citizenParticipationCount: number;
  departmentsConnected: number;
  categoryDistribution: { category: string; count: number; color: string }[];
  monthlyActivity: { month: string; reported: number; resolved: number }[];
  priorityDistribution: { priority: string; count: number }[];
  departmentPerformance: { department: string; assigned: number; resolved: number; rate: number }[];
}
