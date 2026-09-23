/* @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { usePracticeAnswerRecorder } from './usePracticeAnswerRecorder';

const navigate = vi.fn();
const submitPracticeAnswer = vi.fn();
const submitPracticeSession = vi.fn();

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('../services/b2cPracticeSession.service', () => ({
  submitPracticeAnswer: (...args: unknown[]) => submitPracticeAnswer(...args),
  submitPracticeSession: (...args: unknown[]) => submitPracticeSession(...args),
}));

const { useB2cPracticeAnswerSubmit } = await import('./useB2cPracticeAnswerSubmit');
const { useB2cPracticeInterviewStore } = await import('../stores/b2cPracticeInterviewStore');

const response = {
  answerId: 'answer-1', questionId: 'question-1', status: 'Scoring',
  nextQuestion: null, interviewComplete: false,
};

function recorder() {
  return {
    audioFile: new File(['audio'], 'answer.webm', { type: 'audio/webm' }),
    durationSec: 1, recordingStatus: 'stopped' as const,
    setUploading: vi.fn(), setSubmitted: vi.fn(), stopRecordingAndDiscard: vi.fn(),
    clearRecording: vi.fn(), setStopped: vi.fn(),
  } as unknown as ReturnType<typeof usePracticeAnswerRecorder>;
}

function useSubmit(overrides: Partial<Parameters<typeof useB2cPracticeAnswerSubmit>[0]> = {}) {
  return useB2cPracticeAnswerSubmit({
    sessionId: 'session-1', recorder: recorder(), currentQuestionId: 'question-1',
    currentQuestion: { id: 'question-1' }, remainingSeconds: 0, stage: 'interviewing',
    isTimingOut: true, answersByQuestionId: {}, onStopSpeech: vi.fn(), onStopMedia: vi.fn(),
    ...overrides,
  });
}

describe('useB2cPracticeAnswerSubmit timeout guards', () => {
  beforeEach(() => {
    useB2cPracticeInterviewStore.getState().reset();
    navigate.mockReset();
    submitPracticeAnswer.mockReset().mockResolvedValue(response);
    submitPracticeSession.mockReset().mockResolvedValue(undefined);
  });

  it('allows the automatic recorded answer at zero seconds', async () => {
    const { result } = renderHook(() => useSubmit());
    await act(async () => {
      await result.current.submitAnswerWithFile(new File(['audio'], 'answer.webm'), 1, { allowDuringTimeout: true });
    });
    expect(submitPracticeAnswer).toHaveBeenCalledTimes(1);
  });

  it('still blocks a manual answer at zero seconds', async () => {
    const { result } = renderHook(() => useSubmit());
    await expect(result.current.submitAnswerWithFile(new File(['audio'], 'answer.webm'), 1)).rejects.toThrow('submit-blocked');
    expect(submitPracticeAnswer).not.toHaveBeenCalled();
  });

  it('uses a ref guard for parallel submissions', async () => {
    let resolveRequest: ((value: typeof response) => void) | undefined;
    submitPracticeAnswer.mockReturnValueOnce(new Promise<typeof response>((resolve) => { resolveRequest = resolve; }));
    const { result } = renderHook(() => useSubmit({ isTimingOut: false, remainingSeconds: 10 }));
    const file = new File(['audio'], 'answer.webm');
    let first: Promise<void> | undefined;
    await act(async () => {
      first = result.current.submitAnswerWithFile(file, 1);
      await expect(result.current.submitAnswerWithFile(file, 1)).rejects.toThrow('submit-blocked');
    });
    expect(submitPracticeAnswer).toHaveBeenCalledTimes(1);
    await act(async () => { resolveRequest?.(response); await first; });
  });
});
