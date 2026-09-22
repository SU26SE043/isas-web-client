/* @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { usePracticeAnswerRecorder } from './usePracticeAnswerRecorder';

const navigate = vi.fn();
const submitPracticeAnswer = vi.fn();
const submitPracticeSession = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('../services/b2cPracticeSession.service', () => ({
  submitPracticeAnswer: (...args: unknown[]) => submitPracticeAnswer(...args),
  submitPracticeSession: (...args: unknown[]) => submitPracticeSession(...args),
}));

const { useB2cPracticeAnswerSubmit } = await import('./useB2cPracticeAnswerSubmit');
const { useB2cPracticeInterviewStore } = await import('../stores/b2cPracticeInterviewStore');

const answerResponse = {
  answerId: 'answer-1',
  questionId: 'question-1',
  status: 'Scoring',
  nextQuestion: null,
  interviewComplete: false,
};

function createRecorder() {
  return {
    audioFile: new File(['audio'], 'answer.webm', { type: 'audio/webm' }),
    durationSec: 1,
    recordingStatus: 'stopped' as const,
    setUploading: vi.fn(),
    setSubmitted: vi.fn(),
    stopRecordingAndDiscard: vi.fn(),
    clearRecording: vi.fn(),
    setStopped: vi.fn(),
  } as unknown as ReturnType<typeof usePracticeAnswerRecorder>;
}

function useSubmitHook(overrides: Partial<Parameters<typeof useB2cPracticeAnswerSubmit>[0]> = {}) {
  return useB2cPracticeAnswerSubmit({
    sessionId: 'session-1',
    recorder: createRecorder(),
    currentQuestionId: 'question-1',
    currentQuestion: { id: 'question-1' },
    remainingSeconds: 0,
    stage: 'interviewing',
    isTimingOut: true,
    answersByQuestionId: {},
    onStopSpeech: vi.fn(),
    onStopMedia: vi.fn(),
    ...overrides,
  });
}

describe('useB2cPracticeAnswerSubmit timeout guards', () => {
  beforeEach(() => {
    useB2cPracticeInterviewStore.getState().reset();
    navigate.mockReset();
    submitPracticeAnswer.mockReset().mockResolvedValue(answerResponse);
    submitPracticeSession.mockReset().mockResolvedValue(undefined);
  });

  it('cho phép auto-submit bản ghi khi hết giờ', async () => {
    const { result } = renderHook(() => useSubmitHook());
    const file = new File(['audio'], 'answer.webm', { type: 'audio/webm' });

    await act(async () => {
      await result.current.submitAnswerWithFile(file, 1, { allowDuringTimeout: true });
    });

    expect(submitPracticeAnswer).toHaveBeenCalledTimes(1);
  });

  it('vẫn chặn submit thủ công khi đồng hồ đã về 0', async () => {
    const { result } = renderHook(() => useSubmitHook());
    const file = new File(['audio'], 'answer.webm', { type: 'audio/webm' });

    await expect(result.current.submitAnswerWithFile(file, 1)).rejects.toThrow('submit-blocked');
    expect(submitPracticeAnswer).not.toHaveBeenCalled();
  });

  it('hai lời gọi song song chỉ tạo một request', async () => {
    let resolveRequest: ((value: typeof answerResponse) => void) | null = null;
    submitPracticeAnswer.mockReturnValueOnce(
      new Promise<typeof answerResponse>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const { result } = renderHook(() => useSubmitHook({ isTimingOut: false, remainingSeconds: 10 }));
    const file = new File(['audio'], 'answer.webm', { type: 'audio/webm' });

    let first: Promise<void> | undefined;
    await act(async () => {
      first = result.current.submitAnswerWithFile(file, 1);
      await expect(result.current.submitAnswerWithFile(file, 1)).rejects.toThrow('submit-blocked');
    });
    expect(submitPracticeAnswer).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRequest?.(answerResponse);
      await first;
    });
  });
});
