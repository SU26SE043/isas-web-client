import { useAuth } from './useAuth';
import { ORG_ADMIN_ROLES, ORG_ROLES, UserRole, type UserRoleType } from '../types/auth.types';

export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role: UserRoleType): boolean => user?.role === role;

  const hasAnyRole = (roles: UserRoleType[]): boolean =>
    user ? roles.includes(user.role) : false;

  const isGuest = (): boolean => !user;
  const isCandidate = (): boolean => hasRole(UserRole.CANDIDATE);
  const isHrMember = (): boolean => hasRole(UserRole.HR_MEMBER);
  const isOrgAdmin = (): boolean => hasRole(UserRole.ORG_ADMIN);
  const isAdmin = (): boolean => hasRole(UserRole.ADMIN);

  /** B2B org roles (HrMember + OrgAdmin). */
  const isB2B = (): boolean => hasAnyRole(ORG_ROLES);

  /** Org settings / billing / team management (OrgAdmin or platform Admin). */
  const canManageOrganization = (): boolean => hasAnyRole(ORG_ADMIN_ROLES);

  return {
    hasRole,
    hasAnyRole,
    isGuest,
    isCandidate,
    isHrMember,
    isOrgAdmin,
    isAdmin,
    isB2B,
    canManageOrganization,
    userRole: user?.role ?? null,
  };
};

/** @alias useRole */
export const usePermissions = useRole;
