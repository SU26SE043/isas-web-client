/* @vitest-environment jsdom */
import { useState } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const file = new File(['answer'], 'answer.webm', { type: 'audio/webm' });
type MockRecorderState = {
  status: 'idle' | 'recorded' | 'submitting';
  elapsedSeconds: number;
  audioFile: File | null;
};

vi.mock('./useAudioRecorder', () => ({
  useAudioRecorder: () => {
    const [state, setState] = useState<MockRecorderState>({
      status: 'recorded' as const,
      elapsedSeconds: 1,
      audioFile: file,
    });
    return {
      state,
      audioElementRef: { current: null },
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      resetRecording: () => setState((current) => ({ ...current, status: 'idle', audioFile: null })),
      replayAudio: vi.fn(),
      markSubmitting: () => setState((current) => ({ ...current, status: 'submitting' })),
      markSubmitError: vi.fn(),
    };
  },
}));

const { useAudioRecorderController } = await import('./useAudioRecorderController');

describe('useAudioRecorderController request guard', () => {
  it('consumes a new request received while an automatic submit is in flight', async () => {
    let resolveSubmit!: () => void;
    const onAutoSubmitRecording = vi.fn(
      () => new Promise<void>((resolve) => { resolveSubmit = resolve; }),
    );
    const onAutoSubmitEmpty = vi.fn().mockResolvedValue(undefined);

    const view = renderHook(
      ({ requestId }) => useAudioRecorderController({
        sessionId: 'session-1',
        questionId: 'question-1',
        maxDurationSeconds: 120,
        autoSubmitRequestId: requestId,
        onSubmitRecording: vi.fn().mockResolvedValue(undefined),
        onAutoSubmitRecording,
        onAutoSubmitEmpty,
      }),
      { initialProps: { requestId: 0 } },
    );

    view.rerender({ requestId: 1 });
    await waitFor(() => expect(onAutoSubmitRecording).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(view.result.current.state.status).toBe('submitting'));
    view.rerender({ requestId: 2 });

    await act(async () => {
      resolveSubmit();
      await Promise.resolve();
    });
    await waitFor(() => expect(onAutoSubmitEmpty).not.toHaveBeenCalled());
  });
});
