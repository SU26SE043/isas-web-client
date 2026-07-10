/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? ''),
  MODE: z.enum(['development', 'production', 'test']),
  DEV: z.boolean(),
  PROD: z.boolean(),
});

describe('env schema', () => {
  it('accepts empty API base URL for local dev', () => {
    const parsed = envSchema.parse({
      VITE_API_BASE_URL: undefined,
      MODE: 'development',
      DEV: true,
      PROD: false,
    });

    expect(parsed.VITE_API_BASE_URL).toBe('');
  });

  it('trims API base URL', () => {
    const parsed = envSchema.parse({
      VITE_API_BASE_URL: '  https://gateway.example.com  ',
      MODE: 'production',
      DEV: false,
      PROD: true,
    });

    expect(parsed.VITE_API_BASE_URL).toBe('https://gateway.example.com');
  });

  it('rejects invalid mode', () => {
    expect(() =>
      envSchema.parse({
        VITE_API_BASE_URL: '',
        MODE: 'staging',
        DEV: true,
        PROD: false,
      })
    ).toThrow();
  });
});
