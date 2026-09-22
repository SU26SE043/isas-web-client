/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';

const navigate = vi.fn();
const getQuestionSpeech = vi.fn();
const submitPracticeAnswer = vi.fn();
const submitPracticeSession = vi.fn();
const loadRoomSession = vi.fn();
const onAutoSubmitRequest = vi.fn();

const media = {
  state: 'ready' as const,
  stream: null,
  videoRef: { current: null },
  setVideoElement: vi.fn(),
  startMedia: vi.fn(),
  stopMedia: vi.fn(),
  attachStreamToVideo: vi.fn(),
};

const recorder = {
  recordingStatus: 'idle' as const,
  audioFile: null,
  durationSec: 0,
  errorKey: null,
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  stopRecordingAndDiscard: vi.fn(),
  pauseRecording: vi.fn(),
  resumeRecording: vi.fn(),
  clearRecording: vi.fn(),
  setUploading: vi.fn(),
  setSubmitted: vi.fn(),
  setStopped: vi.fn(),
  setIdle: vi.fn(),
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('../services/b2cPracticeSession.service', () => ({
  getQuestionSpeech: (...args: unknown[]) => getQuestionSpeech(...args),
  submitPracticeAnswer: (...args: unknown[]) => submitPracticeAnswer(...args),
  submitPracticeSession: (...args: unknown[]) => submitPracticeSession(...args),
}));

vi.mock('./loadRoomSession', () => ({
  loadRoomSession: (...args: unknown[]) => loadRoomSession(...args),
}));

vi.mock('./useInterviewMedia', () => ({
  useInterviewMedia: () => media,
}));

vi.mock('./usePracticeAnswerRecorder', () => ({
  usePracticeAnswerRecorder: () => recorder,
}));

vi.mock('../utils/interviewerSpeechBus', () => ({
  attachSpeechAudio: vi.fn().mockResolvedValue(undefined),
  detachSpeechAudio: vi.fn(),
}));

vi.mock('../utils/speechPlaybackWatchdog', () => ({
  waitForSpeechEnd: vi.fn().mockResolvedValue(undefined),
}));

const { useB2cPracticeRoom } = await import('./useB2cPracticeRoom');

const question1 = {
  id: 'question-1',
  orderNo: 1,
  content: 'Tell me about yourself.',
  timeLimitSec: 10,
  kind: 'Seed' as const,
};
const question2 = {
  id: 'question-2',
  orderNo: 2,
  content: 'What did you build recently?',
  timeLimitSec: 10,
  kind: 'Seed' as const,
};
const session = {
  id: 'session-1',
  language: 'en',
  timeLimitSec: 10,
  questions: [question1, question2],
  answers: [],
} as unknown as PracticeSessionResponse;

const answerResponse = {
  answerId: 'answer-1',
  questionId: 'question-1',
  status: 'Scoring',
  nextQuestion: question2,
  interviewComplete: false,
};

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function renderRoom(options: Parameters<typeof useB2cPracticeRoom>[1] = {}) {
  return renderHook(() => useB2cPracticeRoom('session-1', options));
}

describe('useB2cPracticeRoom timeout recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useB2cPracticeInterviewStore.getState().reset();
    useB2cPracticeInterviewStore.getState().hydrateFromSession(session);
    useB2cPracticeInterviewStore.getState().setRemainingSeconds(0);
    navigate.mockReset();
    getQuestionSpeech.mockReset().mockResolvedValue(new Blob(['speech'], { type: 'audio/mpeg' }));
    submitPracticeAnswer.mockReset().mockResolvedValue(answerResponse);
    submitPracticeSession.mockReset().mockResolvedValue(undefined);
    loadRoomSession.mockReset().mockResolvedValue(session);
    onAutoSubmitRequest.mockReset();
    Object.values(media).forEach((value) => {
      if (typeof value === 'function' && 'mockClear' in value) value.mockClear();
    });
    Object.values(recorder).forEach((value) => {
      if (typeof value === 'function' && 'mockClear' in value) value.mockClear();
    });
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:question-speech'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('hết giờ khi modal đóng sẽ nộp rỗng đúng một lần và chuyển câu', async () => {
    const view = renderRoom();
    await flush();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    await flush();

    expect(submitPracticeAnswer).toHaveBeenCalledTimes(1);
    expect(submitPracticeAnswer).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'session-1',
      questionId: 'question-1',
      durationSec: 0,
    }));
    expect(view.result.current.currentQuestion?.id).toBe('question-2');
  });

  it('hết giờ lúc modal mở chỉ phát một request auto-submit và watchdog có đường nộp rỗng', async () => {
    const view = renderRoom({
      answerRecorderOpen: true,
      onAutoSubmitRequest,
    });
    await flush();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(onAutoSubmitRequest).toHaveBeenCalledTimes(1);
    expect(submitPracticeAnswer).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000);
    });
    await flush();

    expect(submitPracticeAnswer).toHaveBeenCalledTimes(1);
    expect(view.result.current.currentQuestion?.id).toBe('question-2');
  });

  it('dependency đổi ở 100ms cuối vẫn không làm mất đường auto-advance', async () => {
    const view = renderHook(
      ({ open }) => useB2cPracticeRoom('session-1', {
        answerRecorderOpen: open,
        onAutoSubmitRequest,
      }),
      { initialProps: { open: true } },
    );
    await flush();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    view.rerender({ open: false });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(onAutoSubmitRequest).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000);
    });
    await flush();

    expect(submitPracticeAnswer).toHaveBeenCalledTimes(1);
    expect(view.result.current.currentQuestion?.id).toBe('question-2');
  });

  it('watchdog không nộp chồng khi modal đã submit thành công', async () => {
    const view = renderRoom({
      answerRecorderOpen: true,
      onAutoSubmitRequest,
    });
    await flush();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    const file = new File(['answer'], 'answer.webm', { type: 'audio/webm' });
    await act(async () => {
      await view.result.current.submitAnswerWithFile(file, 1, { allowDuringTimeout: true });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000);
    });

    expect(submitPracticeAnswer).toHaveBeenCalledTimes(1);
    expect(submitPracticeAnswer).toHaveBeenCalledWith(expect.objectContaining({ durationSec: 1 }));
  });

  it('watchdog dừng sau ba lỗi liên tiếp và mở khoá phòng', async () => {
    submitPracticeAnswer.mockRejectedValue(new Error('network'));
    const view = renderRoom({
      answerRecorderOpen: true,
      onAutoSubmitRequest,
    });
    await flush();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150 + 6_000);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000);
    });
    await flush();

    expect(submitPracticeAnswer).toHaveBeenCalledTimes(3);
    expect(view.result.current.isTimingOut).toBe(false);
    expect(view.result.current.answerError).toBe('practice.errors.submitAnswerFailed');
  });

  it('deadline B2B hết trong phase reading vẫn auto-submit', async () => {
    const view = renderRoom({
      deadlineAt: new Date(Date.now() - 1_000).toISOString(),
    });
    await flush();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    await flush();

    expect(submitPracticeAnswer).toHaveBeenCalledTimes(1);
    expect(view.result.current.currentQuestion?.id).toBe('question-2');
  });
});
