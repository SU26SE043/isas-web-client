/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import { captureVideoFrameAsJpegFile } from '../utils/captureJpegFile';
import {
  FACE_CHECK_ALERT_INTERVAL_MS,
  FACE_CHECK_INTERVAL_MS,
  useCampaignFaceCheck,
} from './useCampaignFaceCheck';

vi.mock('../services/campaignCandidate.service', () => ({
  campaignCandidateService: {
    checkCampaignFace: vi.fn(),
    createCampaignFlag: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('../utils/captureJpegFile', () => ({
  captureVideoFrameAsJpegFile: vi.fn(),
}));

const checkFace = vi.mocked(campaignCandidateService.checkCampaignFace);
const createFlag = vi.mocked(campaignCandidateService.createCampaignFlag);
const capture = vi.mocked(captureVideoFrameAsJpegFile);

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useCampaignFaceCheck', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    capture.mockReset();
    capture.mockResolvedValue(new File(['frame'], 'frame.jpg', { type: 'image/jpeg' }));
    checkFace.mockReset();
    createFlag.mockReset();
    createFlag.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('opens a blocking signal from the face-check response without creating a flag', async () => {
    checkFace.mockResolvedValue({ match: false, faceCount: 0, signals: ['no_face'] });
    const onSignal = vi.fn();
    const video = document.createElement('video');
    const { result } = renderHook(() => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, videoEl: video, onSignal,
    }));

    let outcome: Awaited<ReturnType<typeof result.current.checkNow>>;
    await act(async () => { outcome = await result.current.checkNow(); });

    expect(outcome!).toEqual({ safe: false, signals: ['no_face'] });
    expect(onSignal).toHaveBeenCalledWith('no_face');
    expect(checkFace).toHaveBeenCalledOnce();
  });

  it('treats the API v10 204 response as safe', async () => {
    checkFace.mockResolvedValue(null);
    const video = document.createElement('video');
    const { result } = renderHook(() => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, videoEl: video, onSignal: vi.fn(),
    }));

    await expect(result.current.checkNow()).resolves.toEqual({ safe: true, signals: [] });
  });

  it('polls every 30 seconds and clears the interval on cleanup', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValue({ match: true, faceCount: 1, signals: [] });
    const video = document.createElement('video');
    const { unmount } = renderHook(() => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, videoEl: video, onSignal: vi.fn(),
    }));

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).toHaveBeenCalledOnce();
    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).toHaveBeenCalledOnce();
  });

  it('does not check when proctoring is disabled', async () => {
    const video = document.createElement('video');
    const { result } = renderHook(() => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: false, videoEl: video, onSignal: vi.fn(),
    }));

    await expect(result.current.checkNow()).resolves.toBeNull();
    expect(capture).not.toHaveBeenCalled();
    expect(checkFace).not.toHaveBeenCalled();
  });

  it('re-queries the video element once when the original capture fails', async () => {
    const staleVideo = document.createElement('video');
    const freshVideo = document.createElement('video');
    const container = document.createElement('div');
    container.setAttribute('data-campaign-interview', '');
    container.appendChild(freshVideo);
    document.body.appendChild(container);
    capture.mockResolvedValueOnce(null).mockResolvedValueOnce(new File(['frame'], 'fresh.jpg'));
    checkFace.mockResolvedValue({ match: true, faceCount: 1, signals: [] });
    const { result } = renderHook(() => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, videoEl: staleVideo, onSignal: vi.fn(),
    }));

    await act(async () => { await result.current.checkNow(); });
    expect(capture).toHaveBeenCalledTimes(2);
    expect(capture.mock.calls[1][0]).toBe(freshVideo);
    expect(checkFace).toHaveBeenCalledOnce();
  });

  it('switches to 10 seconds after an abnormal check and returns to 30 after two clean checks', async () => {
    vi.useFakeTimers();
    checkFace
      .mockResolvedValueOnce({ match: false, faceCount: 1, signals: ['face_mismatch'] })
      .mockResolvedValue({ match: true, faceCount: 1, signals: [] });
    const video = document.createElement('video');
    renderHook(() => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, videoEl: video, onSignal: vi.fn(),
    }));

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_ALERT_INTERVAL_MS); });
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_ALERT_INTERVAL_MS); });
    expect(checkFace).toHaveBeenCalledTimes(3);

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS - FACE_CHECK_ALERT_INTERVAL_MS); });
    expect(checkFace).toHaveBeenCalledTimes(3);
  });

  it('does not count a capture failure as a clean check', async () => {
    vi.useFakeTimers();
    capture.mockResolvedValue(null);
    const video = document.createElement('video');
    renderHook(() => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, videoEl: video, onSignal: vi.fn(),
    }));

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(capture).toHaveBeenCalledTimes(4);
    expect(checkFace).not.toHaveBeenCalled();
  });

  it('defers an upload-time check and runs immediately after upload without resetting the last check', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValue({ match: true, faceCount: 1, signals: [] });
    const video = document.createElement('video');
    const { rerender } = renderHook(({ uploadInFlight }) => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, videoEl: video,
      uploadInFlight, onSignal: vi.fn(),
    }), { initialProps: { uploadInFlight: false } });

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    rerender({ uploadInFlight: true });
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    expect(checkFace).toHaveBeenCalledOnce();
    rerender({ uploadInFlight: false });
    await act(async () => { await Promise.resolve(); });
    expect(checkFace).toHaveBeenCalledTimes(2);
    expect(createFlag).not.toHaveBeenCalled();
  });

  it('reports one measured monitoring gap when a deferred check resumes late', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValue({ match: true, faceCount: 1, signals: [] });
    const video = document.createElement('video');
    const { rerender } = renderHook(({ uploadInFlight }) => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, videoEl: video,
      uploadInFlight, onSignal: vi.fn(),
    }), { initialProps: { uploadInFlight: false } });

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    rerender({ uploadInFlight: true });
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS + 31_000); });
    rerender({ uploadInFlight: false });
    await act(async () => { await Promise.resolve(); });

    expect(createFlag).toHaveBeenCalledExactlyOnceWith('campaign-1', 'session-1', {
      signalType: 'monitoring_gap',
      note: 'Khoảng cách giữa 2 lần kiểm tra khuôn mặt ~61s (nhịp bình thường 30s)',
    });
  });

  it('defers a hidden-tab check and measures the gap when the candidate returns', async () => {
    vi.useFakeTimers();
    checkFace.mockResolvedValue({ match: true, faceCount: 1, signals: [] });
    const video = document.createElement('video');
    renderHook(() => useCampaignFaceCheck({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, videoEl: video, onSignal: vi.fn(),
    }));

    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS); });
    setVisibility('hidden');
    await act(async () => { await vi.advanceTimersByTimeAsync(FACE_CHECK_INTERVAL_MS + 31_000); });
    setVisibility('visible');
    await act(async () => { await Promise.resolve(); });

    expect(createFlag).toHaveBeenCalledOnce();
    expect(createFlag.mock.calls[0][2].note).toContain('(nhịp bình thường 30s)');
  });
});
