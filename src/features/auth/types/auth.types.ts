export interface UpdateProfileRequest {
  fullName?: string;
  location?: string;
  title?: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  location: string;
  title: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  INTERVIEWER = 'interviewer',
  CANDIDATE = 'Candidate',
  GUEST = 'guest'
}

export enum Permission {
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',

  // CV Analysis
  ANALYZE_CV = 'analyze_cv',
  VIEW_CV_RESULTS = 'view_cv_results',
  MANAGE_CV_TEMPLATES = 'manage_cv_templates',

  // Interview
  CONDUCT_INTERVIEW = 'conduct_interview',
  VIEW_INTERVIEW_RESULTS = 'view_interview_results',
  MANAGE_INTERVIEW_QUESTIONS = 'manage_interview_questions',

  // Dashboard & Reports
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',

  // System
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs'
}
