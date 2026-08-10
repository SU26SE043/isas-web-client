import { apiClient } from '@/shared/api/apiClient';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import axios from 'axios';
import { multipartFormDataConfig } from '@/features/practice/utils/multipartFormDataConfig';
import type {
  CampaignCandidateErrorCode,
  CampaignCriterion,
  CampaignInterviewStatus,
  CampaignInvitationResponse,
  CandidateCampaignDetailResponse,
  CandidateCampaignListItem,
  CandidateCampaignsPage,
  CreateCampaignFlagRequest,
  FaceCheckResponse,
  JoinCampaignResponse,
  StartCampaignInterviewResponse,
} from '../types/campaignCandidate.types';
import { campaignCandidateEndpoints } from './campaignCandidate.endpoints';

export class CampaignCandidateError extends Error {
  readonly code: CampaignCandidateErrorCode;
  readonly status?: number;
  readonly apiCode?: string;
  readonly retryAfterSeconds?: number;
  readonly slotStartsAt?: string;
  readonly slotEndsAt?: string;
  readonly serverTimeUtc?: string;

  constructor(code: CampaignCandidateErrorCode, message: string, status?: number, details?: {
    apiCode?: string;
    retryAfterSeconds?: number;
    slotStartsAt?: string;
    slotEndsAt?: string;
    serverTimeUtc?: string;
  }) {
    super(message);
    this.name = 'CampaignCandidateError';
    this.code = code;
    this.status = status;
    this.apiCode = details?.apiCode;
    this.retryAfterSeconds = details?.retryAfterSeconds;
    this.slotStartsAt = details?.slotStartsAt;
    this.slotEndsAt = details?.slotEndsAt;
    this.serverTimeUtc = details?.serverTimeUtc;
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
    case 429:
      return 'concurrentLimit';
    case 502:
      return 'identityError';
    case 500:
    case 503:
      return 'serverError';
    default:
      return 'unknown';
  }
}

function isInvitationEmailMismatch(
  status: number | undefined,
  apiCode: string | undefined,
  message: string | null,
): boolean {
  if (status !== 403) return false;

  const normalizedApiCode = apiCode?.replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (normalizedApiCode === 'invitationemailmismatch') return true;

  const normalizedMessage = message?.trim().toLowerCase() ?? '';
  return normalizedMessage.includes('invitation email')
    && (normalizedMessage.includes('does not match') || normalizedMessage.includes('mismatch'))
    && normalizedMessage.includes('current user');
}

function toCampaignCandidateError(error: unknown, fallback: string): CampaignCandidateError {
  if (error instanceof CampaignCandidateError) return error;
  const status = getApiStatusCode(error);
  const responseData = axios.isAxiosError(error) ? unwrapData(error.response?.data) : undefined;
  const body = responseData && typeof responseData === 'object'
    ? responseData as Record<string, unknown>
    : undefined;
  const apiCode = typeof body?.code === 'string' ? body.code : undefined;
  const apiMessage = asOptionalString(body?.message) ?? asOptionalString(body?.detail) ?? asOptionalString(body?.error);
  const retryHeader = axios.isAxiosError(error) ? error.response?.headers?.['retry-after'] : undefined;
  const retryAfterSeconds = Number(body?.retryAfterSeconds ?? retryHeader);
  const details = {
    apiCode,
    retryAfterSeconds: Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds : undefined,
    slotStartsAt: asOptionalString(body?.slotStartsAt) ?? undefined,
    slotEndsAt: asOptionalString(body?.slotEndsAt) ?? undefined,
    serverTimeUtc: asOptionalString(body?.serverTimeUtc) ?? undefined,
  };
  const code = isInvitationEmailMismatch(status, apiCode, apiMessage)
    ? 'emailMismatch'
    : apiCode === 'outside_slot_window'
    ? 'outsideSlotWindow'
    : apiCode === 'concurrent_limit'
      ? 'concurrentLimit'
      : statusToCode(status);
  return new CampaignCandidateError(
    code,
    getApiErrorMessage(error, fallback),
    status,
    details,
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

function parseInterviewStatus(value: unknown): CampaignInterviewStatus {
  const raw = String(value ?? '');
  if (raw === 'InProgress' || raw === 'Completed' || raw === 'NotStarted') return raw;
  return 'NotStarted';
}

function parseListItem(raw: unknown): CandidateCampaignListItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const campaignId = String(data.campaignId ?? '').trim();
  const title = String(data.title ?? '').trim();
  if (!campaignId || !title) return null;

  return {
    campaignId,
    title,
    company: asOptionalString(data.company),
    jobTitle: asOptionalString(data.jobTitle),
    deadline: asOptionalString(data.deadline),
    membershipStatus: String(data.membershipStatus ?? ''),
    interviewStatus: parseInterviewStatus(data.interviewStatus),
  };
}

function unwrapList(payload: unknown): unknown[] {
  const data = unwrapData(payload);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
  }
  return [];
}

function readNextCursorHeader(headers: unknown): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const record = headers as Record<string, unknown> & { get?: (name: string) => unknown };
  const raw = typeof record.get === 'function'
    ? record.get('x-next-cursor') ?? record.get('X-Next-Cursor')
    : record['x-next-cursor'] ?? record['X-Next-Cursor'];
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

function parseDetail(raw: unknown): CandidateCampaignDetailResponse {
  if (!raw || typeof raw !== 'object') {
    throw new CampaignCandidateError('unknown', 'Invalid campaign detail response.');
  }
  const data = raw as Record<string, unknown>;
  const campaignId = String(data.campaignId ?? '').trim();
  const title = String(data.title ?? '').trim();
  if (!campaignId || !title) {
    throw new CampaignCandidateError('unknown', 'Invalid campaign detail response.');
  }

  const criteriaRaw = Array.isArray(data.criteria) ? data.criteria : [];
  const criteria = criteriaRaw
    .map(parseCriterion)
    .filter((item): item is CampaignCriterion => item != null);

  return {
    campaignId,
    title,
    jobTitle: asOptionalString(data.jobTitle),
    description: asOptionalString(data.description),
    deadline: asOptionalString(data.deadline),
    criteria,
    membershipStatus: String(data.membershipStatus ?? ''),
    interviewStatus: parseInterviewStatus(data.interviewStatus),
    sessionId: asOptionalString(data.sessionId),
    started: Boolean(data.started),
  };
}

function parseStartResponse(raw: unknown, fallbackCampaignId: string): StartCampaignInterviewResponse {
  if (!raw || typeof raw !== 'object') {
    throw new CampaignCandidateError('unknown', 'Invalid start interview response.');
  }
  const data = raw as Record<string, unknown>;
  const sessionId = String(data.sessionId ?? '').trim();
  const campaignId = String(data.campaignId ?? fallbackCampaignId).trim();
  if (!sessionId || !campaignId) {
    throw new CampaignCandidateError('unknown', 'Invalid start interview response.');
  }

  const questionsRaw = Array.isArray(data.questions) ? data.questions : [];
  const questions = questionsRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const q = item as Record<string, unknown>;
      const id = String(q.id ?? '').trim();
      const content = String(q.content ?? '').trim();
      if (!id || !content) return null;
      const orderNo = typeof q.orderNo === 'number' ? q.orderNo : Number(q.orderNo ?? 0);
      const timeLimitSec =
        typeof q.timeLimitSec === 'number' ? q.timeLimitSec : Number(q.timeLimitSec ?? 0);
      return {
        id,
        orderNo: Number.isFinite(orderNo) ? orderNo : 0,
        content,
        timeLimitSec: Number.isFinite(timeLimitSec) ? timeLimitSec : 0,
      };
    })
    .filter((item): item is StartCampaignInterviewResponse['questions'][number] => item != null)
    .sort((a, b) => a.orderNo - b.orderNo);

  return {
    sessionId,
    campaignId,
    questions,
    antiCheatEnabled: Boolean(data.antiCheatEnabled),
    faceEnrollRequired: Boolean(data.faceEnrollRequired),
    adaptiveEnabled: Boolean(data.adaptiveEnabled),
    deadlineAt: asOptionalString(data.deadlineAt),
  };
}

function parseFaceCheck(raw: unknown): FaceCheckResponse {
  if (!raw || typeof raw !== 'object') {
    throw new CampaignCandidateError('unknown', 'Invalid face-check response.');
  }
  const data = raw as Record<string, unknown>;
  const signals = Array.isArray(data.signals)
    ? data.signals.filter((item): item is string => typeof item === 'string')
    : [];
  const faceCount =
    typeof data.faceCount === 'number' ? data.faceCount : Number(data.faceCount ?? 0);

  return {
    match: Boolean(data.match),
    faceCount: Number.isFinite(faceCount) ? faceCount : 0,
    signals,
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
      const response = await apiClient.get<unknown>(campaignCandidateEndpoints.invitation(trimmed), {
        skipAuth: true,
      });
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

  async getMyCampaigns(query?: { cursor?: string; limit?: number }): Promise<CandidateCampaignsPage> {
    try {
      const response = await apiClient.get<unknown>(campaignCandidateEndpoints.myCampaigns, {
        params: { cursor: query?.cursor, limit: query?.limit },
      });
      const items = unwrapList(response.data)
        .map(parseListItem)
        .filter((item): item is CandidateCampaignListItem => item != null);
      return { items, nextCursor: readNextCursorHeader(response.headers) };
    } catch (error) {
      throw toCampaignCandidateError(error, 'Could not load campaigns.');
    }
  },

  async getMyCampaignById(campaignId: string): Promise<CandidateCampaignDetailResponse> {
    const id = campaignId.trim();
    if (!id) {
      throw new CampaignCandidateError('badRequest', 'Missing campaign id.');
    }

    try {
      const response = await apiClient.get<unknown>(campaignCandidateEndpoints.myCampaign(id));
      return parseDetail(unwrapData(response.data));
    } catch (error) {
      throw toCampaignCandidateError(error, 'Could not load campaign detail.');
    }
  },

  async startCampaignInterview(campaignId: string): Promise<StartCampaignInterviewResponse> {
    const id = campaignId.trim();
    if (!id) {
      throw new CampaignCandidateError('badRequest', 'Missing campaign id.');
    }

    try {
      const response = await apiClient.post<unknown>(campaignCandidateEndpoints.start(id));
      return parseStartResponse(unwrapData(response.data), id);
    } catch (error) {
      throw toCampaignCandidateError(error, 'Could not start campaign interview.');
    }
  },

  async enrollCampaignFace(
    campaignId: string,
    sessionId: string,
    imageFile: File,
  ): Promise<void> {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      await apiClient.post(
        campaignCandidateEndpoints.faceEnroll(campaignId, sessionId),
        formData,
        multipartFormDataConfig,
      );
    } catch (error) {
      throw toCampaignCandidateError(error, 'Could not enroll face image.');
    }
  },

  async checkCampaignFace(
    campaignId: string,
    sessionId: string,
    imageFile: File,
  ): Promise<FaceCheckResponse | null> {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await apiClient.post<unknown>(
        campaignCandidateEndpoints.faceCheck(campaignId, sessionId),
        formData,
        multipartFormDataConfig,
      );
      if (response.status === 204 || response.data == null || response.data === '') {
        return null;
      }
      return parseFaceCheck(unwrapData(response.data));
    } catch (error) {
      throw toCampaignCandidateError(error, 'Could not run face check.');
    }
  },

  async createCampaignFlag(
    campaignId: string,
    sessionId: string,
    payload: CreateCampaignFlagRequest,
  ): Promise<void> {
    try {
      await apiClient.post(campaignCandidateEndpoints.flags(campaignId, sessionId), payload);
    } catch (error) {
      throw toCampaignCandidateError(error, 'Could not report monitoring signal.');
    }
  },
};
