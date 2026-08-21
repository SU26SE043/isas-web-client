import { beforeEach, describe, expect, it, vi } from 'vitest';

const startLesson = vi.fn();
const retryLesson = vi.fn();
vi.mock('../services/roadmapPractice.service', () => ({
  roadmapPracticeService: {
    startLesson: (...a: unknown[]) => startLesson(...a),
    retryLesson: (...a: unknown[]) => retryLesson(...a),
    getPracticeSession: vi.fn(),
  },
}));
vi.mock('../services/learningPracticeSession.registry', () => ({
  getLearningPracticeSession: vi.fn(),
  registerFromPracticeSessionResponse: vi.fn(),
  registerLearningPracticeSession: vi.fn(),
  updateLearningSessionQuestions: vi.fn(),
}));

import {
  retryLearningLessonPractice,
  startLearningLessonPractice,
} from './launchLearningInterviewPractice';

function deferred() {
  let resolve!: (v: unknown) => void;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function okSession(sessionId: string) {
  return {
    ok: true,
    resumed: false,
    session: { sessionId, questions: [{ id: 'q1', content: 'Q', timeLimitSeconds: 60 }] },
  };
}

const input = { roadmapId: 'rm-1', lessonId: 'ls-1', title: 'Bài một' };

describe('gộp lời gọi đang bay (in-flight) của start / retry', () => {
  beforeEach(() => {
    startLesson.mockReset();
    retryLesson.mockReset();
  });

  it('hai lượt RETRY cùng lúc chỉ tạo MỘT buổi', async () => {
    // Chống double-click: đây là tính chất phải giữ.
    retryLesson.mockResolvedValue(okSession('ses-retry'));

    const [a, b] = await Promise.all([
      retryLearningLessonPractice(input),
      retryLearningLessonPractice(input),
    ]);

    expect(retryLesson).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('RETRY trong lúc START đang bay KHÔNG được nhận nhầm kết quả của START', async () => {
    // Khoá in-flight phải phân biệt theo mode. Gộp chung khoá thì người học bấm
    // "Làm lại bài" ngay sau "Mở bài thực hành" sẽ được trả về buổi của lượt
    // start — tức tiêu credit cho một thứ, nhận về một thứ khác, và không lỗi
    // nào nổ ra.
    const pendingStart = deferred();
    startLesson.mockReturnValue(pendingStart.promise);
    retryLesson.mockResolvedValue(okSession('ses-retry'));

    const startPromise = startLearningLessonPractice(input);
    const retryResult = await retryLearningLessonPractice(input);

    expect(retryLesson).toHaveBeenCalledTimes(1);
    expect(retryResult.ok && retryResult.session.sessionId).toBe('ses-retry');

    pendingStart.resolve(okSession('ses-start'));
    const startResult = await startPromise;
    expect(startResult.ok && startResult.session.sessionId).toBe('ses-start');
  });

  it('START trong lúc RETRY đang bay cũng không bị nuốt', async () => {
    const pendingRetry = deferred();
    retryLesson.mockReturnValue(pendingRetry.promise);
    startLesson.mockResolvedValue(okSession('ses-start'));

    const retryPromise = retryLearningLessonPractice(input);
    const startResult = await startLearningLessonPractice(input);

    expect(startLesson).toHaveBeenCalledTimes(1);
    expect(startResult.ok && startResult.session.sessionId).toBe('ses-start');

    pendingRetry.resolve(okSession('ses-retry'));
    await retryPromise;
  });
});
