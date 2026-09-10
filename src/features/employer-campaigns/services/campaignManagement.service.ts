import axios from 'axios';
import { apiClient } from '@/shared/api/apiClient';
import { getApiStatusCode } from '@/shared/api/apiError';
import { DEFAULT_PROCTORING } from '../mocks/campaignManagement.fixtures';
import type {
  CampaignCreateQuestionRequest,
  CampaignQuestionImportResult,
  CampaignCreateRequest,
  CreateCampaignInvitationsRequest,
  CreateCampaignInvitationsResponse,
  CampaignInvitationsPage,
  CampaignResponse,
  CampaignStatusUpdateRequest,
  CampaignUpdateRequest,
  CampaignSlotRequest,
  CampaignSlotResponse,
  CandidateListQuery,
  CandidateUploadResponse,
  CampaignCandidateDetail,
  CampaignCandidateListItem,
  CampaignResultExportFormat,
  CampaignResultsResponse,
  CampaignTranscriptResponse,
  GenerateCampaignQuestionsParams,
  OverrideCampaignResultPayload,
  GetCampaignInvitationsQuery,
  InviteCampaignCandidatesRequest,
  InviteCampaignCandidatesResponse,
  UpdateCampaignCandidatePayload,
  UpdateCampaignJobNeedsRequest,
  ReissuedCampaignInvitation,
} from '../types/campaign.api.types';
import { parseCampaignSlot, parseCampaignSlots } from '../utils/campaignSlots';
import type {
  CampaignCandidateRow,
  CampaignFilters,
  CampaignQuestion,
  EmployerCampaign,
  InviteResolution,
  PublishResult,
  CampaignDeployResult,
} from '../types/campaignManagement.types';
import {
  mapCampaignResponseToEmployerCampaign,
  parseCampaignResponse,
  parseCampaignResponseList,
  unwrapCampaignDetailPayload,
} from '../utils/campaignMapper';
import { rememberCampaignAttachments } from '../utils/campaignFiles';
import { mergeCampaignWriteResult } from '../utils/buildCampaignCreateRequest';
import {
  parseContentDispositionFilename,
  validateCampaignPdf,
  type BlobDownloadResult,
  type CampaignFileType,
} from '../utils/campaignFiles';
import {
  buildCandidateListParams,
  parseCampaignResultsResponse,
  parseCampaignTranscriptResponse,
  parseCandidateDetail,
  parseCandidateListItem,
  parseCandidateUploadResponse,
  parseInviteByCandidateIdsResponse,
  unwrapArrayPayload,
} from '../utils/campaignCandidatesApi';
import { parseCampaignInvitationsPage, readNextCursorHeader } from '../utils/campaignInvitationsApi';
import { campaignManagementEndpoints } from './campaignManagement.endpoints';
import { isCampaignCsvFile, parseCampaignQuestionImport } from '../utils/campaignQuestionImport';

let campaigns: EmployerCampaign[] = [];

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

export class CampaignInvitationDeployError extends Error {
  readonly campaign: EmployerCampaign;
  readonly emails: string[];
  readonly status?: number;
  readonly body?: unknown;
  constructor(
    message: string,
    campaign: EmployerCampaign,
    emails: string[],
    status?: number,
    body?: unknown,
  ) {
    super(message);
    this.name = 'CampaignInvitationDeployError';
    this.campaign = campaign;
    this.emails = emails;
    this.status = status;
    this.body = body;
  }
}

function matchesFilters(campaign: EmployerCampaign, filters: CampaignFilters) {
  const query = filters.query.trim().toLowerCase();
  const matchesQuery =
    !query ||
    [campaign.title, campaign.domain, campaign.jobDescription].some((value) =>
      value?.toLowerCase().includes(query),
    );
  const matchesStatus = filters.status === 'all' || campaign.status === filters.status;
  return matchesQuery && matchesStatus;
}

function mergeCandidates(existing: CampaignCandidateRow[], incoming: CampaignCandidateRow[]) {
  const map = new Map(existing.map((row) => [row.email, row]));
  for (const row of incoming) {
    map.set(row.email, row);
  }
  return Array.from(map.values());
}

function unwrapInviteByEmailPayload(data: unknown): CreateCampaignInvitationsResponse {
  const root =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  const inner =
    root && root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  if (!inner) {
    return { created: [], failed: [] };
  }

  const createdRaw = Array.isArray(inner.created)
    ? inner.created
    : Array.isArray(inner.Created)
      ? inner.Created
      : [];
  const failedRaw = Array.isArray(inner.failed)
    ? inner.failed
    : Array.isArray(inner.Failed)
      ? inner.Failed
      : [];

  const created = createdRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : typeof record.Id === 'string' ? record.Id : '';
      const email =
        typeof record.email === 'string'
          ? record.email
          : typeof record.Email === 'string'
            ? record.Email
            : '';
      if (!id.trim() || !email.trim()) return null;
      const expiresAt =
        typeof record.expiresAt === 'string'
          ? record.expiresAt
          : typeof record.ExpiresAt === 'string'
            ? record.ExpiresAt
            : '';
      return { id: id.trim(), email: email.trim().toLowerCase(), expiresAt };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);

  const failed = failedRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const email =
        typeof record.email === 'string'
          ? record.email
          : typeof record.Email === 'string'
            ? record.Email
            : '';
      const reason =
        typeof record.reason === 'string'
          ? record.reason
          : typeof record.Reason === 'string'
            ? record.Reason
            : 'UNKNOWN';
      if (!email.trim()) return null;
      return { email: email.trim().toLowerCase(), reason };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);

  return { created, failed };
}

function readPublishWarnings(data: unknown): string[] {
  const root = data && typeof data === 'object' && !Array.isArray(data)
    ? data as Record<string, unknown>
    : null;
  const nested = root?.data && typeof root.data === 'object' && !Array.isArray(root.data)
    ? root.data as Record<string, unknown>
    : root;
  return Array.isArray(nested?.warnings)
    ? nested.warnings.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : [];
}

export const campaignManagementService = {
  /**
   * Live: GET /api/v1/campaign → CampaignResponse[] (Bearer employer token via apiClient).
   * Client-side search/status filters match existing list UI.
   */
  async listCampaigns(filters: CampaignFilters): Promise<EmployerCampaign[]> {
    const items: CampaignResponse[] = [];
    let cursor: string | undefined;
    do {
      const response = await apiClient.get<unknown>(campaignManagementEndpoints.list, {
        params: { limit: 500, ...(cursor ? { cursor } : {}) },
      });
      items.push(...parseCampaignResponseList(response.data));
      cursor = readNextCursorHeader(response.headers) ?? undefined;
    } while (cursor);
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

  async getCampaignSlots(id: string): Promise<CampaignSlotResponse[]> {
    const response = await apiClient.get<unknown>(campaignManagementEndpoints.slots(id));
    return parseCampaignSlots(response.data);
  },

  async createCampaignSlot(
    id: string,
    payload: CampaignSlotRequest,
  ): Promise<CampaignSlotResponse> {
    const response = await apiClient.post<unknown>(campaignManagementEndpoints.slots(id), payload);
    const slot = parseCampaignSlot(response.data);
    if (!slot) throw new Error('Invalid create campaign slot response');
    return slot;
  },

  async updateCampaignSlot(
    id: string,
    slotId: string,
    payload: CampaignSlotRequest,
  ): Promise<CampaignSlotResponse> {
    const response = await apiClient.put<unknown>(
      campaignManagementEndpoints.slot(id, slotId),
      payload,
    );
    const slot = parseCampaignSlot(response.data);
    if (!slot) throw new Error('Invalid update campaign slot response');
    return slot;
  },

  async deleteCampaignSlot(id: string, slotId: string): Promise<void> {
    await apiClient.delete(campaignManagementEndpoints.slot(id, slotId));
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

  /**
   * Live: POST /api/v1/campaign/{id}/questions/generate?count=
   * No request body. Optional `count` query. Returns CampaignResponse; questions replace fully.
   */
  async generateCampaignQuestions(
    params: GenerateCampaignQuestionsParams,
  ): Promise<EmployerCampaign> {
    const { campaignId, count } = params;
    if (count != null && (!Number.isInteger(count) || count < 1 || count > 20)) {
      throw new CampaignRequestError(400, 'INVALID_GENERATE_COUNT');
    }
    const response = await apiClient.post<unknown>(
      campaignManagementEndpoints.questionsGenerate(campaignId),
      undefined,
      {
        params: count == null ? undefined : { count },
      },
    );
    const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
    if (!parsed?.id?.trim()) {
      throw new Error('Invalid generate questions response: missing id');
    }
    const mapped = mapCampaignResponseToEmployerCampaign(parsed);
    campaigns = [mapped, ...campaigns.filter((item) => item.id !== mapped.id)];
    return mapped;
  },

  /** Live: POST /api/v1/campaign/{id}/questions/import — multipart `file`, Draft only. */
  async importCampaignQuestions(id: string, file: File): Promise<CampaignQuestionImportResult> {
    if (!isCampaignCsvFile(file)) {
      throw new CampaignRequestError(400, 'IMPORT_NOT_CSV');
    }
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<unknown>(
      campaignManagementEndpoints.questionsImport(id),
      formData,
      {
        transformRequest: [
          (data: unknown, headers?: Record<string, unknown>) => {
            if (data instanceof FormData && headers) delete headers['Content-Type'];
            return data;
          },
        ],
      },
    );
    return parseCampaignQuestionImport(response.data);
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
    return { campaign: mapped, warnings: readPublishWarnings(response.data) };
  },

  /** Publish first, then send the draft invitation list. Never sends before publish succeeds. */
  async deployCampaign(id: string, emails: string[]): Promise<CampaignDeployResult> {
    const published = await this.publishCampaign(id);
    if (emails.length === 0) return { ...published, invitations: null };
    let invitations: CreateCampaignInvitationsResponse;
    try {
      invitations = await this.createCampaignInvitations(id, { emails });
    } catch (error) {
      const status = error instanceof CampaignRequestError ? error.status : getApiStatusCode(error);
      const body = axios.isAxiosError(error) ? error.response?.data : error instanceof CampaignRequestError ? error.message : undefined;
      throw new CampaignInvitationDeployError(
        error instanceof Error ? error.message : 'INVITATIONS_FAILED',
        published.campaign,
        emails,
        status,
        body,
      );
    }
    return { ...published, invitations };
  },

  /** Live: POST /api/v1/campaign/{id}/start-now — open a future campaign immediately. */
  async startCampaignNow(id: string): Promise<EmployerCampaign> {
    const response = await apiClient.post<unknown>(campaignManagementEndpoints.startNow(id), undefined);
    const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
    if (!parsed?.id?.trim()) throw new Error('Invalid start-now response');
    const mapped = mapCampaignResponseToEmployerCampaign(parsed);
    campaigns = [mapped, ...campaigns.filter((item) => item.id !== mapped.id)];
    return mapped;
  },

  /**
   * Live: PUT /api/v1/campaign/{id}/status — Active→Closed→Archived.
   * Draft→Active uses publish. Invalid transitions → 409.
   */
  async updateCampaignStatus(
    id: string,
    status: CampaignStatusUpdateRequest['status'],
  ): Promise<EmployerCampaign> {
    const response = await apiClient.put<unknown>(campaignManagementEndpoints.status(id), {
      status,
    } satisfies CampaignStatusUpdateRequest);
    const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
    if (!parsed?.id?.trim()) {
      throw new Error('Invalid update campaign status response: missing id');
    }
    const mapped = mapCampaignResponseToEmployerCampaign(parsed);
    campaigns = [mapped, ...campaigns.filter((item) => item.id !== mapped.id)];
    return mapped;
  },

  /** Live: DELETE /api/v1/campaign/{id} — soft-delete (204). */
  async deleteCampaign(id: string): Promise<void> {
    await apiClient.delete(campaignManagementEndpoints.delete(id));
    campaigns = campaigns.filter((item) => item.id !== id);
  },

  /**
   * Live: POST /api/v1/campaign/{id}/invitations — invite by email list (Active only).
   * Body `{ emails }` (non-empty). 200 → `{ created, failed }`. Errors: 400 · 404 · 409.
   */
  async createCampaignInvitations(
    id: string,
    payload: CreateCampaignInvitationsRequest,
  ): Promise<CreateCampaignInvitationsResponse> {
    const emails = Array.from(
      new Set(
        payload.emails
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean),
      ),
    );
    if (emails.length === 0) {
      throw new CampaignRequestError(400, 'EMPTY_EMAILS');
    }

    const response = await apiClient.post<unknown>(
      campaignManagementEndpoints.invitations(id),
      { emails } satisfies CreateCampaignInvitationsRequest,
    );
    return unwrapInviteByEmailPayload(response.data);
  },

  /**
   * Live: GET /api/v1/campaign/{id}/invitations?cursor&limit
   * Body = CampaignInvitation[]. Next page via response header `X-Next-Cursor`.
   */
  async getCampaignInvitations(
    id: string,
    query?: GetCampaignInvitationsQuery,
  ): Promise<CampaignInvitationsPage> {
    if (!isLiveCampaignId(id)) {
      throw new CampaignRequestError(400, 'Invalid campaign id');
    }

    const response = await apiClient.get<unknown>(campaignManagementEndpoints.invitations(id), {
      params: {
        ...(query?.cursor ? { cursor: query.cursor } : {}),
        ...(query?.limit != null ? { limit: Math.min(500, Math.max(1, query.limit)) } : {}),
        ...(query?.status ? { status: query.status } : {}),
        ...(query?.search?.trim() ? { search: query.search.trim() } : {}),
      },
    });
    return parseCampaignInvitationsPage(response.data, response.headers);
  },

  /**
   * Live: POST /api/v1/campaign/{id}/invitations/{invitationId}/reissue — no body.
   * Returns the newly issued invitation stub; list must be refetched for Revoked + new rows.
   */
  async reissueCampaignInvitation(
    campaignId: string,
    invitationId: string,
  ): Promise<ReissuedCampaignInvitation> {
    const response = await apiClient.post<unknown>(
      campaignManagementEndpoints.invitationReissue(campaignId, invitationId),
      null,
    );
    const root =
      response.data && typeof response.data === 'object' && !Array.isArray(response.data)
        ? (response.data as Record<string, unknown>)
        : null;
    const inner =
      root && root.data && typeof root.data === 'object' && !Array.isArray(root.data)
        ? (root.data as Record<string, unknown>)
        : root;
    if (!inner) {
      throw new Error('Invalid reissue response');
    }
    const id =
      typeof inner.id === 'string'
        ? inner.id
        : typeof inner.Id === 'string'
          ? inner.Id
          : '';
    const email =
      typeof inner.email === 'string'
        ? inner.email
        : typeof inner.Email === 'string'
          ? inner.Email
          : '';
    const expiresAt =
      typeof inner.expiresAt === 'string'
        ? inner.expiresAt
        : typeof inner.ExpiresAt === 'string'
          ? inner.ExpiresAt
          : '';
    if (!id.trim() || !email.trim() || !expiresAt.trim()) {
      throw new Error('Invalid reissue response');
    }
    return {
      id: id.trim(),
      email: email.trim().toLowerCase(),
      expiresAt: expiresAt.trim(),
    };
  },

  /** Maps invitation response onto local InviteResolution (legacy callers). */
  async inviteCandidates(id: string, emails: string[]): Promise<InviteResolution> {
    const payload = await this.createCampaignInvitations(id, { emails });

    const linked: CampaignCandidateRow[] = payload.created.map((item) => ({
      email: item.email,
      status: 'invited' as const,
    }));
    const rejected = payload.failed.map((item) => ({
      email: item.email,
      reason: item.reason,
    }));

    const existing = campaigns.find((item) => item.id === id);
    const base =
      existing ??
      ({
        id,
        title: '',
        company: '',
        location: '',
        mode: 'remote' as const,
        status: 'active' as const,
        summary: '',
        jobDescription: '',
        capacity: 0,
        applicants: 0,
        deadline: '',
        durationMinutes: 0,
        locale: 'vi' as const,
        rubric: [],
        questions: [],
        jobNeeds: [],
        invitedEmails: [],
        candidates: [],
        proctoring: DEFAULT_PROCTORING,
        welcomeMessage: '',
        completionMessage: '',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      } satisfies EmployerCampaign);

    const candidates = mergeCandidates(base.candidates, linked);
    const invitedEmails = Array.from(
      new Set([...base.invitedEmails, ...linked.map((row) => row.email)]),
    );
    const updated: EmployerCampaign = {
      ...base,
      candidates,
      invitedEmails,
      applicants: candidates.length,
      updatedAt: new Date().toISOString(),
    };
    campaigns = [updated, ...campaigns.filter((item) => item.id !== id)];

    return {
      campaign: updated,
      created: payload.created,
      linked,
      pending: [],
      rejected,
    };
  },

  /**
   * Live: POST /api/v1/campaign/{id}/files — first upload (multipart jdFile / criteriaFile).
   * Send only the field that changed.
   */
  async uploadCampaignFiles(
    id: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
  ): Promise<EmployerCampaign> {
    return this.sendCampaignFiles(id, files, 'post');
  },

  /**
   * Live: PUT /api/v1/campaign/{id}/files — replace (Draft only).
   * Send only the field that changed.
   */
  async replaceCampaignFiles(
    id: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
  ): Promise<EmployerCampaign> {
    return this.sendCampaignFiles(id, files, 'put');
  },

  /** @deprecated Prefer uploadCampaignFiles / replaceCampaignFiles. */
  async uploadCampaignJdFile(id: string, jdFile: File): Promise<EmployerCampaign> {
    return this.uploadCampaignFiles(id, { jdFile });
  },

  /**
   * Live: POST /api/v1/campaign/{id}/files/download?fileType=jd|criteria — PDF blob.
   */
  async downloadCampaignFile(
    id: string,
    fileType: CampaignFileType,
  ): Promise<BlobDownloadResult> {
    const response = await apiClient.post<Blob>(
      campaignManagementEndpoints.filesDownload(id),
      undefined,
      {
        params: { fileType },
        responseType: 'blob',
      },
    );

    const header = response.headers?.['content-disposition'] as string | undefined;
    return {
      blob: response.data,
      filename: parseContentDispositionFilename(header),
    };
  },

  async sendCampaignFiles(
    id: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
    method: 'post' | 'put',
  ): Promise<EmployerCampaign> {
    const jdFile = files.jdFile ?? null;
    const criteriaFile = files.criteriaFile ?? null;
    if (!jdFile && !criteriaFile) {
      throw new CampaignRequestError(400, 'NO_FILES');
    }

    const validate = (file: File, label: string) => {
      const code = validateCampaignPdf(file);
      if (code === 'notPdf') throw new CampaignRequestError(400, `${label}_NOT_PDF`);
      if (code === 'tooLarge') throw new CampaignRequestError(400, `${label}_TOO_LARGE`);
      if (code === 'corrupt') throw new CampaignRequestError(400, `${label}_CORRUPT`);
    };
    if (jdFile) validate(jdFile, 'JD');
    if (criteriaFile) validate(criteriaFile, 'CRITERIA');

    const formData = new FormData();
    if (jdFile) formData.append('jdFile', jdFile);
    if (criteriaFile) formData.append('criteriaFile', criteriaFile);

    const url = campaignManagementEndpoints.files(id);
    const formDataConfig = {
      transformRequest: [
        (data: unknown, headers?: Record<string, unknown>) => {
          if (data instanceof FormData && headers) {
            delete headers['Content-Type'];
          }
          return data;
        },
      ],
    };
    const request =
      method === 'put'
        ? apiClient.put<unknown>(url, formData, formDataConfig)
        : apiClient.post<unknown>(url, formData, formDataConfig);

    const response = await request;
    const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
    if (!parsed?.id?.trim()) {
      throw new Error('Invalid upload campaign files response: missing id');
    }
    const mapped = mapCampaignResponseToEmployerCampaign(parsed);
    rememberCampaignAttachments(mapped.id, { jdFile, criteriaFile });
    campaigns = [mapped, ...campaigns.filter((item) => item.id !== mapped.id)];
    return mapped;
  },

  /**
   * Live: POST /api/v1/campaign/{id}/candidates — multipart `files` (202 Accepted).
   * Call only when campaign is Active and Employer presses Analyze.
   */
  async analyzeCandidateCvs(id: string, files: File[]): Promise<CandidateUploadResponse> {
    if (!files.length) throw new CampaignRequestError(400, 'NO_FILES');
    for (const file of files) {
      const code = validateCampaignPdf(file);
      if (code === 'notPdf') throw new CampaignRequestError(400, 'NOT_PDF');
      if (code === 'tooLarge') throw new CampaignRequestError(400, 'TOO_LARGE');
      if (code === 'corrupt') throw new CampaignRequestError(400, 'CORRUPT');
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await apiClient.post<unknown>(
      campaignManagementEndpoints.candidates(id),
      formData,
      {
        transformRequest: [
          (data: unknown, headers?: Record<string, unknown>) => {
            if (data instanceof FormData && headers) {
              delete headers['Content-Type'];
            }
            return data;
          },
        ],
        validateStatus: (status) => status === 202,
      },
    );
    return parseCandidateUploadResponse(response.data);
  },

  /** @deprecated Prefer analyzeCandidateCvs. */
  async uploadCandidateCvs(id: string, files: File[]): Promise<CandidateUploadResponse> {
    return this.analyzeCandidateCvs(id, files);
  },

  /** Live: GET /api/v1/campaign/{id}/candidates — consume every cursor page. */
  async getCampaignCandidates(
    id: string,
    query?: CandidateListQuery,
  ): Promise<CampaignCandidateListItem[]> {
    const response = await apiClient.get<unknown>(campaignManagementEndpoints.candidates(id), {
      params: buildCandidateListParams(query),
    });
    const items = unwrapArrayPayload(response.data)
      .map(parseCandidateListItem)
      .filter((item): item is CampaignCandidateListItem => item != null);
    const nextCursor = readNextCursorHeader(response.headers);
    if (!nextCursor) return items;
    const next = await this.getCampaignCandidates(id, { ...query, cursor: nextCursor });
    return [...items, ...next];
  },

  /** Live: GET /api/v1/campaign/{id}/candidates/{candidateId} */
  async getCampaignCandidateDetail(
    id: string,
    candidateId: string,
  ): Promise<CampaignCandidateDetail> {
    const response = await apiClient.get<unknown>(
      campaignManagementEndpoints.candidateDetail(id, candidateId),
    );
    const parsed = parseCandidateDetail(response.data);
    if (!parsed) throw new CampaignRequestError(404, 'CANDIDATE_NOT_FOUND');
    return parsed;
  },

  /**
   * Live: PATCH /api/v1/campaign/{id}/candidates/{candidateId}
   * Body may include only changed fields. 204 No Content — do not parse JSON.
   */
  async updateCampaignCandidate(
    id: string,
    candidateId: string,
    payload: UpdateCampaignCandidatePayload,
  ): Promise<void> {
    const body: UpdateCampaignCandidatePayload = {};
    if (typeof payload.email === 'string') body.email = payload.email;
    if (typeof payload.fullName === 'string') body.fullName = payload.fullName;
    if (Object.keys(body).length === 0) {
      throw new CampaignRequestError(400, 'EMPTY_CANDIDATE_PATCH');
    }
    await apiClient.patch(campaignManagementEndpoints.candidateDetail(id, candidateId), body, {
      validateStatus: (status) => status === 204 || status === 200,
    });
  },

  /** Live: PUT /api/v1/campaign/{id}/job-needs — replace-all array body. */
  async updateCampaignJobNeeds(
    id: string,
    jobNeeds: UpdateCampaignJobNeedsRequest[],
  ): Promise<EmployerCampaign> {
    const body = jobNeeds
      .map((item) => ({
        ...(item.needId?.trim() ? { needId: item.needId.trim() } : {}),
        category: item.category,
        text: item.text.trim(),
        isMustHave: Boolean(item.isMustHave),
      }))
      .filter((item) => item.text.length > 0);
    const response = await apiClient.put<unknown>(campaignManagementEndpoints.jobNeeds(id), body);
    const parsed = parseCampaignResponse(unwrapCampaignDetailPayload(response.data));
    if (!parsed) throw new Error('Invalid job needs response');
    return mapCampaignResponseToEmployerCampaign(parsed);
  },

  /** Live: POST /api/v1/campaign/{id}/job-needs/suggest — derive needs from the saved JD. */
  /**
   * POST /job-needs/suggest → PUT /job-needs.
   *
   * ⚠ HAI điều dễ làm sai, đã cắn một lần:
   * 1. Response là `{ jobNeeds: [...] }` — KHÔNG có `id`/`title`, nên `parseCampaignResponse`
   *    trả null và bản trước ném "Invalid suggested job needs response" ở MỌI lần gọi, kể cả
   *    khi server trả 200. Giao diện luôn báo "không tự đọc được nhu cầu" ⇒ nút phân tích CV
   *    khoá vĩnh viễn ⇒ toàn bộ đường sàng CV ở bước 7 chết.
   * 2. Endpoint CHỈ ĐỌC — nó không ghi `campaigns.job_needs`. Chỉ nhận gợi ý rồi giữ trong
   *    state là chưa đủ: chốt CMP3-B1 phía server đòi job_needs ĐÃ LƯU, nên sàng CV vẫn 409.
   *    Vì vậy phải lưu tiếp qua PUT /job-needs (một cửa ghi duy nhất).
   */
  async suggestCampaignJobNeeds(id: string): Promise<EmployerCampaign> {
    const response = await apiClient.post<unknown>(campaignManagementEndpoints.jobNeedsSuggest(id));
    const payload = response.data as { jobNeeds?: unknown; JobNeeds?: unknown } | null;
    const raw = Array.isArray(payload?.jobNeeds)
      ? payload.jobNeeds
      : Array.isArray(payload?.JobNeeds)
        ? payload.JobNeeds
        : [];
    const suggested = raw
      .map((item) => item as { category?: string; text?: string })
      .filter((item) => typeof item?.text === 'string' && item.text.trim())
      .map((item) => ({
        category: (item.category ?? 'Technical') as UpdateCampaignJobNeedsRequest['category'],
        text: (item.text ?? '').trim(),
        isMustHave: false,
      } satisfies UpdateCampaignJobNeedsRequest));
    if (!suggested.length) throw new Error('EMPTY_SUGGESTED_JOB_NEEDS');
    return this.updateCampaignJobNeeds(id, suggested);
  },

  /** Live: POST /api/v1/campaign/{id}/candidates/{candidateId}/rescreen (202). */
  async rescreenCampaignCandidate(id: string, candidateId: string): Promise<void> {
    await apiClient.post(campaignManagementEndpoints.candidateRescreen(id, candidateId), undefined, {
      validateStatus: (status) => status === 202,
    });
  },

  /**
   * Live: GET /api/v1/campaign/{id}/candidates/{candidateId}/cv — PDF blob.
   */
  async getCampaignCandidateCv(id: string, candidateId: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      campaignManagementEndpoints.candidateCv(id, candidateId),
      { responseType: 'blob' },
    );
    const blob = response.data;
    if (!(blob instanceof Blob) || blob.size <= 0) {
      throw new CampaignRequestError(404, 'CANDIDATE_CV_NOT_FOUND');
    }
    return blob.type === 'application/pdf'
      ? blob
      : new Blob([blob], { type: 'application/pdf' });
  },

  /**
   * Live: POST /api/v1/campaign/{id}/candidates/invite — `{ candidateIds }`.
   */
  async inviteCampaignCandidates(
    id: string,
    payload: InviteCampaignCandidatesRequest,
  ): Promise<InviteCampaignCandidatesResponse> {
    const candidateIds = Array.from(
      new Set(payload.candidateIds.map((item) => item.trim()).filter(Boolean)),
    );
    if (candidateIds.length === 0) {
      throw new CampaignRequestError(400, 'EMPTY_CANDIDATE_IDS');
    }
    const response = await apiClient.post<unknown>(
      campaignManagementEndpoints.inviteCandidates(id),
      { candidateIds, ...(payload.includeIneligible ? { includeIneligible: true } : {}) } satisfies InviteCampaignCandidatesRequest,
    );
    return parseInviteByCandidateIdsResponse(response.data);
  },

  /** @deprecated Prefer inviteCampaignCandidates. */
  async inviteCandidateIds(
    id: string,
    candidateIds: string[],
  ): Promise<InviteCampaignCandidatesResponse> {
    return this.inviteCampaignCandidates(id, { candidateIds });
  },

  /** Live: GET /api/v1/campaign/{id}/results — scored interview ranking only. */
  async getCampaignResults(id: string): Promise<CampaignResultsResponse> {
    const response = await apiClient.get<unknown>(campaignManagementEndpoints.results(id));
    return parseCampaignResultsResponse(response.data);
  },

  /** Live: GET /api/v1/campaign/{id}/results/export?format=csv|pdf — binary blob. */
  async exportCampaignResults(
    id: string,
    format: CampaignResultExportFormat = 'csv',
  ): Promise<{ blob: Blob; filename?: string }> {
    const response = await apiClient.get<Blob>(campaignManagementEndpoints.resultsExport(id), {
      params: { format },
      responseType: 'blob',
    });
    const blob = response.data;
    if (!(blob instanceof Blob) || blob.size <= 0) {
      throw new CampaignRequestError(404, 'RESULTS_EXPORT_EMPTY');
    }
    const disposition = response.headers?.['content-disposition'] as string | undefined;
    return {
      blob,
      filename: parseContentDispositionFilename(disposition),
    };
  },

  /** Live: GET /api/v1/campaign/{id}/results/{sessionId}/transcript */
  async getCampaignResultTranscript(
    id: string,
    sessionId: string,
  ): Promise<CampaignTranscriptResponse> {
    const response = await apiClient.get<unknown>(
      campaignManagementEndpoints.resultTranscript(id, sessionId),
    );
    return parseCampaignTranscriptResponse(response.data);
  },

  /**
   * Live: PUT /api/v1/campaign/{id}/results/{sessionId}/override
   * 204 No Content — do not parse JSON.
   */
  async overrideCampaignResult(
    id: string,
    sessionId: string,
    payload: OverrideCampaignResultPayload,
  ): Promise<void> {
    const note = payload.note.trim();
    if (!note) throw new CampaignRequestError(400, 'OVERRIDE_NOTE_REQUIRED');
    await apiClient.put(
      campaignManagementEndpoints.resultOverride(id, sessionId),
      {
        score: payload.score,
        result: payload.result,
        note,
      } satisfies OverrideCampaignResultPayload,
      { validateStatus: (status) => status === 204 },
    );
  },

};
