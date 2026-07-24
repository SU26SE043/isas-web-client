/**
 * B2B Candidate Campaign — public gateway paths.
 * Final URL = `${VITE_API_BASE_URL}` + path below.
 */
const CAMPAIGN_API_PREFIX = '/api/v1/campaign';

export const campaignCandidateEndpoints = {
  invitation: (token: string) =>
    `${CAMPAIGN_API_PREFIX}/invitations/${encodeURIComponent(token)}`,
  join: (token: string) =>
    `${CAMPAIGN_API_PREFIX}/invitations/${encodeURIComponent(token)}/join`,
  myCampaigns: `${CAMPAIGN_API_PREFIX}/my-campaigns`,
  myCampaign: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/my-campaigns/${encodeURIComponent(id)}`,
  start: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/start`,
  faceEnroll: (campaignId: string, sessionId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(campaignId)}/sessions/${encodeURIComponent(sessionId)}/face-enroll`,
  faceCheck: (campaignId: string, sessionId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(campaignId)}/sessions/${encodeURIComponent(sessionId)}/face-check`,
  flags: (campaignId: string, sessionId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(campaignId)}/sessions/${encodeURIComponent(sessionId)}/flags`,
} as const;
