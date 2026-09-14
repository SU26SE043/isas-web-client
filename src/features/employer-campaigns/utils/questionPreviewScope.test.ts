import { describe, expect, it } from 'vitest';
import type { CampaignQuestion, RubricCriterion } from '../types/campaignManagement.types';
import { goodRun, sample, score } from '../mocks/rubricPreview.fixtures';
import { projectRunToCriteria, scopedCriterionIdsForRun } from './questionPreviewScope';

const rubric: RubricCriterion[] = [
  { id: 'c-comm', name: 'Giao tiếp', description: '', weight: 40, maxScore: 5, scoringScope: 'Always' },
  { id: 'c-depth', name: 'Chiều sâu', description: '', weight: 60, maxScore: 5, scoringScope: 'WhenTargeted' },
  { id: 'c-design', name: 'Thiết kế', description: '', weight: 0, maxScore: 5, scoringScope: 'WhenTargeted' },
];
const question = (targets: string[] | null): CampaignQuestion => ({ id: 'q-1', prompt: 'Q', skill: '', difficulty: 'middle', source: 'manual', isRequired: true, targetCriterionIds: targets });

describe('scopedCriterionIdsForRun', () => {
  it('ưu tiên run.scopedCriterionIds (sự thật BE đã chấm) khi có', () => {
    expect(scopedCriterionIdsForRun(goodRun({ scopedCriterionIds: ['c-comm'] }), rubric, question(['c-depth']))).toEqual(['c-comm']);
  });
  it('lượt cũ không mang field ⇒ suy cục bộ Always ∪ nhãn câu; câu chưa gắn nhãn (null) ⇒ null = không thu hẹp', () => {
    expect(scopedCriterionIdsForRun(goodRun({ scopedCriterionIds: [] }), rubric, question(['c-depth']))).toEqual(['c-comm', 'c-depth']);
    expect(scopedCriterionIdsForRun(goodRun({ scopedCriterionIds: undefined }), rubric, question([]))).toEqual(['c-comm']);
    expect(scopedCriterionIdsForRun(goodRun({ scopedCriterionIds: [] }), rubric, question(null))).toBeNull();
  });
});

describe('projectRunToCriteria — I6: chỉ lọc HIỂN THỊ, không tính lại điểm', () => {
  it('lọc rubric + scores theo id; actualWeightedPct/expectedWeightedPct giữ NGUYÊN', () => {
    const run = goodRun();
    const projected = projectRunToCriteria(run, ['c-comm']);
    expect(projected.rubric.map((item) => item.criterionId)).toEqual(['c-comm']);
    expect(projected.samples.every((item) => item.scores.length === 1 && item.scores[0].criterionId === 'c-comm')).toBe(true);
    expect(projected.samples.map((item) => item.actualWeightedPct)).toEqual(run.samples.map((item) => item.actualWeightedPct));
    expect(projected.samples.map((item) => item.expectedWeightedPct)).toEqual(run.samples.map((item) => item.expectedWeightedPct));
  });
  it('ids null ⇒ trả đúng object cũ; lọc rỗng toàn bộ (id lệch phiên bản) ⇒ trả nguyên lượt thay vì bảng trống', () => {
    const run = goodRun({ samples: [sample('Weak', 20, 18, [score('c-depth', 'Chiều sâu', 1, 1)])] });
    expect(projectRunToCriteria(run, null)).toBe(run);
    expect(projectRunToCriteria(run, ['id-khong-ton-tai'])).toBe(run);
  });
});
