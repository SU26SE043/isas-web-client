/**
 * Business roles (authenticated users).
 * Canonical Auth Identity values only — no legacy role strings.
 *
 * ```
 * Candidate | OrgAdmin | HrMember | Admin
 * ```
 *
 * Guest is client-only (unauthenticated) — never returned by `/me`.
 */
import { pickAuthString, unwrapAuthPayload } from '@/shared/api/authPayload';

export { parseAuthTokens, unwrapAuthPayload } from '@/shared/api/authPayload';
export type { AuthTokensResponse } from '@/shared/api/authPayload';

export const UserRole = {
  GUEST: 'guest',
  CANDIDATE: 'Candidate',
  ORG_ADMIN: 'OrgAdmin',
  HR_MEMBER: 'HrMember',
  ADMIN: 'Admin',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/** Authenticated business roles (excludes Guest). */
export const AUTHENTICATED_ROLES: UserRoleType[] = [
  UserRole.CANDIDATE,
  UserRole.ORG_ADMIN,
  UserRole.HR_MEMBER,
  UserRole.ADMIN,
];

/** Org-scoped B2B roles (recruitment tenant). */
export const ORG_ROLES: UserRoleType[] = [UserRole.ORG_ADMIN, UserRole.HR_MEMBER];

/** Can manage org settings, billing, and HR member accounts. */
export const ORG_ADMIN_ROLES: UserRoleType[] = [UserRole.ORG_ADMIN, UserRole.ADMIN];

/** Exact Identity role names only (case-insensitive). */
const CANONICAL_ROLES: Record<string, UserRoleType> = {
  guest: UserRole.GUEST,
  candidate: UserRole.CANDIDATE,
  orgadmin: UserRole.ORG_ADMIN,
  hrmember: UserRole.HR_MEMBER,
  admin: UserRole.ADMIN,
};

export function normalizeUserRole(role: string | null | undefined): UserRoleType | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase().replace(/[\s_-]/g, '');
  return CANONICAL_ROLES[normalized] ?? null;
}

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

export interface RegisterResponse {
  id: string;
  email: string;
}

/** Normalize register payload from Auth API (plain object, ApiResponse wrapper, or legacy string). */
export function parseRegisterResponse(data: unknown, fallbackEmail: string): RegisterResponse {
  if (typeof data === 'string') {
    const match = data.match(/User ID:\s*(\S+)/i);
    return { id: match?.[1] ?? '', email: fallbackEmail };
  }

  const inner = unwrapAuthPayload<Record<string, unknown>>(data);
  if (inner && typeof inner === 'object') {
    return {
      id: String(inner.id ?? ''),
      email: String(inner.email ?? fallbackEmail),
    };
  }

  return { id: '', email: fallbackEmail };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface MfaVerifyRequest {
  mfaToken: string;
  code: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  location: string;
  title: string;
  role: UserRoleType;
  createdAt: string;
}

export function parseUser(raw: unknown): User {
  const inner = unwrapAuthPayload<Record<string, unknown>>(raw);
  if (!inner || typeof inner !== 'object') {
    throw new Error('Invalid user payload from API');
  }

  const role = normalizeUserRole(pickAuthString(inner, 'role', 'Role') ?? String(inner.role ?? ''));
  if (!role || role === UserRole.GUEST) {
    throw new Error(`Invalid user role from API: ${String(inner.role ?? inner.Role)}`);
  }

  const createdAtRaw = inner.createdAt ?? inner.CreatedAt;

  return {
    id: pickAuthString(inner, 'id', 'Id') ?? String(inner.id ?? ''),
    fullName: pickAuthString(inner, 'fullName', 'FullName') ?? '',
    email: pickAuthString(inner, 'email', 'Email') ?? '',
    location: pickAuthString(inner, 'location', 'Location') ?? '',
    title: pickAuthString(inner, 'title', 'Title') ?? '',
    role,
    createdAt:
      typeof createdAtRaw === 'string'
        ? createdAtRaw
        : createdAtRaw != null
          ? String(createdAtRaw)
          : '',
  };
}
