import { UserRole } from '../types/auth.types';



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
    [UserRole.ADMIN]: 'bg-error-bg text-error',
    [UserRole.HR]: 'bg-info-bg text-info',
    [UserRole.INTERVIEWER]: 'bg-success-bg text-success',
    [UserRole.CANDIDATE]: 'bg-warning-bg text-warning',
    [UserRole.GUEST]: 'bg-surface-overlay text-muted-foreground',
  };
  return roleColors[role];
};


