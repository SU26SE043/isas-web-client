import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { campaignManagementEndpoints } from './campaignManagement.endpoints';
import { campaignManagementService } from './campaignManagement.service';

const campaignId = 'campaign-1';

afterEach(() => vi.restoreAllMocks());

describe('inviteCampaignCandidates', () => {
  it('posts candidateIds and leaves includeIneligible unset by default', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { invited: [], failed: [{ candidateId: 'candidate-2', reason: 'No email' }] },
    } as never);

    const result = await campaignManagementService.inviteCampaignCandidates(campaignId, {
      candidateIds: ['candidate-1', 'candidate-2'],
    });

    expect(post).toHaveBeenCalledWith(
      campaignManagementEndpoints.inviteCandidates(campaignId),
      { candidateIds: ['candidate-1', 'candidate-2'] },
    );
    expect(result.failed).toEqual([{ candidateId: 'candidate-2', reason: 'No email' }]);
  });
});
