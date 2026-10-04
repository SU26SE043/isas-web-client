/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkPracticeFace, recordFocusEvent } from '../services/b2cPracticeSession.service';
import {
  captureVideoFrameAsJpegFile,
  isVideoFrameReady,
} from '@/features/campaigns/utils/captureJpegFile';
import { isCameraCovered } from '../utils/cameraCoverCheck';
import { FACE_CHECK_INTERVAL_MS, useB2cFaceCheck } from './useB2cFaceCheck';

vi.mock('../services/b2cPracticeSession.service', () => ({
  checkPracticeFace: vi.fn(),
  recordFocusEvent: vi.fn(),
}));
vi.mock('@/features/campaigns/utils/captureJpegFile', () => ({
  captureVideoFrameAsJpegFile: vi.fn(),
  isVideoFrameReady: vi.fn(() => true),
}));
vi.mock('../utils/cameraCoverCheck', () => ({
  isCameraCovered: vi.fn(() => false),
}));

const checkFace = vi.mocked(checkPracticeFace);
const record = vi.mocked(recordFocusEvent);
const capture = vi.mocked(captureVideoFrameAsJpegFile);
const frameReady = vi.mocked(isVideoFrameReady);
const frameCovered = vi.mocked(isCameraCovered);

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useB2cFaceCheck', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    capture.mockReset();
    capture.mockResolvedValue(new File(['frame'], 'frame.jpg', { type: 'image/jpeg' }));
    frameReady.mockReset();
    frameReady.mockReturnValue(true);
    frameCovered.mockReset();
    frameCovered.mockReturnValue(false);
    checkFace.mockReset();
    record.mockReset();
    // Jitter = 0 để nhịp lập lịch đoán trước được (Math.random=0.5 → (0.5*2-1)*jitter = 0).
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('camera BỊ CHE (tối kịt / mờ phẳng) → onSignal(low_light) tại chỗ, KHÔNG chụp, KHÔNG gọi AI; lặp thì không báo lại; sáng lại → null', async () => {
    // 2026-09-18 prod: che cam cả buổi ⇒ helper (lọc khung tối, sinh ra cho ảnh MỐC B2B) trả null ở
    // mọi nhịp ⇒ 0 request, 0 toast — người luyện không được nhắc gì. Nay tối = lời nhắc bật đèn.
    frameCovered.mockReturnValue(true);
    checkFace.mockResolvedValue({ faceCount: 1, signals: [] });
    const onSignal = vi.fn();
    renderHook(() => useB2cFaceCheck({ sessionId: 's1', enabled: true, videoEl: document.createElement('video'), onSignal }));

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(onSignal).toHaveBeenCalledWith('low_light');
    expect(capture).not.toHaveBeenCalled();       // không chụp ảnh đen
    expect(checkFace).not.toHaveBeenCalled();     // không tốn AI cho ảnh đen
    // 2026-10-03: che cam phải được GHI để màn kết quả hiện được — trước đây chỉ có toast.
    expect(record).toHaveBeenCalledWith('s1', 'camera_blocked');

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(onSignal).toHaveBeenCalledTimes(1);    // vẫn tối ⇒ không dội toast
    expect(record).toHaveBeenCalledTimes(2);      // nhưng VẪN ghi mỗi lượt kiểm (cùng nhịp với no_face phía server)

    frameCovered.mockReturnValue(false);          // bỏ tay ra: khung có nét, có mặt
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).toHaveBeenCalledTimes(1);
    expect(onSignal).toHaveBeenLastCalledWith(null);   // tín hiệu đã hết
    expect(record).toHaveBeenCalledTimes(2);           // khung sáng ⇒ không ghi thêm camera_blocked
  });

  it('camera chưa có frame (readyState/videoWidth = 0) → không nói gì, không chụp, không gọi AI', async () => {
    frameReady.mockReturnValue(false);
    const onSignal = vi.fn();
    renderHook(() => useB2cFaceCheck({ sessionId: 's1', enabled: true, videoEl: document.createElement('video'), onSignal }));
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(onSignal).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
    expect(checkFace).not.toHaveBeenCalled();
  });

  it('reports a face signal from the response and dedupes repeats of the same signal', async () => {
    checkFace.mockResolvedValue({ faceCount: 0, signals: ['no_face'] });
    const onSignal = vi.fn();
    const video = document.createElement('video');
    renderHook(() => useB2cFaceCheck({
      sessionId: 's1', enabled: true, videoEl: video, onSignal,
    }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS);
    });
    expect(onSignal).toHaveBeenCalledTimes(1);
    expect(onSignal).toHaveBeenCalledWith('no_face');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS);
    });
    // Cùng tín hiệu lượt kế — không gọi onSignal lần thứ hai.
    expect(onSignal).toHaveBeenCalledTimes(1);
  });

  it('calls onSignal(null) once the frame clears', async () => {
    checkFace.mockResolvedValueOnce({ faceCount: 0, signals: ['no_face'] });
    checkFace.mockResolvedValueOnce({ faceCount: 1, signals: [] });
    const onSignal = vi.fn();
    const video = document.createElement('video');
    renderHook(() => useB2cFaceCheck({
      sessionId: 's1', enabled: true, videoEl: video, onSignal,
    }));

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(onSignal).toHaveBeenLastCalledWith('no_face');

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(onSignal).toHaveBeenLastCalledWith(null);
  });

  it('treats a null (204/error) response as safe and does not call onSignal for an already-clear state', async () => {
    checkFace.mockResolvedValue(null);
    const onSignal = vi.fn();
    const video = document.createElement('video');
    renderHook(() => useB2cFaceCheck({
      sessionId: 's1', enabled: true, videoEl: video, onSignal,
    }));

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(onSignal).not.toHaveBeenCalled();
  });

  it('does not check when disabled', async () => {
    const video = document.createElement('video');
    renderHook(() => useB2cFaceCheck({
      sessionId: 's1', enabled: false, videoEl: video, onSignal: vi.fn(),
    }));
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS * 2); });
    expect(checkFace).not.toHaveBeenCalled();
  });

  it('does not check when completed, even if enabled', async () => {
    const video = document.createElement('video');
    renderHook(() => useB2cFaceCheck({
      sessionId: 's1', enabled: true, completed: true, videoEl: video, onSignal: vi.fn(),
    }));
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).not.toHaveBeenCalled();
  });

  it('defers a scheduled check while an answer upload is in flight, then flushes it once the upload finishes', async () => {
    checkFace.mockResolvedValue({ faceCount: 1, signals: [] });
    const video = document.createElement('video');
    const { rerender } = renderHook(
      (props: { uploadInFlight: boolean }) => useB2cFaceCheck({
        sessionId: 's1', enabled: true, videoEl: video, uploadInFlight: props.uploadInFlight, onSignal: vi.fn(),
      }),
      { initialProps: { uploadInFlight: true } },
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).not.toHaveBeenCalled();

    rerender({ uploadInFlight: false });
    await act(async () => { await Promise.resolve(); });
    expect(checkFace).toHaveBeenCalledTimes(1);
  });

  it('defers while the tab is hidden and flushes on visibilitychange', async () => {
    checkFace.mockResolvedValue({ faceCount: 1, signals: [] });
    const video = document.createElement('video');
    renderHook(() => useB2cFaceCheck({ sessionId: 's1', enabled: true, videoEl: video, onSignal: vi.fn() }));

    act(() => setVisibility('hidden'));
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).not.toHaveBeenCalled();

    await act(async () => {
      setVisibility('visible');
      await Promise.resolve();
    });
    expect(checkFace).toHaveBeenCalledTimes(1);
  });

  it('does not call the AI service when the video frame is unusable (capture returns null)', async () => {
    capture.mockResolvedValue(null);
    const video = document.createElement('video');
    renderHook(() => useB2cFaceCheck({ sessionId: 's1', enabled: true, videoEl: video, onSignal: vi.fn() }));
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).not.toHaveBeenCalled();
  });
});
