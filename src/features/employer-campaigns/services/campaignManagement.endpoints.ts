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
  startNow: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/start-now`,
  status: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/status`,
  update: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}`,
  delete: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}`,
  questions: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/questions`,
  jobNeeds: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/job-needs`,
  jobNeedsSuggest: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/job-needs/suggest`,
  questionsGenerate: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/questions/generate`,
  questionsImport: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/questions/import`,
  files: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/files`,
  filesDownload: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/files/download`,
  slots: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/slots`,
  slot: (id: string, slotId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/slots/${encodeURIComponent(slotId)}`,
  candidates: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/candidates`,
  candidateDetail: (id: string, candidateId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/candidates/${encodeURIComponent(candidateId)}`,
  candidateRescreen: (id: string, candidateId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/candidates/${encodeURIComponent(candidateId)}/rescreen`,
  candidateCv: (id: string, candidateId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/candidates/${encodeURIComponent(candidateId)}/cv`,
  inviteCandidates: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/candidates/invite`,
  invitations: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/invitations`,
  invitationReissue: (id: string, invitationId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/invitations/${encodeURIComponent(invitationId)}/reissue`,
  results: (id: string) => `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/results`,
  resultsExport: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/results/export`,
  resultTranscript: (id: string, sessionId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/results/${encodeURIComponent(sessionId)}/transcript`,
  resultOverrideHistory: (id: string, sessionId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/results/${encodeURIComponent(sessionId)}/override-history`,
  resultAnswerAudio: (id: string, sessionId: string, answerId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/results/${encodeURIComponent(sessionId)}/answers/${encodeURIComponent(answerId)}/audio`,
  resultOverride: (id: string, sessionId: string) =>
    `${CAMPAIGN_API_PREFIX}/${encodeURIComponent(id)}/results/${encodeURIComponent(sessionId)}/override`,
} as const;
