import type {
  CampaignInterviewContext,
  StartCampaignInterviewResponse,
} from '../types/campaignCandidate.types';

const STORAGE_PREFIX = 'isas-campaign-interview:';

export type StoredCampaignInterview = CampaignInterviewContext & {
  questions: StartCampaignInterviewResponse['questions'];
  startedAt: string;
};

export function campaignInterviewStorageKey(sessionId: string) {
  return `${STORAGE_PREFIX}${sessionId}`;
}

export function saveCampaignInterviewSession(
  start: StartCampaignInterviewResponse,
): StoredCampaignInterview {
  const payload: StoredCampaignInterview = {
    mode: 'b2b-campaign',
    campaignId: start.campaignId,
    sessionId: start.sessionId,
    antiCheatEnabled: start.antiCheatEnabled,
    faceEnrollRequired: start.faceEnrollRequired,
    adaptiveEnabled: start.adaptiveEnabled,
    questions: start.questions,
    startedAt: new Date().toISOString(),
  };

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(campaignInterviewStorageKey(start.sessionId), JSON.stringify(payload));
  }

  return payload;
}

export function readCampaignInterviewSession(sessionId: string): StoredCampaignInterview | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(campaignInterviewStorageKey(sessionId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredCampaignInterview;
    if (parsed.mode !== 'b2b-campaign' || parsed.sessionId !== sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCampaignInterviewSession(sessionId: string) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(campaignInterviewStorageKey(sessionId));
}

export function isB2bCampaignSessionId(sessionId: string) {
  return readCampaignInterviewSession(sessionId) != null || sessionId.startsWith('campaign-');
}
