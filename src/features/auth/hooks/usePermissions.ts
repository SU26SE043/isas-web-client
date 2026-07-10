import { useAuth } from './useAuth';
import { UserRole, type UserRoleType } from '../types/auth.types';

export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role: UserRoleType): boolean => user?.role === role;

  const hasAnyRole = (roles: UserRoleType[]): boolean =>
    user ? roles.includes(user.role) : false;

  const isGuest = (): boolean => !user;
  const isCandidate = (): boolean => hasRole(UserRole.CANDIDATE);
  const isHR = (): boolean => hasRole(UserRole.HR);
  const isOrganize = (): boolean => hasRole(UserRole.ORGANIZE);
  const isAdmin = (): boolean => hasRole(UserRole.ADMIN);

  /** B2B tenant roles (HR + Organize) */
  const isB2B = (): boolean => isHR() || isOrganize();

  return {
    hasRole,
    hasAnyRole,
    isGuest,
    isCandidate,
    isHR,
    isOrganize,
    isAdmin,
    isB2B,
    userRole: user?.role ?? null,
  };
};

/** @alias useRole */
export const usePermissions = useRole;
