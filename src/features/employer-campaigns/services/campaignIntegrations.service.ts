import { apiClient } from '@/shared/api/apiClient';
import { campaignIntegrationsEndpoints } from './campaignIntegrations.endpoints';
import type {
  CampaignApiKeySummary,
  CreateCampaignApiKeyRequest,
  CreatedCampaignApiKey,
  CursorPage,
  PublicCampaignResult,
  PublicCampaignResultsResponse,
  PublicCampaignSummary,
} from './campaignIntegrations.types';

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('INVALID_CAMPAIGN_INTEGRATION_RESPONSE');
  }
  const raw = value as Record<string, unknown>;
  return raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
    ? raw.data as Record<string, unknown>
    : raw;
}

function unwrapList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const raw = value as Record<string, unknown>;
  if (Array.isArray(raw.data)) return raw.data;
  if (raw.data && typeof raw.data === 'object') {
    const nested = raw.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.results)) return nested.results;
  }
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.results)) return raw.results;
  return [];
}

function text(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

function nullableText(value: unknown): string | null {
  const result = text(value);
  return result || null;
}

function boolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function parseCreatedApiKey(value: unknown): CreatedCampaignApiKey {
  const raw = record(value);
  const parsed = {
    id: text(raw.id),
    name: text(raw.name),
    key: text(raw.key),
    keyPrefix: text(raw.keyPrefix),
    includePii: boolean(raw.includePii),
    expiresAt: text(raw.expiresAt),
    createdAt: text(raw.createdAt),
  };
  if (!parsed.id || !parsed.name || !parsed.key || !parsed.keyPrefix || !parsed.expiresAt) {
    throw new Error('INVALID_CAMPAIGN_API_KEY_RESPONSE');
  }
  return parsed;
}

function parseApiKeySummary(value: unknown): CampaignApiKeySummary {
  const raw = record(value);
  const parsed = {
    id: text(raw.id),
    name: text(raw.name),
    keyPrefix: text(raw.keyPrefix),
    includePii: boolean(raw.includePii),
    isActive: boolean(raw.isActive),
    expiresAt: text(raw.expiresAt),
    lastUsedAt: nullableText(raw.lastUsedAt),
    revokedAt: nullableText(raw.revokedAt),
    createdAt: text(raw.createdAt),
  };
  if (!parsed.id || !parsed.name || !parsed.keyPrefix || !parsed.expiresAt) {
    throw new Error('INVALID_CAMPAIGN_API_KEY_RESPONSE');
  }
  return parsed;
}

function nextCursor(headers: unknown): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const source = headers as Record<string, unknown> & { get?: (key: string) => unknown };
  const value = typeof source.get === 'function'
    ? source.get('x-next-cursor') ?? source.get('X-Next-Cursor')
    : source['x-next-cursor'] ?? source['X-Next-Cursor'];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function pageParams(cursor?: string | null, limit?: number) {
  return {
    ...(cursor ? { cursor } : {}),
    ...(limit == null ? {} : { limit: Math.min(100, Math.max(1, Math.trunc(limit))) }),
  };
}

function publicHeaders(apiKey: string) {
  const trimmed = apiKey.trim();
  if (!trimmed) throw new Error('API_KEY_REQUIRED');
  return { skipAuth: true, headers: { 'X-Api-Key': trimmed } } as const;
}

export const campaignIntegrationsService = {
  async createApiKey(payload: CreateCampaignApiKeyRequest): Promise<CreatedCampaignApiKey> {
    const name = payload.name.trim();
    if (!name) throw new Error('API_KEY_NAME_REQUIRED');
    const expiresInDays = payload.expiresInDays;
    if (expiresInDays != null && (!Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > 730)) {
      throw new Error('API_KEY_EXPIRY_INVALID');
    }
    const response = await apiClient.post<unknown>(campaignIntegrationsEndpoints.apiKeys, {
      name,
      ...(expiresInDays == null ? {} : { expiresInDays }),
      includePii: payload.includePii === true,
    });
    return parseCreatedApiKey(response.data);
  },

  async listApiKeys(): Promise<CampaignApiKeySummary[]> {
    const response = await apiClient.get<unknown>(campaignIntegrationsEndpoints.apiKeys);
    return unwrapList(response.data).map(parseApiKeySummary);
  },

  async revokeApiKey(id: string): Promise<void> {
    const trimmed = id.trim();
    if (!trimmed) throw new Error('API_KEY_ID_REQUIRED');
    await apiClient.delete(campaignIntegrationsEndpoints.apiKey(trimmed));
  },

  async listPublicCampaigns(
    apiKey: string,
    query?: { cursor?: string | null; limit?: number },
  ): Promise<CursorPage<PublicCampaignSummary>> {
    const response = await apiClient.get<unknown>(campaignIntegrationsEndpoints.publicCampaigns, {
      ...publicHeaders(apiKey),
      params: pageParams(query?.cursor, query?.limit),
    });
    return { items: unwrapList(response.data) as PublicCampaignSummary[], nextCursor: nextCursor(response.headers) };
  },

  async getPublicCampaignResults(apiKey: string, campaignId: string): Promise<PublicCampaignResultsResponse> {
    const trimmed = campaignId.trim();
    if (!trimmed) throw new Error('CAMPAIGN_ID_REQUIRED');
    const response = await apiClient.get<unknown>(campaignIntegrationsEndpoints.publicResults(trimmed), publicHeaders(apiKey));
    const raw = response.data && typeof response.data === 'object' && !Array.isArray(response.data)
      ? response.data as Record<string, unknown>
      : {};
    return {
      results: unwrapList(response.data) as PublicCampaignResult[],
      piiIncluded: raw.piiIncluded === true,
    };
  },
};

export const campaignIntegrationsParsers = { parseCreatedApiKey, parseApiKeySummary, nextCursor, unwrapList };
