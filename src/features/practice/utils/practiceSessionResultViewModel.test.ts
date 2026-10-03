import { describe, expect, it } from 'vitest';
import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';
import { mapPracticeSessionResponseToViewModel } from './practiceSessionResultViewModel';
import {
  formatScore,
  getQuestionStatusGroup,
  getSessionStatusGroup,
} from './practiceSessionResultFormat';

describe('practiceSessionResultViewModel', () => {
  it('maps session detail into a safe view model', () => {
    const session: PracticeSessionResponse = {
      id: 's1',
      status: 'Scored',
      jobCategory: 'Backend (BE)',
      level: 'Senior',
      questionCount: 2,
      completedAt: '2026-07-26T10:00:00Z',
      durationSeconds: 750,
      questions: [
        {
          id: 'q1',
          orderNo: 1,
          content: 'Describe REST API flow.',
          timeLimitSec: 120,
          kind: 'technical',
        },
        {
          id: 'q2',
          orderNo: 2,
          content: 'Explain transactions.',
          timeLimitSec: 120,
          kind: 'technical',
        },
      ],
      answers: [
        {
          questionId: 'q1',
          transcript: 'Thank you.',
          status: 'Scored',
          durationSec: 20,
          criteriaScores: [
            { name: 'Technical depth', score: 0, maxScore: 5, comment: 'No depth.' },
          ],
          suggestedAnswer: 'Sample answer',
        },
        {
          questionId: 'q2',
          status: 'Skipped',
        },
      ],
      result: {
        overallScore: 5.7,
        maxScore: 100,
        passThreshold: 50,
        criteriaScores: [
          { name: 'Technical depth', score: 0, maxScore: 5 },
          { name: 'Grammar', score: 1, maxScore: 5 },
          { name: 'Fluency', score: 1, maxScore: 5 },
        ],
        strengths: [],
        needsImprovement: ['Need more depth'],
        overallComment: 'Needs improvement',
        cvVsAnswer: null,
      },
    };

    const view = mapPracticeSessionResponseToViewModel(session);
    expect(view.hasResult).toBe(true);
    expect(view.answeredCount).toBe(1);
    expect(view.skippedCount).toBe(1);
    expect(view.passThresholdPct).toBe(50);
    expect(view.questions[0]?.suggestedAnswer).toBe('Sample answer');
    expect(view.questions[1]?.skipped).toBe(true);
  });

  it('preserves weighted formula and contribution fields supplied by the API', () => {
    const view = mapPracticeSessionResponseToViewModel({
      id: 'weighted', status: 'Scored', questions: [], answers: [],
      result: {
        overallScore: 72.5, scoreBeforePenalty: 90.625, scoreFormula: 'Weighted',
        seedAnswered: 3, seedTotal: 4, skipPenalty: true,
        criteriaScores: [{ name: 'Communication', score: 4, maxScore: 5, effectiveWeight: 0.25, contribution: 20 }],
        unassessedCriteria: [{ criterionId: 'c2', name: 'System design', weight: 0.4 }],
        needsImprovement: [], overallComment: '', cvVsAnswer: null,
      },
    });
    expect(view.scoreFormula).toBe('Weighted');
    expect(view.criteria[0]).toMatchObject({ effectiveWeight: 0.25, contribution: 20 });
    expect(view.skipPenalty).toMatchObject({ seedAnswered: 3, seedTotal: 4, applied: true });
    expect(view.unassessedCriteria).toEqual([{ criterionId: 'c2', name: 'System design', weight: 0.4 }]);
  });
});

describe('practiceSessionResultViewModel — focusTracking: khung hình đếm RIÊNG', () => {
  const base: PracticeSessionResponse = {
    id: 's-focus',
    status: 'Scored',
    jobCategory: 'BE',
    questionCount: 1,
    createdAt: '2026-09-17T10:00:00Z',
    completedAt: '2026-09-17T10:30:00Z',
    questions: [],
    focusTrackingEnabled: true,
  } as unknown as PracticeSessionResponse;

  it('placement chỉ theo RỜI tab/cửa sổ: khung hình ở nửa sau KHÔNG kéo thành "rải trong buổi"', () => {
    // Nhịp kiểm mặt 15s: 40 lần no_face là chuyện thường của người cúi xuống ghi chú — cộng vào "rời khỏi
    // buổi" thì ô Tổng quan hiện ×42 và khuyên "đóng các tab khác" cho người chưa hề rời tab.
    const view = mapPracticeSessionResponseToViewModel({
      ...base,
      focusEvents: [
        { signalType: 'tab_switch', count: 2, firstAt: '2026-09-17T10:02:00Z', lastAt: '2026-09-17T10:05:00Z' },
        { signalType: 'no_face', count: 40, firstAt: '2026-09-17T10:20:00Z', lastAt: '2026-09-17T10:29:00Z' },
        { signalType: 'multiple_faces', count: 3, firstAt: '2026-09-17T10:25:00Z', lastAt: '2026-09-17T10:26:00Z' },
      ],
    });
    // Hành vi chỉ ở nửa đầu (10:02–10:05, giữa buổi là 10:15) — khung hình ở nửa sau KHÔNG được kéo thành 'spread'.
    expect(view.focusLeavePlacement).toBe('firstHalf');
  });

  it('chỉ có khung hình → không có placement', () => {
    const view = mapPracticeSessionResponseToViewModel({
      ...base,
      focusEvents: [
        { signalType: 'no_face', count: 5, firstAt: '2026-09-17T10:20:00Z', lastAt: '2026-09-17T10:29:00Z' },
      ],
    });
    expect(view.focusLeavePlacement).toBeUndefined();
  });

  it('dán là nhóm RIÊNG: lần dán ở nửa sau KHÔNG kéo placement của "rời buổi" thành "rải trong buổi"', () => {
    const view = mapPracticeSessionResponseToViewModel({
      ...base,
      focusEvents: [
        { signalType: 'focus_lost', count: 1, firstAt: '2026-09-17T10:02:00Z', lastAt: '2026-09-17T10:02:00Z' },
        { signalType: 'paste', count: 2, firstAt: '2026-09-17T10:25:00Z', lastAt: '2026-09-17T10:26:00Z' },
        { signalType: 'camera_blocked', count: 4, firstAt: '2026-09-17T10:20:00Z', lastAt: '2026-09-17T10:21:00Z' },
      ],
    });
    expect(view.focusLeavePlacement).toBe('firstHalf');
  });
});

describe('practiceSessionResultFormat', () => {
  it('formats scores and status groups safely', () => {
    expect(formatScore(null, 100)).toBe('—');
    expect(formatScore(5.7, 100)).toBe('5.7/100');
    expect(getSessionStatusGroup('Scored')).toBe('graded');
    expect(getQuestionStatusGroup('Skipped')).toBe('skipped');
  });
});

describe('practiceSessionResultViewModel — số hiệu phân cấp', () => {
  it('câu đào sâu nhận số con của câu gốc gần nhất; câu gốc phía sau không bị đẩy lùi', () => {
    const session: PracticeSessionResponse = {
      id: 's2',
      status: 'Scored',
      questions: [
        { id: 'q1', orderNo: 1, content: 'Gốc 1', timeLimitSec: 120, kind: 'Seed' },
        { id: 'q1b', orderNo: 2, content: 'Đào sâu 1', timeLimitSec: 120, kind: 'Clarify' },
        { id: 'q2', orderNo: 5, content: 'Gốc 2', timeLimitSec: 120, kind: 'Seed' },
      ],
      answers: [],
      result: null,
    };
    const vm = mapPracticeSessionResponseToViewModel(session);
    expect(vm.questions.map((q) => q.label)).toEqual(['1', '1.1', '2']);
    // `orderNo` của view model vẫn là vị trí mảng (điều hướng), không phải số in ra.
    expect(vm.questions.map((q) => q.orderNo)).toEqual([1, 2, 3]);
  });
});

