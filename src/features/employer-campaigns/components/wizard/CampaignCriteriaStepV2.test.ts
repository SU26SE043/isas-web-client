import { describe, expect, it } from 'vitest';
import { previewToRubric } from './CampaignCriteriaStepV2';

describe('previewToRubric', () => {
  // Đổi tiền đề (SC2): trước đây output không mang scoringScope. Bộ chuẩn (W5) nay có thể trả
  // field này; cả hai fixture dưới đây KHÔNG khai nó ở input ⇒ phải resolve về 'Always'.
  it('copies the server scoring scale into the campaign rubric', () => {
    expect(previewToRubric({ jobCategory: 'BE', language: 'en', criteria: [{ id: 'c1', name: 'Depth', description: 'Trade-offs', weight: 0.25, maxScore: 7, levelCount: 1, levels: [{ score: 7, descriptor: 'Strong' }] }] })).toEqual([{ id: 'c1', name: 'Depth', description: 'Trade-offs', weight: 25, maxScore: 7, minPct: null, levels: [{ score: 7, descriptor: 'Strong' }], scoringScope: 'Always' }]);
  });

  it('converts the domain-derived standard preview into editable campaign state', () => {
    const rubric = previewToRubric({
      jobCategory: 'FE',
      language: 'vi',
      criteria: [{ id: '', name: 'Kỹ thuật', description: 'Mô tả', weight: 1, maxScore: 10, levelCount: 0, levels: [] }],
    });

    expect(rubric).toEqual([
      { id: 'system-1', name: 'Kỹ thuật', description: 'Mô tả', weight: 100, maxScore: 10, minPct: null, levels: undefined, scoringScope: 'Always' },
    ]);
  });

  // SC2 — bộ chuẩn mang scoringScope thật (W5) ⇒ đi nguyên vào rubric, không bị ép về 'Always'.
  it('bộ chuẩn mang scoringScope: WhenTargeted ⇒ giữ nguyên, không mặc định Always', () => {
    const rubric = previewToRubric({
      jobCategory: 'BE',
      language: 'vi',
      criteria: [{ id: 'c1', name: 'Nội dung', description: '', weight: 0.5, maxScore: 5, levelCount: 0, levels: [], scoringScope: 'WhenTargeted' }],
    });

    expect(rubric[0]?.scoringScope).toBe('WhenTargeted');
  });
});
