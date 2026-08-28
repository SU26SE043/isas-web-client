import { describe, expect, it } from 'vitest';
import type { CampaignCandidateListItem } from '../types/campaign.api.types';
import {
  CAMPAIGN_CANDIDATES_POLL_INTERVAL_MS,
  getCampaignCandidatesRefetchInterval,
} from './campaignCandidatesPolling';

const candidate = (status: string): CampaignCandidateListItem => ({
  id: status,
  status,
});

describe('getCampaignCandidatesRefetchInterval', () => {
  it('polls while a candidate is still analyzing', () => {
    expect(getCampaignCandidatesRefetchInterval([candidate('Analyzing')])).toBe(
      CAMPAIGN_CANDIDATES_POLL_INTERVAL_MS,
    );
  });

  it('polls while a candidate is queued in filtered status', () => {
    expect(getCampaignCandidatesRefetchInterval([candidate('Filtered')])).toBe(
      CAMPAIGN_CANDIDATES_POLL_INTERVAL_MS,
    );
  });

  it('stops polling when screening is complete or the list is empty', () => {
    expect(getCampaignCandidatesRefetchInterval([candidate('Analyzed')])).toBe(false);
    expect(getCampaignCandidatesRefetchInterval([])).toBe(false);
    expect(getCampaignCandidatesRefetchInterval(undefined)).toBe(false);
  });
});
