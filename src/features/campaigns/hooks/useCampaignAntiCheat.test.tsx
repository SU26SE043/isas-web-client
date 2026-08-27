/* @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import { useCampaignAntiCheat } from './useCampaignAntiCheat';

vi.mock('../services/campaignCandidate.service', () => ({
  campaignCandidateService: { createCampaignFlag: vi.fn().mockResolvedValue(undefined) },
}));

const createFlag = vi.mocked(campaignCandidateService.createCampaignFlag);

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value });
  document.dispatchEvent(new Event('visibilitychange'));
}

function createFakeVideoTrack(live = true) {
  const bus = new EventTarget();
  const track = {
    kind: 'video',
    readyState: live ? 'live' : 'ended',
    enabled: live,
    muted: false,
    addEventListener: bus.addEventListener.bind(bus),
    removeEventListener: bus.removeEventListener.bind(bus),
    end() {
      track.readyState = 'ended';
      bus.dispatchEvent(new Event('ended'));
    },
  };
  return track;
}

function createFakeStream(tracks: ReturnType<typeof createFakeVideoTrack>[]) {
  return { getVideoTracks: () => tracks } as unknown as MediaStream;
}

describe('useCampaignAntiCheat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    createFlag.mockClear();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('reports a tab switch only after the candidate returns to the tab', async () => {
    const onViolation = vi.fn();
    const onPause = vi.fn();
    const onBehaviorSignal = vi.fn();
    renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onPause, onViolation, onBehaviorSignal,
    }));

    act(() => setVisibility('hidden'));
    expect(onPause).not.toHaveBeenCalled();
    expect(onViolation).not.toHaveBeenCalled();
    expect(createFlag).toHaveBeenCalledOnce();

    act(() => setVisibility('visible'));
    expect(onViolation).not.toHaveBeenCalled();
    expect(onBehaviorSignal).toHaveBeenCalledExactlyOnceWith('tab_switch');
    expect(createFlag).toHaveBeenCalledWith('campaign-1', 'session-1', {
      signalType: 'tab_switch',
      note: 'Candidate switched away from the interview tab.',
    });
  });

  it('reports focus_lost without pausing when the window loses focus', () => {
    const onPause = vi.fn();
    const onViolation = vi.fn();
    const onBehaviorSignal = vi.fn();
    renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onPause, onViolation, onBehaviorSignal,
    }));

    act(() => window.dispatchEvent(new Event('blur')));
    expect(onPause).not.toHaveBeenCalled();
    expect(onViolation).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(250));
    expect(createFlag).toHaveBeenCalledWith('campaign-1', 'session-1', {
      signalType: 'focus_lost',
      note: 'Candidate lost focus from the interview window.',
    });

    act(() => window.dispatchEvent(new Event('focus')));
    expect(onViolation).not.toHaveBeenCalled();
    expect(onBehaviorSignal).toHaveBeenCalledTimes(1);
    expect(onBehaviorSignal).toHaveBeenCalledWith('focus_lost');
    expect(createFlag).toHaveBeenCalledOnce();
  });

  it('adds the recovery note to behavior flags while a violation dialog is open', () => {
    renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1',
      sessionId: 'session-1',
      enabled: true,
      recoveryActive: true,
      onViolation: vi.fn(),
    }));

    act(() => document.dispatchEvent(new Event('paste')));

    expect(createFlag).toHaveBeenCalledWith('campaign-1', 'session-1', {
      signalType: 'paste',
      note: 'Candidate attempted to paste content during the interview. (đang khắc phục thiết bị)',
    });
  });

  it('maps fullscreen exit to tab_switch with the API v10 note', () => {
    const onViolation = vi.fn();
    const { result } = renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onViolation,
    }));

    act(() => {
      result.current.reportFullscreenExit();
      vi.advanceTimersByTime(250);
    });

    expect(createFlag).toHaveBeenCalledWith('campaign-1', 'session-1', {
      signalType: 'tab_switch',
      note: 'Candidate exited fullscreen mode.',
    });
  });

  it('deduplicates fullscreen and visibility events from one physical switch', () => {
    const onViolation = vi.fn();
    const { result } = renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onViolation,
    }));

    act(() => {
      setVisibility('hidden');
      result.current.reportFullscreenExit();
      vi.advanceTimersByTime(250);
      setVisibility('visible');
    });

    expect(createFlag).toHaveBeenCalledOnce();
    expect(createFlag).toHaveBeenCalledWith('campaign-1', 'session-1', {
      signalType: 'tab_switch',
      note: 'Candidate switched away from the interview tab.',
    });
  });

  it('deduplicates blur, visibility, and fullscreen events from one Alt+Tab', () => {
    const onViolation = vi.fn();
    const onBehaviorSignal = vi.fn();
    const { result } = renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onViolation, onBehaviorSignal,
    }));

    act(() => {
      window.dispatchEvent(new Event('blur'));
      setVisibility('hidden');
      result.current.reportFullscreenExit();
      vi.advanceTimersByTime(250);
    });
    expect(createFlag).toHaveBeenCalledOnce();
    expect(onViolation).not.toHaveBeenCalled();

    act(() => {
      setVisibility('visible');
      window.dispatchEvent(new Event('focus'));
    });
    expect(createFlag).toHaveBeenCalledOnce();
    expect(onViolation).not.toHaveBeenCalled();
    expect(onBehaviorSignal).toHaveBeenCalledOnce();
  });

  it('does not report a fullscreen violation on initial render', () => {
    renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onViolation: vi.fn(),
    }));

    expect(createFlag).not.toHaveBeenCalled();
  });

  it('cancels a pending blur report during cleanup', () => {
    const { unmount } = renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onViolation: vi.fn(),
    }));

    act(() => window.dispatchEvent(new Event('blur')));
    unmount();
    act(() => vi.advanceTimersByTime(250));
    expect(createFlag).not.toHaveBeenCalled();
  });

  it('reports camera loss once when the video track ends', () => {
    const track = createFakeVideoTrack();
    const onPause = vi.fn();
    const onViolation = vi.fn();
    renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1',
      sessionId: 'session-1',
      enabled: true,
      stream: createFakeStream([track]),
      onPause,
      onViolation,
    }));

    act(() => track.end());

    expect(onPause).toHaveBeenCalledOnce();
    expect(onViolation).toHaveBeenCalledExactlyOnceWith('camera_blocked');
    expect(createFlag).toHaveBeenCalledExactlyOnceWith('campaign-1', 'session-1', {
      signalType: 'camera_blocked',
      note: 'Candidate camera became unavailable during the interview.',
    });

    // Polling must not re-send the same transition.
    act(() => vi.advanceTimersByTime(10_000));
    expect(createFlag).toHaveBeenCalledOnce();
    expect(onViolation).toHaveBeenCalledOnce();
  });

  it('detects a camera that stops without firing ended', () => {
    const track = createFakeVideoTrack();
    const onViolation = vi.fn();
    renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1',
      sessionId: 'session-1',
      enabled: true,
      stream: createFakeStream([track]),
      onViolation,
    }));

    act(() => {
      track.readyState = 'ended';
      vi.advanceTimersByTime(2_000);
    });

    expect(onViolation).toHaveBeenCalledExactlyOnceWith('camera_blocked');
  });

  it('does not report a camera that was never live', () => {
    const onViolation = vi.fn();
    renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1',
      sessionId: 'session-1',
      enabled: true,
      stream: createFakeStream([createFakeVideoTrack(false)]),
      onViolation,
    }));

    act(() => vi.advanceTimersByTime(10_000));

    expect(onViolation).not.toHaveBeenCalled();
    expect(createFlag).not.toHaveBeenCalled();
  });

  it('stops watching the camera after cleanup', () => {
    const track = createFakeVideoTrack();
    const { unmount } = renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1',
      sessionId: 'session-1',
      enabled: true,
      stream: createFakeStream([track]),
      onViolation: vi.fn(),
    }));

    unmount();
    act(() => {
      track.end();
      vi.advanceTimersByTime(10_000);
    });

    expect(createFlag).not.toHaveBeenCalled();
  });

  it('does not report events after cleanup', () => {
    const { unmount } = renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onViolation: vi.fn(),
    }));
    unmount();

    act(() => document.dispatchEvent(new Event('paste')));
    expect(createFlag).not.toHaveBeenCalled();
  });

  it('sends every paste flag without pausing and reports every behavior event', () => {
    const onPause = vi.fn();
    const onViolation = vi.fn();
    const onBehaviorSignal = vi.fn();
    renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1',
      sessionId: 'session-1',
      enabled: true,
      onPause,
      onViolation,
      onBehaviorSignal,
    }));

    act(() => {
      document.dispatchEvent(new Event('paste'));
      document.dispatchEvent(new Event('paste'));
    });

    expect(onPause).not.toHaveBeenCalled();
    expect(onViolation).not.toHaveBeenCalled();
    expect(onBehaviorSignal).toHaveBeenCalledTimes(2);
    expect(createFlag).toHaveBeenCalledTimes(2);
  });
});
