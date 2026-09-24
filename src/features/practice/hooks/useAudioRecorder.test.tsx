/* @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudioRecorder } from './useAudioRecorder';

describe('useAudioRecorder cancellation', () => {
  let resolveUserMedia: ((stream: MediaStream) => void) | undefined;
  const track = {
    enabled: true,
    readyState: 'live' as const,
    stop: vi.fn(),
    onended: null as (() => void) | null,
  };

  beforeEach(() => {
    resolveUserMedia = undefined;
    track.stop.mockReset();
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(() => new Promise<MediaStream>((resolve) => {
          resolveUserMedia = resolve;
        })),
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('stops a late microphone stream after recording was reset', async () => {
    const view = renderHook(() => useAudioRecorder({
      sessionId: 'session-1', questionId: 'question-1', maxDurationSeconds: 120,
    }));

    act(() => { void view.result.current.startRecording(); });
    await waitFor(() => expect(view.result.current.state.status).toBe('requesting-permission'));
    act(() => { view.result.current.resetRecording(); });

    const stream = {
      getAudioTracks: () => [track],
      getTracks: () => [track],
    } as unknown as MediaStream;
    await act(async () => {
      resolveUserMedia?.(stream);
      await Promise.resolve();
    });

    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(view.result.current.state.status).toBe('idle');
  });
});
