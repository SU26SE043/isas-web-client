import { describe, expect, it } from 'vitest';
import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';
import { createDefaultSettingsState } from '../types/campaignWizard.types';
import { validateAllCampaignWizardSteps, validateCampaignWizardStep } from './validateCampaignWizard';

const TIME_LIMIT_INVALID = 'employer.campaigns.wizard.timeLimitInvalid';
/** Index nội bộ của bước 5 "Bảo mật & phỏng vấn thích ứng" — nơi có khối "Luật làm bài". */
const SETTINGS_STEP = 4;
const INVITES_STEP = 6;

function stateWith(timeLimitMinutes: number, settings = createDefaultSettingsState()): CampaignWizardPersistedState {
  return {
    info: { title: '', domain: '', maxCandidates: null, timeLimitMinutes, maxAttempts: 1, passScorePct: null, startsAt: '', expiresAt: '' },
    jd: { inputMethod: 'text', jdText: '', criteriaText: '' },
    hardFilters: { minYearsExperience: null },
    rubric: [],
    questions: [],
    settings,
  } as unknown as CampaignWizardPersistedState;
}

/**
 * ATT1-F1 — thời lượng là số nguyên trong [5,180] ([C1]/[C4]); lỗi GẮN VỚI BƯỚC 5 (index 4), nơi duy nhất
 * còn ô nhập. Bước Mời (index 6) không còn ô ⇒ không được báo lỗi thời lượng ở đó nữa.
 */
describe('validateCampaignWizardStep — thời lượng bài thi ở bước 5', () => {
  it.each([4, 181, 0, 30.5])('%s phút ⇒ timeLimitInvalid ở bước 5', (value) => {
    expect(validateCampaignWizardStep(stateWith(value), SETTINGS_STEP)).toBe(TIME_LIMIT_INVALID);
  });

  it.each([5, 180, 60])('%s phút ⇒ hợp lệ', (value) => {
    expect(validateCampaignWizardStep(stateWith(value), SETTINGS_STEP)).toBeNull();
  });

  it('bước Mời KHÔNG còn kiểm thời lượng (ô đã gỡ khỏi đó)', () => {
    expect(validateCampaignWizardStep(stateWith(0), INVITES_STEP)).toBeNull();
    expect(validateCampaignWizardStep(stateWith(181), INVITES_STEP)).toBeNull();
  });

  it('validateAll: lỗi thời lượng nằm ĐÚNG ở bước 5 (index 4) để Triển khai đá HR về chỗ có ô nhập', () => {
    const result = validateAllCampaignWizardSteps(stateWith(4));
    const timeLimitErrors = result.errors.filter((error) => error.messageKey === TIME_LIMIT_INVALID);
    expect(timeLimitErrors).toEqual([{ step: SETTINGS_STEP, messageKey: TIME_LIMIT_INVALID }]);
  });

  it('thời lượng THẤP HƠN ước tính KHÔNG chặn: 5 phút cho 20 câu × d=3 vẫn qua bước 5', () => {
    const settings = { ...createDefaultSettingsState(), adaptiveEnabled: true, maxDeepPerQuestion: 3 };
    const state = { ...stateWith(5, settings), questionsPerSession: 20 } as CampaignWizardPersistedState;
    expect(validateCampaignWizardStep(state, SETTINGS_STEP)).toBeNull();
  });
});
