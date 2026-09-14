import { describe, expect, it } from 'vitest';
import { buildCampaignCreateRequest, buildCampaignUpdateRequest } from './buildCampaignCreateRequest';
import type { CampaignWizardSubmitSnapshot } from './buildCampaignCreateRequest';
import { createEmptyHardFiltersState } from '../types/campaignWizard.types';

/**
 * Ba chỗ CHẶN HẲN tìm ra khi đi thử wizard 8 bước lần đầu. Mỗi cái đều để người dùng kẹt
 * cứng mà không thông báo gì hữu ích, và không cái nào làm test cũ đỏ.
 */
const snapshot = (over: Partial<CampaignWizardSubmitSnapshot> = {}): CampaignWizardSubmitSnapshot => ({
  info: {
    title: 'Tuyển Backend Developer .NET',
    domain: 'backend',
    language: 'vi',
    maxCandidates: null,
    timeLimitMinutes: 30,
    passScorePct: null,
    startsAt: '2099-01-01T10:00:00.000Z',
    expiresAt: '2099-01-20T10:00:00.000Z',
    timezone: 'Asia/Saigon',
  },
  jd: {
    inputMethod: 'text', jdFile: null, fileName: null, fileSize: null,
    jdText: 'Mô tả công việc.', criteriaText: '', fileStatus: 'idle', fileError: null,
    uploadProgress: null, serverUploaded: false, isDownloading: false,
  },
  hardFilters: createEmptyHardFiltersState(),
  rubric: [],
  questions: [],
  questionsPerSession: null,
  settings: { adaptiveEnabled: false, maxFollowUps: 3, maxDeepPerQuestion: 0, maxQuestions: 20,
    antiCheatEnabled: false, faceVerifyEnabled: false },
  ...over,
} as CampaignWizardSubmitSnapshot);

describe('CMP3 — ba chỗ chặn hẳn của wizard', () => {
  it('rubric rỗng ⇒ KHÔNG gửi khoá criteria (nếu gửi mảng rỗng, backend trả 400)', () => {
    // Nháp được tạo ngay ở BƯỚC 2 lúc tải JD, khi bước 3 chưa chạy nên rubric luôn rỗng.
    // Gửi `criteria: []` ⇒ BE ném "criteria[] phải có ≥1 tiêu chí" ⇒ 400 ⇒ tải JD luôn
    // thất bại ⇒ không qua nổi bước 2. Đây là chỗ chặn ĐẦU TIÊN người dùng gặp.
    const created = buildCampaignCreateRequest(snapshot()) as Record<string, unknown>;
    expect('criteria' in created && created.criteria !== undefined).toBe(false);
    const updated = buildCampaignUpdateRequest(snapshot()) as Record<string, unknown>;
    expect('criteria' in updated && updated.criteria !== undefined).toBe(false);
  });

  it('có rubric thì vẫn gửi criteria như cũ', () => {
    const withRubric = snapshot({
      rubric: [{ id: 'r1', name: 'Kỹ thuật', description: '', weight: 100, maxScore: 10 }],
    });
    const created = buildCampaignCreateRequest(withRubric) as Record<string, unknown>;
    expect(Array.isArray(created.criteria)).toBe(true);
    expect((created.criteria as unknown[]).length).toBe(1);
  });

  it('questionsPerSession = 0 ⇒ gửi null (backend chỉ nhận 1..20)', () => {
    // Chuyển sang chế độ rút thăm khi rổ rỗng từng cho ra đúng số 0 này, và nó chặn
    // người dùng từ bước 5 trở đi bằng một lỗi không nói rõ phải sửa ở đâu.
    const created = buildCampaignCreateRequest(snapshot({ questionsPerSession: 0 })) as Record<string, unknown>;
    expect(created.questionsPerSession).toBeNull();
    const updated = buildCampaignUpdateRequest(snapshot({ questionsPerSession: 0 })) as Record<string, unknown>;
    expect(updated.questionsPerSession).toBeNull();
  });

  it('questionsPerSession hợp lệ vẫn đi qua nguyên vẹn', () => {
    const created = buildCampaignCreateRequest(snapshot({ questionsPerSession: 5 })) as Record<string, unknown>;
    expect(created.questionsPerSession).toBe(5);
  });
});
