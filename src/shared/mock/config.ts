/**
 * Central mock vs live API registry.
 *
 * Add a domain to LIVE_API_DOMAINS when the frontend starts calling the real API.
 * Everything else keeps returning fixtures until you flip it here.
 */
export type MockDataDomain =
  | 'auth'
  | 'practice'
  | 'cv-analysis'
  | 'profile'
  | 'enterprise'
  | 'payment'
  | 'admin';

/** Domains wired to the real gateway today. */
export const LIVE_API_DOMAINS: readonly MockDataDomain[] = ['auth'];

export function usesMockData(domain: MockDataDomain): boolean {
  return !LIVE_API_DOMAINS.includes(domain);
}
