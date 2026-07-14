/** BRD ROL-001 … ROL-005 — see BRD/User_Roles_and_Permissions.md */
import { unwrapAuthPayload } from '@/shared/api/authPayload';

export { parseAuthTokens, unwrapAuthPayload } from '@/shared/api/authPayload';
export type { AuthTokensResponse } from '@/shared/api/authPayload';

export const UserRole = {
  GUEST: 'guest',
  CANDIDATE: 'candidate',
  HR: 'hr',
  ORGANIZE: 'organize',
  ADMIN: 'admin',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/** Roles that require a logged-in session (excludes Guest). */
export const AUTHENTICATED_ROLES: UserRoleType[] = [
  UserRole.CANDIDATE,
  UserRole.HR,
  UserRole.ORGANIZE,
  UserRole.ADMIN,
];

const LEGACY_ROLE_ALIASES: Record<string, UserRoleType> = {
  guest: UserRole.GUEST,
  candidate: UserRole.CANDIDATE,
  Candidate: UserRole.CANDIDATE,
  hr: UserRole.HR,
  HR: UserRole.HR,
  organize: UserRole.ORGANIZE,
  Organize: UserRole.ORGANIZE,
  organization: UserRole.ORGANIZE,
  Organization: UserRole.ORGANIZE,
  admin: UserRole.ADMIN,
  Admin: UserRole.ADMIN,
  /** @deprecated BRD removed Interviewer — maps to HR */
  interviewer: UserRole.HR,
  Interviewer: UserRole.HR,
};

export function normalizeUserRole(role: string | null | undefined): UserRoleType | null {
  if (!role) return null;
  return LEGACY_ROLE_ALIASES[role] ?? null;
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

  const role = normalizeUserRole(
    typeof inner.role === 'string' ? inner.role : String(inner.role ?? ''),
  );
  if (!role || role === UserRole.GUEST) {
    throw new Error(`Invalid user role from API: ${String(inner.role)}`);
  }

  return {
    id: String(inner.id ?? ''),
    fullName: String(inner.fullName ?? ''),
    email: String(inner.email ?? ''),
    location: inner.location == null ? '' : String(inner.location),
    title: inner.title == null ? '' : String(inner.title),
    role,
    createdAt:
      typeof inner.createdAt === 'string'
        ? inner.createdAt
        : inner.createdAt != null
          ? String(inner.createdAt)
          : '',
  };
}
