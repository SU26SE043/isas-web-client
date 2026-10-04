import { describe, expect, it } from 'vitest';
import {
  createDefaultSettingsState,
  createEmptyJdState,
  type CampaignInfoState,
} from '../types/campaignWizard.types';
import {
  buildCampaignCreateRequest,
  buildCampaignUpdateRequest,
  buildDirtyUpdateRequest,
  type CampaignWizardSubmitSnapshot,
} from './buildCampaignCreateRequest';

function snapshot(info: Partial<CampaignInfoState> = {}): CampaignWizardSubmitSnapshot {
  return {
    info: {
      title: 'Backend', domain: 'backend', language: 'vi', maxCandidates: null, timeLimitMinutes: 30, maxAttempts: 1,
      passScorePct: null, startsAt: '2030-01-01T09:00', expiresAt: '2030-02-01T09:00', timezone: 'UTC', ...info,
    },
    jd: { ...createEmptyJdState(), inputMethod: 'text', jdText: 'JD' },
    rubric: [],
    questions: [{ id: 'q1', prompt: 'Q1', skill: '', difficulty: 'middle', source: 'manual', isRequired: true }],
    settings: createDefaultSettingsState(),
  };
}

/** ATT1-F1 [C1]/[C2] — body create/update mang `maxAttempts` và GIỮ `timeLimitMinutes` (vắng = không đổi). */
describe('buildCampaignCreateRequest / buildCampaignUpdateRequest — luật làm bài', () => {
  it('derives 14 questions from a full seven-question bank when K is empty', () => {
    const base = snapshot();
    const fullBank = {
      ...base,
      questions: Array.from({ length: 7 }, (_, index) => ({
        id: `q${index + 1}`, prompt: `Q${index + 1}`, skill: '', difficulty: 'middle' as const, source: 'manual' as const, isRequired: true,
      })),
      settings: { ...base.settings, adaptiveEnabled: true, maxDeepPerQuestion: 1 },
    };
    expect(buildCampaignCreateRequest(fullBank).maxQuestions).toBe(14);
    expect(buildCampaignUpdateRequest(fullBank).maxQuestions).toBe(14);
  });

  it('uses explicit K before the question-bank length and omits zero', () => {
    const base = snapshot();
    const explicitK = { ...base, questionsPerSession: 4, settings: { ...base.settings, adaptiveEnabled: true, maxDeepPerQuestion: 2 } };
    expect(buildCampaignCreateRequest(explicitK).maxQuestions).toBe(12);
    expect(buildCampaignUpdateRequest(explicitK).maxQuestions).toBe(12);

    const empty = { ...base, questions: [], questionsPerSession: null };
    expect(buildCampaignCreateRequest(empty)).not.toHaveProperty('maxQuestions');
    expect(buildCampaignUpdateRequest(empty)).not.toHaveProperty('maxQuestions');
  });

  it('chọn 2 lần ⇒ body POST create có maxAttempts 2 và timeLimitMinutes HR đặt', () => {
    const body = buildCampaignCreateRequest(snapshot({ maxAttempts: 2, timeLimitMinutes: 45 }));
    expect(body.maxAttempts).toBe(2);
    expect(body.timeLimitMinutes).toBe(45);
  });

  it('chọn 2 lần ⇒ body PUT update (đầy đủ) có maxAttempts 2; timeLimitMinutes KHÔNG bị bỏ', () => {
    const body = buildCampaignUpdateRequest(snapshot({ maxAttempts: 2, timeLimitMinutes: 45 }));
    expect(body.maxAttempts).toBe(2);
    expect(body).toHaveProperty('timeLimitMinutes', 45);
  });

  it('mặc định 1 vẫn gửi tường minh (không để BE tự hiểu)', () => {
    expect(buildCampaignCreateRequest(snapshot()).maxAttempts).toBe(1);
    expect(buildCampaignUpdateRequest(snapshot())).toHaveProperty('maxAttempts', 1);
  });

  it('PUT dirty khi sửa nháp: đổi 1 → 2 lần và 30 → 45 phút ⇒ body mang cả hai khoá', () => {
    const dirty = buildDirtyUpdateRequest(snapshot(), snapshot({ maxAttempts: 2, timeLimitMinutes: 45 }));
    expect(dirty).toMatchObject({ maxAttempts: 2, timeLimitMinutes: 45 });
  });

  it('PUT dirty không đổi luật làm bài ⇒ lược hai khoá (vắng = không đổi) nhưng vẫn echo title', () => {
    const dirty = buildDirtyUpdateRequest(snapshot(), snapshot({ passScorePct: 70 }));
    expect(dirty).not.toHaveProperty('maxAttempts');
    expect(dirty).not.toHaveProperty('timeLimitMinutes');
    expect(dirty.title).toBe('Backend');
  });
});
