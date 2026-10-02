/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';

/**
 * ATT1-F5 — phòng B2C luyện tập (không begin) PHẢI y nguyên: dù upload có bị 409 SESSION_TIME_UP (không xảy ra
 * với Backend thật — buổi B2C không tính giờ) cũng không bao giờ vào luồng hết giờ / tự nộp bài.
 */

const navigate = vi.fn();
const svc = vi.hoisted(() => ({
  getQuestionSpeech: vi.fn(),
  submitPracticeAnswer: vi.fn(),
  submitPracticeSession: vi.fn(),
  beginPracticeSession: vi.fn(),
  getPracticeSession: vi.fn(),
}));
const loadRoomSession = vi.fn();
const media = { state: 'ready' as const, stream: null, videoRef: { current: null }, setVideoElement: vi.fn(), startMedia: vi.fn(), stopMedia: vi.fn(), attachStreamToVideo: vi.fn() };
const recorder = { recordingStatus: 'idle' as const, audioFile: null, durationSec: 0, errorKey: null, startRecording: vi.fn(), stopRecording: vi.fn(), stopRecordingAndDiscard: vi.fn(), pauseRecording: vi.fn(), resumeRecording: vi.fn(), clearRecording: vi.fn(), setUploading: vi.fn(), setSubmitted: vi.fn(), setStopped: vi.fn(), setIdle: vi.fn() };

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('../services/b2cPracticeSession.service', () => svc);
vi.mock('./loadRoomSession', () => ({ loadRoomSession: (...args: unknown[]) => loadRoomSession(...args) }));
vi.mock('./useInterviewMedia', () => ({ useInterviewMedia: () => media }));
vi.mock('./usePracticeAnswerRecorder', () => ({ usePracticeAnswerRecorder: () => recorder }));
vi.mock('./useQuestionSpeech', () => ({
  useQuestionSpeech: () => ({ isBusy: false, isLoadingSpeech: false, isPlaying: false, needsManualPlay: false, stopPlayback: vi.fn(), pausePlayback: vi.fn(), resumePlayback: vi.fn().mockResolvedValue(undefined), playManual: vi.fn() }),
}));
const { useB2cPracticeRoom } = await import('./useB2cPracticeRoom');
const { resetExamRoomBeginsForTests } = await import('./enterExamRoom');

const question = { id: 'question-1', orderNo: 1, content: 'Tell me about yourself.', timeLimitSec: 60, kind: 'Seed' as const };
const session = { id: 'session-1', language: 'en', timeLimitSec: 60, questions: [question], answers: [] } as unknown as PracticeSessionResponse;
function conflict(code: string) {
  return new AxiosError('409', '409', undefined, undefined, {
    status: 409, statusText: 'Conflict', data: { code, error: 'x' }, headers: {}, config: { headers: new AxiosHeaders() },
  });
}
async function flush(ms = 0) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

describe('useB2cPracticeRoom — B2C không bao giờ vào luồng hết giờ', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetExamRoomBeginsForTests();
    useB2cPracticeInterviewStore.getState().reset();
    useB2cPracticeInterviewStore.getState().hydrateFromSession(session);
    Object.values(recorder).forEach((value) => { if (vi.isMockFunction(value)) value.mockClear(); });
    Object.values(svc).forEach((fn) => fn.mockReset());
    loadRoomSession.mockReset().mockResolvedValue(session);
    svc.submitPracticeAnswer.mockRejectedValue(conflict('SESSION_TIME_UP'));
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('upload 409 SESSION_TIME_UP ở phòng B2C ⇒ chỉ báo lỗi (câu riêng của mã), KHÔNG màn hết giờ, KHÔNG nộp bài', async () => {
    const onExamTimeUp = vi.fn();
    const requestFinalRecording = vi.fn(() => true);
    const view = renderHook(() => useB2cPracticeRoom('session-1', { onExamTimeUp, requestFinalRecording }));
    await flush();

    const file = new File(['a'], 'a.webm', { type: 'audio/webm' });
    await act(async () => {
      await view.result.current.submitAnswerWithFile(file, 3).catch(() => undefined);
    });
    await flush(60_000);

    expect(svc.submitPracticeAnswer).toHaveBeenCalledTimes(1);
    expect(view.result.current.examTimeUp).toBeNull();
    expect(onExamTimeUp).not.toHaveBeenCalled();
    expect(requestFinalRecording).not.toHaveBeenCalled();
    expect(svc.submitPracticeSession).not.toHaveBeenCalled();
    expect(svc.beginPracticeSession).not.toHaveBeenCalled();
    expect(view.result.current.answerError).toBe('practice.errors.sessionTimeUp');
  });

  it('B2B: vào luồng hết giờ (409 SESSION_TIME_UP khi đồng hồ còn giờ) ⇒ API phòng không cho ghi âm / thoát / nộp thêm', async () => {
    const now = Date.now();
    svc.beginPracticeSession.mockResolvedValue({
      sessionId: 'session-1', beganAt: new Date(now).toISOString(), deadline: new Date(now + 10 * 60_000).toISOString(),
      serverNow: new Date(now).toISOString(), durationMinutes: 10,
    });
    // Câu 1 đã trả lời ⇒ trước khi hết giờ "Kết thúc sớm" bật được (canFinishEarly) — sau hết giờ phải tắt.
    const question2 = { id: 'question-2', orderNo: 2, content: 'What did you build?', timeLimitSec: 60, kind: 'Seed' as const };
    svc.getPracticeSession.mockResolvedValue({
      ...session, questions: [question, question2], answers: [{ answerId: 'a-1', questionId: 'question-1', status: 'Scored' }],
      serverNow: new Date(now).toISOString(), questionsLocked: false, durationMinutes: 10,
    });
    svc.submitPracticeSession.mockResolvedValue(undefined);
    const onExamTimeUp = vi.fn();
    const view = renderHook(() => useB2cPracticeRoom('session-1', { beginOnEnter: true, onExamTimeUp }));
    await flush();
    expect(view.result.current.examClock?.remainingSeconds).toBe(600);
    expect(view.result.current.currentQuestion?.id).toBe('question-2');
    expect(view.result.current.canFinishEarly).toBe(true);

    const file = new File(['a'], 'a.webm', { type: 'audio/webm' });
    await act(async () => {
      await view.result.current.submitAnswerWithFile(file, 3).catch(() => undefined);
    });
    await flush();
    expect(view.result.current.examTimeUp).toBe('submitted');
    expect(onExamTimeUp).toHaveBeenCalledTimes(1);
    expect(svc.submitPracticeSession).toHaveBeenCalledTimes(1);

    // Hiệu ứng vào câu (mount) gọi clearRecording — xoá lịch sử để chỉ đếm lời gọi SAU khi hết giờ.
    recorder.startRecording.mockClear();
    recorder.clearRecording.mockClear();
    act(() => { view.result.current.startRecording(); });
    act(() => { view.result.current.confirmRetryRecording(); });
    act(() => { view.result.current.setFinishOpen(true); });
    await act(async () => { await view.result.current.confirmFinish(); });
    let emptySubmitted: boolean | void = undefined;
    await act(async () => { emptySubmitted = await view.result.current.submitEmptyAnswer(); });
    await flush(60_000);

    expect(recorder.startRecording).not.toHaveBeenCalled();
    expect(recorder.clearRecording).not.toHaveBeenCalled();
    expect(view.result.current.finishOpen).toBe(false);
    expect(view.result.current.isTimingOut).toBe(true);
    expect(view.result.current.canFinishEarly).toBe(false);
    expect(emptySubmitted).toBe(false);
    expect(svc.submitPracticeAnswer).toHaveBeenCalledTimes(1);
    expect(svc.submitPracticeSession).toHaveBeenCalledTimes(1);
  });
});
