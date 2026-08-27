import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? ''),
  VITE_ENABLE_ENTERPRISE_SSO: z
    .string()
    .trim()
    .optional()
    .transform((value) => value === 'true' || value === '1'),
  VITE_SENTRY_DSN: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? ''),
  VITE_PHOTON_API_URL: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? ''),
  MODE: z.enum(['development', 'production', 'test']),
  DEV: z.boolean(),
  PROD: z.boolean(),
});

function parseEnv() {
  const result = envSchema.safeParse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_ENABLE_ENTERPRISE_SSO: import.meta.env.VITE_ENABLE_ENTERPRISE_SSO,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_PHOTON_API_URL: import.meta.env.VITE_PHOTON_API_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return result.data;
}

export const env = parseEnv();

/**
 * Gateway origin only (no path). Endpoint modules already include `/api/v1/...`.
 * Strips accidental trailing `/api` or `/api/v1` so URLs never become `/api/api/v1/...`.
 */
export function normalizeApiBaseUrl(value: string | undefined | null): string {
  const raw = (value ?? '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  return raw.replace(/\/api(?:\/v1)?$/i, '');
}

export function getApiBaseUrl(): string {
  return normalizeApiBaseUrl(env.VITE_API_BASE_URL);
}

export function isDevEnvironment(): boolean {
  return env.DEV;
}

/** Enterprise SAML/OIDC SSO — gated per tenant; enable via VITE_ENABLE_ENTERPRISE_SSO=true */
export function isEnterpriseSsoEnabled(): boolean {
  return env.VITE_ENABLE_ENTERPRISE_SSO;
}

export function getPhotonApiUrl(): string {
  const configured = env.VITE_PHOTON_API_URL.trim();
  return configured || 'https://photon.komoot.io/api/';
}
