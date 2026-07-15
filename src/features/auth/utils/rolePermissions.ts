import { UserRole, type UserRoleType } from '../types/auth.types';

export const roleTranslationKeys: Record<UserRoleType, string> = {
  [UserRole.GUEST]: 'role.guest',
  [UserRole.CANDIDATE]: 'role.candidate',
  [UserRole.ORG_ADMIN]: 'role.orgAdmin',
  [UserRole.HR_MEMBER]: 'role.hrMember',
  [UserRole.ADMIN]: 'role.admin',
};

export const getRoleTranslationKey = (role: UserRoleType): string => roleTranslationKeys[role];

export const getRoleColor = (role: UserRoleType): string => {
  const roleColors: Record<UserRoleType, string> = {
    [UserRole.GUEST]: 'bg-surface-overlay text-muted-foreground',
    [UserRole.CANDIDATE]: 'bg-warning-bg text-warning',
    [UserRole.HR_MEMBER]: 'bg-info-bg text-info',
    [UserRole.ORG_ADMIN]: 'bg-success-bg text-success',
    [UserRole.ADMIN]: 'bg-error-bg text-error',
  };
  return roleColors[role];
};
