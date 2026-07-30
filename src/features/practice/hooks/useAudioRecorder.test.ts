/* @vitest-environment jsdom */
import { act, cleanup, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudioRecorder } from './useAudioRecorder';

describe('useAudioRecorder replay and cleanup', () => {
  const createObjectURL = vi.fn(() => 'blob:mock-audio-url');
  const revokeObjectURL = vi.fn();
  const play = vi.fn().mockResolvedValue(undefined);
  const pause = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });
    HTMLMediaElement.prototype.play = play;
    HTMLMediaElement.prototype.pause = pause;

    class MockMediaRecorder {
      static isTypeSupported = vi.fn(() => true);
      state: RecordingState = 'inactive';
      mimeType = 'audio/webm';
      stream: MediaStream;
      options?: MediaRecorderOptions;
      ondataavailable: ((event: BlobEvent) => void) | null = null;
      onstop: (() => void) | null = null;

      constructor(stream: MediaStream, options?: MediaRecorderOptions) {
        this.stream = stream;
        this.options = options;
      }

      start() {
        this.state = 'recording';
      }

      stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['chunk'], { type: 'audio/webm' }) } as BlobEvent);
        this.onstop?.();
      }
    }

    vi.stubGlobal('MediaRecorder', MockMediaRecorder as unknown as typeof MediaRecorder);

    const track = { enabled: true, readyState: 'live', stop: vi.fn(), onended: null as (() => void) | null };
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getAudioTracks: () => [track],
          getTracks: () => [track],
        }),
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('creates preview url after stop without calling upload APIs', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useAudioRecorder({
        sessionId: 'session-1',
        questionId: 'question-1',
        maxDurationSeconds: 120,
      }),
    );

    await act(async () => {
      await result.current.startRecording();
      await new Promise((resolve) => window.setTimeout(resolve, 1100));
      result.current.stopRecording();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('recorded');
    });

    expect(createObjectURL).toHaveBeenCalled();
    expect(result.current.state.previewUrl).toBe('blob:mock-audio-url');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('replays audio from the beginning', async () => {
    const { result } = renderHook(() =>
      useAudioRecorder({
        sessionId: 'session-1',
        questionId: 'question-1',
        maxDurationSeconds: 120,
      }),
    );

    await act(async () => {
      await result.current.startRecording();
      await new Promise((resolve) => window.setTimeout(resolve, 1100));
      result.current.stopRecording();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.state.previewUrl).toBeTruthy();
    });

    const audio = document.createElement('audio');
    Object.defineProperty(audio, 'currentTime', {
      writable: true,
      value: 5,
    });
    result.current.audioElementRef.current = audio;

    await act(async () => {
      await result.current.replayAudio();
    });

    expect(pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
    expect(play).toHaveBeenCalled();
  });

  it('clears blob url on reset', async () => {
    const { result } = renderHook(() =>
      useAudioRecorder({
        sessionId: 'session-1',
        questionId: 'question-1',
        maxDurationSeconds: 120,
      }),
    );

    await act(async () => {
      await result.current.startRecording();
      await new Promise((resolve) => window.setTimeout(resolve, 1100));
      result.current.stopRecording();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.state.previewUrl).toBeTruthy();
    });

    act(() => {
      result.current.resetRecording();
    });

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-audio-url');
    expect(result.current.state.previewUrl).toBeNull();
    expect(result.current.state.audioBlob).toBeNull();
  });

  it('keeps preview audio when submit fails', async () => {
    const { result } = renderHook(() =>
      useAudioRecorder({
        sessionId: 'session-1',
        questionId: 'question-1',
        maxDurationSeconds: 120,
      }),
    );

    await act(async () => {
      await result.current.startRecording();
      await new Promise((resolve) => window.setTimeout(resolve, 1100));
      result.current.stopRecording();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.state.audioFile).toBeTruthy();
    });

    act(() => {
      result.current.markSubmitError('practice.audioRecorder.submitFailedHint');
    });

    expect(result.current.state.status).toBe('recorded');
    expect(result.current.state.audioFile).toBeTruthy();
    expect(result.current.state.previewUrl).toBe('blob:mock-audio-url');
    expect(result.current.state.errorKind).toBe('submit-failed');
  });
});
