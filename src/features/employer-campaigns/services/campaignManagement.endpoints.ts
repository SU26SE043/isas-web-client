/**
 * Campaign Management — public gateway paths (Employer).
 *
 * Final URL = `${VITE_API_BASE_URL}` + path below.
 */
const CAMPAIGN_API_PREFIX = '/api/v1/campaign';

export const campaignManagementEndpoints = {
  list: CAMPAIGN_API_PREFIX,
  create: CAMPAIGN_API_PREFIX,
  detail: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}`,
  publish: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/publish`,
  status: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/status`,
  update: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}`,
  delete: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}`,
  questions: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/questions`,
  files: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/files`,
  filesDownload: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/files/download`,
  candidates: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/candidates`,
  candidateDetail: (id: string, candidateId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/candidates/${encodeURIComponent(candidateId)}`,
  inviteCandidates: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/candidates/invite`,
  invitations: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/invitations`,
  results: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/results`,
} as const;
