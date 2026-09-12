import { describe, expect, it } from 'vitest';
import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';
import type { RubricCriterion } from '../types/campaignManagement.types';
import { validateCampaignWizardStep } from './validateCampaignWizard';

const LEVELS_INVALID = 'employer.campaigns.wizard.rubric.levelsInvalid';
const d = 'Mô tả mức đủ dài để qua ngưỡng 20 ký tự.';

function stateWithRubric(rubric: RubricCriterion[]): CampaignWizardPersistedState {
  return {
    info: { passScorePct: null },
    jd: { inputMethod: 'text', jdText: 'JD', criteriaText: '' },
    rubric,
    questions: [],
    settings: {},
  } as unknown as CampaignWizardPersistedState;
}

const valid = (over: Partial<RubricCriterion> = {}): RubricCriterion => ({
  id: 'c1',
  name: 'Giao tiếp',
  description: '',
  weight: 100,
  maxScore: 10,
  ...over,
});

describe('validateCampaignWizardStep bước 2 — mốc điểm (CAMP-17)', () => {
  it('KHÔNG có mốc thì không chặn: mốc là tuỳ chọn (CAMP-14)', () => {
    expect(validateCampaignWizardStep(stateWithRubric([valid()]), 2)).toBeNull();
    expect(validateCampaignWizardStep(stateWithRubric([valid({ levels: [] })]), 2)).toBeNull();
  });

  it('có mốc hợp lệ thì qua', () => {
    const rubric = [valid({ levels: [{ score: 0, descriptor: d }, { score: 10, descriptor: d }] })];
    expect(validateCampaignWizardStep(stateWithRubric(rubric), 2)).toBeNull();
  });

  it('có mốc nhưng thiếu mốc 0 → levelsInvalid (backend sẽ 400 lúc PUT/publish)', () => {
    const rubric = [valid({ levels: [{ score: 5, descriptor: d }, { score: 10, descriptor: d }] })];
    expect(validateCampaignWizardStep(stateWithRubric(rubric), 2)).toBe(LEVELS_INVALID);
  });

  it('có mốc nhưng thiếu mốc maxScore → levelsInvalid', () => {
    const rubric = [valid({ levels: [{ score: 0, descriptor: d }, { score: 5, descriptor: d }] })];
    expect(validateCampaignWizardStep(stateWithRubric(rubric), 2)).toBe(LEVELS_INVALID);
  });

  it('chỉ MỘT mốc → levelsInvalid (cần 2–10)', () => {
    const rubric = [valid({ levels: [{ score: 0, descriptor: d }] })];
    expect(validateCampaignWizardStep(stateWithRubric(rubric), 2)).toBe(LEVELS_INVALID);
  });

  it('mô tả ngắn hơn 20 ký tự → levelsInvalid', () => {
    const rubric = [valid({ levels: [{ score: 0, descriptor: 'ngắn' }, { score: 10, descriptor: d }] })];
    expect(validateCampaignWizardStep(stateWithRubric(rubric), 2)).toBe(LEVELS_INVALID);
  });

  it('mốc đo theo CHÍNH thang của tiêu chí: mốc 10 với maxScore 7 là ngoài dải', () => {
    const rubric = [valid({ maxScore: 7, levels: [{ score: 0, descriptor: d }, { score: 10, descriptor: d }] })];
    expect(validateCampaignWizardStep(stateWithRubric(rubric), 2)).toBe(LEVELS_INVALID);
  });

  it('kiểm maxScore chạy TRƯỚC kiểm mốc: maxScore sai thì báo maxScore, không báo mốc', () => {
    const rubric = [valid({ maxScore: 11, levels: [{ score: 0, descriptor: d }, { score: 10, descriptor: d }] })];
    expect(validateCampaignWizardStep(stateWithRubric(rubric), 2)).toBe(
      'employer.campaigns.wizard.rubric.maxScoreTooHigh',
    );
  });

  it('một tiêu chí không mốc + một tiêu chí mốc hỏng → vẫn chặn (lỗi ở tiêu chí có mốc)', () => {
    const rubric = [
      valid({ id: 'a', name: 'A', weight: 50 }),
      valid({ id: 'b', name: 'B', weight: 50, levels: [{ score: 5, descriptor: d }, { score: 10, descriptor: d }] }),
    ];
    expect(validateCampaignWizardStep(stateWithRubric(rubric), 2)).toBe(LEVELS_INVALID);
  });
});
