import { apiClient } from '@/shared/api/apiClient';
import { getApiStatusCode } from '@/shared/api/apiError';
import { mockDelay } from '@/shared/mock';
import { DEFAULT_PROCTORING, MOCK_EMPLOYER_CAMPAIGNS, QUESTION_BANK } from '../mocks/campaignManagement.fixtures';
import type {
  CampaignCreateQuestionRequest,
  CampaignCreateRequest,
  CampaignResponse,
  CampaignUpdateRequest,
} from '../types/campaign.api.types';
import type {
  CampaignCandidateRow,
  CampaignDraftInput,
  CampaignFilters,
  CampaignQuestion,
  EmployerCampaign,
  InviteRejectedEmail,
  InviteResolution,
  PublishResult,
} from '../types/campaignManagement.types';
import {
  mapCampaignResponseToEmployerCampaign,
  parseCampaignResponse,
  parseCampaignResponseList,
  unwrapCampaignDetailPayload,
} from '../utils/campaignMapper';
import { mergeCampaignWriteResult } from '../utils/buildCampaignCreateRequest';
import { campaignManagementEndpoints } from './campaignManagement.endpoints';

let campaigns = [...MOCK_EMPLOYER_CAMPAIGNS];

/** Live Campaign API expects a Guid; mock/slug ids must not hit the network. */
const CAMPAIGN_GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLiveCampaignId(id: string): boolean {
  return CAMPAIGN_GUID_RE.test(id.trim());
}

export class CampaignRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'CampaignRequestError';
    this.status = status;
  }
}

const MOCK_REGISTERED_CANDIDATES: Record<string, { candidateId: string; displayName: string }> = {
  'candidate@isas.dev': { candidateId: 'e2e-candidate', displayName: 'E2E Candidate' },
  'mai.nguyen@example.com': { candidateId: 'cand-mai', displayName: 'Mai Nguyen' },
  'new.candidate@example.com': { candidateId: 'cand-new', displayName: 'New Candidate' },
};

const EMPLOYER_EMAILS = new Set(['hrmember@isas.dev', 'orgadmin@isas.dev', 'admin@isas.dev']);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function matchesFilters(campaign: EmployerCampaign, filters: CampaignFilters) {
  const query = filters.query.trim().toLowerCase();
  const matchesQuery =
    !query ||
    [campaign.title, campaign.company, campaign.location, campaign.summary].some((value) =>
      value.toLowerCase().includes(query),
    );
  const matchesStatus = filters.status === 'all' || campaign.status === filters.status;
  return matchesQuery && matchesStatus;
}

function resolveEmail(email: string): { row?: CampaignCandidateRow; rejected?: InviteRejectedEmail } {
  const normalized = normalizeEmail(email);
  if (!normalized.includes('@')) {
    return { rejected: { email, reason: 'INVALID_EMAIL' } };
  }
  if (EMPLOYER_EMAILS.has(normalized)) {
    return { rejected: { email: normalized, reason: 'EMPLOYER_EMAIL' } };
  }
  const registered = MOCK_REGISTERED_CANDIDATES[normalized];
  if (registered) {
    return {
      row: {
        email: normalized,
        displayName: registered.displayName,
        candidateId: registered.candidateId,
        status: 'invited',
      },
    };
  }
  return { row: { email: normalized, status: 'invite_pending' } };
}

function mergeCandidates(existing: CampaignCandidateRow[], incoming: CampaignCandidateRow[]) {
  const map = new Map(existing.map((row) => [row.email, row]));
  for (const row of incoming) {
    map.set(row.email, row);
  }
  return Array.from(map.values());
}

export const campaignManagementService = {
  /**
   * Live: GET /api/v1/campaign → CampaignResponse[] (Bearer employer token via apiClient).
   * Client-side search/status filters match existing list UI.
   */
  async listCampaigns(filters: CampaignFilters): Promise<EmployerCampaign[]> {
    const response = await apiClient.get<unknown>(campaignManagementEndpoints.list);
    const items: CampaignResponse[] = parseCampaignResponseList(response.data);
    return items
      .map(mapCampaignResponseToEmployerCampaign)
      .filter((campaign) => matchesFilters(campaign, filters));
  },

  getErrorStatus(error: unknown): number | undefined {
    if (error instanceof CampaignRequestError) return error.status;
    return getApiStatusCode(error);
  },

  /** @deprecated Prefer getErrorStatus */
  getListErrorStatus(error: unknown): number | undefined {
    return this.getErrorStatus(error);
  },

  /**
   * Live: GET /api/v1/campaign/{id} → CampaignResponse (Bearer employer token via apiClient).
   * Throws on HTTP errors (404/401/403/…) so React Query can surface status codes.
   * Non-GUID ids skip the network (avoids 400 from backends that validate Guid route params)
   * and resolve from in-memory cache when present (same-session create/update).
   */
  async getCampaign(id: string): Promise<EmployerCampaign> {
    if (!isLiveCampaignId(id)) {
      const cached = campaigns.find((item) => item.id === id);
      if (cached) return cached;
      throw new CampaignRequestError(400, 'Invalid campaign id');
    }

    try {
      const response = await apiClient.get<unknown>(campaignManagementEndpoints.detail(id));
      const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
      if (!parsed) {
        throw new Error('Invalid campaign detail response');
      }
      const mapped = mapCampaignResponseToEmployerCampaign(parsed);
      campaigns = [mapped, ...campaigns.filter((item) => item.id !== mapped.id)];
      return mapped;
    } catch (error) {
      const status = getApiStatusCode(error);
      if (status === 400 || status === 404) {
        const cached = campaigns.find((item) => item.id === id);
        if (cached) return cached;
      }
      throw error;
    }
  },

  /** In-memory campaign from create/update in this session (not a network call). */
  getCachedCampaign(id: string): EmployerCampaign | undefined {
    return campaigns.find((item) => item.id === id);
  },

  async listQuestions(): Promise<CampaignQuestion[]> {
    await mockDelay(150);
    return QUESTION_BANK;
  },

  /**
   * Live: POST /api/v1/campaign (Bearer employer) → create Draft.
   * Body matches CampaignCreateRequest (title, domain, schedule, optional JD/criteria, questions).
   * Never falls back to mock IDs — invalid/missing response id fails the create.
   */
  async createCampaign(input: CampaignCreateRequest): Promise<EmployerCampaign> {
    const response = await apiClient.post<unknown>(campaignManagementEndpoints.create, input);
    const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
    if (!parsed?.id?.trim()) {
      throw new Error('Invalid create campaign response: missing id');
    }
    const mapped = mergeCampaignWriteResult(mapCampaignResponseToEmployerCampaign(parsed), {
      criteria: input.criteria,
      questions: input.questions,
      jdText: input.jdText,
      title: input.title,
      domain: input.domain,
      maxCandidates: input.maxCandidates,
      timeLimitMinutes: input.timeLimitMinutes,
      startsAt: input.startsAt,
      expiresAt: input.expiresAt,
    });
    campaigns = [mapped, ...campaigns.filter((item) => item.id !== mapped.id)];
    return mapped;
  },

  /**
   * Mock update of an existing Draft only. New campaigns must use createCampaign (live POST)
   * so the URL id is a real Guid — never a client-generated slug.
   */
  async saveDraft(input: CampaignDraftInput, id?: string): Promise<EmployerCampaign> {
    if (!id) {
      throw new CampaignRequestError(400, 'Use createCampaign for new drafts');
    }
    await mockDelay(500);
    const now = new Date().toISOString();
    const proctoring = input.proctoring ?? DEFAULT_PROCTORING;
    const existing = campaigns.find((campaign) => campaign.id === id);
    if (!existing) throw new Error('CAMPAIGN_NOT_FOUND');
    if (existing.status !== 'draft') throw new Error('ONLY_DRAFT_EDITABLE');
    const updated = { ...existing, ...input, proctoring, updatedAt: now };
    campaigns = campaigns.map((campaign) => (campaign.id === id ? updated : campaign));
    return updated;
  },

  /**
   * Live: PUT /api/v1/campaign/{id} — update Draft metadata / JD / criteria.
   * Questions are updated separately via updateCampaignQuestions.
   */
  async updateCampaign(
    id: string,
    payload: CampaignUpdateRequest,
  ): Promise<EmployerCampaign> {
    const response = await apiClient.put<unknown>(
      campaignManagementEndpoints.update(id),
      payload,
    );
    const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
    if (!parsed?.id?.trim()) {
      throw new Error('Invalid update campaign response: missing id');
    }
    const existing = campaigns.find((item) => item.id === id);
    const mapped = mergeCampaignWriteResult(mapCampaignResponseToEmployerCampaign(parsed), {
      criteria: payload.criteria,
      jdText: payload.jdText,
      title: payload.title,
      domain: payload.domain,
      maxCandidates: payload.maxCandidates,
      timeLimitMinutes: payload.timeLimitMinutes,
      startsAt: payload.startsAt,
      expiresAt: payload.expiresAt,
      questions: existing?.questions.length
        ? existing.questions.map((item) => ({
            questionText: item.prompt,
            source: 'CustomHr' as const,
            isRequired: true,
          }))
        : undefined,
    });
    // Prefer existing questions when update metadata response omits them.
    if (!mapped.questions.length && existing?.questions.length) {
      mapped.questions = existing.questions;
    }
    campaigns = [mapped, ...campaigns.filter((item) => item.id !== mapped.id)];
    return mapped;
  },

  /**
   * Live: PUT /api/v1/campaign/{id}/questions — replace full question list.
   * Body must be a JSON array (not `{ questions: [...] }`).
   */
  async updateCampaignQuestions(
    id: string,
    questions: CampaignCreateQuestionRequest[],
  ): Promise<EmployerCampaign> {
    if (questions.length === 0) {
      throw new CampaignRequestError(400, 'Questions array must not be empty');
    }
    const response = await apiClient.put<unknown>(
      campaignManagementEndpoints.questions(id),
      questions,
    );
    const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
    if (!parsed?.id?.trim()) {
      throw new Error('Invalid update questions response: missing id');
    }
    const existing = campaigns.find((item) => item.id === id);
    const mapped = mergeCampaignWriteResult(mapCampaignResponseToEmployerCampaign(parsed), {
      questions,
      criteria: existing?.rubric.length
        ? existing.rubric.map((item) => ({
            name: item.name,
            description: item.description || null,
            weight: Number(item.weight) > 1 ? Number(item.weight) / 100 : Number(item.weight),
            maxScore: item.maxScore,
          }))
        : undefined,
      jdText: existing?.jobDescription,
      title: existing?.title,
      domain: existing?.domain ?? existing?.company,
    });
    if (!mapped.rubric.length && existing?.rubric.length) {
      mapped.rubric = existing.rubric;
    }
    campaigns = [mapped, ...campaigns.filter((item) => item.id !== mapped.id)];
    return mapped;
  },

  /** @deprecated Prefer updateCampaignQuestions with API DTOs. */
  async saveCampaignQuestions(
    id: string,
    questions: CampaignQuestion[],
  ): Promise<EmployerCampaign> {
    return this.updateCampaignQuestions(
      id,
      questions
        .filter((item) => item.prompt.trim())
        .map((item) => ({
          questionText: item.prompt.trim(),
          source: 'CustomHr' as const,
          isRequired: true,
        })),
    );
  },

  /** Live: POST /api/v1/campaign/{id}/publish — Draft → Active. */
  async publishCampaign(id: string): Promise<PublishResult> {
    const response = await apiClient.post<unknown>(campaignManagementEndpoints.publish(id));
    const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
    if (!parsed?.id?.trim()) {
      throw new Error('Invalid publish campaign response: missing id');
    }
    const mapped = mapCampaignResponseToEmployerCampaign(parsed);
    campaigns = [mapped, ...campaigns.filter((item) => item.id !== mapped.id)];
    return { campaign: mapped, warnings: [] };
  },

  /** Live: DELETE /api/v1/campaign/{id} — remove Draft (or allowed statuses). */
  async deleteCampaign(id: string): Promise<void> {
    await apiClient.delete(campaignManagementEndpoints.delete(id));
    campaigns = campaigns.filter((item) => item.id !== id);
  },

  async inviteCandidates(id: string, emails: string[]): Promise<InviteResolution> {
    await mockDelay(400);
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');
    if (campaign.status !== 'active') throw new Error('CAMPAIGN_NOT_ACTIVE');

    const linked: CampaignCandidateRow[] = [];
    const pending: CampaignCandidateRow[] = [];
    const rejected: InviteRejectedEmail[] = [];
    const accepted: CampaignCandidateRow[] = [];

    for (const rawEmail of emails) {
      const result = resolveEmail(rawEmail);
      if (result.rejected) {
        rejected.push(result.rejected);
        continue;
      }
      if (!result.row) continue;
      accepted.push(result.row);
      if (result.row.status === 'invited') linked.push(result.row);
      else pending.push(result.row);
    }

    const candidates = mergeCandidates(campaign.candidates, accepted);
    const invitedEmails = Array.from(new Set([...campaign.invitedEmails, ...accepted.map((row) => row.email)]));
    const updated = {
      ...campaign,
      candidates,
      invitedEmails,
      applicants: candidates.length,
      updatedAt: new Date().toISOString(),
    };
    campaigns = campaigns.map((item) => (item.id === id ? updated : item));
    return { campaign: updated, linked, pending, rejected };
  },

  /**
   * Mock: POST /api/v1/campaign/{id}/files (multipart field `jdFile`).
   * Campaign must be Draft. Used after create when JD source is a PDF.
   */
  async uploadCampaignJdFile(id: string, jdFile: File): Promise<EmployerCampaign> {
    await mockDelay(700);
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');
    if (campaign.status !== 'draft') throw new Error('ONLY_DRAFT_EDITABLE');

    const isPdf =
      jdFile.type === 'application/pdf' || jdFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) throw new Error('JD_FILE_NOT_PDF');
    if (jdFile.size > 10 * 1024 * 1024) throw new Error('JD_FILE_TOO_LARGE');
    if (jdFile.size <= 0) throw new Error('JD_FILE_CORRUPT');

    const updated: EmployerCampaign = {
      ...campaign,
      jobDescription: campaign.jobDescription.trim()
        ? campaign.jobDescription
        : `[Uploaded JD: ${jdFile.name}]`,
      summary: campaign.summary.trim() ? campaign.summary : campaign.title,
      updatedAt: new Date().toISOString(),
    };
    campaigns = campaigns.map((item) => (item.id === id ? updated : item));
    return updated;
  },

  /**
   * Mock: POST /api/v1/campaign/{id}/candidates (multipart files).
   * Campaign must be Active.
   */
  async uploadCandidateCvs(
    id: string,
    files: File[],
  ): Promise<{
    received: number;
    rejected: number;
    candidates: Array<{
      id: string;
      fullName: string;
      email: string;
      status: string;
      overallMatch: number;
    }>;
  }> {
    await mockDelay(600);
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');
    if (campaign.status !== 'active') throw new Error('CAMPAIGN_NOT_ACTIVE');

    const candidates = files.map((file, index) => {
      const stem = file.name.replace(/\.[^.]+$/, '') || `Candidate ${index + 1}`;
      const email = `${stem.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`;
      return {
        id: `cv-${Date.now().toString(36)}-${index}`,
        fullName: stem,
        email,
        status: 'Filtered',
        overallMatch: Math.max(55, 95 - index * 8),
      };
    });

    return {
      received: files.length,
      rejected: 0,
      candidates,
    };
  },

  /**
   * Mock: POST /api/v1/campaign/{id}/candidates/invite
   */
  async inviteCandidateIds(
    id: string,
    candidateIds: string[],
    candidates: Array<{ id: string; email: string; fullName: string }>,
  ): Promise<{
    invited: Array<{ candidateId: string; invitationId: string; email: string }>;
    failed: Array<{ candidateId: string; reason: string }>;
  }> {
    await mockDelay(450);
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) throw new Error('CAMPAIGN_NOT_FOUND');
    if (campaign.status !== 'active') throw new Error('CAMPAIGN_NOT_ACTIVE');

    const invited: Array<{ candidateId: string; invitationId: string; email: string }> = [];
    const failed: Array<{ candidateId: string; reason: string }> = [];
    const emails: string[] = [];

    for (const candidateId of candidateIds) {
      const row = candidates.find((item) => item.id === candidateId);
      if (!row?.email.includes('@')) {
        failed.push({ candidateId, reason: 'Invalid email' });
        continue;
      }
      invited.push({
        candidateId,
        invitationId: `inv-${candidateId}`,
        email: row.email,
      });
      emails.push(row.email);
    }

    if (emails.length > 0) {
      await this.inviteCandidates(id, emails);
    }

    return { invited, failed };
  },
};
