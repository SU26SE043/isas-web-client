/**
 * Auth.md types some responses as ApiResponse<T>; Isas.AuthService returns raw DTOs.
 * Accept both shapes so axios interceptors and authService stay aligned.
 */

export interface AuthTokensResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  emailVerificationRequired?: boolean;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export function unwrapAuthPayload<T = unknown>(data: unknown): T {
  if (data && typeof data === 'object' && 'data' in data) {
    const record = data as Record<string, unknown>;
    const inner = record.data;
    if (
      inner !== undefined &&
      (typeof inner === 'object' ||
        typeof inner === 'string' ||
        typeof inner === 'number' ||
        typeof inner === 'boolean')
    ) {
      const hasDtoKeys =
        'accessToken' in record ||
        'refreshToken' in record ||
        'id' in record ||
        'email' in record ||
        'role' in record;
      if (!hasDtoKeys) {
        return inner as T;
      }
    }
  }
  return data as T;
}

export function parseAuthTokens(data: unknown): AuthTokensResponse {
  const inner = unwrapAuthPayload<Record<string, unknown>>(data);
  if (!inner || typeof inner !== 'object') {
    return {};
  }

  return {
    accessToken: typeof inner.accessToken === 'string' ? inner.accessToken : undefined,
    refreshToken: typeof inner.refreshToken === 'string' ? inner.refreshToken : undefined,
    expiresAt:
      typeof inner.expiresAt === 'string'
        ? inner.expiresAt
        : inner.expiresAt != null
          ? String(inner.expiresAt)
          : undefined,
    emailVerificationRequired: Boolean(inner.emailVerificationRequired),
    mfaRequired: Boolean(inner.mfaRequired),
    mfaToken: typeof inner.mfaToken === 'string' ? inner.mfaToken : undefined,
  };
}
