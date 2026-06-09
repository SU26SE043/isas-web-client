import { UserRole, Permission } from '../types/auth.types';

// Define default permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full access to everything
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.ANALYZE_CV,
    Permission.VIEW_CV_RESULTS,
    Permission.MANAGE_CV_TEMPLATES,
    Permission.CONDUCT_INTERVIEW,
    Permission.VIEW_INTERVIEW_RESULTS,
    Permission.MANAGE_INTERVIEW_QUESTIONS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
  ],

  [UserRole.HR]: [
    Permission.VIEW_USERS,
    Permission.ANALYZE_CV,
    Permission.VIEW_CV_RESULTS,
    Permission.MANAGE_CV_TEMPLATES,
    Permission.CONDUCT_INTERVIEW,
    Permission.VIEW_INTERVIEW_RESULTS,
    Permission.MANAGE_INTERVIEW_QUESTIONS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
  ],

  [UserRole.INTERVIEWER]: [
    Permission.ANALYZE_CV,
    Permission.VIEW_CV_RESULTS,
    Permission.CONDUCT_INTERVIEW,
    Permission.VIEW_INTERVIEW_RESULTS,
    Permission.VIEW_DASHBOARD,
  ],

  [UserRole.CANDIDATE]: [
    Permission.ANALYZE_CV,
    Permission.VIEW_CV_RESULTS,
    Permission.VIEW_DASHBOARD,
  ],

  [UserRole.GUEST]: [
    Permission.ANALYZE_CV,
  ],
};

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Quản trị viên',
    [UserRole.HR]: 'Nhân sự',
    [UserRole.INTERVIEWER]: 'Người phỏng vấn',
    [UserRole.CANDIDATE]: 'Ứng viên',
    [UserRole.GUEST]: 'Khách',
  };
  return roleNames[role];
};

// Get role color for UI
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-800',
    [UserRole.HR]: 'bg-blue-100 text-blue-800',
    [UserRole.INTERVIEWER]: 'bg-green-100 text-green-800',
    [UserRole.CANDIDATE]: 'bg-yellow-100 text-yellow-800',
    [UserRole.GUEST]: 'bg-gray-100 text-gray-800',
  };
  return roleColors[role];
};

// Get permission display name
export const getPermissionDisplayName = (permission: Permission): string => {
  const permissionNames: Record<Permission, string> = {
    [Permission.MANAGE_USERS]: 'Quản lý người dùng',
    [Permission.VIEW_USERS]: 'Xem danh sách người dùng',
    [Permission.ANALYZE_CV]: 'Phân tích CV',
    [Permission.VIEW_CV_RESULTS]: 'Xem kết quả phân tích CV',
    [Permission.MANAGE_CV_TEMPLATES]: 'Quản lý mẫu CV',
    [Permission.CONDUCT_INTERVIEW]: 'Thực hiện phỏng vấn',
    [Permission.VIEW_INTERVIEW_RESULTS]: 'Xem kết quả phỏng vấn',
    [Permission.MANAGE_INTERVIEW_QUESTIONS]: 'Quản lý câu hỏi phỏng vấn',
    [Permission.VIEW_DASHBOARD]: 'Xem bảng điều khiển',
    [Permission.VIEW_REPORTS]: 'Xem báo cáo',
    [Permission.EXPORT_DATA]: 'Xuất dữ liệu',
    [Permission.MANAGE_SETTINGS]: 'Quản lý cài đặt hệ thống',
    [Permission.VIEW_AUDIT_LOGS]: 'Xem nhật ký hệ thống',
  };
  return permissionNames[permission] || permission;
};