/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import { captureVideoFrameAsJpegFile } from '../utils/captureJpegFile';
import { FACE_CHECK_INTERVAL_MS, useCampaignFaceCheck } from './useCampaignFaceCheck';

vi.mock('../services/campaignCandidate.service', () => ({
  campaignCandidateService: { checkCampaignFace: vi.fn() },
}));
vi.mock('../utils/captureJpegFile', () => ({
  captureVideoFrameAsJpegFile: vi.fn(),
}));

const checkFace = vi.mocked(campaignCandidateService.checkCampaignFace);
const capture = vi.mocked(captureVideoFrameAsJpegFile);

describe('useCampaignFaceCheck', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    capture.mockResolvedValue(new File(['frame'], 'frame.jpg', { type: 'image/jpeg' }));
    checkFace.mockReset();
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
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: false, videoEl: video, onSignal,
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
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: false, videoEl: video, onSignal: vi.fn(),
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
});
