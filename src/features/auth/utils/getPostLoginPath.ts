import { UserRole, type UserRoleType } from '../types/auth.types';

const HOME_BY_ROLE: Record<Exclude<UserRoleType, typeof UserRole.GUEST>, string> = {
  [UserRole.CANDIDATE]: '/candidate/dashboard',
  [UserRole.ORG_ADMIN]: '/employer/dashboard',
  [UserRole.HR_MEMBER]: '/employer/dashboard',
  [UserRole.ADMIN]: '/admin',
  [UserRole.NO_ROLE]: '/access-denied',
};

/** Account / profile destination for shared chrome (avatar menu, marketing header). */
const PROFILE_BY_ROLE: Record<Exclude<UserRoleType, typeof UserRole.GUEST>, string> = {
  [UserRole.CANDIDATE]: '/candidate/profile',
  [UserRole.ORG_ADMIN]: '/employer/settings',
  [UserRole.HR_MEMBER]: '/employer/settings',
  [UserRole.ADMIN]: '/admin/settings',
  [UserRole.NO_ROLE]: '/access-denied',
};

/** Path prefixes each role may land on after login (deep-link restore). */
const ALLOWED_PREFIXES_BY_ROLE: Record<Exclude<UserRoleType, typeof UserRole.GUEST>, string[]> = {
  [UserRole.CANDIDATE]: [
    '/candidate',
    '/practice',
    '/interview',
    '/cv-analysis',
    '/profile',
    '/invite',
    '/invitations',
  ],
  [UserRole.ORG_ADMIN]: ['/employer', '/enterprise'],
  [UserRole.HR_MEMBER]: ['/employer', '/enterprise'],
  [UserRole.ADMIN]: ['/admin', '/employer', '/enterprise'],
  [UserRole.NO_ROLE]: [],
};

export function getPostLoginPath(role: UserRoleType): string {
  if (role === UserRole.GUEST) {
    return '/login';
  }
  return HOME_BY_ROLE[role] ?? '/access-denied';
}

/** Role-aware profile/settings home — never defaults OrgAdmin/HrMember/Admin to Candidate. */
export function getProfileHomePath(role: UserRoleType): string {
  if (role === UserRole.GUEST) {
    return '/login';
  }
  return PROFILE_BY_ROLE[role] ?? '/access-denied';
}

export function isPathAllowedForRole(role: UserRoleType, pathname: string | null | undefined): boolean {
  if (!pathname || role === UserRole.GUEST) return false;
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return false;

  const blockedPrefixes = ['/login', '/register', '/mfa', '/verify-email', '/forgot-password', '/reset-password', '/session-expired', '/account-locked', '/access-denied'];
  if (blockedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }

  return (ALLOWED_PREFIXES_BY_ROLE[role] ?? []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Prefer a safe deep-link only when it matches the authenticated role.
 * Never fall back to Candidate for OrgAdmin / HrMember / Admin.
 */
export function resolvePostLoginPath(
  role: UserRoleType,
  requestedPath?: string | null,
): string {
  if (requestedPath && isPathAllowedForRole(role, requestedPath)) {
    return requestedPath;
  }
  return getPostLoginPath(role);
}
