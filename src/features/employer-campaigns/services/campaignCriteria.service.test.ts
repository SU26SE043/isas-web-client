import { describe, expect, it } from 'vitest';
import { parseCampaignCriteriaPreview } from './campaignCriteria.service';

describe('parseCampaignCriteriaPreview', () => {
  it('keeps the server description, max score, and score anchors', () => {
    expect(parseCampaignCriteriaPreview({
      JobCategory: 'BE',
      Language: 'en',
      Criteria: [{
        Name: 'Technical depth',
        Description: 'Reason about trade-offs',
        Weight: 25,
        MaxScore: 7,
        LevelCount: 2,
        Levels: [{ Score: 0, Descriptor: 'No evidence' }, { Score: 7, Descriptor: 'Strong evidence' }],
      }],
    })).toEqual({
      jobCategory: 'BE', language: 'en',
      criteria: [{ id: 'system-1', name: 'Technical depth', description: 'Reason about trade-offs', weight: 25, maxScore: 7, levelCount: 2, levels: [{ score: 0, descriptor: 'No evidence' }, { score: 7, descriptor: 'Strong evidence' }] }],
    });
  });
});
