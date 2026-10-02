import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const svc = vi.hoisted(() => ({ submitPracticeAnswer: vi.fn(), beginPracticeSession: vi.fn(), getPracticeSession: vi.fn() }));
vi.mock('../services/b2cPracticeSession.service', () => svc);
vi.mock('./loadRoomSession', () => ({ loadRoomSession: vi.fn() }));

const { submitAnswerWithBeginRetry } = await import('./submitAnswerWithBeginRetry');
const { resetExamRoomBeginsForTests } = await import('./enterExamRoom');

const INPUT = { sessionId: 's-1', questionId: 'q-1', file: new File(['a'], 'a.webm'), durationSec: 3 };
const OK = { answerId: 'a-1', questionId: 'q-1', status: 'Scoring', nextQuestion: null, interviewComplete: false };
function conflict(code: string) {
  return new AxiosError('409', '409', undefined, undefined, {
    status: 409, statusText: 'Conflict', data: { code, error: 'x' }, headers: {}, config: { headers: new AxiosHeaders() },
  });
}

describe('submitAnswerWithBeginRetry (ATT1 [I3] SESSION_NOT_BEGUN)', () => {
  const order: string[] = [];
  beforeEach(() => {
    order.length = 0;
    resetExamRoomBeginsForTests();
    Object.values(svc).forEach((fn) => fn.mockReset());
    svc.beginPracticeSession.mockImplementation(async () => { order.push('begin'); return null; });
  });

  it('thành công ngay ⇒ không begin', async () => {
    svc.submitPracticeAnswer.mockResolvedValue(OK);
    await expect(submitAnswerWithBeginRetry(INPUT)).resolves.toBe(OK);
    expect(svc.beginPracticeSession).not.toHaveBeenCalled();
  });

  it('409 SESSION_NOT_BEGUN ⇒ begin(sessionId) RỒI thử lại đúng 1 lần', async () => {
    svc.submitPracticeAnswer
      .mockImplementationOnce(async () => { order.push('upload'); throw conflict('SESSION_NOT_BEGUN'); })
      .mockImplementationOnce(async () => { order.push('upload'); return OK; });
    await expect(submitAnswerWithBeginRetry(INPUT)).resolves.toBe(OK);
    expect(order).toEqual(['upload', 'begin', 'upload']);
    expect(svc.beginPracticeSession).toHaveBeenCalledWith('s-1');
    expect(svc.submitPracticeAnswer).toHaveBeenNthCalledWith(2, INPUT);
  });

  it('thử lại vẫn SESSION_NOT_BEGUN ⇒ ném lỗi, KHÔNG begin/upload lần 3', async () => {
    svc.submitPracticeAnswer.mockImplementation(async () => { order.push('upload'); throw conflict('SESSION_NOT_BEGUN'); });
    await expect(submitAnswerWithBeginRetry(INPUT)).rejects.toMatchObject({ response: { data: { code: 'SESSION_NOT_BEGUN' } } });
    expect(order).toEqual(['upload', 'begin', 'upload']);
  });

  it('begin lỗi ⇒ ném lỗi begin, không upload lại', async () => {
    svc.submitPracticeAnswer.mockImplementation(async () => { order.push('upload'); throw conflict('SESSION_NOT_BEGUN'); });
    svc.beginPracticeSession.mockImplementation(async () => { order.push('begin'); throw conflict('SESSION_ENDED'); });
    await expect(submitAnswerWithBeginRetry(INPUT)).rejects.toMatchObject({ response: { data: { code: 'SESSION_ENDED' } } });
    expect(order).toEqual(['upload', 'begin']);
  });

  it.each(['SESSION_TIME_UP', 'SESSION_ENDED'])('409 %s ⇒ ném ngay, không begin, không thử lại', async (code) => {
    svc.submitPracticeAnswer.mockImplementation(async () => { order.push('upload'); throw conflict(code); });
    await expect(submitAnswerWithBeginRetry(INPUT)).rejects.toMatchObject({ response: { data: { code } } });
    expect(order).toEqual(['upload']);
  });
});
