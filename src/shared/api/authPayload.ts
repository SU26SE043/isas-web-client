/**
 * Auth.md types some responses as ApiResponse<T>; Isas.AuthService returns raw DTOs.
 * Accept both shapes so axios interceptors and authService stay aligned.
 *
 * Gateway JSON fields are camelCase (see docs/product/api-gateway.md). Prefer those
 * keys first; keep PascalCase fallbacks for resilience if a serializer emits them.
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
        'AccessToken' in record ||
        'refreshToken' in record ||
        'RefreshToken' in record ||
        'id' in record ||
        'Id' in record ||
        'email' in record ||
        'Email' in record ||
        'role' in record ||
        'Role' in record;
      if (!hasDtoKeys) {
        return inner as T;
      }
    }
  }
  return data as T;
}

/** First non-empty string among camelCase / PascalCase keys. */
export function pickAuthString(
  record: Record<string, unknown> | null | undefined,
  ...keys: string[]
): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

export function parseAuthTokens(data: unknown): AuthTokensResponse {
  const inner = unwrapAuthPayload<Record<string, unknown>>(data);
  if (!inner || typeof inner !== 'object') {
    return {};
  }

  const emailVerificationRequired =
    inner.emailVerificationRequired ?? inner.EmailVerificationRequired;
  const mfaRequired = inner.mfaRequired ?? inner.MfaRequired;

  return {
    accessToken: pickAuthString(inner, 'accessToken', 'AccessToken'),
    refreshToken: pickAuthString(inner, 'refreshToken', 'RefreshToken'),
    expiresAt: pickAuthString(inner, 'expiresAt', 'ExpiresAt'),
    emailVerificationRequired: Boolean(emailVerificationRequired),
    mfaRequired: Boolean(mfaRequired),
    mfaToken: pickAuthString(inner, 'mfaToken', 'MfaToken'),
  };
}
