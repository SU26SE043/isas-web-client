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

  // SC2 — bộ chuẩn (W5) nay có thể trả scoringScope; vắng/lạ ⇒ undefined (previewToRubric mặc định 'Always').
  it('parses scoringScope (camelCase lẫn PascalCase), vắng/lạ ⇒ undefined', () => {
    const parsed = parseCampaignCriteriaPreview({
      jobCategory: 'BE', language: 'vi',
      criteria: [
        { name: 'A', weight: 40, maxScore: 5, scoringScope: 'WhenTargeted' },
        { name: 'B', weight: 30, maxScore: 5, ScoringScope: 'Always' },
        { name: 'C', weight: 30, maxScore: 5 },
        { name: 'D', weight: 0, maxScore: 5, scoringScope: 'Bogus' },
      ],
    });
    expect(parsed.criteria.map((item) => item.scoringScope)).toEqual([
      'WhenTargeted', 'Always', undefined, undefined,
    ]);
  });
});
