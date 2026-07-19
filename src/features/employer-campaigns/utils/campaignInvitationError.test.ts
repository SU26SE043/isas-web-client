import { describe, expect, it } from 'vitest';
import { CampaignRequestError } from '../services/campaignManagement.service';
import {
  getCampaignInvitationError,
  getCampaignInvitationErrorKey,
} from './campaignInvitationError';

describe('campaignInvitationError', () => {
  it('maps 409/404/400 status codes to keys', () => {
    expect(getCampaignInvitationErrorKey(new CampaignRequestError(409, 'conflict'))).toBe(
      'employer.campaigns.emailInvitations.errors.campaignNotActiveConflict',
    );
    expect(getCampaignInvitationErrorKey(new CampaignRequestError(404, 'missing'))).toBe(
      'employer.campaigns.emailInvitations.errors.campaignNotFound',
    );
    expect(getCampaignInvitationErrorKey(new CampaignRequestError(400, 'EMPTY_EMAILS'))).toBe(
      'employer.campaigns.emailInvitations.errors.emptyList',
    );
    expect(getCampaignInvitationErrorKey(new CampaignRequestError(400, 'max candidates'))).toBe(
      'employer.campaigns.emailInvitations.errors.maxCandidates',
    );
  });

  it('prefers backend string reasons when present', () => {
    expect(getCampaignInvitationError(new CampaignRequestError(400, 'Quota exceeded'), 'fallback')).toBe(
      'Quota exceeded',
    );
  });
});
