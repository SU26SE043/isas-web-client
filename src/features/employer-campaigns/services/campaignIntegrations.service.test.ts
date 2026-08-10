import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { campaignIntegrationsEndpoints } from './campaignIntegrations.endpoints';
import { campaignIntegrationsParsers, campaignIntegrationsService } from './campaignIntegrations.service';

describe('campaign integrations API', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('creates an API key with v10 expiry and PII fields', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        id: 'key-1', name: 'ATS', key: 'secret', keyPrefix: 'isas_', includePii: false,
        expiresAt: '2027-01-01T00:00:00Z', createdAt: '2026-08-10T00:00:00Z',
      },
    } as never);

    await expect(campaignIntegrationsService.createApiKey({ name: ' ATS ', expiresInDays: 730 })).resolves.toMatchObject({
      id: 'key-1', key: 'secret', expiresAt: '2027-01-01T00:00:00Z',
    });
    expect(post).toHaveBeenCalledWith(campaignIntegrationsEndpoints.apiKeys, {
      name: 'ATS', expiresInDays: 730, includePii: false,
    });
  });

  it('rejects invalid API key expiry before sending a request', async () => {
    const post = vi.spyOn(apiClient, 'post');
    await expect(campaignIntegrationsService.createApiKey({ name: 'ATS', expiresInDays: 731 })).rejects.toThrow('API_KEY_EXPIRY_INVALID');
    expect(post).not.toHaveBeenCalled();
  });

  it('uses X-Api-Key without Bearer for ATS public endpoints', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: [{ id: 'campaign-1' }], headers: { 'x-next-cursor': 'next' },
    } as never);
    await expect(campaignIntegrationsService.listPublicCampaigns('secret', { limit: 20 })).resolves.toEqual({
      items: [{ id: 'campaign-1' }], nextCursor: 'next',
    });
    expect(get).toHaveBeenCalledWith(campaignIntegrationsEndpoints.publicCampaigns, expect.objectContaining({
      skipAuth: true,
      headers: { 'X-Api-Key': 'secret' },
      params: { limit: 20 },
    }));
  });

  it('parses list envelopes and preserves key metadata', () => {
    expect(campaignIntegrationsParsers.parseApiKeySummary({
      id: 'key-1', name: 'ATS', keyPrefix: 'isas_', includePii: true, isActive: true,
      expiresAt: '2027-01-01T00:00:00Z', lastUsedAt: null, revokedAt: null, createdAt: '2026-08-10T00:00:00Z',
    })).toMatchObject({ id: 'key-1', includePii: true, isActive: true });
    expect(campaignIntegrationsParsers.unwrapList({ data: { items: [{ id: 1 }] } })).toEqual([{ id: 1 }]);
  });
});
