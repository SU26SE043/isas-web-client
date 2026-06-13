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
    [UserRole.ADMIN]: 'bg-red-100 text-red-800',
    [UserRole.HR]: 'bg-blue-100 text-blue-800',
    [UserRole.INTERVIEWER]: 'bg-green-100 text-green-800',
    [UserRole.CANDIDATE]: 'bg-yellow-100 text-yellow-800',
    [UserRole.GUEST]: 'bg-gray-100 text-gray-800',
  };
  return roleColors[role];
};

 
