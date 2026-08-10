import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { CampaignCandidateError, campaignCandidateService } from './campaignCandidate.service';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { post: vi.fn() },
}));

const mockedApiClient = vi.mocked(apiClient);

function forbiddenResponse(data: Record<string, unknown>) {
  return {
    isAxiosError: true,
    response: { status: 403, data, headers: {} },
  };
}

describe('campaignCandidateService.joinCampaignByToken', () => {
  it('classifies the backend invitation-email mismatch code without relying on 403 alone', async () => {
    mockedApiClient.post.mockRejectedValue(
      forbiddenResponse({ code: 'INVITATION_EMAIL_MISMATCH', message: 'Invitation email does not match current user' }),
    );

    await expect(campaignCandidateService.joinCampaignByToken('invite-token')).rejects.toMatchObject({
      code: 'emailMismatch',
      status: 403,
      apiCode: 'INVITATION_EMAIL_MISMATCH',
    } satisfies Partial<CampaignCandidateError>);
  });

  it('keeps other forbidden responses as forbidden', async () => {
    mockedApiClient.post.mockRejectedValue(forbiddenResponse({ code: 'CAMPAIGN_CLOSED', message: 'Campaign closed' }));

    await expect(campaignCandidateService.joinCampaignByToken('invite-token')).rejects.toMatchObject({
      code: 'forbidden',
      status: 403,
      apiCode: 'CAMPAIGN_CLOSED',
    } satisfies Partial<CampaignCandidateError>);
  });
});
