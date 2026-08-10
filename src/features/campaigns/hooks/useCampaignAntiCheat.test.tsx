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
    renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onViolation,
    }));

    act(() => setVisibility('hidden'));
    expect(createFlag).not.toHaveBeenCalled();

    act(() => setVisibility('visible'));
    expect(onViolation).toHaveBeenCalledOnce();
    expect(createFlag).toHaveBeenCalledWith('campaign-1', 'session-1', {
      signalType: 'tab_switch',
      note: 'Candidate switched away from the interview tab.',
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

  it('does not report events after cleanup', () => {
    const { unmount } = renderHook(() => useCampaignAntiCheat({
      campaignId: 'campaign-1', sessionId: 'session-1', enabled: true, onViolation: vi.fn(),
    }));
    unmount();

    act(() => document.dispatchEvent(new Event('paste')));
    expect(createFlag).not.toHaveBeenCalled();
  });
});
