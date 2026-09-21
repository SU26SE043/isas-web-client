import { describe, expect, it } from 'vitest';
import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';
import { createEmptyHardFiltersState } from '../types/campaignWizard.types';
import {
  buildCampaignCreateRequest,
  buildDirtyUpdateRequest,
  type CampaignWizardSubmitSnapshot,
} from './buildCampaignCreateRequest';
import { validateCampaignWizardStep } from './validateCampaignWizard';

function snapshot(): CampaignWizardSubmitSnapshot {
  return {
    info: {
      title: 'Frontend hiring',
      domain: 'frontend',
      language: 'vi',
      maxCandidates: 20,
      timeLimitMinutes: 60,
      passScorePct: 70,
      startsAt: '2030-08-04T09:00',
      expiresAt: '2030-09-04T09:00',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    jd: {
      inputMethod: 'text',
      jdFile: null,
      fileName: null,
      fileSize: null,
      jdText: 'A complete frontend job description for a senior React developer role.',
      criteriaText: '',
      fileStatus: 'idle',
      fileError: null,
      uploadProgress: null,
      serverUploaded: false,
      isDownloading: false,
    },
    hardFilters: createEmptyHardFiltersState(),
    rubric: [{ id: 'r1', name: 'React', description: '', weight: 100, maxScore: 10 }],
    questions: [{
      id: 'client-q1',
      prompt: 'Explain React rendering.',
      skill: 'React',
      difficulty: 'middle',
      source: 'manual',
      isRequired: true,
    }],
    settings: {
      antiCheatEnabled: true,
      faceVerifyEnabled: false,
      adaptiveEnabled: false,
      maxFollowUps: 0,
      maxQuestions: 5,
    },
  };
}

function persisted(): CampaignWizardPersistedState {
  const base = snapshot();
  return {
    ...base,
    // CMP3: cờ "đã tuỳ chỉnh bộ tiêu chí" nay nằm ở wizard state (trước là useState trong bước 3,
    // nên quay lại bước là mất) — fixture kiểu PersistedState phải khai nó.
    rubricCustomized: false,
    hardFilters: base.hardFilters ?? createEmptyHardFiltersState(),
    criteria: {
      criteriaFile: null,
      fileName: null,
      fileSize: null,
      fileStatus: 'idle',
      fileError: null,
      uploadProgress: null,
      serverUploaded: false,
      isDownloading: false,
    },
    questionCount: 5,
    inviteEmails: [],
    currentStep: 0,
    completedSteps: [],
    errorSteps: [],
    autosaveStatus: 'idle',
  };
}

describe('campaign wizard request contract', () => {
  it('sends the selected interview language while retaining the time limit', () => {
    const current = snapshot();
    current.info.language = 'en';

    expect(buildCampaignCreateRequest(current)).toMatchObject({
      language: 'en',
      timeLimitMinutes: 60,
    });
  });

  it('keeps all mode explicit with a null draw count', () => {
    const current = snapshot();
    current.questionsPerSession = null;

    expect(buildCampaignCreateRequest(current).questionsPerSession).toBeNull();
  });

  it('sends the computed draw count for pool mode', () => {
    const current = snapshot();
    current.questionsPerSession = 5;

    expect(buildCampaignCreateRequest(current).questionsPerSession).toBe(5);
  });

  it('sends interview language changes in a dirty update', () => {
    const current = snapshot();
    current.info.language = 'en';

    expect(buildDirtyUpdateRequest(snapshot(), current)).toMatchObject({
      title: 'Frontend hiring',
      domain: 'Frontend',
      language: 'en',
    });
  });

  it('blocks the information step when interview language is missing', () => {
    const current = persisted();
    current.info.language = '';

    expect(validateCampaignWizardStep(current, 0)).toBe(
      'employer.campaigns.wizard.languageRequired',
    );
  });

  it('does not send the deprecated location field in the create payload', () => {
    const request = buildCampaignCreateRequest(snapshot());
    expect(request).not.toHaveProperty('location');
  });

  it('does not send deprecated location changes in a dirty update', () => {
    const dirty = buildDirtyUpdateRequest(snapshot(), snapshot());
    expect(dirty).toMatchObject({
      title: 'Frontend hiring',
      domain: 'Frontend',
    });
    expect(dirty).not.toHaveProperty('location');
  });

  it('echoes live endpoint identity fields for partial metadata updates', () => {
    const current = snapshot();
    current.info.passScorePct = 75;

    expect(buildDirtyUpdateRequest(snapshot(), current)).toMatchObject({
      title: 'Frontend hiring',
      domain: 'Frontend',
      passScorePct: 75,
    });
  });

  it('does not require a location in the campaign information step', () => {
    expect(validateCampaignWizardStep(persisted(), 0)).toBe(
      null,
    );
  });

  it('giờ mở đã qua KHÔNG chặn bước 1 (kể cả create) — BE không có luật đó, giờ mở ≤ lúc triển khai = mở ngay', () => {
    // Trước 14/09: mặc định giờ mở = lúc mở wizard + 1h (luật tự bịa) VÀ create chặn "giờ mở đã qua"
    // — HR điền 8 bước xong (>30s) là bị đá về bước 1, còn thêm ca thi ngay thì bị 400 "trước khi
    // chiến dịch mở". Bỏ cả hai.
    // Hạn nộp để tương lai xa: 21/09 thêm luật "hạn nộp đã qua" (riêng expiresAt), test này chỉ đo vế giờ mở.
    const current = persisted();
    current.info.startsAt = '2020-01-01T09:00';
    current.info.expiresAt = '2030-02-01T09:00';
    expect(validateCampaignWizardStep(current, 0, { mode: 'create' })).toBeNull();
    expect(validateCampaignWizardStep(current, 0, { mode: 'edit' })).toBeNull();
  });

  it('hạn nộp ĐÃ QUA (so với `now` truyền vào) ⇒ chặn bước 1 bằng expiresAtPast — kể cả khi giờ mở < hạn', () => {
    // BE chỉ chặn ở POST; PUT/publish không ⇒ nháp cũ để lâu vẫn phát hành được nếu FE không chặn.
    const current = persisted();
    current.info.startsAt = '2026-09-13T09:00';
    current.info.expiresAt = '2026-09-16T09:00';
    const now = Date.UTC(2026, 8, 21);
    expect(validateCampaignWizardStep(current, 0, { mode: 'edit', now })).toBe('employer.campaigns.wizard.expiresAtPast');
    // Cùng fixture, `now` lùi về trước hạn ⇒ hợp lệ: luật đọc `now`, không đọc đồng hồ máy.
    expect(validateCampaignWizardStep(current, 0, { mode: 'edit', now: Date.UTC(2026, 8, 14) })).toBeNull();
    // Hạn ≤ giờ mở vẫn là dateRangeInvalid (luật cũ đứng trước).
    current.info.expiresAt = '2026-09-13T09:00';
    expect(validateCampaignWizardStep(current, 0, { mode: 'edit', now })).toBe('employer.campaigns.wizard.dateRangeInvalid');
  });
});
