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

  it('no_face/multiple_faces KHÔNG cộng vào focusLeaveCount; vào focusFrameCount; placement chỉ theo hành vi', () => {
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
    expect(view.focusLeaveCount).toBe(2);
    expect(view.focusFrameCount).toBe(43);
    // Hành vi chỉ ở nửa đầu (10:02–10:05, giữa buổi là 10:15) — khung hình ở nửa sau KHÔNG được kéo thành 'spread'.
    expect(view.focusLeavePlacement).toBe('firstHalf');
  });

  it('chỉ có khung hình → leave = 0, không có placement, frame = tổng', () => {
    const view = mapPracticeSessionResponseToViewModel({
      ...base,
      focusEvents: [
        { signalType: 'no_face', count: 5, firstAt: '2026-09-17T10:20:00Z', lastAt: '2026-09-17T10:29:00Z' },
      ],
    });
    expect(view.focusLeaveCount).toBe(0);
    expect(view.focusFrameCount).toBe(5);
    expect(view.focusLeavePlacement).toBeUndefined();
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

