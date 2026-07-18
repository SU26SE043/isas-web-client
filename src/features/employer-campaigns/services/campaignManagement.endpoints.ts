/**
 * Campaign Management — public gateway paths (Employer).
 *
 * Final URL = `${VITE_API_BASE_URL}` + path below.
 * Spec:
 * - GET /api/v1/campaign — list campaigns for the caller's organization
 * - GET /api/v1/campaign/{id} — campaign detail
 */
const CAMPAIGN_API_PREFIX = '/api/v1/campaign';

export const campaignManagementEndpoints = {
  list: CAMPAIGN_API_PREFIX,
  detail: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}`,
} as const;
