import { describe, expect, it } from 'vitest';
import { isB2bCampaignSessionId } from './campaignInterviewSession';

describe('campaignInterviewSession', () => {
  it('treats campaign- prefix as B2B session', () => {
    expect(isB2bCampaignSessionId('campaign-abc')).toBe(true);
  });

  it('does not treat random ids as B2B without stored context', () => {
    expect(isB2bCampaignSessionId('practice-xyz')).toBe(false);
  });
});
