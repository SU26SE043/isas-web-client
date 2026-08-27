import { describe, expect, it } from 'vitest';
import { resolveCampaignErrorStep } from './useCampaignWizard';

describe('campaign wizard API error step mapping', () => {
  it('maps validation fields to the affected wizard step', () => {
    expect(resolveCampaignErrorStep('request: maxScore must be <= 10', 'create')).toBe(2);
    expect(resolveCampaignErrorStep('request: maxQuestions is invalid', 'update')).toBe(4);
    expect(resolveCampaignErrorStep('request: questionText is required', 'questions')).toBe(3);
    expect(resolveCampaignErrorStep('request: startsAt must be in the future', 'create')).toBe(0);
    expect(resolveCampaignErrorStep('request: jdText is required', 'create')).toBe(1);
  });
});
