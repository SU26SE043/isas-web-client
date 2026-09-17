/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkPracticeFace } from '../services/b2cPracticeSession.service';
import { captureVideoFrameAsJpegFile } from '@/features/campaigns/utils/captureJpegFile';
import { FACE_CHECK_INTERVAL_MS, useB2cFaceCheck } from './useB2cFaceCheck';

vi.mock('../services/b2cPracticeSession.service', () => ({
  checkPracticeFace: vi.fn(),
}));
vi.mock('@/features/campaigns/utils/captureJpegFile', () => ({
  captureVideoFrameAsJpegFile: vi.fn(),
}));

const checkFace = vi.mocked(checkPracticeFace);
const capture = vi.mocked(captureVideoFrameAsJpegFile);

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value });
  document.dispatchEvent(new Event('visibilitychange'));
}

function videoRefWith(video: HTMLVideoElement | null) {
  return { current: video };
}

describe('useB2cFaceCheck', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    capture.mockReset();
    capture.mockResolvedValue(new File(['frame'], 'frame.jpg', { type: 'image/jpeg' }));
    checkFace.mockReset();
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // jitter = 0 — timing xác định trong test
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('captures with allowDarkFrame + maxWidth 640 and calls onSignal for a NEW signal', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValue({ faceCount: 0, signals: ['no_face'] });
    const onSignal = vi.fn();
    const video = document.createElement('video');
    renderHook(() =>
      useB2cFaceCheck({ sessionId: 's1', enabled: true, videoRef: videoRefWith(video), onSignal }),
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });

    expect(capture).toHaveBeenCalledWith(
      video,
      expect.stringContaining('face-check-s1-'),
      0.85,
      { allowDarkFrame: true, maxWidth: 640 },
    );
    expect(onSignal).toHaveBeenCalledWith('no_face');
    expect(onSignal).toHaveBeenCalledTimes(1);
  });

  it('does NOT re-call onSignal while the same signal stays active (edge-detect)', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValue({ faceCount: 0, signals: ['no_face'] });
    const onSignal = vi.fn();
    const video = document.createElement('video');
    renderHook(() =>
      useB2cFaceCheck({ sessionId: 's1', enabled: true, videoRef: videoRefWith(video), onSignal }),
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });

    expect(checkFace).toHaveBeenCalledTimes(2);
    expect(onSignal).toHaveBeenCalledTimes(1);
  });

  it('calls onSignal(null) when the signal clears', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValueOnce({ faceCount: 0, signals: ['no_face'] });
    checkFace.mockResolvedValueOnce({ faceCount: 1, signals: [] });
    const onSignal = vi.fn();
    const video = document.createElement('video');
    renderHook(() =>
      useB2cFaceCheck({ sessionId: 's1', enabled: true, videoRef: videoRefWith(video), onSignal }),
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });

    expect(onSignal.mock.calls).toEqual([['no_face'], [null]]);
  });

  it('a 204/null API result clears the active signal', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValueOnce({ faceCount: 0, signals: ['no_face'] });
    checkFace.mockResolvedValueOnce(null);
    const onSignal = vi.fn();
    const video = document.createElement('video');
    renderHook(() =>
      useB2cFaceCheck({ sessionId: 's1', enabled: true, videoRef: videoRefWith(video), onSignal }),
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });

    expect(onSignal.mock.calls).toEqual([['no_face'], [null]]);
  });

  it('skips the check while a document is hidden, and does not call the API', async () => {
    vi.useFakeTimers();
    setVisibility('hidden');
    const onSignal = vi.fn();
    const video = document.createElement('video');
    renderHook(() =>
      useB2cFaceCheck({ sessionId: 's1', enabled: true, videoRef: videoRefWith(video), onSignal }),
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });

    expect(checkFace).not.toHaveBeenCalled();
  });

  it('skips while an upload is in flight, then flushes once it finishes', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValue({ faceCount: 1, signals: [] });
    const video = document.createElement('video');
    const { rerender } = renderHook(
      ({ uploadInFlight }) =>
        useB2cFaceCheck({
          sessionId: 's1', enabled: true, videoRef: videoRefWith(video), uploadInFlight, onSignal: vi.fn(),
        }),
      { initialProps: { uploadInFlight: true } },
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).not.toHaveBeenCalled();

    rerender({ uploadInFlight: false });
    await act(async () => { await Promise.resolve(); });
    expect(checkFace).toHaveBeenCalledOnce();
  });

  it('does not schedule anything when disabled', async () => {
    vi.useFakeTimers();
    const video = document.createElement('video');
    renderHook(() =>
      useB2cFaceCheck({ sessionId: 's1', enabled: false, videoRef: videoRefWith(video), onSignal: vi.fn() }),
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS * 2); });
    expect(checkFace).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
  });

  it('stops polling after unmount', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValue({ faceCount: 1, signals: [] });
    const video = document.createElement('video');
    const { unmount } = renderHook(() =>
      useB2cFaceCheck({ sessionId: 's1', enabled: true, videoRef: videoRefWith(video), onSignal: vi.fn() }),
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).toHaveBeenCalledOnce();
    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).toHaveBeenCalledOnce();
  });
});
