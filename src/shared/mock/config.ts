/**
 * Central mock vs live API registry.
 *
 * Auth is NEVER mocked in app runtime — always call the real Auth API
 * (`/api/v1/auth/*`, see docs/API/Auth.md). E2E may still intercept via Playwright
 * routes under `e2e/` only.
 *
 * Add other domains to LIVE_API_DOMAINS when they start calling the real API.
 * Candidate rubrics (`/api/v1/interview/practice/rubrics/*`) always call the live API.
 * B2C practice sessions (`practice` domain) call live Interview Practice APIs when listed below.
 *
 * Under Playwright (`navigator.webdriver`), `practice` stays on in-app mocks so journey
 * specs can run without a gateway. Other live domains (e.g. cv-analysis) keep HTTP
 * so E2E route stubs continue to work.
 */
export type MockDataDomain =
  | 'practice'
  | 'cv-analysis'
  | 'profile'
  | 'enterprise'
  | 'payment'
  | 'admin';

/** Domains wired to the real gateway today (auth is always live — not listed here). */
export const LIVE_API_DOMAINS: readonly MockDataDomain[] = ['cv-analysis', 'practice', 'payment'];

export function isPlaywrightRuntime(): boolean {
  return typeof navigator !== 'undefined' && navigator.webdriver === true;
}

export function usesMockData(domain: MockDataDomain): boolean {
  if ((domain === 'practice' || domain === 'payment') && isPlaywrightRuntime()) {
    return true;
  }
  return !LIVE_API_DOMAINS.includes(domain);
}
