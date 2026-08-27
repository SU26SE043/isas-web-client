import { describe, expect, it } from 'vitest';
import {
  MAX_CRITERIA_TEXT_LENGTH,
  MAX_JD_TEXT_LENGTH,
  validateCampaignWizardStep,
} from './validateCampaignWizard';
import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';

/**
 * Trần độ dài text nhập tay của wizard phải BẰNG trần backend.
 *
 * Backend (CAMP-5) gọi cùng một guard `TextInputLimits.JdTextMaxChars` = 20.000
 * cho CẢ `jdText` LẪN `criteriaText`, ở cả create lẫn update. FE đặt số nhỏ hơn
 * thì chặn nhầm input backend chấp nhận — và chặn ở FE nên backend không bao giờ
 * thấy, không có lỗi nào để lần ra.
 */
const BACKEND_TEXT_LIMIT = 20_000;

function stateWithCriteria(criteriaText: string): CampaignWizardPersistedState {
  return {
    jd: {
      inputMethod: 'text',
      jdText: 'Mô tả công việc hợp lệ.',
      criteriaText,
    },
    rubric: [],
    questions: [],
    settings: {},
  } as unknown as CampaignWizardPersistedState;
}

describe('trần text wizard khớp backend', () => {
  it('trần JD đúng bằng trần backend', () => {
    expect(MAX_JD_TEXT_LENGTH).toBe(BACKEND_TEXT_LIMIT);
  });

  it('trần ghi chú tiêu chí đúng bằng trần backend (KHÔNG nghiêm hơn)', () => {
    expect(MAX_CRITERIA_TEXT_LENGTH).toBe(BACKEND_TEXT_LIMIT);
  });

  it('ghi chú tiêu chí dài hơn 2.000 ký tự VẪN hợp lệ', () => {
    // Ca hồi quy: trần từng bị đặt 2.000, nghiêm hơn backend 10 lần.
    const error = validateCampaignWizardStep(stateWithCriteria('a'.repeat(5_000)), 1);

    expect(error).toBeNull();
  });

  it('ghi chú tiêu chí vượt trần backend thì bị chặn tại FE', () => {
    const error = validateCampaignWizardStep(
      stateWithCriteria('a'.repeat(BACKEND_TEXT_LIMIT + 1)),
      1,
    );

    expect(error).toBe('employer.campaigns.wizard.criteriaTextTooLong');
  });

  it('khoảng trắng thừa không tính vào trần (đo SAU khi trim, đồng nếp backend)', () => {
    const padded = `${' '.repeat(2_000)}${'a'.repeat(BACKEND_TEXT_LIMIT)}${' '.repeat(2_000)}`;

    expect(validateCampaignWizardStep(stateWithCriteria(padded), 1)).toBeNull();
  });
});
