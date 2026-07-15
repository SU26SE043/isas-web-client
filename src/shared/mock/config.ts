/**
 * Central mock vs live API registry.
 *
 * Auth is NEVER mocked in app runtime — always call the real Auth API
 * (`/api/v1/auth/*`, see docs/API/Auth.md). E2E may still intercept via Playwright
 * routes under `e2e/` only.
 *
 * Add other domains to LIVE_API_DOMAINS when they start calling the real API.
 */
export type MockDataDomain =
  | 'practice'
  | 'cv-analysis'
  | 'profile'
  | 'enterprise'
  | 'payment'
  | 'admin';

/** Domains wired to the real gateway today (auth is always live — not listed here). */
export const LIVE_API_DOMAINS: readonly MockDataDomain[] = [];

export function usesMockData(domain: MockDataDomain): boolean {
  return !LIVE_API_DOMAINS.includes(domain);
}
