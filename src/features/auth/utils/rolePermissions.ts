import { UserRole, type UserRoleType } from '../types/auth.types';

export const getRoleDisplayName = (role: UserRoleType): string => {
  const roleNames: Record<UserRoleType, string> = {
    [UserRole.GUEST]: 'Khách',
    [UserRole.CANDIDATE]: 'Ứng viên',
    [UserRole.HR]: 'Nhân sự',
    [UserRole.ORGANIZE]: 'Quản trị tổ chức',
    [UserRole.ADMIN]: 'Quản trị viên',
  };
  return roleNames[role];
};

export const getRoleColor = (role: UserRoleType): string => {
  const roleColors: Record<UserRoleType, string> = {
    [UserRole.GUEST]: 'bg-surface-overlay text-muted-foreground',
    [UserRole.CANDIDATE]: 'bg-warning-bg text-warning',
    [UserRole.HR]: 'bg-info-bg text-info',
    [UserRole.ORGANIZE]: 'bg-success-bg text-success',
    [UserRole.ADMIN]: 'bg-error-bg text-error',
  };
  return roleColors[role];
};
