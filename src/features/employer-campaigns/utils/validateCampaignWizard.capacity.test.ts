import { describe, expect, it } from 'vitest';
import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';
import { validateCampaignWizardStep } from './validateCampaignWizard';

const INVALID = 'employer.campaigns.form.maxCandidatesInvalid';
const INTEGER = 'employer.campaigns.form.integerRequired';

function stateWithMaxCandidates(maxCandidates: number | null): CampaignWizardPersistedState {
  return {
    info: { maxCandidates, passScorePct: null },
    jd: { inputMethod: 'text', jdText: 'JD', criteriaText: '' },
    rubric: [],
    questions: [],
    settings: {},
  } as unknown as CampaignWizardPersistedState;
}

/**
 * SC2 R1 — "Sức chứa" (bước 5) đổi từ BẮT BUỘC sang TUỲ CHỌN, để triển khai nhanh không bị
 * chặn bởi một con số HR chưa cần biết. `null` vẫn phải qua được step; có giá trị thì vẫn áp
 * đúng luật cũ (>0, nguyên) — chỉ mỗi nhánh "bỏ trống" là đổi.
 */
describe('validateCampaignWizardStep bước 5 — Sức chứa (nay tuỳ chọn)', () => {
  it('chưa điền (null) ⇒ hợp lệ, KHÔNG chặn triển khai nhanh', () => {
    expect(validateCampaignWizardStep(stateWithMaxCandidates(null), 5)).toBeNull();
  });

  it('0 ⇒ vẫn là lỗi — "0" không phải cách khai "không giới hạn"', () => {
    expect(validateCampaignWizardStep(stateWithMaxCandidates(0), 5)).toBe(INVALID);
  });

  it('số âm ⇒ maxCandidatesInvalid', () => {
    expect(validateCampaignWizardStep(stateWithMaxCandidates(-5), 5)).toBe(INVALID);
  });

  it('không nguyên (1.5) ⇒ integerRequired', () => {
    expect(validateCampaignWizardStep(stateWithMaxCandidates(1.5), 5)).toBe(INTEGER);
  });

  it('30 (hợp lệ, dương, nguyên) ⇒ qua', () => {
    expect(validateCampaignWizardStep(stateWithMaxCandidates(30), 5)).toBeNull();
  });
});
