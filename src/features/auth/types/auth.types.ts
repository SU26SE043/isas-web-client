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

// 1. Chuyển đổi Enum thành Object as const
export const UserRole = {
  ADMIN: 'admin',
  HR: 'hr',
  INTERVIEWER: 'interviewer',
  CANDIDATE: 'Candidate', // Chú ý: C viết hoa theo như bạn nói
  GUEST: 'guest'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const Permission = {
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',

  // CV Analysis
  ANALYZE_CV: 'analyze_cv',
  VIEW_CV_RESULTS: 'view_cv_results',
  MANAGE_CV_TEMPLATES: 'manage_cv_templates',

  // Interview
  CONDUCT_INTERVIEW: 'conduct_interview',
  VIEW_INTERVIEW_RESULTS: 'view_interview_results',
  MANAGE_INTERVIEW_QUESTIONS: 'manage_interview_questions',

  // Dashboard & Reports
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',

  // System
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs'
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];

export interface User {
  id: string;
  fullName: string;
  email: string;
  location: string;
  title: string;
  role: UserRoleType;
  permissions: PermissionType[];
  createdAt: string;
}