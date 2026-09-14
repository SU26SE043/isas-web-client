import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { campaignManagementEndpoints } from './campaignManagement.endpoints';
import { campaignManagementService } from './campaignManagement.service';

describe('campaign result detail API', () => {
  beforeEach(() => vi.restoreAllMocks());
  it('gets parsed override history', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { sessionId: 's1', items: [] } } as never);
    await expect(campaignManagementService.getCampaignResultOverrideHistory('c1', 's1')).resolves.toEqual({ sessionId: 's1', items: [] });
    expect(get).toHaveBeenCalledWith(campaignManagementEndpoints.resultOverrideHistory('c1', 's1'));
  });
  it('gets answer audio as a blob', async () => {
    const blob = new Blob(['audio'], { type: 'audio/webm' });
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: blob } as never);
    await expect(campaignManagementService.getCampaignResultAnswerAudio('c1', 's1', 'a1')).resolves.toBe(blob);
    expect(get).toHaveBeenCalledWith(campaignManagementEndpoints.resultAnswerAudio('c1', 's1', 'a1'), { responseType: 'blob' });
  });
});
