import { apiClient } from '@/shared/api/apiClient';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import type {
  CampaignCandidateErrorCode,
  CampaignCriterion,
  CampaignInvitationResponse,
  JoinCampaignResponse,
} from '../types/campaignCandidate.types';
import { campaignCandidateEndpoints } from './campaignCandidate.endpoints';

export class CampaignCandidateError extends Error {
  readonly code: CampaignCandidateErrorCode;
  readonly status?: number;

  constructor(code: CampaignCandidateErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'CampaignCandidateError';
    this.code = code;
    this.status = status;
  }
}

function statusToCode(status?: number): CampaignCandidateErrorCode {
  switch (status) {
    case 400:
      return 'badRequest';
    case 401:
      return 'unauthorized';
    case 402:
      return 'paymentRequired';
    case 403:
      return 'forbidden';
    case 404:
      return 'notFound';
    case 409:
      return 'conflict';
    case 410:
      return 'gone';
    case 502:
      return 'identityError';
    case 500:
    case 503:
      return 'serverError';
    default:
      return 'unknown';
  }
}

function toCampaignCandidateError(error: unknown, fallback: string): CampaignCandidateError {
  if (error instanceof CampaignCandidateError) return error;
  const status = getApiStatusCode(error);
  return new CampaignCandidateError(
    statusToCode(status),
    getApiErrorMessage(error, fallback),
    status,
  );
}

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nested = (payload as { data: unknown }).data;
    if (nested !== undefined) return nested;
  }
  return payload;
}

function asOptionalString(value: unknown): string | null {
  if (value == null || value === '') return null;
  return String(value);
}

function parseCriterion(raw: unknown): CampaignCriterion | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  if (!name) return null;

  const weight =
    typeof item.weight === 'number'
      ? item.weight
      : item.weight != null
        ? Number(item.weight)
        : undefined;
  const maxScore =
    typeof item.maxScore === 'number'
      ? item.maxScore
      : item.maxScore != null
        ? Number(item.maxScore)
        : undefined;

  return {
    id: item.id == null ? undefined : String(item.id),
    name,
    description: asOptionalString(item.description),
    weight: Number.isFinite(weight) ? weight : undefined,
    maxScore: Number.isFinite(maxScore) ? maxScore : undefined,
  };
}

function parseInvitation(raw: unknown): CampaignInvitationResponse {
  if (!raw || typeof raw !== 'object') {
    throw new CampaignCandidateError('unknown', 'Invalid invitation response.');
  }
  const data = raw as Record<string, unknown>;
  const campaignId = String(data.campaignId ?? '');
  const title = String(data.title ?? '').trim();
  if (!campaignId || !title) {
    throw new CampaignCandidateError('unknown', 'Invalid invitation response.');
  }

  const criteriaRaw = Array.isArray(data.criteria) ? data.criteria : [];
  const criteria = criteriaRaw
    .map(parseCriterion)
    .filter((item): item is CampaignCriterion => item != null);

  return {
    campaignId,
    title,
    orgName: asOptionalString(data.orgName),
    jobTitle: asOptionalString(data.jobTitle),
    description: asOptionalString(data.description),
    deadline: asOptionalString(data.deadline),
    criteria,
  };
}

function parseJoinResponse(raw: unknown): JoinCampaignResponse {
  if (!raw || typeof raw !== 'object') {
    throw new CampaignCandidateError('unknown', 'Invalid join response.');
  }
  const data = raw as Record<string, unknown>;
  const accessToken = String(data.accessToken ?? '').trim();
  const campaignId = String(data.campaignId ?? '').trim();
  const candidateId = String(data.candidateId ?? '').trim();
  if (!accessToken || !campaignId || !candidateId) {
    throw new CampaignCandidateError('unknown', 'Invalid join response.');
  }

  return {
    accessToken,
    campaignId,
    candidateId,
    membershipStatus: String(data.membershipStatus ?? 'Joined'),
  };
}

/** Live Candidate Campaign APIs — no mock fixtures. */
export const campaignCandidateService = {
  async getInvitationByToken(token: string): Promise<CampaignInvitationResponse> {
    const trimmed = token.trim();
    if (!trimmed) {
      throw new CampaignCandidateError('badRequest', 'Missing invitation token.');
    }

    try {
      const response = await apiClient.get<unknown>(campaignCandidateEndpoints.invitation(trimmed));
      return parseInvitation(unwrapData(response.data));
    } catch (error) {
      throw toCampaignCandidateError(error, 'Could not load invitation.');
    }
  },

  async joinCampaignByToken(token: string): Promise<JoinCampaignResponse> {
    const trimmed = token.trim();
    if (!trimmed) {
      throw new CampaignCandidateError('badRequest', 'Missing invitation token.');
    }

    try {
      const response = await apiClient.post<unknown>(campaignCandidateEndpoints.join(trimmed));
      return parseJoinResponse(unwrapData(response.data));
    } catch (error) {
      throw toCampaignCandidateError(error, 'Could not join campaign.');
    }
  },
};
