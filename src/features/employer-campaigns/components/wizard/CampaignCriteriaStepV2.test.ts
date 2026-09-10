import { describe, expect, it } from 'vitest';
import { previewToRubric } from './CampaignCriteriaStepV2';

describe('previewToRubric', () => {
  it('copies the server scoring scale into the campaign rubric', () => {
    expect(previewToRubric({ jobCategory: 'BE', language: 'en', criteria: [{ id: 'c1', name: 'Depth', description: 'Trade-offs', weight: 0.25, maxScore: 7, levelCount: 1, levels: [{ score: 7, descriptor: 'Strong' }] }] })).toEqual([{ id: 'c1', name: 'Depth', description: 'Trade-offs', weight: 25, maxScore: 7, minPct: null, levels: [{ score: 7, descriptor: 'Strong' }] }]);
  });

  it('converts the domain-derived standard preview into editable campaign state', () => {
    const rubric = previewToRubric({
      jobCategory: 'FE',
      language: 'vi',
      criteria: [{ id: '', name: 'Kỹ thuật', description: 'Mô tả', weight: 1, maxScore: 10, levelCount: 0, levels: [] }],
    });

    expect(rubric).toEqual([
      { id: 'system-1', name: 'Kỹ thuật', description: 'Mô tả', weight: 100, maxScore: 10, minPct: null, levels: undefined },
    ]);
  });
});
