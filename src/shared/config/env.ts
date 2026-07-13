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
  MODE: z.enum(['development', 'production', 'test']),
  DEV: z.boolean(),
  PROD: z.boolean(),
});

function parseEnv() {
  const result = envSchema.safeParse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_ENABLE_ENTERPRISE_SSO: import.meta.env.VITE_ENABLE_ENTERPRISE_SSO,
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

export function getApiBaseUrl(): string {
  return env.VITE_API_BASE_URL;
}

export function isDevEnvironment(): boolean {
  return env.DEV;
}

/** Enterprise SAML/OIDC SSO — gated per tenant; enable via VITE_ENABLE_ENTERPRISE_SSO=true */
export function isEnterpriseSsoEnabled(): boolean {
  return env.VITE_ENABLE_ENTERPRISE_SSO;
}
