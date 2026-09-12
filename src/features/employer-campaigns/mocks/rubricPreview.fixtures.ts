import type { CampaignQuestion, RubricCriterion } from '../types/campaignManagement.types';
import type {
  RubricPreviewBand,
  RubricPreviewRun,
  RubricPreviewSample,
  RubricPreviewSampleScore,
  UseRubricPreviewApi,
} from '../types/rubricPreview.types';

/**
 * Fixture cho test chấm thử thước đo (CAMP-19). Kỳ vọng ≠ thật ở MỌI bài — cố ý, để phép hoán đổi
 * hàng Kỳ vọng/Thật (mutation M7) không thể xanh oan như đã xảy ra ở vòng 2026-08-13 (seed hai giá trị trùng).
 */
export const PREVIEW_CRITERIA: RubricPreviewRun['rubric'] = [
  { criterionId: 'c-depth', name: 'Chiều sâu kỹ thuật', weight: 0.6, maxScore: 5, levels: [{ score: 0, descriptor: 'Trống' }, { score: 5, descriptor: 'Xuất sắc' }] },
  { criterionId: 'c-comm', name: 'Giao tiếp', weight: 0.4, maxScore: 5, levels: [{ score: 0, descriptor: 'Trống' }, { score: 5, descriptor: 'Xuất sắc' }] },
];

export function score(criterionId: string, name: string, expectedLevel: number, actualScore: number, reasoning = `Lý do ${name}`): RubricPreviewSampleScore {
  return { criterionId, criterionName: name, maxScore: 5, expectedLevel, actualScore, levelMatched: actualScore, reasoning };
}

export function sample(band: RubricPreviewBand, expected: number, actual: number, scores?: RubricPreviewSampleScore[]): RubricPreviewSample {
  const level = band === 'Weak' ? 1 : band === 'Good' ? 3 : band === 'Excellent' ? 5 : 0;
  return {
    band,
    answerText: `Bài ${band} — nội dung trả lời mẫu.`,
    wordCount: band === 'Weak' ? 40 : band === 'Good' ? 120 : 210,
    expectedWeightedPct: expected,
    actualWeightedPct: actual,
    scores: scores ?? [
      score('c-depth', 'Chiều sâu kỹ thuật', level, Math.round((actual / 100) * 5)),
      score('c-comm', 'Giao tiếp', level, Math.round((actual / 100) * 5)),
    ],
  };
}

/** Lượt "đẹp": thứ tự đúng, biên độ 70, Δ nhỏ lẫn lộn dấu ⇒ bias none. Kỳ vọng 20/60/100 ≠ thật 18/62/88. */
export function goodRun(overrides: Partial<RubricPreviewRun> = {}): RubricPreviewRun {
  return {
    id: 'run-1',
    status: 'Succeeded',
    questionId: 'q-1',
    questionText: 'Trình bày cách bạn thiết kế API cho tính năng thanh toán.',
    rubricFingerprint: 'fp-a',
    rubricVersion: 1,
    promptVersion: 7,
    deliveryMetricsAvailable: false,
    lengthParityWarning: false,
    billed: false,
    freeRunsRemaining: 2,
    rubric: PREVIEW_CRITERIA,
    samples: [sample('Weak', 20, 18), sample('Good', 60, 62), sample('Excellent', 100, 88)],
    errorReason: null,
    createdAt: '2026-09-12T08:00:00Z',
    completedAt: '2026-09-12T08:01:00Z',
    ...overrides,
  };
}

/** Thứ tự VỠ: Khá chấm cao hơn Xuất sắc. */
export function brokenRun(overrides: Partial<RubricPreviewRun> = {}): RubricPreviewRun {
  return goodRun({ id: 'run-broken', samples: [sample('Weak', 20, 30), sample('Good', 60, 75), sample('Excellent', 100, 70)], ...overrides });
}

/** Thứ tự đúng nhưng biên độ chỉ 12. */
export function narrowRun(overrides: Partial<RubricPreviewRun> = {}): RubricPreviewRun {
  return goodRun({ id: 'run-narrow', samples: [sample('Weak', 20, 60), sample('Good', 60, 66), sample('Excellent', 100, 72)], ...overrides });
}

/** Cả 3 bài lệch DƯƠNG > 3 ⇒ bias positive. */
export function positiveBiasRun(overrides: Partial<RubricPreviewRun> = {}): RubricPreviewRun {
  return goodRun({ id: 'run-bias', samples: [sample('Weak', 20, 30), sample('Good', 60, 70), sample('Excellent', 90, 98)], ...overrides });
}

export const previewQuestions: CampaignQuestion[] = [
  { id: 'q-1', prompt: 'Câu 1 (không bắt buộc)', skill: 'backend', difficulty: 'middle', source: 'manual', isRequired: false },
  { id: 'q-2', prompt: 'Câu 2 (bắt buộc) — trình bày cách bạn thiết kế API cho tính năng thanh toán có idempotency', skill: 'backend', difficulty: 'middle', source: 'manual', isRequired: true },
  { id: 'q-3', prompt: 'Câu 3 (bắt buộc)', skill: 'backend', difficulty: 'senior', source: 'ai', isRequired: true },
];

export const rubricWithLevels: RubricCriterion[] = [
  { id: 'c-depth', name: 'Chiều sâu kỹ thuật', description: '', weight: 60, maxScore: 5, levels: [{ score: 0, descriptor: 'Trống' }, { score: 5, descriptor: 'Xuất sắc' }] },
  { id: 'c-comm', name: 'Giao tiếp', description: '', weight: 40, maxScore: 5, levels: [{ score: 0, descriptor: 'Trống' }, { score: 5, descriptor: 'Xuất sắc' }] },
];

export const rubricMissingLevels: RubricCriterion[] = [
  rubricWithLevels[0],
  { id: 'c-comm', name: 'Giao tiếp', description: '', weight: 40, maxScore: 5, levels: [] },
];

export function inertPreview(overrides: Partial<UseRubricPreviewApi> = {}): UseRubricPreviewApi {
  return {
    runs: [],
    latest: null,
    isLoadingHistory: false,
    isRunning: false,
    freeRunsRemaining: 3,
    error: null,
    run: async () => null,
    clearError: () => undefined,
    ...overrides,
  };
}
