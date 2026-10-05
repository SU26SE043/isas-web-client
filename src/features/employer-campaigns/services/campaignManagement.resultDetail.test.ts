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
  it('gets the per-event flag timeline from /results/{sessionId}/flags', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { sessionId: 's1', candidateId: 'cand-1', events: [{ signalType: 'no_face', detectedAt: '2026-10-05T01:39:07Z', note: null }] },
    } as never);
    await expect(campaignManagementService.getCampaignResultFlagTimeline('c1', 's1')).resolves.toEqual({
      sessionId: 's1',
      candidateId: 'cand-1',
      events: [{ signalType: 'no_face', detectedAt: '2026-10-05T01:39:07Z', note: null }],
    });
    expect(get).toHaveBeenCalledWith(campaignManagementEndpoints.resultFlagTimeline('c1', 's1'));
    expect(campaignManagementEndpoints.resultFlagTimeline('c1', 's1')).toMatch(/\/c1\/results\/s1\/flags$/);
  });
  // SPA fallback trả index.html mã 200 cho API chưa có — đọc dễ dãi sẽ thành "0 sự kiện" (nói dối là sạch).
  it('throws instead of returning an empty timeline when the body is not a timeline', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: '<!doctype html><html></html>' } as never);
    await expect(campaignManagementService.getCampaignResultFlagTimeline('c1', 's1')).rejects.toMatchObject({ status: 502 });
  });
  it('gets answer audio as a blob', async () => {
    const blob = new Blob(['audio'], { type: 'audio/webm' });
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: blob } as never);
    await expect(campaignManagementService.getCampaignResultAnswerAudio('c1', 's1', 'a1')).resolves.toBe(blob);
    expect(get).toHaveBeenCalledWith(campaignManagementEndpoints.resultAnswerAudio('c1', 's1', 'a1'), { responseType: 'blob' });
  });
});
